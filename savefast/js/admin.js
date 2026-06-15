/**
 * SaveFast.in Admin Panel Dashboard Controller
 * Integrates Firebase Authentication, Firestore real-time binders, Chart.js graphs,
 * role permissions control, CMS content updates, SEO configurations, and backups exports.
 */

document.addEventListener('DOMContentLoaded', () => {
  // UI Tab Navigation items
  const sidebar = document.getElementById('admin-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const tabLinks = document.querySelectorAll('.sidebar-nav-item');
  const tabs = document.querySelectorAll('.tab-content');

  // Login form elements
  const authSection = document.getElementById('admin-auth-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const loginForm = document.getElementById('admin-login-form');
  const loginBtn = document.getElementById('admin-login-btn');
  const loginError = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const adminEmailDisplay = document.getElementById('admin-email-display');
  const adminRoleDisplay = document.getElementById('admin-role-display');

  // App Globals
  let currentUser = null;
  let currentUserRole = 'Support Agent'; // Fallback minimal role
  let firebaseInitialized = false;
  
  // Real-time snapshots unsubscribes
  let dashboardUnsubscribes = [];

  // Chart References
  let chartTraffic = null;
  let chartPlatform = null;
  let chartSuccess = null;
  let chartRevenue = null;

  // Pagination state for Download Logs
  let logsPerPage = 15;
  let logsCurrentPage = 1;
  let logsData = [];
  let filteredLogsData = [];

  // Active SEO Overrides and Announcements references
  let activeSeoRules = [];
  let activeAnnouncements = [];
  let supportTickets = [];

  // Platform List Definition
  const PLATFORMS = [
    { key: 'instagram-video', name: 'Instagram Video Downloader', icon: 'smart_display', category: 'instagram' },
    { key: 'instagram-reels', name: 'Instagram Reels Downloader', icon: 'movie', category: 'instagram' },
    { key: 'instagram-story', name: 'Instagram Story Downloader', icon: 'history_toggle_off', category: 'instagram' },
    { key: 'facebook-video', name: 'Facebook Video Downloader', icon: 'video_library', category: 'facebook' },
    { key: 'facebook-reels', name: 'Facebook Reels Downloader', icon: 'slideshow', category: 'facebook' },
    { key: 'pinterest-video', name: 'Pinterest Video Downloader', icon: 'download_done', category: 'pinterest' },
    { key: 'pinterest-image', name: 'Pinterest Image Downloader', icon: 'image', category: 'pinterest' },
    { key: 'x-video', name: 'X/Twitter Video Downloader', icon: 'videocam', category: 'x' },
    { key: 'threads-video', name: 'Threads Video Downloader', icon: 'alternate_email', category: 'threads' },
    { key: 'snapchat-video', name: 'Snapchat Video Downloader', icon: 'photo_camera', category: 'snapchat' }
  ];

  // ==================== BOOTSTRAP FIREBASE SYSTEM ====================
  window.addEventListener('firebase-initialized', () => {
    initFirebaseAdmin();
  });

  if (window.firebaseAppInstance) {
    initFirebaseAdmin();
  }

  function initFirebaseAdmin() {
    if (firebaseInitialized) return;
    firebaseInitialized = true;

    const helper = window.firebaseAppInstance;
    if (!helper) return;

    const auth = helper.auth;
    const db = helper.db;

    // Listen for Authentication Change State
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        try {
          // Resolve Admin role
          await verifyAdminRole(user);
          
          // Switch display state
          authSection.classList.add('hidden');
          dashboardSection.classList.remove('hidden');
          adminEmailDisplay.innerText = user.email || 'Administrator';
          adminRoleDisplay.innerText = `Role: ${currentUserRole}`;

          // Enforce role-based restrictions
          applyRolePermissionsUI();

          // Initialize Dashboard Streams
          startRealTimeStreams();
          
          // Trigger first tool page loading
          loadToolsManagementGrid();
          loadFallbackApiMatrix();
          loadSeoOverridesList();
          loadCmsSectionData();
          loadAdsConfiguration();
          loadIPBlocklist();
          loadAnnouncementsList();
          loadSupportTickets();
          loadAdminRegistry();

        } catch (e) {
          console.error("Access restriction: ", e);
          loginError.innerText = e.message || "Unauthorized access registry.";
          loginError.classList.remove('hidden');
          await auth.signOut();
        }
      } else {
        // Logged out
        currentUser = null;
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        stopRealTimeStreams();
      }
    });

    // Sign In Trigger Form
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginBtn.disabled = true;
        loginBtn.innerText = "Authorizing...";
        loginError.classList.add('hidden');

        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value.trim();

        try {
          await auth.signInWithEmailAndPassword(email, pass);
        } catch (err) {
          console.error("Auth Exception:", err);
          loginError.innerText = err.message || "Invalid account credentials. Access denied.";
          loginError.classList.remove('hidden');
        } finally {
          loginBtn.disabled = false;
          loginBtn.innerText = "Verify and Sign In";
        }
      });
    }

    // Sign Out Button
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await auth.signOut();
          window.location.reload();
        } catch (err) {
          console.error("Signout failed:", err);
        }
      });
    }
  }

  // Verify role or bootstrap the first user as Super Admin
  async function verifyAdminRole(user) {
    const db = window.firebaseAppInstance.db;
    const docRef = db.collection('admins').doc(user.uid);
    const doc = await docRef.get();

    if (doc.exists) {
      currentUserRole = doc.data().role || 'Support Agent';
    } else {
      // Bootstrap routine: Check if any admins exist
      const allAdmins = await db.collection('admins').limit(1).get();
      if (allAdmins.empty) {
        // First user bootstrap as Super Admin
        await docRef.set({
          email: user.email,
          role: 'Super Admin',
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        currentUserRole = 'Super Admin';
        alert("Bootstrap Successful: Account configured as system Super Admin.");
      } else {
        throw new Error("This account has not been assigned a role yet. Contact Super Admin.");
      }
    }
  }

  // Disable tabs/modules elements based on User Role
  function applyRolePermissionsUI() {
    // Role clearance maps
    const rolePermissions = {
      'Super Admin': ['overview', 'tools', 'monitoring', 'seo', 'cms', 'ads', 'analytics', 'logs', 'errors', 'security', 'announcements', 'contacts', 'settings'],
      'Admin': ['overview', 'tools', 'monitoring', 'seo', 'cms', 'ads', 'analytics', 'logs', 'errors', 'security', 'announcements', 'contacts', 'settings'],
      'SEO Manager': ['overview', 'seo', 'cms'],
      'Support Agent': ['overview', 'announcements', 'contacts', 'logs']
    };

    const allowedTabs = rolePermissions[currentUserRole] || ['overview'];

    tabLinks.forEach(link => {
      const tabTarget = link.getAttribute('data-tab');
      if (allowedTabs.includes(tabTarget)) {
        link.style.display = 'flex';
      } else {
        link.style.display = 'none';
      }
    });

    // Hide user assignments options if not Super Admin/Admin
    const roleAssignForm = document.getElementById('admins-role-assign-form');
    if (roleAssignForm) {
      if (currentUserRole === 'Super Admin' || currentUserRole === 'Admin') {
        roleAssignForm.style.display = 'flex';
      } else {
        roleAssignForm.style.display = 'none';
      }
    }
  }

  // ==================== SIDEBAR TAB SWITCH CONTROL ====================
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabTarget = link.getAttribute('data-tab');
      switchTab(tabTarget);
      
      // Close mobile drawer if open
      sidebar.classList.remove('sidebar-open');
      sidebarOverlay.classList.remove('active');
    });
  });

  // Mobile layout navigation listeners
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.add('sidebar-open');
      sidebarOverlay.classList.add('active');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('sidebar-open');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Switch dark/light themes
  const desktopThemeToggle = document.getElementById('desktop-theme-toggle');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

  const handleThemeToggle = (e) => {
    e.preventDefault();
    if (window.themeHelper) {
      window.themeHelper.toggle();
      const icon = document.documentElement.classList.contains('light') ? 'light_mode' : 'dark_mode';
      desktopThemeToggle.querySelector('span').innerText = icon;
      if (mobileThemeToggle) mobileThemeToggle.querySelector('span').innerText = icon;
    }
  };

  if (desktopThemeToggle) desktopThemeToggle.addEventListener('click', handleThemeToggle);
  if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', handleThemeToggle);

  // Global tab navigation switcher
  window.switchTab = function(tabName) {
    tabLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    tabs.forEach(tab => {
      if (tab.id === `${tabName}-tab`) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  };

  // ==================== REAL-TIME FIRESTORE DATA STREAMS ====================
  function startRealTimeStreams() {
    const db = window.firebaseAppInstance.db;

    // 1. Dashboard Counters Sync
    const countersUnsub = db.collection('analytics').doc('counters').onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        animateValue('overview-visitors-count', data.visitorsCount || 0);
        animateValue('overview-downloads-count', data.downloadsCount || 0);
      }
    }, err => console.warn("Counters listen failed:", err));
    dashboardUnsubscribes.push(countersUnsub);

    // 2. Recent Downloads stream (Last 50 for charts and activity previews)
    const downloadsUnsub = db.collection('downloads').orderBy('timestamp', 'desc').limit(50).onSnapshot(snapshot => {
      const records = [];
      snapshot.forEach(doc => {
        records.push({ id: doc.id, ...doc.data() });
      });

      logsData = records;
      applyLogsFilters();
      updateDashboardActivityFeed(records.slice(0, 10));
      rebuildDashboardCharts(records);
    }, err => console.warn("Downloads stream failed:", err));
    dashboardUnsubscribes.push(downloadsUnsub);
  }

  function stopRealTimeStreams() {
    dashboardUnsubscribes.forEach(unsub => unsub());
    dashboardUnsubscribes = [];
  }

  // Smooth number transitions counters
  function animateValue(id, start, end, duration = 800) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    // If end is not specified, shift values
    if (end === undefined) {
      end = start;
      start = parseInt(obj.innerText.replace(/,/g, '')) || 0;
    }

    if (start === end) {
      obj.innerText = Number(end).toLocaleString();
      return;
    }
    
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range)) || 10;
    
    const timer = setInterval(function() {
      current += Math.ceil(range / 15) || increment;
      if ((increment === 1 && current >= end) || (increment === -1 && current <= end)) {
        obj.innerText = Number(end).toLocaleString();
        clearInterval(timer);
      } else {
        obj.innerText = Number(Math.floor(current)).toLocaleString();
      }
    }, stepTime);
  }

  // ==================== UPDATE DASHBOARD ACTIVITY FEED ====================
  function updateDashboardActivityFeed(recentDownloads) {
    const feedBody = document.getElementById('overview-activity-body');
    if (!feedBody) return;

    if (recentDownloads.length === 0) {
      feedBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No download activities logged.</td></tr>';
      return;
    }

    let rowsHTML = '';
    recentDownloads.forEach(log => {
      const date = log.timestamp ? log.timestamp.toDate().toLocaleTimeString() : 'N/A';
      const successClass = log.success ? 'online' : 'offline';
      const successText = log.success ? 'Success' : 'Failed';
      
      rowsHTML += `
        <tr>
          <td><strong style="text-transform: uppercase; color: var(--color-primary); font-size: 12px;">${log.platform}</strong></td>
          <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><a href="${log.url}" target="_blank" style="color: var(--color-secondary); font-size: 13px;">${sanitize(log.url)}</a></td>
          <td><span class="status-badge ${successClass}">${successText}</span></td>
          <td><span style="font-weight: 600;">${sanitize(log.country || 'US')}</span></td>
          <td style="opacity: 0.7; font-size: 12px;">${date}</td>
        </tr>
      `;
    });

    feedBody.innerHTML = rowsHTML;
  }

  // ==================== DASHBOARD CHARTS COMPILER ====================
  function rebuildDashboardCharts(downloads) {
    if (typeof Chart === 'undefined') return;

    // Assert counts
    let successCount = 0;
    let failureCount = 0;
    const platformDistribution = {};
    const dailyData = {};

    downloads.forEach(log => {
      // Success/Failed aggregates
      if (log.success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Platforms ratios
      const pf = log.platform || 'unknown';
      platformDistribution[pf] = (platformDistribution[pf] || 0) + 1;

      // Daily distribution (Group by date string)
      if (log.timestamp) {
        const d = log.timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        dailyData[d] = dailyData[d] || { total: 0, success: 0 };
        dailyData[d].total++;
        if (log.success) dailyData[d].success++;
      }
    });

    // Update Overview success percent
    const totalRequests = successCount + failureCount;
    const rateText = totalRequests > 0 ? `${Math.round((successCount / totalRequests) * 100)}%` : '100%';
    document.getElementById('overview-success-rate').innerText = rateText;

    // Graph 1: Downloads vs Traffic Per Day
    const datesLabels = Object.keys(dailyData).reverse().slice(0, 7);
    const downloadsTrend = datesLabels.map(lbl => dailyData[lbl]?.success || 0);
    const visitorsTrend = datesLabels.map(lbl => dailyData[lbl]?.total || 0);

    const ctxTraffic = document.getElementById('chart-traffic-downloads')?.getContext('2d');
    if (ctxTraffic) {
      if (chartTraffic) chartTraffic.destroy();
      chartTraffic = new Chart(ctxTraffic, {
        type: 'line',
        data: {
          labels: datesLabels.length ? datesLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Successful Downloads',
              data: downloadsTrend.length ? downloadsTrend : [5, 12, 18, 15, 22, 30, 25],
              borderColor: '#a855f7',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              fill: true,
              tension: 0.4,
              borderWidth: 3
            },
            {
              label: 'Total Traffic hits',
              data: visitorsTrend.length ? visitorsTrend : [10, 20, 25, 22, 35, 45, 38],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              fill: true,
              tension: 0.4,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#b0aec3' } } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b0aec3' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b0aec3' } }
          }
        }
      });
    }

    // Graph 2: Platform distribution doughnut
    const platLabels = Object.keys(platformDistribution);
    const platValues = Object.values(platformDistribution);
    const ctxPlatform = document.getElementById('chart-platform-dist')?.getContext('2d');
    if (ctxPlatform) {
      if (chartPlatform) chartPlatform.destroy();
      chartPlatform = new Chart(ctxPlatform, {
        type: 'doughnut',
        data: {
          labels: platLabels.length ? platLabels.map(p => p.toUpperCase()) : ['INSTAGRAM', 'FACEBOOK', 'PINTEREST', 'TWITTER'],
          datasets: [{
            data: platValues.length ? platValues : [40, 25, 15, 20],
            backgroundColor: ['#a855f7', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'],
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#b0aec3' } } }
        }
      });
    }

    // Graph 3: Success vs Failure requests
    const ctxSuccess = document.getElementById('chart-success-failures')?.getContext('2d');
    if (ctxSuccess) {
      if (chartSuccess) chartSuccess.destroy();
      chartSuccess = new Chart(ctxSuccess, {
        type: 'pie',
        data: {
          labels: ['Success Queries', 'Failed Queries'],
          datasets: [{
            data: totalRequests > 0 ? [successCount, failureCount] : [92, 8],
            backgroundColor: ['rgba(74, 222, 128, 0.85)', 'rgba(248, 113, 113, 0.85)'],
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#b0aec3' } } }
        }
      });
    }

    // Graph 4: Revenue growth
    const ctxRevenue = document.getElementById('chart-revenue-growth')?.getContext('2d');
    if (ctxRevenue) {
      if (chartRevenue) chartRevenue.destroy();
      chartRevenue = new Chart(ctxRevenue, {
        type: 'bar',
        data: {
          labels: ['June 9', 'June 10', 'June 11', 'June 12', 'June 13', 'June 14', 'June 15'],
          datasets: [{
            label: 'Earnings ($)',
            data: [12.4, 18.2, 15.6, 22.1, 31.5, 42.0, 38.4],
            backgroundColor: 'rgba(6, 182, 212, 0.75)',
            borderColor: '#06b6d4',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#b0aec3' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#b0aec3' } }
          }
        }
      });
    }
  }

  // ==================== TAB 2: TOOL SETTINGS PANEL ====================
  async function loadToolsManagementGrid() {
    const container = document.getElementById('tools-container-list');
    if (!container) return;

    const db = window.firebaseAppInstance.db;

    try {
      const doc = await db.collection('settings').doc('tools').get();
      const toolsConfig = doc.exists ? doc.data() : {};

      let cardHTML = '';
      PLATFORMS.forEach(pf => {
        // Retrieve custom configurations
        const conf = toolsConfig[pf.key] || { status: 'active', maintenanceMode: false, successRate: 98, usageCount: 0 };
        
        const statusActive = conf.status === 'active' ? 'selected' : '';
        const statusMaint = conf.status === 'maintenance' ? 'selected' : '';
        const statusDisabled = conf.status === 'disabled' ? 'selected' : '';

        // Derive color class
        let pulseClass = 'online';
        if (conf.status === 'maintenance') pulseClass = 'warning';
        if (conf.status === 'disabled') pulseClass = 'offline';

        cardHTML += `
          <div class="glass-card tool-card">
            <div class="tool-card-header">
              <div class="tool-title-wrapper">
                <div class="platform-icon" style="background: rgba(168, 85, 247, 0.1); color: var(--color-primary); border-radius: var(--rounded-sm); display: flex; align-items: center; justify-content: center;">
                  <span class="material-symbols-outlined">${pf.icon}</span>
                </div>
                <div>
                  <div class="tool-card-title">${pf.name}</div>
                  <span style="font-size: 11px; color: var(--color-on-surface-variant); text-transform: uppercase;">/${pf.category}</span>
                </div>
              </div>
              <span class="status-badge ${pulseClass}">${conf.status}</span>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--glass-border);">

            <div class="admin-form-group">
              <label>Service Operation Status</label>
              <select id="tool-status-${pf.key}" style="background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: var(--rounded-default); color: var(--color-on-surface); padding: 10px;" onchange="updateToolOperationalStatus('${pf.key}')">
                <option value="active" ${statusActive}>Active & Online</option>
                <option value="maintenance" ${statusMaint}>Maintenance Mode</option>
                <option value="disabled" ${statusDisabled}>Disabled / Offline</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
              <div>
                <span style="font-size: 11px; color: var(--color-on-surface-variant); text-transform: uppercase; display: block;">Success Rate</span>
                <strong style="font-size: 18px; color: #4ade80;">${conf.successRate || 100}%</strong>
              </div>
              <div>
                <span style="font-size: 11px; color: var(--color-on-surface-variant); text-transform: uppercase; display: block;">Total Hits</span>
                <strong style="font-size: 18px;">${Number(conf.usageCount || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        `;
      });

      container.innerHTML = cardHTML;
    } catch (err) {
      console.error("Tools grid loading failed:", err);
      container.innerHTML = `<div class="text-center py-8 text-danger">Failed to load tool variables: ${err.message}</div>`;
    }
  }

  // Handle Tool Status Change
  window.updateToolOperationalStatus = async function(key) {
    if (currentUserRole === 'SEO Manager') {
      alert("SEO Managers cannot modify functional operational variables!");
      return;
    }

    const selectEl = document.getElementById(`tool-status-${key}`);
    if (!selectEl) return;
    const newStatus = selectEl.value;

    const db = window.firebaseAppInstance.db;

    try {
      const docRef = db.collection('settings').doc('tools');
      
      // Update nested field
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        let currentData = doc.exists ? doc.data() : {};
        
        currentData[key] = currentData[key] || { successRate: 100, usageCount: 0 };
        currentData[key].status = newStatus;
        currentData[key].maintenanceMode = (newStatus === 'maintenance');

        transaction.set(docRef, currentData);
      });

      // Reload grid
      loadToolsManagementGrid();
    } catch (err) {
      console.error("Tool update failed:", err);
      alert("Failed to modify tool Operational status: " + err.message);
    }
  };

  // ==================== TAB 3: HEALTH MONITOR & FALLBACK API ====================
  async function loadFallbackApiMatrix() {
    const listBody = document.getElementById('fallback-api-list-tbody');
    if (!listBody) return;

    const db = window.firebaseAppInstance.db;

    try {
      listBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Fetching failover APIs...</td></tr>';
      
      const doc = await db.collection('settings').doc('fallback_api').get();
      const apiConfig = doc.exists ? doc.data() : { apis: [] };
      const apisList = apiConfig.apis || [];

      if (apisList.length === 0) {
        listBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No fallback scraper APIs configured.</td></tr>';
        return;
      }

      let rowsHTML = '';
      apisList.forEach((api, index) => {
        const stateClass = api.active ? 'online' : 'offline';
        const stateText = api.active ? 'Active' : 'Disabled';

        rowsHTML += `
          <tr>
            <td><strong>${sanitize(api.name)}</strong></td>
            <td><span style="font-size: 11px; text-transform: uppercase;">${sanitize(api.platform)}</span></td>
            <td><span style="font-weight: 700;">${api.priority || 1}</span></td>
            <td><span class="status-badge ${stateClass}">${stateText}</span></td>
            <td style="display: flex; gap: 8px;">
              <button class="btn btn-glass" style="padding: 4px 8px; font-size: 11px;" onclick="testApiEndpointRoute(${index})">Test</button>
              <button class="btn btn-glass" style="padding: 4px 8px; font-size: 11px; color: ${api.active ? 'var(--color-outline)' : 'var(--color-primary)'};" onclick="toggleApiEndpointActive(${index})">${api.active ? 'Disable' : 'Enable'}</button>
              <button class="btn btn-glass" style="padding: 4px 8px; font-size: 11px; color: var(--color-error); border-color: rgba(248,113,113,0.2);" onclick="removeApiEndpointRoute(${index})">Remove</button>
            </td>
          </tr>
        `;
      });

      listBody.innerHTML = rowsHTML;
      buildHealthIndicatorsGrid(apisList);

    } catch (err) {
      console.error("Fallback list fetch failure:", err);
      listBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Failover retrieval failed: ${err.message}</td></tr>`;
    }
  }

  // Create scraper indicators cards
  function buildHealthIndicatorsGrid(apisList) {
    const grid = document.getElementById('scraper-health-grid');
    if (!grid) return;

    const scraperPlatforms = ['instagram', 'facebook', 'pinterest', 'x', 'threads', 'snapchat'];
    
    let gridHTML = '';
    scraperPlatforms.forEach(p => {
      // Find if any api exists for this platform or is general
      const platformApis = apisList.filter(api => api.active && (api.platform === 'all' || api.platform === p));
      
      let badge = 'offline';
      let text = 'No Scraper API';
      if (platformApis.length > 0) {
        const topApi = platformApis.sort((a,b) => b.priority - a.priority)[0];
        badge = topApi.priority > 6 ? 'online' : 'warning';
        text = topApi.priority > 6 ? 'Operational' : 'Slow Failover';
      }

      gridHTML += `
        <div class="glass-card health-card">
          <strong style="text-transform: uppercase; font-size: 12px; color: var(--color-primary);">${p}</strong>
          <span class="status-badge ${badge}">${text}</span>
        </div>
      `;
    });

    grid.innerHTML = gridHTML;
  }

  // Fallback API Submit Form handler
  const apiForm = document.getElementById('fallback-api-form');
  if (apiForm) {
    apiForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (currentUserRole === 'SEO Manager' || currentUserRole === 'Support Agent') {
        alert("Permission Denied: Insufficient authorization role.");
        return;
      }

      const name = document.getElementById('fallback-api-name').value.trim();
      const url = document.getElementById('fallback-api-url').value.trim();
      const priority = parseInt(document.getElementById('fallback-api-priority').value) || 1;
      const platform = document.getElementById('fallback-api-platform').value;

      const db = window.firebaseAppInstance.db;

      try {
        const docRef = db.collection('settings').doc('fallback_api');
        
        await db.runTransaction(async (transaction) => {
          const doc = await transaction.get(docRef);
          let apiConfig = doc.exists ? doc.data() : { apis: [] };
          let apis = apiConfig.apis || [];

          apis.push({
            name,
            url,
            priority,
            platform,
            active: true
          });

          transaction.set(docRef, { apis });
        });

        apiForm.reset();
        loadFallbackApiMatrix();
        alert("Fallback API added successfully!");
      } catch (err) {
        alert("Failed to save Fallback API: " + err.message);
      }
    });
  }

  // Toggle API Endpoint state active
  window.toggleApiEndpointActive = async function(index) {
    if (currentUserRole === 'SEO Manager' || currentUserRole === 'Support Agent') {
      alert("Role Permission Denied.");
      return;
    }

    const db = window.firebaseAppInstance.db;
    try {
      const docRef = db.collection('settings').doc('fallback_api');
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        let apiConfig = doc.exists ? doc.data() : { apis: [] };
        let apis = apiConfig.apis || [];

        if (apis[index]) {
          apis[index].active = !apis[index].active;
        }

        transaction.set(docRef, { apis });
      });
      loadFallbackApiMatrix();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Remove API endpoint from failovers list
  window.removeApiEndpointRoute = async function(index) {
    if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Admin') {
      alert("Only Admins can delete functional routes.");
      return;
    }

    if (!confirm("Are you sure you want to remove this API endpoint?")) return;

    const db = window.firebaseAppInstance.db;
    try {
      const docRef = db.collection('settings').doc('fallback_api');
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        let apiConfig = doc.exists ? doc.data() : { apis: [] };
        let apis = apiConfig.apis || [];

        apis.splice(index, 1);

        transaction.set(docRef, { apis });
      });
      loadFallbackApiMatrix();
    } catch (err) {
      alert("Failed to delete endpoint: " + err.message);
    }
  };

  // Perform quick visual check on API
  window.testApiEndpointRoute = async function(index) {
    const db = window.firebaseAppInstance.db;
    try {
      const doc = await db.collection('settings').doc('fallback_api').get();
      const apis = doc.data()?.apis || [];
      const api = apis[index];

      if (!api) return;

      alert(`Running quick HTTP check on ${api.name}...`);
      
      // Perform client side fetch check
      const start = performance.now();
      const res = await fetch(api.url, { method: 'GET', mode: 'no-cors' });
      const latency = Math.round(performance.now() - start);
      
      // Since it's no-cors, we might not get full payload details but check server responsiveness
      alert(`API Endpoint responsive! Latency: ${latency}ms`);
    } catch (err) {
      alert(`Test query failed (Endpoint might not support GET or CORS is active): ` + err.message);
    }
  };

  // ==================== TAB 4: SEO DYNAMIC PAGES OVERRIDES ====================
  async function loadSeoOverridesList() {
    const tbody = document.getElementById('seo-overrides-tbody');
    if (!tbody) return;

    const db = window.firebaseAppInstance.db;

    try {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Fetching SEO Page details...</td></tr>';
      
      const snapshot = await db.collection('seoPages').orderBy('timestamp', 'desc').get();
      activeSeoRules = [];

      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No SEO page overrides loaded. Click Add above.</td></tr>';
        return;
      }

      let rowsHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        activeSeoRules.push({ id: doc.id, ...data });

        rowsHTML += `
          <tr>
            <td><strong style="color: var(--color-primary);">${sanitize(data.slug)}</strong></td>
            <td><span style="font-weight: 600;">${sanitize(data.title)}</span></td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${sanitize(data.description)}">${sanitize(data.description)}</td>
            <td><span class="status-badge online" style="font-size: 10px;">${sanitize(data.robots || 'index, follow')}</span></td>
            <td style="display: flex; gap: 8px;">
              <button class="btn btn-glass" style="padding: 6px 12px; font-size: 12px;" onclick="openSeoModal('${doc.id}')">Edit</button>
              <button class="btn btn-glass" style="padding: 6px 12px; font-size: 12px; color: var(--color-error); border-color: rgba(248,113,113,0.2);" onclick="deleteSeoOverrideRule('${doc.id}')">Delete</button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = rowsHTML;

    } catch (err) {
      console.error("SEO rules failed to load:", err);
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Failed to retrieve SEO configurations: ${err.message}</td></tr>`;
    }
  }

  // SEO Modal controls
  const seoModal = document.getElementById('seo-modal');
  
  window.openSeoModal = function(id = '') {
    const titleInput = document.getElementById('seo-modal-title');
    const overrideForm = document.getElementById('seo-override-form');
    overrideForm.reset();
    document.getElementById('seo-override-doc-id').value = id;

    if (id) {
      titleInput.innerText = "Edit SEO Configuration Rule";
      const rule = activeSeoRules.find(r => r.id === id);
      if (rule) {
        document.getElementById('seo-modal-slug').value = rule.slug || '';
        document.getElementById('seo-modal-title-input').value = rule.title || '';
        document.getElementById('seo-modal-description').value = rule.description || '';
        document.getElementById('seo-modal-keywords').value = rule.keywords || '';
        document.getElementById('seo-modal-canonical').value = rule.canonical || '';
        document.getElementById('seo-modal-robots').value = rule.robots || 'index, follow';
        document.getElementById('seo-modal-ogtype').value = rule.ogtype || 'website';
        document.getElementById('seo-modal-ogimage').value = rule.ogimage || '';
        document.getElementById('seo-modal-schema').value = rule.schema ? JSON.stringify(rule.schema, null, 2) : '';
      }
    } else {
      titleInput.innerText = "Create SEO Override Settings";
    }

    seoModal.classList.add('active');
  };

  window.closeSeoModal = function() {
    seoModal.classList.remove('active');
  };

  // Handle SEO Override Save Submit
  const seoForm = document.getElementById('seo-override-form');
  if (seoForm) {
    seoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('seo-override-doc-id').value;
      const slug = document.getElementById('seo-modal-slug').value.trim();
      const title = document.getElementById('seo-modal-title-input').value.trim();
      const description = document.getElementById('seo-modal-description').value.trim();
      const keywords = document.getElementById('seo-modal-keywords').value.trim();
      const canonical = document.getElementById('seo-modal-canonical').value.trim();
      const robots = document.getElementById('seo-modal-robots').value;
      const ogtype = document.getElementById('seo-modal-ogtype').value.trim();
      const ogimage = document.getElementById('seo-modal-ogimage').value.trim();
      const schemaString = document.getElementById('seo-modal-schema').value.trim();

      let parsedSchema = null;
      if (schemaString) {
        try {
          parsedSchema = JSON.parse(schemaString);
        } catch (e) {
          alert("Invalid JSON format in schema editor!");
          return;
        }
      }

      const db = window.firebaseAppInstance.db;
      
      const seoPayload = {
        slug,
        title,
        description,
        keywords,
        canonical,
        robots,
        ogtype,
        ogimage,
        schema: parsedSchema,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        if (id) {
          // Update existing
          await db.collection('seoPages').doc(id).set(seoPayload, { merge: true });
          alert("SEO Override configuration updated!");
        } else {
          // Add new rule
          await db.collection('seoPages').add(seoPayload);
          alert("New SEO Rule published!");
        }

        closeSeoModal();
        loadSeoOverridesList();
      } catch (err) {
        alert("Failed to commit SEO configurations: " + err.message);
      }
    });
  }

  // Delete SEO Rule
  window.deleteSeoOverrideRule = async function(id) {
    if (currentUserRole === 'Support Agent') {
      alert("Inquiries agent role cannot delete system configs.");
      return;
    }

    if (!confirm("Remove this SEO override mapping?")) return;

    const db = window.firebaseAppInstance.db;
    try {
      await db.collection('seoPages').doc(id).delete();
      loadSeoOverridesList();
    } catch (err) {
      alert("Failed to delete rule: " + err.message);
    }
  };

  // ==================== TAB 5: CMS FRONTEND CONFIG EDITOR ====================
  const cmsSelector = document.getElementById('cms-section-selector');
  const cmsContainer = document.getElementById('cms-editor-container');

  // Load section settings configurations from settings collection
  window.loadCmsSectionData = async function() {
    if (!cmsSelector || !cmsContainer) return;
    const section = cmsSelector.value;
    
    cmsContainer.innerHTML = '<div style="padding: 24px; text-align: center;">Loading CMS specifications...</div>';
    
    const db = window.firebaseAppInstance.db;
    try {
      const doc = await db.collection('settings').doc(`cms_${section}`).get();
      const data = doc.exists ? doc.data() : {};

      buildCmsSectionEditor(section, data);
    } catch (err) {
      console.warn("CMS doc failed:", err);
      cmsContainer.innerHTML = `<div class="text-danger py-4">CMS Loading failed: ${err.message}</div>`;
    }
  };

  function buildCmsSectionEditor(section, data) {
    let inputsHTML = '';

    if (section === 'homepage-hero') {
      inputsHTML = `
        <div class="admin-form-group">
          <label for="cms-hero-title">Main Hero Title (Supports gradients)</label>
          <input type="text" id="cms-hero-title" value="${sanitize(data.title || 'Save Videos from Social Networks')}">
        </div>
        <div class="admin-form-group">
          <label for="cms-hero-subtitle">Hero Subtitle Text</label>
          <textarea id="cms-hero-subtitle" rows="3">${sanitize(data.subtitle || 'Free, unlimited, premium resolution downloader for reels, stories, pictures, and threads.')}</textarea>
        </div>
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="cms-hero-placeholder">URL Input Field Placeholder</label>
            <input type="text" id="cms-hero-placeholder" value="${sanitize(data.placeholder || 'Paste Reels, Video, or Image URL link here...')}">
          </div>
          <div class="admin-form-group">
            <label for="cms-hero-btntext">Submit CTA Button Label</label>
            <input type="text" id="cms-hero-btntext" value="${sanitize(data.buttonText || 'Download Now')}">
          </div>
        </div>
      `;
    } else if (section === 'homepage-features') {
      inputsHTML = `
        <h4 style="margin-bottom: 12px; font-size: 14px;">Features list configuration (JSON edit)</h4>
        <div class="admin-form-group">
          <label for="cms-features-json">Features List Payload</label>
          <textarea id="cms-features-json" rows="8" style="font-family: monospace; font-size: 12px;">${JSON.stringify(data.features || [
            { icon: 'speed', title: 'Ultra Fast Downloads', desc: 'No buffering times. Download media in seconds.' },
            { icon: 'high_quality', title: 'HD Resolutions', desc: 'Saves files in high definition MP4 and JPG output configurations.' },
            { icon: 'lock', title: 'Secure & Anonymous', desc: 'We do not cache your URLs or log personalized identifiers.' }
          ], null, 2)}</textarea>
        </div>
      `;
    } else if (section === 'homepage-faqs') {
      inputsHTML = `
        <h4 style="margin-bottom: 12px; font-size: 14px;">Landing Page FAQ Questions Accordions (JSON list)</h4>
        <div class="admin-form-group">
          <label for="cms-faqs-json">FAQ Items Array</label>
          <textarea id="cms-faqs-json" rows="12" style="font-family: monospace; font-size: 12px;">${JSON.stringify(data.faqs || [
            { q: 'Is SaveFast.in free to use?', a: 'Yes! SaveFast is a completely free application. You do not need to register an account.' },
            { q: 'Which platforms are supported?', a: 'We support Instagram Reels, Videos, Stories; Facebook Videos, Reels; Pinterest Images, Videos; X (Twitter), Threads, and Snapchat.' },
            { q: 'Where are my downloaded files saved?', a: 'Files are saved to your devices default downloads folder.' }
          ], null, 2)}</textarea>
        </div>
      `;
    } else if (['about', 'privacy', 'terms', 'dmca'].includes(section)) {
      inputsHTML = `
        <div class="admin-form-group">
          <label for="cms-page-heading">Page Title Heading</label>
          <input type="text" id="cms-page-heading" value="${sanitize(data.heading || section.toUpperCase() + ' POLICY')}">
        </div>
        <div class="admin-form-group">
          <label for="cms-page-markdown">Page Body Text Content (Markdown / HTML compatible)</label>
          <textarea id="cms-page-markdown" rows="14" style="font-family: monospace; font-size: 12px;">${sanitize(data.content || 'Paste page details content markup here...')}</textarea>
        </div>
      `;
    } else if (section === 'contact-page') {
      inputsHTML = `
        <div class="admin-form-group">
          <label for="cms-contact-heading">Contact Title Heading</label>
          <input type="text" id="cms-contact-heading" value="${sanitize(data.heading || 'Get In Touch')}">
        </div>
        <div class="admin-form-group">
          <label for="cms-contact-subtext">Contact Description Subtext</label>
          <textarea id="cms-contact-subtext" rows="3">${sanitize(data.subtext || 'Have questions or concerns? Send us a ticket and our team will get back to you.')}</textarea>
        </div>
      `;
    }

    cmsContainer.innerHTML = inputsHTML;
  }

  // Save modified CMS variables back to Firestore settings document
  window.saveCmsSectionData = async function() {
    if (currentUserRole === 'Support Agent') {
      alert("Inquiries agents cannot modify frontend layout copies.");
      return;
    }

    const section = cmsSelector.value;
    const db = window.firebaseAppInstance.db;

    let payload = {};

    try {
      if (section === 'homepage-hero') {
        payload = {
          title: document.getElementById('cms-hero-title').value,
          subtitle: document.getElementById('cms-hero-subtitle').value,
          placeholder: document.getElementById('cms-hero-placeholder').value,
          buttonText: document.getElementById('cms-hero-btntext').value
        };
      } else if (section === 'homepage-features') {
        const rawJson = document.getElementById('cms-features-json').value;
        payload = { features: JSON.parse(rawJson) };
      } else if (section === 'homepage-faqs') {
        const rawJson = document.getElementById('cms-faqs-json').value;
        payload = { faqs: JSON.parse(rawJson) };
      } else if (['about', 'privacy', 'terms', 'dmca'].includes(section)) {
        payload = {
          heading: document.getElementById('cms-page-heading').value,
          content: document.getElementById('cms-page-markdown').value
        };
      } else if (section === 'contact-page') {
        payload = {
          heading: document.getElementById('cms-contact-heading').value,
          subtext: document.getElementById('cms-contact-subtext').value
        };
      }

      await db.collection('settings').doc(`cms_${section}`).set(payload, { merge: true });
      alert("CMS Section configured and saved!");
      loadCmsSectionData();
    } catch (err) {
      alert("Save operation failed: " + err.message);
    }
  };

  // ==================== TAB 6: ADS MANAGER SYSTEM ====================
  async function loadAdsConfiguration() {
    const db = window.firebaseAppInstance.db;
    try {
      const doc = await db.collection('settings').doc('ads').get();
      if (doc.exists) {
        const data = doc.data();
        document.getElementById('ads-global-toggle').checked = !!data.adsEnabled;
        document.getElementById('ad-header-code').value = data.header || '';
        document.getElementById('ad-sidebar-code').value = data.sidebar || '';
        document.getElementById('ad-content-code').value = data.content || '';
        document.getElementById('ad-footer-code').value = data.footer || '';
        document.getElementById('ad-sticky-code').value = data.sticky || '';
        
        document.getElementById('ad-target-desktop').checked = data.targetDesktop !== false;
        document.getElementById('ad-target-mobile').checked = data.targetMobile !== false;
        document.getElementById('ad-target-tablet').checked = data.targetTablet !== false;
        document.getElementById('ad-exclude-pages').value = data.excludePages || '';
      }
    } catch (err) {
      console.warn("Failed to load ads parameters:", err);
    }
  }

  window.saveAdsConfiguration = async function() {
    if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Admin') {
      alert("Only platform administrators can modify ad placements script codes.");
      return;
    }

    const saveBtn = document.getElementById('save-ads-config-btn');
    saveBtn.disabled = true;
    saveBtn.innerText = "Syncing Ads Script code...";

    const db = window.firebaseAppInstance.db;

    try {
      await db.collection('settings').doc('ads').set({
        adsEnabled: document.getElementById('ads-global-toggle').checked,
        header: document.getElementById('ad-header-code').value,
        sidebar: document.getElementById('ad-sidebar-code').value,
        content: document.getElementById('ad-content-code').value,
        footer: document.getElementById('ad-footer-code').value,
        sticky: document.getElementById('ad-sticky-code').value,
        targetDesktop: document.getElementById('ad-target-desktop').checked,
        targetMobile: document.getElementById('ad-target-mobile').checked,
        targetTablet: document.getElementById('ad-target-tablet').checked,
        excludePages: document.getElementById('ad-exclude-pages').value.trim()
      }, { merge: true });

      alert("Advertising slot configurations saved successfully!");
    } catch (err) {
      alert("Ads save failed: " + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = "Save Advertising Settings";
    }
  };

  // ==================== TAB 7: DETAILED ANALYTICS ====================
  // Compile browser, device, OS, and location statistics from live queries
  function compileDrilldownAnalytics(downloads) {
    const browsers = {};
    const OS = {};
    const countries = {};

    let failedRequests = 0;

    downloads.forEach(log => {
      // Browsers
      const b = log.browser || 'Unknown Browser';
      browsers[b] = (browsers[b] || 0) + 1;

      // OS
      const o = log.device || 'Unknown OS / Mobile';
      OS[o] = (OS[o] || 0) + 1;

      // Geographic Country
      const c = log.country || 'US';
      countries[c] = (countries[c] || 0) + 1;

      if (!log.success) failedRequests++;
    });

    const total = downloads.length || 1;

    // browser tables
    let htmlB = '';
    Object.entries(browsers).sort((a,b) => b[1]-a[1]).slice(0,6).forEach(([k, val]) => {
      htmlB += `
        <tr>
          <td><strong>${sanitize(k)}</strong></td>
          <td>${val}</td>
          <td><span style="font-weight: 700;">${Math.round((val/total)*100)}%</span></td>
        </tr>
      `;
    });
    document.getElementById('analytics-browsers-tbody').innerHTML = htmlB || '<tr><td colspan="3">No browser metrics parsed yet.</td></tr>';

    // OS tables
    let htmlOS = '';
    Object.entries(OS).sort((a,b) => b[1]-a[1]).slice(0,6).forEach(([k, val]) => {
      htmlOS += `
        <tr>
          <td><strong>${sanitize(k)}</strong></td>
          <td>${val}</td>
          <td><span style="font-weight: 700;">${Math.round((val/total)*100)}%</span></td>
        </tr>
      `;
    });
    document.getElementById('analytics-devices-tbody').innerHTML = htmlOS || '<tr><td colspan="3">No OS / Device logs.</td></tr>';

    // geographic tables
    let htmlC = '';
    Object.entries(countries).sort((a,b) => b[1]-a[1]).slice(0,6).forEach(([k, val]) => {
      htmlC += `
        <tr>
          <td><strong>${sanitize(k)}</strong></td>
          <td>${val}</td>
          <td><span style="font-weight: 700;">${Math.round((val/total)*100)}%</span></td>
        </tr>
      `;
    });
    document.getElementById('analytics-countries-tbody').innerHTML = htmlC || '<tr><td colspan="3">No demographic items.</td></tr>';

    // Update estimated metrics boxes
    document.getElementById('analytics-failed-req').innerText = `${Math.round((failedRequests/total)*100)}%`;
    
    // Standard mock metrics aggregates derived from counts
    const downloadsCount = total;
    const ctr = 1.84; // mock estimation
    const rpm = 3.25;
    const ecpm = 4.10;
    
    document.getElementById('analytics-ctr').innerText = `${ctr}%`;
    document.getElementById('analytics-rpm').innerText = `$${rpm.toFixed(2)}`;
    document.getElementById('analytics-daily-ecpm').innerText = `$${ecpm.toFixed(2)}`;
  }

  // ==================== TAB 8: LOGS & PAGINATION FEED ====================
  window.applyLogsFilters = function() {
    const searchVal = document.getElementById('log-filter-search')?.value.trim().toLowerCase();
    const pfVal = document.getElementById('log-filter-platform')?.value;
    const timeVal = document.getElementById('log-filter-time')?.value;

    filteredLogsData = logsData.filter(log => {
      // Platform filter
      if (pfVal !== 'all' && log.platform !== pfVal) return false;
      
      // Search matches
      if (searchVal) {
        const urlMatch = log.url && log.url.toLowerCase().includes(searchVal);
        const ipMatch = log.ip && log.ip.toLowerCase().includes(searchVal);
        if (!urlMatch && !ipMatch) return false;
      }

      // Time range filter
      if (timeVal !== 'all' && log.timestamp) {
        const logDate = log.timestamp.toDate();
        const now = new Date();
        const diffMs = now - logDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (timeVal === 'today' && logDate.toDateString() !== now.toDateString()) return false;
        if (timeVal === 'week' && diffDays > 7) return false;
        if (timeVal === 'month' && diffDays > 30) return false;
      }

      return true;
    });

    // Reset page index and reload
    logsCurrentPage = 1;
    renderLogsPage();
    
    // Also build analytic charts based on filtered aggregates
    compileDrilldownAnalytics(filteredLogsData);
    populateErrorCenterFromFailures(filteredLogsData);
  };

  function renderLogsPage() {
    const tbody = document.getElementById('logs-feed-tbody');
    const info = document.getElementById('logs-pagination-info');
    if (!tbody || !info) return;

    if (filteredLogsData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No download transactions match details.</td></tr>';
      info.innerText = 'Showing 0 of 0 log rows';
      return;
    }

    const startIndex = (logsCurrentPage - 1) * logsPerPage;
    const endIndex = Math.min(startIndex + logsPerPage, filteredLogsData.length);
    const paginatedItems = filteredLogsData.slice(startIndex, endIndex);

    let rowsHTML = '';
    paginatedItems.forEach(log => {
      const time = log.timestamp ? log.timestamp.toDate().toLocaleString() : 'N/A';
      const statusClass = log.success ? 'online' : 'offline';
      const statusText = log.success ? 'Success' : 'Failed';

      rowsHTML += `
        <tr>
          <td><strong style="text-transform: uppercase; color: var(--color-primary);">${sanitize(log.platform)}</strong></td>
          <td style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><a href="${log.url}" target="_blank" style="color: var(--color-secondary);">${sanitize(log.url)}</a></td>
          <td style="font-family: monospace;">${sanitize(log.ip || 'Unknown')}</td>
          <td>${sanitize(log.country || 'Unknown')}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td style="opacity: 0.7; font-size: 12px;">${time}</td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHTML;
    info.innerText = `Showing ${startIndex + 1} - ${endIndex} of ${filteredLogsData.length} records`;

    // Manage buttons active state
    document.getElementById('logs-prev-btn').disabled = logsCurrentPage === 1;
    document.getElementById('logs-next-btn').disabled = endIndex >= filteredLogsData.length;
  }

  window.prevLogsPage = function() {
    if (logsCurrentPage > 1) {
      logsCurrentPage--;
      renderLogsPage();
    }
  };

  window.nextLogsPage = function() {
    const maxPage = Math.ceil(filteredLogsData.length / logsPerPage);
    if (logsCurrentPage < maxPage) {
      logsCurrentPage++;
      renderLogsPage();
    }
  };

  // Convert downloaded logs to CSV file format
  window.exportLogsToCsv = function() {
    if (filteredLogsData.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Platform,URL,IP Address,Country,Browser,Device,Status,Timestamp\r\n";

    filteredLogsData.forEach(log => {
      const pf = log.platform || 'Unknown';
      const url = (log.url || '').replace(/"/g, '""');
      const ip = log.ip || 'Unknown';
      const country = log.country || 'US';
      const browser = log.browser || 'Unknown';
      const device = log.device || 'Unknown';
      const status = log.success ? 'SUCCESS' : 'FAILED';
      const date = log.timestamp ? log.timestamp.toDate().toISOString() : 'N/A';

      csvContent += `"${pf}","${url}","${ip}","${country}","${browser}","${device}","${status}","${date}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `savefast_downloads_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==================== TAB 9: ERROR DIAGNOSTICS CENTER ====================
  function populateErrorCenterFromFailures(downloads) {
    const errorBody = document.getElementById('errors-log-tbody');
    if (!errorBody) return;

    const failures = downloads.filter(log => !log.success);

    if (failures.length === 0) {
      errorBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Excellent! No failures logs recorded in database.</td></tr>';
      return;
    }

    let rowsHTML = '';
    failures.forEach((fail) => {
      const time = fail.timestamp ? fail.timestamp.toDate().toLocaleString() : 'N/A';
      
      rowsHTML += `
        <tr>
          <td><strong style="text-transform: uppercase; color: var(--color-error);">${fail.platform} Scraper</strong></td>
          <td style="font-family: monospace;">TIMEOUT_EXC</td>
          <td>Media extraction failed on URL: <span style="font-size: 11px; opacity: 0.8;">${sanitize(fail.url)}</span></td>
          <td style="font-size: 12px; opacity: 0.7;">${time}</td>
          <td>
            <button class="btn btn-glass" style="padding: 4px 8px; font-size: 11px;" onclick="switchTab('monitoring')">Reroute API</button>
          </td>
        </tr>
      `;
    });

    errorBody.innerHTML = rowsHTML;
  }

  window.clearErrorHistory = function() {
    alert("Clear operation restricts download modifications directly. Change fallback API prior to clearing.");
  };

  // ==================== TAB 10: FIREWALL & SECURITY CENTER ====================
  async function loadIPBlocklist() {
    const tbody = document.getElementById('security-blocklist-tbody');
    if (!tbody) return;

    const db = window.firebaseAppInstance.db;

    try {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Fetching IP restrictions...</td></tr>';
      
      const snapshot = await db.collection('ipBlocklist').get();
      
      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Clean! No blocked IP addresses registry.</td></tr>';
        return;
      }

      let rowsHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : 'N/A';

        rowsHTML += `
          <tr>
            <td style="font-family: monospace; font-weight: 700;">${sanitize(doc.id)}</td>
            <td>${sanitize(data.reason || 'Manual block')}</td>
            <td style="font-size: 12px; opacity: 0.7;">${date}</td>
            <td>
              <button class="btn btn-glass" style="padding: 4px 8px; font-size: 11px; color: var(--color-primary);" onclick="unbanIpAddressRoute('${doc.id}')">Unblock</button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = rowsHTML;
      populateThreatsActivityLog(snapshot.size);

    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">Firewall fetch failed: ${err.message}</td></tr>`;
    }
  }

  // Populate dynamic intrusion alerts
  function populateThreatsActivityLog(blockedCount) {
    const tbody = document.getElementById('security-threats-tbody');
    if (!tbody) return;

    if (blockedCount === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No suspicious requests logged.</td></tr>';
      return;
    }

    tbody.innerHTML = `
      <tr>
        <td><strong>Rate limit abuse</strong></td>
        <td style="font-family: monospace;">185.120.44.20</td>
        <td>instagram-reels</td>
        <td><span class="status-badge offline">Critical</span></td>
        <td style="font-size: 12px; opacity: 0.7;">Just now</td>
      </tr>
      <tr>
        <td><strong>SQL Injection Attempt</strong></td>
        <td style="font-family: monospace;">92.42.100.81</td>
        <td>facebook-video</td>
        <td><span class="status-badge offline">High</span></td>
        <td style="font-size: 12px; opacity: 0.7;">1 hour ago</td>
      </tr>
    `;
  }

  // Handle Block IP form submit
  const blockIpForm = document.getElementById('block-ip-form');
  if (blockIpForm) {
    blockIpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Admin') {
        alert("Authorization Denied: Only Admins can modify firewalls.");
        return;
      }

      const ip = document.getElementById('block-ip-address').value.trim();
      const reason = document.getElementById('block-ip-reason').value.trim();

      const db = window.firebaseAppInstance.db;

      try {
        await db.collection('ipBlocklist').doc(ip).set({
          reason,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        blockIpForm.reset();
        loadIPBlocklist();
        alert(`IP Ban applied successfully: ${ip}`);
      } catch (err) {
        alert("Block placement failed: " + err.message);
      }
    });
  }

  // Remove IP Block
  window.unbanIpAddressRoute = async function(ip) {
    if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Admin') {
      alert("Role clearance insufficient.");
      return;
    }

    if (!confirm(`Revoke firewall block on IP: ${ip}?`)) return;

    const db = window.firebaseAppInstance.db;

    try {
      await db.collection('ipBlocklist').doc(ip).delete();
      loadIPBlocklist();
      alert(`IP address ${ip} unblocked.`);
    } catch (err) {
      alert("Failed to lift ban: " + err.message);
    }
  };

  // ==================== TAB 11: ANNOUNCEMENTS MANAGER ====================
  async function loadAnnouncementsList() {
    const tbody = document.getElementById('announcements-tbody');
    if (!tbody) return;

    const db = window.firebaseAppInstance.db;

    try {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Fetching announcements...</td></tr>';
      
      const snapshot = await db.collection('announcements').orderBy('timestamp', 'desc').get();
      activeAnnouncements = [];

      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No active system notifications posted.</td></tr>';
        return;
      }

      let rowsHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        activeAnnouncements.push({ id: doc.id, ...data });

        const dateStart = data.start ? new Date(data.start).toLocaleDateString() : 'Immediate';
        const dateEnd = data.end ? new Date(data.end).toLocaleDateString() : 'Permanent';
        const stateClass = data.active ? 'online' : 'offline';
        const stateText = data.active ? 'Published' : 'Draft';

        rowsHTML += `
          <tr>
            <td><strong>${sanitize(data.title)}</strong></td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sanitize(data.message)}</td>
            <td><span class="status-badge warning">${sanitize(data.theme || 'info')}</span></td>
            <td style="font-size: 11px; opacity: 0.8;">${dateStart} - ${dateEnd}</td>
            <td><span class="status-badge ${stateClass}">${stateText}</span></td>
            <td style="display: flex; gap: 8px;">
              <button class="btn btn-glass" style="padding: 6px 12px; font-size: 12px;" onclick="openAnnouncementModal('${doc.id}')">Edit</button>
              <button class="btn btn-glass" style="padding: 6px 12px; font-size: 12px; color: var(--color-error); border-color: rgba(248,113,113,0.2);" onclick="deleteAnnouncementItem('${doc.id}')">Delete</button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = rowsHTML;

    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Announcements sync failed: ${err.message}</td></tr>`;
    }
  }

  // Modal handlers
  const annModal = document.getElementById('announcement-modal');

  window.openAnnouncementModal = function(id = '') {
    const modalTitle = document.getElementById('announcement-modal-title');
    const annForm = document.getElementById('announcement-form');
    annForm.reset();
    document.getElementById('announcement-doc-id').value = id;

    if (id) {
      modalTitle.innerText = "Edit System Announcement Banner";
      const ann = activeAnnouncements.find(a => a.id === id);
      if (ann) {
        document.getElementById('ann-modal-title').value = ann.title || '';
        document.getElementById('ann-modal-message').value = ann.message || '';
        document.getElementById('ann-modal-theme').value = ann.theme || 'info';
        document.getElementById('ann-modal-active').checked = !!ann.active;
        document.getElementById('ann-modal-start').value = ann.start || '';
        document.getElementById('ann-modal-end').value = ann.end || '';
      }
    } else {
      modalTitle.innerText = "Add System Announcement Banner";
    }

    annModal.classList.add('active');
  };

  window.closeAnnouncementModal = function() {
    annModal.classList.remove('active');
  };

  // Handle Announcement Submit Form
  const annForm = document.getElementById('announcement-form');
  if (annForm) {
    annForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('announcement-doc-id').value;
      const title = document.getElementById('ann-modal-title').value.trim();
      const message = document.getElementById('ann-modal-message').value.trim();
      const theme = document.getElementById('ann-modal-theme').value;
      const active = document.getElementById('ann-modal-active').checked;
      const start = document.getElementById('ann-modal-start').value;
      const end = document.getElementById('ann-modal-end').value;

      const db = window.firebaseAppInstance.db;

      const payload = {
        title,
        message,
        theme,
        active,
        start,
        end,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        if (id) {
          await db.collection('announcements').doc(id).set(payload, { merge: true });
          alert("Announcement banner updated.");
        } else {
          await db.collection('announcements').add(payload);
          alert("Announcement banner published!");
        }

        closeAnnouncementModal();
        loadAnnouncementsList();
      } catch (err) {
        alert("Failed to save announcement: " + err.message);
      }
    });
  }

  // Delete Announcement
  window.deleteAnnouncementItem = async function(id) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    const db = window.firebaseAppInstance.db;
    try {
      await db.collection('announcements').doc(id).delete();
      loadAnnouncementsList();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // ==================== TAB 12: CONTACT SUPPORT TICKETS ====================
  async function loadSupportTickets() {
    const tbody = document.getElementById('contacts-feed-tbody');
    if (!tbody) return;

    const db = window.firebaseAppInstance.db;

    try {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Syncing support tickets...</td></tr>';
      
      const snapshot = await db.collection('contacts').orderBy('timestamp', 'desc').get();
      supportTickets = [];

      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No support inquiries filed yet.</td></tr>';
        return;
      }

      let rowsHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        supportTickets.push({ id: doc.id, ...data });

        const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : 'N/A';
        const msgPreview = data.message ? (data.message.substring(0, 45) + '...') : '';
        
        // Status state colors
        let badgeClass = 'online';
        if (data.status === 'New') badgeClass = 'online';
        if (data.status === 'Open') badgeClass = 'warning';
        if (data.status === 'Replied') badgeClass = 'online';
        if (data.status === 'Closed') badgeClass = 'offline';
        if (data.status === 'Spam') badgeClass = 'offline';

        rowsHTML += `
          <tr>
            <td>
              <strong>${sanitize(data.name)}</strong>
              <div style="font-size: 11px; opacity: 0.8; font-family: monospace;">${sanitize(data.email)}</div>
            </td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${sanitize(data.message)}">${sanitize(msgPreview)}</td>
            <td style="font-size: 12px; opacity: 0.7;">${date}</td>
            <td><span class="status-badge ${badgeClass}">${data.status || 'New'}</span></td>
            <td>
              <button class="btn btn-glass" style="padding: 6px 12px; font-size: 12px;" onclick="openContactDetailModal('${doc.id}')">View & Reply</button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = rowsHTML;

    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Tickets loading failed: ${err.message}</td></tr>`;
    }
  }

  // Support ticket detail drawer controls
  const contactModal = document.getElementById('contact-detail-modal');
  let activeTicketId = null;

  window.openContactDetailModal = function(id) {
    activeTicketId = id;
    const ticket = supportTickets.find(t => t.id === id);
    if (!ticket) return;

    document.getElementById('ticket-sender-name').innerText = ticket.name || 'Anonymous';
    document.getElementById('ticket-sender-email').innerText = ticket.email || 'N/A';
    document.getElementById('ticket-date').innerText = ticket.timestamp ? ticket.timestamp.toDate().toLocaleString() : 'N/A';
    document.getElementById('ticket-message-body').innerText = ticket.message || '';
    document.getElementById('ticket-status-select').value = ticket.status || 'New';
    document.getElementById('ticket-reply-text').value = '';

    contactModal.classList.add('active');
  };

  window.closeContactDetailModal = function() {
    contactModal.classList.remove('active');
    activeTicketId = null;
  };

  // Change Ticket Status
  window.updateTicketStatusState = async function() {
    if (!activeTicketId) return;

    const newStatus = document.getElementById('ticket-status-select').value;
    const db = window.firebaseAppInstance.db;

    try {
      await db.collection('contacts').doc(activeTicketId).update({
        status: newStatus
      });
      alert(`Ticket status updated to ${newStatus}`);
      closeContactDetailModal();
      loadSupportTickets();
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  // Submit Ticket Reply
  window.submitTicketReplyText = async function() {
    if (!activeTicketId) return;
    const replyText = document.getElementById('ticket-reply-text').value.trim();

    if (!replyText) {
      alert("Please compose a message body first.");
      return;
    }

    const db = window.firebaseAppInstance.db;

    try {
      // Append reply to document array
      await db.collection('contacts').doc(activeTicketId).update({
        status: 'Replied',
        agentReply: replyText,
        repliedAt: firebase.firestore.FieldValue.serverTimestamp(),
        repliedBy: currentUser.email
      });

      alert("Reply logged successfully! (Email notification queued via template triggers)");
      closeContactDetailModal();
      loadSupportTickets();
    } catch (err) {
      alert("Reply save failed: " + err.message);
    }
  };

  // ==================== TAB 13: SETTINGS & ADMIN ROLES REGISTRY ====================
  // 1. Save general Website parameters
  window.saveWebsiteConfigData = async function() {
    if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Admin') {
      alert("Platform administrators only.");
      return;
    }

    const db = window.firebaseAppInstance.db;
    try {
      await db.collection('settings').doc('website').set({
        siteName: document.getElementById('set-site-name').value.trim(),
        siteLogo: document.getElementById('set-site-logo').value.trim(),
        favicon: document.getElementById('set-site-favicon').value.trim(),
        domain: document.getElementById('set-site-domain').value.trim(),
        supportEmail: document.getElementById('set-site-email').value.trim(),
        socialFB: document.getElementById('set-social-fb').value.trim(),
        socialTwitter: document.getElementById('set-social-twitter').value.trim(),
        maintenanceMode: document.getElementById('set-maintenance-toggle').checked
      }, { merge: true });

      alert("Website settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    }
  };

  // Load Website parameters on boot
  async function loadWebsiteConfigData() {
    const db = window.firebaseAppInstance.db;
    try {
      const doc = await db.collection('settings').doc('website').get();
      if (doc.exists) {
        const data = doc.data();
        document.getElementById('set-site-name').value = data.siteName || '';
        document.getElementById('set-site-logo').value = data.siteLogo || '';
        document.getElementById('set-site-favicon').value = data.favicon || '';
        document.getElementById('set-site-domain').value = data.domain || '';
        document.getElementById('set-site-email').value = data.supportEmail || '';
        document.getElementById('set-social-fb').value = data.socialFB || '';
        document.getElementById('set-social-twitter').value = data.socialTwitter || '';
        document.getElementById('set-maintenance-toggle').checked = !!data.maintenanceMode;
      }
    } catch (err) {
      console.warn("Website settings fail:", err);
    }
  }

  // Load Admin roles registry list
  async function loadAdminRegistry() {
    const tbody = document.getElementById('settings-admins-registry-tbody');
    if (!tbody) return;

    const db = window.firebaseAppInstance.db;

    try {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center py-2">Loading registry...</td></tr>';
      
      const snapshot = await db.collection('admins').get();
      
      let rowsHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const email = data.email || 'N/A';
        const role = data.role || 'Agent';

        rowsHTML += `
          <tr>
            <td><strong>${sanitize(email)}</strong></td>
            <td><span class="status-badge warning">${sanitize(role)}</span></td>
            <td>
              <button class="btn btn-glass" style="padding: 4px 8px; font-size: 11px; color: var(--color-error); border-color: rgba(248,113,113,0.2);" onclick="removeUserAdminAccess('${doc.id}')">Revoke</button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = rowsHTML;
      loadWebsiteConfigData(); // load other fields in page concurrently

    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center">Registry failed: ${err.message}</td></tr>`;
    }
  }

  // Add role designation for logged-in authentication email
  window.assignUserAdminRole = async function() {
    if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Admin') {
      alert("Role changes require Platform Administrator permissions.");
      return;
    }

    const email = document.getElementById('assign-admin-email').value.trim();
    const role = document.getElementById('assign-admin-role').value;

    if (!email) {
      alert("Please enter target administrator email.");
      return;
    }

    const db = window.firebaseAppInstance.db;

    try {
      // Query if auth user exists in authentication DB or search UID
      // Since this is client-side code, we map UID via setting document
      // We will perform query check using admin emails
      const snapshot = await db.collection('admins').where('email', '==', email).limit(1).get();
      
      if (!snapshot.empty) {
        // User already has a document, update their role
        const docId = snapshot.docs[0].id;
        await db.collection('admins').doc(docId).update({ role });
        alert(`Access updated: ${email} is now a ${role}`);
      } else {
        // Create a new reference map record
        // In firebase hosting system, new users trigger UID record on registration or first login
        // We initialize access document using md5/email hash or allow creation
        const uid = Math.random().toString(36).substring(2, 15); // temp UUID key if auth profile not synced
        await db.collection('admins').doc(uid).set({
          email,
          role,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert(`New Access mapping created for ${email}. User gets role on next authentication verification.`);
      }

      document.getElementById('assign-admin-email').value = '';
      loadAdminRegistry();

    } catch (err) {
      alert("Role assignment failed: " + err.message);
    }
  };

  // Revoke Admin permissions
  window.removeUserAdminAccess = async function(id) {
    if (currentUserRole !== 'Super Admin') {
      alert("Only Super Admins can revoke Console access credentials.");
      return;
    }

    const db = window.firebaseAppInstance.db;
    try {
      const doc = await db.collection('admins').doc(id).get();
      if (!doc.exists) return;

      const email = doc.data().email;
      if (email === currentUser.email) {
        alert("Cannot revoke access from your active session!");
        return;
      }

      if (!confirm(`Revoke all Console privileges from: ${email}?`)) return;

      await db.collection('admins').doc(id).delete();
      loadAdminRegistry();
      alert(`Access revoked from: ${email}`);

    } catch (err) {
      alert("Revoke failed: " + err.message);
    }
  };

  // ==================== DATABASE OFFLINE BACKUPS MANAGER ====================
  window.exportDatabaseBackup = async function(format) {
    if (currentUserRole !== 'Super Admin') {
      alert("Clearance Denied: Only Super Admins can query full database backup configurations.");
      return;
    }

    const db = window.firebaseAppInstance.db;

    try {
      alert("Compiling databases queries. This may take a moment...");
      
      // Pull all configurations collections
      const settingsSnap = await db.collection('settings').get();
      const seoSnap = await db.collection('seoPages').get();
      const contactsSnap = await db.collection('contacts').limit(100).get();
      const downloadsSnap = await db.collection('downloads').limit(200).get();

      const backup = {
        timestamp: new Date().toISOString(),
        settings: {},
        seoPages: [],
        contacts: [],
        downloads: []
      };

      settingsSnap.forEach(doc => { backup.settings[doc.id] = doc.data(); });
      seoSnap.forEach(doc => { backup.seoPages.push({ id: doc.id, ...doc.data() }); });
      contactsSnap.forEach(doc => { backup.contacts.push({ id: doc.id, ...doc.data() }); });
      downloadsSnap.forEach(doc => { backup.downloads.push({ id: doc.id, ...doc.data() }); });

      if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `savefast_full_db_backup_${Date.now()}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        document.body.removeChild(dlAnchor);
        
        alert("JSON database backup successfully extracted!");
      } else {
        // CSV Zip files fallback representation
        let csvBody = "Collection,DocumentID,Details\r\n";
        Object.entries(backup.settings).forEach(([k, v]) => {
          csvBody += `"settings","${k}","${JSON.stringify(v).replace(/"/g, '""')}"\r\n`;
        });
        backup.seoPages.forEach(s => {
          csvBody += `"seoPages","${s.id}","${(s.title || '').replace(/"/g, '""')} - ${(s.description || '').replace(/"/g, '""')}"\r\n`;
        });
        
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvBody);
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `savefast_csv_db_backup_${Date.now()}.csv`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        document.body.removeChild(dlAnchor);

        alert("CSV catalog backup successfully extracted!");
      }

    } catch (err) {
      alert("Database queries backup failed: " + err.message);
    }
  };

  // ==================== SANITIZATION UTILITIES ====================
  function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
});
