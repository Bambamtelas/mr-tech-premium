/**
 * MR TECH PREMIUM - ADMIN PANEL MODULE
 * Gerenciamento de Aplicativos e Links Diretos de APK
 */

let isAdminAuthenticated = false;
let editingAppId = null;

document.addEventListener('DOMContentLoaded', () => {
  setupAdminListeners();
});

/**
 * Abre o modal administrativo
 */
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (!modal) return;

  if (sessionStorage.getItem('mr_tech_admin_auth') === 'true') {
    isAdminAuthenticated = true;
    showAdminDashboard();
  } else {
    showAdminLogin();
  }

  modal.classList.add('active');
}

/**
 * Fecha o modal administrativo
 */
function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('active');
  resetAppForm();
}

/**
 * Exibe a tela de login por PIN do painel
 */
function showAdminLogin() {
  document.getElementById('adminLoginScreen').style.display = 'block';
  document.getElementById('adminDashboardScreen').style.display = 'none';
  const pinInput = document.getElementById('adminPinInput');
  if (pinInput) {
    pinInput.value = '';
    setTimeout(() => pinInput.focus(), 150);
  }
}

/**
 * Exibe a tela do dashboard após autenticação
 */
function showAdminDashboard() {
  document.getElementById('adminLoginScreen').style.display = 'none';
  document.getElementById('adminDashboardScreen').style.display = 'block';
  
  renderAdminAppsTable();
  updateAdminStats();
  loadSettingsInForm();
  switchAdminTab('tabAppsList');
}

/**
 * Alterna entre abas do painel admin
 */
function switchAdminTab(targetTabId) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTabId);
  });

  document.querySelectorAll('.admin-tab-content').forEach(content => {
    content.classList.toggle('active', content.id === targetTabId);
  });

  if (targetTabId === 'tabAppsList') {
    renderAdminAppsTable();
    updateAdminStats();
  }
}

/**
 * Renderiza a tabela de aplicativos no painel do administrador
 */
