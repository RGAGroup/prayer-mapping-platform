-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create spiritual_regions table (hierarchical structure)
CREATE TABLE IF NOT EXISTS public.spiritual_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region_type TEXT NOT NULL CHECK (region_type IN ('country', 'state', 'city', 'neighborhood')),
  parent_id UUID REFERENCES spiritual_regions(id) ON DELETE CASCADE,
  country_code TEXT,
  state_code TEXT,
  city_code TEXT,
  coordinates JSONB, -- {lat, lng, bounds}
  spiritual_data JSONB, -- {strongholds, prayer_targets, spiritual_climate, etc}
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  data_source TEXT NOT NULL DEFAULT 'manual' CHECK (data_source IN ('manual', 'ai_generated', 'imported')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  approved_at TIMESTAMPTZ
);

-- Create new prayer_targets table for spiritual_regions
CREATE TABLE IF NOT EXISTS public.spiritual_prayer_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES spiritual_regions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('government', 'church', 'social', 'economic', 'spiritual_warfare', 'evangelism', 'other')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create spiritual_activities table
CREATE TABLE IF NOT EXISTS public.spiritual_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES spiritual_regions(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('prayer_walk', 'intercession', 'evangelism', 'church_planting', 'social_action', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  participants_count INTEGER DEFAULT 0,
  impact_description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create ai_generation_queue table
CREATE TABLE IF NOT EXISTS public.ai_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_type TEXT NOT NULL,
  region_identifier TEXT NOT NULL, -- country code, state name, etc
  parent_region_id UUID REFERENCES spiritual_regions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  generated_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMPTZ
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_parent_id ON spiritual_regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_status ON spiritual_regions(status);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_region_type ON spiritual_regions(region_type);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_country_code ON spiritual_regions(country_code);
CREATE INDEX IF NOT EXISTS idx_spiritual_prayer_targets_region_id ON spiritual_prayer_targets(region_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_prayer_targets_status ON spiritual_prayer_targets(status);
CREATE INDEX IF NOT EXISTS idx_spiritual_activities_region_id ON spiritual_activities(region_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_queue_status ON ai_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_prayer_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- Create RLS policies for spiritual_regions
CREATE POLICY "Anyone can view approved regions" ON spiritual_regions
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can view draft/pending regions" ON spiritual_regions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create regions" ON spiritual_regions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Moderators and admins can approve regions" ON spiritual_regions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() AND up.role IN ('moderator', 'admin')
    )
  );

-- Create functions for admin operations
CREATE OR REPLACE FUNCTION promote_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;

  -- Validate role
  IF new_role NOT IN ('user', 'moderator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  -- Update user role
  UPDATE user_profiles 
  SET role = new_role, updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Log the action
  INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
  VALUES (auth.uid(), 'ROLE_CHANGE', 'user_profiles', target_user_id, 
          jsonb_build_object('new_role', new_role));

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample spiritual regions
INSERT INTO spiritual_regions (name, region_type, country_code, coordinates, status, data_source)
VALUES 
  ('Brasil', 'country', 'BR', '{"lat": -14.235, "lng": -51.9253}', 'approved', 'manual'),
  ('Estados Unidos', 'country', 'US', '{"lat": 39.8283, "lng": -98.5795}', 'approved', 'manual'),
  ('Israel', 'country', 'IL', '{"lat": 31.046051, "lng": 34.851612}', 'approved', 'manual')
ON CONFLICT DO NOTHING;
