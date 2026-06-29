/* ════════════════════════════════════════════════════════
   Geezfully — motion engine (GSAP + ScrollTrigger + Lenis)
   ════════════════════════════════════════════════════════ */

const docEl = document.documentElement;
docEl.classList.add('js');

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const Lenis = window.Lenis;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;

let lenis = null;
let heroDone = false;

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = '2026';

/* ── i18n: instant in-page language switch (RO default) ── */
const WA_NUMBER = '37300000000'; // replace with the real WhatsApp number (digits only, intl)
/* Contact form: get a free key at web3forms.com (enter your email, it's mailed to you),
   then paste it here. Until then the form gracefully falls back to opening the email client. */
const WEB3FORMS_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';
const CONTACT_EMAIL = 'hello@geezfully.com';

const I18N = {
  ro: {
    'nav.work': `Lucrări`, 'nav.services': `Servicii`, 'nav.process': `Proces`, 'nav.contact': `Contact`,
    'nav.cta': `Începe un proiect`,
    'hero.eyebrow': `Studio de web design &amp; development`,
    'hero.title': `<span class="line"><span class="w">Construim</span> <span class="w">site-uri</span></span><span class="line"><span class="w">care</span> <span class="w grad">chiar</span> <span class="w grad">vând.</span></span>`,
    'hero.sub': `Geezfully este un studio mic care creează site-uri rapide, spectaculoase și gândite să conversească — de la primul pixel până la lansare. Construite de la zero, niciodată din șabloane. Genul de site care îți face concurența puțin nervoasă.`,
    'hero.cta1': `Începe un proiect`, 'hero.cta2': `Vezi lucrările`,
    'hero.meta1': `Construit de la zero`, 'hero.meta2': `Șabloane folosite`,
    'hero.meta3val': `&lt;1 săpt.`, 'hero.meta3': `Livrare tipică`, 'hero.scroll': `Derulează`,
    'marquee': `Web Design <b>✦</b> Development <b>✦</b> Branding <b>✦</b> E‑commerce <b>✦</b> Aplicații web <b>✦</b> SEO &amp; Viteză <b>✦</b> Motion <b>✦</b>`,
    'work.eyebrow': `Proiecte selectate`,
    'work.title': `Proiecte reale. <span class="grad">Live, nu mockup-uri.</span>`,
    'work.lead': `Fiecare site de mai jos e construit de la zero și funcționează chiar acum. Treci cu mouse-ul pentru preview, dă click ca să-l deschizi.`,
    'loading': `Se încarcă…`,
    'tag.construction': `Construcții`, 'tag.usa': `SUA`, 'tag.webapp': `Aplicație web`, 'tag.platform': `Platformă`, 'tag.featured': `Recomandat`,
    'case.viewlive': `Vezi live`,
    'alda.desc': `Un site de prezentare bold, axat pe imagini, pentru o firmă de tâmplărie și gresie din Sacramento — galerie, servicii și formular de contact.`,
    'pontaj.desc': `Un tracker curat pentru ore facturabile — interfață de produs concentrată, interacțiuni rapide și un dashboard direct la obiect.`,
    'berliba.desc': `O platformă de abonament cinematică pentru prelegeri video de drept — hero animat, storytelling la scroll și o zonă de membru completă. Găzduită chiar pe acest domeniu.`,
    'services.eyebrow': `Ce facem`,
    'services.title': `Tot ce are nevoie site-ul tău, <span class="grad">într-un singur loc.</span>`,
    'svc1.p': `Interfețe distinctive, în identitatea ta, gândite să conversească — nu doar să decoreze. Fiecare pixel își merită locul.`,
    'svc2.p': `Front-end-uri scrise manual, ultra-rapide, și aplicații web complete. Curat, ușor de întreținut și cu adevărat al tău.`,
    'svc3.h3': `Branding &amp; Identitate`, 'svc3.p': `Logo, tipografie, culoare și ton care te fac instant recognoscibil și imposibil de ignorat.`,
    'svc4.h3': `Viteză &amp; SEO`, 'svc4.p': `Încărcare sub o secundă, cod curat și structură optimizată pentru căutări, ca oamenii să te găsească — și să rămână.`,
    'svc5.p': `Magazine ușor de folosit și ușor de administrat — construite ca să transforme vizitatorii în clienți.`,
    'svc6.h3': `Mentenanță &amp; Creștere`, 'svc6.p': `Lansarea e doar începutul. Întreținem, rafinăm și creștem site-ul ca să performeze lună de lună.`,
    'process.eyebrow': `Cum lucrăm`,
    'process.title': `De la idee la lansare în <span class="grad">patru pași.</span>`,
    'step1.h3': `Descoperire`, 'step1.p': `Înțelegem afacerea, obiectivele și publicul tău — apoi stabilim exact ce trebuie să facă site-ul.`,
    'step2.p': `Vezi design-uri reale, în identitatea ta, din start. Rafinăm împreună până simți că e clar al tău.`,
    'step3.h3': `Construire`, 'step3.p': `Îl scriem manual — rapid, responsive și pixel-perfect pe orice dispozitiv.`,
    'step4.h3': `Lansare`, 'step4.p': `Publicăm, testăm și îți dăm cheile. Apoi rămânem aproape ca să crească.`,
    'cta.eyebrow': `Hai să vorbim`,
    'cta.title': `Ai un proiect? <span class="grad">Hai să construim ceva care vinde.</span>`,
    'cta.lead': `Spune-ne ce ai în minte — un site nou, un redesign sau o aplicație web. Răspundem rapid, de obicei într-o zi.`,
    'cta.wa': `Scrie-ne pe WhatsApp`, 'cta.email': `Sau scrie-ne pe email`, 'cta.fine': `Preferi să suni?`,
    'footer.tagline': `Un studio de web design &amp; development care construiește site-uri cu care te lauzi.`,
    'footer.copy': `Geezfully. Construit de la zero, evident.`,
    'nav.pricing': `Prețuri`,
    'pricing.eyebrow': `Pachete`,
    'pricing.title': `Prețuri clare. <span class="grad">Fără surprize.</span>`,
    'pricing.lead': `Prețuri de pornire, ca să știi din start la ce să te aștepți. Fiecare proiect primește o ofertă fixă după ce discutăm — fără costuri ascunse.`,
    'price1.name': `Landing page`,
    'price1.price': `de la €200`,
    'price1.desc': `O singură pagină, gândită să convertească.`,
    'price1.f1': `Design custom, o pagină`,
    'price1.f2': `Responsive &amp; ultra-rapid`,
    'price1.f3': `Formular de contact`,
    'price1.f4': `Livrare în ~1 săptămână`,
    'price2.name': `Site corporativ`,
    'price2.price': `de la €500`,
    'price2.desc': `Mai multe pagini, pentru afacerea ta completă.`,
    'price2.f1': `3–6 pagini, design custom`,
    'price2.f2': `Îți editezi singur conținutul`,
    'price2.f3': `SEO de bază &amp; viteză`,
    'price2.f4': `Galerie, blog sau servicii`,
    'price2.badge': `Cel mai popular`,
    'price3.name': `Custom / Aplicație web`,
    'price3.price': `Pe bază de cerere`,
    'price3.desc': `E-commerce, dashboard-uri, ceva unic.`,
    'price3.f1': `Funcționalitate la comandă`,
    'price3.f2': `Integrări (plăți, conturi)`,
    'price3.f3': `Aplicație web completă`,
    'price3.f4': `Mentenanță &amp; creștere`,
    'price.cta': `Începe`,
    'price.note': `Prețurile sunt orientative și pot varia în funcție de complexitate.`,
    'contact.formtitle': `Sau lasă-ne un mesaj`,
    'form.name': `Nume`,
    'form.email': `Email`,
    'form.msg': `Despre proiect`,
    'form.namePh': `Numele tău`,
    'form.emailPh': `tu@email.com`,
    'form.msgPh': `Spune-ne pe scurt ce ai nevoie…`,
    'form.submit': `Trimite mesajul`,
    'form.sending': `Se trimite…`,
    'form.success': `Mulțumim! Revenim cât de curând.`,
    'form.error': `Ceva n-a mers. Încearcă din nou sau scrie-ne pe WhatsApp.`,
  },
  en: {
    'nav.work': `Work`, 'nav.services': `Services`, 'nav.process': `Process`, 'nav.contact': `Contact`,
    'nav.cta': `Start a project`,
    'hero.eyebrow': `Web design &amp; development studio`,
    'hero.title': `<span class="line"><span class="w">We</span> <span class="w">build</span> <span class="w">websites</span></span><span class="line"><span class="w">that</span> <span class="w grad">mean</span> <span class="w grad">business.</span></span>`,
    'hero.sub': `Geezfully is a small studio crafting fast, striking, conversion‑focused websites — from first pixel to launch. Custom‑built, never templated. The kind of site that makes your competitors a little nervous.`,
    'hero.cta1': `Start a project`, 'hero.cta2': `See our work`,
    'hero.meta1': `Custom‑built`, 'hero.meta2': `Templates used`,
    'hero.meta3val': `&lt;1 wk`, 'hero.meta3': `Typical delivery`, 'hero.scroll': `Scroll`,
    'marquee': `Web Design <b>✦</b> Development <b>✦</b> Branding <b>✦</b> E‑commerce <b>✦</b> Web Apps <b>✦</b> SEO &amp; Speed <b>✦</b> Motion <b>✦</b>`,
    'work.eyebrow': `Selected work`,
    'work.title': `Real projects. <span class="grad">Live, not mockups.</span>`,
    'work.lead': `Every site below is built from scratch and running right now. Hover to preview, click to open the real thing.`,
    'loading': `Loading preview…`,
    'tag.construction': `Construction`, 'tag.usa': `USA`, 'tag.webapp': `Web app`, 'tag.platform': `Platform`, 'tag.featured': `Featured`,
    'case.viewlive': `View live`,
    'alda.desc': `A bold, image‑led marketing site for a Sacramento carpentry &amp; tile firm — gallery, services and lead capture.`,
    'pontaj.desc': `A clean billable‑hours tracker — focused product UI, fast interactions and a no‑nonsense dashboard.`,
    'berliba.desc': `A cinematic subscription platform for law‑lecture videos — animated hero, scroll storytelling and a full member area. Hosted right here on this domain.`,
    'services.eyebrow': `What we do`,
    'services.title': `Everything your site needs, <span class="grad">under one roof.</span>`,
    'svc1.p': `Distinctive, on‑brand interfaces designed to convert — not just decorate. Every pixel earns its place.`,
    'svc2.p': `Hand‑coded, lightning‑fast front‑ends and full web apps. Clean, maintainable, and genuinely yours.`,
    'svc3.h3': `Branding &amp; Identity`, 'svc3.p': `Logos, type, colour and voice that make you instantly recognisable and impossible to ignore.`,
    'svc4.h3': `Speed &amp; SEO`, 'svc4.p': `Sub‑second loads, clean markup and search‑ready structure so people actually find — and stay on — your site.`,
    'svc5.p': `Stores that feel effortless to shop and easy to run — built to turn browsers into buyers.`,
    'svc6.h3': `Care &amp; Growth`, 'svc6.p': `Launch is the start. We maintain, refine and grow your site so it keeps performing month after month.`,
    'process.eyebrow': `How it works`,
    'process.title': `From idea to launch in <span class="grad">four steps.</span>`,
    'step1.h3': `Discover`, 'step1.p': `We learn your business, your goals and your audience — then map exactly what the site has to do.`,
    'step2.p': `You see real, on‑brand designs early. We refine together until it feels unmistakably yours.`,
    'step3.h3': `Build`, 'step3.p': `We hand‑code it — fast, responsive and pixel‑perfect across every device.`,
    'step4.h3': `Launch`, 'step4.p': `We ship, test and hand over the keys. Then we stick around to help it grow.`,
    'cta.eyebrow': `Let's talk`,
    'cta.title': `Got a project? <span class="grad">Let's build something that sells.</span>`,
    'cta.lead': `Tell us what you have in mind — a fresh site, a redesign, or a web app. We reply fast, usually within a day.`,
    'cta.wa': `Message us on WhatsApp`, 'cta.email': `Or email us`, 'cta.fine': `Prefer to call?`,
    'footer.tagline': `A web design &amp; development studio building sites worth bragging about.`,
    'footer.copy': `Geezfully. Built from scratch, of course.`,
    'nav.pricing': `Pricing`,
    'pricing.eyebrow': `Packages`,
    'pricing.title': `Clear pricing. <span class="grad">No surprises.</span>`,
    'pricing.lead': `Starting prices so you know what to expect up front. Every project gets a fixed quote once we talk — no hidden costs.`,
    'price1.name': `Landing page`,
    'price1.price': `from €200`,
    'price1.desc': `One page, built to convert.`,
    'price1.f1': `Custom one-page design`,
    'price1.f2': `Responsive &amp; lightning-fast`,
    'price1.f3': `Contact form`,
    'price1.f4': `Delivered in ~1 week`,
    'price2.name': `Corporate site`,
    'price2.price': `from €500`,
    'price2.desc': `Multiple pages for your whole business.`,
    'price2.f1': `3–6 pages, custom design`,
    'price2.f2': `Edit your own content`,
    'price2.f3': `Basic SEO &amp; speed`,
    'price2.f4': `Gallery, blog or services`,
    'price2.badge': `Most popular`,
    'price3.name': `Custom / Web app`,
    'price3.price': `On request`,
    'price3.desc': `E-commerce, dashboards, something unique.`,
    'price3.f1': `Bespoke functionality`,
    'price3.f2': `Integrations (payments, accounts)`,
    'price3.f3': `Full web application`,
    'price3.f4': `Maintenance &amp; growth`,
    'price.cta': `Get started`,
    'price.note': `Prices are indicative and vary with project scope.`,
    'contact.formtitle': `Or drop us a message`,
    'form.name': `Name`,
    'form.email': `Email`,
    'form.msg': `About your project`,
    'form.namePh': `Your name`,
    'form.emailPh': `you@email.com`,
    'form.msgPh': `Tell us briefly what you need…`,
    'form.submit': `Send message`,
    'form.sending': `Sending…`,
    'form.success': `Thanks! We'll get back to you soon.`,
    'form.error': `Something went wrong. Try again or message us on WhatsApp.`,
  },
};

