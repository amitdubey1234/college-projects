(function(){
  'use strict';
  const form = document.getElementById('reserveForm');
  if(!form) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const f = {name:$('rName'),email:$('rEmail'),phone:$('rPhone'),guests:$('rGuests'),date:$('rDate'),time:$('rTime'),notes:$('rNotes')};
  const submitBtn = $('rSubmit'), resetBtn = $('rReset'), count = $('rCount');
  const modal = $('rModal'), card = modal.querySelector('.modal-card');
  let submitting = false, lastFocus = null, timer = null;

  /* ---------- date limits (local time, no past dates) ---------- */
  const pad = n => String(n).padStart(2,'0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  function setDateLimits(){
    const now = new Date(), max = new Date(); max.setFullYear(max.getFullYear()+1);
    f.date.min = ymd(now); f.date.max = ymd(max);
  }
  setDateLimits();

  /* ---------- validation ---------- */
  const rules = {
    name(v){
      if(!v) return 'Please enter your full name.';
      if(!/^[\p{L}][\p{L} .'\-]{1,59}$/u.test(v)) return 'Use letters only, at least 2 characters.';
      return '';
    },
    email(v){
      if(!v) return 'Please enter your email address.';
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email, like name@example.com.';
      return '';
    },
    phone(v){
      if(!v) return 'Please enter your phone number.';
      const clean = v.replace(/[\s\-()]/g,'');
      if(!/^\+?\d{10,13}$/.test(clean)) return 'Enter a valid phone number (10 to 13 digits).';
      return '';
    },
    guests(v){ return v ? '' : 'Please select the number of guests.'; },
    date(v){
      if(!v) return 'Please choose a reservation date.';
      const p = v.split('-').map(Number);
      if(p.length !== 3 || p.some(isNaN)) return 'Enter a valid date.';
      const chosen = new Date(p[0], p[1]-1, p[2]);
      const today = new Date(); today.setHours(0,0,0,0);
      if(chosen < today) return 'Past dates cannot be selected.';
      const max = new Date(); max.setFullYear(max.getFullYear()+1);
      if(chosen > max) return 'Please choose a date within the next year.';
      return '';
    },
    time(v){
      if(!v) return 'Please choose a preferred time.';
      if(f.date.value && !rules.date(f.date.value) && f.date.value === ymd(new Date())){
        const [h,m] = v.split(':').map(Number), now = new Date();
        if(h*60 + m <= now.getHours()*60 + now.getMinutes()) return 'Choose a time later than the current time.';
      }
      return '';
    }
  };
  function value(key){ return key === 'guests' || key === 'date' || key === 'time' ? f[key].value : f[key].value.trim(); }
  function check(key){
    const msg = rules[key](value(key));
    const field = f[key].closest('.field'), out = $(f[key].id + '-err');
    out.textContent = msg;
    field.classList.toggle('invalid', !!msg);
    f[key].setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  Object.keys(rules).forEach(k=>{
    f[k].addEventListener('blur', ()=>check(k));
    f[k].addEventListener('input', ()=>{ if(f[k].closest('.field').classList.contains('invalid')) check(k); });
    f[k].addEventListener('change', ()=>{ check(k); if(k === 'date' && f.time.value) check('time'); });
  });
  f.notes.addEventListener('input', ()=>{ count.textContent = f.notes.value.length; });

  /* ---------- formatting for the summary ---------- */
  function fmtDate(v){
    const p = v.split('-').map(Number);
    return new Date(p[0], p[1]-1, p[2]).toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  }
  function fmtTime(v){
    const [h,m] = v.split(':').map(Number);
    return ((h % 12) || 12) + ':' + pad(m) + ' ' + (h >= 12 ? 'PM' : 'AM');
  }
  function demoRef(){
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
    for(let i=0;i<6;i++) s += c[Math.floor(Math.random()*c.length)];
    return 'DEMO-RSV-' + s;
  }

  /* ---------- submit (guarded against duplicates) ---------- */
  form.addEventListener('submit', e=>{
    e.preventDefault();
    if(submitting) return;
    const keys = Object.keys(rules);
    const results = keys.map(check);
    const firstBad = keys.find((k,i)=>!results[i]);
    if(firstBad){ f[firstBad].focus(); return; }

    submitting = true;
    submitBtn.disabled = true; resetBtn.disabled = true;
    submitBtn.setAttribute('aria-busy','true');
    submitBtn.querySelector('span').textContent = 'Preparing summary…';
    timer = setTimeout(()=>{
      fillSummary();
      submitting = false;
      submitBtn.disabled = false; resetBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.querySelector('span').textContent = 'Reserve a Table';
      openModal();
    }, reduce ? 200 : 1400);
  });

  function fillSummary(){
    $('sName').textContent = f.name.value.trim();
    $('sEmail').textContent = f.email.value.trim();
    $('sPhone').textContent = f.phone.value.trim();
    $('sDate').textContent = fmtDate(f.date.value);
    $('sTime').textContent = fmtTime(f.time.value);
    $('sGuests').textContent = f.guests.value + (f.guests.value === '1' ? ' guest' : ' guests');
    const n = f.notes.value.trim();
    $('sNotes').textContent = n;
    $('sNotesRow').hidden = !n;
    $('sRef').textContent = demoRef();
  }
  function clearSummary(){
    ['sName','sEmail','sPhone','sDate','sTime','sGuests','sNotes','sRef'].forEach(id=>{ $(id).textContent = ''; });
  }

  /* ---------- clear / reset ---------- */
  function clearErrors(){
    form.querySelectorAll('.field').forEach(x=>x.classList.remove('invalid'));
    form.querySelectorAll('.err').forEach(x=>{ x.textContent = ''; });
    Object.values(f).forEach(x=>x.removeAttribute('aria-invalid'));
  }
  form.addEventListener('reset', ()=>{ clearErrors(); count.textContent = '0'; setTimeout(setDateLimits,0); });

  /* ---------- modal ---------- */
  function openModal(){
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(()=>{ modal.classList.add('open'); $('rmClose').focus(); });
  }
  function closeModal(){
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    setTimeout(()=>{
      modal.hidden = true;
      clearSummary();                  /* don't keep personal details in the page */
      form.reset();                    /* start fresh after closing */
      if(lastFocus && lastFocus.focus) lastFocus.focus();
      window.scrollTo({top: 0, behavior: reduce ? 'auto' : 'smooth'});
    }, reduce ? 0 : 400);
  }
  modal.addEventListener('click', e=>{ if(e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e=>{
    if(modal.hidden) return;
    if(e.key === 'Escape'){ closeModal(); return; }
    if(e.key === 'Tab'){
      const els = card.querySelectorAll('a[href],button:not([hidden])');
      const first = els[0], last = els[els.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('pagehide', ()=>{ clearTimeout(timer); clearSummary(); });
})();
