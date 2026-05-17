// Content script - detecta precio y nombre del producto en la página actual
(function() {
  const host = location.hostname.replace('www.', '');
  const storeConfig = typeof KARRITO_STORES !== 'undefined' && KARRITO_STORES[host];

  function queryFirst(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = el.getAttribute('content') || el.textContent.trim();
        if (text) return text;
      }
    }
    return '';
  }

  function extractPrice(text) {
    const match = text.match(/[\d.,]+/);
    return match ? match[0].replace(/[.,](?=\d{3})/g, '').replace(',', '.') : '';
  }

  function detectPrice() {
    // 1. Selectores específicos de la tienda
    if (storeConfig) {
      const text = queryFirst(storeConfig.price);
      if (text) return extractPrice(text);
    }
    // 2. Selectores genéricos
    const generic = [
      '[data-price]', '.price', '.product-price', '#price',
      '[itemprop="price"]', '.current-price', '.sale-price', '.offer-price'
    ];
    for (const sel of generic) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const attr = el.getAttribute('data-price') || el.getAttribute('content');
      if (attr) return attr;
      const text = el.textContent.trim();
      const match = text.match(/\$[\d.,]+/);
      if (match) return extractPrice(match[0]);
    }
    // 3. Meta tags
    const meta = document.querySelector('meta[property="product:price:amount"]');
    if (meta) return meta.content;
    return '';
  }

  function detectName() {
    if (storeConfig) {
      const text = queryFirst(storeConfig.productName);
      if (text) return text;
    }
    const og = document.querySelector('meta[property="og:title"]');
    if (og) return og.content;
    const h1 = document.querySelector('h1');
    if (h1) return h1.textContent.trim();
    return document.title;
  }

  function detectStore() {
    if (storeConfig) return storeConfig.name;
    const og = document.querySelector('meta[property="og:site_name"]');
    if (og) return og.content;
    return host;
  }

  function detect() {
    window.__karrito_detected = {
      price: detectPrice(),
      name: detectName(),
      store: detectStore()
    };
  }

  detect();
  setTimeout(detect, 1500);
  setTimeout(detect, 3000);

  // Inyectar botón "Añadir a Karrito"
  function injectButton() {
    if (document.getElementById('karrito-inject-btn')) return;
    const keywords = ['comprar', 'añadir al carrito', 'add to cart', 'buy now', 'agregar al carrito'];
    const buttons = document.querySelectorAll('button, a[role="button"], [type="submit"], a');
    for (const btn of buttons) {
      const text = btn.textContent.trim().toLowerCase();
      if (keywords.some(k => text.includes(k))) {
        const karBtn = document.createElement('button');
        karBtn.id = 'karrito-inject-btn';
        karBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>Añadir a Karrito';
        karBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;margin-top:8px;padding:12px;border:none;border-radius:8px;background:#4a6fa5;color:#fff;font-size:14px;font-weight:500;cursor:pointer;';
        karBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          detect();
          chrome.runtime.sendMessage({ action: 'addToKarrito', data: window.__karrito_detected }, (res) => {
            if (res?.duplicate) {
              showKarritoModal(() => {
                chrome.runtime.sendMessage({ action: 'forceAddToKarrito', data: window.__karrito_detected });
                showSuccess();
              });
              return;
            }
            showSuccess();
          });
          function showSuccess() {
            karBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M20 6 9 17l-5-5"/></svg>Añadido a Karrito';
            karBtn.style.background = '#48bb78';
            setTimeout(() => { karBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>Añadir a Karrito'; karBtn.style.background = '#4a6fa5'; }, 2000);
          }
        });
        btn.parentNode.insertBefore(karBtn, btn.nextSibling);

        chrome.runtime.sendMessage({ action: 'checkInKarrito', url: location.href }, (res) => {
          if (res?.exists && !document.getElementById('karrito-remove-btn')) {
            const removeBtn = document.createElement('button');
            removeBtn.id = 'karrito-remove-btn';
            removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>Eliminar del Karrito';
            removeBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;margin-top:8px;padding:12px;border:none;border-radius:8px;background:#e53e3e;color:#fff;font-size:14px;font-weight:500;cursor:pointer;';
            removeBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              chrome.runtime.sendMessage({ action: 'removeFromKarrito', url: location.href }, () => removeBtn.remove());
            });
            karBtn.parentNode.insertBefore(removeBtn, karBtn.nextSibling);
          }
        });
        return;
      }
    }
  }

  injectButton();
  setTimeout(injectButton, 2000);
  setTimeout(injectButton, 4000);

  function showKarritoModal(onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:999999;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:24px;max-width:320px;width:90%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
        <h3 style="margin:0 0 8px;font-size:15px;color:#4a6fa5;">Producto duplicado</h3>
        <p style="margin:0 0 16px;font-size:13px;color:#4a5568;">Este producto ya está en tu Karrito. ¿Deseas añadirlo de nuevo?</p>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="karrito-modal-cancel" style="padding:8px 16px;border:none;border-radius:6px;background:#edf2f7;color:#4a5568;font-size:13px;cursor:pointer;">Cancelar</button>
          <button id="karrito-modal-confirm" style="padding:8px 16px;border:none;border-radius:6px;background:#4a6fa5;color:#fff;font-size:13px;cursor:pointer;">Añadir igual</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#karrito-modal-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#karrito-modal-confirm').onclick = () => { overlay.remove(); onConfirm(); };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }
})();
