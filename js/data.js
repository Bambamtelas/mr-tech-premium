/**
 * MR TECH PREMIUM - DATA & STORAGE MODULE
 * Gerenciador de Aplicativos com Links Diretos de Download
 */

const STORAGE_KEY = 'mr_tech_apps_db_v2';
const SETTINGS_KEY = 'mr_tech_settings_db_v2';

// Dados Padrão Iniciais da Loja (Sem categorias e sem códigos de Downloader)
const DEFAULT_APPS = [
  {
    id: "1",
    name: "MR Player Pro",
    version: "v3.4.2",
    size: "18.4 MB",
    icon: "assets/app_mrplayer.jpg",
    apkUrl: "https://archive.org/download/mr-tech-demo-apks/mr_player_pro.apk",
    description: "O melhor reprodutor para Android TV e Celular. Suporte avançado a listas M3U, EPG dinâmico, gravação e interface ultra rápida.",
    featured: true,
    downloads: 1420,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "CineStream TV",
    version: "v2.8.0",
    size: "24.1 MB",
    icon: "assets/app_cinestream.jpg",
    apkUrl: "https://archive.org/download/mr-tech-demo-apks/cinestream_tv.apk",
    description: "Catálogo completo de filmes e séries em alta definição (HD e 4K). Interface cinema moderna, sinopses e navegação suave.",
    featured: true,
    downloads: 2850,
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Smart TV Launcher",
    version: "v1.9.5",
    size: "9.6 MB",
    icon: "assets/app_launcher.jpg",
    apkUrl: "https://archive.org/download/mr-tech-demo-apks/smart_tv_launcher.apk",
    description: "Launcher limpo, leve e sem propagandas para sua TV Box ou Smart TV. Organize seus apps favoritos na tela inicial com rapidez.",
    featured: true,
    downloads: 980,
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "Fast SpeedTest TV",
    version: "v2.1.0",
    size: "7.2 MB",
    icon: "assets/app_speedtest.jpg",
    apkUrl: "https://archive.org/download/mr-tech-demo-apks/fast_speedtest_tv.apk",
    description: "Meça a velocidade real de download e ping da sua conexão diretamente na TV ou no celular.",
    featured: false,
    downloads: 620,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS = {
  storeName: "MR TECH PREMIUM",
  storeSlogan: "Central Oficial de Aplicativos Android - Download Direto",
  adminPin: "1234",
  supportPhone: "5511999999999",
  supportMessage: "Olá, vim através da loja MR TECH PREMIUM e gostaria de suporte/ativação."
};

const StoreDB = {
  /**
   * Obtém todos os apps salvos ou restaura os padrões
   */
  getApps() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Erro ao ler localStorage:", e);
    }
    this.saveApps(DEFAULT_APPS);
    return DEFAULT_APPS;
  },

  /**
   * Salva a lista de apps no LocalStorage
   */
  saveApps(apps) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
    }
  },

  /**
   * Obtém as configurações da loja
   */
  getSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn("Erro ao carregar configurações:", e);
    }
    this.saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  /**
   * Salva as configurações da loja
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Erro ao salvar configurações:", e);
    }
  },

  /**
   * Busca um app pelo ID ou Nome
   */
  getAppById(id) {
    if (!id) return null;
    const clean = String(id).trim().toLowerCase();
    const apps = this.getApps();
    return apps.find(app => String(app.id).toLowerCase() === clean || app.name.toLowerCase() === clean) || null;
  },

  /**
   * Adiciona ou atualiza um aplicativo
   */
  upsertApp(appData) {
    const apps = this.getApps();
    const existingIndex = apps.findIndex(a => a.id === appData.id);

    if (existingIndex >= 0) {
      apps[existingIndex] = { ...apps[existingIndex], ...appData, updatedAt: new Date().toISOString() };
    } else {
      const id = appData.id || String(Date.now()).slice(-5);
      const newApp = {
        ...appData,
        id,
        downloads: appData.downloads || 0,
        createdAt: new Date().toISOString()
      };
      apps.unshift(newApp);
    }

    this.saveApps(apps);
    return true;
  },

  /**
   * Remove um aplicativo pelo ID
   */
  deleteApp(id) {
    let apps = this.getApps();
    apps = apps.filter(a => a.id !== id);
    this.saveApps(apps);
    return true;
  },

  /**
   * Incrementa contagem de download
   */
  incrementDownload(id) {
    const apps = this.getApps();
    const app = apps.find(a => a.id === id);
    if (app) {
      app.downloads = (app.downloads || 0) + 1;
      this.saveApps(apps);
    }
  },

  /**
   * Exporta todo o banco de dados como JSON
   */
  exportDatabase() {
    const data = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      apps: this.getApps()
    };
    return JSON.stringify(data, null, 2);
  },

  /**
   * Importa banco de dados de um arquivo JSON
   */
  importDatabase(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.apps && Array.isArray(parsed.apps)) {
        this.saveApps(parsed.apps);
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        this.saveSettings(parsed.settings);
      }
      return { success: true, count: parsed.apps ? parsed.apps.length : 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Restaura os apps padrões de fábrica
   */
  restoreDefaults() {
    this.saveApps(DEFAULT_APPS);
    this.saveSettings(DEFAULT_SETTINGS);
    return true;
  }
};
