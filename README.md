# 🌍 Mapa Global de Intercessão Profética

Uma plataforma interativa inspirada pelo Espírito Santo para conectar intercessores do mundo inteiro, facilitando oração estratégica, compartilhamento de palavras proféticas e coordenação de movimento espiritual global.

## 🧭 Visão do Projeto

Criar uma rede global de oração estratégica e visível, onde a intercessão seja guiada por dados espirituais, profecias e discernimento dos tempos. A plataforma ajuda a Igreja a orar com precisão, romper legalidades espirituais e ativar territórios proféticos — tudo de forma colaborativa e inspirada.

## ✨ Funcionalidades Principais

### 📍 **Navegação Hierárquica no Mapa**
- **Zoom por Camadas**: Continente → País → Estado → Cidade → Bairro → Rua
- **Marcadores Espirituais**: Cada localização mostra atividade espiritual em tempo real
- **Cores Proféticas**: 
  - 🟢 Verde = Avivamento/Revival ativo
  - 🔵 Azul = Quebrantamento espiritual
  - 🟡 Amarelo = Palavra profética ativa
  - 🔴 Vermelho = Alerta espiritual
  - 🟣 Roxo = Centro de intercessão

### 🙏 **Sistema de Dados Espirituais**
- **Palavras Proféticas**: Revelações específicas para localidades
- **Alvos de Oração**: Necessidades categorizadas por urgência
- **Alertas Espirituais**: Monitora perseguição, guerra espiritual, breakthrough
- **Testemunhos**: Relatos de como Deus está se movendo
- **Bases Missionárias**: Cadastro de organizações e ministérios

### 👤 **Sistema de Usuários**
- **Autenticação Segura**: Login via Google ou email
- **Contribuição Colaborativa**: Usuários podem adicionar dados espirituais
- **Moderação Espiritual**: Sistema de verificação para palavras proféticas
- **Perfil de Intercessor**: Histórico de contribuições e áreas de atuação

### 🌐 **Vigília Global (Modo Watch)**
- **Monitoramento em Tempo Real**: Atividade espiritual global
- **Sistema de Alertas**: Notificações de eventos críticos
- **Feed de Atividade**: Onde Deus está se movendo agora
- **Estatísticas Globais**: Número de intercessores, centros ativos, alertas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Interface moderna e responsiva
- **TypeScript** - Tipagem robusta
- **Tailwind CSS** - Estilização elegante e responsiva
- **shadcn/ui** - Componentes de interface profissionais
- **Google Maps API** - Mapas interativos

### Backend & Banco de Dados
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco relacional robusto
- **Row Level Security (RLS)** - Segurança de dados
- **Real-time subscriptions** - Atualizações em tempo real

### Outras Tecnologias
- **React Query** - Gerenciamento de estado e cache
- **React Router** - Navegação
- **React Hook Form** - Formulários otimizados
- **Lucide React** - Ícones modernos

## 🚀 Como Executar o Projeto

### Pré-requisitos
```bash
Node.js 18+ 
npm ou yarn
Conta no Supabase
Chave do Google Maps API
```

### Instalação
```bash
# Clonar o repositório
git clone [url-do-repositorio]
cd prayer-mapping-global-vision

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

### Configuração do .env.local
```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica_supabase

