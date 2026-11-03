# Velada · Diario

Diario personal nocturno en un solo archivo (`index.html`, Tailwind + JavaScript).

- **Tres preguntas cada noche**, tomadas al azar de un banco de 50 (siempre una de gratitud, en oro).
  Si una no te dice nada, pulsa **Otra**.
- **Calendario de logros**: las noches que escribiste brillan en oro; toca cualquier noche pasada para leerla.
- **Privado**: todo se cifra en el dispositivo (AES-GCM 256, clave derivada con PBKDF2-SHA-256,
  310 000 iteraciones) y se guarda en `localStorage`. Nada sale del teléfono salvo que exportes.
- **Exportar mi diario (JSON)**: botón dorado arriba a la derecha. Legible o cifrado; se importa desde Ajustes.
- **Dos pieles**: interruptor iOS / M3 arriba a la izquierda (iOS Cupertino o Android Material).
  Gestos: deslizar desde el borde izquierdo para volver, arrastrar hojas hacia abajo, deslizar el calendario.

> Si olvidas la clave no hay forma de recuperar las entradas. Exporta una copia de vez en cuando.

## Instalar en iPhone / iPad (GitHub Pages)
1. Crea un repositorio vacío llamado `velada` en GitHub.
2. Desde esta carpeta:
   ```
   git remote add origin https://github.com/<tu-usuario>/velada.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Branch: `main` / `(root)` → Save**. En un minuto la app estará en
   `https://<tu-usuario>.github.io/velada/`.
4. En el iPhone abre esa dirección en **Safari** → botón Compartir → **Añadir a pantalla de inicio**.
   Se abre a pantalla completa y funciona sin conexión.

Cada vez que cambies `index.html`, sube la versión de `CACHE` en `sw.js` para que los teléfonos reciban la nueva.

## Android
Ver `../velada-apk/README.md` (APK con Capacitor). También sirve abrir la página de GitHub Pages en
Chrome → menú → **Instalar app**.

## Probar en la computadora
```
node tools/serve.js 8775
```
y abre http://localhost:8775 (el cifrado necesita https o localhost).

## Herramientas
- `tools/make-icons.js`: genera los iconos (y los de Android si existe `../velada-apk`).
- `tools/build-artifact.js`: genera `artifact.html` para publicarlo como Artifact de Claude.
