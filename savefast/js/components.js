class SiteHeader extends HTMLElement {
connectedCallback() {
this.render();
this.setupListeners();
this.updateActiveThemeIcon();
window.addEventListener('theme-changed', () => this.updateActiveThemeIcon());
this.setupAnnouncementBanner();
this.setupDynamicPadding();
}
render() {
const rootPath = this.getAttribute('root-path') || '../';
this.innerHTML = `
<header class="fixed top-0 w-full z-50 header-luxury">
<div id="announcement-banner-container"></div>
<nav class="container nav-luxury">
<a href="${rootPath}index.html" class="logo-luxury">
Save<span class="gradient-text">Fast</span>
</a>
<!-- Desktop Navigation -->
<div class="desktop-nav">
<a class="nav-link" href="${rootPath}instagram-video-downloader/index.html">Instagram</a>
<a class="nav-link" href="${rootPath}facebook-video-downloader/index.html">Facebook</a>
<a class="nav-link" href="${rootPath}pinterest-video-downloader/index.html">Pinterest</a>
<a class="nav-link" href="${rootPath}x-video-downloader/index.html">X / Twitter</a>
<a class="nav-link" href="${rootPath}threads-video-downloader/index.html">Threads</a>
<a class="nav-link" href="${rootPath}snapchat-video-downloader/index.html">Snapchat</a>
<a class="nav-link" href="${rootPath}blog.html">Blog</a>
</div>
<!-- Actions -->
<div class="nav-actions">
<button id="theme-toggle-btn" class="btn-icon" aria-label="Toggle Theme">
<span class="material-symbols-outlined" id="theme-icon">dark_mode</span>
</button>
<button id="mobile-menu-btn" class="btn-icon md-only-btn" aria-label="Toggle Mobile Menu">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</nav>
<!-- Mobile Dropdown Navigation -->
<div id="mobile-nav-panel" class="mobile-nav-luxury">
<a class="mobile-nav-link" href="${rootPath}instagram-video-downloader/index.html">Instagram</a>
<a class="mobile-nav-link" href="${rootPath}facebook-video-downloader/index.html">Facebook</a>
<a class="mobile-nav-link" href="${rootPath}pinterest-video-downloader/index.html">Pinterest</a>
<a class="mobile-nav-link" href="${rootPath}x-video-downloader/index.html">X / Twitter</a>
<a class="mobile-nav-link" href="${rootPath}threads-video-downloader/index.html">Threads</a>
<a class="mobile-nav-link" href="${rootPath}snapchat-video-downloader/index.html">Snapchat</a>
<hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 8px 0;">
<a class="mobile-nav-link" href="${rootPath}blog.html">Blog</a>
<a class="mobile-nav-link" href="${rootPath}about.html">About Us</a>
<a class="mobile-nav-link" href="${rootPath}contact.html">Contact Support</a>
</div>
</header>
<style>
.header-luxury {
background: rgba(5, 8, 22, 0.45);
backdrop-filter: blur(var(--glass-blur));
-webkit-backdrop-filter: blur(var(--glass-blur));
border-bottom: 1px solid var(--glass-border);
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
transition: all 0.4s ease;
}
html.light .header-luxury {
background: rgba(250, 251, 255, 0.65);
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
}
.nav-luxury {
display: flex;
justify-content: space-between;
align-items: center;
height: 72px;
}
.logo-luxury {
text-decoration: none;
font-size: 24px;
font-weight: 900;
color: var(--color-on-surface);
letter-spacing: -0.02em;
display: flex;
align-items: center;
gap: 2px;
transition: transform 0.3s ease;
}
.logo-luxury:hover {
transform: scale(1.02);
}
.desktop-nav {
display: flex;
align-items: center;
gap: 20px;
background: rgba(255, 255, 255, 0.02);
border: 1px solid var(--glass-border);
padding: 6px 20px;
border-radius: var(--rounded-full);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
}
html.light .desktop-nav {
background: rgba(0, 0, 0, 0.02);
}
.nav-link {
color: var(--color-on-surface-variant);
text-decoration: none;
font-weight: 600;
font-size: 13.5px;
transition: var(--transition-smooth);
padding: 6px 12px;
border-radius: var(--rounded-full);
}
.nav-link:hover {
color: var(--color-primary);
background: rgba(168, 85, 247, 0.08);
}
.nav-link.active {
color: var(--color-primary) !important;
background: rgba(168, 85, 247, 0.12);
}
.nav-actions {
display: flex;
gap: 12px;
align-items: center;
}
.btn-icon {
background: rgba(255, 255, 255, 0.03);
border: 1px solid var(--glass-border);
cursor: pointer;
color: var(--color-on-surface);
width: 40px;
height: 40px;
border-radius: var(--rounded-full);
display: flex;
align-items: center;
justify-content: center;
transition: var(--transition-smooth);
}
.btn-icon:hover {
background: rgba(255, 255, 255, 0.08);
border-color: rgba(255, 255, 255, 0.2);
transform: translateY(-2px);
color: var(--color-primary);
}
.mobile-nav-luxury {
display: none;
background: var(--color-surface-container);
border-bottom: 1px solid var(--glass-border);
padding: 20px;
flex-direction: column;
gap: 12px;
}
.mobile-nav-link {
color: var(--color-on-surface);
text-decoration: none;
font-weight: 600;
font-size: 15px;
padding: 10px 16px;
border-radius: var(--rounded-default);
transition: var(--transition-smooth);
display: block;
}
.mobile-nav-link:hover {
background: rgba(168, 85, 247, 0.1);
color: var(--color-primary);
}
@media (min-width: 992px) {
.md-only-btn {
display: none !important;
}
}
@media (max-width: 991px) {
.desktop-nav {
display: none !important;
}
}
.btn-icon:active {
transform: scale(0.95);
}
/* Dynamic Announcement Banner */
.announcement-banner {
display: flex;
align-items: center;
justify-content: center;
padding: 8px 36px;
font-size: 13px;
font-weight: 600;
color: #ffffff;
position: relative;
transition: all 0.3s ease;
z-index: 100;
border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.announcement-banner.theme-info {
background: linear-gradient(90deg, rgba(59, 130, 246, 0.4), rgba(168, 85, 247, 0.4));
backdrop-filter: blur(15px);
-webkit-backdrop-filter: blur(15px);
}
.announcement-banner.theme-warning {
background: linear-gradient(90deg, rgba(234, 179, 8, 0.45), rgba(168, 85, 247, 0.4));
backdrop-filter: blur(15px);
-webkit-backdrop-filter: blur(15px);
}
.announcement-banner.theme-danger {
background: linear-gradient(90deg, rgba(239, 68, 68, 0.45), rgba(168, 85, 247, 0.4));
backdrop-filter: blur(15px);
-webkit-backdrop-filter: blur(15px);
}
.announcement-banner.theme-success {
background: linear-gradient(90deg, rgba(34, 197, 94, 0.4), rgba(168, 85, 247, 0.4));
backdrop-filter: blur(15px);
-webkit-backdrop-filter: blur(15px);
}
html.light .announcement-banner {
color: #0f111a;
border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
html.light .announcement-banner.theme-info {
background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1));
}
html.light .announcement-banner.theme-warning {
background: linear-gradient(90deg, rgba(234, 179, 8, 0.15), rgba(168, 85, 247, 0.1));
}
html.light .announcement-banner.theme-danger {
background: linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(168, 85, 247, 0.1));
}
html.light .announcement-banner.theme-success {
background: linear-gradient(90deg, rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.1));
}
.announcement-content {
display: flex;
align-items: center;
gap: 8px;
text-align: center;
max-width: calc(100% - 32px);
}
.ann-icon {
font-size: 16px;
color: #ffffff;
animation: pulse-bell-ring 2.5s ease-in-out infinite;
}
.ann-text {
line-height: 1.4;
}
.ann-text strong {
font-weight: 800;
text-transform: uppercase;
font-size: 11px;
letter-spacing: 0.05em;
margin-right: 4px;
}
.ann-close-btn {
position: absolute;
right: 16px;
top: 50%;
transform: translateY(-50%);
background: transparent;
border: none;
color: var(--color-on-surface);
font-size: 20px;
cursor: pointer;
opacity: 0.6;
transition: var(--transition-smooth);
padding: 0 4px;
display: flex;
align-items: center;
justify-content: center;
}
.ann-close-btn:hover {
opacity: 1;
transform: translateY(-50%) scale(1.1);
}
@keyframes pulse-bell-ring {
0%, 100% { transform: scale(1) rotate(0deg); }
10%, 20% { transform: scale(1.1) rotate(-8deg); }
15%, 25% { transform: scale(1.1) rotate(8deg); }
30% { transform: scale(1) rotate(0deg); }
}
</style>
`;
const currentPath = window.location.pathname;
this.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
const href = link.getAttribute('href');
if (href && currentPath.includes(href.replace('../', '').replace('./', ''))) {
link.classList.add('active');
}
});
}
setupListeners() {
const themeBtn = this.querySelector('#theme-toggle-btn');
if (themeBtn) {
themeBtn.addEventListener('click', (e) => {
e.preventDefault();
if (window.themeHelper) {
window.themeHelper.toggle();
}
});
}
const mobileMenuBtn = this.querySelector('#mobile-menu-btn');
const mobilePanel = this.querySelector('#mobile-nav-panel');
if (mobileMenuBtn && mobilePanel) {
mobileMenuBtn.addEventListener('click', (e) => {
e.preventDefault();
const isOpen = mobilePanel.style.display === 'flex';
mobilePanel.style.display = isOpen ? 'none' : 'flex';
mobileMenuBtn.querySelector('.material-symbols-outlined').innerText = isOpen ? 'menu' : 'close';
});
}
}
updateActiveThemeIcon() {
const icon = this.querySelector('#theme-icon');
if (icon) {
const isLight = document.documentElement.classList.contains('light');
icon.innerText = isLight ? 'dark_mode' : 'light_mode';
}
}
async setupAnnouncementBanner() {
window.addEventListener('firebase-initialized', (e) => {
this.fetchAndDisplayAnnouncement(e.detail.db);
});
if (window.firebaseAppInstance) {
this.fetchAndDisplayAnnouncement(window.firebaseAppInstance.db);
}
}
async fetchAndDisplayAnnouncement(db) {
try {
const snapshot = await db.collection('announcements')
.where('active', '==', true)
.orderBy('timestamp', 'desc')
.get();
if (snapshot.empty) return;
const now = new Date();
let selectedAnn = null;
let selectedDocId = null;
for (const doc of snapshot.docs) {
const data = doc.data();
const start = data.start ? new Date(data.start) : null;
const end = data.end ? new Date(data.end) : null;
if (start && start > now) continue;
if (end && end < now) continue;
selectedAnn = data;
selectedDocId = doc.id;
break;
}
if (selectedAnn && selectedDocId) {
const isClosed = localStorage.getItem('savefast-closed-ann-' + selectedDocId);
if (!isClosed) {
this.renderAnnouncementBanner(selectedAnn, selectedDocId);
}
}
} catch (err) {
console.warn("Failed to load active system announcements:", err);
}
}
renderAnnouncementBanner(data, docId) {
const container = this.querySelector('#announcement-banner-container');
if (!container) return;
const theme = data.theme || 'info';
container.innerHTML = `
<div class="announcement-banner theme-${theme}">
<div class="announcement-content">
<span class="material-symbols-outlined ann-icon">campaign</span>
<span class="ann-text"><strong>${this.sanitize(data.title)}:</strong> ${this.sanitize(data.message)}</span>
</div>
<button class="ann-close-btn" aria-label="Close Announcement">&times;</button>
</div>
`;
const closeBtn = container.querySelector('.ann-close-btn');
if (closeBtn) {
closeBtn.addEventListener('click', (e) => {
e.preventDefault();
localStorage.setItem('savefast-closed-ann-' + docId, 'true');
container.innerHTML = '';
window.dispatchEvent(new CustomEvent('header-height-changed'));
});
}
window.dispatchEvent(new CustomEvent('header-height-changed'));
}
sanitize(str) {
if (!str) return '';
const map = {
'&': '&amp;',
'<': '&lt;',
'>': '&gt;',
'"': '&quot;',
"'": '&#x27;',
"/": '&#x2F;'
};
return str.replace(/[&<>"'/]/g, (m) => map[m]);
}
setupDynamicPadding() {
const header = this.querySelector('header');
if (header) {
const main = document.querySelector('main');
if (main) {
main.style.paddingTop = header.offsetHeight + 'px';
}
const resizeObserver = new ResizeObserver(entries => {
for (let entry of entries) {
const height = entry.contentRect.height || entry.target.offsetHeight;
const m = document.querySelector('main');
if (m && height > 0) {
m.style.paddingTop = height + 'px';
}
}
});
resizeObserver.observe(header);
}
}
}
customElements.define('site-header', SiteHeader);
class SiteFooter extends HTMLElement {
connectedCallback() {
const rootPath = this.getAttribute('root-path') || '../';
this.innerHTML = `
<footer class="footer-luxury">
<div class="container footer-container">
<div class="footer-grid">
<div class="footer-brand">
<div class="footer-logo">Save<span class="gradient-text">Fast</span></div>
<p class="footer-tagline">The ultimate lightning-fast media retrieval engine. Archive your social media content instantly, privately, and securely.</p>
<div class="footer-socials">
<a href="#" class="social-link" aria-label="Github"><span class="material-symbols-outlined" style="font-size: 20px;">code</span></a>
<a href="#" class="social-link" aria-label="Twitter"><span class="material-symbols-outlined" style="font-size: 20px;">alternate_email</span></a>
<a href="#" class="social-link" aria-label="Status"><span class="material-symbols-outlined" style="font-size: 20px;">verified</span></a>
</div>
</div>
<div class="footer-links-col">
<h4 class="footer-col-title">Downloader Tools</h4>
<a class="footer-link" href="${rootPath}instagram-video-downloader/index.html">Instagram Downloader</a>
<a class="footer-link" href="${rootPath}facebook-video-downloader/index.html">Facebook Downloader</a>
<a class="footer-link" href="${rootPath}pinterest-video-downloader/index.html">Pinterest Downloader</a>
<a class="footer-link" href="${rootPath}x-video-downloader/index.html">X / Twitter Downloader</a>
</div>
<div class="footer-links-col">
<h4 class="footer-col-title">Other Tools</h4>
<a class="footer-link" href="${rootPath}threads-video-downloader/index.html">Threads Downloader</a>
<a class="footer-link" href="${rootPath}snapchat-video-downloader/index.html">Snapchat Downloader</a>
<a class="footer-link" href="${rootPath}instagram-reels-downloader/index.html">Instagram Reels</a>
<a class="footer-link" href="${rootPath}pinterest-image-downloader/index.html">Pinterest Image</a>
</div>
<div class="footer-links-col">
<h4 class="footer-col-title">Company</h4>
<a class="footer-link" href="${rootPath}about.html">About Us</a>
<a class="footer-link" href="${rootPath}contact.html">Contact Support</a>
<a class="footer-link" href="${rootPath}blog.html">Official Blog</a>
<a class="footer-link" href="${rootPath}privacy.html">Privacy Policy</a>
<a class="footer-link" href="${rootPath}dmca.html">DMCA Policy</a>
<a class="footer-link" href="${rootPath}terms.html">Terms of Service</a>
</div>
</div>
<hr class="footer-divider">
<div class="footer-bottom">
<p class="copyright">© ${new Date().getFullYear()} SaveFast.in. Premium Media Retrieval. All rights reserved.</p>
<p class="disclaimer">Disclaimer: SaveFast is an independent utility and does not host or store copyrighted files on its servers. All retrieved media files are streamed directly from their respective source platforms.</p>
</div>
</div>
</footer>
<style>
.footer-luxury {
margin-top: auto;
background: rgba(2, 4, 10, 0.4);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border-top: 1px solid var(--glass-border);
padding: 80px 0 40px 0;
transition: var(--transition-smooth);
}
html.light .footer-luxury {
background: rgba(244, 246, 250, 0.65);
}
.footer-container {
display: flex;
flex-direction: column;
gap: 40px;
}
.footer-grid {
display: grid;
grid-template-columns: 1fr;
gap: 40px;
}
@media (min-width: 768px) {
.footer-grid {
grid-template-columns: 2fr 1fr 1fr 1fr;
}
}
.footer-brand {
display: flex;
flex-direction: column;
gap: 16px;
}
.footer-logo {
font-size: 24px;
font-weight: 900;
color: var(--color-on-surface);
letter-spacing: -0.02em;
}
.footer-tagline {
font-size: 13.5px;
line-height: 1.6;
color: var(--color-on-surface-variant);
max-width: 340px;
}
.footer-socials {
display: flex;
gap: 12px;
}
.social-link {
width: 36px;
height: 36px;
border-radius: var(--rounded-full);
background: rgba(255, 255, 255, 0.03);
border: 1px solid var(--glass-border);
display: flex;
align-items: center;
justify-content: center;
color: var(--color-on-surface-variant);
text-decoration: none;
transition: var(--transition-smooth);
}
html.light .social-link {
background: rgba(0, 0, 0, 0.02);
}
.social-link:hover {
background: rgba(168, 85, 247, 0.1);
color: var(--color-primary);
border-color: rgba(168, 85, 247, 0.3);
transform: translateY(-2px);
}
.footer-links-col {
display: flex;
flex-direction: column;
gap: 12px;
}
.footer-col-title {
font-size: 13px;
font-weight: 800;
text-transform: uppercase;
letter-spacing: 0.1em;
color: var(--color-on-surface);
margin-bottom: 4px;
}
.footer-link {
color: var(--color-on-surface-variant);
text-decoration: none;
font-weight: 500;
font-size: 13.5px;
transition: var(--transition-smooth);
width: fit-content;
}
.footer-link:hover {
color: var(--color-primary);
transform: translateX(3px);
}
.footer-divider {
border: 0;
border-top: 1px solid var(--glass-border);
}
.footer-bottom {
display: flex;
flex-direction: column;
gap: 16px;
font-size: 12px;
color: var(--color-on-surface-variant);
line-height: 1.6;
opacity: 0.85;
}
@media (min-width: 768px) {
.footer-bottom {
flex-direction: row;
justify-content: space-between;
align-items: flex-start;
gap: 40px;
}
.footer-bottom .copyright {
flex-shrink: 0;
}
}
</style>
`;
}
}
customElements.define('site-footer', SiteFooter);
class AdSlot extends HTMLElement {
connectedCallback() {
this.placement = this.getAttribute('data-placement') || 'content';
this.render();
this.adLoaded = false;
const loadAd = () => {
if (this.adLoaded) return;
this.adLoaded = true;
window.addEventListener('firebase-initialized', () => this.fetchAdData());
if (window.firebaseAppInstance) {
this.fetchAdData();
}
};
if ('IntersectionObserver' in window) {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
loadAd();
observer.disconnect();
}
});
}, {
rootMargin: '200px'
});
observer.observe(this);
} else {
if (document.readyState === 'complete') {
loadAd();
} else {
window.addEventListener('load', loadAd);
}
}
}
render() {
this.innerHTML = `
<div class="ad-container ad-placement-${this.placement}" id="ad-wrapper" style="width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; margin: 16px 0; border-radius: var(--rounded-md);">
<!-- Placeholder when loading or ads are disabled -->
<div class="ad-placeholder" style="width: 100%; border: 1px dashed var(--color-outline-variant); background: rgba(0,0,0,0.05); padding: 12px; text-align: center; border-radius: var(--rounded-default);">
<span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-on-surface-variant); opacity: 0.6;">Sponsor Frame (${this.placement})</span>
</div>
</div>
`;
}
async fetchAdData() {
try {
const helper = window.firebaseAppInstance;
if (!helper) return;
const db = helper.db;
const doc = await db.collection('settings').doc('ads').get();
if (doc.exists) {
const data = doc.data();
if (data.adsEnabled) {
const adCode = data[this.placement];
if (adCode) {
this.injectAdCode(adCode);
return;
}
}
}
this.setupFallbackSim();
} catch (e) {
console.warn("Failed to retrieve ads script settings:", e);
this.setupFallbackSim();
}
}
injectAdCode(code) {
const wrapper = this.querySelector('#ad-wrapper');
if (!wrapper) return;
wrapper.innerHTML = '';
const range = document.createRange();
const documentFragment = range.createContextualFragment(code);
wrapper.appendChild(documentFragment);
}
setupFallbackSim() {
const wrapper = this.querySelector('#ad-wrapper');
if (!wrapper) return;
let dim = "728x90";
let minH = "90px";
if (this.placement === 'sidebar') {
dim = "300x600";
minH = "300px";
} else if (this.placement === 'sticky-bottom') {
dim = "970x90";
minH = "60px";
}
wrapper.innerHTML = `
<div style="width: 100%; min-height: ${minH}; border: 1px dashed rgba(255,255,255,0.08); background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); padding: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
<span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-primary); opacity: 0.5;">ad_units</span>
<div style="font-size: 13px; font-weight: 700; color: var(--color-on-surface);">Premium Partner Area</div>
<div style="font-size: 11px; color: var(--color-on-surface-variant); opacity: 0.6;">Configuration dynamically managed via administrator console (${dim})</div>
</div>
`;
}
}
customElements.define('ad-slot', AdSlot);
class RelatedTools extends HTMLElement {
connectedCallback() {
const rootPath = this.getAttribute('root-path') || '../';
const tools = [
{ name: "Instagram Video", path: "instagram-video-downloader/index.html", icon: "video_library", color: "from-pink-500 to-purple-600" },
{ name: "Instagram Reels", path: "instagram-reels-downloader/index.html", icon: "movie_filter", color: "from-pink-600 to-red-500" },
{ name: "Instagram Story", path: "instagram-story-downloader/index.html", icon: "history_toggle_off", color: "from-purple-500 to-indigo-500" },
{ name: "Facebook Video", path: "facebook-video-downloader/index.html", icon: "facebook", color: "from-blue-600 to-blue-800" },
{ name: "Facebook Reels", path: "facebook-reels-downloader/index.html", icon: "play_circle", color: "from-blue-500 to-cyan-500" },
{ name: "Pinterest Video", path: "pinterest-video-downloader/index.html", icon: "push_pin", color: "from-red-600 to-red-800" },
{ name: "Pinterest Image", path: "pinterest-image-downloader/index.html", icon: "image", color: "from-red-500 to-orange-500" },
{ name: "X Video Downloader", path: "x-video-downloader/index.html", icon: "close", color: "from-zinc-800 to-black" },
{ name: "Twitter Video", path: "twitter-video-downloader/index.html", icon: "tag", color: "from-blue-400 to-blue-600" },
{ name: "Threads Video", path: "threads-video-downloader/index.html", icon: "alternate_email", color: "from-zinc-900 to-zinc-700" },
{ name: "Snapchat Video", path: "snapchat-video-downloader/index.html", icon: "chat_bubble", color: "from-yellow-400 to-yellow-600" }
];
let itemsHTML = '';
tools.forEach(tool => {
itemsHTML += `
<a href="${rootPath}${tool.path}" class="platform-card" style="padding: 24px 16px; min-height: 140px; animation: none;">
<div class="platform-icon bg-gradient-to-br ${tool.color}" style="color: white; border-radius: var(--rounded-full); width: 44px; height: 44px; font-size: 20px; box-shadow: none;">
<span class="material-symbols-outlined" style="font-size: 20px;">${tool.icon}</span>
</div>
<span style="font-size: 13.5px; font-weight: 700; color: var(--color-on-surface); text-align: center; margin-top: 4px;">${tool.name}</span>
</a>
`;
});
this.innerHTML = `
<section class="reveal" style="margin: 64px auto;">
<h2 style="font-size: 28px; text-align: center; margin-bottom: 32px; color: var(--color-on-surface);">Related Retrieval Engines</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;">
${itemsHTML}
</div>
</section>
<style>
/* Background helpers */
.from-pink-500 { --tw-gradient-from: #ec4899; }
.to-purple-600 { --tw-gradient-to: #9333ea; }
.from-pink-600 { --tw-gradient-from: #db2777; }
.to-red-500 { --tw-gradient-to: #ef4444; }
.from-purple-500 { --tw-gradient-from: #a855f7; }
.to-indigo-500 { --tw-gradient-to: #6366f1; }
.from-blue-600 { --tw-gradient-from: #2563eb; }
.to-blue-800 { --tw-gradient-to: #1e40af; }
.from-blue-500 { --tw-gradient-from: #3b82f6; }
.to-cyan-500 { --tw-gradient-to: #06b6d4; }
.from-red-600 { --tw-gradient-from: #dc2626; }
.to-red-800 { --tw-gradient-to: #991b1b; }
.from-red-500 { --tw-gradient-from: #ef4444; }
.to-orange-500 { --tw-gradient-to: #f97316; }
.from-zinc-800 { --tw-gradient-from: #27272a; }
.to-black { --tw-gradient-to: #000000; }
.from-blue-400 { --tw-gradient-from: #60a5fa; }
.to-blue-600 { --tw-gradient-to: #2563eb; }
.from-zinc-900 { --tw-gradient-from: #18181b; }
.to-zinc-700 { --tw-gradient-to: #3f3f46; }
.from-yellow-400 { --tw-gradient-from: #facc15; }
.to-yellow-600 { --tw-gradient-to: #ca8a04; }
.bg-gradient-to-br {
background-image: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to));
}
</style>
`;
if (window.IntersectionObserver) {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('active');
}
});
}, { threshold: 0.1 });
this.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
}
}
customElements.define('related-tools', RelatedTools);