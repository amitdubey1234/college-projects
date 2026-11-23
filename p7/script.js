/* ==========================================================================
   CHROMACAFÉ — MASTER APPLICATION ENGINE (script.js)
   60fps rAF Parallax • Dynamic Demo Loader • Micro-Interactions • Full POS/ERP
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. APPLICATION STATE (Single Source of Truth)
     ------------------------------------------------------------------------ */
  const state = {
    currentView: 'customer-view',
    tableNumber: 17,
    groupMode: true,
    activeDiner: 'Antara',
    groupMembers: ['Antara', 'Rahul', 'Aditi'],
    customer: {
      name: 'Antara Sharma',
      id: 'CAF10245',
      points: 640,
      totalOrders: 14,
    },
    favourites: new Set(['cof-2', 'piz-4', 'pas-3']),
    appliedCoupon: null,
    coupons: {
      TABLE20:   { type: 'percent', value: 20, minOrder: 599, desc: '20% OFF Table Orders ≥ ₹599' },
      HAPPY25:   { type: 'percent', value: 25, minOrder: 0,   desc: '25% OFF Happy Hour' },
      CAMPUS15:  { type: 'percent', value: 15, minOrder: 0,   desc: '15% Student Discount' },
      WKND20:    { type: 'percent', value: 20, minOrder: 0,   desc: '20% OFF Group Weekend Order' },
      COMBO120:  { type: 'flat',    value: 120, minOrder: 350, desc: '₹120 OFF Combo Deal' },
      FESTIVE30: { type: 'percent', value: 30, minOrder: 799, desc: '30% OFF Festive Feast ≥ ₹799' },
      BDAYTREAT: { type: 'flat',    value: 200, minOrder: 400, desc: '₹200 Birthday Treat' },
      GOLDVIP100:{ type: 'flat',    value: 100, minOrder: 250, desc: '₹100 Loyalty VIP Cashback' },
    },
    cart: [
      { id: 'cof-2', name: 'Cappuccino',         price: 160, qty: 1, diner: 'Antara' },
      { id: 'piz-4', name: 'Cheese Burst Pizza', price: 399, qty: 1, diner: 'Rahul' },
      { id: 'sna-2', name: 'Peri Peri Fries',    price: 159, qty: 1, diner: 'Aditi' },
    ],
    activeOrder: {
      id: '#ORD-9482',
      table: 17,
      status: 'preparing',
      total: 753.9,
    },
    kdsMetrics: {
      revenue: 48920,
      ordersCount: 86,
    },
  };

  /* ------------------------------------------------------------------------
     2. INJECT DEMO SPLASH LOADER & MICRO-INTERACTION STYLES
     (Self-contained so you don't need to edit index.html or style.css)
     ------------------------------------------------------------------------ */
  function injectDynamicStylesAndLoader() {
    const styleTag = document.createElement('style');
    styleTag.id = 'chroma-dynamic-animations';
    styleTag.textContent = `
      /* Branded Demo Splash Screen */
      #chroma-preloader {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: radial-gradient(circle at 50% 40%, #2e1d16 0%, #160f0c 100%);
        color: #fdfaf6;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.15rem;
        transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                    visibility 0.55s;
        will-change: opacity, transform;
      }
      #chroma-preloader.preloader--hide {
        opacity: 0;
        transform: scale(1.04) translateY(-12px);
        visibility: hidden;
        pointer-events: none;
      }
      .loader-logo-ring {
        position: relative;
        width: 92px;
        height: 92px;
        border-radius: 26px;
        background: linear-gradient(135deg, #e0532b 0%, #f59e0b 100%);
        display: grid;
        place-items: center;
        font-size: 2.75rem;
        box-shadow: 0 18px 45px rgba(224, 83, 43, 0.45);
        animation: loaderFloat 1.4s ease-in-out infinite alternate;
      }
      .loader-steam-waves {
        position: absolute;
        top: -22px;
        display: flex;
        gap: 6px;
      }
      .loader-steam-waves span {
        width: 4px;
        height: 14px;
        border-radius: 99px;
        background: #f59e0b;
        opacity: 0.75;
        animation: steamRise 1s ease-in-out infinite;
      }
      .loader-steam-waves span:nth-child(2) { animation-delay: 0.2s; height: 18px; }
      .loader-steam-waves span:nth-child(3) { animation-delay: 0.4s; }
      .loader-brand-title {
        font-family: 'Fredoka', sans-serif;
        font-size: 2rem;
        letter-spacing: -0.01em;
        background: linear-gradient(90deg, #ffffff, #fcd34d);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .loader-sub {
        font-size: 0.82rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.68);
        margin-top: -0.5rem;
      }
      .loader-progress-track {
        width: 200px;
        height: 5px;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 99px;
        overflow: hidden;
      }
      .loader-progress-bar {
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #e0532b, #f59e0b, #10b981);
        border-radius: 99px;
        transition: width 0.75s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes loaderFloat {
        0%   { transform: translateY(0) rotate(-3deg); }
        100% { transform: translateY(-8px) rotate(3deg); }
      }
      @keyframes steamRise {
        0%   { transform: translateY(4px) scaleY(0.8); opacity: 0.2; }
        50%  { transform: translateY(-5px) scaleY(1.2); opacity: 0.9; }
        100% { transform: translateY(-12px) scaleY(0.7); opacity: 0; }
      }

      /* Scroll-Reveal Micro-Animations (GPU Composited) */
      .reveal-item {
        opacity: 0;
        transform: translate3d(0, 26px, 0) scale(0.98);
        transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: opacity, transform;
      }
      .reveal-item.is-visible {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }

      /* Floating +1 Badge on Add-to-Cart Click */
      .floating-plus-one {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        background: linear-gradient(135deg, #e0532b, #f59e0b);
        color: #fff;
        font-weight: 800;
        font-size: 0.78rem;
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
        box-shadow: 0 8px 20px rgba(224, 83, 43, 0.4);
        animation: floatUpFade 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      @keyframes floatUpFade {
        0%   { opacity: 1; transform: translate3d(0, 0, 0) scale(0.85); }
        100% { opacity: 0; transform: translate3d(0, -48px, 0) scale(1.1); }
      }

      /* Cart Badge Pop Animation */
      .pop-pulse {
        animation: badgePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes badgePop {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.28); }
        100% { transform: scale(1); }
      }

      /* Subtle 3D Glare / Tilt Transition for Menu Cards */
      .menu-card {
        will-change: transform;
      }
    `;
    document.head.appendChild(styleTag);

    // Inject Demo Preloader Overlay at top of <body>
    const loader = document.createElement('div');
    loader.id = 'chroma-preloader';
    loader.setAttribute('aria-label', 'Loading ChromaCafé Experience');
    loader.innerHTML = `
      <div class="loader-logo-ring">
        <div class="loader-steam-waves"><span></span><span></span><span></span></div>
        ☕
      </div>
      <div class="loader-brand-title">ChromaCafé</div>
      <p class="loader-sub">Syncing Table #${state.tableNumber} & Live Kitchen...</p>
      <div class="loader-progress-track">
        <div class="loader-progress-bar" id="loader-bar-fill"></div>
      </div>
    `;
    document.body.prepend(loader);

    // Animate progress bar immediately, then dismiss smoothly at 850ms
    requestAnimationFrame(() => {
      const fill = document.getElementById('loader-bar-fill');
      if (fill) fill.style.width = '100%';
    });

    const dismissLoader = () => {
      setTimeout(() => {
        loader.classList.add('preloader--hide');
        setTimeout(() => loader.remove(), 600);
      }, 850);
    };

    if (document.readyState === 'complete') {
      dismissLoader();
    } else {
      window.addEventListener('load', dismissLoader, { once: true });
    }
  }

  /* ------------------------------------------------------------------------
     3. TOAST & NOTIFICATION SYSTEM (#23)
     ------------------------------------------------------------------------ */
  function showToast(message, icon = '✨') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<strong>${icon}</strong> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = '0.25s ease';
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  function pushNotification(title, body, icon = '🔔') {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notif-count-badge');
    if (!list) return;

    const li = document.createElement('li');
    li.className = 'notif-item unread';
    li.innerHTML = `
      <span class="notif-icon">${icon}</span>
      <div>
        <strong>${title}</strong>
        <p>${body}</p>
        <small>Just now</small>
      </div>
    `;
    list.prepend(li);

    if (badge) {
      const unreadCount = list.querySelectorAll('.notif-item.unread').length;
      badge.textContent = String(unreadCount);
      badge.classList.remove('pop-pulse');
      void badge.offsetWidth; // trigger reflow for animation restart
      badge.classList.add('pop-pulse');
    }
  }

  function spawnFloatingIndicator(x, y, text = '+1 Added') {
    const el = document.createElement('div');
    el.className = 'floating-plus-one';
    el.textContent = text;
    el.style.left = `${x - 24}px`;
    el.style.top = `${y - 16}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }

  /* ------------------------------------------------------------------------
     4. ZERO-LAG 60FPS PARALLAX & SCROLL-REVEAL ENGINE (#1, #3, #25)
     Uses IntersectionObserver + rAF so off-screen elements never compute
     ------------------------------------------------------------------------ */
  function initParallaxAndReveals() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // 4A. Staggered Scroll-Reveal for Cards & Sections
    const revealTargets = document.querySelectorAll(
      '.menu-card, .trending-card, .offer-card, .gallery-item, .highlight-box, .value-card, .achievement-badge'
    );

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    revealTargets.forEach((el, idx) => {
      el.classList.add('reveal-item');
      el.style.transitionDelay = `${(idx % 4) * 55}ms`;
      revealObserver.observe(el);
    });

    // 4B. Viewport-Aware rAF Parallax Engine
    const parallaxLayers = Array.from(document.querySelectorAll('[data-parallax-speed]')).map((el) => ({
      el,
      speed: parseFloat(el.dataset.parallaxSpeed) || 0.2,
      container: el.closest('[data-parallax-container], [data-parallax-section]') || el.parentElement,
      active: false,
    }));

    // Observe parent containers so we only transform visible sections
    const containerMap = new Map();
    parallaxLayers.forEach((item) => {
      if (!containerMap.has(item.container)) {
        containerMap.set(item.container, []);
      }
      containerMap.get(item.container).push(item);
    });

    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const items = containerMap.get(entry.target) || [];
          items.forEach((item) => {
            item.active = entry.isIntersecting;
          });
        });
      },
      { rootMargin: '150px 0px 150px 0px' }
    );

    containerMap.forEach((_, container) => {
      if (container) parallaxObserver.observe(container);
    });

    let ticking = false;
    function updateParallaxFrame() {
      const viewportCenter = window.innerHeight * 0.5;

      for (let i = 0; i < parallaxLayers.length; i++) {
        const item = parallaxLayers[i];
        if (!item.active || !item.container) continue;

        const rect = item.container.getBoundingClientRect();
        const containerCenter = rect.top + rect.height * 0.5;
        const deltaFromCenter = containerCenter - viewportCenter;

        // Clamp offset to prevent runaway movement on huge screens
        const offsetY = Math.max(-75, Math.min(75, deltaFromCenter * item.speed * -0.28));
        const rotateDeg = offsetY * 0.08;

        item.el.style.transform = `translate3d(0, ${offsetY.toFixed(1)}px, 0) rotate(${rotateDeg.toFixed(1)}deg)`;
      }

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallaxFrame);
          ticking = true;
        }
      },
      { passive: true }
    );

    // Subtle 3D Mouse Hover Micro-Tilt on Menu Cards (Desktop only)
    if (window.matchMedia('(pointer: fine)').matches) {
      document.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.menu-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
      });

      document.querySelectorAll('.menu-card').forEach((card) => {
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     5. WORKSPACE VIEW SWITCHER, MODALS, DRAWERS & NAVIGATION (#26)
     ------------------------------------------------------------------------ */
  function initNavigationAndOverlays() {
    // Role Bar Switcher (Customer | Kitchen KDS | Admin ERP)
    const roleTabs = document.querySelectorAll('.role-tab[data-view-target]');
    const views = document.querySelectorAll('.workspace-view');

    roleTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.viewTarget;
        state.currentView = targetId;

        roleTabs.forEach((t) => {
          const isMatch = t === tab;
          t.classList.toggle('active', isMatch);
          t.setAttribute('aria-selected', String(isMatch));
        });

        views.forEach((v) => {
          const isMatch = v.id === targetId;
          v.classList.toggle('active', isMatch);
          v.hidden = !isMatch;
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`Switched to ${tab.textContent.trim()}`, '🔄');
      });
    });

    // Admin ERP Sub-Tabs
    const adminTabs = document.querySelectorAll('.admin-tab[data-admin-panel]');
    const adminPanels = document.querySelectorAll('.admin-panel');
    adminTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetPanel = tab.dataset.adminPanel;
        adminTabs.forEach((t) => t.classList.toggle('active', t === tab));
        adminPanels.forEach((p) => {
          const isMatch = p.id === targetPanel;
          p.classList.toggle('active', isMatch);
          p.hidden = !isMatch;
        });
      });
    });

    // Mobile Hamburger Menu
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = !mobileDrawer.hidden;
        mobileDrawer.hidden = isOpen;
        mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      });

      mobileDrawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileDrawer.hidden = true;
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Smooth Scroll Utility Buttons ([data-scroll-to])
    document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
      btn.addEventListener('click', () => {
        // Ensure Customer View is active before scrolling
        const customerTab = document.querySelector('.role-tab[data-view-target="customer-view"]');
        if (state.currentView !== 'customer-view' && customerTab) customerTab.click();

        const target = document.querySelector(btn.dataset.scrollTo);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          if (btn.id === 'nav-search-btn') {
            setTimeout(() => document.getElementById('menu-search-input')?.focus(), 400);
          }
        }
      });
    });

    // Slide-Over Drawers (Cart & Notifications)
    document.querySelectorAll('[data-toggle-drawer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const drawerId = btn.dataset.toggleDrawer;
        const drawer = document.getElementById(drawerId);
        if (!drawer) return;

        // Close other open drawers first
        document.querySelectorAll('.side-drawer').forEach((d) => {
          if (d.id !== drawerId) d.hidden = true;
        });

        drawer.hidden = !drawer.hidden;

        // Mark notifications read when opening notification drawer
        if (drawerId === 'notification-drawer' && !drawer.hidden) {
          document.querySelectorAll('#notification-list .notif-item.unread').forEach((item) => {
            item.classList.remove('unread');
          });
          const notifBadge = document.getElementById('notif-count-badge');
          if (notifBadge) notifBadge.textContent = '0';
        }
      });
    });

    document.querySelectorAll('[data-close-drawer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const drawer = document.getElementById(btn.dataset.closeDrawer);
        if (drawer) drawer.hidden = true;
      });
    });

    // Modals Open / Close
    document.querySelectorAll('[data-open-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.openModal);
        if (modal) modal.hidden = false;
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.closeModal);
        if (modal) modal.hidden = true;
      });
    });

    // Close Modal on Backdrop Click or Escape Key
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.hidden = true;
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop, .side-drawer').forEach((el) => {
          el.hidden = true;
        });
      }
    });
  }

  /* ------------------------------------------------------------------------
     6. TABLE-BASED ORDERING & GROUP ORDERING HUB (#4, #15)
     ------------------------------------------------------------------------ */
  function updateTableNumberEverywhere(newTableNum) {
    const cleanNum = Math.max(1, Math.min(30, parseInt(newTableNum, 10) || 17));
    state.tableNumber = cleanNum;

    const textTargets = [
      'current-table-display',
      'nav-table-num',
      'hub-table-number',
      'cart-table-number',
      'bill-table-num',
    ];
    textTargets.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(cleanNum);
    });

    const trackTable = document.getElementById('track-table-num');
    if (trackTable) trackTable.textContent = `Table #${cleanNum}`;

    const quickInput = document.getElementById('quick-table-input');
    if (quickInput) quickInput.value = String(cleanNum);

    const modalInput = document.getElementById('modal-table-input');
    if (modalInput) modalInput.value = String(cleanNum);

    const heroOrderBtn = document.querySelector('.hero-cta-group .btn--gradient-primary');
    if (heroOrderBtn) heroOrderBtn.textContent = `🚀 Order Now to Table #${cleanNum}`;

    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) placeOrderBtn.textContent = `🚀 Place Order to Table #${cleanNum}`;

    // Highlight matching table node on floor map
    document.querySelectorAll('#table-map-grid .table-node').forEach((node) => {
      const isSelected = parseInt(node.dataset.tableId, 10) === cleanNum;
      node.classList.toggle('selected', isSelected);
    });
  }

  function initTableAndGroupOrdering() {
    // Quick Hero Table Lock
    const quickBtn = document.getElementById('confirm-table-quick-btn');
    const quickInput = document.getElementById('quick-table-input');
    if (quickBtn && quickInput) {
      quickBtn.addEventListener('click', () => {
        updateTableNumberEverywhere(quickInput.value);
        showToast(`Table #${state.tableNumber} locked for direct kitchen delivery!`, '🪑');
      });
    }

    // Manual Table Modal Form
    const manualForm = document.getElementById('manual-table-form');
    const modalInput = document.getElementById('modal-table-input');
    if (manualForm && modalInput) {
      manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateTableNumberEverywhere(modalInput.value);
        document.getElementById('table-modal').hidden = true;
        showToast(`Switched active session to Table #${state.tableNumber}`, '🪑');
      });
    }

    // Simulated QR Code Scanner
    const qrBtn = document.getElementById('simulate-qr-scan-btn');
    if (qrBtn) {
      qrBtn.addEventListener('click', () => {
        qrBtn.textContent = '🔍 Scanning Table Coaster QR...';
        qrBtn.disabled = true;
        setTimeout(() => {
          const scannedTable = [3, 6, 14, 17, 20][Math.floor(Math.random() * 5)];
          updateTableNumberEverywhere(scannedTable);
          qrBtn.textContent = '⚡ Simulate Instant Table QR Scan';
          qrBtn.disabled = false;
          document.getElementById('table-modal').hidden = true;
          showToast(`QR Verified! Connected to Table #${scannedTable}`, '📷');
        }, 700);
      });
    }

    // Group Mode Toggle
    const groupToggle = document.getElementById('group-mode-toggle');
    const groupStatusDisplay = document.getElementById('group-status-display');
    if (groupToggle) {
      groupToggle.addEventListener('change', () => {
        state.groupMode = groupToggle.checked;
        if (groupStatusDisplay) {
          groupStatusDisplay.textContent = state.groupMode
            ? `Active (${state.groupMembers.length} Guests)`
            : 'Solo Order';
        }
        showToast(
          state.groupMode ? 'Group Ordering enabled for your table!' : 'Switched to Solo Table Order',
          '👥'
        );
      });
    }

    // Switch Active Diner via Chips or Select Dropdown
    const membersList = document.getElementById('group-members-list');
    const dinerSelect = document.getElementById('current-diner-select');

    function setActiveDiner(name) {
      state.activeDiner = name;
      if (dinerSelect) dinerSelect.value = name;
      if (membersList) {
        membersList.querySelectorAll('.group-member-chip').forEach((chip) => {
          chip.classList.toggle('active', chip.dataset.member === name);
        });
      }
      showToast(`Now adding menu items for ${name}`, '🍽️');
    }

    if (membersList) {
      membersList.addEventListener('click', (e) => {
        const chip = e.target.closest('.group-member-chip');
        if (chip && chip.dataset.member) {
          setActiveDiner(chip.dataset.member);
        }
      });
    }

    if (dinerSelect) {
      dinerSelect.addEventListener('change', () => {
        setActiveDiner(dinerSelect.value);
      });
    }

    // Add New Friend to Table Group Order
    const addMemberForm = document.getElementById('add-group-member-form');
    const newMemberInput = document.getElementById('new-member-name');
    if (addMemberForm && newMemberInput && membersList && dinerSelect) {
      addMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawName = newMemberInput.value.trim();
        if (!rawName) return;

        const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        if (state.groupMembers.includes(cleanName)) {
          showToast(`${cleanName} is already at Table #${state.tableNumber}`, '⚠️');
          return;
        }

        state.groupMembers.push(cleanName);
        const initials = cleanName.slice(0, 2).toUpperCase();

        const chip = document.createElement('div');
        chip.className = 'group-member-chip';
        chip.dataset.member = cleanName;
        chip.innerHTML = `
          <span class="member-avatar">${initials}</span>
          <div>
            <strong>${cleanName}</strong>
            <small>Ready to add items</small>
          </div>
        `;
        membersList.appendChild(chip);

        const opt = document.createElement('option');
        opt.value = cleanName;
        opt.textContent = cleanName;
        dinerSelect.appendChild(opt);

        setActiveDiner(cleanName);
        newMemberInput.value = '';

        if (groupStatusDisplay && state.groupMode) {
          groupStatusDisplay.textContent = `Active (${state.groupMembers.length} Guests)`;
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     7. SMART SEARCH & MULTI-FILTER ENGINE (#24)
     ------------------------------------------------------------------------ */
  function initSearchAndFilters() {
    const searchInput = document.getElementById('menu-search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    const catPills = document.querySelectorAll('.cat-pill[data-filter-category]');
    const dietSelect = document.getElementById('filter-diet');
    const priceSlider = document.getElementById('filter-price');
    const priceLabel = document.getElementById('price-filter-label');
    const ratingSelect = document.getElementById('filter-rating');
    const spicyCheck = document.getElementById('filter-spicy');
    const bestCheck = document.getElementById('filter-bestseller');
    const availCheck = document.getElementById('filter-available');
    const resetBtn = document.getElementById('reset-filters-btn');

    let activeCategory = 'all';

    function applyMenuFilters() {
      const query = (searchInput?.value || '').trim().toLowerCase();
      const diet = dietSelect?.value || 'all';
      const maxPrice = parseInt(priceSlider?.value || '500', 10);
      const minRating = parseFloat(ratingSelect?.value || '0');
      const onlySpicy = spicyCheck?.checked || false;
      const onlyBest = bestCheck?.checked || false;
      const onlyAvail = availCheck?.checked || false;

      if (clearBtn) clearBtn.hidden = query.length === 0;
      if (priceLabel) priceLabel.textContent = `₹${maxPrice}`;

      const allCards = document.querySelectorAll('.menu-card');
      allCards.forEach((card) => {
        const name = (card.dataset.name || '').toLowerCase();
        const desc = (card.querySelector('.menu-card__desc')?.textContent || '').toLowerCase();
        const cat = card.dataset.category || '';
        const price = parseFloat(card.dataset.price || '0');
        const rating = parseFloat(card.dataset.rating || '0');
        const veg = card.dataset.veg || 'veg';
        const spicy = card.dataset.spicy === 'true';
        const best = card.dataset.bestseller === 'true';
        const avail = card.dataset.available !== 'false';

        const matchesSearch = !query || name.includes(query) || desc.includes(query) || cat.includes(query);
        const matchesCat = activeCategory === 'all' || cat === activeCategory;
        const matchesDiet = diet === 'all' || veg === diet;
        const matchesPrice = price <= maxPrice;
        const matchesRating = rating >= minRating;
        const matchesSpicy = !onlySpicy || spicy;
        const matchesBest = !onlyBest || best;
        const matchesAvail = !onlyAvail || avail;

        const visible =
          matchesSearch &&
          matchesCat &&
          matchesDiet &&
          matchesPrice &&
          matchesRating &&
          matchesSpicy &&
          matchesBest &&
          matchesAvail;

        card.hidden = !visible;
      });

      // Hide entire category parallax block if zero cards in that category match
      document.querySelectorAll('.category-block').forEach((block) => {
        const visibleCards = block.querySelectorAll('.menu-card:not([hidden])');
        block.hidden = visibleCards.length === 0;
      });
    }

    searchInput?.addEventListener('input', applyMenuFilters);
    clearBtn?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      applyMenuFilters();
    });

    catPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        activeCategory = pill.dataset.filterCategory || 'all';
        catPills.forEach((p) => p.classList.toggle('active', p === pill));
        applyMenuFilters();
      });
    });

    [dietSelect, priceSlider, ratingSelect, spicyCheck, bestCheck, availCheck].forEach((control) => {
      control?.addEventListener('input', applyMenuFilters);
      control?.addEventListener('change', applyMenuFilters);
    });

    resetBtn?.addEventListener('click', () => {
      activeCategory = 'all';
      catPills.forEach((p) => p.classList.toggle('active', p.dataset.filterCategory === 'all'));
      if (searchInput) searchInput.value = '';
      if (dietSelect) dietSelect.value = 'all';
      if (priceSlider) priceSlider.value = '500';
      if (ratingSelect) ratingSelect.value = '0';
      if (spicyCheck) spicyCheck.checked = false;
      if (bestCheck) bestCheck.checked = false;
      if (availCheck) availCheck.checked = true;
      applyMenuFilters();
      showToast('All menu filters reset', '🌈');
    });
  }

  /* ------------------------------------------------------------------------
     8. FAVOURITES SYSTEM (#10)
     ------------------------------------------------------------------------ */
  function renderFavouritesSection() {
    const grid = document.getElementById('favourites-grid');
    const badge = document.getElementById('fav-count-badge');
    if (!grid) return;

    if (badge) badge.textContent = String(state.favourites.size);
    grid.innerHTML = '';

    if (state.favourites.size === 0) {
      grid.innerHTML = `<p style="color:var(--text-secondary);">No favourites saved yet. Tap the ♡ icon on any dish to save it here for 1-tap ordering.</p>`;
      return;
    }

    state.favourites.forEach((id) => {
      const card = document.querySelector(`.menu-card[data-id="${id}"]`);
      if (!card) return;
      const name = card.dataset.name;
      const price = card.dataset.price;
      const rating = card.dataset.rating;
      const img = card.querySelector('img')?.src || '';

      const item = document.createElement('div');
      item.className = 'fav-quick-card glass-card';
      item.innerHTML = `
        <img src="${img}" alt="${name}" />
        <div>
          <h4>${name}</h4>
          <span>₹${price} • ★ ${rating}</span>
        </div>
        <button type="button" class="btn btn--xs btn--primary quick-add-trigger" data-id="${id}">+ Add</button>
      `;
      grid.appendChild(item);
    });
  }

  function initFavourites() {
    document.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.fav-btn');
      if (!favBtn) return;

      const id = favBtn.dataset.favId;
      if (!id) return;

      if (state.favourites.has(id)) {
        state.favourites.delete(id);
        favBtn.classList.remove('active');
        favBtn.textContent = '♡';
        showToast('Removed from your Favourites', '💔');
      } else {
        state.favourites.add(id);
        favBtn.classList.add('active');
        favBtn.textContent = '❤️';
        spawnFloatingIndicator(e.clientX, e.clientY, '❤️ Saved');
        showToast('Saved to My Favourites!', '❤️');
      }

      renderFavouritesSection();
    });
  }

  /* ------------------------------------------------------------------------
     9. SMART CART, COUPONS, CHECKOUT & DIGITAL BILL (#5, #11, #22)
     ------------------------------------------------------------------------ */
  function calculateCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    let discount = 0;

    if (state.appliedCoupon && state.coupons[state.appliedCoupon]) {
      const rule = state.coupons[state.appliedCoupon];
      if (subtotal >= rule.minOrder) {
        discount = rule.type === 'percent' ? (subtotal * rule.value) / 100 : rule.value;
        discount = Math.min(discount, subtotal);
      }
    }

    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * 0.05;
    const finalTotal = taxable + tax;
    const pointsEarned = Math.floor(finalTotal / 10);
    const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);

    return { subtotal, discount, tax, finalTotal, pointsEarned, totalCount };
  }

  function renderCart() {
    const list = document.getElementById('cart-items-list');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const couponTagEl = document.getElementById('applied-coupon-tag');
    const taxEl = document.getElementById('cart-tax');
    const finalEl = document.getElementById('cart-final-total');
    const pointsEl = document.getElementById('cart-points-earned');
    const navBadge = document.getElementById('cart-count-badge');
    const navTotal = document.getElementById('nav-cart-total');

    const { subtotal, discount, tax, finalTotal, pointsEarned, totalCount } = calculateCartTotals();

    if (navBadge) {
      navBadge.textContent = String(totalCount);
      navBadge.classList.remove('pop-pulse');
      void navBadge.offsetWidth;
      navBadge.classList.add('pop-pulse');
    }
    if (navTotal) navTotal.textContent = `₹${Math.round(finalTotal)}`;

    if (!list) return;
    list.innerHTML = '';

    if (state.cart.length === 0) {
      list.innerHTML = `<li style="padding:1.2rem;text-align:center;color:var(--text-secondary);">Your table cart is empty. Browse the parallax menu and tap <strong>+ Add to Cart</strong>!</li>`;
    } else {
      state.cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'cart-item-row';
        li.innerHTML = `
          <div>
            <strong>${item.name}</strong>
            <small style="display:block;color:var(--text-secondary);">
              ₹${item.price} each ${state.groupMode ? `• 👤 ${item.diner}` : ''}
            </small>
          </div>
          <div class="cart-qty-controls">
            <button type="button" class="qty-btn" data-cart-action="dec" data-index="${index}" aria-label="Decrease quantity">−</button>
            <strong>${item.qty}</strong>
            <button type="button" class="qty-btn" data-cart-action="inc" data-index="${index}" aria-label="Increase quantity">+</button>
            <button type="button" class="qty-btn" data-cart-action="del" data-index="${index}" aria-label="Remove item" style="color:var(--status-nonveg);margin-left:4px;">✕</button>
          </div>
        `;
        list.appendChild(li);
      });
    }

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-₹${discount.toFixed(2)}`;
    if (couponTagEl) couponTagEl.textContent = state.appliedCoupon ? `(${state.appliedCoupon})` : '';
    if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`;
    if (finalEl) finalEl.textContent = `₹${finalTotal.toFixed(2)}`;
    if (pointsEl) pointsEl.textContent = `+${pointsEarned} Chroma Loyalty Points`;
  }

  function addItemToCart({ id, name, price }, clickEvent) {
    const card = document.querySelector(`.menu-card[data-id="${id}"]`);
    if (card && card.dataset.available === 'false') {
      showToast(`Sorry, ${name} is currently out of stock!`, '⚠️');
      return;
    }

    const diner = state.groupMode ? state.activeDiner : state.customer.name.split(' ')[0];
    const existing = state.cart.find((item) => item.id === id && item.diner === diner);

    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        id,
        name,
        price: parseFloat(price),
        qty: 1,
        diner,
      });
    }

    if (clickEvent && clickEvent.clientX) {
      spawnFloatingIndicator(clickEvent.clientX, clickEvent.clientY, `+1 ${name}`);
    }

    // Update personalized recommendation dynamically based on what they just added
    updatePersonalizedRecommendation(name);
    renderCart();
    showToast(`Added ${name} (${diner}) to Table #${state.tableNumber}`, '🛒');
  }

  function updatePersonalizedRecommendation(lastDishName) {
    const recText = document.getElementById('personalized-rec-text');
    if (!recText) return;

    const pairings = {
      Espresso: { suggest: 'Brownie', id: 'des-1', price: 179 },
      Cappuccino: { suggest: 'Caramel Macchiato', id: 'cof-7', price: 210 },
      Margherita: { suggest: 'Garlic Bread', id: 'sna-3', price: 169 },
      'Cheese Burst': { suggest: 'Virgin Mint Mojito', id: 'bev-1', price: 159 },
    };

    const match = pairings[lastDishName];
    if (match) {
      recText.innerHTML = `“Because you just added <strong>${lastDishName}</strong>, our AI Barista recommends pairing it with <strong>${match.suggest}</strong>!”`;
      const btn = recText.parentElement?.querySelector('.quick-add-trigger');
      if (btn) {
        btn.dataset.id = match.id;
        btn.textContent = `Try ${match.suggest} (₹${match.price})`;
      }
    }
  }

  function applyCouponCode(rawCode) {
    const code = (rawCode || '').trim().toUpperCase();
    const feedback = document.getElementById('coupon-feedback-msg');
    const input = document.getElementById('cart-coupon-input');

    if (!state.coupons[code]) {
      if (feedback) {
        feedback.textContent = 'Invalid coupon code. Try TABLE20, HAPPY25, or CAMPUS15.';
        feedback.style.color = 'var(--status-nonveg)';
      }
      showToast('Invalid coupon code', '⚠️');
      return;
    }

    const rule = state.coupons[code];
    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (subtotal < rule.minOrder) {
      if (feedback) {
        feedback.textContent = `Add ₹${rule.minOrder - subtotal} more to unlock ${code}!`;
        feedback.style.color = 'var(--status-reserved)';
      }
      showToast(`Minimum order of ₹${rule.minOrder} required for ${code}`, '⚠️');
      return;
    }

    state.appliedCoupon = code;
    if (input) input.value = code;
    if (feedback) {
      feedback.textContent = `✅ Applied ${code}: ${rule.desc}`;
      feedback.style.color = 'var(--status-veg)';
    }

    renderCart();
    showToast(`Coupon ${code} applied to Table #${state.tableNumber}!`, '🎟️');
  }

  function initCartAndCheckout() {
    renderCart();

    // Event delegation for all Add-to-Cart buttons across Menu, Trending, Favourites & Hero
    document.addEventListener('click', (e) => {
      // 1. Standard Menu Card Add Button
      const menuBtn = e.target.closest('.add-to-cart-btn');
      if (menuBtn) {
        const card = menuBtn.closest('.menu-card');
        if (card) {
          addItemToCart(
            { id: card.dataset.id, name: card.dataset.name, price: card.dataset.price },
            e
          );
        }
        return;
      }

      // 2. Quick-Add Trigger (Trending, Favourites, Mini-Dishes)
      const quickBtn = e.target.closest('.quick-add-trigger');
      if (quickBtn) {
        const id = quickBtn.dataset.id;
        const card = document.querySelector(`.menu-card[data-id="${id}"]`);
        if (card) {
          addItemToCart(
            { id: card.dataset.id, name: card.dataset.name, price: card.dataset.price },
            e
          );
        }
        return;
      }

      // 3. Hero Today's Special Button
      const specialBtn = e.target.closest('.add-special-btn');
      if (specialBtn) {
        addItemToCart(
          {
            id: specialBtn.dataset.id,
            name: specialBtn.dataset.name,
            price: specialBtn.dataset.price,
          },
          e
        );
        return;
      }

      // 4. Offer Card Apply Coupon Buttons
      const offerBtn = e.target.closest('.apply-coupon-btn');
      if (offerBtn && offerBtn.dataset.coupon) {
        applyCouponCode(offerBtn.dataset.coupon);
        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) cartDrawer.hidden = false;
        return;
      }

      // 5. Cart Quantity +/-/Delete Buttons
      const qtyBtn = e.target.closest('.qty-btn[data-cart-action]');
      if (qtyBtn) {
        const idx = parseInt(qtyBtn.dataset.index, 10);
        const action = qtyBtn.dataset.cartAction;
        if (!state.cart[idx]) return;

        if (action === 'inc') state.cart[idx].qty += 1;
        if (action === 'dec') {
          state.cart[idx].qty -= 1;
          if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
        }
        if (action === 'del') state.cart.splice(idx, 1);

        renderCart();
      }
    });

    // Apply Coupon Inside Cart Drawer
    const applyCartCouponBtn = document.getElementById('apply-cart-coupon-btn');
    const cartCouponInput = document.getElementById('cart-coupon-input');
    if (applyCartCouponBtn && cartCouponInput) {
      applyCartCouponBtn.addEventListener('click', () => {
        applyCouponCode(cartCouponInput.value);
      });
    }

    // Place Order Button -> Syncs Live Tracker, Digital Bill, Loyalty, History & Kitchen KDS
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => {
        if (state.cart.length === 0) {
          showToast('Add at least one item to your cart before ordering!', '⚠️');
          return;
        }

        const { subtotal, discount, tax, finalTotal, pointsEarned } = calculateCartTotals();
        const newOrderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const specialNotes =
          document.getElementById('cart-special-instructions')?.value.trim() ||
          'Standard table preparation';

        state.activeOrder = {
          id: newOrderId,
          table: state.tableNumber,
          status: 'placed',
          total: finalTotal,
        };

        // 1. Update Live Order Tracker (#6)
        document.getElementById('track-order-id').textContent = newOrderId;
        document.getElementById('track-table-num').textContent = `Table #${state.tableNumber}`;
        document.getElementById('track-customer-id').textContent = `${state.customer.id} (${state.customer.name.split(' ')[0]})`;
        document.getElementById('track-total-amount').textContent = `₹${Math.round(finalTotal)}`;

        const trackList = document.getElementById('track-items-list');
        if (trackList) {
          trackList.innerHTML = state.cart
            .map(
              (item) => `
              <li>
                <span><strong>${item.qty}x ${item.name}</strong> <small>(Added by ${item.diner})</small></span>
                <strong>₹${item.price * item.qty}</strong>
              </li>`
            )
            .join('');
        }
        updateOrderStepperUI('placed');

        // 2. Update Digital Receipt Modal (#22)
        document.getElementById('bill-order-num').textContent = newOrderId;
        document.getElementById('bill-table-num').textContent = String(state.tableNumber);
        document.getElementById('bill-cust-name').textContent = state.customer.name;
        document.getElementById('bill-cust-id').textContent = state.customer.id;
        document.getElementById('bill-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('bill-discount').textContent = `-₹${discount.toFixed(2)}`;
        document.getElementById('bill-tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('bill-final').textContent = `₹${finalTotal.toFixed(2)}`;
        document.getElementById('bill-points').textContent = `+${pointsEarned} Points`;

        const billTbody = document.getElementById('bill-items-tbody');
        if (billTbody) {
          billTbody.innerHTML = state.cart
            .map(
              (item) => `
              <tr>
                <td>${item.name} (${item.diner})</td>
                <td>${item.qty}</td>
                <td>₹${(item.price * item.qty).toFixed(2)}</td>
              </tr>`
            )
            .join('');
        }

        // 3. Prepend to Customer Order History (#9)
        const historyTbody = document.getElementById('order-history-tbody');
        if (historyTbody) {
          const itemSummary = state.cart.map((i) => `${i.qty}x ${i.name}`).join(', ');
          const itemIds = state.cart.map((i) => i.id).join(',');
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${newOrderId}</strong></td>
            <td>Today</td>
            <td>Table #${state.tableNumber}</td>
            <td>${itemSummary}</td>
            <td><strong>₹${Math.round(finalTotal)}</strong></td>
            <td><span class="badge badge--warning">Order Placed</span></td>
            <td>
              <button type="button" class="btn btn--xs btn--primary order-again-btn" data-items="${itemIds}">
                🔁 Order Again
              </button>
            </td>
          `;
          historyTbody.prepend(tr);
        }

        // 4. Push Live Ticket to Kitchen KDS (#16) & Admin ERP (#17)
        appendKitchenKdsTicket(newOrderId, state.tableNumber, state.cart, specialNotes, finalTotal);
        appendAdminOrderRow(newOrderId, state.tableNumber, finalTotal);

        // 5. Award Loyalty Points (#8)
        state.customer.points += pointsEarned;
        state.customer.totalOrders += 1;
        updateLoyaltyUI();

        // 6. Clear Cart, Close Drawer & Show Digital Receipt / Tracker
        state.cart = [];
        state.appliedCoupon = null;
        renderCart();
        document.getElementById('cart-drawer').hidden = true;

        pushNotification(
          `Order ${newOrderId} Sent to Kitchen!`,
          `Table #${state.tableNumber} order placed. You earned +${pointsEarned} Chroma Points!`,
          '🚀'
        );
        showToast(`Order ${newOrderId} placed! +${pointsEarned} Loyalty Points earned`, '🎉');

        document.getElementById('order-tracking')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  /* ------------------------------------------------------------------------
     10. LIVE ORDER TRACKING & KITCHEN KDS SYNC (#6, #16)
     ------------------------------------------------------------------------ */
  const statusFlow = ['placed', 'accepted', 'preparing', 'ready', 'delivered'];
  const statusLabels = {
    placed:    '📝 Order Placed',
    accepted:  '✅ Order Accepted',
    preparing: '🍳 Preparing in Kitchen',
    ready:     '🔔 Ready for Table Delivery',
    delivered: '🍽️ Delivered to Table',
  };

  function updateOrderStepperUI(newStatus) {
    state.activeOrder.status = newStatus;
    const badge = document.getElementById('track-status-badge');
    if (badge) badge.textContent = statusLabels[newStatus] || newStatus;

    const targetIdx = statusFlow.indexOf(newStatus);
    document.querySelectorAll('#order-stepper .step').forEach((stepEl) => {
      const stepName = stepEl.dataset.step;
      const idx = statusFlow.indexOf(stepName);
      stepEl.classList.toggle('completed', idx < targetIdx);
      stepEl.classList.toggle('active', idx === targetIdx);
    });
  }

  function appendKitchenKdsTicket(orderId, tableNum, items, notes, total) {
    const grid = document.getElementById('kds-orders-grid');
    if (!grid) return;

    const article = document.createElement('article');
    article.className = 'kds-ticket glass-card';
    article.dataset.kdsOrderId = orderId;
    article.dataset.kdsStatus = 'placed';
    article.innerHTML = `
      <div class="kds-ticket__header">
        <div>
          <span class="kds-table-badge">🪑 TABLE #${tableNum}</span>
          <h3>Order ${orderId}</h3>
          <small>Customer: ${state.customer.name.split(' ')[0]} (ID: ${state.customer.id})</small>
        </div>
        <span class="kds-status-tag">New Order</span>
      </div>
      <ul class="kds-item-list">
        ${items.map((i) => `<li><strong>${i.qty}x ${i.name}</strong> <span>(${i.diner})</span></li>`).join('')}
      </ul>
      <div class="kds-instructions">
        <strong>📝 Special Instructions:</strong> ${notes}
      </div>
      <div class="kds-ticket__footer">
        <span class="kds-total">Total: <strong>₹${Math.round(total)}</strong></span>
        <div class="kds-status-actions">
          <button type="button" class="btn btn--xs btn--primary kds-action-btn" data-set-status="accepted">Accept</button>
          <button type="button" class="btn btn--xs kds-action-btn" data-set-status="preparing">Preparing</button>
          <button type="button" class="btn btn--xs kds-action-btn" data-set-status="ready">Ready</button>
          <button type="button" class="btn btn--xs kds-action-btn" data-set-status="delivered">Delivered</button>
        </div>
      </div>
    `;
    grid.prepend(article);
    updateKdsCounters();
  }

  function updateKdsCounters() {
    const tickets = document.querySelectorAll('#kds-orders-grid .kds-ticket');
    let countNew = 0;
    let countPrep = 0;
    let countReady = 0;

    tickets.forEach((t) => {
      const st = t.dataset.kdsStatus;
      if (st === 'placed' || st === 'accepted') countNew++;
      if (st === 'preparing') countPrep++;
      if (st === 'ready') countReady++;
    });

    const elNew = document.getElementById('kds-count-new');
    const elPrep = document.getElementById('kds-count-prep');
    const elReady = document.getElementById('kds-count-ready');
    const badge = document.getElementById('kds-badge');

    if (elNew) elNew.textContent = String(countNew);
    if (elPrep) elPrep.textContent = String(countPrep);
    if (elReady) elReady.textContent = String(countReady);
    if (badge) badge.textContent = String(countNew + countPrep + countReady);
  }

  function initKitchenKDS() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.kds-action-btn, .kds-Action-btn');
      if (!btn) return;

      const ticket = btn.closest('.kds-ticket');
      if (!ticket) return;

      const newStatus = btn.dataset.setStatus;
      const orderId = ticket.dataset.kdsOrderId;
      ticket.dataset.kdsStatus = newStatus;

      const tag = ticket.querySelector('.kds-status-tag');
      if (tag) tag.textContent = newStatus.toUpperCase();

      ticket.querySelectorAll('[data-set-status]').forEach((b) => {
        b.classList.toggle('btn--primary', b === btn);
      });

      // Sync with Customer Live Order Stepper
      updateOrderStepperUI(newStatus);
      updateKdsCounters();

      pushNotification(
        `Order ${orderId} Update: ${newStatus.toUpperCase()}`,
        `Kitchen updated your table order status to ${statusLabels[newStatus] || newStatus}.`,
        '👨‍🍳'
      );
      showToast(`Order ${orderId} marked as ${newStatus.toUpperCase()}`, '👨‍🍳');
    });
  }

  /* ------------------------------------------------------------------------
     11. TABLE AVAILABILITY & RESERVATION SYSTEM (#14)
     ------------------------------------------------------------------------ */
  function updateFloorMapCounts() {
    const nodes = document.querySelectorAll('#table-map-grid .table-node');
    let avail = 0;
    let occ = 0;
    let res = 0;

    nodes.forEach((n) => {
      if (n.classList.contains('available')) avail++;
      else if (n.classList.contains('occupied')) occ++;
      else if (n.classList.contains('reserved')) res++;
    });

    const elA = document.getElementById('count-available');
    const elO = document.getElementById('count-occupied');
    const elR = document.getElementById('count-reserved');
    if (elA) elA.textContent = String(avail);
    if (elO) elO.textContent = String(occ);
    if (elR) elR.textContent = String(res);
  }

  function initReservations() {
    // Set default reservation date to today
    const dateInput = document.getElementById('res-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Floor Map Interactive Table Selection
    const mapGrid = document.getElementById('table-map-grid');
    const tableSelect = document.getElementById('res-table-select');

    if (mapGrid) {
      mapGrid.addEventListener('click', (e) => {
        const node = e.target.closest('.table-node');
        if (!node) return;

        const tableId = node.dataset.tableId;
        const status = node.dataset.status;

        if (status === 'available') {
          if (tableSelect) {
            // Ensure option exists or select it
            let opt = tableSelect.querySelector(`option[value="${tableId}"]`);
            if (!opt) {
              opt = document.createElement('option');
              opt.value = tableId;
              opt.textContent = `Table #${tableId.padStart(2, '0')} (${node.dataset.seats} Seats)`;
              tableSelect.appendChild(opt);
            }
            tableSelect.value = tableId;
          }
          updateTableNumberEverywhere(tableId);
          showToast(`Selected Available Table #${tableId} (${node.dataset.seats} Seats)`, '🟢');
        } else {
          showToast(`Table #${tableId} is currently ${status.toUpperCase()}`, '🪑');
        }
      });
    }

    // Reservation Form Submission
    const resForm = document.getElementById('reservation-form');
    if (resForm) {
      resForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const guestName = document.getElementById('res-name')?.value || 'Guest';
        const dateVal = document.getElementById('res-date')?.value || 'Today';
        const timeVal = document.getElementById('res-time')?.value || '19:30';
        const guests = document.getElementById('res-guests')?.value || '4';
        const tableNum = document.getElementById('res-table-select')?.value || '3';
        const resId = `RES-${Math.floor(10000 + Math.random() * 90000)}`;

        // Update floor map node to Reserved (🟡)
        const node = document.querySelector(`#table-map-grid .table-node[data-table-id="${tableNum}"]`);
        if (node) {
          node.classList.remove('available', 'occupied');
          node.classList.add('reserved');
          node.dataset.status = 'reserved';
          const small = node.querySelector('small');
          if (small) small.textContent = `🟡 ${node.dataset.seats} Seats`;
        }
        updateFloorMapCounts();

        // Show Confirmation Box
        const confirmBox = document.getElementById('reservation-confirmation');
        const idEl = document.getElementById('generated-res-id');
        const sumEl = document.getElementById('generated-res-summary');
        if (confirmBox && idEl && sumEl) {
          idEl.textContent = resId;
          sumEl.textContent = `Table #${tableNum.padStart(2, '0')} reserved for ${guestName} (${guests} Guests) on ${dateVal} at ${timeVal}.`;
          confirmBox.hidden = false;
        }

        // Sync to Admin Reservations Panel
        const adminResList = document.getElementById('admin-reservations-list');
        if (adminResList) {
          const p = document.createElement('p');
          p.innerHTML = `Active Booking: <strong>${resId}</strong> — Table #${tableNum} (${guestName}, ${guests} Guests at ${timeVal})`;
          adminResList.prepend(p);
        }

        pushNotification(
          `Table Reservation Confirmed (${resId})`,
          `Table #${tableNum} booked for ${guests} guests at ${timeVal}.`,
          '📅'
        );
        showToast(`Reservation ${resId} confirmed for Table #${tableNum}!`, '📅');
      });
    }
  }

  /* ------------------------------------------------------------------------
     12. LOYALTY, ACHIEVEMENTS, ORDER AGAIN & AUTH (#7, #8, #9, #12)
     ------------------------------------------------------------------------ */
  function updateLoyaltyUI() {
    const pts = state.customer.points;
    const navPts = document.getElementById('nav-user-points');
    const displayPts = document.getElementById('loyalty-points-display');
    const totalOrdersEl = document.getElementById('loyalty-total-orders');
    const tierBadge = document.getElementById('loyalty-current-tier');
    const progressFill = document.getElementById('loyalty-progress-fill');
    const nextTierText = document.getElementById('loyalty-next-tier-text');

    if (navPts) navPts.textContent = `⚡ ${pts} pts`;
    if (displayPts) displayPts.textContent = `${pts} Chroma Points`;
    if (totalOrdersEl) totalOrdersEl.textContent = String(state.customer.totalOrders);

    let tierName = '🥉 BRONZE MEMBER';
    let nextTarget = 250;
    let nextLabel = '🥈 Silver Level';

    if (pts >= 1000) {
      tierName = '💎 PLATINUM VIP';
      nextTarget = 1000;
      nextLabel = 'Max Tier Unlocked!';
      document.querySelector('[data-badge="vip-customer"]')?.classList.replace('locked', 'unlocked');
    } else if (pts >= 500) {
      tierName = '🥇 GOLD MEMBER';
      nextTarget = 1000;
      nextLabel = '💎 Platinum Level';
    } else if (pts >= 250) {
      tierName = '🥈 SILVER MEMBER';
      nextTarget = 500;
      nextLabel = '🥇 Gold Level';
    }

    if (tierBadge) tierBadge.textContent = tierName;
    const pct = Math.min(100, Math.round((pts / 1000) * 100));
    if (progressFill) progressFill.style.width = `${pct}%`;

    if (nextTierText) {
      nextTierText.innerHTML =
        pts >= 1000
          ? `🎉 You have unlocked <strong>💎 Platinum VIP Status</strong>! Enjoy complimentary desserts on every visit.`
          : `${Math.max(0, nextTarget - pts)} more points needed to unlock <strong>${nextLabel}</strong>!`;
    }
  }

  function initLoyaltyAndProfile() {
    // Redeem Loyalty Points
    document.querySelectorAll('.redeem-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cost = parseInt(btn.dataset.cost || '0', 10);
        const rewardName = btn.dataset.reward || 'Loyalty Reward';

        if (state.customer.points < cost) {
          showToast(`You need ${cost - state.customer.points} more points to redeem ${rewardName}`, '⚠️');
          return;
        }

        state.customer.points -= cost;
        updateLoyaltyUI();

        // Add redeemed reward to cart at ₹0
        state.cart.push({
          id: `reward-${Date.now()}`,
          name: `🎁 ${rewardName} (Redeemed)`,
          price: 0,
          qty: 1,
          diner: state.customer.name.split(' ')[0],
        });
        renderCart();

        pushNotification(
          `Redeemed: ${rewardName}`,
          `Used ${cost} Chroma Points. Added to your Table #${state.tableNumber} cart for ₹0!`,
          '🎁'
        );
        showToast(`Redeemed ${rewardName}! Added to your cart for ₹0`, '🎁');
      });
    });

    // Order History "Order Again" Buttons
    document.addEventListener('click', (e) => {
      const againBtn = e.target.closest('.order-again-btn');
      if (!againBtn) return;

      const ids = (againBtn.dataset.items || '').split(',').filter(Boolean);
      ids.forEach((id) => {
        const card = document.querySelector(`.menu-card[data-id="${id}"]`);
        if (card) {
          addItemToCart({
            id: card.dataset.id,
            name: card.dataset.name,
            price: card.dataset.price,
          });
        }
      });

      const cartDrawer = document.getElementById('cart-drawer');
      if (cartDrawer) cartDrawer.hidden = false;
      showToast('Previous order items loaded into your Smart Cart!', '🔁');
    });

    // Customer Login / Registration Modal Form (#7)
    const authForm = document.getElementById('customer-auth-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawName = document.getElementById('auth-name-input')?.value.trim();
        if (!rawName) return;

        const newId = `CAF${Math.floor(10000 + Math.random() * 90000)}`;
        state.customer.name = rawName;
        state.customer.id = newId;
        const firstName = rawName.split(' ')[0];

        document.getElementById('nav-user-name').textContent = firstName;
        document.getElementById('profile-modal-name').textContent = rawName;
        document.getElementById('profile-modal-id').textContent = newId;
        document.getElementById('cart-cust-id').textContent = newId;
        document.querySelectorAll('.avatar-circle').forEach((av) => {
          av.textContent = firstName.charAt(0).toUpperCase();
        });

        document.getElementById('auth-profile-modal').hidden = true;
        authForm.reset();
        showToast(`Welcome, ${rawName}! Your Customer ID is ${newId}`, '🔐');
      });
    }
  }

  /* ------------------------------------------------------------------------
     13. GALLERY FILTER, STAR RATING FEEDBACK & CONTACT (#18, #20, #21)
     ------------------------------------------------------------------------ */
  function initGalleryFeedbackContact() {
    // Gallery Filter Pills
    const galPills = document.querySelectorAll('.gal-pill[data-gallery-filter]');
    const galItems = document.querySelectorAll('#gallery-grid .gallery-item');

    galPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const filter = pill.dataset.galleryFilter;
        galPills.forEach((p) => p.classList.toggle('active', p === pill));
        galItems.forEach((item) => {
          item.hidden = filter !== 'all' && item.dataset.galCat !== filter;
        });
      });
    });

    // Interactive 1-5 Star Rating Input
    const starBtns = document.querySelectorAll('#star-rating-control .star-btn');
    const ratingInput = document.getElementById('fb-rating-value');
    starBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.star || '5', 10);
        if (ratingInput) ratingInput.value = String(val);
        starBtns.forEach((b) => {
          b.classList.toggle('active', parseInt(b.dataset.star || '0', 10) <= val);
        });
      });
    });

    // Feedback Form Submission
    const fbForm = document.getElementById('feedback-form');
    if (fbForm) {
      fbForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('fb-category')?.value || 'Feedback';
        const stars = ratingInput?.value || '5';

        state.customer.points += 25;
        updateLoyaltyUI();
        fbForm.reset();

        pushNotification(
          'Feedback Received (+25 Pts)',
          `Thank you for your ${stars}★ rating on ${cat}.`,
          '💬'
        );
        showToast(`Thank you! +25 Bonus Loyalty Points added for your ${stars}★ feedback`, '🌟');
      });
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        contactForm.reset();
        showToast('Message sent to ChromaCafé Management! We will reply shortly.', '📩');
      });
    }
  }

  /* ------------------------------------------------------------------------
     14. ADMIN ERP DASHBOARD & LIVE MENU INVENTORY MANAGER (#17)
     ------------------------------------------------------------------------ */
  function syncAdminMenuTable() {
    const tbody = document.getElementById('admin-menu-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const cards = document.querySelectorAll('.menu-card');

    cards.forEach((card) => {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const cat = card.dataset.category;
      const price = card.dataset.price;
      const avail = card.dataset.available !== 'false';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${name}</strong></td>
        <td style="text-transform:capitalize;">${cat}</td>
        <td>₹${price}</td>
        <td>
          <span class="badge ${avail ? 'badge--success' : 'badge--hot'}">
            ${avail ? 'Available' : 'Sold Out'}
          </span>
        </td>
        <td style="display:flex;gap:0.35rem;flex-wrap:wrap;">
          <button type="button" class="btn btn--xs btn--secondary" data-admin-action="toggle" data-id="${id}">
            ${avail ? 'Mark Sold Out' : 'Mark Available'}
          </button>
          <button type="button" class="btn btn--xs btn--ghost" data-admin-action="delete" data-id="${id}" style="color:var(--status-nonveg);">
            Delete
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function appendAdminOrderRow(orderId, tableNum, total) {
    const tbody = document.getElementById('admin-orders-tbody');
    if (tbody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${orderId}</strong></td>
        <td>Table #${tableNum}</td>
        <td>${state.customer.name} (${state.customer.id})</td>
        <td>₹${Math.round(total)}</td>
        <td>Order Placed</td>
      `;
      tbody.prepend(tr);
    }

    state.kdsMetrics.revenue += Math.round(total);
    state.kdsMetrics.ordersCount += 1;

    const revEl = document.getElementById('admin-stat-revenue');
    const ordEl = document.getElementById('admin-stat-orders');
    if (revEl) revEl.textContent = `₹${state.kdsMetrics.revenue.toLocaleString('en-IN')}`;
    if (ordEl) ordEl.textContent = String(state.kdsMetrics.ordersCount);
  }

  function initAdminERP() {
    syncAdminMenuTable();

    // Toggle Stock or Delete Dish from Admin Table
    const adminMenuTbody = document.getElementById('admin-menu-tbody');
    if (adminMenuTbody) {
      adminMenuTbody.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-admin-action]');
        if (!btn) return;

        const id = btn.dataset.id;
        const action = btn.dataset.adminAction;
        const card = document.querySelector(`.menu-card[data-id="${id}"]`);
        if (!card) return;

        if (action === 'toggle') {
          const currentlyAvail = card.dataset.available !== 'false';
          const nextState = !currentlyAvail;
          card.dataset.available = String(nextState);

          const stockBadge = card.querySelector('.stock-badge');
          if (stockBadge) {
            stockBadge.textContent = nextState ? 'Available' : 'Sold Out';
            stockBadge.className = `stock-badge ${nextState ? 'stock-badge--in' : 'stock-badge--out'}`;
          }
          const addBtn = card.querySelector('.add-to-cart-btn');
          if (addBtn) {
            addBtn.textContent = nextState ? '+ Add to Cart' : 'Unavailable';
            addBtn.disabled = !nextState;
          }

          syncAdminMenuTable();
          showToast(`${card.dataset.name} marked as ${nextState ? 'Available' : 'Sold Out'}`, '⚙️');
        }

        if (action === 'delete') {
          const dishName = card.dataset.name;
          card.remove();
          syncAdminMenuTable();
          showToast(`Deleted ${dishName} from live menu`, '🗑️');
        }
      });
    }

    // Add New Food Item to Live Menu
    const addFoodForm = document.getElementById('admin-add-food-form');
    if (addFoodForm) {
      addFoodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('admin-food-name')?.value.trim();
        const cat = document.getElementById('admin-food-cat')?.value || 'coffee';
        const price = document.getElementById('admin-food-price')?.value || '199';
        const diet = document.getElementById('admin-food-diet')?.value || 'veg';
        const img = document.getElementById('admin-food-img')?.value.trim();
        const desc = document.getElementById('admin-food-desc')?.value.trim();

        if (!name || !img) return;

        const id = `${cat.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
        const targetGrid = document.querySelector(`.menu-grid[data-category-grid="${cat}"]`);

        if (targetGrid) {
          const article = document.createElement('article');
          article.className = 'menu-card reveal-item is-visible';
          article.dataset.id = id;
          article.dataset.name = name;
          article.dataset.category = cat;
          article.dataset.price = price;
          article.dataset.rating = '4.9';
          article.dataset.veg = diet;
          article.dataset.spicy = 'false';
          article.dataset.bestseller = 'true';
          article.dataset.available = 'true';

          article.innerHTML = `
            <div class="menu-card__media">
              <img src="${img}" alt="${name}" loading="lazy" />
              <span class="diet-badge ${diet === 'veg' ? 'diet-badge--veg' : 'diet-badge--nonveg'}">
                ${diet === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
              </span>
              <span class="bestseller-ribbon">🆕 Chef's New</span>
              <span class="stock-badge stock-badge--in">Available</span>
              <button type="button" class="fav-btn" data-fav-id="${id}" aria-label="Save ${name}">♡</button>
            </div>
            <div class="menu-card__body">
              <div class="menu-card__title-row">
                <h3>${name}</h3>
                <span class="rating-pill">★ 4.9</span>
              </div>
              <p class="menu-card__desc">${desc}</p>
              <div class="menu-card__footer">
                <span class="price">₹${price}</span>
                <button type="button" class="btn btn--sm btn--primary add-to-cart-btn">+ Add to Cart</button>
              </div>
            </div>
          `;
          targetGrid.prepend(article);
        }

        syncAdminMenuTable();
        addFoodForm.reset();
        showToast(`Published "${name}" to the ${cat.toUpperCase()} menu!`, '🍔');
      });
    }

    // Create New Promotional Coupon from Admin Panel
    const couponForm = document.getElementById('admin-create-coupon-form');
    if (couponForm) {
      couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = (document.getElementById('new-coupon-code')?.value || '').trim().toUpperCase();
        const val = parseInt(document.getElementById('new-coupon-discount')?.value || '15', 10);
        const title = (document.getElementById('new-coupon-title')?.value || '').trim();
        if (!code || !title) return;

        state.coupons[code] = {
          type: val <= 50 ? 'percent' : 'flat',
          value: val,
          minOrder: 0,
          desc: title,
        };

        const offersGrid = document.querySelector('#offers .offers-grid');
        if (offersGrid) {
          const card = document.createElement('article');
          card.className = 'offer-card glass-card reveal-item is-visible';
          card.innerHTML = `
            <span class="offer-tag">⚡ New Flash Deal</span>
            <h3>${title}</h3>
            <p>Instant promotional discount unlocked for all active tables today.</p>
            <div class="offer-card__footer">
              <code class="coupon-code">${code}</code>
              <button type="button" class="btn btn--sm btn--primary apply-coupon-btn" data-coupon="${code}">Apply Coupon</button>
            </div>
          `;
          offersGrid.prepend(card);
        }

        couponForm.reset();
        pushNotification(`New Offer Live: ${code}`, title, '🎟️');
        showToast(`Published new coupon ${code}!`, '🎟️');
      });
    }
  }

  /* ------------------------------------------------------------------------
     15. BOOTSTRAP APPLICATION
     ------------------------------------------------------------------------ */
  function initApp() {
    injectDynamicStylesAndLoader();
    initNavigationAndOverlays();
    initParallaxAndReveals();
    initTableAndGroupOrdering();
    initSearchAndFilters();
    initFavourites();
    initCartAndCheckout();
    initKitchenKDS();
    initReservations();
    initLoyaltyAndProfile();
    initGalleryFeedbackContact();
    initAdminERP();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();