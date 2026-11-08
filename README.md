# ASFALTO — Tienda de calzado urbano (demo)

Tienda en línea estática (HTML, CSS y JS puros, sin dependencias) con catálogo, ficha de producto, favoritos, carrito y un panel de administración de demostración. Precios en COP y tallas colombianas.

- `/` — tienda
- `/admin/` — panel: resumen, productos (fotos, descripción, materiales, precio, oferta, stock, tallas, colores), pedidos, contenido de la página y apariencia (marca y color)

## Ejecutar en local

```bash
python -m http.server 5500
```

Abre http://localhost:5500 y http://localhost:5500/admin/

## Publicar con GitHub Pages

Settings → Pages → Deploy from a branch → `main` / root.

## Importante (demo)

- El panel guarda los cambios en el `localStorage` del navegador de quien edita: otros visitantes ven los datos de `data.js`. Para que los cambios se vean para todos, exporta el JSON desde el panel y reemplaza los datos en `data.js`, o conecta un backend o CMS.
- El panel no tiene login. En producción debe ir detrás de autenticación.
- El pago es simulado; falta conectar una pasarela (Wompi, PayU, Mercado Pago…).
- Los zapatos son ilustraciones SVG generadas en `shoes.js`; cualquier producto puede usar una foto real desde el panel.