function setWA(lang) {
  const msg = encodeURIComponent(lang === 'ro'
    ? 'Salut Geezfully! Aș vrea să discutăm despre un proiect web.'
    : "Hi Geezfully! I'd like to talk about a website project.");
  document.querySelectorAll('[data-wa]').forEach((el) => {
    el.setAttribute('href', `https://wa.me/${WA_NUMBER}?text=${msg}`);
    el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener');
  });
  document.querySelectorAll('[data-wa-tel]').forEach((el) => { el.setAttribute('href', `tel:+${WA_NUMBER}`); });
}

let curLang = 'ro';

function applyLang(lang) {
  if (!I18N[lang]) lang = 'ro';
  curLang = lang;
  const dict = I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = dict[el.dataset.i18n];
    if (v == null) return;
    if (v.indexOf('<') >= 0 || v.indexOf('&') >= 0) el.innerHTML = v;
    else el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const v = dict[el.dataset.i18nPh];
    if (v != null) el.setAttribute('placeholder', v);
  });
  docEl.lang = lang;
  document.querySelectorAll('.lang-switch button').forEach((b) => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  setWA(lang);
  try { localStorage.setItem('geez-lang', lang); } catch (_) {}
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
}

function initLangSwitch() {
  document.querySelectorAll('.lang-switch button').forEach((b) => {
    b.addEventListener('click', () => applyLang(b.dataset.lang));
  });
}

