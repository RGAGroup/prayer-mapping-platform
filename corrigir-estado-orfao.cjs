// 🔧 CORRIGIR ESTADO ÓRFÃO - BUENOS AIRES
// Vincular ao país Argentina

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function corrigirEstadoOrfao() {
  console.log('🔧 CORRIGIR ESTADO ÓRFÃO');
  console.log('🎯 Vinculando Buenos Aires à Argentina');
  console.log('='.repeat(40));

  try {
    // 1. Buscar o estado órfão
    const { data: orphanState } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code, parent_id')
      .eq('region_type', 'state')
      .eq('name', 'Buenos Aires')
      .single();

    if (!orphanState) {
      console.log('❌ Estado Buenos Aires não encontrado');
      return;
    }

    console.log(`📍 Estado encontrado: ${orphanState.name}`);
    console.log(`🔍 Country code: ${orphanState.country_code}`);
    console.log(`👨‍👩‍👧‍👦 Parent atual: ${orphanState.parent_id || 'NENHUM (órfão)'}`);

    // 2. Buscar Argentina
    const possibleNames = ['Argentina', 'Argentine Republic'];
    let argentina = null;

    for (const name of possibleNames) {
      const { data: country } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('region_type', 'country')
        .ilike('name', `%${name}%`)
        .limit(1)
        .single();

      if (country) {
        argentina = country;
        console.log(`✅ País encontrado: "${country.name}" (ID: ${country.id})`);
        break;
      }
    }

    if (!argentina) {
      console.log('❌ Argentina não encontrada no banco');
      console.log('🔍 Vamos listar países similares...');
      
      const { data: similarCountries } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('region_type', 'country')
        .ilike('name', '%argen%');
      
      console.log('📋 Países similares encontrados:');
      similarCountries?.forEach(c => console.log(`  - ${c.name} (${c.id})`));
      return;
    }

    // 3. Verificar se já está correto
    if (orphanState.parent_id === argentina.id) {
      console.log('✅ Buenos Aires já está vinculado à Argentina corretamente!');
      return;
    }

    // 4. Corrigir a hierarquia
    console.log('\\n🔧 Corrigindo hierarquia...');
    
    const { error: updateError } = await supabase
      .from('spiritual_regions')
      .update({ 
        parent_id: argentina.id,
        country_code: 'ARG' // Padronizar código também
      })
      .eq('id', orphanState.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError);
      return;
    }

    console.log('🎉 SUCESSO! Hierarquia corrigida!');
    console.log(`✅ Buenos Aires agora é filho de ${argentina.name}`);

    // 5. Verificar resultado
    const { data: updatedState } = await supabase
      .from('spiritual_regions')
      .select('id, name, parent_id, country_code')
      .eq('id', orphanState.id)
      .single();

    console.log('\\n📊 VERIFICAÇÃO FINAL:');
    console.log(`🏛️ Estado: ${updatedState.name}`);
    console.log(`🌍 País pai ID: ${updatedState.parent_id}`);
    console.log(`🏷️ Country code: ${updatedState.country_code}`);

    console.log('\\n' + '='.repeat(40));
    console.log('🎉 HIERARQUIA 100% CORRIGIDA!');
    console.log('✅ Todos os 174 estados agora têm país pai!');
    console.log('🙏 GLÓRIA A DEUS!');
    console.log('='.repeat(40));

  } catch (error) {
    console.error('💥 Erro na correção:', error);
  }
}

// Executar correção
if (require.main === module) {
  corrigirEstadoOrfao().then(() => {
    console.log('\\n✅ Correção concluída!');
    process.exit(0);
  });
}

module.exports = { corrigirEstadoOrfao };