/**
 * Registro de tiendas soportadas por Karrito.
 *
 * Para agregar una nueva tienda:
 * 1. Añade una entrada con el hostname (sin www.) como clave
 * 2. Define los selectores CSS para precio y nombre del producto
 * 3. Los selectores se prueban en orden — el primero que encuentre un elemento gana
 *
 * Ejemplo:
 *   'mitienda.com': {
 *     name: 'Mi Tienda',
 *     price: ['.mi-precio', '#precio-producto'],
 *     productName: ['h1.titulo-producto', '.product-title'],
 *   }
 */
const KARRITO_STORES = {
  // ✅ Soporte confirmado
  'amazon.com': {
    name: 'Amazon',
    price: ['.a-price .a-offscreen', '#priceblock_ourprice', '#priceblock_dealprice', '.a-price-whole'],
    productName: ['#productTitle', '#title'],
  },
  'amazon.com.mx': {
    name: 'Amazon México',
    price: ['.a-price .a-offscreen', '#priceblock_ourprice', '#priceblock_dealprice', '.a-price-whole'],
    productName: ['#productTitle', '#title'],
  },
  'mercadolibre.com.mx': {
    name: 'Mercado Libre',
    price: ['.andes-money-amount__fraction', '[itemprop="price"]'],
    productName: ['.ui-pdp-title', 'h1'],
  },
  'mercadolibre.com.ar': {
    name: 'Mercado Libre',
    price: ['.andes-money-amount__fraction', '[itemprop="price"]'],
    productName: ['.ui-pdp-title', 'h1'],
  },
  'mercadolibre.com.co': {
    name: 'Mercado Libre',
    price: ['.andes-money-amount__fraction', '[itemprop="price"]'],
    productName: ['.ui-pdp-title', 'h1'],
  },

  // ⚠️ Soporte probable (selectores basados en estructura común, no verificado al 100%)
  'ebay.com': {
    name: 'eBay',
    price: ['.x-price-primary .ux-textspans', '[itemprop="price"]', '.display-price'],
    productName: ['.x-item-title__mainTitle', 'h1.it-ttl'],
  },
  'walmart.com': {
    name: 'Walmart',
    price: ['[itemprop="price"]', '[data-automation="buybox-price"]', '.price-characteristic'],
    productName: ['h1[itemprop="name"]', '#main-title'],
  },
  'walmart.com.mx': {
    name: 'Walmart México',
    price: ['.price-group', '[data-automation="buybox-price"]', '.prod-PriceHero'],
    productName: ['h1.prod-ProductTitle', 'h1'],
  },
  'aliexpress.com': {
    name: 'AliExpress',
    price: ['.product-price-value', '.uniform-banner-box-price'],
    productName: ['h1.product-title-text', 'h1'],
  },
  'shein.com': {
    name: 'SHEIN',
    price: ['.from.original', '.discount-price', '[data-price]'],
    productName: ['.product-intro__head-name', 'h1'],
  },
  'liverpool.com.mx': {
    name: 'Liverpool',
    price: ['.a-price__price--discounted', '.a-price__price', '[data-price]'],
    productName: ['.a-product__information--title', 'h1'],
  },
  'zara.com': {
    name: 'Zara',
    price: ['.money-amount__main', '.price__amount--on-sale', '.price__amount'],
    productName: ['.product-detail-info__header-name', 'h1'],
  },
  'nike.com': {
    name: 'Nike',
    price: ['[data-test="product-price"]', '.product-price', '.css-1emn094'],
    productName: ['h1#pdp_product_title', 'h1'],
  },
  'adidas.com': {
    name: 'Adidas',
    price: ['.gl-price-item', '[data-auto-id="gl-price-item"]'],
    productName: ['h1.name-container', 'h1[data-auto-id="product-title"]'],
  },
};
