const THEME_KEY = 'savefast-theme';
function getPreferredTheme() {
const storedTheme = localStorage.getItem(THEME_KEY);
if (storedTheme) {
return storedTheme;
}
return 'dark';
}
function applyTheme(theme) {
const htmlEl = document.documentElement;
if (theme === 'dark') {
htmlEl.classList.add('dark');
htmlEl.classList.remove('light');
} else {
htmlEl.classList.remove('dark');
htmlEl.classList.add('light');
}
localStorage.setItem(THEME_KEY, theme);
window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
}
function toggleTheme() {
const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
const newTheme = currentTheme === 'light' ? 'dark' : 'light';
document.body.classList.add('theme-transitioning');
applyTheme(newTheme);
setTimeout(() => {
document.body.classList.remove('theme-transitioning');
}, 400);
}
(function initTheme() {
const theme = getPreferredTheme();
applyTheme(theme);
})();
window.themeHelper = {
getTheme: getPreferredTheme,
toggle: toggleTheme,
apply: applyTheme
};
if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
const depth = window.location.pathname.split('/').filter(Boolean).length;
const isLocalFile = window.location.protocol === 'file:';
let swPath = 'sw.js';
if (!isLocalFile) {
const pathEndsInHtml = window.location.pathname.endsWith('.html');
const foldersCount = depth - (pathEndsInHtml ? 1 : 0);
swPath = '../'.repeat(foldersCount) + 'sw.js';
}
navigator.serviceWorker.register(swPath).catch(err => {
console.warn('Service worker registration skipped/failed: ', err.message);
});
});
}
function initPremiumBackground() {
if (document.querySelector('.luxury-bg-container')) return;
const bgContainer = document.createElement('div');
bgContainer.className = 'luxury-bg-container';
const blobPurple = document.createElement('div');
blobPurple.className = 'aurora-blob blob-purple';
const blobBlue = document.createElement('div');
blobBlue.className = 'aurora-blob blob-blue';
const blobCyan = document.createElement('div');
blobCyan.className = 'aurora-blob blob-cyan';
const stars = document.createElement('div');
stars.className = 'static-stars';
bgContainer.appendChild(blobPurple);
bgContainer.appendChild(blobBlue);
bgContainer.appendChild(blobCyan);
bgContainer.appendChild(stars);
document.body.appendChild(bgContainer);
setupPlatformCardHover();
setupStatsCounters();
}
function setupPlatformCardHover() {
const cards = document.querySelectorAll('.platform-card');
cards.forEach(card => {
let rect = null;
card.addEventListener('mouseenter', () => {
rect = card.getBoundingClientRect();
});
card.addEventListener('mousemove', (e) => {
if (!rect) rect = card.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
card.style.setProperty('--x', `${x}px`);
card.style.setProperty('--y', `${y}px`);
});
card.addEventListener('mouseleave', () => {
rect = null;
});
});
}
function setupStatsCounters() {
const counters = document.querySelectorAll('.stat-number');
if (counters.length === 0) return;
const observerOptions = {
threshold: 0.1,
rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const target = entry.target;
const targetValue = parseFloat(target.getAttribute('data-target'));
const suffix = target.getAttribute('data-suffix') || '';
const isDecimal = target.getAttribute('data-decimal') === 'true';
let count = 0;
const duration = 1500;
const startTime = performance.now();
function updateCount(currentTime) {
const elapsedTime = currentTime - startTime;
const progress = Math.min(elapsedTime / duration, 1);
const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
const currentVal = easeProgress * targetValue;
if (isDecimal) {
target.innerText = currentVal.toFixed(1) + suffix;
} else {
target.innerText = Math.floor(currentVal) + suffix;
}
if (progress < 1) {
requestAnimationFrame(updateCount);
} else {
target.innerText = targetValue + suffix;
}
}
requestAnimationFrame(updateCount);
observer.unobserve(target);
}
});
}, observerOptions);
counters.forEach(counter => observer.observe(counter));
}
window.addEventListener('DOMContentLoaded', initPremiumBackground);
async function verifyBlogPostStatus() {
const path = window.location.pathname;
if (path.includes('/blog/') && !path.endsWith('/blog') && !path.endsWith('/blog.html')) {
const parts = path.split('/blog/');
if (parts.length > 1) {
let slug = parts[1].replace('.html', '').replace(/\/$/, '');
if (!slug) return;
const checkStatus = async () => {
try {
const helper = window.firebaseAppInstance;
if (!helper) return;
const db = helper.db;
const doc = await db.collection('blogs').doc(slug).get();
if (doc.exists) {
const data = doc.data();
if (data.active === false || data.status === 'disabled') {
console.warn(`Blog post '${slug}' is offline (disabled). Redirecting...`);
window.location.href = '../blog.html';
return;
}
if (data.title) {
document.title = data.title;
}
if (data.description) {
const metaDesc = document.querySelector('meta[name="description"]');
if (metaDesc) metaDesc.setAttribute('content', data.description);
}
}
} catch (e) {
console.error("Failed to check blog status in Firestore:", e);
}
};
window.addEventListener('firebase-initialized', checkStatus);
if (window.firebaseAppInstance) {
checkStatus();
}
}
}
}
window.addEventListener('DOMContentLoaded', verifyBlogPostStatus);