/**
 * MR TECH PREMIUM - DATA & STORAGE MODULE (COM SUPABASE)
 * Gerenciador de Aplicativos com Sincronização em Nuvem em Tempo Real
 */

const SUPABASE_CONFIG = {
  url: 'https://fzawwpylvourxxcjwdzu.supabase.co',
  key: 'sb_publishable_X-DaRHahbiDK_y_uaxLHSQ_hvrrF-1s'
};

const STORAGE_KEY = 'mr_tech_apps_db_v2';
const SETTINGS_KEY = 'mr_tech_settings_db_v2';

// Dados Padrão Iniciais da Loja (Fallback offline)
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

function mapFromDb(row) {
  return {
    id: String(row.id),
    name: row.name,
    version: row.version || 'v1.0',
    size: row.size || 'APK',
    apkUrl: row.apk_url || row.apkUrl || '',
    icon: row.icon || 'assets/logo.jpg',
    description: row.description || '',
    featured: !!row.featured,
    downloads: Number(row.downloads) || 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

function mapToDb(app) {
  return {
    id: String(app.id),
    name: app.name,
    version: app.version || 'v1.0',
    size: app.size || 'APK',
    apk_url: app.apkUrl || app.apk_url || '',
    icon: app.icon || 'assets/logo.jpg',
    description: app.description || '',
    featured: !!app.featured,
    downloads: Number(app.downloads) || 0
  };
}

const StoreDB = {
  _cachedApps: null,

  /**
   * Obtém apps do cache local ou defaults
   */
  getApps() {
    if (this._cachedApps && this._cachedApps.length > 0) {
      return this._cachedApps.filter(a => a.id !== '__settings__');
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this._cachedApps = parsed.filter(a => a.id !== '__settings__');
          return this._cachedApps;
        }
      }
    } catch (e) {
      console.warn("Erro ao ler localStorage:", e);
    }
    this._cachedApps = DEFAULT_APPS;
    this.saveApps(DEFAULT_APPS);
    return DEFAULT_APPS;
  },

  /**
   * Salva a lista de apps no LocalStorage
   */
  saveApps(apps) {
    this._cachedApps = Array.isArray(apps) ? apps.filter(a => a.id !== '__settings__') : [];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cachedApps));
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
    }
  },

  /**
   * Sincroniza aplicativos e configurações com o Supabase
   */
  async fetchFromSupabase() {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/mr_tech_apps?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
        }
      });

      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) {
          // Extrai e atualiza configurações da loja se salvas na nuvem
          const settingsRow = rows.find(r => r.id === '__settings__');
          if (settingsRow && settingsRow.description) {
            try {
              const cloudSettings = JSON.parse(settingsRow.description);
              if (cloudSettings && typeof cloudSettings === 'object') {
                const currentLocal = this.getSettings();
                const merged = { ...currentLocal, ...cloudSettings };
                try {
                  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
                } catch (e) {}
              }
            } catch (e) {
              console.warn("Erro ao analisar configurações da nuvem:", e);
            }
          }

          // Filtra apenas aplicativos reais (exclui o registro de configurações)
          const appRows = rows.filter(r => r.id !== '__settings__');
          const apps = appRows.map(mapFromDb);
          this.saveApps(apps);
          return apps;
        }
      }
    } catch (err) {
      console.warn("Erro ao sincronizar com Supabase (usando cache local):", err);
    }
    return this.getApps();
  },

  /**
   * Adiciona ou atualiza um aplicativo no Supabase e no Cache
   */
  async upsertApp(appData) {
    const id = appData.id || String(Date.now()).slice(-5);
    const fullApp = {
      ...appData,
      id,
      downloads: appData.downloads || 0,
      createdAt: appData.createdAt || new Date().toISOString()
    };

    // Atualiza cache local instantaneamente
    const apps = this.getApps();
    const existingIndex = apps.findIndex(a => a.id === fullApp.id);
    if (existingIndex >= 0) {
      apps[existingIndex] = { ...apps[existingIndex], ...fullApp, updatedAt: new Date().toISOString() };
    } else {
      apps.unshift(fullApp);
    }
    this.saveApps(apps);

    // Envia para o Supabase
    try {
      const dbRow = mapToDb(fullApp);
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/mr_tech_apps`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(dbRow)
      });
    } catch (err) {
      console.error("Erro ao sincronizar upsert com Supabase:", err);
    }

    return true;
  },

  /**
   * Remove um aplicativo pelo ID no Supabase e no Cache
   */
  async deleteApp(id) {
    let apps = this.getApps();
    apps = apps.filter(a => a.id !== id);
    this.saveApps(apps);

    try {
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/mr_tech_apps?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
        }
      });
    } catch (err) {
      console.error("Erro ao sincronizar delete com Supabase:", err);
    }

    return true;
  },

  /**
   * Incrementa contagem de download
   */
  async incrementDownload(id) {
    const apps = this.getApps();
    const app = apps.find(a => a.id === id);
    if (app) {
      app.downloads = (app.downloads || 0) + 1;
      this.saveApps(apps);

      try {
        await fetch(`${SUPABASE_CONFIG.url}/rest/v1/mr_tech_apps?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_CONFIG.key,
            'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ downloads: app.downloads })
        });
      } catch (e) {
        // silencioso
      }
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
   * Salva as configurações da loja localmente e sincroniza na nuvem
   */
  async saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Erro ao salvar configurações:", e);
    }

    // Sincroniza em tempo real com o Supabase para persistir em todos os dispositivos
    try {
      const payload = {
        id: '__settings__',
        name: '__settings__',
        version: '1.0',
        size: '0',
        apk_url: '',
        icon: '',
        description: JSON.stringify(settings),
        featured: false,
        downloads: 0
      };

      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/mr_tech_apps`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Erro ao sincronizar configurações na nuvem:", err);
    }
  },

  /**
   * Busca um app pelo ID ou Nome
   */
  getAppById(id) {
    if (!id || id === '__settings__') return null;
    const clean = String(id).trim().toLowerCase();
    const apps = this.getApps();
    return apps.find(app => String(app.id).toLowerCase() === clean || app.name.toLowerCase() === clean) || null;
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
        // Sincroniza em lote com Supabase
        parsed.apps.forEach(app => this.upsertApp(app));
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
