/* ── Supabase ──────────────────────────────────────────── */
const _SUPABASE_URL = 'https://rdbbvspwlphsvutpwvkg.supabase.co';
const _SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkYmJ2c3B3bHBoc3Z1dHB3dmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTE4MzksImV4cCI6MjA5ODEyNzgzOX0.E_q5rr7-9lSpI631Lws8Ey5zsiOmrNBqtiNHrmQLnQU';
const _sb = supabase.createClient(_SUPABASE_URL, _SUPABASE_KEY);

function warmupSupabase() {
  fetch(_SUPABASE_URL + '/rest/v1/?limit=0', {
    headers: { 'apikey': _SUPABASE_KEY }
  }).catch(() => {});
}

/* ── Data ──────────────────────────────────────────────── */
const materii = [
  {
    id: 'drept-penal-general',
    name: 'Drept penal — Partea generală',
    icon: 'scale',
    count: 12,
    lectures: [
      { id: 1, title: 'Noțiunea și scopul dreptului penal', dur: '48 min', progress: 1 },
      { id: 2, title: 'Principiile dreptului penal', dur: '52 min', progress: 0.58 },
      { id: 3, title: 'Legea penală și acțiunea ei în timp', dur: '44 min', progress: 0 },
      { id: 4, title: 'Infracțiunea — concept și trăsături', dur: '61 min', progress: 0 },
      { id: 5, title: 'Componența infracțiunii', dur: '55 min', progress: 0 },
      { id: 6, title: 'Latura obiectivă a infracțiunii', dur: '50 min', progress: 0 },
    ]
  },
  {
    id: 'drept-penal-special',
    name: 'Drept penal — Partea specială',
    icon: 'book',
    count: 18,
    lectures: [
      { id: 1, title: 'Infracțiuni contra persoanei', dur: '58 min', progress: 0 },
      { id: 2, title: 'Infracțiuni contra patrimoniului', dur: '63 min', progress: 0 },
      { id: 3, title: 'Infracțiuni de corupție', dur: '47 min', progress: 0 },
      { id: 4, title: 'Infracțiuni contra statului', dur: '54 min', progress: 0 },
    ]
  },
  {
    id: 'procedura-penala',
    name: 'Procedură penală',
    icon: 'gavel',
    count: 14,
    lectures: [
      { id: 1, title: 'Principiile procesului penal', dur: '45 min', progress: 0 },
      { id: 2, title: 'Participanții la procesul penal', dur: '60 min', progress: 0 },
      { id: 3, title: 'Probele și mijloacele de probă', dur: '72 min', progress: 0 },
      { id: 4, title: 'Urmărirea penală', dur: '55 min', progress: 0 },
    ]
  },
  {
    id: 'criminologie',
    name: 'Criminologie',
    icon: 'search',
    count: 10,
    lectures: [
      { id: 1, title: 'Obiectul și metoda criminologiei', dur: '40 min', progress: 0 },
      { id: 2, title: 'Cauzele criminalității', dur: '53 min', progress: 0 },
      { id: 3, title: 'Personalitatea infractorului', dur: '49 min', progress: 0 },
    ]
  }
];

const continueLecture = { title: 'Principiile dreptului penal', subject: 'Drept penal — Partea generală', dur: '52 min', progress: 0.58 };
const newestLectures = [
  { title: 'Infracțiuni de corupție', subject: 'Drept penal — Partea specială', dur: '47 min' },
  { title: 'Probele și mijloacele de probă', subject: 'Procedură penală', dur: '72 min' },
  { title: 'Personalitatea infractorului', subject: 'Criminologie', dur: '49 min' },
  { title: 'Latura obiectivă a infracțiunii', subject: 'Drept penal — Partea generală', dur: '50 min' },
];

/* ── State ─────────────────────────────────────────────── */
let state = {
  loggedIn: false,
  user: null,
  activeTab: 'acasa',
  activeMaterieId: null,
  activePlayerLecture: null,
  activePlayerMaterie: null,
  saved: new Set(),
  searchQuery: '',
  videoProgress: {},
};

let _lastProgressSave = 0;
let _videoTimeUpdateHandler = null;

/* ── Icons ─────────────────────────────────────────────── */
const icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
  bookmarkFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
  person: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
  scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 7l9-4 9 4M5 10l7 3 7-3M4 17l8 3 8-3"/></svg>`,
  gavel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14l-4-4 6-6 4 4-6 6zM4 20l6-6"/><path d="M9 5L5 9"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  terms: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
};

/* ── Helpers ───────────────────────────────────────────── */
function displayName() {
  return state.user?.user_metadata?.username || state.user?.email?.split('@')[0] || 'Utilizator';
}
function avatarInitial() {
  return (state.user?.user_metadata?.username?.[0] || state.user?.email?.[0] || 'U').toUpperCase();
}
function getLectureProgress(title) {
  const p = state.videoProgress[title];
  if (!p || !p.duration) return 0;
  return Math.min(1, p.position / p.duration);
}

/* ── Router ────────────────────────────────────────────── */
function render() {
  const root = document.getElementById('root');
  if (!state.loggedIn) {
    root.innerHTML = renderLanding();
    attachLandingEvents();
    attachScrollReveal();
    attachStickyTabs();
    return;
  }
  if (state.activePlayerLecture) {
    root.innerHTML = renderAppShell(renderPlayer());
  } else if (state.activeMaterieId) {
    root.innerHTML = renderAppShell(renderMaterieDetail());
  } else {
    const screens = { acasa: renderHome, materii: renderMaterii, salvate: renderSalvate, cont: renderCont };
    root.innerHTML = renderAppShell((screens[state.activeTab] || renderHome)());
  }
  attachAppEvents();
}

