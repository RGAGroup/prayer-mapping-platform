-- TESTE: DESABILITAR TRIGGER TEMPORARIAMENTE
-- Execute este script para testar se o problema é no trigger

-- 1. DESABILITAR O TRIGGER
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- 2. VERIFICAR STATUS
SELECT 
  'TRIGGER DISABLED' as status,
  tgname as trigger_name,
  tgenabled as is_enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. INSTRUÇÕES PARA TESTE
SELECT 
  'TESTE' as action,
  'Agora tente criar uma conta. Se funcionar, o problema é no trigger.' as instruction;

-- 4. PARA REABILITAR O TRIGGER DEPOIS DO TESTE:
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created; 