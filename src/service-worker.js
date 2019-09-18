import { files, shell } from '@sapper/service-worker';
import pkg from '../package.json';

const VERSION = '0.1';
const STATIC_CACHE_ID = `cache-static:${VERSION}`;

const MAIN_FILES = [ 'main', 'index', 'projects', 'blog', 'offline' ];

const staticFiles = [].concat(files).filter((f) => {
  return (
    f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.css')
    || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.jpg')
    || f.endsWith('.pdf')
  );
});

// Creates an array of files: [
//   'index.html', 'index.index.js', ...
// ]
// This array contains all default pages, without including the blog posts
// to reduce network requests on startup.
const mainFiles = MAIN_FILES
  .map((f) => '/' + f + '.html')
  .concat(
    MAIN_FILES
    .map((f) => shell.find((e) => e.match(new RegExp(`/${f}.?(\\w*).js$`))))
    .filter((e) => e !== -1)
  );

// `files` is an array of everything in the `static` directory
const cached = new Set(staticFiles);

self.addEventListener('install', event => {
  console.log('INSTALL');
  console.log(shell);
  console.log(mainFiles);
	return event.waitUntil(
		caches
			.open(STATIC_CACHE_ID)
			.then(cache => cache.addAll(staticFiles))
			.then(() => {
				self.skipWaiting();
			})
	);
});

self.addEventListener('activate', event => {
  console.log('ACTIVATE');

	return event.waitUntil(
		caches.keys().then(async keys => {
			// delete old caches
			for (const key of keys) {
				if (key !== STATIC_CACHE_ID) await caches.delete(key);
			}
			self.clients.claim();
		})
	);
});

self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET' || event.request.headers.has('range')) {
    return;
  }

  const url = new URL(event.request.url);

	// Don't try to handle e.g. data: URIs.
	if (!url.protocol.startsWith('http')) {
    return;
  }

	// Ignores dev server requests.
  if (url.hostname === self.location.hostname
      && url.port !== self.location.port) {
    return;
  }

  console.log(url.pathname);

	// Always serve static files and bundler-generated assets from cache
	if (url.host === self.location.host && cached.has(url.pathname)) {
		event.respondWith(caches.match(event.request));
		return;
	}

	if (event.request.cache === 'only-if-cached') return;

	// for everything else, try the network first, falling back to
	// cache if the user is offline. (If the pages never change, you
	// might prefer a cache-first approach to a network-first one.)
	event.respondWith(
		caches
			.open(`offline:${VERSION}`)
			.then(async cache => {
				try {
					const response = await fetch(event.request);
					cache.put(event.request, response.clone());
					return response;
				} catch(err) {
					const response = await cache.match(event.request);
					if (response) return response;

					return caches.match('/offline.html');
				}
			})
	);
});
