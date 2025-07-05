// 🔍 BUSCAR RÚSSIA NA BASE
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function buscarRussia() {
  console.log('🔍 BUSCANDO RÚSSIA...');
  
  // Buscar por diferentes variações
  const variacoes = ['Russia', 'Rússia', 'Russian Federation', 'Federação Russa'];
  
  for (const nome of variacoes) {
    const { data, error } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code')
      .eq('region_type', 'country')
      .ilike('name', `%${nome}%`);
    
    if (data && data.length > 0) {
      console.log(`✅ Encontrada: ${nome}`);
      console.log(data);
    } else {
      console.log(`❌ Não encontrada: ${nome}`);
    }
  }
  
  // Buscar por código do país
  const { data: byCode } = await supabase
    .from('spiritual_regions')
    .select('id, name, country_code')
    .eq('region_type', 'country')
    .eq('country_code', 'RUS');
  
  if (byCode && byCode.length > 0) {
    console.log('✅ Encontrada por código RUS:');
    console.log(byCode);
  } else {
    console.log('❌ Não encontrada por código RUS');
  }
}

buscarRussia().catch(console.error); 