/* ── Landing ───────────────────────────────────────────── */
function renderLanding() {
  return `
  <nav class="site-nav">
    <div class="nav-logo">Berliba <span>Prelegeri</span></div>
    <div class="nav-links">
      <a href="#features">Despre</a>
      <a href="#how">Cum funcționează</a>
      <a href="#pricing">Prețuri</a>
    </div>
    <div class="nav-cta">
      <button class="btn-ghost" onclick="showAuth('login')">Autentificare</button>
      <button class="btn-gold" onclick="showAuth('register')">Încearcă gratuit</button>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <p class="hero-eyebrow">Prelegeri video · Drept penal · Moldova</p>
        <h1 class="hero-title">Studiază dreptul mai <em>în profunzime.</em></h1>
        <p class="hero-sub">Un supliment pentru cursurile tale universitare — prelegeri video complete, susținute de Viorel Berliba și organizate pe materii. Acces oricând, de pe orice dispozitiv.</p>
        <div class="hero-actions">
          <button class="btn-gold-lg" onclick="showAuth('register')">Începe — 99 lei/lună</button>
          <span class="hero-note">Sau <a href="#" onclick="showAuth('login');return false;">autentifică-te</a> dacă ai deja cont.</span>
        </div>
        <div class="hero-stats">
          <div class="stat-item"><strong>54+</strong><span>prelegeri video</span></div>
          <div class="stat-item"><strong>4</strong><span>materii</span></div>
          <div class="stat-item"><strong>HD</strong><span>calitate video</span></div>
        </div>
      </div>
      <div class="hero-photo-wrap">
        <img src="assets/img/berliba.jpg" alt="Viorel Berliba" class="hero-photo">
        <div class="hero-photo-overlay"></div>
        <div class="hero-photo-badge">
          <h3>Viorel Berliba</h3>
          <p>Doctor în drept · Lector universitar</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Sticky Tabs -->
  <section class="stabs-section" id="features">
    <div class="stabs-height" id="stabs-height">
      <div class="stabs-sticky">
        <div class="stabs-inner">

          <!-- LEFT: text panels -->
          <div class="stabs-left">
            <div class="stabs-left-top">

              <div class="stab-content" data-stab="1">
                <p class="stab-label">Calitate</p>
                <h2 class="stab-title">Video HD cu <span>sunet profesional</span></h2>
                <div class="stab-line"></div>
                <p class="stab-desc">Prelegeri filmate în studio, cu imagine HD și sunet clar — urmărește de pe orice dispozitiv, oricând.</p>
              </div>

              <div class="stab-content" data-stab="2">
                <p class="stab-label">Structură</p>
                <h2 class="stab-title">Organizate pe <span>materii și subiecte</span></h2>
                <div class="stab-line"></div>
                <p class="stab-desc">Drept penal general, special, procedură penală și criminologie — fiecare prelegere la locul ei, ușor de găsit.</p>
              </div>

              <div class="stab-content" data-stab="3">
                <p class="stab-label">Continuitate</p>
                <h2 class="stab-title">Progresul tău <span>se păstrează mereu</span></h2>
                <div class="stab-line"></div>
                <p class="stab-desc">Salvează prelegeri, marchează ce ai văzut și reia exact de unde ai rămas — pe orice dispozitiv.</p>
              </div>

            </div>
            <div class="stabs-left-bottom">
              <button class="btn-gold-lg" onclick="showAuth('register')">Începe — 99 lei/lună</button>
            </div>
          </div>

          <!-- RIGHT: visual panels -->
          <div class="stabs-right">

            <div class="stab-visual" data-stab="1">
              <div class="stab-mockup">
                <div class="smock-player">
                  <div class="smock-thumb">
                    <div class="smock-play">${icons.play}</div>
                    <span class="smock-badge">HD</span>
                  </div>
                  <div class="smock-bar">
                    <div class="smock-progress" style="width:38%"></div>
                  </div>
                  <div class="smock-meta">
                    <span>Infracțiunea — noțiune și trăsături</span>
                    <span>24:15</span>
                  </div>
                </div>
                <div class="smock-speeds">
                  <span class="smock-speed active">1×</span>
                  <span class="smock-speed">1.25×</span>
                  <span class="smock-speed">1.5×</span>
                  <span class="smock-speed">2×</span>
                </div>
              </div>
            </div>

            <div class="stab-visual" data-stab="2">
              <div class="stab-mockup">
                <p class="smock-heading">Materii</p>
                <div class="smock-subject"><div class="smock-dot"></div><span>Drept penal general</span><span class="smock-count">18</span></div>
                <div class="smock-subject"><div class="smock-dot"></div><span>Drept penal special</span><span class="smock-count">21</span></div>
                <div class="smock-subject"><div class="smock-dot"></div><span>Procedură penală</span><span class="smock-count">9</span></div>
                <div class="smock-subject"><div class="smock-dot"></div><span>Criminologie</span><span class="smock-count">6</span></div>
              </div>
            </div>

            <div class="stab-visual" data-stab="3">
              <div class="stab-mockup">
                <p class="smock-heading">Progresul meu</p>
                <div class="smock-prog-item">
                  <div class="smock-prog-info"><span>Drept penal general</span><span>72%</span></div>
                  <div class="smock-prog-bar"><div class="smock-prog-fill" style="width:72%"></div></div>
                </div>
                <div class="smock-prog-item">
                  <div class="smock-prog-info"><span>Drept penal special</span><span>41%</span></div>
                  <div class="smock-prog-bar"><div class="smock-prog-fill" style="width:41%"></div></div>
                </div>
                <div class="smock-prog-item">
                  <div class="smock-prog-info"><span>Procedură penală</span><span>15%</span></div>
                  <div class="smock-prog-bar"><div class="smock-prog-fill" style="width:15%"></div></div>
                </div>
                <div class="smock-saved"><span>${icons.bookmark} 7 prelegeri salvate</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- How it works -->
  <div id="how">
  <div class="how-section">
    <div class="how-inner">
      <p class="section-label" data-sr="line">Cum funcționează</p>
      <div class="clip-wrap" data-sr="clip"><h2 class="section-title">Simplu de la început.</h2></div>
      <div class="steps-grid">
        <div class="step" data-sr data-sr-d="1">
          <div class="step-num">01</div>
          <h4>Creează-ți contul</h4>
          <p>Înregistrează-te cu email-ul tău în mai puțin de un minut. Fără carduri de credit obligatorii pentru cont.</p>
        </div>
        <div class="step" data-sr data-sr-d="2">
          <div class="step-num">02</div>
          <h4>Alege abonamentul</h4>
          <p>Acces lunar sau anual — plătești online securizat cu card bancar sau prin transfer bancar.</p>
        </div>
        <div class="step" data-sr data-sr-d="3">
          <div class="step-num">03</div>
          <h4>Urmărește oricând</h4>
          <p>Accesezi toate prelegerile imediat după activare, direct în browser sau din aplicația mobilă.</p>
        </div>
      </div>
    </div>
  </div>
  </div>

  <!-- Pricing -->
  <div id="pricing">
  <div class="pricing-section">
    <p class="section-label" data-sr="line">Prețuri</p>
    <div class="clip-wrap" data-sr="clip"><h2 class="section-title">Investiție mică, rezultate mari.</h2></div>
    <p class="section-sub" data-sr style="margin:12px auto 0;text-align:center;">Acces complet la toate prelegerile, fără limitări.</p>
    <div class="pricing-cards">
      <div class="pricing-card" data-sr data-sr-d="1">
        <p class="pricing-tier">Lunar</p>
        <div class="pricing-price"><strong>99</strong><span>lei / lună</span></div>
        <p class="pricing-desc">Ideal pentru a testa platforma înainte de sesiune.</p>
        <div class="pricing-divider"></div>
        <ul class="pricing-features">
          <li>${icons.check} Acces la toate prelegerile</li>
          <li>${icons.check} Toate materiile incluse</li>
          <li>${icons.check} Acces web și mobil</li>
          <li>${icons.check} Anulezi oricând</li>
        </ul>
        <button class="btn-ghost" onclick="showAuth('register')">Alege lunar</button>
      </div>
      <div class="pricing-card featured" data-sr data-sr-d="2">
        <div class="pricing-badge">CEL MAI POPULAR</div>
        <p class="pricing-tier">Semestrial</p>
        <div class="pricing-price"><strong>249</strong><span>lei / 6 luni</span></div>
        <p class="pricing-desc">Economisești 345 lei față de abonamentul lunar. Perfect pentru un semestru.</p>
        <div class="pricing-divider"></div>
        <ul class="pricing-features">
          <li>${icons.check} Tot ce include abonamentul lunar</li>
          <li>${icons.check} Economie de 58%</li>
          <li>${icons.check} Priorty la conținut nou</li>
          <li>${icons.check} Anulezi oricând</li>
        </ul>
        <button class="btn-gold" onclick="showAuth('register')">Alege semestrial</button>
      </div>
      <div class="pricing-card" data-sr data-sr-d="3">
        <p class="pricing-tier">Anual</p>
        <div class="pricing-price"><strong>399</strong><span>lei / an</span></div>
        <p class="pricing-desc">Cel mai bun raport calitate-preț pentru studenții serioși.</p>
        <div class="pricing-divider"></div>
        <ul class="pricing-features">
          <li>${icons.check} Tot ce include semestrial</li>
          <li>${icons.check} Economie de 66%</li>
          <li>${icons.check} Acces la arhiva completă</li>
          <li>${icons.check} Suport prioritar</li>
        </ul>
        <button class="btn-ghost" onclick="showAuth('register')">Alege anual</button>
      </div>
    </div>
  </div>
  </div>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-logo">Berliba <span>Prelegeri</span></div>
      <div class="footer-links">
        <a href="#">Termeni</a>
        <a href="#">Confidențialitate</a>
        <a href="#">Contact</a>
      </div>
      <p class="footer-copy">© 2026 Berliba Prelegeri. Toate drepturile rezervate.</p>
    </div>
  </footer>`;
}

