/**
 * SaveFast.in Firebase Central Configuration & SDK Bootstrapper
 * Dynamically loads Firebase compatibility SDK scripts if they aren't loaded in the document
 * and exports firestore, auth, functions, analytics instances.
 */

const firebaseConfig = {
  apiKey: "AIzaSyC0mTI_pnHv6nOE-wC4WaDWlMkS3zrDYyU",
  authDomain: "savefast-45e97.firebaseapp.com",
  projectId: "savefast-45e97",
  storageBucket: "savefast-45e97.firebasestorage.app",
  messagingSenderId: "1012287350161",
  appId: "1:1012287350161:web:7e6b3520736a556201e630",
  measurementId: "G-D01J264PRK"
};

// Expose config and loaders globally
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

// Function to initialize and resolve Firebase instances
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
    // Load all scripts sequentially
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

    // Dispatch custom event to notify scripts that Firebase is initialized
    window.dispatchEvent(new CustomEvent('firebase-initialized', { detail: window.firebaseAppInstance }));
    
    return window.firebaseAppInstance;
  } catch (error) {
    console.error("Failed to load Firebase SDKs:", error);
    throw error;
  }
}

// Expose globally
window.firebaseHelper = {
  init: initializeFirebase,
  config: firebaseConfig,
  getInstance: () => window.firebaseAppInstance
};

// Auto boot as soon as DOM loads (helps dynamic elements start loading fast)
document.addEventListener('DOMContentLoaded', () => {
  initializeFirebase().catch(e => console.error("Auto boot Firebase initialization failed:", e));
});
