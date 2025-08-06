// Script para restaurar permissões de admin
// Email: alcidescostant@hotmail.com

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (usando as credenciais corretas)
const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreAdminRole() {
  try {
    console.log('🔐 Iniciando restauração de permissões de admin...');
    console.log('📧 Email alvo: alcidescostant@hotmail.com');
    
    // Primeiro, vamos verificar se o usuário existe na tabela user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        role,
        display_name,
        created_at,
        updated_at
      `)
      .limit(10);

    if (profileError) {
      console.error('❌ Erro ao buscar profiles:', profileError);
      return;
    }

    console.log('👥 Profiles encontrados:', profiles?.length || 0);
    
    if (profiles && profiles.length > 0) {
      console.log('📋 Lista de usuários:');
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ID: ${profile.user_id?.substring(0, 8)}... | Role: ${profile.role} | Nome: ${profile.display_name || 'N/A'}`);
      });
    }

    // Agora vamos tentar atualizar diretamente usando uma consulta SQL
    const { data: updateResult, error: updateError } = await supabase.rpc('update_user_role_by_email', {
      target_email: 'alcidescostant@hotmail.com',
      new_role: 'admin'
    });

    if (updateError) {
      console.log('⚠️ Função RPC não disponível, tentando método alternativo...');
      
      // Método alternativo: buscar todos os profiles e encontrar o correto
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (allProfilesError) {
        console.error('❌ Erro ao buscar todos os profiles:', allProfilesError);
        return;
      }

      console.log('🔍 Buscando usuário específico entre', allProfiles?.length || 0, 'profiles...');
      
      // Como não podemos acessar diretamente auth.users, vamos tentar uma abordagem diferente
      // Vamos assumir que o usuário já existe e tentar atualizar pelo display_name ou outro campo
      
      console.log('💡 Instruções para correção manual:');
      console.log('');
      console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Vá para seu projeto: cxibuehwbuobwruhzwka');
      console.log('3. Acesse "SQL Editor"');
      console.log('4. Execute este comando SQL:');
      console.log('');
      console.log('   UPDATE user_profiles');
      console.log('   SET role = \'admin\', updated_at = NOW()');
      console.log('   WHERE user_id = (');
      console.log('     SELECT id FROM auth.users');
      console.log('     WHERE email = \'alcidescostant@hotmail.com\'');
      console.log('   );');
      console.log('');
      console.log('5. Depois execute para verificar:');
      console.log('');
      console.log('   SELECT u.email, up.role, up.display_name');
      console.log('   FROM auth.users u');
      console.log('   JOIN user_profiles up ON u.id = up.user_id');
      console.log('   WHERE u.email = \'alcidescostant@hotmail.com\';');
      console.log('');
      
      return;
    }

    console.log('✅ Função RPC executada com sucesso!');
    console.log('🎉 Permissões de admin restauradas para: alcidescostant@hotmail.com');

  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('');
    console.log('🔧 Solução alternativa: Execute manualmente no Supabase SQL Editor');
    console.log('');
    console.log('UPDATE user_profiles');
    console.log('SET role = \'admin\', updated_at = NOW()');
    console.log('WHERE user_id = (');
    console.log('  SELECT id FROM auth.users');
    console.log('  WHERE email = \'alcidescostant@hotmail.com\'');
    console.log(');');
  }
}

// Executar script
restoreAdminRole(); 