/* ── Auth ──────────────────────────────────────────────── */
function showAuth(mode) {
  const root = document.getElementById('root');
  root.innerHTML = renderAuth(mode);
}

function renderAuth(mode) {
  const isLogin = mode === 'login';
  return `
  <div class="auth-screen">
    <div class="auth-card">
      <div class="auth-logo">Berliba <span>Prelegeri</span></div>
      <h2 class="auth-title">${isLogin ? 'Bine ai revenit.' : 'Creează-ți contul.'}</h2>
      <p class="auth-sub">${isLogin ? 'Intră în cont pentru a accesa prelegerile.' : 'Înregistrează-te și alege abonamentul tău.'}</p>
      <input type="hidden" id="auth-mode" value="${mode}">
      ${!isLogin ? `
      <div class="form-group">
        <label class="form-label">Nume de utilizator</label>
        <input class="form-input" type="text" placeholder="ex: ion.popescu" id="auth-username" autocomplete="username">
      </div>` : ''}
      <div class="form-group">
        <label class="form-label">Adresă de email</label>
        <input class="form-input" type="email" placeholder="email@exemplu.com" id="auth-email" autocomplete="email">
      </div>
      <div class="form-group">
        <label class="form-label">Parolă</label>
        <input class="form-input" type="password" placeholder="••••••••" id="auth-pass" autocomplete="${isLogin ? 'current-password' : 'new-password'}"
               onkeydown="if(event.key==='Enter') doLogin()">
      </div>
      <div id="auth-error" style="display:none;margin-bottom:14px;padding:10px 14px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:8px;font-size:13px;color:#FCA5A5;"></div>
      <div id="auth-success" style="display:none;margin-bottom:14px;padding:10px 14px;background:rgba(201,168,78,.10);border:1px solid rgba(201,168,78,.3);border-radius:8px;font-size:13px;color:var(--gold);"></div>
      <button class="btn-gold-full" id="auth-submit" onclick="doLogin()">${isLogin ? 'Autentifică-te' : 'Creează cont'}</button>
      <p class="auth-switch" style="margin-top:18px">
        ${isLogin ? 'Nu ai cont? <a onclick="showAuth(\'register\')">Creează unul</a>' : 'Ai deja cont? <a onclick="showAuth(\'login\')">Autentifică-te</a>'}
      </p>
      <p class="auth-switch" style="margin-top:10px"><a onclick="render()" style="color:var(--text-3);font-size:13px">← Înapoi la pagina principală</a></p>
    </div>
  </div>`;
}

