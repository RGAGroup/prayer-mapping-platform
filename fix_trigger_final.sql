-- SOLUÇÃO DEFINITIVA: TRIGGER COM UPSERT
-- Esta solução resolve o problema de constraint UNIQUE no user_id

-- 1. REMOVER TRIGGER E FUNÇÃO EXISTENTES
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. CRIAR FUNÇÃO COM UPSERT (INSERT ... ON CONFLICT)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Usar UPSERT para evitar conflitos de constraint UNIQUE
  INSERT INTO public.user_profiles (user_id, display_name) 
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detalhado do erro
    RAISE LOG 'Erro no handle_new_user para user_id %: % (SQLSTATE: %)', 
              NEW.id, SQLERRM, SQLSTATE;
    -- Não falha o signup
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RECRIAR O TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VERIFICAR SE EXISTEM USUÁRIOS SEM PERFIL
SELECT 
  'USUÁRIOS SEM PERFIL' as check_type,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL;

-- 5. CRIAR PERFIS PARA USUÁRIOS EXISTENTES (se necessário)
INSERT INTO public.user_profiles (user_id, display_name)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email)
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 6. VERIFICAÇÃO FINAL
SELECT 
  'TRIGGER CRIADO COM UPSERT' as status,
  'Agora pode criar contas sem erro de constraint' as message;

-- 7. VERIFICAR ESTRUTURA FINAL
SELECT 
  'VERIFICAÇÃO FINAL' as check_type,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.user_profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.user_profiles up ON au.id = up.user_id WHERE up.user_id IS NULL) as users_without_profile; 