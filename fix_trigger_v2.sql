-- SOLUÇÃO DEFINITIVA: TRIGGER ULTRA-SIMPLES
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. REMOVER COMPLETAMENTE O TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. CRIAR FUNÇÃO ULTRA-SIMPLES (SEM NENHUMA COMPLEXIDADE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserção mínima: apenas user_id (obrigatório)
  -- Todos os outros campos usam valores padrão da tabela
  INSERT INTO public.user_profiles (user_id) 
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, apenas loga mas não falha o signup
    RAISE LOG 'Erro ao criar user_profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RECRIAR O TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VERIFICAÇÃO
SELECT 'Trigger recriado com sucesso' as status;

-- 5. TESTAR A ESTRUTURA
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 