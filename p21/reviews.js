(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const track = $('reviewTrack'), carousel = $('carousel'), viewport = $('reviewViewport');
  if(!track) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'bb_demo_reviews_v1', MAX_USER = 20;

  /* Sample reviews: fictional, written for this demo only */
  const SAMPLES = [
    {name:'Aarohi M.', rating:5, text:'The cappuccino was silky and balanced, and the corner seat made it easy to stay for hours. A lovely place to unwind.'},
    {name:'Kavya S.',  rating:5, text:'Soft lighting, warm music and a chocolate cake that disappeared in minutes. It feels calm and thoughtfully put together.'},
    {name:'Meera P.',  rating:4, text:'Friendly service and fast Wi-Fi made the Study Combo a great pick for a long afternoon. I will be back for the cold coffee.'},
    {name:'Riya D.',   rating:5, text:'Every drink was beautifully presented. The perfect spot for catching up with friends over dessert.'}
  ].map(r => Object.assign({sample:true}, r));

  /* ---------- localStorage (this browser only) ---------- */
  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if(!Array.isArray(raw)) return [];
      return raw.filter(r => r && typeof r.name === 'string' && typeof r.text === 'string' &&
          Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5 &&
          r.name.length >= 2 && r.name.length <= 40 && r.text.length >= 10 && r.text.length <= 300)
        .map(r => ({name:r.name, rating:r.rating, text:r.text, date:typeof r.date === 'string' ? r.date : ''}))
        .slice(0, MAX_USER);
    }catch(e){ return []; }
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(userReviews)); return true; }catch(e){ return false; }
  }
  let userReviews = load();
  const all = () => userReviews.concat(SAMPLES);

  /* ---------- rendering (text only, never raw HTML) ---------- */
  function initials(name){
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const a = Array.from(parts[0] || '?')[0] || '?';
    const b = parts.length > 1 ? Array.from(parts[parts.length-1])[0] : '';
    return (a + b).toUpperCase();
  }
  function el(tag, cls, text){
    const n = document.createElement(tag);
    if(cls) n.className = cls;
    if(text !== undefined) n.textContent = text;
    return n;
  }
  function starsEl(value){
    const s = el('span', 'stars', '★★★★★');
    s.style.setProperty('--pct', (value / 5 * 100) + '%');
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', value + ' out of 5 stars');
    return s;
  }
  function fmtDate(iso){
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'});
  }
  function card(r){
    const li = el('li', 'review-card');
    li.appendChild(starsEl(r.rating));
    li.appendChild(el('p', 'review-text', r.text));
    const foot = el('div', 'review-foot');
    foot.appendChild(el('span', 'avatar', initials(r.name)));
    const who = el('div', 'review-who');
    who.appendChild(el('strong', '', r.name));
    who.appendChild(el('small', '', r.sample ? 'Sample review' : ('Your review' + (r.date ? ' · ' + fmtDate(r.date) : ''))));
    foot.appendChild(who);
    li.appendChild(foot);
    return li;
  }

  /* ---------- summary ---------- */
  function updateSummary(){
    const list = all(), n = list.length;
    const avg = list.reduce((s,r)=>s+r.rating, 0) / n;
    $('avgRating').textContent = avg.toFixed(1);
    $('avgStars').style.setProperty('--pct', (avg/5*100) + '%');
    $('avgStars').setAttribute('aria-label', 'Average rating ' + avg.toFixed(1) + ' out of 5');
    const u = userReviews.length;
    $('reviewCount').textContent = 'Based on ' + n + (n === 1 ? ' review' : ' reviews') + (u ? ' · ' + u + ' added by you' : ' · samples');
    $('clearBtn').hidden = !u;
  }

  /* ---------- carousel ---------- */
  const prev = $('prevBtn'), next = $('nextBtn'), dots = $('dots'), status = $('carouselStatus');
  let page = 0;
  const perView = () => parseInt(getComputedStyle(carousel).getPropertyValue('--pv'), 10) || 1;

  function layout(){
    const n = all().length, pv = perView();
    const pages = Math.max(1, Math.ceil(n / pv));
    page = Math.min(Math.max(page, 0), pages - 1);
    const index = Math.min(page * pv, Math.max(0, n - pv));
    track.style.setProperty('--i', index);
    prev.disabled = page === 0;
    next.disabled = page >= pages - 1;
    dots.innerHTML = '';
    for(let p=0; p<pages; p++){
      const b = el('button', 'dot');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to review page ' + (p+1) + ' of ' + pages);
      if(p === page) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', ()=>go(p));
      dots.appendChild(b);
    }
    dots.hidden = pages < 2;
    prev.hidden = next.hidden = pages < 2;
    const last = Math.min(index + pv, n);
    status.textContent = 'Showing reviews ' + (index+1) + ' to ' + last + ' of ' + n;
    [].forEach.call(track.children, (c,i)=>c.setAttribute('aria-hidden', (i < index || i >= index + pv) ? 'true' : 'false'));
  }
  function go(p){ page = p; layout(); }
  function render(){
    track.innerHTML = '';
    all().forEach(r => track.appendChild(card(r)));
    updateSummary();
    layout();
  }
  prev.addEventListener('click', ()=>go(page-1));
  next.addEventListener('click', ()=>go(page+1));
  carousel.addEventListener('keydown', e=>{
    if(e.key === 'ArrowLeft' && !prev.disabled){ go(page-1); }
    if(e.key === 'ArrowRight' && !next.disabled){ go(page+1); }
  });
  let x0 = null;                                         /* swipe on touch screens */
  viewport.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; }, {passive:true});
  viewport.addEventListener('touchend', e=>{
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if(Math.abs(dx) > 50){ if(dx < 0 && !next.disabled) go(page+1); if(dx > 0 && !prev.disabled) go(page-1); }
  }, {passive:true});
  let rz; window.addEventListener('resize', ()=>{ clearTimeout(rz); rz = setTimeout(layout, 120); });

  /* ---------- toast ---------- */
  const toast = $('reviewToast'); let tt;
  function showToast(msg){
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(tt); tt = setTimeout(()=>toast.classList.remove('show'), 5200);
  }

  /* ---------- review form (modal) ---------- */
  const modal = $('reviewModal'), mcard = modal.querySelector('.modal-card');
  const form = $('reviewForm'), nameI = $('rvName'), textI = $('rvText'), submitBtn = $('rvSubmit');
  const ratingText = $('ratingText'), count = $('rvCount');
  const LABELS = {1:'Not for me', 2:'Could be better', 3:'Good', 4:'Lovely', 5:'Loved it'};
  let lastFocus = null, busy = false;

  const getRating = () => { const c = form.querySelector('input[name="rating"]:checked'); return c ? parseInt(c.value, 10) : 0; };
  function setErr(input, msg, fieldEl){
    const out = $(fieldEl ? 'rating-err' : input.id + '-err');
    out.textContent = msg;
    (fieldEl || input.closest('.field')).classList.toggle('invalid', !!msg);
    if(input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function vName(){
    const v = nameI.value.trim();
    const m = !v ? 'Please enter your name.' : !/^[\p{L}][\p{L} .'\-]{1,39}$/u.test(v) ? 'Use letters only, at least 2 characters.' : '';
    setErr(nameI, m); return !m;
  }
  function vText(){
    const v = textI.value.trim();
    const m = !v ? 'Please write a few words about your visit.' : v.length < 10 ? 'Please write at least 10 characters.' : '';
    setErr(textI, m); return !m;
  }
  function vRating(){
    const m = getRating() ? '' : 'Please choose a star rating.';
    setErr(null, m, $('ratingField')); return !m;
  }
  nameI.addEventListener('blur', vName);
  textI.addEventListener('blur', vText);
  nameI.addEventListener('input', ()=>{ if(nameI.closest('.field').classList.contains('invalid')) vName(); });
  textI.addEventListener('input', ()=>{ count.textContent = textI.value.length; if(textI.closest('.field').classList.contains('invalid')) vText(); });
  form.addEventListener('change', e=>{
    if(e.target.name === 'rating'){ const r = getRating(); ratingText.textContent = r + ' of 5 · ' + LABELS[r]; vRating(); }
  });

  function openModal(){
    lastFocus = document.activeElement;
    form.reset(); count.textContent = '0'; ratingText.textContent = 'Select a rating';
    form.querySelectorAll('.invalid').forEach(x=>x.classList.remove('invalid'));
    form.querySelectorAll('.err').forEach(x=>{ x.textContent = ''; });
    busy = false; submitBtn.disabled = false;
    modal.hidden = false; document.body.classList.add('modal-open');
    requestAnimationFrame(()=>{ modal.classList.add('open'); nameI.focus(); });
  }
  function closeModal(done){
    modal.classList.remove('open'); document.body.classList.remove('modal-open');
    setTimeout(()=>{ modal.hidden = true; busy = false; if(lastFocus && lastFocus.focus) lastFocus.focus(); if(done) done(); }, reduce ? 0 : 400);
  }
  $('writeBtn').addEventListener('click', openModal);
  modal.addEventListener('click', e=>{ if(e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e=>{
    if(modal.hidden) return;
    if(e.key === 'Escape'){ closeModal(); return; }
    if(e.key === 'Tab'){
      const els = mcard.querySelectorAll('button:not([hidden]),input:not([type=radio]),textarea,input[type=radio]:checked');
      const list = [].filter.call(els, x=>!x.disabled);
      const first = list[0], last = list[list.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  form.addEventListener('submit', e=>{
    e.preventDefault();
    if(busy) return;
    const ok = [vRating(), vName(), vText()];
    if(ok.includes(false)){
      if(!ok[0]) form.querySelector('.star-row input').focus();
      else if(!ok[1]) nameI.focus(); else textI.focus();
      return;
    }
    busy = true; submitBtn.disabled = true;
    userReviews.unshift({name:nameI.value.trim(), rating:getRating(), text:textI.value.trim(), date:new Date().toISOString()});
    userReviews = userReviews.slice(0, MAX_USER);
    const saved = save();
    page = 0; render();
    closeModal(()=>{
      showToast(saved ? 'Thank you! Your demo review was added and saved in this browser only.' : 'Thank you! Your demo review was added, but this browser could not save it for later.');
    });
  });

  $('clearBtn').addEventListener('click', ()=>{
    if(!userReviews.length) return;
    if(!window.confirm('Remove the demo reviews you added in this browser?')) return;
    userReviews = [];
    try{ localStorage.removeItem(KEY); }catch(e){}
    page = 0; render(); showToast('Your demo reviews were cleared.');
  });

  render();
})();