function t(key) { return (I18N[curLang] && I18N[curLang][key]) || (I18N.ro[key]) || ''; }

function initContactForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;
  const status = form.querySelector('.form-status');
  const btn = form.querySelector('button[type="submit"]');
  const btnLabel = btn ? btn.querySelector('span') : null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.botcheck && form.botcheck.checked) return; // honeypot
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());

    // Fallback: no real key yet → open the user's email client with the message prefilled.
    if (!WEB3FORMS_KEY || WEB3FORMS_KEY.indexOf('REPLACE') === 0) {
      const subject = encodeURIComponent('Proiect nou — geezfully.com');
      const body = encodeURIComponent(`Nume: ${data.name || ''}\nEmail: ${data.email || ''}\n\n${data.message || ''}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      if (status) { status.textContent = t('form.success'); status.dataset.state = 'ok'; }
      return;
    }

    if (btn) btn.disabled = true;
    if (btnLabel) btnLabel.textContent = t('form.sending');
    if (status) { status.textContent = ''; status.dataset.state = ''; }
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...data }),
      });
      const out = await res.json();
      if (out.success) {
        form.reset();
        if (status) { status.textContent = t('form.success'); status.dataset.state = 'ok'; }
      } else { throw new Error(out.message || 'failed'); }
    } catch (_) {
      if (status) { status.textContent = t('form.error'); status.dataset.state = 'err'; }
    } finally {
      if (btn) btn.disabled = false;
      if (btnLabel) btnLabel.textContent = t('form.submit');
    }
  });
}

let savedLang = 'ro';
try { savedLang = localStorage.getItem('geez-lang') || 'ro'; } catch (_) {}
initLangSwitch();
applyLang(savedLang);

if (!gsap || !ScrollTrigger) {
  docEl.classList.remove('js');
  const pl = document.getElementById('preloader');
  if (pl) pl.remove();
  mountAllEmbeds();
  initContactForm();
} else {
  gsap.registerPlugin(ScrollTrigger);
  boot();
}

/* ── Smooth scroll ─────────────────────────────────────── */
function initLenis() {
  if (reduce || !Lenis) return;
  lenis = new Lenis({ lerp: 0.14, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  docEl.classList.add('lenis');
}

/* ── Preloader ─────────────────────────────────────────── */
function runPreloader(done) {
  const pl = document.getElementById('preloader');
  if (!pl || reduce) { if (pl) pl.remove(); done(); return; }
  const fill = pl.querySelector('.pl-bar-fill');
  const count = pl.querySelector('.pl-count span');
  if (lenis) lenis.stop();
  const o = { v: 0 };
  gsap.timeline({ onComplete: () => { pl.remove(); if (lenis) lenis.start(); done(); } })
    .to(fill, { width: '100%', duration: 1.4, ease: 'power2.inOut' }, 0)
    .to(o, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { count.textContent = Math.round(o.v); } }, 0)
    .add(() => pl.classList.add('pl-leaving'), 1.45)
    .add(() => pl.classList.add('pl-exit'), 1.7);
}

/* ── Hero reveal ───────────────────────────────────────── */
function revealHero() {
  if (heroDone) return;
  heroDone = true;
  if (reduce) {
    gsap.set('.hero .reveal', { opacity: 1, y: 0 });
    setCount(); return;
  }
  const words = gsap.utils.toArray('.hero-title .w');
  gsap.set(words, { yPercent: 115 });
  gsap.timeline({ defaults: { ease: 'power3.out' }, onStart: animateCount })
    .to('.eyebrow', { opacity: 1, y: 0, duration: .7 }, 0)
    .to(words, { yPercent: 0, duration: 1, stagger: .07, ease: 'power4.out' }, .12)
    .to('.hero-sub', { opacity: 1, y: 0, duration: .8 }, .5)
    .to('.hero-cta', { opacity: 1, y: 0, duration: .8 }, .62)
    .to('.hero-meta', { opacity: 1, y: 0, duration: .8 }, .74);
}

function animateCount() {
  document.querySelectorAll('strong[data-count]').forEach((el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', delay: .3, onUpdate: () => { el.textContent = Math.round(o.v) + suf; } });
  });
}
function setCount() {
  document.querySelectorAll('strong[data-count]').forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
}

/* ── Generic reveals ───────────────────────────────────── */
function initReveals() {
  gsap.utils.toArray('.reveal').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  const rail = document.querySelector('.steps-rail span');
  if (rail && window.innerWidth > 900) {
    gsap.to(rail, { width: '100%', ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 75%', scrub: true } });
  }
}

/* ── Nav + progress ────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('[data-nav]');
  const bar = document.querySelector('.scroll-progress span');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => {
    if (bar) bar.style.width = (self.progress * 100) + '%';
    nav.classList.toggle('scrolled', self.scroll() > 40);
  }});
}

/* ── Magnetic + tilt ───────────────────────────────────── */
function initMagnetic() {
  if (reduce || coarse) return;
  document.querySelectorAll('.magnetic').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: .5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: .5, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * .3);
      yTo((e.clientY - r.top - r.height / 2) * .5);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}
function initTilt() {
  if (reduce || coarse) return;
  document.querySelectorAll('[data-tilt] .case-frame, .case-frame').forEach((el) => {
    gsap.set(el, { transformPerspective: 1000, transformOrigin: 'center' });
    const rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power2.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power2.out' });
    const host = el.closest('[data-tilt]') || el;
    host.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - .5) * 7);
      rx(-((e.clientY - r.top) / r.height - .5) * 7);
    });
    host.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

/* ── Custom cursor ─────────────────────────────────────── */
function initCursor() {
  if (reduce || coarse) return;
  const cur = document.querySelector('.cursor');
  if (!cur) return;
  const xTo = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' });
  const yTo = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cur.classList.add('show'); xTo(e.clientX); yTo(e.clientY);
  });
  document.querySelectorAll('a, button, .btn, [data-tilt]').forEach((el) => {
    el.addEventListener('pointerenter', () => cur.classList.add('grow'));
    el.addEventListener('pointerleave', () => cur.classList.remove('grow'));
  });
}

/* ── Anchors ───────────────────────────────────────────── */
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -60, duration: 1.2 });
      else t.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ── Live portfolio embeds (lazy) ──────────────────────── */
const VIEW_W = 1280;
function mountEmbed(view) {
  if (view.dataset.mounted) return;
  view.dataset.mounted = '1';
  const iframe = document.createElement('iframe');
  iframe.src = view.dataset.embed;
  iframe.loading = 'lazy';
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.title = '';
  sizeEmbed(view, iframe);
  iframe.addEventListener('load', () => view.classList.add('loaded'));
  view.appendChild(iframe);
}
function sizeEmbed(view, iframe) {
  const w = view.clientWidth || 1;
  const scale = w / VIEW_W;
  iframe.style.width = VIEW_W + 'px';
  iframe.style.height = (view.clientHeight / scale) + 'px';
  iframe.style.transform = 'scale(' + scale + ')';
}
function mountAllEmbeds() {
  document.querySelectorAll('.frame-view[data-embed]').forEach(mountEmbed);
}
function initEmbeds() {
  const views = document.querySelectorAll('.frame-view[data-embed]');
  if (!('IntersectionObserver' in window)) { mountAllEmbeds(); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { mountEmbed(en.target); io.unobserve(en.target); } });
  }, { rootMargin: '300px 0px' });
  views.forEach((v) => io.observe(v));
  let raf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      views.forEach((v) => { const f = v.querySelector('iframe'); if (f) sizeEmbed(v, f); });
    });
  });
}

/* ── Boot ──────────────────────────────────────────────── */
function boot() {
  initLenis();
  initNav();
  initReveals();
  initMagnetic();
  initTilt();
  initCursor();
  initAnchors();
  initEmbeds();
  initContactForm();
  ScrollTrigger.refresh();
  setTimeout(() => {
    const pl = document.getElementById('preloader');
    if (pl) { pl.remove(); if (lenis) lenis.start(); }
    revealHero();
  }, 4500);
  runPreloader(revealHero);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
