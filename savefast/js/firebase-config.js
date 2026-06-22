const firebaseConfig = {
apiKey: "AIzaSyC0mTI_pnHv6nOE-wC4WaDWlMkS3zrDYyU",
authDomain: "savefast-45e97.firebaseapp.com",
projectId: "savefast-45e97",
storageBucket: "savefast-45e97.firebasestorage.app",
messagingSenderId: "1012287350161",
appId: "1:1012287350161:web:7e6b3520736a556201e630",
measurementId: "G-D01J264PRK"
};
window.firebaseConfig = firebaseConfig;
function loadScript(src) {
return new Promise((resolve, reject) => {
if (document.querySelector(`script[src="${src}"]`)) {
resolve();
return;
}
const script = document.createElement('script');
script.src = src;
script.async = true;
script.onload = resolve;
script.onerror = reject;
document.head.appendChild(script);
});
}
async function initializeFirebase() {
if (window.firebaseAppInstance) {
return window.firebaseAppInstance;
}
const firebaseSDKs = [
"https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js",
"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js",
"https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics-compat.js",
"https://www.gstatic.com/firebasejs/10.8.0/firebase-functions-compat.js"
];
try {
for (const sdk of firebaseSDKs) {
await loadScript(sdk);
}
if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();
const functions = firebase.functions();
let analytics = null;
try {
analytics = firebase.analytics();
} catch (e) {
console.warn("Firebase Analytics could not be initialized:", e);
}
window.firebaseAppInstance = {
db,
auth,
functions,
analytics,
firebase
};
window.dispatchEvent(new CustomEvent('firebase-initialized', { detail: window.firebaseAppInstance }));
return window.firebaseAppInstance;
} catch (error) {
console.error("Failed to load Firebase SDKs:", error);
throw error;
}
}
window.firebaseHelper = {
init: initializeFirebase,
config: firebaseConfig,
getInstance: () => window.firebaseAppInstance
};
function queueFirebaseInit() {
let initialized = false;
const triggerInit = () => {
if (initialized) return;
initialized = true;
cleanupEvents();
initializeFirebase().catch(e => console.error("Lazy boot Firebase initialization failed:", e));
};
const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
const cleanupEvents = () => {
events.forEach(e => window.removeEventListener(e, triggerInit, { passive: true }));
};
events.forEach(e => window.addEventListener(e, triggerInit, { passive: true }));
if ('requestIdleCallback' in window) {
requestIdleCallback(() => triggerInit(), { timeout: 3000 });
} else {
setTimeout(triggerInit, 2000);
}
}
queueFirebaseInit();