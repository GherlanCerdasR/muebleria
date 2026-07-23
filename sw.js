/* Subí este número cada vez que cambiés el código.
   Si no, el teléfono sigue mostrando la versión vieja. */
const VERSION = "v1";
const CACHE = `muebleria-${VERSION}`;

/* Sin estos el app no funciona */
const ESENCIALES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json"
];

/* Si alguna falta, el app igual sirve (solo se ve más simple) */
const OPCIONALES = [
  "./img/header-inventario.jpg",
  "./img/header-compras.jpg",
  "./img/header-ventas.jpg",
  "./img/header-resumen.jpg",
  "./img/saldo-bg.jpg",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // Los esenciales sí o sí: si uno falla, la instalación falla
      await cache.addAll(ESENCIALES);
      // Los opcionales uno por uno, para que uno faltante no tumbe todo
      await Promise.all(
        OPCIONALES.map(url =>
          cache.add(url).catch(() => console.warn("No se pudo guardar:", url))
        )
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(nombres => Promise.all(
        nombres.filter(n => n !== CACHE).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(guardado => {
      if (guardado) return guardado;
      return fetch(e.request).then(respuesta => {
        if (respuesta && respuesta.status === 200) {
          const copia = respuesta.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return respuesta;
      }).catch(() => caches.match("./index.html"));
    })
  );
});