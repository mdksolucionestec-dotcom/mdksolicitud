# Requerimientos · M Dreieck

App web para solicitudes de **viáticos**, **salida de almacén**, **compras** y **lista de materiales y costos**.
Funciona sin internet y se instala en el celular como una app.

- App: https://mdksolucionestec-dotcom.github.io/mdksolicitud/
- Backend: Google Apps Script (hoja *APP SOLIICTUDES GENERAL*)

## Flujo de viáticos

1. El solicitante (o alguien a su nombre) captura el viaje en la app.
2. Costos recibe un correo con el formato preliminar y el botón **Capturar importe** (no necesita la app).
3. Los autorizadores del área (hoja *Areas*) autorizan con su PIN en la app.
4. El formato oficial con firmas electrónicas y QR se envía a costos, RH, atención operativa y cxp1.
5. Cuentas por pagar puede marcar la dispersión desde el botón del correo.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página principal |
| `app.js` | Toda la lógica. La URL del backend está en `CONFIG.API` |
| `styles.css` | Diseño |
| `sw.js` | Guarda la app en el teléfono para abrirla sin internet |
| `manifest.webmanifest`, `icon-*.png` | Instalación como app |

## Publicar cambios

1. Sube los archivos modificados a la rama `main`.
2. Si cambiaste `app.js` o `styles.css`, sube también `sw.js` cambiando `VERSION` (por ejemplo `req-v2`).
   Así los teléfonos descargan la versión nueva.

## Instalar en el celular

- **Android (Chrome):** abre la app → menú ⋮ → *Instalar app* o *Agregar a pantalla principal*.
- **iPhone (Safari):** abre la app → botón Compartir → *Agregar a inicio*.
