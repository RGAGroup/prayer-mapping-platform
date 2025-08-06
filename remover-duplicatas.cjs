// 🗑️ REMOVER PAÍSES DUPLICADOS
// Deletar com segurança as duplicatas identificadas

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

// 🎯 LISTA DE PAÍSES PARA DELETAR (identificados como duplicatas)
const COUNTRIES_TO_DELETE = [
  { id: 'da6b06c1-d468-418e-bc0d-eafbfbdf6dcd', name: 'Afghanistan', reason: 'Duplicata de Afeganistão (PT tem dados)' },
  { id: '593889cb-53b2-4e4a-89c7-c6c93c299f69', name: 'South Africa', reason: 'Duplicata de África do Sul (PT tem dados)' },
  { id: '86bc0bad-f30f-479f-bb4d-2f23c475a918', name: 'Brazil', reason: 'Duplicata de Brasil (PT tem 27 estados)' },
  { id: '8ae4f504-e8bb-4c62-8c8d-f992916a830e', name: 'Austrália', reason: 'Duplicata de Australia (EN tem 6 estados)' },
  { id: '29fe2b1a-33ee-4378-9aa1-a741a84715ce', name: 'Canadá', reason: 'Duplicata de Canada (EN tem 6 estados)' },
  { id: '0029fdf5-cd43-44f5-a9b8-c7a8e8c506b7', name: 'South Korea', reason: 'Duplicata de Coreia do Sul (PT tem dados)' },
  { id: 'fb9a54e1-83ed-461e-8b95-76c87b814301', name: 'Egypt', reason: 'Duplicata de Egito (PT tem dados)' },
  { id: 'd4470c66-3eb9-4c42-b55d-5d0cf3d62174', name: 'United States', reason: 'Duplicata de Estados Unidos (PT tem 56 estados)' },
  { id: '6fd043b6-f19e-4a41-821d-4466851e3b3f', name: 'Índia', reason: 'Duplicata de India (EN tem 10 estados)' },
  { id: '6928d843-d8f1-440c-9275-c5fe98233438', name: 'Indonesia', reason: 'Duplicata de Indonésia (PT tem dados)' },
  { id: '054257df-afaf-4bfc-9d44-9de34f36ac6e', name: 'Iran', reason: 'Duplicata de Irã (PT tem dados)' },
  { id: 'e02d4028-a6f2-44e7-a5d0-73aa206144c6', name: 'Iraq', reason: 'Duplicata de Iraque (PT tem dados)' },
  { id: 'a76ff942-b9e2-400b-b779-d874be5e7c76', name: 'Japan', reason: 'Duplicata de Japão (PT tem dados)' },
  { id: 'efcc556a-445a-4001-ab57-35a912ee2042', name: 'Mexico', reason: 'Duplicata de México (PT tem dados)' },
  { id: '3a719db6-fa72-4e91-ad11-9fd7a9633a74', name: 'Poland', reason: 'Duplicata de Polônia (PT tem dados)' },
  { id: 'b5926be9-f523-446d-aca9-acba8d7d9179', name: 'Thailand', reason: 'Duplicata de Tailândia (PT tem dados)' }
  
  // NOTA: Removendo casos problemáticos de Argentina, China, Israel, Portugal que são IDs iguais
];

let stats = {
  deleted: 0,
  skipped: 0,
  failed: 0,
  childrenMoved: 0
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function removerDuplicatas() {
  console.log('🗑️ REMOVER PAÍSES DUPLICADOS');
  console.log('🎯 Deletando duplicatas identificadas com segurança');
  console.log('⚠️ OPERAÇÃO IRREVERSÍVEL - Backup já feito!');
  console.log('='.repeat(55));

  console.log(`📋 PAÍSES PARA DELETAR: ${COUNTRIES_TO_DELETE.length}`);
  console.log('');

  for (const country of COUNTRIES_TO_DELETE) {
    console.log(`🔍 Processando: ${country.name}`);
    console.log(`   Razão: ${country.reason}`);

    try {
      // 1. Verificar se o país existe
      const { data: existingCountry } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('id', country.id)
        .single();

      if (!existingCountry) {
        console.log('   ⏭️ País já não existe, pulando...');
        stats.skipped++;
        continue;
      }

      // 2. Verificar se tem estados filhos
      const { data: childStates } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('region_type', 'state')
        .eq('parent_id', country.id);

      if (childStates && childStates.length > 0) {
        console.log(`   ⚠️ ATENÇÃO: ${childStates.length} estados filhos encontrados!`);
        childStates.forEach(state => console.log(`      - ${state.name}`));
        
        // PULAR países com filhos para evitar quebrar hierarquia
        console.log('   🚫 PULANDO - País tem estados filhos');
        stats.skipped++;
        continue;
      }

      // 3. Verificar se tem cidades filhas
      const { data: childCities } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('region_type', 'city')
        .eq('parent_id', country.id);

      if (childCities && childCities.length > 0) {
        console.log(`   ⚠️ ATENÇÃO: ${childCities.length} cidades filhas encontradas!`);
        console.log('   🚫 PULANDO - País tem cidades filhas');
        stats.skipped++;
        continue;
      }

      // 4. SEGURO PARA DELETAR
      console.log('   ✅ Seguro para deletar (sem filhos)');
      
      const { error: deleteError } = await supabase
        .from('spiritual_regions')
        .delete()
        .eq('id', country.id);

      if (deleteError) {
        throw deleteError;
      }

      console.log(`   🗑️ ✅ ${country.name} DELETADO!`);
      stats.deleted++;

    } catch (error) {
      console.error(`   ❌ Erro ao deletar ${country.name}: ${error.message}`);
      stats.failed++;
    }

    await delay(300); // Rate limiting
    console.log('');
  }

  // VERIFICAR STATUS FINAL
  console.log('='.repeat(55));
  console.log('🎉 LIMPEZA DE DUPLICATAS CONCLUÍDA!');
  console.log('='.repeat(55));
  
  console.log('📊 RESUMO DA OPERAÇÃO:');
  console.log(`🗑️ Países deletados: ${stats.deleted}`);
  console.log(`⏭️ Países pulados: ${stats.skipped}`);
  console.log(`❌ Falhas: ${stats.failed}`);
  console.log('');

  // Status atual do banco
  const { data: finalCount } = await supabase
    .from('spiritual_regions')
    .select('id', { count: 'exact' })
    .eq('region_type', 'country');

  console.log('📊 STATUS FINAL:');
  console.log(`🌍 Total de países restantes: ${finalCount?.[0]?.count || 0}`);
  console.log(`📉 Países removidos: ${stats.deleted}`);
  console.log('');

  if (stats.failed === 0) {
    console.log('✅ LIMPEZA PERFEITA! Sem falhas!');
  } else {
    console.log(`⚠️ ${stats.failed} falhas registradas - verificar logs`);
  }

  console.log('🙏 BANCO DE DADOS MAIS LIMPO E ORGANIZADO!');
  console.log('='.repeat(55));

  return stats;
}

// Executar remoção
if (require.main === module) {
  console.log('⚠️ ATENÇÃO: Esta operação irá DELETAR países duplicados!');
  console.log('⚠️ Pressione Ctrl+C para cancelar ou aguarde 3 segundos...');
  
  setTimeout(() => {
    removerDuplicatas().then(() => {
      console.log('\\n✅ Remoção concluída!');
      process.exit(0);
    });
  }, 3000);
}

module.exports = { removerDuplicatas };