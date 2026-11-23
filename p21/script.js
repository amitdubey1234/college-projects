const body = document.body;
const intro = document.getElementById('intro');
const skipBtn = document.getElementById('skipBtn');
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Intro */
let introDone = false;
function hideIntro(){
  if(introDone) return;
  introDone = true;
  intro.classList.add('hide');
  body.classList.remove('is-loading');
  body.classList.add('loaded');
  setTimeout(()=>{ intro.style.display = 'none'; }, 1000);
  try{ sessionStorage.setItem('bbIntroSeen','1'); }catch(e){}
}
if(!intro){ body.classList.add('loaded'); }
let seen = false;
try{ seen = sessionStorage.getItem('bbIntroSeen') === '1'; }catch(e){}
if(!intro){
  /* sub page: no intro */
}else if(seen || reduceMotion){
  hideIntro();
}else{
  setTimeout(hideIntro, 6900);
  skipBtn.addEventListener('click', hideIntro);
}

/* Scroll reveals (with optional stagger via data-delay) */
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(()=>el.classList.add('visible'), delay);
      observer.unobserve(el);
    }
  });
},{threshold:.12});
document.querySelectorAll('.reveal,.reveal-img').forEach(el=>observer.observe(el));

/* Mobile nav */
function setNav(open){
  body.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
navToggle.addEventListener('click', ()=>setNav(!body.classList.contains('nav-open')));
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>setNav(false)));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') setNav(false); });

/* Active link highlighting */
const sections = [...navLinks.querySelectorAll('a[href^="#"]')].map(a=>({a, s:document.querySelector(a.getAttribute('href'))})).filter(x=>x.s);
const spy = new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      sections.forEach(x=>x.a.classList.toggle('active', x.s===en.target));
    }
  });
},{rootMargin:'-45% 0px -50% 0px'});
sections.forEach(x=>spy.observe(x.s));

/* Scroll: navbar state + parallax (single rAF-throttled handler) */
const parallaxEls = document.querySelectorAll('[data-parallax]');
const parallaxImgs = document.querySelectorAll('[data-parallax-img]');
let lastY = window.scrollY, ticking = false;

function update(){
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  if(!body.classList.contains('nav-open')){
    navbar.classList.toggle('hidden', y > lastY && y > 400);
  }
  lastY = y;
  if(!reduceMotion){
    const vh = window.innerHeight;
    parallaxEls.forEach(el=>{
      const r = el.parentElement.getBoundingClientRect();
      if(r.bottom < 0 || r.top > vh) return;
      el.style.transform = `translate3d(0,${(r.top + r.height/2 - vh/2) * -parseFloat(el.dataset.parallax)}px,0)`;
    });
    parallaxImgs.forEach(img=>{
      const r = img.parentElement.getBoundingClientRect();
      if(r.bottom < 0 || r.top > vh) return;
      img.style.transform = `translate3d(0,${(r.top + r.height/2 - vh/2) * -parseFloat(img.dataset.parallaxImg)}px,0)`;
    });
  }
  ticking = false;
}
window.addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(update); ticking = true; } }, {passive:true});
window.addEventListener('resize', update);
update();

/* Image fallbacks */
document.querySelectorAll('img[data-fallback]').forEach(img=>{
  img.addEventListener('error', ()=>{
    if(img.dataset.fallback && img.src !== img.dataset.fallback){ img.src = img.dataset.fallback; }
  }, {once:true});
});

/* Page transitions between pages */
if(!reduceMotion){
  document.querySelectorAll('a[href]').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href)) return;
    a.addEventListener('click', e=>{
      if(e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      e.preventDefault();
      body.classList.add('leaving');
      setTimeout(()=>{ window.location.href = href; }, 420);
    });
  });
  window.addEventListener('pageshow', ()=>body.classList.remove('leaving'));
}


/* Hero video background: plays muted, pauses off-screen, falls back to the poster image */
(function(){
  const video = document.getElementById('heroVideo');
  if(!video) return;
  const hero = video.closest('.hero');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection && navigator.connection.saveData;
  let visible = true, stopped = false;

  function showPoster(){                       /* static fallback: poster image shows through */
    stopped = true; hero.classList.add('video-off'); video.pause();
  }
  function dropVideo(){                        /* also stop the download */
    showPoster(); video.removeAttribute('autoplay'); video.preload = 'none';
    video.querySelectorAll('source').forEach(s=>s.remove()); video.load();
  }
  function tryPlay(){
    if(stopped || !visible) return;
    video.muted = true;
    const p = video.play();
    if(p && p.catch) p.catch(()=>{ /* autoplay blocked: keep the poster, retry on first touch/click */
      const retry = ()=>{ if(!stopped){ video.play().catch(()=>{}); } };
      ['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev, retry, {once:true, passive:true}));
    });
  }

  if(motion.matches || saveData){ dropVideo(); return; }
  motion.addEventListener && motion.addEventListener('change', e=>{ if(e.matches) dropVideo(); });

  video.querySelector('source').addEventListener('error', showPoster);   /* file missing/unsupported */
  video.addEventListener('error', showPoster);
  video.addEventListener('stalled', ()=>{ if(video.readyState < 2) video.preload = 'auto'; });

  if('IntersectionObserver' in window){        /* don't decode video while the hero is off-screen */
    new IntersectionObserver(entries=>{
      visible = entries[0].isIntersecting;
      if(visible) tryPlay(); else video.pause();
    }, {threshold:.05}).observe(hero);
  }
  tryPlay();
})();
