// 🔍 VERIFICAR SCHEMA DA TABELA

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSchema() {
  console.log('🔍 VERIFICANDO SCHEMA DA TABELA spiritual_regions');
  
  try {
    // Pegar uma linha para ver estrutura
    const { data: sample, error } = await supabase
      .from('spiritual_regions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    if (sample && sample.length > 0) {
      console.log('📊 COLUNAS DISPONÍVEIS:');
      Object.keys(sample[0]).forEach(column => {
        console.log(`  - ${column}: ${typeof sample[0][column]}`);
      });
      
      console.log('\n📝 EXEMPLO DE DADOS:');
      console.log(JSON.stringify(sample[0], null, 2));
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

verificarSchema().then(() => {
  console.log('\n✅ Verificação concluída!');
  process.exit(0);
});