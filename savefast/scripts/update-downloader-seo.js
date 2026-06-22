const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const DOWNLOADERS = [
  {
    folder: "instagram-video-downloader",
    name: "Instagram Video",
    title: "Instagram Video Downloader",
    pathName: "instagram-video-downloader",
    blogs: [
      { name: "How to Save Reels in HD", slug: "how-to-download-instagram-reels" },
      { name: "Download Instagram Videos Online", slug: "download-instagram-videos-online" },
      { name: "Save Instagram Stories Anonymously", slug: "how-to-save-instagram-story" },
      { name: "Best Instagram Video Downloader Tools", slug: "best-instagram-video-downloader" },
      { name: "Instagram Reels Curation Guide", slug: "instagram-reels-downloader-guide" }
    ],
    faqs: [
      { q: "Is SaveFast free to use?", a: "Yes, SaveFast is a 100% free web tool. You can download unlimited media without any subscriptions or account registration." },
      { q: "Do I need to login to my Instagram account?", a: "No, you do not need to share your account credentials or passwords. Our tool queries public CDN directories directly." },
      { q: "Can I download private Instagram posts?", a: "To protect user privacy, online scrapers like SaveFast only support posts from public profiles. Private accounts are restricted." },
      { q: "Will the creator know if I download their video?", a: "Never. SaveFast fetches files directly from Meta's content servers anonymously, bypassing user interaction alerts." },
      { q: "Does the downloader reduce quality?", a: "No. SaveFast retrieves the raw, high-bitrate file from the server, downloading it in its original resolution." },
      { q: "Can I download Reels and Stories?", a: "Yes, you can parse public Reels, stories, highlights, and standard feed videos using our downloader page." },
      { q: "What format are the downloaded files?", a: "All extracted videos are saved in a universal MP4 container format compatible with every media player and editor." },
      { q: "Is there a limit on files downloaded?", a: "No, there are no limits. You can parse and download as many public videos as you require." }
    ]
  },
  {
    folder: "instagram-reels-downloader",
    name: "Instagram Reels",
    title: "Instagram Reels Downloader",
    pathName: "instagram-reels-downloader",
    blogs: [
      { name: "Download Reels in HD Guide", slug: "how-to-download-instagram-reels" },
      { name: "Top Downloader Tools Comparison", slug: "best-instagram-video-downloader" },
      { name: "Viral Reels Archiving Guide", slug: "instagram-reels-downloader-guide" },
      { name: "Video Downloaders Comparison Matrix", slug: "social-media-video-downloader-comparison" }
    ],
    faqs: [
      { q: "Does this Reels downloader save background music?", a: "Yes. Unlike the official app which strips tracks due to licenses, SaveFast downloads the Reel with its original soundtrack." },
      { q: "Does it add a watermark to downloaded Reels?", a: "No. SaveFast extracts clean streams directly from CDN servers without adding overlay logos or watermarks." },
      { q: "Is registration or signup required?", a: "No, you can search and download public Instagram Reels completely anonymously without sign-up." },
      { q: "Can I save Reels on my iPhone?", a: "Yes. Open Safari, copy the Reels link, parse it on SaveFast, download the file, and save it to your camera roll via the iOS share sheet." },
      { q: "Does it work on Android?", a: "Yes, it runs seamlessly in all mobile browsers like Chrome, Firefox, and Samsung Internet." },
      { q: "Is SaveFast safe and secure?", a: "Yes, SaveFast uses SSL certificates, handles files serverlessly, and does not require account linkages." },
      { q: "Can I download private Reels?", a: "No, private profile files are locked behind account permissions and cannot be parsed." },
      { q: "Is there a download speed limit?", a: "No. SaveFast does not throttle speeds. Files are downloaded at your maximum network capacity." }
    ]
  },
  {
    folder: "instagram-story-downloader",
    name: "Instagram Story",
    title: "Instagram Story Downloader",
    pathName: "instagram-story-downloader",
    blogs: [
      { name: "Save Instagram Stories Anonymously", slug: "how-to-save-instagram-story" },
      { name: "Best Downloader Tools Review", slug: "best-instagram-video-downloader" },
      { name: "Viral Reels Sourcing Guide", slug: "instagram-reels-downloader-guide" }
    ],
    faqs: [
      { q: "Can I view and download stories anonymously?", a: "Yes. SaveFast accesses public CDN servers directly. Your profile name never shows up on the story's viewer list." },
      { q: "Can I download stories after 24 hours?", a: "Once stories expire on Instagram after 24 hours, they can no longer be retrieved unless saved in the creator's public Highlights." },
      { q: "Can I download public highlights?", a: "Yes. SaveFast supports parsing and downloading active public Highlights from any public profile." },
      { q: "Do I need to sign in with my account?", a: "No login or registration is required, ensuring complete privacy." },
      { q: "Can I save story videos on iPhone?", a: "Yes, use Safari to download the story, and save it via the share sheet to your Camera Roll." },
      { q: "Is it safe to use?", a: "Yes, SaveFast is secure, doesn't store media, and runs purely in your web browser." },
      { q: "Can I download private stories?", a: "No. Private account stories cannot be parsed due to platform authentication walls." },
      { q: "Are files downloaded in HD?", a: "Yes. Files are fetched in their original quality from public content delivery networks." }
    ]
  },
  {
    folder: "facebook-video-downloader",
    name: "Facebook Video",
    title: "Facebook Video Downloader",
    pathName: "facebook-video-downloader",
    blogs: [
      { name: "Download FB Videos Online in HD", slug: "download-facebook-videos-online" },
      { name: "Download Facebook Reels Online", slug: "download-facebook-reels" },
      { name: "Facebook High-Quality Archiving", slug: "facebook-video-downloader-guide" }
    ],
    faqs: [
      { q: "How do I save Facebook videos in HD?", a: "Copy the watch link, paste it into SaveFast, and choose the HD quality option to save the file in 1080p resolution." },
      { q: "Can I extract audio as MP3?", a: "Yes, SaveFast provides an audio download path allowing you to extract trending background soundtracks to high-quality MP3s." },
      { q: "Does it work for private Facebook groups?", a: "No. Online scrapers cannot access media locked within private groups or closed profile accounts." },
      { q: "Is there any limit on downloads?", a: "No. You can download as many public Facebook videos as you require." },
      { q: "Can I download Live stream videos?", a: "Yes, you can download Facebook Live broadcasts after the stream has ended and the creator has posted the recording." },
      { q: "Is login required?", a: "No registration or login is required. Sourcing is completely anonymous." },
      { q: "Does it work on mobile phones?", a: "Yes, SaveFast is fully responsive and compatible with Android Chrome and iOS Safari." },
      { q: "Is SaveFast safe?", a: "Yes, SaveFast uses secure SSL connections, does not require access permissions, and has no popups." }
    ]
  },
  {
    folder: "facebook-reels-downloader",
    name: "Facebook Reels",
    title: "Facebook Reels Downloader",
    pathName: "facebook-reels-downloader",
    blogs: [
      { name: "Download FB Reels Guide", slug: "download-facebook-reels" },
      { name: "Download Facebook Videos in 1080p", slug: "download-facebook-videos-online" },
      { name: "Facebook Curation Best Practices", slug: "facebook-video-downloader-guide" }
    ],
    faqs: [
      { q: "Does the Facebook Reels Downloader save audio?", a: "Yes, all Reels are downloaded with original audio and music tracks synced." },
      { q: "Are downloaded Reels watermarked?", a: "No, files are fetched clean and unmodified from content servers." },
      { q: "Is registration required?", a: "No registration or login is required. You can save Reels anonymously." },
      { q: "Can I download Reels on iPhone?", a: "Yes, use Safari to download the reel, and save it via the share sheet to your Camera Roll." },
      { q: "Does it work on Android?", a: "Yes, runs on all Android devices." },
      { q: "Is SaveFast safe to use?", a: "Yes, our web tool is secure and does not save files." },
      { q: "Can I download private FB Reels?", a: "No, private account files are locked behind account permissions." },
      { q: "Is there a download limit?", a: "No. SaveFast does not throttle speeds. Sourcing is completely unlimited." }
    ]
  },
  {
    folder: "pinterest-video-downloader",
    name: "Pinterest Video",
    title: "Pinterest Video Downloader",
    pathName: "pinterest-video-downloader",
    blogs: [
      { name: "Download Pinterest Videos Guide", slug: "how-to-download-pinterest-videos" },
      { name: "Save Pinterest Images in HD", slug: "save-pinterest-images-hd" },
      { name: "Pinterest Boards Curation Guide", slug: "pinterest-downloader-guide" }
    ],
    faqs: [
      { q: "How do I download Pinterest video pins?", a: "Copy the Pin URL, paste it into SaveFast, and click the Download button to save the MP4 file." },
      { q: "Are files downloaded in HD format?", a: "Yes, we fetch the original uncompressed video files from Pinterest CDN." },
      { q: "Is login required?", a: "No login or registration is required to download public pins." },
      { q: "Does it work on Android?", a: "Yes, compatible with all mobile browsers." },
      { q: "Does it work on iPhone?", a: "Yes, runs on Safari iOS." },
      { q: "Is SaveFast safe?", a: "Yes, fully safe and secure." },
      { q: "Can I download board lists?", a: "No, our downloader only parses individual Pin URLs." },
      { q: "Is there a download speed limit?", a: "No. SaveFast does not throttle speeds. Curation is completely unlimited." }
    ]
  },
  {
    folder: "pinterest-image-downloader",
    name: "Pinterest Image",
    title: "Pinterest Image Downloader",
    pathName: "pinterest-image-downloader",
    blogs: [
      { name: "Save Pinterest Images in HD", slug: "save-pinterest-images-hd" },
      { name: "Download Pinterest Videos Guide", slug: "how-to-download-pinterest-videos" },
      { name: "Pinterest Curation Best Practices", slug: "pinterest-downloader-guide" }
    ],
    faqs: [
      { q: "How do I download Pinterest images in HD?", a: "Copy the Pin URL, paste it into SaveFast, and click download to fetch the original uncompressed image." },
      { q: "Does it bypass image compression?", a: "Yes. Unlike right-clicking thumbnails, SaveFast queries original uncompressed directories." },
      { q: "Is login required?", a: "No login or registration is required." },
      { q: "Does it work on Android?", a: "Yes, optimized for all Android browsers." },
      { q: "Does it work on iPhone?", a: "Yes, fully compatible with iOS Safari." },
      { q: "Is SaveFast safe to use?", a: "Yes, we use secure SSL connections." },
      { q: "Can I save GIFs as well?", a: "Yes, public GIF loops are supported." },
      { q: "Is there a download limit?", a: "No, curation is completely unlimited." }
    ]
  },
  {
    folder: "x-video-downloader",
    name: "X Video",
    title: "X Video Downloader",
    pathName: "x-video-downloader",
    blogs: [
      { name: "Download X Videos Online", slug: "download-x-videos-online" },
      { name: "How to Download Twitter Videos", slug: "how-to-download-twitter-videos" },
      { name: "Twitter/X Media Archiving Guide", slug: "twitter-video-downloader-guide" }
    ],
    faqs: [
      { q: "Does this downloader support X.com links?", a: "Yes. Our tool is fully updated to parse both X.com and Twitter.com link paths." },
      { q: "Can I download Premium videos?", a: "Yes, as long as the post is public, you can download the high-bitrate video file." },
      { q: "Is login required?", a: "No registration or login is required." },
      { q: "Does it work on Android?", a: "Yes, compatible with all mobile browsers." },
      { q: "Does it work on iPhone?", a: "Yes, runs on Safari iOS." },
      { q: "Is SaveFast safe to use?", a: "Yes, fully safe and secure." },
      { q: "Can I save GIFs as well?", a: "Yes, Twitter loop GIFs are saved as standard MP4 files." },
      { q: "Is there a download limit?", a: "No, curation is completely unlimited." }
    ]
  },
  {
    folder: "twitter-video-downloader",
    name: "Twitter Video",
    title: "Twitter Video Downloader",
    pathName: "twitter-video-downloader",
    blogs: [
      { name: "How to Download Twitter Videos", slug: "how-to-download-twitter-videos" },
      { name: "Download X Videos Online", slug: "download-x-videos-online" },
      { name: "Twitter/X Media Curation Guide", slug: "twitter-video-downloader-guide" }
    ],
    faqs: [
      { q: "How do I save Twitter videos?", a: "Copy the tweet URL, paste it into SaveFast, and click download to fetch the MP4 file." },
      { q: "Can I download GIFs?", a: "Yes, Twitter animated GIFs are converted to standard MP4 files." },
      { q: "Is login required?", a: "No login is needed." },
      { q: "Does it work on Android?", a: "Yes, works on all mobile browsers." },
      { q: "Does it work on iPhone?", a: "Yes, fully compatible with Safari iOS." },
      { q: "Is SaveFast safe?", a: "Yes, SaveFast is fully safe and secure." },
      { q: "Can I download private tweets?", a: "No, private account status videos cannot be parsed." },
      { q: "Is there a download limit?", a: "No, curation is completely unlimited." }
    ]
  },
  {
    folder: "threads-video-downloader",
    name: "Threads Video",
    title: "Threads Video Downloader",
    pathName: "threads-video-downloader",
    blogs: [
      { name: "How to Download Threads Videos", slug: "how-to-download-threads-videos" },
      { name: "Best Free Video Downloader Tools", slug: "best-free-video-downloader-tools" },
      { name: "Curation for Content Creators", slug: "how-to-save-social-media-videos" }
    ],
    faqs: [
      { q: "How do I save Threads videos?", a: "Copy the Thread link, paste it into SaveFast, and click download to extract the MP4 file." },
      { q: "Can I download slide carousels?", a: "Yes, all slide photos and videos are parsed and listed individually for download." },
      { q: "Is login required?", a: "No registration or login is required." },
      { q: "Does it work on Android?", a: "Yes, compatible with all mobile browsers." },
      { q: "Does it work on iPhone?", a: "Yes, runs on Safari iOS." },
      { q: "Is SaveFast safe to use?", a: "Yes, fully safe and secure." },
      { q: "Can I download private threads?", a: "No, private profile tracks cannot be parsed." },
      { q: "Is there a download limit?", a: "No, curation is completely unlimited." }
    ]
  },
  {
    folder: "snapchat-video-downloader",
    name: "Snapchat Video",
    title: "Snapchat Video Downloader",
    pathName: "snapchat-video-downloader",
    blogs: [
      { name: "Download Snapchat Videos Guide", slug: "download-snapchat-videos" },
      { name: "Best Free Video Downloader Tools", slug: "best-free-video-downloader-tools" },
      { name: "Web Tools vs Mobile Apps", slug: "download-videos-without-app" }
    ],
    faqs: [
      { q: "Can I download Spotlight videos?", a: "Yes. SaveFast supports parsing and downloading public Spotlight videos in HD formats." },
      { q: "Will the owner know if I download?", a: "No. Sourcing runs anonymously through our server cache without alerts." },
      { q: "Is login required?", a: "No registration or login is required." },
      { q: "Does it work on Android?", a: "Yes, compatible with all mobile browsers." },
      { q: "Does it work on iPhone?", a: "Yes, runs on Safari iOS." },
      { q: "Is SaveFast safe to use?", a: "Yes, fully safe and secure." },
      { q: "Can I download private snaps?", a: "No. Chats and friend snaps are secure and cannot be parsed." },
      { q: "Is there a download limit?", a: "No, curation is completely unlimited." }
    ]
  }
];

