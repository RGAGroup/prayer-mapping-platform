# 🔐 Configuração da API Key OpenAI

## 📋 Métodos de Configuração

### Método 1: Interface do Dashboard (Recomendado)
1. Vá para o Dashboard Admin → aba "🤖 Agente IA"
2. Clique na sub-aba "Personas"
3. No campo "API Key OpenAI", insira sua API key
4. Clique em "Testar" para verificar a conexão
5. A API key será salva automaticamente no localStorage

### Método 2: Arquivo .env (Desenvolvimento Local)
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione a linha: `VITE_OPENAI_API_KEY=sk-proj-sua-api-key-aqui`
3. Reinicie o servidor de desenvolvimento (`npm run dev`)

### Método 3: Variáveis de Ambiente (Produção)
- **Vercel**: Configure em Project Settings → Environment Variables
- **Netlify**: Configure em Site Settings → Environment Variables
- **Outros**: Configure `VITE_OPENAI_API_KEY` ou `OPENAI_API_KEY`

## 🔍 Obtenção da API Key

1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave (começa com `sk-proj-`)
5. ⚠️ **Importante**: Guarde em local seguro, não será mostrada novamente

## 🛡️ Segurança

### ✅ Boas Práticas
- Use arquivo `.env` para desenvolvimento local
- Use variáveis de ambiente para produção
- Nunca commite API keys no Git
- Use prefixo `VITE_` para Vite.js

### ❌ Evite
- Hardcoding da API key no código
- Compartilhar API keys em chats/emails
- Deixar API keys em repositórios públicos

## 🚀 Prioridade de Carregamento

O sistema tenta carregar a API key nesta ordem:
1. localStorage (configurado via interface)
2. `VITE_OPENAI_API_KEY` (arquivo .env)
3. `OPENAI_API_KEY` (variável de ambiente)

## 🔧 Problemas Comuns

### Erro 401 - Unauthorized
- API key inválida ou expirada
- Verifique se a key está correta
- Teste a conexão via interface

### Erro 403 - Forbidden
- Conta OpenAI sem créditos
- Verifique saldo em: https://platform.openai.com/usage

### API Key não encontrada
- Verifique se foi configurada corretamente
- Reinicie o servidor após alterar .env
- Limpe localStorage se necessário

## 🎯 Exemplo de Configuração

```bash
# Arquivo .env
VITE_OPENAI_API_KEY=sk-proj-c1Y7DhvclA5Ns5-exemplo-de-key
```

```javascript
// Verificar no console do navegador
console.log('API Key configurada:', !!localStorage.getItem('openai-api-key'));
```

## 📞 Suporte

- **Problemas com API**: Verifique console do navegador
- **Erro 403 Supabase**: Problema de autenticação/permissões
- **Logs detalhados**: Disponíveis no console do navegador 