-- Add terms acceptance fields to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20) DEFAULT '1.0';

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.terms_accepted IS 'Indica se o usuário aceitou os Termos de Uso e Política de Privacidade (LGPD)';
COMMENT ON COLUMN user_profiles.terms_accepted_at IS 'Data e hora em que o usuário aceitou os termos';
COMMENT ON COLUMN user_profiles.terms_version IS 'Versão dos termos aceitos pelo usuário';

-- Update existing users to have accepted terms (grandfather clause)
-- Apenas para usuários existentes - novos usuários precisarão aceitar explicitamente
UPDATE user_profiles
SET 
  terms_accepted = TRUE,
  terms_accepted_at = created_at,
  terms_version = '1.0'
WHERE terms_accepted IS NULL OR terms_accepted = FALSE;

