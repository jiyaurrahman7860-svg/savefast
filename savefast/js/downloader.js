const URL_PATTERNS = {
instagram: /instagram\.com\/(p|reel|tv|stories)/i,
facebook: /(facebook\.com|fb\.watch|fb\.gg)/i,
pinterest: /(pinterest\.com\/pin\/|pin\.it\/)/i,
x: /(x\.com|twitter\.com)/i,
threads: /threads\.net/i,
snapchat: /snapchat\.com/i
};
function sanitizeInput(str) {
const temp = document.createElement('div');
temp.textContent = str;
return temp.innerHTML;
}
function detectPlatform(url) {
for (const [platform, regex] of Object.entries(URL_PATTERNS)) {
if (regex.test(url)) {
return platform;
}
}
return null;
}
async function getClientIP() {
try {
const res = await fetch('https://api.ipify.org?format=json');
const data = await res.json();
return data.ip || 'Anonymous';
} catch (e) {
return 'Unknown';
}
}
async function logDownload(platform, url, success) {
try {
const helper = window.firebaseAppInstance;
if (!helper) return;
const db = helper.db;
const ip = await getClientIP();
await db.collection('downloads').add({
platform: platform,
url: url,
success: success,
ip: ip,
timestamp: firebase.firestore.FieldValue.serverTimestamp()
});
const analyticDoc = db.collection('analytics').doc('counters');
await db.runTransaction(async (transaction) => {
const sfDoc = await transaction.get(analyticDoc);
if (!sfDoc.exists) {
transaction.set(analyticDoc, { downloadsCount: 1, visitorsCount: 1 });
} else {
const newCount = (sfDoc.data().downloadsCount || 0) + 1;
transaction.update(analyticDoc, { downloadsCount: newCount });
}
});
} catch (e) {
console.warn("Analytics logging failed:", e);
}
}
let adsConfig = null;
function loadAdsSettingsForPopunder() {
const helper = window.firebaseAppInstance;
if (!helper || !helper.db) return;
helper.db.collection('settings').doc('ads').get().then(doc => {
if (doc.exists) {
adsConfig = doc.data();
}
}).catch(err => {
console.warn("Failed to load ads settings for popunder:", err);
});
}
window.addEventListener('firebase-initialized', loadAdsSettingsForPopunder);
if (window.firebaseAppInstance) {
loadAdsSettingsForPopunder();
}
function triggerPopunderAd() {
if (!adsConfig || !adsConfig.adsEnabled || !adsConfig.popunderEnabled) return;
const popunderCode = adsConfig.popunderCode;
if (!popunderCode || popunderCode.trim() === '') return;
try {
if (!popunderCode.includes('<script') && (popunderCode.startsWith('http://') || popunderCode.startsWith('https://') || popunderCode.startsWith('//') || popunderCode.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]+/))) {
let targetUrl = popunderCode.trim();
if (targetUrl.startsWith('//')) {
targetUrl = 'https:' + targetUrl;
} else if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
targetUrl = 'https://' + targetUrl;
}
const popWindow = window.open(targetUrl, '_blank');
if (popWindow) {
window.focus();
}
} else {
const div = document.createElement('div');
div.style.display = 'none';
document.body.appendChild(div);
const range = document.createRange();
const documentFragment = range.createContextualFragment(popunderCode);
div.appendChild(documentFragment);
}
} catch (err) {
console.warn("Popunder ad invocation failed:", err);
}
}
document.addEventListener('DOMContentLoaded', () => {
const urlInput = document.getElementById('downloader-url-input');
const pasteBtn = document.getElementById('downloader-paste-btn');
const downloadBtn = document.getElementById('downloader-submit-btn');
const resultContainer = document.getElementById('downloader-result-container');
const errorContainer = document.getElementById('downloader-error-container');
if (!urlInput || !downloadBtn || !resultContainer) return;
if (pasteBtn) {
pasteBtn.addEventListener('click', async (e) => {
e.preventDefault();
try {
const text = await navigator.clipboard.readText();
urlInput.value = text;
urlInput.focus();
} catch (err) {
console.warn('Could not read clipboard text: ', err);
}
});
}
downloadBtn.addEventListener('click', (e) => {
e.preventDefault();
processDownload(urlInput.value.trim());
});
function getToolKey(url) {
if (/instagram\.com\/(p|tv|reel|stories)/i.test(url)) {
if (url.includes('/stories/')) return 'instagram-story';
if (url.includes('/reel/')) return 'instagram-reels';
return 'instagram-video';
}
if (/(facebook\.com|fb\.watch|fb\.gg)/i.test(url)) {
if (url.includes('/reels/') || url.includes('/reel/')) return 'facebook-reels';
return 'facebook-video';
}
if (/(pinterest\.com\/pin\/|pin\.it\/)/i.test(url)) {
if (window.location.pathname.includes('pinterest-image-downloader')) return 'pinterest-image';
return 'pinterest-video';
}
if (/(x\.com|twitter\.com)/i.test(url)) {
return 'x-video';
}
if (/threads\.net/i.test(url)) {
return 'threads-video';
}
if (/snapchat\.com/i.test(url)) {
return 'snapchat-video';
}
return null;
}
async function processDownload(url) {
errorContainer.classList.add('hidden');
resultContainer.innerHTML = '';
if (!url) {
showError("Please enter a valid video link!");
return;
}
const platform = detectPlatform(url);
if (!platform) {
showError("Unsupported URL! Please paste a valid link from Instagram, Facebook, Pinterest, X, Threads, or Snapchat.");
return;
}
try {
const helper = window.firebaseAppInstance;
if (helper && helper.db) {
const toolKey = getToolKey(url);
if (toolKey) {
const toolsDoc = await helper.db.collection('settings').doc('tools').get();
if (toolsDoc.exists) {
const toolsConfig = toolsDoc.data();
const conf = toolsConfig[toolKey];
if (conf) {
if (conf.status === 'disabled') {
showError(`This downloader (${toolKey.replace('-', ' ').toUpperCase()}) has been temporarily disabled by the administrator.`);
return;
} else if (conf.status === 'maintenance') {
showError(`This downloader (${toolKey.replace('-', ' ').toUpperCase()}) is currently under active maintenance. Please check back shortly.`);
return;
}
}
}
}
}
} catch (statusErr) {
console.warn("Operational status verification bypassed:", statusErr.message);
}
showLoadingSkeleton();
try {
const sanitizedUrl = sanitizeInput(url);
let responseData;
let apiResolved = false;
try {
const helper = window.firebaseAppInstance;
if (helper && helper.db) {
const configDoc = await helper.db.collection('settings').doc('config').get();
if (configDoc.exists) {
const configData = configDoc.data();
const baseUrl = configData.backendApiUrl;
if (baseUrl) {
const apiRes = await fetch(`${baseUrl.replace(/\/$/, '')}/api/download`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ url: sanitizedUrl })
});
if (apiRes.ok) {
responseData = await apiRes.json();
apiResolved = true;
} else {
const errJson = await apiRes.json();
throw new Error(errJson.message || "Express API responded with error.");
}
}
}
}
} catch (dbApiErr) {
console.warn("Dynamic Express API fetch failed, trying Firebase fallback:", dbApiErr.message);
}
if (!apiResolved) {
try {
const helper = window.firebaseAppInstance;
if (helper && helper.functions) {
const resolver = helper.functions.httpsCallable('resolveMedia');
const result = await resolver({ url: sanitizedUrl, platform });
responseData = result.data;
} else {
const apiRes = await fetch('https://us-central1-savefast-45e97.cloudfunctions.net/resolveMedia', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ url: sanitizedUrl, platform })
});
if (!apiRes.ok) throw new Error("Backend retrieval failed.");
responseData = await apiRes.json();
}
} catch (fnError) {
console.warn("Firebase functions API failed:", fnError.message);
throw new Error("Media could not be resolved.");
}
}
if (responseData && responseData.success) {
if (!responseData.type && responseData.formats && responseData.formats.length > 0) {
responseData.type = responseData.formats.some(f => f.extension === 'mp4') ? 'video' : 'image';
}
renderMediaResult(responseData);
triggerPopunderAd();
await logDownload(platform, sanitizedUrl, true);
} else {
throw new Error(responseData.message || "Failed to parse download configurations.");
}
} catch (err) {
console.error(err);
showError(err.message || "An error occurred while retrieval processing. Please try again.");
await logDownload(platform, url, false);
}
}
let loadingInterval = null;
function showError(msg) {
if (loadingInterval) {
clearInterval(loadingInterval);
loadingInterval = null;
}
resultContainer.innerHTML = '';
errorContainer.innerText = msg;
errorContainer.classList.remove('hidden');
}
function showLoadingSkeleton() {
if (loadingInterval) {
clearInterval(loadingInterval);
}
resultContainer.innerHTML = `
<div class="premium-loader-card slide-up">
<div class="loader-glow-blob"></div>
<div class="loader-visual-container">
<div class="loader-ring-outer"></div>
<div class="loader-ring-inner"></div>
<span class="material-symbols-outlined loader-center-icon">downloading</span>
</div>
<h3 class="loader-headline gradient-text">Fetching Your Media</h3>
<p class="loader-subtitle-anim" id="loader-status-text" style="transition: opacity 0.3s ease;">Analyzing URL link...</p>
<div class="loader-progress-track">
<div class="loader-progress-fill"></div>
</div>
</div>
`;
const statusTexts = [
"Analyzing URL link...",
"Connecting to platform servers...",
"Bypassing geolocation restrictions...",
"Decrypting secure media package...",
"Retrieving high-quality HD streams...",
"Generating direct download credentials..."
];
let currentIdx = 0;
const statusEl = document.getElementById('loader-status-text');
loadingInterval = setInterval(() => {
if (statusEl) {
statusEl.style.opacity = '0';
setTimeout(() => {
currentIdx = (currentIdx + 1) % statusTexts.length;
statusEl.innerText = statusTexts[currentIdx];
statusEl.style.opacity = '1';
}, 300);
}
}, 2000);
}
function renderMediaResult(data) {
if (loadingInterval) {
clearInterval(loadingInterval);
loadingInterval = null;
}
const sizeStr = data.size ? `• ${data.size}` : '';
const durationStr = data.duration ? `• ${data.duration}` : '';
let formatsListHTML = '';
data.formats.forEach(f => {
formatsListHTML += `
<a href="${f.url}" target="_blank" download class="btn btn-primary" style="display: flex; justify-content: space-between; align-items: center; width: 100%; text-decoration: none; padding: 16px var(--spacing-md); border-radius: var(--rounded-md); text-align: left; font-size: 15px; font-weight: 700;">
<span style="display: flex; align-items: center; gap: 8px;">
<span class="material-symbols-outlined">download</span>
Save Content (${f.quality})
</span>
<span style="font-size: 12px; opacity: 0.8; font-weight: 500;">${f.extension.toUpperCase()}</span>
</a>
`;
});
resultContainer.innerHTML = `
<div class="glass-card p-md slide-up" style="width: 100%; max-width: 800px; margin: 32px auto 0; position: relative;">
<!-- Platform badge -->
<div style="position: absolute; top: var(--spacing-md); left: var(--spacing-md); z-index: 10;">
<span style="background: rgba(6, 182, 212, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.4); color: #06B6D4; padding: 4px 12px; border-radius: var(--rounded-full); font-size: 12px; font-weight: 600; text-transform: uppercase;">
${data.platform}
</span>
</div>
<div class="media-preview-container mb-md" style="width: 100%; overflow: hidden; border-radius: var(--rounded-md); position: relative; background: #000; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center;">
${data.type === 'video'
? `<video src="${data.previewUrl || data.formats[0].url}" poster="${data.thumbnail}" controls style="width: 100%; height: 100%; object-fit: contain;"></video>`
: `<img src="${data.thumbnail}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: contain;">`
}
</div>
<div class="mb-md">
<h3 style="font-size: 20px; color: var(--color-on-surface); margin-bottom: 8px;">${data.title}</h3>
<div style="font-size: 13px; color: var(--color-on-surface-variant); display: flex; gap: 8px;">
<span>Source: ${data.platform.toUpperCase()}</span>
<span>${sizeStr}</span>
<span>${durationStr}</span>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 12px;">
<h4 style="font-size: 15px; color: var(--color-on-surface); margin-bottom: 4px;">Available Direct Links</h4>
<div style="display: flex; flex-direction: column; gap: 12px;">
${formatsListHTML}
<!-- Sticky Ad Insertion inside card -->
<ad-slot data-placement="content"></ad-slot>
</div>
</div>
</div>
`;
resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function getCurrentPageToolKey() {
const path = window.location.pathname.toLowerCase();
if (path.includes('instagram-video-downloader')) return 'instagram-video';
if (path.includes('instagram-reels-downloader')) return 'instagram-reels';
if (path.includes('instagram-story-downloader')) return 'instagram-story';
if (path.includes('facebook-video-downloader')) return 'facebook-video';
if (path.includes('facebook-reels-downloader')) return 'facebook-reels';
if (path.includes('pinterest-video-downloader')) return 'pinterest-video';
if (path.includes('pinterest-image-downloader')) return 'pinterest-image';
if (path.includes('x-video-downloader') || path.includes('twitter-video-downloader')) return 'x-video';
if (path.includes('threads-video-downloader')) return 'threads-video';
if (path.includes('snapchat-video-downloader')) return 'snapchat-video';
return null;
}
function listenToToolStatus() {
const helper = window.firebaseAppInstance;
if (!helper || !helper.db) return;
const toolKey = getCurrentPageToolKey();
if (!toolKey) return;
const errorContainer = document.getElementById('downloader-error-container');
const input = document.getElementById('downloader-url-input');
const submitBtn = document.getElementById('downloader-submit-btn');
const pasteBtn = document.getElementById('downloader-paste-btn');
if (!errorContainer) return;
helper.db.collection('settings').doc('tools').onSnapshot(doc => {
if (doc.exists) {
const toolsConfig = doc.data();
const conf = toolsConfig[toolKey];
if (conf) {
if (conf.status === 'disabled') {
errorContainer.innerHTML = `<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 6px;">block</span> <strong>Service Offline:</strong> This downloader is temporarily disabled for system updates.`;
errorContainer.style.background = 'rgba(239, 68, 68, 0.1)';
errorContainer.style.borderColor = 'rgba(239, 68, 68, 0.4)';
errorContainer.style.color = '#ef4444';
errorContainer.classList.remove('hidden');
if (input) input.disabled = true;
if (submitBtn) {
submitBtn.disabled = true;
submitBtn.style.opacity = '0.5';
submitBtn.style.pointerEvents = 'none';
}
if (pasteBtn) {
pasteBtn.disabled = true;
pasteBtn.style.opacity = '0.5';
pasteBtn.style.pointerEvents = 'none';
}
} else if (conf.status === 'maintenance') {
errorContainer.innerHTML = `<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 6px;">engineering</span> <strong>Under Maintenance:</strong> We are upgrading our scraper servers. This tool is temporarily offline.`;
errorContainer.style.background = 'rgba(245, 158, 11, 0.1)';
errorContainer.style.borderColor = 'rgba(245, 158, 11, 0.4)';
errorContainer.style.color = '#f59e0b';
errorContainer.classList.remove('hidden');
if (input) input.disabled = true;
if (submitBtn) {
submitBtn.disabled = true;
submitBtn.style.opacity = '0.5';
submitBtn.style.pointerEvents = 'none';
}
if (pasteBtn) {
pasteBtn.disabled = true;
pasteBtn.style.opacity = '0.5';
pasteBtn.style.pointerEvents = 'none';
}
} else {
errorContainer.classList.add('hidden');
if (input) input.disabled = false;
if (submitBtn) {
submitBtn.disabled = false;
submitBtn.style.opacity = '1';
submitBtn.style.pointerEvents = 'auto';
}
if (pasteBtn) {
pasteBtn.disabled = false;
pasteBtn.style.opacity = '1';
pasteBtn.style.pointerEvents = 'auto';
}
}
}
}
}, err => {
console.warn("Failed to listen to tool status:", err);
});
}
window.addEventListener('firebase-initialized', () => {
listenToToolStatus();
});
if (window.firebaseAppInstance) {
listenToToolStatus();
}
});