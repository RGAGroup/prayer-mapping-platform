-- ============================================================================
-- SCRIPT FINAL PARA RESTAURAR PERMISSÕES DE ADMIN
-- Execute este script no Supabase SQL Editor
-- ============================================================================

-- 1. ATUALIZAR ROLE PARA ADMIN
-- Este comando atualiza diretamente o role do usuário
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE id = '4261eecf-03dc-44ae-b83e-2c8db98f5baa';

-- 2. VERIFICAR SE A ATUALIZAÇÃO FOI BEM-SUCEDIDA
SELECT 
    up.id,
    up.display_name,
    up.role,
    up.updated_at,
    'SUCCESS: Role updated to admin' as status
FROM user_profiles up
WHERE up.id = '4261eecf-03dc-44ae-b83e-2c8db98f5baa'
AND up.role = 'admin';

-- 3. VERIFICAR TODOS OS ADMINS NO SISTEMA
SELECT 
    up.display_name,
    up.role,
    up.created_at,
    up.updated_at
FROM user_profiles up
WHERE up.role = 'admin'
ORDER BY up.created_at;

-- 4. REGISTRAR NO LOG DE AUDITORIA (OPCIONAL)
INSERT INTO audit_logs (
    action,
    table_name,
    record_id,
    new_values,
    created_at
) VALUES (
    'ADMIN_ROLE_RESTORED',
    'user_profiles',
    '4261eecf-03dc-44ae-b83e-2c8db98f5baa',
    jsonb_build_object(
        'email', 'alcidescostant@hotmail.com',
        'role', 'admin',
        'restored_at', NOW(),
        'method', 'manual_sql_fix'
    ),
    NOW()
);

-- ============================================================================
-- INSTRUÇÕES:
-- 1. Copie este código
-- 2. Acesse: https://supabase.com/dashboard/project/cxibuehwbuobwruhzwka/sql/new
-- 3. Cole o código no editor
-- 4. Clique em "Run" para executar
-- 5. Verifique se o resultado mostra "SUCCESS: Role updated to admin"
-- ============================================================================ 