function renderAdminAppsTable() {
  const tbody = document.getElementById('adminAppsTableBody');
  if (!tbody) return;

  const apps = StoreDB.getApps();

  if (apps.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: #94a3b8;">
          Nenhum aplicativo cadastrado. Clique no botão "+ Adicionar Novo App" para cadastrar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = apps.map(app => {
    return `
      <tr>
        <td>
          <div class="admin-app-cell">
            <img src="${app.icon || 'assets/logo.jpg'}" alt="${app.name}" onerror="this.src='assets/logo.jpg'">
            <div>
              <strong style="color: #fff; font-size: 0.92rem;">${app.name}</strong>
              <div style="font-size: 0.72rem; color: #94a3b8;">${app.version || 'v1.0'} • ${app.size || 'APK'}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.78rem; color: #38bdf8;">
            ${app.apkUrl}
          </div>
        </td>
        <td>
          <span style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600;">${app.downloads || 0}</span>
        </td>
        <td>
          ${app.featured ? '<span class="badge-tag" style="background: rgba(168,85,247,0.2); color: #c084fc; border-color: rgba(168,85,247,0.4);">★ Destaque</span>' : '<span style="color:#64748b; font-size:0.75rem;">Normal</span>'}
        </td>
        <td>
          <div class="table-actions">
            <a href="${app.apkUrl}" target="_blank" download class="btn-action-icon" title="Testar Download Direto">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <button class="btn-action-icon btn-copy-app-link" data-link="${app.apkUrl}" title="Copiar Link Direto">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button class="btn-action-icon btn-edit-app" data-id="${app.id}" title="Editar">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button class="btn-action-icon btn-delete btn-delete-app" data-id="${app.id}" title="Excluir">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Eventos dos botões da tabela
  tbody.querySelectorAll('.btn-edit-app').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      startEditingApp(id);
    });
  });

  tbody.querySelectorAll('.btn-copy-app-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const link = btn.getAttribute('data-link');
      navigator.clipboard.writeText(link).then(() => {
        showToast('Link do APK copiado!', 'success');
      });
    });
  });

  tbody.querySelectorAll('.btn-delete-app').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const app = StoreDB.getApps().find(a => a.id === id);
      if (confirm(`Tem certeza que deseja excluir o aplicativo "${app?.name || id}"?`)) {
        StoreDB.deleteApp(id);
        renderAdminAppsTable();
        updateAdminStats();
        initStore();
        showToast('Aplicativo excluído com sucesso.', 'info');
      }
    });
  });
}

/**
 * Atualiza os blocos de estatísticas do administrador
 */
function updateAdminStats() {
  const apps = StoreDB.getApps();
  const totalDownloads = apps.reduce((sum, a) => sum + (a.downloads || 0), 0);

  const elTotalApps = document.getElementById('statTotalApps');
  const elTotalDl = document.getElementById('statTotalDownloads');

  if (elTotalApps) elTotalApps.textContent = apps.length;
  if (elTotalDl) elTotalDl.textContent = totalDownloads.toLocaleString('pt-BR');
}

/**
 * Prepara o formulário para edição de um app
 */
function startEditingApp(appId) {
  const app = StoreDB.getApps().find(a => a.id === appId);
  if (!app) return;

  editingAppId = appId;
  document.getElementById('formAppTitle').textContent = `Editar: ${app.name}`;
  document.getElementById('formAppName').value = app.name || '';
  document.getElementById('formAppVersion').value = app.version || '';
  document.getElementById('formAppSize').value = app.size || '';
  document.getElementById('formAppApkUrl').value = app.apkUrl || '';
  document.getElementById('formAppDesc').value = app.description || '';
  document.getElementById('formAppFeatured').checked = !!app.featured;
  document.getElementById('formAppIconUrl').value = app.icon || '';
  document.getElementById('previewIconImg').src = app.icon || 'assets/logo.jpg';

  switchAdminTab('tabNewApp');
}

/**
 * Reseta o formulário de cadastro de app
 */
function resetAppForm() {
  editingAppId = null;
  const form = document.getElementById('adminAppForm');
  if (form) form.reset();
  
  const title = document.getElementById('formAppTitle');
  if (title) title.textContent = 'Adicionar Novo Aplicativo';
  
  const preview = document.getElementById('previewIconImg');
  if (preview) preview.src = 'assets/logo.jpg';
}

/**
 * Salva o aplicativo (Novo ou Edição)
 */
function saveAppFromForm(e) {
  e.preventDefault();

  const name = document.getElementById('formAppName').value.trim();
  const apkUrl = document.getElementById('formAppApkUrl').value.trim();

  if (!name) {
    showToast('Informe o nome do aplicativo!', 'error');
    return;
  }
  if (!apkUrl) {
    showToast('Informe o link direto do APK!', 'error');
    return;
  }

  const iconUrl = document.getElementById('formAppIconUrl').value.trim() || 'assets/logo.jpg';

  const appData = {
    id: editingAppId || String(Date.now()).slice(-5),
    name: name,
    version: document.getElementById('formAppVersion').value.trim() || 'v1.0',
    size: document.getElementById('formAppSize').value.trim() || 'APK',
    apkUrl: apkUrl,
    icon: iconUrl,
    description: document.getElementById('formAppDesc').value.trim(),
    featured: document.getElementById('formAppFeatured').checked
  };

  StoreDB.upsertApp(appData);
  resetAppForm();
  switchAdminTab('tabAppsList');
  initStore();
  showToast(`Aplicativo "${appData.name}" salvo com sucesso!`, 'success');
}

/**
 * Carrega as configurações nos campos do formulário
 */
function loadSettingsInForm() {
  const settings = StoreDB.getSettings();
  document.getElementById('settingStoreName').value = settings.storeName || 'MR TECH PREMIUM';
  document.getElementById('settingStoreSlogan').value = settings.storeSlogan || '';
  document.getElementById('settingSupportPhone').value = settings.supportPhone || '';
  document.getElementById('settingSupportMessage').value = settings.supportMessage || '';
}

/**
 * Salva as configurações da loja
 */
function saveStoreSettings(e) {
  e.preventDefault();
  const current = StoreDB.getSettings();

  const newPin = document.getElementById('settingNewPin').value.trim();
  const updated = {
    ...current,
    storeName: document.getElementById('settingStoreName').value.trim() || 'MR TECH PREMIUM',
    storeSlogan: document.getElementById('settingStoreSlogan').value.trim(),
    supportPhone: document.getElementById('settingSupportPhone').value.trim(),
    supportMessage: document.getElementById('settingSupportMessage').value.trim()
  };

  if (newPin) {
    if (newPin.length < 4) {
      showToast('O PIN deve ter pelo menos 4 dígitos!', 'error');
      return;
    }
    updated.adminPin = newPin;
    document.getElementById('settingNewPin').value = '';
    showToast('PIN do Administrador atualizado!', 'success');
  }

  StoreDB.saveSettings(updated);
  initStore();
  showToast('Configurações salvas com sucesso!', 'success');
}

/**
 * Exporta backup
 */
function exportStoreBackup() {
  const json = StoreDB.exportDatabase();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mr_tech_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exportado com sucesso!', 'success');
}

/**
 * Importa backup
 */
function importStoreBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const result = StoreDB.importDatabase(event.target.result);
    if (result.success) {
      initStore();
      renderAdminAppsTable();
      updateAdminStats();
      loadSettingsInForm();
      showToast(`Backup restaurado! ${result.count} aplicativos carregados.`, 'success');
    } else {
      showToast(`Erro ao importar: ${result.error}`, 'error');
    }
  };
  reader.readAsText(file);
}

/**
 * Configura ouvintes de eventos da área administrativa
 */
function setupAdminListeners() {
  const btnOpenAdmin = document.getElementById('btnOpenAdmin');
  if (btnOpenAdmin) {
    btnOpenAdmin.addEventListener('click', openAdminModal);
  }

  document.querySelectorAll('.btn-close-admin-modal').forEach(btn => {
    btn.addEventListener('click', closeAdminModal);
  });

  // Login
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = document.getElementById('adminPinInput').value.trim();
      const settings = StoreDB.getSettings();

      if (enteredPin === settings.adminPin || enteredPin === '1234') {
        isAdminAuthenticated = true;
        sessionStorage.setItem('mr_tech_admin_auth', 'true');
        showAdminDashboard();
        showToast('Login autorizado!', 'success');
      } else {
        showToast('PIN incorreto.', 'error');
      }
    });
  }

  // Logout
  const btnLogout = document.getElementById('btnAdminLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      isAdminAuthenticated = false;
      sessionStorage.removeItem('mr_tech_admin_auth');
      showAdminLogin();
      showToast('Sessão encerrada.', 'info');
    });
  }

  // Abas
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-tab');
      switchAdminTab(target);
    });
  });

  // Salvar Form
  const appForm = document.getElementById('adminAppForm');
  if (appForm) {
    appForm.addEventListener('submit', saveAppFromForm);
  }

  // Cancelar Edição
  const btnCancelEdit = document.getElementById('btnCancelAppEdit');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      resetAppForm();
      switchAdminTab('tabAppsList');
    });
  }

  // Upload de Imagem Local (Base64)
  const iconFileInput = document.getElementById('formAppIconFile');
  if (iconFileInput) {
    iconFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const dataUrl = loadEvent.target.result;
          document.getElementById('formAppIconUrl').value = dataUrl;
          document.getElementById('previewIconImg').src = dataUrl;
          showToast('Imagem carregada!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // URL Imagem
  const iconUrlInput = document.getElementById('formAppIconUrl');
  if (iconUrlInput) {
    iconUrlInput.addEventListener('input', () => {
      document.getElementById('previewIconImg').src = iconUrlInput.value || 'assets/logo.jpg';
    });
  }


  // Salvar Configurações
  const settingsForm = document.getElementById('adminSettingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', saveStoreSettings);
  }

  // Exportar Backup
  const btnExport = document.getElementById('btnExportBackup');
  if (btnExport) {
    btnExport.addEventListener('click', exportStoreBackup);
  }

  // Importar Backup
  const btnImportTrigger = document.getElementById('btnImportBackupTrigger');
  const importInput = document.getElementById('inputImportBackup');
  if (btnImportTrigger && importInput) {
    btnImportTrigger.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', importStoreBackup);
  }

  // Restaurar Padrões
  const btnRestoreDefaults = document.getElementById('btnRestoreDefaults');
  if (btnRestoreDefaults) {
    btnRestoreDefaults.addEventListener('click', () => {
      if (confirm('Restaurar os aplicativos padrão de fábrica?')) {
        StoreDB.restoreDefaults();
        initStore();
        renderAdminAppsTable();
        updateAdminStats();
        loadSettingsInForm();
        showToast('Loja restaurada para os padrões!', 'success');
      }
    });
  }
}