function buildFaqsHtml(faqs) {
  let html = '';
  faqs.forEach((faq, index) => {
    html += `
          <div class="glass-card faq-item">
            <button class="faq-header">
              <span style="font-weight: 700;">${faq.q}</span>
              <span class="material-symbols-outlined faq-icon">expand_more</span>
            </button>
            <div class="faq-content">
              ${faq.a}
            </div>
          </div>`;
  });
  return html;
}

function buildBlogsHtml(blogs) {
  let html = '';
  blogs.forEach(blog => {
    html += `<a href="../blog/${blog.slug}.html" class="blog-card-link" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--rounded-full); font-size: 13.5px; font-weight: 700; color: var(--color-primary); text-decoration: none; transition: var(--transition-smooth);">${blog.name} <span class="material-symbols-outlined" style="font-size: 16px;">chevron_right</span></a>`;
  });
  return html;
}

function buildSeoLayout(downloader) {
  const howToUseSteps = [
    { title: "Copy the Video URL Link", desc: "Navigate to the social platform app or web browser interface, locate the specific video you wish to save, tap share and choose 'Copy Link' from options." },
    { title: "Paste URL Link inside SaveFast", desc: `Open the SaveFast ${downloader.name} Downloader page. Paste the link into the URL query field at the top of the page.` },
    { title: "Fetch CDN media file", desc: "Click the Download button. Our parser resolves platform server CDNs in milliseconds, generating high-speed direct download file links." },
    { title: "Save MP4 media locally", desc: "Choose the target resolution container (HD/SD quality) and click the download button to store the file directly to your local gallery." }
  ];

  let stepsHtml = '';
  howToUseSteps.forEach((step, index) => {
    stepsHtml += `
          <div class="glass-card" style="padding: 24px; border-radius: var(--rounded-default); border-color: var(--glass-border); display: flex; flex-direction: column; gap: 8px;">
            <div style="width: 32px; height: 32px; border-radius: var(--rounded-full); background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">${index + 1}</div>
            <h3 style="font-size: 16px; font-weight: 800; color: var(--color-on-surface); margin-top: 4px;">${step.title}</h3>
            <p style="font-size: 13.5px; color: var(--color-on-surface-variant); line-height: 1.5; margin: 0;">${step.desc}</p>
          </div>`;
  });

  const features = [
    { icon: "bolt", title: "Lightning Speeds", desc: "Edge CDN scraper resolving paths in under 2 seconds." },
    { icon: "security", title: "SSL Secure", desc: "Complete security sandbox. Zero device trackers or popups." },
    { icon: "high_quality", title: "Lossless Quality", desc: "Fetch raw streams in original HD (1080p/4K) resolutions." },
    { icon: "devices", title: "Universal Compatibility", desc: "Perfect responsive downloads on PC, Mac, iOS, and Android." }
  ];

  let featuresHtml = '';
  features.forEach(feat => {
    featuresHtml += `
          <div class="glass-card" style="padding: 24px; border-radius: var(--rounded-default); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="background: rgba(168, 85, 247, 0.1); color: var(--color-primary); width: 48px; height: 48px; border-radius: var(--rounded-full); display: flex; align-items: center; justify-content: center; font-size: 24px;">
              <span class="material-symbols-outlined">${feat.icon}</span>
            </div>
            <h3 style="font-size: 16.5px; font-weight: 800; color: var(--color-on-surface);">${feat.title}</h3>
            <p style="font-size: 13px; color: var(--color-on-surface-variant); line-height: 1.5; margin: 0;">${feat.desc}</p>
          </div>`;
  });

  return `
      <ad-slot data-placement="content"></ad-slot>

      <!-- 1. How To Use Section -->
      <section class="reveal" style="margin: 48px auto;">
        <h2 style="font-size: 26px; text-align: center; margin-bottom: 24px; color: var(--color-on-surface);">How To Use ${downloader.name} Downloader 💡</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          ${stepsHtml}
        </div>
      </section>

      <!-- 2. Features Section -->
      <section class="reveal" style="margin: 48px auto;">
        <h2 style="font-size: 26px; text-align: center; margin-bottom: 24px; color: var(--color-on-surface);">Tool Performance Features ⚡</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          ${featuresHtml}
        </div>
      </section>

      <!-- 3. Benefits Section -->
      <section class="reveal" style="margin: 48px auto; line-height: 1.8; color: var(--color-on-surface-variant);">
        <div class="glass-card" style="padding: 32px var(--spacing-sm); border-radius: var(--rounded-lg); border-color: rgba(168, 85, 247, 0.15); background: linear-gradient(135deg, rgba(168, 85, 247, 0.02) 0%, rgba(59, 130, 246, 0.02) 100%);">
          <h2 style="font-size: 24px; color: var(--color-on-surface); margin-bottom: 16px;">Why Sourcing Media with SaveFast is the Premium Choice 🏆</h2>
          <p style="margin-bottom: 16px;">
            SaveFast.in serves as a professional content scraper designed for creators, editors, journalists, and visual researchers. Rather than downloading bloated and tracking-heavy mobile app downloaders, SaveFast runs entirely inside your browser's security sandbox.
          </p>
          <p style="margin-bottom: 0;">
            Our serverless engine matching active file containers directly on requests fetches the raw media streams hosted on public server directories. This preserves files in original, uncompressed HD quality. Additionally, our tool features zero watermark injections, keeping your visual reference libraries crisp and ready for video timelines.
          </p>
        </div>
      </section>

      <!-- 4. FAQ Accordion Section -->
      <section class="reveal faq-container" style="margin: 48px auto;">
        <h2 style="font-size: 26px; text-align: center; margin-bottom: 24px; color: var(--color-on-surface);">Frequently Asked Questions ❓</h2>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${buildFaqsHtml(downloader.faqs)}
        </div>
      </section>

      <!-- 5. Internal Links to Blog Section -->
      <section class="reveal glass-card" style="padding: 32px var(--spacing-sm); border-radius: var(--rounded-lg); text-align: center; border-color: var(--glass-border); margin: 48px auto;">
        <h2 style="font-size: 22px; color: var(--color-on-surface); margin-bottom: 12px;">Official Curation Guides &amp; Tutorials 📖</h2>
        <p style="font-size: 14.5px; color: var(--color-on-surface-variant); margin-bottom: 20px; max-width: 650px; margin-left: auto; margin-right: auto;">
          Study platform algorithms, video format comparisons, and expert curation tips inside our official blog. Select a guide below:
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
          ${buildBlogsHtml(downloader.blogs)}
        </div>
      </section>

      <!-- 6. Related Tools Component -->
      <related-tools root-path="../"></related-tools>
  `;
}

