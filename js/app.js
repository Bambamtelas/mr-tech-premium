/**
 * MR TECH PREMIUM - CLIENT APP STORE FRONTEND
 * Vitrine de Aplicativos com Download Direto de APK e QR Code (Sem categorias, sem Downloader code)
 */

let currentApps = [];

document.addEventListener('DOMContentLoaded', () => {
  initStore();
  checkUrlParameters();
  setupEventListeners();
});

/**
 * Inicializa a loja carregando dados e configurações
 */
function initStore() {
  currentApps = StoreDB.getApps();
  const settings = StoreDB.getSettings();

  // Aplica configurações no cabeçalho e título
  document.querySelectorAll('.store-name-text').forEach(el => el.textContent = settings.storeName);
  document.querySelectorAll('.store-slogan-text').forEach(el => el.textContent = settings.storeSlogan);
  
  const supportBtn = document.getElementById('btnSupport');
  if (supportBtn && settings.supportPhone) {
    const cleanPhone = settings.supportPhone.replace(/\D/g, '');
    const msg = encodeURIComponent(settings.supportMessage || 'Olá! Gostaria de ajuda na loja.');
    supportBtn.href = `https://wa.me/${cleanPhone}?text=${msg}`;
  }

  renderApps();

  // Sincroniza em segundo plano com o Supabase
  StoreDB.fetchFromSupabase().then(apps => {
    if (apps && apps.length > 0) {
      currentApps = apps;
      renderApps();
    }
    const updatedSettings = StoreDB.getSettings();
    document.querySelectorAll('.store-name-text').forEach(el => el.textContent = updatedSettings.storeName);
    document.querySelectorAll('.store-slogan-text').forEach(el => el.textContent = updatedSettings.storeSlogan);
    if (supportBtn && updatedSettings.supportPhone) {
      const cleanPhone = updatedSettings.supportPhone.replace(/\D/g, '');
      const msg = encodeURIComponent(updatedSettings.supportMessage || 'Olá! Gostaria de ajuda na loja.');
      supportBtn.href = `https://wa.me/${cleanPhone}?text=${msg}`;
    }
  });
}

/**
 * Renderiza os cards de aplicativos na grade
 */
function renderApps() {
  const grid = document.getElementById('appsGrid');
  const countEl = document.getElementById('appsCount');
  if (!grid) return;

  const searchQuery = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();

  // Filtra por busca de texto
  const filtered = currentApps.filter(app => {
    return !searchQuery || 
      app.name.toLowerCase().includes(searchQuery) ||
      (app.description && app.description.toLowerCase().includes(searchQuery));
  });

  if (countEl) {
    countEl.innerHTML = `Disponíveis: <strong>${filtered.length}</strong> aplicativos`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>Nenhum aplicativo encontrado</h3>
        <p>Tente buscar por outro nome de aplicativo.</p>
      </div>
    `;
    return;
  }

  // Ordena com destaques primeiro
  filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  grid.innerHTML = filtered.map(app => `
    <div class="app-card ${app.featured ? 'featured' : ''}" data-id="${app.id}">
      <div class="app-card-top">
        <img class="app-icon" src="${app.icon || 'assets/logo.jpg'}" alt="${app.name}" onerror="this.src='assets/logo.jpg'">
        <div class="app-header-meta">
          <h4 class="app-title" title="${app.name}">${app.name}</h4>
          <div class="app-specs">
            <span>📦 ${app.version || 'v1.0'}</span>
            <span>•</span>
            <span>💾 ${app.size || 'APK'}</span>
          </div>
        </div>
      </div>

      <p class="app-desc">${app.description || 'Download direto do arquivo APK para instalação rápida.'}</p>

      <div class="card-actions">
        <!-- Botão de Download Direto -->
        <a href="${app.apkUrl}" class="btn-download-primary btn-direct-download" data-id="${app.id}" download target="_blank">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar APK
        </a>
        
        <!-- Botão de Copiar Link & QR Code -->
        <button type="button" class="btn-details btn-open-modal" data-id="${app.id}" title="Ver Link Direto e QR Code">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  // Contador de downloads no clique direto
  grid.querySelectorAll('.btn-direct-download').forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = link.getAttribute('data-id');
      StoreDB.incrementDownload(id);
      showToast('Download do APK iniciado!', 'success');
    });
  });

  // Modal com Link Direto e QR Code
  grid.querySelectorAll('.btn-open-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openDownloadModal(id);
    });
  });

  grid.querySelectorAll('.app-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Se clicou no botão de download direto, não abre o modal
      if (e.target.closest('.btn-direct-download')) return;
      const id = card.getAttribute('data-id');
      openDownloadModal(id);
    });
  });
}

/**
 * Abre o Modal com Link Direto, QR Code e Detalhes do APK
 */
function openDownloadModal(appId) {
  const app = currentApps.find(a => a.id === appId);
  if (!app) return;

  const modal = document.getElementById('downloadModal');
  if (!modal) return;

  // Preenche dados do App
  document.getElementById('modalAppIcon').src = app.icon || 'assets/logo.jpg';
  document.getElementById('modalAppName').textContent = app.name;
  document.getElementById('modalAppVersion').textContent = app.version || 'v1.0';
  document.getElementById('modalAppSize').textContent = app.size || 'APK';
  
  // Link Direto do APK
  const linkInput = document.getElementById('modalDirectLink');
  linkInput.value = app.apkUrl;

  // Botão Download Direto
  const dlBtn = document.getElementById('modalBtnDirectDownload');
  dlBtn.href = app.apkUrl;
  dlBtn.onclick = () => {
    StoreDB.incrementDownload(app.id);
    showToast(`Baixando APK do ${app.name}...`, 'success');
  };

  // Botão Copiar Link Direto
  const copyBtn = document.getElementById('btnCopyDirectLink');
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(app.apkUrl).then(() => {
      showToast('Link direto do APK copiado!', 'success');
    }).catch(() => {
      linkInput.select();
      document.execCommand('copy');
      showToast('Link direto copiado!', 'success');
    });
  };

  modal.classList.add('active');
}

/**
 * Fecha o modal de download
 */
function closeDownloadModal() {
  const modal = document.getElementById('downloadModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Verifica se foi passado parâmetro para download direto (?app=1 ou ?id=1)
 */
function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('app') || urlParams.get('id') || urlParams.get('d');

  if (id) {
    const targetApp = StoreDB.getAppById(id);
    if (targetApp) {
      openDownloadModal(targetApp.id);
    }
  }
}

/**
 * Configura ouvintes de eventos da interface
 */
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderApps();
    });
  }

  // Fechar modal de download
  document.querySelectorAll('.btn-close-download-modal').forEach(btn => {
    btn.addEventListener('click', closeDownloadModal);
  });

  const downloadModal = document.getElementById('downloadModal');
  if (downloadModal) {
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal) closeDownloadModal();
    });
  }

  // Atalho do teclado Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDownloadModal();
      if (typeof closeAdminModal === 'function') closeAdminModal();
    }
  });
}

/**
 * Exibe notificação flutuante tipo Toast
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