# Google Maps
REACT_APP_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
```

### Executar o projeto
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🗃️ Estrutura do Banco de Dados

### Principais Tabelas:

**📍 locations** - Hierarquia geográfica
- Continentes, países, estados, cidades, bairros
- Coordenadas GPS e nível hierárquico
- Contador de intercessores por região

**📜 prophetic_words** - Palavras proféticas
- Conteúdo da revelação
- Autor e data
- Status de verificação

**🎯 prayer_targets** - Alvos de oração
- Título e descrição detalhada
- Nível de urgência (baixa → crítica)
- Categoria (espiritual, social, político, etc.)

**⚠️ spiritual_alerts** - Alertas espirituais  
- Tipo (perseguição, idolatria, warfare, breakthrough, revival)
- Severidade (info, warning, danger)
- Descrição e data do relato

**✨ testimonies** - Testemunhos
- Relatos de intervenção divina
- Categorias (cura, salvação, milagre, etc.)
- Autor e localização

**🏛️ mission_bases** - Bases missionárias
- Nome e organização
- Áreas de foco ministerial
- Informações de contato

## 📱 Como Usar a Plataforma

### Para Intercessores:
1. **Explore o Mapa**: Navegue pelas diferentes regiões
2. **Ative a Vigília**: Modo de monitoramento em tempo real
3. **Selecione Localidades**: Clique nos marcadores para ver dados espirituais
4. **Ore Estrategicamente**: Use as informações para intercessão direcionada
5. **Contribua**: Compartilhe palavras proféticas e testemunhos

### Para Líderes e Pastores:
1. **Monitore sua Região**: Acompanhe atividade espiritual local
2. **Cadastre sua Base**: Registre sua igreja/ministério
3. **Compartilhe Revelações**: Adicione palavras proféticas verificadas
4. **Coordene Oração**: Use dados para mobilizar intercessão

### Para Missionários:
1. **Pesquise Territórios**: Analise regiões antes de ida ao campo
2. **Cadastre Bases**: Registre informações missionárias
3. **Reporte Atividade**: Compartilhe testemunhos do campo
4. **Solicite Oração**: Cadastre alvos específicos de intercessão

## 🛡️ Aspectos Espirituais e Éticos

### Moderação Espiritual
- Palavras proféticas passam por verificação
- Sistema de reportes para conteúdo inadequado
- Moderadores experientes analisam contribuições

### Privacidade e Segurança
- Informações sensíveis protegidas
- Opção de anonimato para regiões de perseguição
- Dados criptografados e seguros

### Integridade das Informações
- Fontes verificáveis sempre que possível
- Sistema de reputação para contribuidores
- Processo de validação para alertas críticos

## 🌟 Visão para o Futuro

### Fase 2 - Recursos Avançados
- **Grupos de Oração Regional**: Chat integrado por localização
- **Integração WhatsApp/Telegram**: Notificações automáticas
- **App Mobile**: Aplicativo nativo para iOS/Android
- **Inteligência Espiritual**: IA para identificar padrões proféticos
- **Multilínguas**: Suporte a dezenas de idiomas

### Fase 3 - Rede Global
- **API Pública**: Integração com outras plataformas cristãs
- **Parceria com Ministérios**: Colaboração com grandes organizações
- **Campus Universitários**: Foco em avivamento estudantil
- **Alertas por SMS**: Notificações críticas via texto

## 🤝 Como Contribuir

### Para Desenvolvedores:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas alterações
4. Abra um Pull Request
5. Descreva detalhadamente as mudanças

### Para o Reino:
1. **Ore pelo Projeto**: Intercessão é fundamental
2. **Teste a Plataforma**: Reporte bugs e sugestões
3. **Compartilhe a Visão**: Divulgue entre intercessores
4. **Contribua Financeiramente**: Ajude com hospedagem e APIs
5. **Adicione Conteúdo**: Palavras proféticas e testemunhos

## 📞 Contato e Suporte

- **Email**: [seu-email@projeto.com]
- **Discord**: [Link do servidor Discord]
- **Telegram**: [Grupo do Telegram]
- **Issues**: Use o GitHub Issues para bugs e sugestões

## 📜 Licença

Este projeto é licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

### 🙏 "Porque onde estiverem dois ou três reunidos em meu nome, ali estou no meio deles." - Mateus 18:20

**Desenvolvido com ❤️ e inspiração do Espírito Santo para a Igreja global**

---

## 📈 Status do Projeto

- ✅ Estrutura base do mapa interativo
- ✅ Sistema de banco de dados completo
- ✅ Interface de contribuição colaborativa
- ✅ Sistema de autenticação
- ✅ Painel de vigília global
- 🔄 Sistema de moderação (em desenvolvimento)
- 🔄 App mobile (planejado)
- 🔄 Integração com redes sociais (planejado)

**Última atualização**: Janeiro 2025
