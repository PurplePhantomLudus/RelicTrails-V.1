const CACHE="relic-trails-v1"

const FILES=[
"/",
"/index.html",
"/styles.css",
"/script.js"
]

self.addEventListener("install",e=>{
e.waitUntil(
caches.open(CACHE)
.then(cache=>cache.addAll(FILES))
)
})

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request)
.then(res=>res || fetch(e.request))
)
})