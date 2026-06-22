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
  'x-video-downloader/index.html',
  'blog/how-to-download-instagram-reels.html',
  'blog/download-instagram-videos-online.html',
  'blog/how-to-save-instagram-story.html',
  'blog/best-instagram-video-downloader.html',
  'blog/download-facebook-videos-online.html',
  'blog/download-facebook-reels.html',
  'blog/how-to-download-pinterest-videos.html',
  'blog/save-pinterest-images-hd.html',
  'blog/how-to-download-twitter-videos.html',
  'blog/download-x-videos-online.html',
  'blog/how-to-download-threads-videos.html',
  'blog/download-snapchat-videos.html',
  'blog/best-free-video-downloader-tools.html',
  'blog/how-to-save-social-media-videos.html',
  'blog/download-videos-without-app.html',
  'blog/instagram-reels-downloader-guide.html',
  'blog/facebook-video-downloader-guide.html',
  'blog/pinterest-downloader-guide.html',
  'blog/twitter-video-downloader-guide.html',
  'blog/social-media-video-downloader-comparison.html'
];

const CRITICAL_CSS = `
  :root {
    --color-background: #020617;
    --color-surface: rgba(10, 15, 30, 0.4);
    --color-on-surface: #f3f0fa;
    --color-on-surface-variant: #b0aec3;
    --color-primary: #a855f7;
    --color-secondary: #3b82f6;
    --color-tertiary: #06b6d4;
    --color-background-solid: #020617;
    --color-on-background: #f3f0fa;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --rounded-default: 0.75rem;
    --rounded-lg: 1.5rem;
    --rounded-xl: 2rem;
    --rounded-full: 9999px;
    --spacing-sm: 16px;
    --spacing-lg: 48px;
    --spacing-xl: 80px;
    --container-max: 1200px;
    --gutter: 24px;
    --glass-bg: rgba(13, 18, 38, 0.45);
    --glass-border: rgba(255, 255, 255, 0.07);
    --glass-blur: 20px;
    --transition-smooth: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    --aurora-purple: rgba(168, 85, 247, 0.22);
    --aurora-indigo: rgba(99, 102, 241, 0.25);
    --aurora-cyan: rgba(6, 182, 212, 0.18);
    --aurora-blend: screen;
    --aurora-blur: 150px;
  }
  html.light {
    --color-background: #ffffff;
    --color-surface: rgba(255, 255, 255, 0.65);
    --color-on-surface: #0f111a;
    --color-on-surface-variant: #5c5f70;
    --color-primary: #7c3aed;
    --color-secondary: #2563eb;
    --color-tertiary: #0891b2;
    --color-background-solid: #ffffff;
    --color-on-background: #0f111a;
    --glass-bg: rgba(255, 255, 255, 0.45);
    --glass-border: rgba(15, 23, 42, 0.06);
    --glass-blur: 16px;
    --aurora-purple: rgba(168, 85, 247, 0.08);
    --aurora-indigo: rgba(99, 102, 241, 0.1);
    --aurora-cyan: rgba(6, 182, 212, 0.06);
    --aurora-blend: normal;
    --aurora-blur: 130px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--font-sans);
    background-color: var(--color-background);
    color: var(--color-on-background);
    overflow-x: hidden;
    line-height: 1.5;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .container {
    width: 100%;
    max-width: var(--container-max);
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--gutter);
    padding-right: var(--gutter);
  }
  header { position: fixed; top: 0; left: 0; width: 100%; z-index: 100; }
  main { flex-grow: 1; padding-top: 100px; }
  .hero-section {
    position: relative;
    min-height: 480px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: calc(var(--spacing-xl) + 20px) 0 var(--spacing-lg);
    z-index: 2;
  }
  .gradient-text {
    background: linear-gradient(135deg, #f3e8ff 0%, var(--color-primary) 30%, var(--color-secondary) 70%, #c084fc 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    border-radius: var(--rounded-lg);
  }
  .hidden { display: none !important; }
  .luxury-bg-container {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -2; overflow: hidden; background-color: var(--color-background-solid);
  }
  .aurora-blob {
    position: absolute;
    width: 80vw;
    height: 80vw;
    max-width: 900px;
    max-height: 900px;
    border-radius: 50%;
    filter: blur(var(--aurora-blur));
    mix-blend-mode: var(--aurora-blend);
    pointer-events: none;
    opacity: 1;
    will-change: transform;
  }
  .blob-purple {
    background: radial-gradient(circle, var(--aurora-purple) 0%, transparent 70%);
    top: -15%;
    left: -10%;
    animation: float-blob-1 45s ease-in-out infinite alternate;
  }
  .blob-blue {
    background: radial-gradient(circle, var(--aurora-indigo) 0%, transparent 70%);
    bottom: -15%;
    right: -10%;
    animation: float-blob-2 50s ease-in-out infinite alternate;
  }
  .blob-cyan {
    background: radial-gradient(circle, var(--aurora-cyan) 0%, transparent 70%);
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: float-blob-3 40s ease-in-out infinite alternate;
  }
  .static-stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.85), transparent),
      radial-gradient(1.5px 1.5px at 24% 35%, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 38% 65%, rgba(255,255,255,0.8), transparent),
      radial-gradient(2px 2px at 55% 25%, rgba(255,255,255,0.9), transparent),
      radial-gradient(1px 1px at 72% 78%, rgba(255,255,255,0.85), transparent),
      radial-gradient(1.5px 1.5px at 85% 45%, rgba(255,255,255,0.75), transparent),
      radial-gradient(1px 1px at 93% 15%, rgba(255,255,255,0.8), transparent),
      radial-gradient(2px 2px at 80% 85%, rgba(255,255,255,0.9), transparent),
      radial-gradient(1.5px 1.5px at 48% 72%, rgba(255,255,255,0.75), transparent),
      radial-gradient(1px 1px at 64% 12%, rgba(255,255,255,0.85), transparent);
    background-size: 400px 400px;
    opacity: 0.12;
    pointer-events: none;
  }
  html.light .static-stars {
    opacity: 0;
  }
  ad-slot { display: block; width: 100%; margin: 16px 0; }
  .ad-placement-header { min-height: 90px; }
  .ad-placement-content { min-height: 250px; }
  .ad-placement-sidebar { min-height: 300px; }
  .ad-placement-sticky-bottom { min-height: 90px; }
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
  .reveal.active { opacity: 1; transform: translateY(0); }
  html.light .glass-card {
    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02);
  }
  html.light .glass-card:hover {
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.06), 0 0 15px rgba(124, 58, 237, 0.05);
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin: 64px auto;
  }
  @media (min-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .stat-item-card {
    text-align: center;
    padding: 32px var(--spacing-sm);
    position: relative;
    overflow: hidden;
  }
  .stat-item-card .stat-number {
    font-size: clamp(32px, 4.5vw, 48px);
    font-weight: 900;
    line-height: 1;
    margin-bottom: 6px;
    background: linear-gradient(135deg, #ffffff 30%, var(--color-primary) 70%, var(--color-secondary) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  html.light .stat-item-card .stat-number {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .stat-item-card .stat-label {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-on-surface-variant);
  }
`;

function optimizeHtmlFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  let html = fs.readFileSync(fullPath, 'utf8');

  // Determine path depth
  const isSubfolder = filePath.includes('/');
  const isSecondLevel = filePath.split('/').length > 2; // e.g. for subfolders
  const depthPrefix = isSubfolder ? '../' : './';
  
  // 0a. Self-healing cleanup of previously injected items to prevent duplication/bloat
  html = html.replace(/<link rel="preconnect" href="https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|api\.savefast\.in|us-central1-savefast-45e97\.cloudfunctions\.net)"[^>]*>\s*/gi, '');
  html = html.replace(/<link rel="preload" href="[^"]*fonts\/(Inter-Variable|MaterialSymbolsOutlined)\.woff2"[^>]*>\s*/gi, '');
  html = html.replace(/<script>\s*\(function\(\)\s*\{\s*var t = localStorage\.getItem\('savefast-theme'\)[^]*?<\/script>\s*/gi, '');
  html = html.replace(/<style>\s*:root\s*\{[^]*?<\/style>\s*/gi, '');

  // 0b. Remove all styles.css references (preloads, noscripts, and normal links) to avoid duplicates
  html = html.replace(/<link rel="preload" href="[^"]*css\/styles\.css"[^>]*>\s*/gi, '');
  html = html.replace(/<link rel="stylesheet" href="[^"]*css\/styles\.css"[^>]*>\s*/gi, '');
  html = html.replace(/<noscript>\s*<link rel="stylesheet" href="[^"]*css\/styles\.css">\s*<\/noscript>\s*/gi, '');
  html = html.replace(/<noscript>\s*<\/noscript>\s*/gi, '');
  html = html.replace(/<noscript>/gi, '').replace(/<\/noscript>/gi, '');

  // 0c. Re-insert a single clean stylesheet link right before </head> to let the async step process it
  html = html.replace('</head>', `  <link rel="stylesheet" href="${depthPrefix}css/styles.css">\n</head>`);

  console.log(`Optimizing: ${filePath} (Subfolder: ${isSubfolder})`);

  // 1. Remove Google Fonts / Material Symbols stylesheet link
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^>]*" rel="stylesheet">/gi, '');

  // 2. Preconnect links
  const preconnects = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://api.savefast.in">
  <link rel="preconnect" href="https://us-central1-savefast-45e97.cloudfunctions.net">
  `;

  // 3. Preload self-hosted fonts (relative path based on depthPrefix)
  const fontPreloads = `
  <link rel="preload" href="${depthPrefix}fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${depthPrefix}fonts/MaterialSymbolsOutlined.woff2" as="font" type="font/woff2" crossorigin>
  `;

  // 4. Inline theme switcher script (prevents theme flash)
  const themeDetector = `
  <script>
    (function() {
      var t = localStorage.getItem('savefast-theme') || 'dark';
      document.documentElement.className = t;
    })();
  </script>
  `;

  // 5. Critical CSS block
  const inlineStyles = `
  <style>${CRITICAL_CSS}</style>
  `;

  // Inject these in the head right after <head> or <meta viewport>
  const headMatch = /<head[^>]*>/i;
  const match = html.match(headMatch);
  if (match) {
    const insertIndex = match.index + match[0].length;
    html = html.slice(0, insertIndex) + preconnects + fontPreloads + themeDetector + inlineStyles + html.slice(insertIndex);
  }

  // 6. Make main stylesheet load asynchronously
  // Find <link rel="stylesheet" href="(.*)css/styles.css">
  const stylesRegex = /<link rel="stylesheet" href="([^"]*)css\/styles\.css">/i;
  const stylesMatch = html.match(stylesRegex);
  if (stylesMatch) {
    const href = stylesMatch[1] + 'css/styles.css';
    const asyncStyles = `
  <link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="${href}"></noscript>
    `.trim();
    html = html.replace(stylesRegex, asyncStyles);
  }

  // 7. Make theme.js defer
  const themeJsRegex = /<script src="([^"]*)js\/theme\.js"><\/script>/i;
  html = html.replace(themeJsRegex, '<script src="$1js/theme.js" defer></script>');

  // 7b. Make favicon path relative to handle file:// and subdirectory routing
  html = html.replace(/href="\/favicon\.png"/gi, `href="${depthPrefix}favicon.png"`);

  // 8. Optimize img tags (loading="lazy", decoding="async", explicit sizes, and webp parameters for Unsplash)
  html = html.replace(/<img([^>]*)>/gi, (match, attrs) => {
    let newAttrs = attrs;

    // Optimize Unsplash source parameters for WebP format and compression
    if (newAttrs.includes('images.unsplash.com')) {
      newAttrs = newAttrs.replace(/q=\d+/g, 'q=60'); // Reduce compression quality to 60
      if (!newAttrs.includes('fm=webp')) {
        newAttrs = newAttrs.replace(/auto=format/g, 'auto=format&fm=webp');
      }
    }

    // Set dimensions for testimonial avatars
    if (newAttrs.includes('reviewer-avatar')) {
      if (!newAttrs.includes('width=')) {
        newAttrs += ' width="44"';
      }
      if (!newAttrs.includes('height=')) {
        newAttrs += ' height="44"';
      }
    }

    // Set dimensions for blog spotlight bio photo
    if (newAttrs.includes('Sarah Connor') || newAttrs.includes('Sarah Jenkins')) {
      if (!newAttrs.includes('width=')) {
        newAttrs += ' width="56"';
      }
      if (!newAttrs.includes('height=')) {
        newAttrs += ' height="56"';
      }
    }

    // Set dimensions for blog spotlight main image
    if (filePath === 'blog.html' && newAttrs.includes('spotlight-image-container') || newAttrs.includes('social media platforms showcase')) {
      if (!newAttrs.includes('width=')) {
        newAttrs += ' width="1200"';
      }
      if (!newAttrs.includes('height=')) {
        newAttrs += ' height="675"';
      }
    }

    // Set dimensions for about page server room image
    if (filePath === 'about.html' && newAttrs.includes('Tech Server Infrastructure')) {
      if (!newAttrs.includes('width=')) {
        newAttrs += ' width="800"';
      }
      if (!newAttrs.includes('height=')) {
        newAttrs += ' height="320"';
      }
    }

    // Inject loading="lazy" if not present
    if (!newAttrs.includes('loading=')) {
      newAttrs += ' loading="lazy"';
    }

    // Inject decoding="async" if not present
    if (!newAttrs.includes('decoding=')) {
      newAttrs += ' decoding="async"';
    }

    return `<img${newAttrs}>`;
  });

  fs.writeFileSync(fullPath, html, 'utf8');
}

HTML_FILES.forEach(file => {
  try {
    optimizeHtmlFile(file);
  } catch (err) {
    console.error(`Failed to process: ${file}`, err);
  }
});

console.log("HTML Optimization completed successfully!");
