const CACHE_NAME = "omega-2.1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Instalación
self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

});

// Activación
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {
                        console.log("Eliminando caché:", key);
                        return caches.delete(key);
                    }

                })

            );

        }).then(() => self.clients.claim())

    );

});

// Peticiones
self.addEventListener("fetch", event => {

    // Solo cachea peticiones GET
    if (event.request.method !== "GET") return;

    event.respondWith(

        fetch(event.request)

            .then(response => {

                // Guarda una copia en caché
                const copia = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, copia));

                return response;

            })

            .catch(() => {

                // Si no hay internet, intenta responder desde caché
                return caches.match(event.request);

            })

    );

});