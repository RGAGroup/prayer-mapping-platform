-- Verificar se os dados existem
SELECT 'Localizações', COUNT(*) FROM locations;
SELECT 'Continentes', COUNT(*) FROM locations WHERE type = 'continent';
SELECT 'Países', COUNT(*) FROM locations WHERE type = 'country';
SELECT 'Cidades', COUNT(*) FROM locations WHERE type = 'city';

-- Mostrar alguns dados de exemplo
SELECT name, type, intercessor_count FROM locations WHERE type = 'continent' LIMIT 5;
SELECT name, type, intercessor_count FROM locations WHERE type = 'country' LIMIT 5;

-- Verificar palavras proféticas
SELECT 'Palavras Proféticas', COUNT(*) FROM prophetic_words;
SELECT location_id, content FROM prophetic_words LIMIT 3; 