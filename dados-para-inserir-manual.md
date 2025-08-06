# 🌍 DADOS PARA INSERÇÃO MANUAL - SISTEMA ATALAIA

**🎯 INSTRUÇÕES:** Use o Dashboard Administrativo → Regiões → Botão "Adicionar" para inserir estes dados.

---

## 📍 FASE 1: PAÍSES PRIORITÁRIOS FALTANTES

### 🇨🇦 CANADÁ (se não existir)
- **Nome:** Canada
- **Tipo:** country  
- **Código:** CA
- **Coordenadas:** lat: 56.1304, lng: -106.3468

### 🇦🇺 AUSTRÁLIA (se não existir)  
- **Nome:** Australia
- **Tipo:** country
- **Código:** AU  
- **Coordenadas:** lat: -25.2744, lng: 133.7751

### 🇲🇽 MÉXICO (se não existir)
- **Nome:** Mexico  
- **Tipo:** country
- **Código:** MX
- **Coordenadas:** lat: 23.6345, lng: -102.5528

---

## 🏛️ FASE 2: ESTADOS DO CANADÁ

**⚠️ IMPORTANTE:** Primeiro encontre o ID do país "Canada" no dashboard.

### Estados Canadenses:
1. **Ontario** - Coordenadas: 51.2538, -85.3232
2. **Quebec** - Coordenadas: 53.9133, -68.7437  
3. **British Columbia** - Coordenadas: 53.7267, -127.6476
4. **Alberta** - Coordenadas: 53.9333, -116.5765
5. **Manitoba** - Coordenadas: 56.4151, -96.0810
6. **Saskatchewan** - Coordenadas: 52.9399, -106.4509
7. **Nova Scotia** - Coordenadas: 44.6820, -63.7443
8. **New Brunswick** - Coordenadas: 46.5653, -66.4619
9. **Newfoundland and Labrador** - Coordenadas: 53.1355, -57.6604
10. **Prince Edward Island** - Coordenadas: 46.5107, -63.4168
11. **Northwest Territories** - Coordenadas: 64.2823, -110.8187
12. **Yukon** - Coordenadas: 64.0685, -139.0686
13. **Nunavut** - Coordenadas: 70.2998, -83.1076

**Configuração para cada estado:**
- **Tipo:** state
- **País Pai:** [ID do Canada]
- **Fonte:** manual
- **Status:** active

---

## 🏛️ FASE 3: ESTADOS DA AUSTRÁLIA

**⚠️ IMPORTANTE:** Primeiro encontre o ID do país "Australia" no dashboard.

### Estados Australianos:
1. **New South Wales** - Coordenadas: -31.2532, 146.9211
2. **Victoria** - Coordenadas: -36.5986, 144.6780
3. **Queensland** - Coordenadas: -22.7359, 140.0188
4. **Western Australia** - Coordenadas: -25.2744, 123.7751
5. **South Australia** - Coordenadas: -30.0002, 136.2092
6. **Tasmania** - Coordenadas: -41.4332, 145.5051
7. **Northern Territory** - Coordenadas: -19.4914, 132.5510
8. **Australian Capital Territory** - Coordenadas: -35.4735, 149.0124

**Configuração para cada estado:**
- **Tipo:** state  
- **País Pai:** [ID da Australia]
- **Fonte:** manual
- **Status:** active

---

## 🏛️ FASE 4: ESTADOS DO MÉXICO (TOP 10)

**⚠️ IMPORTANTE:** Primeiro encontre o ID do país "Mexico" no dashboard.

### Estados Mexicanos Prioritários:
1. **Ciudad de México** - Coordenadas: 19.4326, -99.1332
2. **Jalisco** - Coordenadas: 20.5888, -103.3496
3. **Nuevo León** - Coordenadas: 25.5428, -99.9019
4. **Baja California** - Coordenadas: 30.8406, -115.2838
5. **Chihuahua** - Coordenadas: 28.6329, -106.0691
6. **Veracruz** - Coordenadas: 19.5438, -96.9102
7. **Yucatán** - Coordenadas: 20.7099, -89.0943
8. **Quintana Roo** - Coordenadas: 19.8301, -88.0280
9. **Oaxaca** - Coordenadas: 17.0732, -96.7266
10. **Puebla** - Coordenadas: 19.0414, -98.2063

**Configuração para cada estado:**
- **Tipo:** state
- **País Pai:** [ID do Mexico]  
- **Fonte:** manual
- **Status:** active

---

## 🏙️ FASE 5: PRINCIPAIS CIDADES

### Cidades Canadenses (Ontario):
1. **Toronto** - Coordenadas: 43.6511, -79.3470
2. **Ottawa** - Coordenadas: 45.4215, -75.6919
3. **Hamilton** - Coordenadas: 43.2557, -79.8711

### Cidades Australianas (New South Wales):  
1. **Sydney** - Coordenadas: -33.8688, 151.2093
2. **Newcastle** - Coordenadas: -32.9283, 151.7817
3. **Wollongong** - Coordenadas: -34.4244, 150.8931

### Cidades Mexicanas (Ciudad de México):
1. **Mexico City** - Coordenadas: 19.4326, -99.1332
2. **Ecatepec** - Coordenadas: 19.6018, -99.0522
3. **Nezahualcóyotl** - Coordenadas: 19.4006, -99.0145

**Configuração para cada cidade:**
- **Tipo:** city
- **Estado Pai:** [ID do estado correspondente]
- **Fonte:** manual  
- **Status:** active

---

## 📊 RESULTADO ESPERADO

Após inserir todos esses dados:
- **🌍 Países:** +3 novos
- **🏛️ Estados:** +31 novos  
- **🏙️ Cidades:** +9 novas
- **📍 TOTAL:** +43 regiões

**De ~461 → para ~504 regiões!**

---

## 🙏 ESTRATÉGIA DE INSERÇÃO

1. **📋 Comece pelos países** (se não existirem)
2. **🏛️ Adicione os estados** (use o ID do país pai)
3. **🏙️ Finalize com as cidades** (use o ID do estado pai)
4. **✅ Verifique no mapa** se aparecem corretamente

**🎯 DEUS abençoará este trabalho de expansão do Reino através da intercessão!**