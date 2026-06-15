/**
 * SaveFast.in Theme Management
 * Manages Dark Mode by default, switching class states, and persisting preferences
 */

const THEME_KEY = 'savefast-theme';

function getPreferredTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme) {
    return storedTheme;
  }
  // Default is dark mode
  return 'dark';
}

function applyTheme(theme) {
  const htmlEl = document.documentElement;
  
  // Disable transition temporarily to avoid flash if running in head, 
  // but since we want smooth animation on toggle, we handle toggle animation explicitly.
  if (theme === 'dark') {
    htmlEl.classList.add('dark');
    htmlEl.classList.remove('light');
  } else {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
  }
  
  localStorage.setItem(THEME_KEY, theme);
  
  // Dispatch custom event to notify elements (like custom icons)
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
}

function toggleTheme() {
  const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // We can add a temporary animating class to body to enforce smooth transitioning of colors
  document.body.classList.add('theme-transitioning');
  applyTheme(newTheme);
  
  setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
  }, 400);
}

// Set initial theme before page content loads (to prevent visual flashing)
(function initTheme() {
  const theme = getPreferredTheme();
  applyTheme(theme);
})();

// Expose globally
window.themeHelper = {
  getTheme: getPreferredTheme,
  toggle: toggleTheme,
  apply: applyTheme
};

// Register Service Worker for PWA offline features dynamically
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    // Check if index.html is in path, adjusting depth calculation
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

// Injects premium luxury aurora and particle background
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
  
  const canvas = document.createElement('canvas');
  canvas.id = 'luxury-particles';
  
  bgContainer.appendChild(blobPurple);
  bgContainer.appendChild(blobBlue);
  bgContainer.appendChild(blobCyan);
  bgContainer.appendChild(canvas);
  
  document.body.appendChild(bgContainer);
  
  setupParticles(canvas);
  setupPlatformCardHover();
  setupStatsCounters();
}

