// 🌍 OPERAÇÃO TOTAL - DOMINAÇÃO MUNDIAL COMPLETA
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

// 🌍 PAÍSES ADICIONAIS
const NEW_COUNTRIES = [
  { name: "Irlanda", code: "IRL", capital: "Dublin", lat: 53.1424, lng: -7.6921 },
  { name: "Islândia", code: "ISL", capital: "Reykjavik", lat: 64.9631, lng: -19.0208 },
  { name: "Luxemburgo", code: "LUX", capital: "Luxemburgo", lat: 49.8153, lng: 6.1296 },
  { name: "Malta", code: "MLT", capital: "Valletta", lat: 35.9375, lng: 14.3754 },
  { name: "Croácia", code: "HRV", capital: "Zagreb", lat: 45.1000, lng: 15.2000 },
  { name: "Estônia", code: "EST", capital: "Tallinn", lat: 58.5953, lng: 25.0136 },
  { name: "Letônia", code: "LVA", capital: "Riga", lat: 56.8796, lng: 24.6032 },
  { name: "Lituânia", code: "LTU", capital: "Vilnius", lat: 55.1694, lng: 23.8813 },
  { name: "Rússia", code: "RUS", capital: "Moscou", lat: 61.5240, lng: 105.3188 },
  { name: "Turquia", code: "TUR", capital: "Ancara", lat: 38.9637, lng: 35.2433 }
];

// 🏛️ ESTADOS GIGANTES
const NEW_STATES = {
  "RUS": [
    { name: "Moscow Oblast", capital: "Moscow", lat: 55.7558, lng: 37.6176 },
    { name: "Saint Petersburg", capital: "Saint Petersburg", lat: 59.9311, lng: 30.3609 },
    { name: "Novosibirsk Oblast", capital: "Novosibirsk", lat: 55.0084, lng: 82.9357 },
    { name: "Tatarstan Republic", capital: "Kazan", lat: 55.8304, lng: 49.0661 },
    { name: "Krasnoyarsk Krai", capital: "Krasnoyarsk", lat: 56.0184, lng: 92.8672 }
  ],
  "CHN": [
    { name: "Beijing Municipality", capital: "Beijing", lat: 39.9042, lng: 116.4074 },
    { name: "Shanghai Municipality", capital: "Shanghai", lat: 31.2304, lng: 121.4737 },
    { name: "Guangdong Province", capital: "Guangzhou", lat: 23.3790, lng: 113.7633 },
    { name: "Sichuan Province", capital: "Chengdu", lat: 30.5723, lng: 104.0665 },
    { name: "Xinjiang Region", capital: "Ürümqi", lat: 43.7793, lng: 87.6005 }
  ]
};

let stats = {
  countries: { inserted: 0, skipped: 0, failed: 0 },
  states: { inserted: 0, skipped: 0, failed: 0 }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function operacaoTotal() {
  console.log("🌍 OPERAÇÃO TOTAL INICIADA!");
  console.log("🚀 DOMINAÇÃO MUNDIAL COMPLETA");
  console.log("=".repeat(60));
  
  await conquistarPaises();
  await conquistarEstados();
  
  console.log("\\n🎉 OPERAÇÃO TOTAL COMPLETA!");
  await statusFinal();
}

async function conquistarPaises() {
  console.log("\\n📍 FASE 1: PAÍSES ADICIONAIS");
  
  for (const country of NEW_COUNTRIES) {
    try {
      const { data: existing } = await supabase
        .from("spiritual_regions")
        .select("id")
        .eq("country_code", country.code)
        .eq("region_type", "country")
        .single();
      
      if (existing) {
        console.log(`⏭️  ${country.name} já existe`);
        stats.countries.skipped++;
        continue;
      }
      
      const { error } = await supabase
        .from("spiritual_regions")
        .insert({
          name: country.name,
          region_type: "country",
          country_code: country.code,
          coordinates: { lat: country.lat, lng: country.lng },
          data_source: "imported",
          status: "approved"
        });
      
      if (error && !error.message.includes("duplicate key")) {
        throw error;
      }
      
      console.log(`🚀 ✅ ${country.name} CONQUISTADO!`);
      stats.countries.inserted++;
      
    } catch (error) {
      console.error(`❌ ${country.name}: ${error.message}`);
      stats.countries.failed++;
    }
    
    await delay(150);
  }
}

async function conquistarEstados() {
  console.log("\\n📍 FASE 2: ESTADOS GIGANTES");
  
  const { data: countries } = await supabase
    .from("spiritual_regions")
    .select("id, name, country_code")
    .eq("region_type", "country")
    .in("country_code", Object.keys(NEW_STATES));
  
  for (const country of countries || []) {
    const states = NEW_STATES[country.country_code] || [];
    
    if (states.length === 0) continue;
    
    console.log(`\\n🏛️ ${country.name}: ${states.length} estados`);
    
    for (const state of states) {
      try {
        const { data: existing } = await supabase
          .from("spiritual_regions")
          .select("id")
          .eq("name", state.name)
          .eq("parent_id", country.id)
          .eq("region_type", "state")
          .single();
        
        if (existing) {
          console.log(`⏭️  ${state.name} já existe`);
          stats.states.skipped++;
          continue;
        }
        
        const { error } = await supabase
          .from("spiritual_regions")
          .insert({
            name: state.name,
            region_type: "state",
            country_code: country.country_code,
            parent_id: country.id,
            coordinates: { lat: state.lat, lng: state.lng },
            data_source: "imported",
            status: "approved"
          });
        
        if (error && !error.message.includes("duplicate key")) {
          throw error;
        }
        
        console.log(`   🚀 ✅ ${state.name} CONQUISTADO!`);
        stats.states.inserted++;
        
      } catch (error) {
        console.error(`   ❌ ${state.name}: ${error.message}`);
        stats.states.failed++;
      }
      
      await delay(120);
    }
  }
}

async function statusFinal() {
  const { data: countries } = await supabase
    .from("spiritual_regions")
    .select("id")
    .eq("region_type", "country");
  
  const { data: states } = await supabase
    .from("spiritual_regions")
    .select("id")
    .eq("region_type", "state");
  
  const { data: cities } = await supabase
    .from("spiritual_regions")
    .select("id")
    .eq("region_type", "city");
  
  const total = (countries?.length || 0) + (states?.length || 0) + (cities?.length || 0);
  
  console.log("\\n🎯 IMPÉRIO ATALAIA EXPANDIDO:");
  console.log(`🌍 Países: ${countries?.length || 0}`);
  console.log(`🏛️ Estados: ${states?.length || 0}`);
  console.log(`��️ Cidades: ${cities?.length || 0}`);
  console.log(`📈 TOTAL: ${total} regiões!`);
}

operacaoTotal().catch(console.error);
