const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const HTML_FILES = [
  'index.html',
  'about.html',
  'blog.html',
  'contact.html',
  'dmca.html',
  'privacy.html',
  'terms.html',
  'admin/index.html',
  'facebook-reels-downloader/index.html',
  'facebook-video-downloader/index.html',
  'instagram-reels-downloader/index.html',
  'instagram-story-downloader/index.html',
  'instagram-video-downloader/index.html',
  'pinterest-image-downloader/index.html',
  'pinterest-video-downloader/index.html',
  'snapchat-video-downloader/index.html',
  'threads-video-downloader/index.html',
  'twitter-video-downloader/index.html',
  'x-video-downloader/index.html'
];

const GOOGLE_TAG = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZG28RL37JV"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ZG28RL37JV');
  </script>
`.trim();

function addAnalyticsToHtml(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  let html = fs.readFileSync(fullPath, 'utf8');

  // Check if tag already exists
  if (html.includes('G-ZG28RL37JV')) {
    console.log(`Analytics tag already exists in: ${filePath}`);
    return;
  }

  // 1. Inject immediately after <head>
  const headMatch = /<head[^>]*>/i;
  const match = html.match(headMatch);
  if (match) {
    const insertIndex = match.index + match[0].length;
    html = html.slice(0, insertIndex) + '\n  ' + GOOGLE_TAG + html.slice(insertIndex);
  }

  // 2. Add preconnects for Google Analytics to prevent network latency
  const targetPreconnect = '<link rel="preconnect" href="https://fonts.googleapis.com">';
  const newPreconnects = `
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://www.google-analytics.com">
  `.trim();

  if (html.includes(targetPreconnect) && !html.includes('https://www.google-analytics.com')) {
    html = html.replace(targetPreconnect, newPreconnects + '\n  ' + targetPreconnect);
  }

  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`Injected Google Analytics in: ${filePath}`);
}

// Process HTML files
HTML_FILES.forEach(file => {
  try {
    addAnalyticsToHtml(file);
  } catch (err) {
    console.error(`Failed to inject analytics in: ${file}`, err);
  }
});

// Update vercel.json Content-Security-Policy (CSP) to allow Google Analytics
const vercelJsonPath = path.join(ROOT_DIR, 'vercel.json');
try {
  let vercelJson = fs.readFileSync(vercelJsonPath, 'utf8');
  let config = JSON.parse(vercelJson);

  // Find CSP header in config
  let updated = false;
  if (config.headers && config.headers.length > 0) {
    config.headers.forEach(route => {
      if (route.headers && route.headers.length > 0) {
        route.headers.forEach(header => {
          if (header.key === 'Content-Security-Policy') {
            let csp = header.value;
            
            // Add Googletagmanager to script-src
            if (!csp.includes('https://www.googletagmanager.com')) {
              csp = csp.replace("script-src 'self'", "script-src 'self' https://www.googletagmanager.com");
            }
            
            // Add Google Analytics domains to connect-src
            if (!csp.includes('https://www.google-analytics.com')) {
              csp = csp.replace("connect-src 'self'", "connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net");
            }

            // Add Google Analytics domains to img-src (for tracking pixel requests)
            if (!csp.includes('https://www.google-analytics.com')) {
              csp = csp.replace("img-src 'self'", "img-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net");
            }
            
            header.value = csp;
            updated = true;
          }
        });
      }
    });
  }

  if (updated) {
    fs.writeFileSync(vercelJsonPath, JSON.stringify(config, null, 2), 'utf8');
    console.log("Updated vercel.json CSP rules to allow Google Analytics.");
  }
} catch (err) {
  console.error("Failed to update vercel.json CSP:", err);
}

// Update firebase.json Content-Security-Policy (CSP) to allow Google Analytics
const firebaseJsonPath = path.join(ROOT_DIR, 'firebase.json');
try {
  let firebaseJson = fs.readFileSync(firebaseJsonPath, 'utf8');
  let config = JSON.parse(firebaseJson);

  let updated = false;
  const hostingConfigs = Array.isArray(config.hosting) ? config.hosting : (config.hosting ? [config.hosting] : []);
  hostingConfigs.forEach(hosting => {
    if (hosting.headers && hosting.headers.length > 0) {
      hosting.headers.forEach(route => {
        if (route.headers && route.headers.length > 0) {
          route.headers.forEach(header => {
            if (header.key === 'Content-Security-Policy') {
              let csp = header.value;
              
              // Add Googletagmanager to script-src
              if (!csp.includes('https://www.googletagmanager.com')) {
                csp = csp.replace("script-src 'self'", "script-src 'self' https://www.googletagmanager.com");
              }
              
              // Add Google Analytics domains to connect-src
              if (!csp.includes('https://www.google-analytics.com')) {
                csp = csp.replace("connect-src 'self'", "connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net");
              }

              // Add Google Analytics domains to img-src (for tracking pixel requests)
              if (!csp.includes('https://www.google-analytics.com')) {
                csp = csp.replace("img-src 'self'", "img-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net");
              }
              
              header.value = csp;
              updated = true;
            }
          });
        }
      });
    }
  });

  if (updated) {
    fs.writeFileSync(firebaseJsonPath, JSON.stringify(config, null, 2), 'utf8');
    console.log("Updated firebase.json CSP rules to allow Google Analytics.");
  }
} catch (err) {
  console.error("Failed to update firebase.json CSP:", err);
}

