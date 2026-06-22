# SaveFast (SaveFast.in)

A premium, high-speed, glassmorphic social media media downloader platform built using Vanilla HTML5, CSS3, and JavaScript on the frontend, and Firebase Cloud Functions (Node.js) on the backend.

---

## 🚀 Key Features

* **Glassmorphic Design**: Clean UI following the "Lumina Glass" design system guidelines (semi-translucency, backdrop-blur borders, neon-glow accents).
* **Multi-Platform Support**: Instagram (Video, Reels, Story), Facebook (Video, Reels), Pinterest (Video, Image), X (formerly Twitter Video), Threads, and Snapchat public stories.
* **Modularity**: Dynamic Custom elements (`site-header`, `site-footer`, `ad-slot`, `related-tools`) loaded natively via JavaScript.
* **PWA Enabled**: Fully installable web application with service workers caching static assets for offline capability.
* **Enterprise-grade SEO**: Micro schemas (Breadcrumb, FAQ, WebSite), customized metadata tags, clean URLs, canonical paths, dynamic robots.txt, and sitemap.xml files.
* **Admin Dashboard**: Secured portal (`/admin`) for analytics tracker data, Adsterra settings configuration, dynamic SEO edits, and message logs.

---

## 📁 Repository Directory Structure

```
savefast/
├── index.html                   - Main Landing Page Downloader
├── about.html                   - About Us page
├── contact.html                 - Contact inquiries form
├── privacy.html                 - Privacy policy compliance
├── dmca.html                    - Copyright DMCA details
├── terms.html                   - Terms of Use conditions
├── manifest.json                - PWA configuration settings
├── sw.js                        - PWA Service Worker caching
├── robots.txt                   - Crawler permissions
├── sitemap.xml                  - Index of public routes
├── vercel.json                  - Vercel routes & API proxying rules
├── firebase.json                - Firebase hosting and configuration
├── firestore.rules              - Secure database rules
├── firestore.indexes.json       - Index queries config
├── css/
│   └── styles.css               - Core design variables and styles
├── js/
│   ├── firebase-config.js       - Firebase configuration & SDK loader
│   ├── theme.js                 - System Theme switches (Light/Dark)
│   ├── components.js            - Reusable Navbar, Footer, Ads, Related tools
│   ├── downloader.js            - Downloader UI events & API fetchers
│   └── admin.js                 - Admin panel logic and operations
├── admin/
│   └── index.html               - Dashboard panel template
└── functions/                   - Backend API scraper source code
    ├── package.json
    └── index.js
```

---

## 🛠️ Installation & Setup Guide

### 1. Local Development
1. Clone the project workspace.
2. Serve the root folder using any static web server (such as Live Server in VS Code, or `npx serve .` inside the root).
3. The application will start in dark mode by default, persisting preferences.

### 2. Firebase Database Setup
1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Cloud Firestore** database.
3. Enable **Firebase Authentication** and turn on the **Email/Password** sign-in provider.
4. Create an administrator user (e.g. `admin@savefast.in`) under the Authentication tab. This user credentials will unlock the `/admin` dashboard.
5. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 3. Deploy Cloud Functions (Backend API)
1. Install Firebase CLI locally:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and associate your project:
   ```bash
   firebase login
   firebase use --add <your-project-id>
   ```
3. Install dependencies inside the functions folder:
   ```bash
   cd functions
   npm install
   ```
4. Deploy the functions backend API:
   ```bash
   firebase deploy --only functions
   ```

### 4. Deploy Frontend to Vercel
1. Install Vercel CLI or import the repository in Vercel Dashboard.
2. Run deployment command in the root folder:
   ```bash
   vercel
   ```
3. Vercel automatically reads `vercel.json` and configures clean URL extensions, custom headers, and proxies `/api/download` requests to your deployed Firebase Functions backend.

---

## 📈 Production Checklist

- [ ] Firebase Project initialized and Auth enabled.
- [ ] Administrator login email/password created.
- [ ] Firestore security rules deployed and verified.
- [ ] Cloud Functions backend scraper online and responding.
- [ ] Sitemap URLs updated to target production domain name.
- [ ] Vercel routing verified (Clean URLs and security headers active).
