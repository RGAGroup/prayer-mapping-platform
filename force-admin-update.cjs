// Script para FORÇAR atualização de permissões de admin
// Email: alcidescostant@hotmail.com

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceAdminUpdate() {
  try {
    console.log('🔐 FORÇANDO atualização de permissões de admin...');
    
    // Buscar o usuário específico
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('display_name', 'alcidescostant@hotmail.com');

    if (profileError) {
      console.error('❌ Erro ao buscar profiles:', profileError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️ Usuário não encontrado');
      return;
    }

    const targetProfile = profiles[0];
    console.log('🎯 Profile encontrado:', {
      id: targetProfile.id,
      user_id: targetProfile.user_id?.substring(0, 8) + '...',
      display_name: targetProfile.display_name,
      current_role: targetProfile.role
    });

    // Método 1: Atualização direta por ID
    console.log('🔄 Tentativa 1: Atualização por ID do profile...');
    const { data: result1, error: error1 } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('id', targetProfile.id)
      .select();

    if (error1) {
      console.error('❌ Erro método 1:', error1);
    } else {
      console.log('✅ Método 1 executado:', result1);
    }

    // Método 2: Atualização por user_id
    console.log('🔄 Tentativa 2: Atualização por user_id...');
    const { data: result2, error: error2 } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('user_id', targetProfile.user_id)
      .select();

    if (error2) {
      console.error('❌ Erro método 2:', error2);
    } else {
      console.log('✅ Método 2 executado:', result2);
    }

    // Método 3: Upsert
    console.log('🔄 Tentativa 3: Upsert...');
    const { data: result3, error: error3 } = await supabase
      .from('user_profiles')
      .upsert({ 
        id: targetProfile.id,
        user_id: targetProfile.user_id,
        role: 'admin',
        display_name: targetProfile.display_name,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error3) {
      console.error('❌ Erro método 3:', error3);
    } else {
      console.log('✅ Método 3 executado:', result3);
    }

    // Aguardar um pouco para o banco processar
    console.log('⏳ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar resultado final
    console.log('🔍 Verificando resultado final...');
    const { data: finalProfile, error: finalError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', targetProfile.id)
      .single();

    if (finalError) {
      console.error('❌ Erro ao verificar resultado:', finalError);
      return;
    }

    console.log('📊 RESULTADO FINAL:');
    console.log('   Nome:', finalProfile.display_name);
    console.log('   Role:', finalProfile.role);
    console.log('   Atualizado em:', finalProfile.updated_at);

    if (finalProfile.role === 'admin') {
      console.log('🎉 SUCESSO! Permissões de admin restauradas!');
    } else {
      console.log('⚠️ Role ainda não é admin. Pode ser necessário executar SQL manualmente.');
      console.log('');
      console.log('🔧 Execute no Supabase SQL Editor:');
      console.log(`UPDATE user_profiles SET role = 'admin' WHERE id = '${targetProfile.id}';`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar script
forceAdminUpdate(); 