/**
 * IIPS Connect - Client-Side Router
 * Multi-page feeling single-page architecture with hash routing, query parameter parsing, and active link management.
 */

const Router = {
  currentRoute: "feed",
  currentParams: {},

  routes: {
    "feed": FeedView,
    "home": FeedView,
    "students": StudentsView,
    "clubs": ClubsView,
    "events": EventsView,
    "recruitment": RecruitmentView,
    "applications": ApplicationsView,
    "messages": MessagesView,
    "notifications": NotificationsView,
    "profile": ProfileView,
    "settings": SettingsView,
    // Admin specific routes
    "admin-dashboard": {
      render: () => AdminViews.renderDashboard(),
      bindEvents: (c) => AdminViews.bindEvents(c)
    },
    "admin-applications": {
      render: () => AdminViews.renderApplications(),
      bindEvents: (c) => AdminViews.bindEvents(c)
    },
    "admin-members": {
      render: () => AdminViews.renderMembers(),
      bindEvents: (c) => AdminViews.bindEvents(c)
    },
    "admin-events": {
      render: () => AdminViews.renderEvents(),
      bindEvents: (c) => AdminViews.bindEvents(c)
    },
    "admin-recruitments": {
      render: () => AdminViews.renderRecruitments(),
      bindEvents: (c) => AdminViews.bindEvents(c)
    },
    "admin-club-settings": {
      render: () => AdminViews.renderClubSettings(),
      bindEvents: (c) => AdminViews.bindEvents(c)
    }
  },

  init() {
    window.addEventListener("hashchange", () => this.handleHashChange());
    this.handleHashChange();
  },

  parseHash() {
    let hash = window.location.hash.slice(1);
    if (!hash) hash = "feed";

    const parts = hash.split("?");
    const route = parts[0];
    const params = {};

    if (parts.length > 1) {
      const q = parts[1].split("&");
      q.forEach(pair => {
        const [k, v] = pair.split("=");
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || "");
      });
    }

    return { route, params };
  },

  navigate(target) {
    if (target.startsWith("#")) {
      window.location.hash = target;
    } else {
      window.location.hash = `#${target}`;
    }
  },

  handleHashChange() {
    const { route, params } = this.parseHash();
    this.currentRoute = route;
    this.currentParams = params;

    const currentRole = store.getCurrentRole();

    // Contextual route fallback: If non-admin tries to access admin routes, or vice versa
    if (route.startsWith("admin-") && currentRole !== "club_admin") {
      store.setRole("club_admin");
    }

    // Pass parameters to corresponding views
    if (route === "clubs" && params.id) {
      ClubsView.activeClubDetailId = params.id;
    } else if (route === "clubs" && !params.id) {
      ClubsView.activeClubDetailId = null;
    }

    if (route === "messages" && params.clubId) {
      MessagesView.activeClubId = params.clubId;
    }
    if (route === "messages" && params.studentId) {
      MessagesView.activeStudentId = params.studentId;
    }

    // Toggle full-width layout for views that require maximum canvas (e.g. Messages View)
    const layoutWrapper = document.querySelector(".app-layout-wrapper");
    if (layoutWrapper) {
      layoutWrapper.setAttribute("data-route", route);
      if (route === "messages") {
        layoutWrapper.classList.add("layout-full-main");
      } else {
        layoutWrapper.classList.remove("layout-full-main");
      }
    }
    if (document.body) {
      document.body.setAttribute("data-route", route);
    }

    this.renderCurrentView();
    this.updateActiveNavLinks();
    this.updateSidebarWidgets();
    window.scrollTo({ top: 0, behavior: "instant" });
  },

  renderCurrentView() {
    const mainContainer = document.getElementById("main-content-view");
    if (!mainContainer) return;

    const view = this.routes[this.currentRoute] || FeedView;

    mainContainer.innerHTML = view.render();
    if (typeof view.bindEvents === "function") {
      view.bindEvents(mainContainer);
    }

    Utils.refreshIcons();
  },

  updateActiveNavLinks() {
    // Left navigation links
    document.querySelectorAll(".nav-link").forEach(link => {
      const target = link.getAttribute("href") ? link.getAttribute("href").replace("#", "") : "";
      if (target === this.currentRoute || (this.currentRoute === "home" && target === "feed")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Mobile bottom navigation links
    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      const target = link.getAttribute("href") ? link.getAttribute("href").replace("#", "") : "";
      if (target === this.currentRoute) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  },

  updateSidebarWidgets() {
    if (this.currentRoute === "messages") return;
    const rightSidebar = document.getElementById("right-sidebar-content");
    if (!rightSidebar) return;

    const currentRole = store.getCurrentRole();
    const currentUser = store.getCurrentUser();
    const activeClub = store.getActiveClub();

    if (currentRole === "student") {
      const upcomingEvents = store.state.events.slice(0, 3);
      const featuredClubs = store.state.clubs.slice(0, 4);
      const studentApps = store.state.applications.filter(a => a.studentId === currentUser.id);

      rightSidebar.innerHTML = `
        <!-- Upcoming Events Widget -->
        <div class="sidebar-widget card">
          <div class="widget-header">
            <h3 class="widget-title">Upcoming Events</h3>
            <a href="#events" class="widget-link">View all</a>
          </div>
          <div class="widget-events-list">
            ${upcomingEvents.map(e => `
              <div class="widget-event-item" onclick="Router.navigate('events')">
                <div class="widget-event-date">
                  <span class="widget-event-month">${Utils.getDateParts(e.date).month}</span>
                  <span class="widget-event-day">${Utils.getDateParts(e.date).day}</span>
                </div>
                <div class="widget-event-meta">
                  <strong class="widget-event-title">${Utils.escapeHtml(e.title)}</strong>
                  <span class="text-xs text-secondary">${Utils.escapeHtml(e.organizerName)} • ${Utils.escapeHtml(e.venue.split(",")[0])}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- My Applications Tracker Widget -->
        <div class="sidebar-widget card mt-3">
          <div class="widget-header">
            <h3 class="widget-title">My Applications</h3>
            <a href="#applications" class="widget-link">Track</a>
          </div>
          ${studentApps.length > 0 ? `
            <div class="widget-apps-list">
              ${studentApps.slice(0, 3).map(a => `
                <div class="widget-app-item" onclick="Router.navigate('applications')">
                  <div class="widget-app-info">
                    <strong>${Utils.escapeHtml(a.roleTitle)}</strong>
                    <span class="text-xs text-secondary d-block">${Utils.escapeHtml(a.clubName)}</span>
                  </div>
                  <div>${Utils.renderStatusBadge(a.status)}</div>
                </div>
              `).join("")}
            </div>
          ` : `
            <p class="text-xs text-secondary py-2">No active applications. Browse recruitment drives!</p>
            <a href="#recruitment" class="btn btn-outline btn-xs w-full mt-2">Explore Drives</a>
          `}
        </div>

        <!-- Featured Clubs Widget -->
        <div class="sidebar-widget card mt-3">
          <div class="widget-header">
            <h3 class="widget-title">Featured Clubs</h3>
            <a href="#clubs" class="widget-link">Explore</a>
          </div>
          <div class="widget-clubs-list">
            ${featuredClubs.map(c => `
              <div class="widget-club-item" onclick="ClubsView.activeClubDetailId = '${c.id}'; Router.navigate('clubs?id=${c.id}')">
                <img src="${Utils.escapeHtml(c.logo)}" class="avatar avatar-sm" alt="${Utils.escapeHtml(c.name)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=3657D6&color=fff'">
                <div class="widget-club-info">
                  <strong>${Utils.escapeHtml(c.name)}</strong>
                  <span class="text-xs text-secondary">${Utils.escapeHtml(c.category)}</span>
                </div>
                ${c.recruitmentOpen ? `<span class="badge badge-success badge-dot" title="Recruiting">Hiring</span>` : ""}
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Campus Footer Notice -->
        <div class="sidebar-footer-notice mt-3">
          <div class="d-flex align-center gap-2 mb-2">
            <img src="assets/images/logo-icon.png" alt="IIPS Connect" class="sidebar-footer-logo">
            <div>
              <strong class="text-xs d-block"><span class="brand-name-iips">IIPS</span> <span class="brand-name-connect">Connect</span></strong>
              <span class="text-xxs text-secondary">Students • Clubs • Opportunities</span>
            </div>
          </div>
          <p class="text-xs text-secondary">
            Takshashila Campus, DAVV Indore.<br>
            Designed exclusively for student community collaboration.
          </p>
        </div>
      `;
    } else {
      // Club Admin Right Sidebar Widgets
      const pendingApps = store.state.applications.filter(a => a.clubId === activeClub.id && a.status === "pending");
      const activeRecs = store.state.recruitments.filter(r => r.clubId === activeClub.id && r.status === "open");

      rightSidebar.innerHTML = `
        <!-- Admin Quick Stats Widget -->
        <div class="sidebar-widget card">
          <div class="widget-header">
            <h3 class="widget-title">${Utils.escapeHtml(activeClub.name)}</h3>
            <span class="badge badge-accent text-xs">Admin</span>
          </div>
          <div class="admin-quick-stats-list">
            <div class="admin-stat-row">
              <span class="text-xs text-secondary">Official Members:</span>
              <strong>${activeClub.members ? activeClub.members.length : 0}</strong>
            </div>
            <div class="admin-stat-row">
              <span class="text-xs text-secondary">Pending Applicants:</span>
              <strong class="text-amber">${pendingApps.length}</strong>
            </div>
            <div class="admin-stat-row">
              <span class="text-xs text-secondary">Open Drives:</span>
              <strong>${activeRecs.length}</strong>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-xs w-full mt-3" onclick="Router.navigate('admin-applications')">
            Review Applications
          </button>
        </div>

        <!-- Pending Applicants Mini List -->
        <div class="sidebar-widget card mt-3">
          <div class="widget-header">
            <h3 class="widget-title">Recent Applicants</h3>
            <a href="#admin-applications" class="widget-link">All</a>
          </div>
          ${pendingApps.length > 0 ? `
            <div class="widget-applicants-mini">
              ${pendingApps.slice(0, 3).map(a => `
                <div class="applicant-mini-row" onclick="Router.navigate('admin-applications')">
                  <img src="${Utils.escapeHtml(a.studentAvatar)}" class="avatar avatar-xs" alt="${Utils.escapeHtml(a.studentName)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(a.studentName)}&background=3657D6&color=fff'">
                  <div class="applicant-mini-meta">
                    <strong>${Utils.escapeHtml(a.studentName)}</strong>
                    <span class="text-xs text-secondary">${Utils.escapeHtml(a.roleTitle.slice(0, 22))}...</span>
                  </div>
                  <i data-lucide="chevron-right" class="icon-xs text-secondary"></i>
                </div>
              `).join("")}
            </div>
          ` : `
            <p class="text-xs text-secondary py-2">No pending applications at this time.</p>
          `}
        </div>

        <!-- Quick Switcher Notice -->
        <div class="sidebar-widget card mt-3">
          <h4 class="text-xs font-semibold mb-1">Switch to Student View</h4>
          <p class="text-xs text-secondary mb-2">Test how students see your recruitments and events.</p>
          <button type="button" class="btn btn-outline btn-xs w-full" onclick="store.setRole('student'); Router.navigate('feed');">
            Switch to Student Persona
          </button>
        </div>

        <!-- Campus Footer Notice -->
        <div class="sidebar-footer-notice mt-3">
          <div class="d-flex align-center gap-2 mb-2">
            <img src="assets/images/logo-icon.png" alt="IIPS Connect" class="sidebar-footer-logo">
            <div>
              <strong class="text-xs d-block"><span class="brand-name-iips">IIPS</span> <span class="brand-name-connect">Connect</span></strong>
              <span class="text-xxs text-secondary">Admin & Club Workspace</span>
            </div>
          </div>
          <p class="text-xs text-secondary">
            Takshashila Campus, DAVV Indore.
          </p>
        </div>
      `;
    }

    Utils.refreshIcons();
  }
};
