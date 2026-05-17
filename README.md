# 🛒 Karrito

Extensión de Chrome que funciona como un carrito de compras global — guarda productos de cualquier tienda online en un solo lugar.

## Características

- Agrega productos desde cualquier página web
- Organiza por categorías personalizadas
- Calcula el total estimado de tu carrito
- Funciona en cualquier tienda online (con selectores genéricos)
- Detección optimizada para tiendas populares

## Tiendas soportadas

### ✅ Soporte confirmado

| Tienda | Dominio |
|--------|---------|
| Amazon | amazon.com |
| Amazon México | amazon.com.mx |
| Mercado Libre MX | mercadolibre.com.mx |
| Mercado Libre AR | mercadolibre.com.ar |
| Mercado Libre CO | mercadolibre.com.co |

### ⚠️ Soporte probable

Estas tiendas tienen selectores configurados pero no han sido verificados al 100%:

| Tienda | Dominio |
|--------|---------|
| eBay | ebay.com |
| Walmart | walmart.com |
| Walmart México | walmart.com.mx |
| AliExpress | aliexpress.com |
| SHEIN | shein.com |
| Liverpool | liverpool.com.mx |
| Zara | zara.com |
| Nike | nike.com |
| Adidas | adidas.com |

> Para tiendas no listadas, Karrito usa selectores genéricos (`[itemprop="price"]`, `.price`, `og:title`, etc.) que funcionan en la mayoría de sitios.

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/damkandev/karrito.git
   ```
2. Abre `chrome://extensions/` en tu navegador
3. Activa el **Modo desarrollador** (esquina superior derecha)
4. Haz clic en **Cargar extensión sin empaquetar**
5. Selecciona la carpeta del proyecto

## Uso

1. Navega a cualquier tienda online
2. Haz clic en el ícono de Karrito o usa el botón inyectado junto al botón de compra
3. Organiza tus productos por categorías desde la pestaña "Categorías"

## Contribuir: agregar una tienda nueva

Agregar soporte para una tienda es muy sencillo. Solo edita `stores.js`:

```js
// stores.js
const KARRITO_STORES = {
  // ... tiendas existentes ...

  'mitienda.com': {
    name: 'Mi Tienda',
    price: ['.selector-precio', '#otro-selector-precio'],
    productName: ['.selector-nombre', 'h1.titulo'],
  },
};
```

### Pasos:

1. Abre la página de un producto en la tienda
2. Usa las DevTools (F12 → Inspector) para encontrar los selectores CSS del **precio** y **nombre**
3. Agrega una entrada en `stores.js` con el hostname (sin `www.`)
4. Los selectores se prueban en orden — pon el más específico primero
5. Abre un PR con tu cambio

### Tips:

- Usa `[itemprop="price"]` si la tienda usa datos estructurados
- Prueba con varios productos para asegurarte de que los selectores son consistentes
- Si el precio está en un atributo (`data-price`, `content`), el sistema lo extrae automáticamente

## Tecnologías

- Chrome Extensions Manifest V3
- JavaScript vanilla
- Chrome Storage API

## Licencia

[MIT](LICENSE)
