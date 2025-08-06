// Script para restaurar permissões de admin diretamente
// Email: alcidescostant@hotmail.com

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreAdminRole() {
  try {
    console.log('🔐 Restaurando permissões de admin...');
    
    // Buscar o usuário específico pelo display_name
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .or('display_name.eq.alcidescostant@hotmail.com,display_name.ilike.%alcides%costa%');

    if (profileError) {
      console.error('❌ Erro ao buscar profiles:', profileError);
      return;
    }

    console.log('👥 Profiles encontrados:', profiles?.length || 0);
    
    if (profiles && profiles.length > 0) {
      console.log('📋 Candidatos encontrados:');
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ID: ${profile.user_id?.substring(0, 8)}... | Role: ${profile.role} | Nome: ${profile.display_name}`);
      });

      // Vamos atualizar o primeiro profile que parece ser o correto
      // Baseado no output anterior, vamos tentar atualizar o que tem nome "alcidescostant@hotmail.com"
      const targetProfile = profiles.find(p => 
        p.display_name === 'alcidescostant@hotmail.com' || 
        p.display_name?.toLowerCase().includes('alcides')
      );

      if (targetProfile) {
        console.log('🎯 Atualizando profile:', targetProfile.display_name);
        
        const { data: updateResult, error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetProfile.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar role:', updateError);
          return;
        }

        console.log('✅ Role atualizado com sucesso!');
        
        // Verificar resultado
        const { data: updatedProfile, error: verifyError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', targetProfile.id)
          .single();

        if (verifyError) {
          console.error('❌ Erro ao verificar atualização:', verifyError);
          return;
        }

        console.log('🎉 SUCESSO! Permissões restauradas:');
        console.log('   Nome:', updatedProfile.display_name);
        console.log('   Role:', updatedProfile.role);
        console.log('   Atualizado em:', updatedProfile.updated_at);
        
      } else {
        console.log('⚠️ Não foi possível identificar o profile correto automaticamente');
        console.log('📋 Todos os profiles encontrados:');
        profiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. Nome: ${profile.display_name} | Role: ${profile.role}`);
        });
      }
    } else {
      console.log('⚠️ Nenhum profile encontrado');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar script
restoreAdminRole(); 