# Sistema de Aceite de Termos e Política de Privacidade (LGPD)

## 📋 Visão Geral

Este documento descreve o sistema de aceite de Termos de Uso e Política de Privacidade implementado na plataforma **Atalaia - Global Vision**, em conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**.

---

## 🎯 Objetivos

1. **Conformidade Legal**: Atender aos requisitos da LGPD para coleta e tratamento de dados pessoais
2. **Transparência**: Informar claramente aos usuários sobre como seus dados são coletados e utilizados
3. **Consentimento Explícito**: Garantir que usuários aceitem os termos antes de criar uma conta
4. **Rastreabilidade**: Registrar quando e qual versão dos termos foi aceita

---

## 🏗️ Arquitetura do Sistema

### 1. Banco de Dados

**Tabela**: `user_profiles`

Novos campos adicionados:
```sql
- terms_accepted (BOOLEAN): Indica se o usuário aceitou os termos
- terms_accepted_at (TIMESTAMPTZ): Data e hora do aceite
- terms_version (VARCHAR): Versão dos termos aceitos (ex: "1.0")
```

**Migration**: `supabase/migrations/20250129000000_add_terms_acceptance.sql`

### 2. Trigger de Criação de Perfil

**Função**: `handle_new_user()`

Atualizada para salvar automaticamente os dados de aceite dos termos quando um novo usuário se registra.

**Arquivo**: `supabase/migrations/20250107000000_fix_user_profile_trigger.sql`

### 3. Frontend

#### Componentes Modificados:

**a) AuthModal.tsx**
- Adicionado checkbox de aceite de termos
- Validação: usuário não pode criar conta sem aceitar
- Link para página de termos (abre em nova aba)
- Estado `termsAccepted` para controlar o checkbox
- Botão "Criar conta" desabilitado se termos não forem aceitos

**b) TermsOfService.tsx** (NOVO)
- Página completa com Termos de Uso e Política de Privacidade
- Estrutura clara e organizada
- Conformidade com LGPD (Art. 18 - Direitos do Titular)
- Informações sobre:
  - Dados coletados
  - Finalidade do tratamento
  - Base legal (consentimento, execução de contrato, legítimo interesse)
  - Compartilhamento de dados
  - Direitos do usuário (acesso, correção, exclusão, portabilidade, etc.)
  - Retenção de dados
  - Segurança e armazenamento

**c) App.tsx**
- Adicionada rota `/terms` para a página de termos

**d) useAuth.ts**
- Função `signUp()` atualizada para receber parâmetro `termsAccepted`
- Dados de aceite salvos em `raw_user_meta_data` do Supabase Auth

---

## 📝 Conteúdo dos Termos

### Termos de Uso

1. **Aceitação dos Termos**
2. **Descrição do Serviço**
3. **Uso Adequado**
4. **Conteúdo do Usuário**
5. **Suspensão e Cancelamento**

### Política de Privacidade (LGPD)

1. **Dados Coletados**
   - Dados de Cadastro (nome, e-mail)
   - Dados de Uso (sessões de oração, regiões, reflexões)
   - Dados Técnicos (IP, navegador, sistema operacional)

2. **Finalidade do Tratamento**
   - Gerenciar conta de usuário
   - Registrar sessões de oração
   - Gerar rankings e estatísticas
   - Melhorar a plataforma
   - Garantir segurança

3. **Base Legal (LGPD)**
   - Consentimento (Art. 7º, I)
   - Execução de Contrato (Art. 7º, V)
   - Legítimo Interesse (Art. 7º, IX)

4. **Compartilhamento de Dados**
   - NÃO vendemos dados pessoais
   - Compartilhamento apenas com provedores essenciais
   - Dados anonimizados para estatísticas públicas

5. **Direitos do Usuário (Art. 18 da LGPD)**
   - Confirmação e acesso aos dados
   - Correção de dados
   - Anonimização, bloqueio ou eliminação
   - Portabilidade
   - Revogação do consentimento
   - Oposição ao tratamento

6. **Armazenamento e Segurança**
   - Servidores seguros com criptografia
   - Localização: América do Sul (Brasil) - Supabase

7. **Retenção de Dados**
   - Dados mantidos enquanto conta estiver ativa
   - Exclusão em até 30 dias após cancelamento

8. **Cookies**
   - Apenas cookies essenciais para autenticação

