const DEFAULT_CATEGORIES = ['Ropa', 'Tecnología', 'Hogar', 'Otros'];

let state = { products: [], categories: DEFAULT_CATEGORIES };

// Storage
const load = () => chrome.storage.local.get(['products', 'categories'], (d) => {
  state.products = d.products || [];
  state.categories = d.categories || DEFAULT_CATEGORIES;
  render();
});

const save = () => chrome.storage.local.set({ products: state.products, categories: state.categories });

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`view-${tab.dataset.view}`).classList.add('active');
  });
});

// Render
function render() {
  renderCategories();
  renderFilter();
  renderProducts();
}

function renderCategories() {
  const list = document.getElementById('category-list');
  list.innerHTML = state.categories.map((c, i) => `
    <li><span>${c}</span><button data-i="${i}">${icons.x}</button></li>
  `).join('');
  list.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.categories.splice(btn.dataset.i, 1);
      save(); render();
    });
  });
}

function renderFilter() {
  const sel = document.getElementById('filter-category');
  sel.innerHTML = '<option value="all">Todas</option>' +
    state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
  sel.onchange = () => renderProducts();
}

function renderProducts() {
  const filter = document.getElementById('filter-category').value;
  const items = filter === 'all' ? state.products : state.products.filter(p => p.category === filter);
  const list = document.getElementById('product-list');

  if (!items.length) {
    list.innerHTML = '<div class="empty-state">No hay productos aún</div>';
    document.getElementById('total-price').textContent = '$0';
    return;
  }

  list.innerHTML = items.map((p, i) => `
    <div class="product-item">
      <button class="btn-remove" data-i="${i}">${icons.x}</button>
      <a class="name" href="${p.url}" target="_blank">${p.name || 'Producto sin nombre'}</a>
      <div class="store">${p.store || new URL(p.url).hostname}</div>
      ${p.price ? `<div class="price">$${Number(p.price).toLocaleString('es-CL')}</div>` : ''}
      <span class="category-badge">${p.category}</span>
    </div>
  `).join('');

  list.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.products.splice(btn.dataset.i, 1);
      save(); render();
    });
  });

  const total = state.products.reduce((s, p) => s + (parseInt(p.price) || 0), 0);
  document.getElementById('total-price').textContent = `$${total.toLocaleString('es-CL')}`;
}

// Add product - detect from current tab
document.getElementById('btn-add').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let detected = {};
  try {
    // Re-ejecutar detección en la página actual
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    // Esperar a que detecte en SPAs
    await new Promise(r => setTimeout(r, 1000));
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.__karrito_detected || null
    });
    if (result?.result) detected = result.result;
  } catch (e) { /* no access */ }

  showModal({
    url: tab.url,
    name: detected.name || tab.title,
    price: detected.price || '',
    store: detected.store || new URL(tab.url).hostname,
    category: state.categories[0] || ''
  });
});

function showModal(defaults) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Agregar producto</h3>
      <input id="m-name" placeholder="Nombre" value="${defaults.name}">
      <input id="m-price" placeholder="Precio" value="${defaults.price}">
      <input id="m-url" placeholder="URL" value="${defaults.url}">
      <select id="m-category">
        ${state.categories.map(c => `<option ${c === defaults.category ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <div class="modal-actions">
        <button class="btn-cancel">Cancelar</button>
        <button class="btn-save">Guardar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('.btn-cancel').onclick = () => overlay.remove();
  overlay.querySelector('.btn-save').onclick = () => {
    const product = {
      name: document.getElementById('m-name').value,
      price: document.getElementById('m-price').value,
      url: document.getElementById('m-url').value,
      category: document.getElementById('m-category').value,
      store: defaults.store,
      addedAt: Date.now()
    };
    const isDuplicate = state.products.some(p => p.url === product.url || p.name === product.name);
    if (isDuplicate) {
      showConfirm('Este producto ya está en tu Karrito. ¿Deseas añadirlo de nuevo?', () => {
        state.products.push(product);
        save(); render(); overlay.remove();
      });
    } else {
      state.products.push(product);
      save(); render(); overlay.remove();
    }
  };
}

function showConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Producto duplicado</h3>
      <p style="font-size:12px;color:#4a5568">${message}</p>
      <div class="modal-actions">
        <button class="btn-cancel">Cancelar</button>
        <button class="btn-save">Añadir igual</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.btn-cancel').onclick = () => overlay.remove();
  overlay.querySelector('.btn-save').onclick = () => { overlay.remove(); onConfirm(); };
}

// Add category
document.getElementById('btn-add-category').addEventListener('click', () => {
  const input = document.getElementById('new-category');
  const name = input.value.trim();
  if (name && !state.categories.includes(name)) {
    state.categories.push(name);
    save(); render(); input.value = '';
  }
});

load();

// Inyectar iconos Lucide
document.getElementById('header-icon').innerHTML = icons.shoppingCart;
document.getElementById('btn-add').innerHTML = icons.plus;
document.getElementById('btn-add-category').innerHTML = icons.plus;