async function doLogin() {
  const email    = document.getElementById('auth-email')?.value.trim();
  const pass     = document.getElementById('auth-pass')?.value;
  const mode     = document.getElementById('auth-mode')?.value;
  const username = document.getElementById('auth-username')?.value.trim() || '';
  const errEl    = document.getElementById('auth-error');
  const okEl     = document.getElementById('auth-success');
  const btn      = document.getElementById('auth-submit');

  if (!email || !pass) {
    errEl.textContent = 'Completează email-ul și parola.';
    errEl.style.display = 'block';
    return;
  }
  if (mode === 'register' && !username) {
    errEl.textContent = 'Alege un nume de utilizator.';
    errEl.style.display = 'block';
    return;
  }

  btn.textContent = mode === 'login' ? 'Se conectează...' : 'Se creează contul...';
  btn.disabled = true;
  errEl.style.display = 'none';
  okEl.style.display = 'none';

  let result;
  if (mode === 'login') {
    result = await _sb.auth.signInWithPassword({ email, password: pass });
  } else {
    result = await _sb.auth.signUp({ email, password: pass, options: { data: { username } } });
  }

  const { data, error } = result;

  if (error) {
    const msgs = {
      'Invalid login credentials': 'Email sau parolă incorectă.',
      'Email not confirmed': 'Confirmă-ți email-ul înainte de autentificare.',
      'User already registered': 'Există deja un cont cu acest email.',
      'Password should be at least 6 characters': 'Parola trebuie să aibă cel puțin 6 caractere.',
      'email rate limit exceeded': 'Prea multe încercări. Încearcă din nou peste câteva minute.',
      'over_email_send_rate_limit': 'Prea multe emailuri trimise. Încearcă din nou mai târziu.',
    };
    errEl.textContent = msgs[error.message] || error.message;
    errEl.style.display = 'block';
    btn.textContent = mode === 'login' ? 'Autentifică-te' : 'Creează cont';
    btn.disabled = false;
    return;
  }

  if (mode === 'register' && !data.session) {
    okEl.textContent = 'Cont creat! Verifică-ți email-ul pentru a confirma înregistrarea.';
    okEl.style.display = 'block';
    btn.textContent = 'Creează cont';
    btn.disabled = false;
    return;
  }

  state.loggedIn = true;
  state.user = data.user || data.session?.user;
  state.activeTab = 'acasa';
  await Promise.all([loadSaved(), loadProgress()]);
  render();
}

/* ── App Shell ─────────────────────────────────────────── */
function renderAppShell(content) {
  const tabs = [
    { id: 'acasa', label: 'Acasă', icon: 'home' },
    { id: 'materii', label: 'Materii', icon: 'book' },
    { id: 'salvate', label: 'Salvate', icon: 'bookmark' },
    { id: 'cont', label: 'Cont', icon: 'person' },
  ];
  const topbarTitle = {
    acasa: 'Acasă', materii: 'Materii', salvate: 'Salvate', cont: 'Contul meu'
  }[state.activeTab] || 'Berliba Prelegeri';

  return `
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-text">Berliba <span>Prelegeri</span></div>
        <div class="sidebar-logo-sub">Prelegeri de drept penal</div>
      </div>
      <nav class="sidebar-nav">
        ${tabs.map(t => `
          <div class="nav-item ${state.activeTab === t.id && !state.activeMaterieId && !state.activePlayerLecture ? 'active' : ''}"
               onclick="navigate('${t.id}')">
            ${icons[t.icon]} ${t.label}
          </div>`).join('')}
      </nav>
      <div class="sidebar-bottom">
        <div class="user-pill" onclick="navigate('cont')">
          <div class="user-avatar">${avatarInitial()}</div>
          <div class="user-info">
            <div class="user-name">${displayName()}</div>
            <div class="user-plan">Abonament activ</div>
          </div>
        </div>
      </div>
    </aside>
    <main class="app-main">
      <div class="app-topbar">
        <h2>${topbarTitle}</h2>
        <div class="search-bar">
          ${icons.search}
          <input type="text" placeholder="Caută prelegeri..." id="search-input"
                 value="${state.searchQuery}"
                 oninput="handleSearch(this.value)">
        </div>
      </div>
      <div class="app-content">${content}</div>
    </main>
  </div>`;
}

/* ── Screen: Acasă ─────────────────────────────────────── */
function renderHome() {
  const remaining = Math.round(52 * (1 - 0.58));
  return `
  <div class="greeting">
    <h1>Bună ziua.</h1>
    <p>Continuă-ți studiul de unde ai rămas.</p>
  </div>
  <div class="continue-hero" onclick="openPlayer(${JSON.stringify(continueLecture).replace(/"/g,'&quot;')}, null)">
    <div class="continue-thumb">
      <span class="continue-thumb-label">CONTINUĂ</span>
      <div class="play-btn-lg">${icons.play}</div>
    </div>
    <div class="continue-info">
      <p class="eyebrow">Ultima prelegere urmărită</p>
      <h3>${continueLecture.title}</h3>
      <p class="meta">${continueLecture.subject} · ${remaining} min rămase</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${continueLecture.progress*100}%"></div></div>
    </div>
  </div>
  <p class="section-heading">CELE MAI NOI PRELEGERI</p>
  <div class="lectures-grid">
    ${newestLectures.map(l => renderLectureCard(l)).join('')}
  </div>`;
}

function renderLectureCard(l) {
  const data = JSON.stringify(l).replace(/"/g, '&quot;');
  return `
  <div class="lecture-card" onclick="openPlayer(${data}, null)">
    <div class="lecture-thumb">${icons.play}</div>
    <div class="lecture-info">
      <div class="lecture-title">${l.title}</div>
      <div class="lecture-meta">${l.subject} · ${l.dur}</div>
    </div>
  </div>`;
}

/* ── Screen: Materii ───────────────────────────────────── */
function renderMaterii() {
  const query = state.searchQuery.toLowerCase();
  const filtered = query
    ? materii.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.lectures.some(l => l.title.toLowerCase().includes(query)))
    : materii;

  if (filtered.length === 0) return `
    <div class="empty-state">
      <div class="empty-icon">${icons.search}</div>
      <h3>Niciun rezultat</h3>
      <p>Nu am găsit prelegeri pentru „${state.searchQuery}".</p>
    </div>`;

  return `
  <div class="materii-grid">
    ${filtered.map(m => `
      <div class="materie-card" onclick="openMaterie('${m.id}')">
        <div class="materie-icon">${icons[m.icon] || icons.book}</div>
        <h3>${m.name}</h3>
        <p>${m.count} prelegeri · ${m.lectures.length > 0 ? m.lectures[0].dur : ''}</p>
      </div>`).join('')}
  </div>`;
}