9. **Menores de Idade**
   - Serviço para maiores de 18 anos
   - Consentimento parental necessário para menores

---

## 🔄 Fluxo de Registro

```
1. Usuário acessa a plataforma
   ↓
2. Clica em "Criar conta"
   ↓
3. Preenche: Nome, E-mail, Senha
   ↓
4. Lê e marca checkbox: "Li e aceito os Termos de Uso e Política de Privacidade (LGPD)"
   ↓
5. Clica em "Criar conta" (habilitado apenas se checkbox marcado)
   ↓
6. Sistema valida aceite dos termos
   ↓
7. Supabase Auth cria usuário com metadata:
   - terms_accepted: true
   - terms_accepted_at: "2025-01-29T12:00:00Z"
   - terms_version: "1.0"
   ↓
8. Trigger `handle_new_user()` cria perfil em `user_profiles`
   ↓
9. Dados de aceite salvos no banco
   ↓
10. Usuário autenticado e redirecionado
```

---

## ✅ Conformidade LGPD

### Princípios Atendidos:

- ✅ **Finalidade**: Dados coletados para propósitos específicos e legítimos
- ✅ **Adequação**: Tratamento compatível com as finalidades informadas
- ✅ **Necessidade**: Coleta limitada ao mínimo necessário
- ✅ **Transparência**: Informações claras e acessíveis sobre tratamento
- ✅ **Segurança**: Medidas técnicas para proteção de dados
- ✅ **Prevenção**: Medidas para evitar danos
- ✅ **Não discriminação**: Tratamento sem fins discriminatórios
- ✅ **Responsabilização**: Demonstração de conformidade

### Direitos do Titular (Art. 18):

- ✅ Confirmação da existência de tratamento
- ✅ Acesso aos dados
- ✅ Correção de dados incompletos/inexatos
- ✅ Anonimização, bloqueio ou eliminação
- ✅ Portabilidade dos dados
- ✅ Eliminação dos dados tratados com consentimento
- ✅ Informação sobre compartilhamento
- ✅ Informação sobre possibilidade de não consentir
- ✅ Revogação do consentimento

---

## 🔐 Segurança

1. **Armazenamento**: Supabase (certificado SOC 2 Type II)
2. **Criptografia**: Dados em trânsito (HTTPS) e em repouso
3. **Autenticação**: Supabase Auth com JWT
4. **RLS (Row Level Security)**: Políticas de acesso por usuário
5. **Backup**: Automático pelo Supabase

---

## 📧 Contatos para Exercício de Direitos

- **Privacidade**: privacidade@atalaia.global
- **Suporte**: suporte@atalaia.global

---

## 🔄 Versionamento dos Termos

**Versão Atual**: 1.0  
**Data**: 29/01/2025

Quando os termos forem atualizados:
1. Incrementar versão (ex: 1.1, 2.0)
2. Atualizar data na página de termos
3. Notificar usuários existentes
4. Solicitar novo aceite se mudanças forem significativas

---

## 📊 Auditoria

Para verificar aceite de termos de um usuário:

```sql
SELECT 
  user_id,
  display_name,
  terms_accepted,
  terms_accepted_at,
  terms_version,
  created_at
FROM user_profiles
WHERE user_id = 'UUID_DO_USUARIO';
```

Para listar usuários que não aceitaram termos:

```sql
SELECT 
  user_id,
  display_name,
  email,
  created_at
FROM user_profiles
WHERE terms_accepted = FALSE OR terms_accepted IS NULL;
```

---

## 🚀 Próximos Passos (Opcional)

1. **E-mail de Confirmação**: Enviar cópia dos termos aceitos por e-mail
2. **Dashboard de Privacidade**: Página para usuário gerenciar seus dados
3. **Exportação de Dados**: Funcionalidade para download de todos os dados
4. **Exclusão de Conta**: Botão para usuário excluir sua própria conta
5. **Notificação de Mudanças**: Sistema para notificar sobre atualizações nos termos

---

## 📚 Referências

- [LGPD - Lei nº 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ANPD - Autoridade Nacional de Proteção de Dados](https://www.gov.br/anpd/pt-br)
- [Guia de Boas Práticas LGPD](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-de-boas-praticas)

---

**Desenvolvido com ❤️ para conformidade e transparência**

