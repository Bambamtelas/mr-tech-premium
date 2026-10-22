# 🚀 MR TECH PREMIUM - Loja Oficial de Aplicativos Android & TV Box

Uma plataforma moderna, ultrarrápida e elegante desenvolvida sob medida para distribuição de aplicativos Android (**APKs**) com suporte especial para **TV Box**, **Smart TVs Android** e **Smartphones**.

---

## ✨ Principais Recursos

### 1. 📱 Vitrine da Loja (Frontend)
- **Design Futurista Dark Glassmorphic**: Cores em tons neon (ciano, roxo e esmeralda), contraste perfeito e alta legibilidade em telas grandes e celulares.
- **Busca por Código de TV no Topo**: Campo rápido onde o cliente pode digitar diretamente o código de 3 a 5 dígitos (ex: `101`) e já abrir o app ou iniciar o download.
- **Filtros por Categorias Dinâmicas**: IPTV & Players, Filmes & Séries, Launchers & TV, Ferramentas & Utilitários, etc.
- **Cards com Informações Claras**: Ícone em alta resolução, nome, versão, tamanho do APK, descrição e botões de ação rápida.

### 2. 📺 Sistema de Códigos Curtos & Download para TV
- **Código Curto em Destaque**: Cada aplicativo possui um código curto exclusivo (ex: `101`, `102`) pensado especialmente para ser digitado facilmente com o **controle remoto da TV** no aplicativo **Downloader** (AFTVnews).
- **Link Direto Facilitado**: Link simplificado gerado automaticamente com botão de cópia em 1 clique.
- **Tela Dedicada para TV (`baixar.html`)**: Tela com contagem regressiva de 3 segundos que inicia o download automaticamente na Android TV.

### 3. 🛠️ Painel do Administrador (Área Restrita)
- **Acesso Protegido por PIN**: Segurança com PIN numérico (Padrão: `1234`, totalmente editável).
- **Cadastrar Novos Aplicativos**:
  - Nome do Aplicativo
  - Categoria
  - Versão e Tamanho do Arquivo
  - Link direto de download do APK (Dropbox, MediaFire, Google Drive, servidor próprio)
  - Código Curto para TV (auto-gerado ou personalizado)
  - Link Curto Personalizado (opcional)
  - Ícone: Upload de arquivo do computador (salvo automaticamente), link de imagem externa ou escolha entre os ícones de alta resolução integrados
  - Descrição e opção de destaque na vitrine
- **Gerenciar Catálogo**: Editar informações, excluir aplicativos, testar links e copiar links curtos.
- **Estatísticas em Tempo Real**: Total de aplicativos, contagem de downloads e total de categorias ativas.
- **Backup & Restauração Completa**:
  - Exportar catálogo completo em arquivo `.json`.
  - Importar backup `.json` a qualquer momento para migrar entre computadores ou servidores.
  - Botão para restaurar os aplicativos padrão de fábrica.

---

## 📂 Estrutura de Arquivos

```
loja de app/
├── index.html          # Vitrine principal da loja + Modal do Admin
├── baixar.html         # Página dedicada de download rápido para Android TV
├── package.json        # Configuração do projeto e scripts de execução
├── README.md           # Documentação completa
├── assets/             # Logotipos e ícones dos aplicativos em alta resolução
│   ├── logo.jpg
│   ├── app_mrplayer.jpg
│   ├── app_cinestream.jpg
│   ├── app_launcher.jpg
│   └── app_speedtest.jpg
├── css/
│   └── style.css       # Design System completo, responsivo e temas neon
└── js/
    ├── data.js         # Banco de dados local (LocalStorage) e catálogo inicial
    ├── app.js          # Lógica da vitrine, busca por código e modais
    └── admin.js        # Lógica do painel do administrador e uploads
```

---

## 🖥️ Como Executar Localmente

### Opção 1: Via Node.js (Servidor Local)
No terminal desta pasta, execute:
```bash
npm start
```
Ou:
```bash
npx serve -l 3000
```
Depois acesse no seu navegador: `http://localhost:3000`

### Opção 2: Acesso Direto (Sem Servidor)
Basta dar um duplo clique no arquivo [`index.html`](file:///c:/Users/janat/OneDrive/Desktop/BECKUP%2013.09.2026/Nova%20pasta/clientes/loja%20de%20app/index.html) para abrir diretamente em qualquer navegador!

---

## 🌐 Como Publicar na Internet (Grátis e Rápido)

Como a aplicação é 100% estática e modular (HTML + CSS + JS), ela pode ser hospedada gratuitamente em minutos em qualquer serviço:

1. **Vercel / Netlify**: Basta arrastar a pasta do projeto para o painel de upload do Netlify ou Vercel.
2. **GitHub Pages**: Crie um repositório no GitHub, suba os arquivos e ative o GitHub Pages nas configurações.
3. **Hospedagem Própria / cPanel**: Faça upload de todos os arquivos para a pasta `public_html` da sua hospedagem com seu próprio domínio (ex: `mrtechpremium.com`).

---

## 🔒 Credenciais Padrão do Administrador

- **PIN Padrão**: `1234`
- Para alterar o PIN, acesse o **Painel Admin** > aba **Configurações & Backup** > digite o novo PIN e clique em **Salvar Configurações**.