/* ── Screen: Materie Detail ────────────────────────────── */
function renderMaterieDetail() {
  const m = materii.find(x => x.id === state.activeMaterieId);
  if (!m) return '';
  return `
  <div class="back-btn" onclick="closeMaterie()">
    ${icons.chevronLeft} Materii
  </div>
  <div class="materie-header">
    <h1>${m.name}</h1>
    <p>${m.count} prelegeri · Viorel Berliba</p>
  </div>
  <div class="lectures-list">
    ${m.lectures.map((l, i) => {
      const data = JSON.stringify({...l, subject: m.name}).replace(/"/g,'&quot;');
      const prog = getLectureProgress(l.title);
      const completed = prog >= 0.95;
      const inProgress = prog > 0.02 && !completed;
      return `
      <div class="lecture-row" onclick="openPlayer(${data}, '${m.id}')">
        <div class="lecture-num">${String(i+1).padStart(2,'0')}</div>
        <div class="lecture-row-info">
          <h4>${l.title}${inProgress ? '<span class="lecture-in-progress">în curs</span>' : ''}</h4>
          <p>${completed ? 'Vizionată' : inProgress ? Math.round(prog*100)+'% completat' : 'Nevizionată'}</p>
        </div>
        <div class="lecture-row-dur">${l.dur}</div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ── Screen: Player ────────────────────────────────────── */
function renderPlayer() {
  const l = state.activePlayerLecture;
  const materie = state.activePlayerMaterie ? materii.find(m => m.id === state.activePlayerMaterie) : null;
  const isSaved = state.saved.has(l.title);
  const queue = materie ? materie.lectures : newestLectures;

  return `
  <div class="back-btn" onclick="closePlayer()">
    ${icons.chevronLeft} ${materie ? materie.name : 'Acasă'}
  </div>
  <div class="player-layout">
    <div>
      <div class="player-video-wrap">
        <video id="player-video" controls>
          <source src="assets/video/intro.mp4" type="video/mp4">
        </video>
      </div>
      <div class="player-meta">
        <h2>${l.title}</h2>
        <p class="subject">${l.subject || (materie ? materie.name : '')} · ${l.dur}</p>
        <div class="player-controls-row">
          <div class="speed-btns">
            ${['1×','1.25×','1.5×','2×'].map(s => `
              <button class="speed-btn ${s==='1×'?'active':''}" onclick="setSpeed(this,'${s}')">${s}</button>`).join('')}
          </div>
          <button class="save-btn ${isSaved?'saved':''}" onclick="toggleSave()">
            ${isSaved ? icons.bookmarkFill : icons.bookmark}
            ${isSaved ? 'Salvat' : 'Salvează'}
          </button>
        </div>
      </div>
    </div>
    <div class="player-sidebar">
      <h3>Următoarele prelegeri</h3>
      <div class="queue-list">
        ${queue.slice(0,6).map((ql,i) => {
          const qdata = JSON.stringify({...ql, subject: materie ? materie.name : ''}).replace(/"/g,'&quot;');
          const active = ql.title === l.title;
          return `
          <div class="queue-item ${active?'active-queue':''}" onclick="openPlayer(${qdata},'${state.activePlayerMaterie||''}')">
            <div class="queue-thumb">${icons.play}</div>
            <div class="queue-info">
              <h5>${ql.title}</h5>
              <p>${ql.dur}</p>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

/* ── Screen: Salvate ───────────────────────────────────── */
function renderSalvate() {
  const saved = [...state.saved];
  if (saved.length === 0) return `
    <div class="empty-state">
      <div class="empty-icon">${icons.bookmark}</div>
      <h3>Încă nimic salvat</h3>
      <p>Apasă „Salvează" la o prelegere ca s-o regăsești aici mai târziu.</p>
    </div>`;

  const lectures = newestLectures.filter(l => state.saved.has(l.title));
  return `
  <div class="greeting" style="margin-bottom:24px">
    <h1>Salvate</h1>
    <p>${saved.length} ${saved.length===1?'prelegere salvată':'prelegeri salvate'}</p>
  </div>
  <div class="lectures-grid">
    ${lectures.map(l => renderLectureCard(l)).join('')}
  </div>`;
}

/* ── Screen: Cont ──────────────────────────────────────── */
function renderCont() {
  return `
  <div class="account-grid">
    <div>
      <div class="profile-card">
        <div class="profile-avatar-lg">${avatarInitial()}</div>
        <h3 class="profile-name" id="profile-name">${displayName()}</h3>
        <p class="profile-email">${state.user?.email || ''}</p>
        <button class="btn-ghost" style="margin-top:12px;padding:6px 18px;font-size:13px" onclick="editUsername()">Editează username</button>
        <span class="sub-badge" style="display:block;margin-top:12px">Abonament activ</span>
      </div>
    </div>
    <div>
      <div class="sub-card-full">
        <div class="sub-info">
          <h4>Abonament semestrial</h4>
          <p>Activ · Se reînnoiește pe 27 decembrie 2026 · 249 lei</p>
        </div>
        <button class="btn-ghost" style="white-space:nowrap" onclick="showGestioneaza()">Gestionează</button>
      </div>
      <div class="settings-section" style="margin-bottom:16px">
        <div class="settings-heading">Preferințe</div>
        <div class="settings-row" onclick="showNotificari()" style="cursor:pointer"><span class="row-label">Notificări</span>${icons.chevronRight}</div>
        <div class="settings-row" onclick="showLimba()" style="cursor:pointer"><span class="row-label">Limbă</span><span class="row-value">Română</span></div>
        <div class="settings-row" onclick="showDescarcari()" style="cursor:pointer"><span class="row-label">Descărcări</span>${icons.chevronRight}</div>
      </div>
      <div class="settings-section">
        <div class="settings-heading">Cont</div>
        <div class="settings-row" onclick="showAjutor()" style="cursor:pointer"><span class="row-label">Ajutor și suport</span>${icons.chevronRight}</div>
        <div class="settings-row" onclick="showTermeni()" style="cursor:pointer"><span class="row-label">Termeni și condiții</span>${icons.chevronRight}</div>
        <div class="settings-row danger" onclick="doLogout()"><span class="row-label">Deconectează-te</span>${icons.logout}</div>
      </div>
    </div>
  </div>`;
}

/* ── Actions ───────────────────────────────────────────── */
function navigate(tab) {
  state.activeTab = tab;
  state.activeMaterieId = null;
  state.activePlayerLecture = null;
  state.searchQuery = '';
  render();
}
function openMaterie(id) {
  state.activeMaterieId = id;
  state.activePlayerLecture = null;
  render();
}
function closeMaterie() {
  state.activeMaterieId = null;
  state.activeTab = 'materii';
  render();
}
function openPlayer(lecture, materieId) {
  state.activePlayerLecture = lecture;
  state.activePlayerMaterie = materieId || null;
  render();
  setTimeout(() => {
    const vid = document.getElementById('player-video');
    if (!vid) return;

    attachVideoProgress(vid);
    vid.play().catch(() => {});

    const saved = state.videoProgress[lecture.title];
    if (saved?.position > 3) {
      const pct = saved.duration ? saved.position / saved.duration : 0;
      if (pct < 0.95) {
        const seek = () => { vid.currentTime = saved.position; };
        if (vid.readyState >= 3) {
          seek();
        } else {
          vid.addEventListener('canplay', seek, { once: true });
        }
      }
    }
  }, 150);
}
function closePlayer() {
  state.activePlayerLecture = null;
  render();
}
async function toggleSave() {
  const l = state.activePlayerLecture;
  if (!l || !state.user) return;

  // save current video position before re-render destroys the element
  const vid = document.getElementById('player-video');
  if (vid?.currentTime) saveProgress(l.title, vid.currentTime, vid.duration);

  if (state.saved.has(l.title)) {
    state.saved.delete(l.title);
    _sb.from('saved_lectures').delete()
      .eq('user_id', state.user.id).eq('lecture_title', l.title).then(() => {});
  } else {
    state.saved.add(l.title);
    _sb.from('saved_lectures').insert({ user_id: state.user.id, lecture_title: l.title }).then(() => {});
  }
  render();
  setTimeout(() => {
    const newVid = document.getElementById('player-video');
    if (!newVid) return;
    attachVideoProgress(newVid);
    newVid.play().catch(() => {});
    const saved = state.videoProgress[l.title];
    if (saved?.position > 3) {
      const pct = saved.duration ? saved.position / saved.duration : 0;
      if (pct < 0.95) {
        const seek = () => { newVid.currentTime = saved.position; };
        if (newVid.readyState >= 3) seek();
        else newVid.addEventListener('canplay', seek, { once: true });
      }
    }
  }, 150);
}
async function loadSaved() {
  if (!state.user) return;
  const { data } = await _sb.from('saved_lectures').select('lecture_title').eq('user_id', state.user.id);
  if (data) state.saved = new Set(data.map(r => r.lecture_title));
}
async function loadProgress() {
  if (!state.user) return;
  const { data } = await _sb.from('video_progress')
    .select('lecture_title,position_seconds,duration_seconds')
    .eq('user_id', state.user.id);
  if (data) {
    state.videoProgress = {};
    data.forEach(r => {
      state.videoProgress[r.lecture_title] = { position: r.position_seconds, duration: r.duration_seconds };
    });
  }
}
async function saveProgress(title, position, duration) {
  if (!state.user || !title) return;
  state.videoProgress[title] = { position, duration };
  _sb.from('video_progress').upsert({
    user_id: state.user.id,
    lecture_title: title,
    position_seconds: Math.floor(position),
    duration_seconds: Math.floor(duration) || 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lecture_title' }).then(() => {});
}
let _videoPauseHandler = null;
let _videoEndedHandler = null;
function attachVideoProgress(vid) {
  if (_videoTimeUpdateHandler) vid.removeEventListener('timeupdate', _videoTimeUpdateHandler);
  if (_videoPauseHandler)      vid.removeEventListener('pause',      _videoPauseHandler);
  if (_videoEndedHandler)      vid.removeEventListener('ended',      _videoEndedHandler);

  _videoTimeUpdateHandler = () => {
    if (!vid.currentTime || !state.activePlayerLecture) return;
    const now = Date.now();
    if (now - _lastProgressSave > 5000) {
      _lastProgressSave = now;
      saveProgress(state.activePlayerLecture.title, vid.currentTime, vid.duration);
    }
  };
  _videoPauseHandler = () => {
    if (vid.currentTime && state.activePlayerLecture)
      saveProgress(state.activePlayerLecture.title, vid.currentTime, vid.duration);
  };
  _videoEndedHandler = () => {
    if (state.activePlayerLecture)
      saveProgress(state.activePlayerLecture.title, vid.duration, vid.duration);
  };
  vid.addEventListener('timeupdate', _videoTimeUpdateHandler);
  vid.addEventListener('pause',      _videoPauseHandler);
  vid.addEventListener('ended',      _videoEndedHandler);
}
function setSpeed(btn, speed) {
  document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const vid = document.getElementById('player-video');
  if (vid) vid.playbackRate = parseFloat(speed);
}
function handleSearch(q) {
  state.searchQuery = q;
  if (state.activeTab !== 'materii') { state.activeTab = 'materii'; }
  state.activeMaterieId = null;
  state.activePlayerLecture = null;
  // re-render just content area
  const content = document.querySelector('.app-content');
  if (content) content.innerHTML = renderMaterii();
  // keep sidebar active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const materiiNav = document.querySelector('.nav-item:nth-child(2)');
  if (materiiNav) materiiNav.classList.add('active');
}
async function doLogout() {
  await _sb.auth.signOut();
  state.loggedIn = false;
  state.user = null;
  state.activeTab = 'acasa';
  state.activeMaterieId = null;
  state.activePlayerLecture = null;
  render();
}
function editUsername() {
  const nameEl = document.getElementById('profile-name');
  if (!nameEl) return;
  const current = state.user?.user_metadata?.username || '';
  nameEl.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap">
      <input type="text" id="username-input" value="${current}"
             style="background:rgba(255,255,255,.08);border:1px solid rgba(201,168,78,.5);border-radius:6px;padding:6px 12px;color:var(--text-1);font-size:15px;text-align:center;width:160px"
             onkeydown="if(event.key==='Enter')saveUsername()">
      <button onclick="saveUsername()"
              style="background:var(--gold);border:none;border-radius:6px;padding:6px 14px;color:#0F1320;font-size:13px;font-weight:600;cursor:pointer">OK</button>
      <button onclick="render()"
              style="background:transparent;border:1px solid rgba(255,255,255,.15);border-radius:6px;padding:6px 14px;color:var(--text-3);font-size:13px;cursor:pointer">Anulează</button>
    </div>`;
  document.getElementById('username-input')?.select();
}
async function saveUsername() {
  const val = document.getElementById('username-input')?.value.trim();
  if (!val) return;
  const okBtn = document.querySelector('#username-input ~ button');
  if (okBtn) { okBtn.textContent = '...'; okBtn.disabled = true; }
  const { data, error } = await _sb.auth.updateUser({ data: { username: val } });
  if (!error && data?.user) state.user = data.user;
  render();
}

/* ── Modal & Toast ─────────────────────────────────────── */
function showModal(html) {
  closeModal();
  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'modal-overlay';
  el.innerHTML = html;
  el.addEventListener('click', e => { if (e.target === el) closeModal(); });
  document.body.appendChild(el);
}
function closeModal() {
  document.getElementById('modal-overlay')?.remove();
}
function showToast(msg, duration = 3000) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

/* ── Settings actions ──────────────────────────────────── */
function showNotificari() {
  const emailOn = state.user?.user_metadata?.notif_email !== false;
  showModal(`
    <div class="modal-card">
      <h2 class="modal-title">Notificări</h2>
      <div>
        <div class="toggle-row">
          <div>
            <div class="toggle-label">Notificări prin email</div>
            <div class="toggle-desc">Prelegeri noi, actualizări de conținut</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="notif-email" ${emailOn ? 'checked' : ''} onchange="saveNotifEmail(this.checked)">
            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" onclick="closeModal()">Închide</button>
      </div>
    </div>`);
}
async function saveNotifEmail(val) {
  const { data } = await _sb.auth.updateUser({ data: { notif_email: val } });
  if (data?.user) state.user = data.user;
  showToast(val ? 'Notificările prin email au fost activate.' : 'Notificările prin email au fost dezactivate.');
}

function showLimba() {
  showModal(`
    <div class="modal-card">
      <h2 class="modal-title">Limbă</h2>
      <div style="margin-top:4px">
        <div class="lang-option lang-active">
          <span>🇲🇩 Română</span>
          <div class="lang-dot"></div>
        </div>
        <div class="lang-option lang-disabled">
          <span>🇬🇧 English</span>
          <span style="font-size:12px;color:var(--text-4)">În curând</span>
        </div>
        <div class="lang-option lang-disabled">
          <span>🇷🇺 Русский</span>
          <span style="font-size:12px;color:var(--text-4)">În curând</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" onclick="closeModal()">Închide</button>
      </div>
    </div>`);
}

function showDescarcari() {
  showModal(`
    <div class="modal-card">
      <h2 class="modal-title">Descărcări</h2>
      <div class="modal-body">
        <p>Descărcarea prelegerilor pentru vizionare offline este disponibilă exclusiv în <strong style="color:var(--text-1)">aplicația mobilă</strong> Berliba Prelegeri.</p>
        <p>În browser, toate prelegerile sunt accesibile în streaming oriunde ai conexiune la internet.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" onclick="closeModal()">Închis</button>
      </div>
    </div>`);
}

function showAjutor() {
  showModal(`
    <div class="modal-card">
      <h2 class="modal-title">Ajutor și suport</h2>
      <div class="modal-body">
        <p>Dacă ai întrebări despre platformă, abonament sau conținut, ne poți contacta direct:</p>
        <p style="margin-top:4px">
          <strong style="color:var(--text-1)">Email:</strong>
          <a href="mailto:berlibaflorentiu@gmail.com" style="color:var(--gold);margin-left:6px">berlibaflorentiu@gmail.com</a>
        </p>
        <p>Răspundem în maxim 24 de ore în zilele lucrătoare.</p>
      </div>
      <div class="modal-footer">
        <a href="mailto:berlibaflorentiu@gmail.com" class="btn-gold" style="padding:8px 20px;font-size:14px;font-weight:600;color:var(--cta-text);background:var(--gold);border-radius:8px;text-decoration:none">Trimite email</a>
        <button class="btn-ghost" onclick="closeModal()">Închide</button>
      </div>
    </div>`);
}

function showTermeni() {
  showModal(`
    <div class="modal-card">
      <h2 class="modal-title">Termeni și condiții</h2>
      <div class="modal-terms-body">
        <h4>1. Acceptarea termenilor</h4>
        <p>Prin crearea unui cont și utilizarea platformei Berliba Prelegeri, ești de acord cu prezenții termeni. Dacă nu ești de acord, te rugăm să nu utilizezi platforma.</p>
        <h4>2. Abonamentul</h4>
        <p>Accesul la conținut necesită un abonament activ. Abonamentul se reînnoiește automat la finalul perioadei. Îl poți anula oricând înainte de reînnoire fără costuri suplimentare.</p>
        <h4>3. Utilizarea conținutului</h4>
        <p>Conținutul platformei — prelegerile video, materialele și structura acestora — este protejat de dreptul de autor. Este interzisă descărcarea, redistribuirea sau reproducerea fără acordul scris al autorului.</p>
        <h4>4. Contul tău</h4>
        <p>Ești responsabil pentru securitatea contului tău. Nu partaja datele de autentificare. Orice activitate din contul tău îți este atribuită.</p>
        <h4>5. Politica de rambursare</h4>
        <p>Rambursările se acordă în termen de 7 zile de la plată dacă nu ai accesat mai mult de 2 prelegeri. Contactează-ne la adresa de email indicată în secțiunea de suport.</p>
        <h4>6. Modificări</h4>
        <p>Ne rezervăm dreptul de a modifica acești termeni. Vei fi notificat prin email cu cel puțin 14 zile înainte de orice modificare semnificativă.</p>
        <h4>7. Contact</h4>
        <p>Pentru orice întrebări juridice sau legate de termeni: <a href="mailto:berlibaflorentiu@gmail.com" style="color:var(--gold)">berlibaflorentiu@gmail.com</a></p>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" onclick="closeModal()">Am înțeles</button>
      </div>
    </div>`);
}

function showGestioneaza() {
  showModal(`
    <div class="modal-card">
      <h2 class="modal-title">Gestionează abonamentul</h2>
      <div class="modal-body">
        <p>Pentru a modifica, anula sau reînnoi abonamentul tău, contactează-ne direct:</p>
        <p>
          <strong style="color:var(--text-1)">Email:</strong>
          <a href="mailto:berlibaflorentiu@gmail.com" style="color:var(--gold);margin-left:6px">berlibaflorentiu@gmail.com</a>
        </p>
        <p>Includeți în mesaj adresa de email a contului și tipul de modificare solicitat.</p>
      </div>
      <div class="modal-footer">
        <a href="mailto:berlibaflorentiu@gmail.com" class="btn-gold" style="padding:8px 20px;font-size:14px;font-weight:600;color:var(--cta-text);background:var(--gold);border-radius:8px;text-decoration:none">Contactează-ne</a>
        <button class="btn-ghost" onclick="closeModal()">Închide</button>
      </div>
    </div>`);
}

/* ── Scroll Reveal ─────────────────────────────────────── */
function attachScrollReveal() {
  // Hero entrance — fires once shortly after render, independent of scroll
  const hero = document.querySelector('.hero');
  if (hero) setTimeout(() => hero.classList.add('hero-ready'), 120);

  // IntersectionObserver for all [data-sr] elements
  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything immediately
    document.querySelectorAll('[data-sr]').forEach(el => el.classList.add('sr-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('sr-in');
      io.unobserve(entry.target); // fire once only
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('[data-sr]').forEach(el => io.observe(el));
}

/* ── Sticky Tabs ───────────────────────────────────────── */
function attachStickyTabs() {
  const heightEl = document.getElementById('stabs-height');
  if (!heightEl) return;

  const contents = document.querySelectorAll('.stab-content');
  const visuals  = document.querySelectorAll('.stab-visual');
  const TOTAL    = contents.length;
  let current    = -1;

  function setTab(idx) {
    if (idx === current) return;
    current = idx;
    contents.forEach((el, i) => el.classList.toggle('stab-active', i === idx));
    visuals.forEach((el, i)  => el.classList.toggle('stab-active', i === idx));
  }

  // On mobile the section is static; just show first tab
  if (window.matchMedia('(max-width: 768px)').matches) {
    setTab(0);
    return;
  }

  setTab(0);

  function onScroll() {
    const rect   = heightEl.getBoundingClientRect();
    const total  = heightEl.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / total));
    const idx    = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));
    setTab(idx);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Clean up when page re-renders (SPA navigation)
  const observer = new MutationObserver(() => {
    if (!document.getElementById('stabs-height')) {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('root'), { childList: true });
}

/* ── Event attachment ──────────────────────────────────── */
function attachLandingEvents() {}
function attachAppEvents() {}

/* ── Arc Preloader ──────────────────────────────────────── */
(function arcPreloader() {
  const STORAGE_KEY = 'berliba-preloader-v1';
  // 3 punchy words — tight and premium
  const GREETINGS   = ['Drept.', 'Clar.', 'Pregătit.'];
  const HOLD_MS     = 560;   // how long each word stays visible
  const EXIT_MS     = 220;   // exit animation duration
  const MONO_MS     = 680;   // monogram hold
  const REVEAL_MS   = 1100;  // arc sweep duration

  const overlay  = document.getElementById('arc-preloader');
  const greetEl  = document.getElementById('arc-greeting');
  const monoEl   = document.getElementById('arc-monogram');
  const pathEl   = document.getElementById('arc-path');
  if (!overlay || !greetEl || !monoEl || !pathEl) return;

  try {
    if (localStorage.getItem(STORAGE_KEY) === 'done') {
      overlay.style.display = 'none';
      return;
    }
  } catch (_) {}

  let idx = 0;

  // Quadratic-bezier arc path: chord rises from y=110→y=-30 as p goes 0→1
  function arcD(p) {
    const edge    = 110 - p * 140;
    const control = edge + 32; // slightly more dramatic curve
    return `M 0 ${edge} Q 50 ${control} 100 ${edge} L 100 110 L 0 110 Z`;
  }

  // Ease: cubic-bezier(0.85,0,0.15,1) — sharp ease-in-out
  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function showGreeting(text, onDone) {
    greetEl.textContent = text;
    greetEl.className = 'arc-g-enter';
    setTimeout(() => {
      greetEl.className = 'arc-g-exit';
      setTimeout(onDone, EXIT_MS);
    }, HOLD_MS);
  }

  function cycleGreetings() {
    if (idx >= GREETINGS.length) { showMonogram(); return; }
    // Turn on glow on first greeting
    if (idx === 0) overlay.classList.add('arc-glow-on');
    showGreeting(GREETINGS[idx++], cycleGreetings);
  }

  function showMonogram() {
    greetEl.style.opacity = '0';
    monoEl.classList.add('arc-mono-show');

    setTimeout(() => {
      monoEl.classList.add('arc-mono-hide');
      setTimeout(startReveal, 300);
    }, MONO_MS);
  }

  function startReveal() {
    overlay.classList.remove('arc-glow-on');
    const start = performance.now();

    function tick(now) {
      const raw = Math.min(1, (now - start) / REVEAL_MS);
      const p   = ease(raw);
      pathEl.setAttribute('d', arcD(p));
      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        try { localStorage.setItem(STORAGE_KEY, 'done'); } catch (_) {}
        overlay.classList.add('arc-done');
        setTimeout(() => { overlay.style.display = 'none'; }, 250);
      }
    }
    requestAnimationFrame(tick);
  }

  cycleGreetings();
})();

/* ── Boot ──────────────────────────────────────────────── */
async function boot() {
  const { data: { session } } = await _sb.auth.getSession();
  if (session) {
    state.loggedIn = true;
    state.user = session.user;
    await Promise.all([loadSaved(), loadProgress()]);
  } else {
    warmupSupabase();
  }
  render();

  _sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      state.loggedIn = false;
      state.user = null;
      render();
    }
  });
}
boot();
