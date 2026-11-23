(function(){
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const wheel = $('wheel'), wrap = $('wheelWrap'), canvas = $('wheelCanvas');
  const spinBtn = $('spinBtn'), statusEl = $('spinStatus');
  const modal = $('resultModal'), card = modal.querySelector('.modal-card');
  const titleEl = $('resultTitle'), msgEl = $('resultMsg'), eyebrowEl = $('resultEyebrow');
  const couponBox = $('couponBox'), couponCode = $('couponCode'), modalNote = $('modalNote');
  const copyBtn = $('copyBtn'), againBtn = $('againBtn');
  if(!wheel || !canvas) return;

  const STORE_KEY = 'bb_spin_result_v1';
  const CODE_RE = /^BB-(5OFF|10OFF|COFFEE)-[A-Z2-9]{6}$/;
  const RULES = window.BBSpinRules || {};              /* minimum order amounts live in cart.js */
  const inr = n => '₹' + Number(n).toLocaleString('en-IN');

  /* 7 segments, one "Try Again". Weights add up to 100. */
  const PRIZES = [
    {label:'5% OFF',      slug:'5OFF',   weight:18, bg:'#241d16', fg:'#f3eee6'},
    {label:'Try Again',   slug:null,     weight:14, bg:'#ece4d6', fg:'#2a2118'},
    {label:'10% OFF',     slug:'10OFF',  weight:14, bg:'#6b4934', fg:'#f3eee6'},
    {label:'Free Coffee', slug:'COFFEE', weight:11, bg:'#c5a06a', fg:'#1b1712'},
    {label:'5% OFF',      slug:'5OFF',   weight:18, bg:'#241d16', fg:'#f3eee6'},
    {label:'10% OFF',     slug:'10OFF',  weight:14, bg:'#6b4934', fg:'#f3eee6'},
    {label:'Free Coffee', slug:'COFFEE', weight:11, bg:'#c5a06a', fg:'#1b1712'}
  ];
  const SEG = 360 / PRIZES.length;
  const TOTAL = PRIZES.reduce((s,p)=>s + p.weight, 0);
  const minFor = slug => (RULES[slug] && RULES[slug].minOrder) || 0;
  const terms = slug => 'Valid on orders of ' + inr(minFor(slug)) + ' or more. Paste the code in your cart to apply it.';
  const nameOf = slug => slug === 'COFFEE' ? 'Free Coffee' : (slug === '5OFF' ? '5% OFF' : '10% OFF');

  let rotation = 0, spinning = false, lastFocus = null;
  let result = null;                                   /* a won coupon locks the wheel until the page is refreshed */
  try{ localStorage.removeItem(STORE_KEY); }catch(e){} /* clear anything saved by older versions */

  /* ---------- drawing ---------- */
  function draw(){
    const size = wrap.clientWidth;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(size * dpr);
    canvas.style.width = canvas.style.height = '100%';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,size,size);
    const c = size/2, r = c, rad = Math.PI*2 / PRIZES.length;
    PRIZES.forEach((p,i)=>{
      const a0 = -Math.PI/2 + i*rad, a1 = a0 + rad;
      ctx.beginPath(); ctx.moveTo(c,c); ctx.arc(c,c,r,a0,a1); ctx.closePath();
      ctx.fillStyle = p.bg; ctx.fill();
      ctx.strokeStyle = 'rgba(210,185,143,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.save();
      ctx.translate(c,c); ctx.rotate(a0 + rad/2);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = p.fg;
      let fs = r*0.088;
      ctx.font = '500 ' + fs + 'px "Playfair Display", Georgia, serif';
      if('letterSpacing' in ctx) ctx.letterSpacing = (r*0.008) + 'px';
      const room = r*0.56;                                   /* keep labels clear of the centre button */
      const w = ctx.measureText(p.label.toUpperCase()).width;
      if(w > room){ fs = fs * room / w; ctx.font = '500 ' + fs + 'px "Playfair Display", Georgia, serif'; }
      ctx.fillText(p.label.toUpperCase(), r*0.9, 0);
      ctx.restore();
    });
  }

  /* ---------- selection: JS picks the prize first, the animation then lands on it ---------- */
  function pickIndex(){
    let n = Math.random() * TOTAL;
    for(let i=0;i<PRIZES.length;i++){ n -= PRIZES[i].weight; if(n < 0) return i; }
    return PRIZES.length - 1;
  }
  function makeCode(slug){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
    for(let i=0;i<6;i++) s += chars[Math.floor(Math.random()*chars.length)];
    return 'BB-' + slug + '-' + s;
  }

  /* ---------- page state ---------- */
  function setBusy(b){
    spinBtn.disabled = b || !!result;
    spinBtn.setAttribute('aria-busy', String(b));
    spinBtn.querySelector('span').textContent = b ? '···' : (result ? '✓' : 'SPIN');
    spinBtn.setAttribute('aria-label', b ? 'Wheel is spinning' : (result ? 'You have already used your spin' : 'Spin the wheel'));
    wrap.classList.toggle('is-spinning', b);
    if(b) statusEl.textContent = 'Spinning…';
  }
  function showMyCoupon(){
    const box = $('myCoupon');
    if(!result){ box.hidden = true; return; }
    $('myPrize').textContent = nameOf(result.slug);
    $('myCode').textContent = result.code;
    $('myTerms').textContent = terms(result.slug);
    box.hidden = false;
    statusEl.textContent = 'You have used your spin. Copy your coupon below before you leave this page.';
  }
  function showTerms(){
    const ul = $('spinTerms'); ul.innerHTML = '';
    ['5OFF','10OFF','COFFEE'].forEach(slug=>{
      const li = document.createElement('li');
      const a = document.createElement('span'); a.textContent = nameOf(slug);
      const b = document.createElement('em'); b.textContent = 'Orders of ' + inr(minFor(slug)) + ' or more';
      li.append(a, b); ul.appendChild(li);
    });
  }

  /* ---------- spin ---------- */
  function spin(){
    if(spinning || result || !modal.hidden) return;
    spinning = true; setBusy(true);
    const idx = pickIndex();
    const center = idx*SEG + SEG/2;
    const jitter = (Math.random() - .5) * SEG * .6;       /* stays inside the chosen segment */
    const targetMod = (((-(center + jitter)) % 360) + 360) % 360;
    const curMod = ((rotation % 360) + 360) % 360;
    const delta = (targetMod - curMod + 360) % 360;
    const dur = reduce ? 900 : 5600;
    rotation += (reduce ? 1 : 6)*360 + delta;

    void wheel.offsetWidth;
    wheel.style.transition = 'transform ' + dur + 'ms cubic-bezier(.12,.62,.08,1)';
    wheel.style.transform = 'rotate(' + rotation + 'deg)';

    let done = false, timer;
    function finish(){
      if(done) return; done = true; clearTimeout(timer);
      wheel.removeEventListener('transitionend', onEnd);
      rotation = ((rotation % 360) + 360) % 360;
      wheel.style.transition = 'none';
      wheel.style.transform = 'rotate(' + rotation + 'deg)';
      spinning = false;
      const prize = PRIZES[idx];
      if(prize.slug){ result = {code:makeCode(prize.slug), slug:prize.slug}; }   /* only a prize uses up the spin */
      setBusy(false);
      showResult(prize);
    }
    function onEnd(e){ if(e.target === wheel && e.propertyName === 'transform') finish(); }
    wheel.addEventListener('transitionend', onEnd);
    timer = setTimeout(finish, dur + 400);
  }

  /* ---------- result popup ---------- */
  function showResult(p){
    if(!p.slug){
      eyebrowEl.textContent = 'SO CLOSE';
      titleEl.textContent = 'Try Again';
      msgEl.textContent = 'No prize this time. Your spin is not used up, so give the wheel another go.';
      couponBox.hidden = true; modalNote.hidden = true;
      againBtn.querySelector('span').textContent = 'Spin Again';
      againBtn.dataset.mode = 'spin';
      statusEl.textContent = 'Try Again. Tap SPIN for another go.';
    }else{
      eyebrowEl.textContent = 'CONGRATULATIONS';
      titleEl.textContent = p.slug === 'COFFEE' ? 'You won a Free Coffee' : 'You won ' + p.label;
      msgEl.textContent = 'Your coupon code is below. Copy it and paste it in your cart.';
      couponCode.textContent = result.code;
      couponBox.hidden = false;
      modalNote.textContent = terms(p.slug) + ' One spin per visit.';
      modalNote.hidden = false;
      copyBtn.textContent = 'Copy';
      againBtn.querySelector('span').textContent = 'Shop the Menu';
      againBtn.dataset.mode = 'shop';
      showMyCoupon();
    }
    openModal();
  }
  function openModal(){
    lastFocus = document.activeElement;
    modal.hidden = false; document.body.classList.add('modal-open');
    requestAnimationFrame(()=>{ modal.classList.add('open'); againBtn.focus(); });
  }
  function closeModal(then){
    modal.classList.remove('open'); document.body.classList.remove('modal-open');
    setTimeout(()=>{ modal.hidden = true; if(then) then(); else if(lastFocus && lastFocus.focus) lastFocus.focus(); }, reduce ? 0 : 400);
  }
  modal.addEventListener('click', e=>{ if(e.target.closest('[data-close]')) closeModal(); });
  againBtn.addEventListener('click', ()=>{
    if(againBtn.dataset.mode === 'spin') closeModal(spin);
    else window.location.href = 'First.html#menu';
  });
  document.addEventListener('keydown', e=>{
    if(modal.hidden) return;
    if(e.key === 'Escape'){ closeModal(); return; }
    if(e.key === 'Tab'){
      const f = card.querySelectorAll('button:not([hidden])');
      const first = f[0], last = f[f.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- copy ---------- */
  async function copyText(t){
    try{ await navigator.clipboard.writeText(t); return true; }
    catch(err){
      const ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly',''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try{ ok = document.execCommand('copy'); }catch(_){}
      ta.remove(); return ok;
    }
  }
  function wireCopy(btn, getCode){
    btn.addEventListener('click', async ()=>{
      const ok = await copyText(getCode());
      btn.textContent = ok ? 'Copied ✓' : 'Press Ctrl+C';
      setTimeout(()=>{ btn.textContent = 'Copy'; }, 2200);
    });
  }
  wireCopy(copyBtn, ()=>couponCode.textContent);
  wireCopy($('myCopy'), ()=>$('myCode').textContent);

  spinBtn.addEventListener('click', spin);
  let rz; window.addEventListener('resize', ()=>{ clearTimeout(rz); rz = setTimeout(draw, 120); });
  draw();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(draw);

  showTerms();
  /* refreshing or reopening the page always starts a fresh wheel (also when restored from the back/forward cache) */
  window.addEventListener('pageshow', e=>{ if(e.persisted) window.location.reload(); });
  setBusy(false);
})();
