-- RESTAURAR PERMISSÕES DE ADMIN
-- Email: alcidescostant@hotmail.com

-- Comando direto para restaurar admin
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'alcidescostant@hotmail.com'
);

-- Verificar resultado
SELECT 
  u.email,
  up.role,
  up.display_name,
  up.updated_at
FROM auth.users u
JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'alcidescostant@hotmail.com'; 