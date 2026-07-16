// ATTP — shared Supabase client + data helpers, used across every page.
const SUPA_URL = 'https://bghrgacqcqwdiqegkowd.supabase.co';
const SUPA_KEY = 'sb_publishable_-Sj5r66svI88A0Hm9nTvIA_hiEHqay7';
const db = supabase.createClient(SUPA_URL, SUPA_KEY);

const MONTHS_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];

function fmtDate(iso){
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_RO[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtDateShort(iso){
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}
function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function roleLabel(role){
  return { founder:'Fondator', president:'Președinte', management:'Management', coach:'Antrenor', referee:'Arbitru', player:'Jucător' }[role] || role;
}

async function fetchRecentResults(limit = 6){
  const { data, error } = await db.from('tournament_results')
    .select('*')
    .eq('status', 'finished')
    .order('start_date', { ascending:false })
    .limit(limit);
  if (error) { console.error(error); return []; }
  return data || [];
}
async function fetchFeaturedPlayers(){
  const { data, error } = await db.from('players').select('*').eq('featured', true).order('sort_order');
  if (error) { console.error(error); return []; }
  return data || [];
}
async function fetchAllPlayers(){
  const { data, error } = await db.from('players').select('*, setka_cup_cache(*)').order('last_name');
  if (error) { console.error(error); return []; }
  return data || [];
}
async function fetchTopRanked(limit = 10){
  const { data, error } = await db.from('players')
    .select('*, setka_cup_cache!inner(*)')
    .order('sort_order')
    .limit(200);
  if (error) { console.error(error); return []; }
  return (data || [])
    .filter(p => p.setka_cup_cache && p.setka_cup_cache.rating_sc != null)
    .sort((a,b) => b.setka_cup_cache.rating_sc - a.setka_cup_cache.rating_sc)
    .slice(0, limit);
}
async function fetchNews(limit = 20){
  const { data, error } = await db.from('news').select('*').order('published_at', { ascending:false }).limit(limit);
  if (error) { console.error(error); return []; }
  return data || [];
}
async function fetchPartners(){
  const { data, error } = await db.from('partners').select('*').order('sort_order');
  if (error) { console.error(error); return []; }
  return data || [];
}
async function fetchDocuments(){
  const { data, error } = await db.from('documents').select('*').order('category').order('sort_order');
  if (error) { console.error(error); return []; }
  return data || [];
}
async function fetchGalleryAlbums(){
  const { data, error } = await db.from('gallery_albums').select('*, gallery_images(count)').order('sort_order');
  if (error) { console.error(error); return []; }
  return data || [];
}
async function fetchSiteSettings(){
  const { data, error } = await db.from('site_settings').select('*').single();
  if (error) { console.error(error); return {}; }
  return data || {};
}

// Mobile nav toggle — shared across every page.
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('navToggle');
  const closeBtn = document.getElementById('navClose');
  const panel = document.getElementById('mobileNav');
  if (openBtn && panel) openBtn.addEventListener('click', () => panel.classList.add('show'));
  if (closeBtn && panel) closeBtn.addEventListener('click', () => panel.classList.remove('show'));
});