function updateDownloaderPage(downloader) {
  const filePath = path.join(ROOT_DIR, downloader.folder, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${filePath} does not exist! Skipping.`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // --- Head Schemas Update ---
  // Create Breadcrumb JSON-LD
  const breadcrumbObj = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://savefast.in" },
      { "@type": "ListItem", "position": 2, "name": downloader.title, "item": `https://savefast.in/${downloader.pathName}` }
    ]
  };

  // Create FAQ JSON-LD
  const faqSchemaList = downloader.faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }));
  const faqObj = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqSchemaList
  };

  // Strip existing JSON-LD scripts in the head to avoid clutter
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');

  // Add the newly compiled JSON-LD schemas back into the Head block
  const headSchemaStr = `
  <script type="application/ld+json">${JSON.stringify(breadcrumbObj, null, 2)}</script>
  <script type="application/ld+json">${JSON.stringify(faqObj, null, 2)}</script>
  `;

  // Inject schemas in head
  const headMatch = /<\/head>/i;
  html = html.replace(headMatch, `${headSchemaStr}\n</head>`);

  // --- Content Layout Injection ---
  // We want to replace everything between <div id="downloader-result-container"></div>
  // and <site-footer root-path="../"></site-footer>
  const splitStart = '<div id="downloader-result-container"></div>';
  const splitEnd = '<site-footer root-path="../"></site-footer>';

  const startIndex = html.indexOf(splitStart);
  const endIndex = html.indexOf(splitEnd);

  if (startIndex === -1 || endIndex === -1) {
    console.error(`Unable to find layout anchors in ${downloader.folder}/index.html!`);
    return;
  }

  // Inject the rich SEO content block
  const seoLayout = buildSeoLayout(downloader);
  const updatedHtml = html.substring(0, startIndex + splitStart.length) + seoLayout + html.substring(endIndex);

  // Write changes back to the filesystem
  fs.writeFileSync(filePath, updatedHtml, 'utf8');
  console.log(`Updated SEO layout and schemas in: ${downloader.folder}/index.html`);
}

// Execute updates
console.log("Updating downloader pages with premium SEO content & JSON-LD schemas...");
DOWNLOADERS.forEach(dl => {
  updateDownloaderPage(dl);
});
console.log("Downloader SEO updates completed successfully!");
