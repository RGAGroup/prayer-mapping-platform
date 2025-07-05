-- SCRIPT DE DIAGNÓSTICO COMPLETO PARA PROBLEMA DE AUTENTICAÇÃO
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se o trigger existe e está ativo
SELECT 
  'TRIGGER STATUS' as check_type,
  tgname as trigger_name,
  tgenabled as is_enabled,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 2. Verificar se a função existe
SELECT 
  'FUNCTION STATUS' as check_type,
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Verificar estrutura da tabela user_profiles
SELECT 
  'TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se há dados na tabela user_profiles
SELECT 
  'DATA CHECK' as check_type,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
FROM public.user_profiles;

-- 5. Verificar últimos usuários criados no auth.users
SELECT 
  'RECENT USERS' as check_type,
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Verificar logs de erro (se disponível)
SELECT 
  'ERROR LOGS' as check_type,
  'Check Supabase Dashboard > Logs for detailed error messages' as message;

-- 7. Testar inserção manual na tabela user_profiles
-- ATENÇÃO: Só execute se quiser testar inserção manual
-- INSERT INTO public.user_profiles (user_id, display_name) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test User');

-- 8. Verificar permissões RLS
SELECT 
  'RLS STATUS' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  rowsecurity as rls_forced
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 9. Verificar policies da tabela
SELECT 
  'RLS POLICIES' as check_type,
  policyname as policy_name,
  cmd as command,
  permissive,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 10. Verificar se há constraints que podem estar causando erro
SELECT 
  'CONSTRAINTS' as check_type,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_profiles'::regclass; 