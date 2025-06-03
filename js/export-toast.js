// Show loader/toast on Export as PDF click
function createExportLoader() {
  if (document.getElementById('export-pdf-loader')) return;
  const overlay = document.createElement('div');
  overlay.id = 'export-pdf-loader';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(255,255,255,0.85)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 2000;
  overlay.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div class="export-spinner" style="border: 4px solid #eee; border-top: 4px solid #ff5500; border-radius: 50%; width: 48px; height: 48px; animation: spin 1s linear infinite; margin-bottom: 1.2rem;"></div>
      <div style="font-family: 'Lato', Arial, sans-serif; font-size: 1.1rem; color: #162F56;">Preparing your PDF...</div>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `;
  document.body.appendChild(overlay);
}

function removeExportLoader() {
  const overlay = document.getElementById('export-pdf-loader');
  if (overlay) overlay.remove();
}

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.querySelector('.export-pdf-btn');
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    createExportLoader();
    // Remove loader after navigation or after 5s as fallback
    setTimeout(removeExportLoader, 5000);
  });
  // Remove loader if page is hidden/unloaded
  window.addEventListener('pagehide', removeExportLoader);
  window.addEventListener('beforeunload', removeExportLoader);
}); 