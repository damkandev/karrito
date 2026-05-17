// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['categories'], (d) => {
    if (!d.categories) {
      chrome.storage.local.set({ categories: ['Ropa', 'Tecnología', 'Hogar', 'Otros'], products: [] });
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'addToKarrito' && msg.data) {
    chrome.storage.local.get(['products', 'categories'], (d) => {
      const products = d.products || [];
      const isDuplicate = products.some(p => p.url === (sender.tab?.url || '') || p.name === msg.data.name);
      if (isDuplicate) {
        sendResponse({ duplicate: true });
        return;
      }
      products.push({
        name: msg.data.name || 'Producto',
        price: msg.data.price || '',
        url: sender.tab?.url || '',
        category: (d.categories || [])[0] || 'Otros',
        store: msg.data.store || '',
        addedAt: Date.now()
      });
      chrome.storage.local.set({ products });
      sendResponse({ duplicate: false });
    });
    return true;
  }
  if (msg.action === 'forceAddToKarrito' && msg.data) {
    chrome.storage.local.get(['products', 'categories'], (d) => {
      const products = d.products || [];
      products.push({
        name: msg.data.name || 'Producto',
        price: msg.data.price || '',
        url: sender.tab?.url || '',
        category: (d.categories || [])[0] || 'Otros',
        store: msg.data.store || '',
        addedAt: Date.now()
      });
      chrome.storage.local.set({ products });
    });
  }
  if (msg.action === 'checkInKarrito') {
    chrome.storage.local.get(['products'], (d) => {
      const exists = (d.products || []).some(p => p.url === msg.url);
      sendResponse({ exists });
    });
    return true;
  }
  if (msg.action === 'removeFromKarrito') {
    chrome.storage.local.get(['products'], (d) => {
      const products = (d.products || []).filter(p => p.url !== msg.url);
      chrome.storage.local.set({ products });
      sendResponse({ ok: true });
    });
    return true;
  }
});
