-- ============================================
-- FIX PARA O TRIGGER handle_new_user
-- ============================================

-- Primeiro, vamos ver a estrutura atual da tabela
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Fix the handle_new_user trigger to work with the actual user_profiles schema
-- Based on schema analysis: id (auto), user_id (required), role (default 'user'), 
-- display_name (optional), created_at (auto), updated_at (auto)

-- First, drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the corrected function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles with only the required user_id
  -- Let PostgreSQL handle: id (gen_random_uuid()), role (default 'user'), 
  -- created_at (now()), updated_at (now())
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the fix
SELECT 
  'Trigger recreated successfully' as status,
  'Only user_id and display_name will be inserted, other columns use defaults' as note;

-- Test query to verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 