function loadThreeJS() {
  return new Promise((resolve, reject) => {
    if (window.THREE) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

function setupParticles(canvas) {
  loadThreeJS().then(() => {
    initWebGLBackground(canvas);
  }).catch((err) => {
    console.warn("WebGL background loading failed, falling back to 2D canvas:", err);
    setupFallbackParticles(canvas);
  });
}

function initWebGLBackground(canvas) {
  const THREE = window.THREE;
  if (!THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 210;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Dynamic Star Texture Generator (Generates star sprite dynamically to avoid network assets)
  function createStarTexture() {
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 16;
    starCanvas.height = 16;
    const ctx = starCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(243, 232, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(starCanvas);
  }

  // Nebula Texture Generator (Additive glowing background sheets)
  function createNebulaTexture(colorHex1, colorHex2) {
    const nebCanvas = document.createElement('canvas');
    nebCanvas.width = 256;
    nebCanvas.height = 256;
    const ctx = nebCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, colorHex1);
    grad.addColorStop(0.5, colorHex2);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(nebCanvas);
  }

  const starTexture = createStarTexture();

  // Create Spiral Galaxy Particle Cluster
  const galaxyGeometry = new THREE.BufferGeometry();
  const count = 3500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorInside = new THREE.Color('#a855f7'); // Neon Purple
  const colorOutside = new THREE.Color('#3b82f6'); // Electric Blue

  for (let i = 0; i < count; i++) {
    // Math-based logarithmic double-arm spiral generator
    const r = Math.random() * 140;
    const spin = 2.0;
    const armAngle = (i % 2) * Math.PI;
    const angle = r * spin + armAngle;

    // Disperse points slightly outwards
    const dispersion = (140 - r) * 0.06;
    const randomX = (Math.random() - 0.5) * 15 * dispersion;
    const randomY = (Math.random() - 0.5) * 12 * dispersion;
    const randomZ = (Math.random() - 0.5) * 15 * dispersion;

    positions[i * 3] = Math.cos(angle) * r + randomX;
    positions[i * 3 + 1] = randomY;
    positions[i * 3 + 2] = Math.sin(angle) * r + randomZ;

    // Interpolate colors based on distance from galactic core
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, r / 140);

    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const galaxyMaterial = new THREE.PointsMaterial({
    size: 2.5,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    map: starTexture,
    transparent: true,
    opacity: 0.9
  });

  const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxy);

  // Add random drifting background stars
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 1200;
  const starsPositions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount; i++) {
    starsPositions[i * 3] = (Math.random() - 0.5) * 800;
    starsPositions[i * 3 + 1] = (Math.random() - 0.5) * 800;
    starsPositions[i * 3 + 2] = (Math.random() - 0.5) * 800;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
  const starsMaterial = new THREE.PointsMaterial({
    size: 1.5,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: starTexture,
    transparent: true,
    opacity: 0.65,
    color: '#ffffff'
  });
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // Add glowing volumetric nebula planes
  const nebulae = [];
  const nebulaColors = [
    { inner: 'rgba(168, 85, 247, 0.18)', outer: 'rgba(168, 85, 247, 0)' }, // Neon Purple
    { inner: 'rgba(59, 130, 246, 0.18)', outer: 'rgba(59, 130, 246, 0)' }, // Electric Blue
    { inner: 'rgba(6, 182, 212, 0.12)', outer: 'rgba(6, 182, 212, 0)' }   // Neon Cyan
  ];

  nebulaColors.forEach((colorSet) => {
    const geom = new THREE.PlaneGeometry(180, 180);
    const texture = createNebulaTexture(colorSet.inner, colorSet.outer);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geom, mat);
    
    // Distribute nebula planes randomly in space depth
    mesh.position.set(
      (Math.random() - 0.5) * 140,
      (Math.random() - 0.5) * 140,
      (Math.random() - 0.5) * 100 - 60
    );
    mesh.rotation.z = Math.random() * Math.PI * 2;
    scene.add(mesh);
    nebulae.push({
      mesh: mesh,
      rotSpeed: (Math.random() - 0.5) * 0.001
    });
  });

  // Track coordinates for camera orbit mouse movement
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.06;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.06;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Slow orbital rotation of space structures
    galaxy.rotation.y = elapsedTime * 0.012;
    
    nebulae.forEach(neb => {
      neb.mesh.rotation.z += neb.rotSpeed;
    });

    stars.rotation.y = elapsedTime * 0.002;
    stars.rotation.x = elapsedTime * 0.001;

    // Smooth coordinate interpolation (lerping)
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    // Camera organic drifting curves
    camera.position.x = targetX + Math.sin(elapsedTime * 0.15) * 15;
    camera.position.y = -targetY + Math.cos(elapsedTime * 0.15) * 15;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', handleResize);

  function updateThemeStyles(isLight) {
    if (isLight) {
      canvas.style.opacity = '1.0';
      
      // Transform sharp galaxy points into soft, large floating bokeh bubbles
      galaxyMaterial.blending = THREE.NormalBlending;
      galaxyMaterial.size = 7.0;
      galaxyMaterial.opacity = 0.22;
      
      // Transform background stars into soft background elements
      starsMaterial.blending = THREE.NormalBlending;
      starsMaterial.size = 5.0;
      starsMaterial.opacity = 0.18;
      starsMaterial.color.set('#6366f1');

      // Reduce nebula sheet intensity to a soft, pastel glow wash
      nebulae.forEach(neb => {
        neb.mesh.material.blending = THREE.NormalBlending;
        neb.mesh.material.opacity = 0.08;
      });
    } else {
      canvas.style.opacity = '1.0';
      
      // Restore sharp galactic particle points
      galaxyMaterial.blending = THREE.AdditiveBlending;
      galaxyMaterial.size = 2.5;
      galaxyMaterial.opacity = 0.9;
      
      // Restore background space dust stars
      starsMaterial.blending = THREE.AdditiveBlending;
      starsMaterial.size = 1.5;
      starsMaterial.opacity = 0.65;
      starsMaterial.color.set('#ffffff');

      // Restore rich dark space nebulae glows
      nebulae.forEach(neb => {
        neb.mesh.material.blending = THREE.AdditiveBlending;
        neb.mesh.material.opacity = 0.85;
      });
    }
    galaxyMaterial.needsUpdate = true;
    starsMaterial.needsUpdate = true;
    nebulae.forEach(neb => {
      neb.mesh.material.needsUpdate = true;
    });
  }

  // Sync background visibility with light/dark themes
  window.addEventListener('theme-changed', (e) => {
    updateThemeStyles(e.detail.theme === 'light');
  });
  
  // Initial check
  const isLight = document.documentElement.classList.contains('light');
  updateThemeStyles(isLight);
}

function setupFallbackParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  const maxParticles = 30;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedY = Math.random() * 0.3 + 0.1;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    
    update() {
      this.y -= this.speedY;
      if (this.y < -10) {
        this.reset();
      }
    }
    
    draw() {
      const isLight = document.documentElement.classList.contains('light');
      ctx.fillStyle = isLight ? `rgba(124, 58, 237, ${this.opacity * 0.4})` : `rgba(168, 85, 247, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  
  animate();
}

function setupPlatformCardHover() {
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.platform-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
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

// Execute background injection
window.addEventListener('DOMContentLoaded', initPremiumBackground);

