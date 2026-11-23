/* Brew & Bytes — demo cart, coupons and checkout (frontend only).
   Nothing here talks to a server, takes payment or places a real order. */
(function(){
  'use strict';

  /* =====================================================
     1. CONFIGURATION — edit prices, coupons and charges here
     ===================================================== */
  const CONFIG = {
    storageKey: 'bb_demo_cart_v1',
    maxQty: 20,                       /* max quantity per item */
    taxRate: 0,                       /* demo tax, e.g. 0.05 for 5%. 0 = no tax row */
    taxLabel: 'Tax',
    deliveryFee: 0,                   /* demo delivery fee in ₹. 0 = no delivery row */
    deliveryLabel: 'Delivery'
  };

  const CATEGORIES = {
    coffee: {img:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=160&q=70'},
    cakes:  {img:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=160&q=70'},
    combos: {img:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=160&q=70'}
  };

  /* Single source of truth for prices (₹). The menu pages show these values. */
  const CATALOG = {
    'cappuccino':{name:'Cappuccino',price:99,cat:'coffee'},
    'cold-coffee':{name:'Cold Coffee',price:119,cat:'coffee'},
    'espresso':{name:'Espresso',price:79,cat:'coffee'},
    'americano':{name:'Americano',price:89,cat:'coffee'},
    'cafe-latte':{name:'Café Latte',price:109,cat:'coffee'},
    'mocha':{name:'Mocha',price:129,cat:'coffee'},
    'caramel-macchiato':{name:'Caramel Macchiato',price:139,cat:'coffee'},
    'chocolate-cake':{name:'Chocolate Cake',price:89,cat:'cakes'},
    'sweet-escape':{name:'Sweet Escape',price:149,cat:'cakes'},
    'red-velvet-slice':{name:'Red Velvet Slice',price:119,cat:'cakes'},
    'blueberry-cheesecake':{name:'Blueberry Cheesecake',price:139,cat:'cakes'},
    'study-combo':{name:'Study Combo',price:129,cat:'combos'},
    'cram-session':{name:'Cram Session',price:169,cat:'combos'},
    'sweet-pair':{name:'Sweet Pair',price:189,cat:'combos'},
    'study-duo':{name:'Study Duo',price:229,cat:'combos'}
  };

  /* Coupons. Codes won on Spin the Wheel look like BB-5OFF-AB12CD, BB-10OFF-AB12CD
     and BB-COFFEE-AB12CD (older DEMO- codes also work), and are accepted by the pattern below (type: 'percent' or 'freeItem').
     To add a fixed code, put it in COUPONS, for example:
     SAVE20: {type:'percent', value:20, minOrder:0, maxDiscount:null, expires:null} */
  const COUPONS = {};
  const SPIN_PATTERN = /^(?:BB|DEMO)-(5OFF|10OFF|COFFEE)-[A-Z2-9]{6}$/;
  /* minOrder = the cart subtotal (₹) needed before the coupon applies. Spin the Wheel reads these too. */
  const SPIN_RULES = {
    '5OFF':  {type:'percent',  value:5,  minOrder:300, maxDiscount:null, expires:null, label:'5% off'},
    '10OFF': {type:'percent',  value:10, minOrder:500, maxDiscount:null, expires:null, label:'10% off'},
    'COFFEE':{type:'freeItem', category:'coffee', minOrder:350, expires:null, label:'Free coffee'}
  };
  window.BBSpinRules = SPIN_RULES;
  function getRule(code){
    if(Object.prototype.hasOwnProperty.call(COUPONS, code)) return COUPONS[code];
    const m = SPIN_PATTERN.exec(code);
    return m ? SPIN_RULES[m[1]] : null;
  }

  /* =====================================================
     2. MONEY HELPERS — all maths is done in paise (integers)
     ===================================================== */
  const toPaise = rupees => Math.round(rupees * 100);
  function fmt(paise){
    const r = paise / 100;
    return '₹' + r.toLocaleString('en-IN', {minimumFractionDigits: Number.isInteger(r) ? 0 : 2, maximumFractionDigits: 2});
  }
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================
     3. STATE (restored and validated from localStorage)
     ===================================================== */
  const state = {items:{}, coupon:null};
  let couponNote = null;               /* {type:'ok'|'error', text} shown under the coupon box */

  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(CONFIG.storageKey) || 'null');
      state.items = {}; state.coupon = null;
      if(!raw || !Array.isArray(raw.items)) return;
      raw.items.forEach(it=>{
        if(it && typeof it.id === 'string' && Object.prototype.hasOwnProperty.call(CATALOG, it.id) &&
           Number.isInteger(it.qty) && it.qty >= 1){
          state.items[it.id] = Math.min(it.qty, CONFIG.maxQty);
        }
      });
      if(typeof raw.coupon === 'string' && getRule(raw.coupon.toUpperCase())){
        state.coupon = raw.coupon.toUpperCase();
      }
    }catch(e){ state.items = {}; state.coupon = null; }
  }
  function save(){
    try{
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        v:1, coupon:state.coupon,
        items:Object.keys(state.items).map(id=>({id, qty:state.items[id]}))
      }));
    }catch(e){ /* storage unavailable: the cart simply won't persist */ }
  }

  /* =====================================================
     4. CALCULATIONS
     ===================================================== */
  function evalCoupon(code, subtotal, lines){
    const c = getRule(code);
    if(!c) return {ok:false, reason:'invalid'};
    if(c.expires && new Date(c.expires + 'T23:59:59') < new Date()) return {ok:false, reason:'expired'};
    const min = toPaise(c.minOrder || 0);
    if(subtotal < min) return {ok:false, reason:'min', min, short:min - subtotal};
    let d = 0;
    if(c.type === 'freeItem'){                       /* one cheapest item of that category is free */
      const prices = (lines || []).filter(l=>l.cat === c.category).map(l=>l.unit);
      if(!prices.length) return {ok:false, reason:'noitem'};
      d = Math.min.apply(null, prices);
    }else{
      d = c.type === 'percent' ? Math.round(subtotal * c.value / 100) : toPaise(c.value);
      if(c.maxDiscount != null) d = Math.min(d, toPaise(c.maxDiscount));
    }
    d = Math.max(0, Math.min(d, subtotal));          /* never negative, never above the subtotal */
    return {ok:true, discount:d};
  }
  function compute(){
    const lines = Object.keys(state.items).map(id=>{
      const p = CATALOG[id], qty = state.items[id];
      return {id, name:p.name, cat:p.cat, qty, unit:toPaise(p.price), total:toPaise(p.price) * qty};
    });
    const subtotal = lines.reduce((s,l)=>s + l.total, 0);
    let discount = 0, couponState = {state:'none'};
    if(state.coupon){
      const r = evalCoupon(state.coupon, subtotal, lines);
      if(r.ok){ discount = r.discount; couponState = {state:'applied', code:state.coupon}; }
      else couponState = {state:'ineligible', code:state.coupon, reason:r.reason, short:r.short, min:r.min};
    }
    const tax = Math.round((subtotal - discount) * CONFIG.taxRate);
    const delivery = subtotal > 0 ? toPaise(CONFIG.deliveryFee) : 0;
    const total = Math.max(0, subtotal - discount + tax + delivery);
    const count = lines.reduce((s,l)=>s + l.qty, 0);
    return {lines, subtotal, discount, tax, delivery, total, count, couponState};
  }

  /* =====================================================
     5. DOM — built once, then updated by render()
     ===================================================== */
  const $ = id => document.getElementById(id);
  function inject(){
    const wrap = document.createElement('div');
    wrap.innerHTML = `
    <div class="cart-backdrop" id="cartBackdrop" hidden></div>
    <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle" aria-hidden="true">
      <div class="cart-head">
        <div><p class="eyebrow">YOUR ORDER</p><h2 id="cartTitle">Your Cart</h2></div>
        <button type="button" class="cart-close" id="cartClose" aria-label="Close cart"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="cart-body" id="cartBody">
        <div class="cart-empty" id="cartEmpty">
          <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 28h34v14a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12z"/><path d="M46 31h4a6 6 0 0 1 0 12h-4"/><path d="M20 10c-3 4 3 6 0 11M29 10c-3 4 3 6 0 11M38 10c-3 4 3 6 0 11"/></svg>
          <h3>Your cart is empty</h3>
          <p>Add a coffee, a slice of cake or a combo to begin your order.</p>
          <a href="First.html#menu" class="cart-link" id="cartBrowse">Browse the menu</a>
        </div>
        <ul class="cart-list" id="cartList"></ul>
        <button type="button" class="link-btn cart-clear" id="cartClear">Clear cart</button>
        <div class="coupon-box" id="couponBox">
          <label for="couponInput" class="coupon-title">Apply coupon</label>
          <div class="coupon-form" id="couponForm">
            <input type="text" id="couponInput" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Paste your coupon code" maxlength="20" aria-describedby="couponMsg">
            <button type="button" class="coupon-apply" id="couponApply">Apply</button>
          </div>
          <div class="coupon-applied" id="couponApplied" hidden>
            <span class="coupon-code" id="couponCodeLabel"></span>
            <button type="button" class="link-btn" id="couponRemove">Remove</button>
          </div>
          <p class="coupon-msg" id="couponMsg" role="status" aria-live="polite"></p>
          <p class="coupon-helper">Won a coupon on Spin the Wheel? Paste the code here.</p>
        </div>
        <dl class="summary-rows" id="cartTotals"></dl>
      </div>
      <div class="cart-foot">
        <p class="cart-warn" id="cartWarn" role="alert"></p>
        <button type="button" class="cart-primary" id="checkoutBtn">Proceed to Checkout</button>
      </div>
    </aside>

    <div class="modal" id="ckModal" hidden>
      <div class="modal-backdrop" data-ck-close></div>
      <div class="modal-card checkout-modal" role="dialog" aria-modal="true" aria-labelledby="ckTitle">
        <div id="ckStepForm">
          <p class="eyebrow">CHECKOUT</p>
          <h2 id="ckTitle">Checkout</h2>
          <p class="modal-msg">Enter your details to review your order. This is a college project, so no payment details are collected.</p>
          <div class="ck-grid">
            <form id="ckForm" novalidate>
              <div class="field"><label for="ckName">Full name</label><input type="text" id="ckName" maxlength="60" autocomplete="name" aria-describedby="ckName-err" placeholder="Your full name"><p class="err" id="ckName-err" role="alert"></p></div>
              <div class="field"><label for="ckEmail">Email address</label><input type="email" id="ckEmail" maxlength="80" autocomplete="email" aria-describedby="ckEmail-err" placeholder="you@example.com"><p class="err" id="ckEmail-err" role="alert"></p></div>
              <div class="field"><label for="ckPhone">Phone number</label><input type="tel" id="ckPhone" maxlength="20" inputmode="tel" autocomplete="tel" aria-describedby="ckPhone-err" placeholder="+91 98765 43210"><p class="err" id="ckPhone-err" role="alert"></p></div>
              <div class="field"><label for="ckNotes">Order notes <small>(optional)</small></label><textarea id="ckNotes" rows="2" maxlength="200" placeholder="Less sugar, extra hot…"></textarea></div>
              <div class="modal-actions">
                <button type="submit" class="hero-btn modal-primary" id="ckSubmit"><span>Place Order</span></button>
                <button type="button" class="reset-btn" id="ckBack">Back to Cart</button>
              </div>
            </form>
            <aside class="ck-review" aria-label="Order review">
              <h3>Order review</h3>
              <ul id="ckLines"></ul>
              <dl class="summary-rows" id="ckTotals"></dl>
            </aside>
          </div>
        </div>
        <div id="ckStepDone" hidden>
          <p class="eyebrow">ORDER CONFIRMED</p>
          <h2 id="doneTitle">Thank you</h2>
          <p class="modal-msg" id="doneMsg">Your order summary is ready. This is a college project, so no payment was taken and no real order was placed.</p>
          <div class="done-box">
            <span class="coupon-label">ORDER REFERENCE</span>
            <strong class="done-ref" id="doneRef"></strong>
            <span class="coupon-label">AMOUNT</span>
            <strong class="done-amt" id="doneAmt"></strong>
          </div>
          <div class="modal-actions">
            <a href="First.html#menu" class="hero-btn modal-primary" id="doneMenu"><span>Back to Menu</span></a>
            <button type="button" class="reset-btn" id="doneNew">Start a New Order</button>
          </div>
        </div>
      </div>
    </div>
    <div class="toast cart-toast" id="cartToast" role="status" aria-live="polite"></div>`;
    while(wrap.firstChild) document.body.appendChild(wrap.firstChild);

    /* nav cart button: sits next to the mobile menu toggle */
    const toggle = $('navToggle'), nav = document.querySelector('.navbar');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'cart-btn'; btn.id = 'cartBtn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg><span class="cart-count" id="cartCount" hidden>0</span>';
    if(nav){
      const right = document.createElement('div');
      right.className = 'nav-right';
      if(toggle && toggle.parentNode === nav){ nav.insertBefore(right, toggle); right.appendChild(btn); right.appendChild(toggle); }
      else { nav.appendChild(right); right.appendChild(btn); }
    }
  }

  /* =====================================================
     6. RENDER
     ===================================================== */
  function el(tag, cls, text){ const n = document.createElement(tag); if(cls) n.className = cls; if(text !== undefined) n.textContent = text; return n; }

  function totalsInto(dl, c){
    dl.innerHTML = '';
    const row = (label, value, cls) => {
      const d = el('div', 'sum-row' + (cls ? ' ' + cls : ''));
      d.appendChild(el('dt', '', label)); d.appendChild(el('dd', '', value)); dl.appendChild(d);
    };
    row('Subtotal', fmt(c.subtotal));
    if(c.discount > 0) row('Discount', '− ' + fmt(c.discount), 'sum-discount');
    if(c.tax > 0) row(CONFIG.taxLabel, fmt(c.tax));
    if(c.delivery > 0) row(CONFIG.deliveryLabel, fmt(c.delivery));
    row('Total', fmt(c.total), 'sum-total');
  }

  function render(){
    const c = compute();
    /* nav badge */
    const badge = $('cartCount'), btn = $('cartBtn');
    if(badge){
      const changed = badge.textContent !== String(c.count);
      badge.textContent = c.count; badge.hidden = c.count === 0;
      btn.setAttribute('aria-label', 'Open cart, ' + c.count + (c.count === 1 ? ' item' : ' items'));
      if(changed && !reduce){ badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
    }
    /* list */
    const list = $('cartList'); list.innerHTML = '';
    c.lines.forEach(l=>{
      const li = el('li', 'cart-row'); li.dataset.id = l.id;
      const th = el('span', 'cart-thumb', l.name.charAt(0));
      const img = document.createElement('img'); img.alt = ''; img.loading = 'lazy'; img.src = CATEGORIES[l.cat].img;
      img.addEventListener('error', ()=>img.remove(), {once:true});
      th.appendChild(img); li.appendChild(th);
      const info = el('div', 'cart-info');
      info.appendChild(el('strong', '', l.name));
      info.appendChild(el('small', '', fmt(l.unit) + ' each'));
      const q = el('div', 'qty');
      const dec = el('button', 'qty-btn', '−'); dec.type = 'button'; dec.dataset.act = 'dec'; dec.dataset.id = l.id; dec.setAttribute('aria-label', 'Decrease quantity of ' + l.name);
      const num = el('span', 'qty-num', String(l.qty)); num.setAttribute('aria-label', 'Quantity ' + l.qty);
      const inc = el('button', 'qty-btn', '+'); inc.type = 'button'; inc.dataset.act = 'inc'; inc.dataset.id = l.id; inc.setAttribute('aria-label', 'Increase quantity of ' + l.name);
      if(l.qty >= CONFIG.maxQty) inc.disabled = true;
      q.append(dec, num, inc); info.appendChild(q);
      li.appendChild(info);
      const side = el('div', 'cart-side');
      side.appendChild(el('span', 'cart-line', fmt(l.total)));
      const rm = el('button', 'cart-remove', 'Remove'); rm.type = 'button'; rm.dataset.act = 'rm'; rm.dataset.id = l.id; rm.setAttribute('aria-label', 'Remove ' + l.name + ' from cart');
      side.appendChild(rm); li.appendChild(side);
      list.appendChild(li);
    });
    const empty = c.count === 0;
    $('cartEmpty').hidden = !empty; list.hidden = empty;
    $('cartClear').hidden = empty; $('couponBox').hidden = empty; $('cartTotals').hidden = empty;
    totalsInto($('cartTotals'), c);
    renderCoupon(c);
    if(!empty) $('cartWarn').textContent = '';
    const cb = $('checkoutBtn'); cb.setAttribute('aria-disabled', String(empty)); cb.classList.toggle('is-disabled', empty);
    $('cartDrawer').classList.toggle('has-items', !empty);
  }

  function renderCoupon(c){
    const applied = !!state.coupon;
    $('couponForm').hidden = applied; $('couponApplied').hidden = !applied;
    const msg = $('couponMsg'); msg.className = 'coupon-msg';
    if(applied){
      const cs = c.couponState;
      const cp = getRule(state.coupon);
      $('couponCodeLabel').textContent = state.coupon + (cp && cp.label ? ' · ' + cp.label : '');
      if(cs.state === 'applied'){
        msg.textContent = (couponNote && couponNote.type === 'ok') ? couponNote.text : 'Coupon applied. You save ' + fmt(c.discount) + '.';
        msg.classList.add('ok');
      }else{
        const why = cs.reason === 'expired' ? 'This coupon has expired and is no longer applied to your bill.'
          : cs.reason === 'noitem' ? 'This coupon is no longer eligible. Add a coffee to your cart to use it.'
          : 'This coupon is no longer eligible. Add ' + fmt(cs.short) + ' more to reach the ' + fmt(cs.min) + ' minimum.';
        msg.textContent = why; msg.classList.add('error');
      }
    }else if(couponNote){
      msg.textContent = couponNote.text; msg.classList.add(couponNote.type === 'ok' ? 'ok' : 'error');
    }else msg.textContent = '';
  }

  /* =====================================================
     7. CART ACTIONS
     ===================================================== */
  let toastTimer;
  function toast(msg){
    const t = $('cartToast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), 3200);
  }
  function commit(){ save(); render(); }

  function add(id, button){
    if(!Object.prototype.hasOwnProperty.call(CATALOG, id)) return;
    const cur = state.items[id] || 0;
    if(cur >= CONFIG.maxQty){ toast('Maximum ' + CONFIG.maxQty + ' of each item per order.'); return; }
    state.items[id] = cur + 1;
    commit();
    const nb = document.querySelector('.navbar'); if(nb) nb.classList.remove('hidden');   /* keep the cart icon reachable after adding */
    toast(CATALOG[id].name + ' added to your cart.');
    if(button){
      const s = button.querySelector('span'); button.classList.add('added'); s.textContent = 'Added ✓';
      clearTimeout(button._t); button._t = setTimeout(()=>{ button.classList.remove('added'); s.textContent = 'Add to Cart'; }, 1400);
    }
  }
  function change(id, delta){
    if(!state.items[id]) return;
    const q = state.items[id] + delta;
    if(q <= 0) delete state.items[id];
    else state.items[id] = Math.min(q, CONFIG.maxQty);
    if(!Object.keys(state.items).length){ couponNote = null; }
    commit();
  }
  function remove(id){ delete state.items[id]; commit(); }
  function clearCart(){ state.items = {}; state.coupon = null; couponNote = null; commit(); }

  function applyCoupon(raw){
    const code = String(raw || '').trim().toUpperCase();
    if(!code){ couponNote = {type:'error', text:'Please enter a coupon code.'}; render(); return; }
    if(state.coupon){ couponNote = {type:'error', text:'Remove the current coupon before applying another.'}; render(); return; }
    const c = compute();
    if(!c.count){ couponNote = {type:'error', text:'Add items to your cart before applying a coupon.'}; render(); return; }
    if(!getRule(code)){
      couponNote = {type:'error', text:'That coupon code is not valid. Please check it and try again.'}; render(); return;
    }
    const r = evalCoupon(code, c.subtotal, c.lines);
    if(!r.ok){
      couponNote = {type:'error', text: r.reason === 'expired' ? 'This coupon has expired.'
        : r.reason === 'noitem' ? 'Add a coffee to your cart to use this Free Coffee coupon.'
        : 'This coupon needs a minimum order of ' + fmt(r.min) + '. Add ' + fmt(r.short) + ' more to use it.'};
      render(); return;
    }
    state.coupon = code;
    couponNote = {type:'ok', text:'Coupon applied. You save ' + fmt(r.discount) + '.'};
    commit();
  }
  function removeCoupon(){ state.coupon = null; couponNote = null; commit(); $('couponInput').value = ''; }

  /* =====================================================
     8. DRAWER + MODAL HANDLING
     ===================================================== */
  const drawer = () => $('cartDrawer');
  let lastFocus = null;
  function lockScroll(){ document.body.classList.toggle('modal-open', isDrawerOpen() || isCkOpen()); }
  const isDrawerOpen = () => drawer().classList.contains('open');
  const isCkOpen = () => !$('ckModal').hidden;

  function openDrawer(){
    document.body.classList.remove('nav-open');
    const t = $('navToggle'); if(t) t.setAttribute('aria-expanded', 'false');
    lastFocus = document.activeElement;
    $('cartBackdrop').hidden = false;
    drawer().setAttribute('aria-hidden', 'false');
    requestAnimationFrame(()=>{ drawer().classList.add('open'); $('cartBackdrop').classList.add('open'); $('cartClose').focus(); });
    lockScroll();
  }
  function closeDrawer(restore){
    drawer().classList.remove('open'); $('cartBackdrop').classList.remove('open');
    drawer().setAttribute('aria-hidden', 'true');
    setTimeout(()=>{ if(!isDrawerOpen()) $('cartBackdrop').hidden = true; }, reduce ? 0 : 450);
    lockScroll();
    if(restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function trap(e, root){
    if(e.key !== 'Tab') return;
    const f = [].filter.call(root.querySelectorAll('a[href],button,input,textarea,select'), x=>!x.disabled && !x.hidden && x.offsetParent !== null);
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  /* ---------- checkout ---------- */
  let ckBusy = false, ckDone = false;
  const ck = {};
  function ckErr(input, msg){
    $(input.id + '-err').textContent = msg;
    input.closest('.field').classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  const ckRules = {
    name: v => !v ? 'Please enter your name.' : !/^[\p{L}][\p{L} .'\-]{1,59}$/u.test(v) ? 'Use letters only, at least 2 characters.' : '',
    email: v => !v ? 'Please enter your email address.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Enter a valid email, like name@example.com.' : '',
    phone: v => !v ? 'Please enter your phone number.' : !/^\+?\d{10,13}$/.test(v.replace(/[\s\-()]/g, '')) ? 'Enter a valid phone number (10 to 13 digits).' : ''
  };
  const ckCheck = k => ckErr(ck[k], ckRules[k](ck[k].value.trim()));

  function openCheckout(){
    const c = compute();
    if(!c.count){
      $('cartWarn').textContent = 'Your cart is empty. Add something from the menu first.';
      toast('Your cart is empty. Add an item to continue.');
      return;
    }
    closeDrawer(false);
    ckDone = false; ckBusy = false;
    $('ckStepForm').hidden = false; $('ckStepDone').hidden = true;
    $('ckForm').reset();
    ['name','email','phone'].forEach(k=>ckErr(ck[k], ''));
    $('ckSubmit').disabled = false; $('ckSubmit').querySelector('span').textContent = 'Place Order';
    const ul = $('ckLines'); ul.innerHTML = '';
    c.lines.forEach(l=>{
      const li = el('li'); li.appendChild(el('span', '', l.name + ' × ' + l.qty)); li.appendChild(el('span', '', fmt(l.total))); ul.appendChild(li);
    });
    totalsInto($('ckTotals'), c);
    $('ckModal').hidden = false; lockScroll();
    requestAnimationFrame(()=>{ $('ckModal').classList.add('open'); ck.name.focus(); });
  }
  function closeCheckout(toCart){
    $('ckModal').classList.remove('open');
    setTimeout(()=>{
      $('ckModal').hidden = true; lockScroll();
      ['ckName','ckEmail','ckPhone','ckNotes'].forEach(id=>{ $(id).value = ''; });
      $('doneTitle').textContent = 'Thank you';
      if(toCart) openDrawer();
    }, reduce ? 0 : 400);
  }
  function placeOrder(e){
    e.preventDefault();
    if(ckBusy || ckDone) return;
    const oks = ['name','email','phone'].map(ckCheck);
    const bad = ['name','email','phone'].find((k,i)=>!oks[i]);
    if(bad){ ck[bad].focus(); return; }
    const c = compute();
    if(!c.count){ closeCheckout(false); return; }
    ckBusy = true; $('ckSubmit').disabled = true; $('ckSubmit').querySelector('span').textContent = 'Placing order…';
    setTimeout(()=>{
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
      for(let i=0;i<6;i++) s += chars[Math.floor(Math.random()*chars.length)];
      const first = ck.name.value.trim().split(/\s+/)[0];
      $('doneRef').textContent = 'BB-ORD-' + s;
      $('doneAmt').textContent = fmt(c.total);
      $('doneTitle').textContent = 'Thank you, ' + first;
      state.items = {}; state.coupon = null; couponNote = null; commit();   /* reset cart + coupon */
      ['ckName','ckEmail','ckPhone','ckNotes'].forEach(id=>{ $(id).value = ''; });
      ckBusy = false; ckDone = true;
      $('ckStepForm').hidden = true; $('ckStepDone').hidden = false;
      $('doneMenu').focus();
    }, reduce ? 150 : 1200);
  }

  /* =====================================================
     9. WIRING (each listener is attached once)
     ===================================================== */
  function init(){
    load();
    inject();
    ['name','email','phone'].forEach(k=>{ ck[k] = $('ck' + k.charAt(0).toUpperCase() + k.slice(1)); });

    /* keep menu page prices identical to the catalog */
    document.querySelectorAll('.p-item[data-id]').forEach(item=>{
      const p = CATALOG[item.dataset.id], s = item.querySelector('strong');
      if(p && s) s.textContent = fmt(toPaise(p.price));
    });

    document.addEventListener('click', e=>{
      const addBtn = e.target.closest('[data-add]');
      if(addBtn){ add(addBtn.dataset.add, addBtn); return; }
      if(e.target.closest('#cartBtn')){ openDrawer(); return; }
      if(e.target.closest('#cartClose') || e.target === $('cartBackdrop')){ closeDrawer(); return; }
      const act = e.target.closest('[data-act]');
      if(act && drawer().contains(act)){
        if(act.dataset.act === 'inc') change(act.dataset.id, 1);
        else if(act.dataset.act === 'dec') change(act.dataset.id, -1);
        else if(act.dataset.act === 'rm') remove(act.dataset.id);
        return;
      }
      if(e.target.closest('#cartClear')){ clearCart(); return; }
      if(e.target.closest('#couponApply')){ applyCoupon($('couponInput').value); return; }
      if(e.target.closest('#couponRemove')){ removeCoupon(); $('couponInput').focus(); return; }
      if(e.target.closest('#cartBrowse')){ closeDrawer(false); return; }
      if(e.target.closest('#checkoutBtn')){ openCheckout(); return; }
      if(e.target.closest('#ckBack')){ closeCheckout(true); return; }
      if(e.target.closest('[data-ck-close]')){ if(!ckBusy) closeCheckout(false); return; }
      if(e.target.closest('#doneMenu')){ closeCheckout(false); return; }
      if(e.target.closest('#doneNew')){ closeCheckout(false); toast('Cart cleared. Add items to start a new order.'); return; }
    });
    $('couponInput').addEventListener('keydown', e=>{ if(e.key === 'Enter'){ e.preventDefault(); applyCoupon($('couponInput').value); } });
    $('couponInput').addEventListener('input', ()=>{ if(couponNote && couponNote.type === 'error' && !state.coupon){ couponNote = null; $('couponMsg').textContent = ''; $('couponMsg').className = 'coupon-msg'; } });
    $('ckForm').addEventListener('submit', placeOrder);
    ['name','email','phone'].forEach(k=>{
      ck[k].addEventListener('blur', ()=>ckCheck(k));
      ck[k].addEventListener('input', ()=>{ if(ck[k].closest('.field').classList.contains('invalid')) ckCheck(k); });
    });
    document.addEventListener('keydown', e=>{
      if(isCkOpen()){
        if(e.key === 'Escape' && !ckBusy){ closeCheckout(false); return; }
        trap(e, $('ckModal').querySelector('.modal-card')); return;
      }
      if(isDrawerOpen()){
        if(e.key === 'Escape'){ closeDrawer(); return; }
        trap(e, drawer());
      }
    });
    /* keep several tabs in sync */
    window.addEventListener('storage', ev=>{ if(ev.key === CONFIG.storageKey){ load(); render(); } });
    render();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
