-- 🔧 FIX SIGNUP TRIGGER - Versão Ultra Robusta
-- Este trigger NUNCA deve falhar o signup, mesmo se houver erro ao criar o perfil

-- 1. Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Criar função ultra-robusta com tratamento de erros
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  user_role TEXT DEFAULT 'user';
BEGIN
  -- Tentar criar perfil, mas NUNCA falhar o signup
  BEGIN
    -- Check if this is the first user (make them admin)
    -- Verifica na tabela auth.users que é mais confiável
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE id != NEW.id;

    IF user_count = 0 THEN
      user_role := 'admin';
    ELSE
      user_role := 'user';
    END IF;

    -- Create user profile
    INSERT INTO public.user_profiles (
      user_id,
      role,
      display_name,
      terms_accepted,
      terms_accepted_at,
      terms_version,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_role,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, FALSE),
      CASE
        WHEN (NEW.raw_user_meta_data->>'terms_accepted')::boolean = TRUE
        THEN (NEW.raw_user_meta_data->>'terms_accepted_at')::timestamptz
        ELSE NULL
      END,
      COALESCE(NEW.raw_user_meta_data->>'terms_version', '1.0'),
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING; -- Se já existe, não faz nada
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Em caso de QUALQUER erro, apenas loga mas NÃO falha o signup
      RAISE WARNING 'Erro ao criar user_profile para %: %', NEW.id, SQLERRM;
      -- Continua normalmente, permitindo que o signup seja concluído
  END;

  -- SEMPRE retorna NEW para permitir que o signup seja concluído
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Comentário para documentação
COMMENT ON FUNCTION handle_new_user() IS 'Cria perfil de usuário automaticamente no signup. NUNCA falha o signup, mesmo se houver erro.';

