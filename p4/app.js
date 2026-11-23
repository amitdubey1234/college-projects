/**
 * IIPS Connect - Main Application Bootstrap
 * Shell initialization, global search autocomplete, role switcher pill, navigation sync, and modal handlers.
 */

const App = {
  init() {
    this.initTheme();
    this.renderLeftSidebar();
    this.renderTopNav();
    this.setupGlobalModals();
    this.bindGlobalEvents();
    this.setupGlobalSearch();

    // Initialize client-side router
    Router.init();

    // Subscribe to state mutations for real-time reactivity
    store.subscribe("state_changed", () => {
      this.updateBadges();
      this.renderLeftSidebar();
      this.renderTopNav();
    });

    store.subscribe("role_changed", () => {
      this.renderLeftSidebar();
      this.renderTopNav();
      Router.handleHashChange();
    });

    this.updateBadges();
    Utils.refreshIcons();
    console.log("IIPS Connect initialized successfully.");
  },

  initTheme() {
    const savedTheme = localStorage.getItem("iips_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  },

  renderTopNav() {
    const currentRole = store.getCurrentRole();
    const currentUser = store.getCurrentUser();
    const activeClub = store.getActiveClub();
    const unreadNotifs = store.getUnreadNotificationsCount();
    const unreadMessages = store.getUnreadMessagesCount();

    const roleName = currentRole === "club_admin" ? `Admin: ${activeClub.name}` : `Student: ${currentUser.name.split(" ")[0]}`;
    const avatar = currentRole === "club_admin" ? activeClub.logo : currentUser.avatar;

    const topbarRight = document.getElementById("topbar-right-actions");
    if (topbarRight) {
      topbarRight.innerHTML = `
        <!-- Role Switcher Quick Pill -->
        <button type="button" class="role-pill-btn" id="btn-quick-role-toggle" title="Click to toggle between Demo Student and Club Admin">
          <span class="role-pill-indicator ${currentRole === 'club_admin' ? 'indicator-admin' : 'indicator-student'}"></span>
          <span class="role-pill-text">${Utils.escapeHtml(roleName)}</span>
          <i data-lucide="chevrons-up-down" class="icon-xxs"></i>
        </button>

        <!-- Create Post Action -->
        <button type="button" class="btn btn-primary btn-sm btn-nav-create" id="btn-topbar-create-post">
          <i data-lucide="plus"></i> <span class="hide-mobile">Create</span>
        </button>

        <!-- Messages Shortcut -->
        <a href="#messages" class="topbar-icon-btn" title="Messages" aria-label="Messages">
          <i data-lucide="message-square"></i>
          ${unreadMessages > 0 ? `<span class="badge-counter">${unreadMessages}</span>` : ""}
        </a>

        <!-- Notifications Shortcut -->
        <a href="#notifications" class="topbar-icon-btn" title="Notifications" aria-label="Notifications">
          <i data-lucide="bell"></i>
          ${unreadNotifs > 0 ? `<span class="badge-counter">${unreadNotifs}</span>` : ""}
        </a>

        <!-- User Profile Dropdown Trigger -->
        <div class="user-menu-wrap">
          <button type="button" class="user-menu-btn" id="btn-user-dropdown" aria-label="User Profile Menu">
            <img src="${Utils.escapeHtml(avatar)}" class="avatar avatar-sm" alt="User Profile" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3657D6&color=fff'">
          </button>
          <div class="user-dropdown-menu" id="user-dropdown-menu" style="display: none;">
            <div class="dropdown-user-header">
              <strong>${Utils.escapeHtml(currentRole === 'club_admin' ? activeClub.name : currentUser.name)}</strong>
              <span class="text-xs text-secondary d-block">${Utils.escapeHtml(currentRole === 'club_admin' ? activeClub.category + ' Club' : currentUser.course)}</span>
            </div>
            <div class="dropdown-divider"></div>
            ${currentRole === 'student' ? `
              <a href="#profile" class="dropdown-item"><i data-lucide="user"></i> My Profile</a>
              <a href="#applications" class="dropdown-item"><i data-lucide="file-check"></i> My Applications</a>
            ` : `
              <a href="#admin-dashboard" class="dropdown-item"><i data-lucide="layout-dashboard"></i> Club Dashboard</a>
              <a href="#admin-applications" class="dropdown-item"><i data-lucide="users"></i> Manage Applicants</a>
              <a href="#admin-club-settings" class="dropdown-item"><i data-lucide="settings"></i> Club Profile Settings</a>
            `}
            <a href="#settings" class="dropdown-item"><i data-lucide="sliders"></i> Platform Settings</a>
            <div class="dropdown-divider"></div>
            <button type="button" class="dropdown-item text-danger" id="dropdown-btn-switch-role">
              <i data-lucide="repeat"></i> Switch to ${currentRole === 'student' ? 'Club Admin' : 'Student'}
            </button>
          </div>
        </div>
      `;

      // Quick Role Toggle Listener
      const roleToggleBtn = document.getElementById("btn-quick-role-toggle");
      if (roleToggleBtn) {
        roleToggleBtn.addEventListener("click", () => {
          this.toggleDemoRole();
        });
      }

      // Dropdown Switch Role Listener
      const dropSwitch = document.getElementById("dropdown-btn-switch-role");
      if (dropSwitch) {
        dropSwitch.addEventListener("click", () => {
          this.toggleDemoRole();
        });
      }

      // Topbar create post
      const createPostBtn = document.getElementById("btn-topbar-create-post");
      if (createPostBtn) {
        createPostBtn.addEventListener("click", () => {
          Utils.openModal("create-post-modal");
        });
      }

      // User dropdown toggle
      const userBtn = document.getElementById("btn-user-dropdown");
      const userMenu = document.getElementById("user-dropdown-menu");
      if (userBtn && userMenu) {
        userBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isShown = userMenu.style.display === "block";
          userMenu.style.display = isShown ? "none" : "block";
        });
        document.addEventListener("click", () => {
          userMenu.style.display = "none";
        });
      }
    }
  },

  renderLeftSidebar() {
    const currentRole = store.getCurrentRole();
    const currentUser = store.getCurrentUser();
    const activeClub = store.getActiveClub();
    const pendingApps = store.state.applications.filter(a => a.clubId === activeClub.id && a.status === "pending").length;
    const unreadMessages = store.getUnreadMessagesCount();
    const unreadNotifs = store.getUnreadNotificationsCount();

    const navContainer = document.getElementById("left-sidebar-navigation");
    if (!navContainer) return;

    if (currentRole === "student") {
      navContainer.innerHTML = `
        <div class="sidebar-nav-group">
          <span class="nav-group-heading">Main</span>
          <a href="#feed" class="nav-link"><i data-lucide="home"></i> <span>Home Feed</span></a>
          <a href="#students" class="nav-link"><i data-lucide="users"></i> <span>Discover Students</span></a>
          <a href="#clubs" class="nav-link"><i data-lucide="shield"></i> <span>Official Clubs</span></a>
          <a href="#events" class="nav-link"><i data-lucide="calendar"></i> <span>Campus Events</span></a>
          <a href="#recruitment" class="nav-link"><i data-lucide="briefcase"></i> <span>Recruitment Drives</span></a>
        </div>

        <div class="sidebar-nav-group">
          <span class="nav-group-heading">Personal</span>
          <a href="#applications" class="nav-link">
            <i data-lucide="file-check"></i> 
            <span>My Applications</span>
          </a>
          <a href="#messages" class="nav-link">
            <i data-lucide="message-square"></i> 
            <span>Messages</span>
            ${unreadMessages > 0 ? `<span class="nav-badge">${unreadMessages}</span>` : ""}
          </a>
          <a href="#notifications" class="nav-link">
            <i data-lucide="bell"></i> 
            <span>Notifications</span>
            ${unreadNotifs > 0 ? `<span class="nav-badge">${unreadNotifs}</span>` : ""}
          </a>
          <a href="#profile" class="nav-link"><i data-lucide="user"></i> <span>My Profile</span></a>
          <a href="#settings" class="nav-link"><i data-lucide="settings"></i> <span>Settings</span></a>
        </div>
      `;
    } else {
      // Club Admin Left Navigation
      navContainer.innerHTML = `
        <div class="sidebar-nav-group">
          <span class="nav-group-heading">${Utils.escapeHtml(activeClub.name)}</span>
          <a href="#admin-dashboard" class="nav-link"><i data-lucide="layout-dashboard"></i> <span>Dashboard</span></a>
          <a href="#admin-applications" class="nav-link">
            <i data-lucide="file-check"></i> 
            <span>Review Applications</span>
            ${pendingApps > 0 ? `<span class="nav-badge badge-warning">${pendingApps}</span>` : ""}
          </a>
          <a href="#admin-members" class="nav-link"><i data-lucide="users"></i> <span>Manage Members</span></a>
          <a href="#admin-events" class="nav-link"><i data-lucide="calendar"></i> <span>Club Events</span></a>
          <a href="#admin-recruitments" class="nav-link"><i data-lucide="briefcase"></i> <span>Recruitment Drives</span></a>
          <a href="#admin-club-settings" class="nav-link"><i data-lucide="sliders"></i> <span>Club Profile</span></a>
        </div>

        <div class="sidebar-nav-group">
          <span class="nav-group-heading">Campus Overview</span>
          <a href="#feed" class="nav-link"><i data-lucide="home"></i> <span>Campus Feed</span></a>
          <a href="#students" class="nav-link"><i data-lucide="user-search"></i> <span>Students Directory</span></a>
          <a href="#clubs" class="nav-link"><i data-lucide="shield"></i> <span>All Clubs</span></a>
          <a href="#messages" class="nav-link">
            <i data-lucide="message-square"></i> 
            <span>Student Inquiries</span>
            ${unreadMessages > 0 ? `<span class="nav-badge">${unreadMessages}</span>` : ""}
          </a>
          <a href="#settings" class="nav-link"><i data-lucide="settings"></i> <span>Settings</span></a>
        </div>
      `;
    }

    // Mini user card at bottom of left sidebar
    const userMiniCard = document.getElementById("sidebar-user-minicard");
    if (userMiniCard) {
      if (currentRole === "student") {
        userMiniCard.innerHTML = `
          <div class="minicard-content">
            <img src="${Utils.escapeHtml(currentUser.avatar)}" class="avatar avatar-sm" alt="Student" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3657D6&color=fff'">
            <div class="minicard-info">
              <strong>${Utils.escapeHtml(currentUser.name)}</strong>
              <span class="text-xs text-secondary">${Utils.escapeHtml(currentUser.course)}</span>
            </div>
          </div>
          <button type="button" class="btn-icon btn-ghost btn-toggle-role-quick" title="Switch to Club Admin">
            <i data-lucide="repeat"></i>
          </button>
        `;
      } else {
        userMiniCard.innerHTML = `
          <div class="minicard-content">
            <img src="${Utils.escapeHtml(activeClub.logo)}" class="avatar avatar-sm" alt="Club" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(activeClub.name)}&background=3657D6&color=fff'">
            <div class="minicard-info">
              <strong>${Utils.escapeHtml(activeClub.name)}</strong>
              <span class="text-xs text-secondary">Admin Mode</span>
            </div>
          </div>
          <button type="button" class="btn-icon btn-ghost btn-toggle-role-quick" title="Switch to Student">
            <i data-lucide="repeat"></i>
          </button>
        `;
      }

      userMiniCard.querySelector(".btn-toggle-role-quick").addEventListener("click", () => {
        this.toggleDemoRole();
      });
    }

    Router.updateActiveNavLinks();
  },

  toggleDemoRole() {
    const current = store.getCurrentRole();
    const target = current === "student" ? "club_admin" : "student";
    store.setRole(target);
    Utils.showToast(`Switched active persona to ${target === 'club_admin' ? 'Club Admin' : 'Student'}`, "success");
    if (target === "club_admin") {
      Router.navigate("admin-dashboard");
    } else {
      Router.navigate("feed");
    }
  },

  updateBadges() {
    // Dynamic refresh of badge numbers
    const unreadNotifs = store.getUnreadNotificationsCount();
    const unreadMessages = store.getUnreadMessagesCount();

    document.querySelectorAll(".badge-counter-notifs").forEach(el => {
      el.textContent = unreadNotifs;
      el.style.display = unreadNotifs > 0 ? "inline-flex" : "none";
    });

    document.querySelectorAll(".badge-counter-messages").forEach(el => {
      el.textContent = unreadMessages;
      el.style.display = unreadMessages > 0 ? "inline-flex" : "none";
    });
  },

  setupGlobalSearch() {
    const searchInput = document.getElementById("global-search-input");
    const resultsDropdown = document.getElementById("global-search-results");
    if (!searchInput || !resultsDropdown) return;

    searchInput.addEventListener("input", Utils.debounce((e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q || q.length < 2) {
        resultsDropdown.style.display = "none";
        resultsDropdown.innerHTML = "";
        return;
      }

      // Search across students, clubs, events, recruitments
      const matchedStudents = store.state.students.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.skills && s.skills.some(sk => sk.toLowerCase().includes(q))) ||
        s.course.toLowerCase().includes(q)
      ).slice(0, 3);

      const matchedClubs = store.state.clubs.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.category.toLowerCase().includes(q)
      ).slice(0, 3);

      const matchedEvents = store.state.events.filter(ev => 
        ev.title.toLowerCase().includes(q) || 
        ev.organizerName.toLowerCase().includes(q)
      ).slice(0, 2);

      const matchedRecs = store.state.recruitments.filter(r => 
        r.title.toLowerCase().includes(q)
      ).slice(0, 2);

      const totalMatches = matchedStudents.length + matchedClubs.length + matchedEvents.length + matchedRecs.length;

      if (totalMatches === 0) {
        resultsDropdown.innerHTML = `
          <div class="search-no-results">
            <span class="text-xs text-secondary">No results found for "${Utils.escapeHtml(q)}"</span>
          </div>
        `;
        resultsDropdown.style.display = "block";
        return;
      }

      let html = "";

      if (matchedStudents.length > 0) {
        html += `<div class="search-category-title">Students</div>`;
        matchedStudents.forEach(s => {
          html += `
            <div class="search-result-item" data-type="student" data-id="${s.id}">
              <img src="${Utils.escapeHtml(s.avatar)}" class="avatar avatar-xs" alt="${Utils.escapeHtml(s.name)}">
              <div>
                <strong>${Utils.escapeHtml(s.name)}</strong>
                <span class="text-xs text-secondary d-block">${Utils.escapeHtml(s.course)} (${Utils.escapeHtml(s.year)})</span>
              </div>
            </div>
          `;
        });
      }

      if (matchedClubs.length > 0) {
        html += `<div class="search-category-title">Official Clubs</div>`;
        matchedClubs.forEach(c => {
          html += `
            <div class="search-result-item" data-type="club" data-id="${c.id}">
              <img src="${Utils.escapeHtml(c.logo)}" class="avatar avatar-xs" alt="${Utils.escapeHtml(c.name)}">
              <div>
                <strong>${Utils.escapeHtml(c.name)}</strong>
                <span class="text-xs text-secondary d-block">${Utils.escapeHtml(c.category)}</span>
              </div>
            </div>
          `;
        });
      }

      if (matchedEvents.length > 0) {
        html += `<div class="search-category-title">Campus Events</div>`;
        matchedEvents.forEach(ev => {
          html += `
            <div class="search-result-item" data-type="event" data-id="${ev.id}">
              <i data-lucide="calendar" class="icon-xs text-accent"></i>
              <div>
                <strong>${Utils.escapeHtml(ev.title)}</strong>
                <span class="text-xs text-secondary d-block">${Utils.formatDate(ev.date)} • ${Utils.escapeHtml(ev.organizerName)}</span>
              </div>
            </div>
          `;
        });
      }

      if (matchedRecs.length > 0) {
        html += `<div class="search-category-title">Recruitment Drives</div>`;
        matchedRecs.forEach(r => {
          html += `
            <div class="search-result-item" data-type="recruitment" data-id="${r.id}">
              <i data-lucide="briefcase" class="icon-xs text-amber"></i>
              <div>
                <strong>${Utils.escapeHtml(r.title)}</strong>
                <span class="text-xs text-secondary d-block">Deadline: ${Utils.formatDate(r.deadline)}</span>
              </div>
            </div>
          `;
        });
      }

      resultsDropdown.innerHTML = html;
      resultsDropdown.style.display = "block";
      Utils.refreshIcons();

      // Click bindings for search results
      resultsDropdown.querySelectorAll(".search-result-item").forEach(item => {
        item.addEventListener("click", () => {
          const type = item.dataset.type;
          const id = item.dataset.id;
          resultsDropdown.style.display = "none";
          searchInput.value = "";

          if (type === "student") {
            if (typeof StudentsView !== "undefined") {
              StudentsView.openStudentModal(id);
            }
          } else if (type === "club") {
            if (typeof ClubsView !== "undefined") {
              ClubsView.activeClubDetailId = id;
              Router.navigate(`clubs?id=${id}`);
            }
          } else if (type === "event") {
            Router.navigate("events");
          } else if (type === "recruitment") {
            Router.navigate("recruitment");
          }
        });
      });
    }, 250));

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !resultsDropdown.contains(e.target)) {
        resultsDropdown.style.display = "none";
      }
    });

    // Wire up Mobile Search Input (mirroring desktop search)
    const mobileSearchInput = document.getElementById("mobile-search-input");
    const mobileResultsDropdown = document.getElementById("mobile-search-results");
    if (mobileSearchInput && mobileResultsDropdown) {
      mobileSearchInput.addEventListener("input", Utils.debounce((e) => {
        const q = e.target.value.trim().toLowerCase();
        if (!q || q.length < 2) {
          mobileResultsDropdown.style.display = "none";
          mobileResultsDropdown.innerHTML = "";
          return;
        }

        const matchedStudents = store.state.students.filter(s => 
          s.name.toLowerCase().includes(q) || 
          (s.skills && s.skills.some(sk => sk.toLowerCase().includes(q))) ||
          s.course.toLowerCase().includes(q)
        ).slice(0, 3);

        const matchedClubs = store.state.clubs.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.category.toLowerCase().includes(q)
        ).slice(0, 3);

        const matchedEvents = store.state.events.filter(ev => 
          ev.title.toLowerCase().includes(q) || 
          ev.organizerName.toLowerCase().includes(q)
        ).slice(0, 2);

        const matchedRecs = store.state.recruitments.filter(r => 
          r.title.toLowerCase().includes(q)
        ).slice(0, 2);

        const totalMatches = matchedStudents.length + matchedClubs.length + matchedEvents.length + matchedRecs.length;

        if (totalMatches === 0) {
          mobileResultsDropdown.innerHTML = `
            <div class="search-no-results">
              <span class="text-xs text-secondary">No results found for "${Utils.escapeHtml(q)}"</span>
            </div>
          `;
          mobileResultsDropdown.style.display = "block";
          return;
        }

        let html = "";
        if (matchedStudents.length > 0) {
          html += `<div class="search-category-title">Students</div>`;
          matchedStudents.forEach(s => {
            html += `
              <div class="search-result-item" data-type="student" data-id="${s.id}">
                <img src="${Utils.escapeHtml(s.avatar)}" class="avatar avatar-xs" alt="${Utils.escapeHtml(s.name)}">
                <div>
                  <strong>${Utils.escapeHtml(s.name)}</strong>
                  <span class="text-xs text-secondary d-block">${Utils.escapeHtml(s.course)} (${Utils.escapeHtml(s.year)})</span>
                </div>
              </div>
            `;
          });
        }

        if (matchedClubs.length > 0) {
          html += `<div class="search-category-title">Official Clubs</div>`;
          matchedClubs.forEach(c => {
            html += `
              <div class="search-result-item" data-type="club" data-id="${c.id}">
                <img src="${Utils.escapeHtml(c.logo)}" class="avatar avatar-xs" alt="${Utils.escapeHtml(c.name)}">
                <div>
                  <strong>${Utils.escapeHtml(c.name)}</strong>
                  <span class="text-xs text-secondary d-block">${Utils.escapeHtml(c.category)}</span>
                </div>
              </div>
            `;
          });
        }

        if (matchedEvents.length > 0) {
          html += `<div class="search-category-title">Campus Events</div>`;
          matchedEvents.forEach(ev => {
            html += `
              <div class="search-result-item" data-type="event" data-id="${ev.id}">
                <i data-lucide="calendar" class="icon-xs text-accent"></i>
                <div>
                  <strong>${Utils.escapeHtml(ev.title)}</strong>
                  <span class="text-xs text-secondary d-block">${Utils.formatDate(ev.date)} • ${Utils.escapeHtml(ev.organizerName)}</span>
                </div>
              </div>
            `;
          });
        }

        if (matchedRecs.length > 0) {
          html += `<div class="search-category-title">Recruitment Drives</div>`;
          matchedRecs.forEach(r => {
            html += `
              <div class="search-result-item" data-type="recruitment" data-id="${r.id}">
                <i data-lucide="briefcase" class="icon-xs text-amber"></i>
                <div>
                  <strong>${Utils.escapeHtml(r.title)}</strong>
                  <span class="text-xs text-secondary d-block">Deadline: ${Utils.formatDate(r.deadline)}</span>
                </div>
              </div>
            `;
          });
        }

        mobileResultsDropdown.innerHTML = html;
        mobileResultsDropdown.style.display = "block";
        Utils.refreshIcons();

        mobileResultsDropdown.querySelectorAll(".search-result-item").forEach(item => {
          item.addEventListener("click", () => {
            const type = item.dataset.type;
            const id = item.dataset.id;
            mobileResultsDropdown.style.display = "none";
            mobileSearchInput.value = "";
            const mobilePanel = document.getElementById("mobile-search-panel");
            if (mobilePanel) mobilePanel.style.display = "none";

            if (type === "student") {
              if (typeof StudentsView !== "undefined") {
                StudentsView.openStudentModal(id);
              }
            } else if (type === "club") {
              if (typeof ClubsView !== "undefined") {
                ClubsView.activeClubDetailId = id;
                Router.navigate(`clubs?id=${id}`);
              }
            } else if (type === "event") {
              Router.navigate("events");
            } else if (type === "recruitment") {
              Router.navigate("recruitment");
            }
          });
        });
      }, 250));
    }
  },

  setupGlobalModals() {
    // 1. Post Creation Modal Form
    const postForm = document.getElementById("create-post-form");
    if (postForm) {
      postForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const type = document.getElementById("composer-post-type").value;
        const title = document.getElementById("composer-post-title").value.trim();
        const content = document.getElementById("composer-post-content").value.trim();
        const image = document.getElementById("composer-post-image").value.trim();
        const tags = document.getElementById("composer-post-tags").value.split(",").map(t => t.trim().replace(/^#/, "")).filter(Boolean);

        if (!content) return;

        store.addPost({ type, title, content, image, tags });
        postForm.reset();
        Utils.closeModal("create-post-modal");
        Utils.showToast("Post published successfully!", "success");

        if (Router.currentRoute === "feed") {
          Router.renderCurrentView();
        } else {
          Router.navigate("feed");
        }
      });
    }

    // 2. Club Admin: Host New Event Modal Form
    const eventForm = document.getElementById("create-event-form");
    if (eventForm) {
      eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const activeClub = store.getActiveClub();
        const title = document.getElementById("event-new-title").value.trim();
        const category = document.getElementById("event-new-category").value;
        const date = document.getElementById("event-new-date").value;
        const time = document.getElementById("event-new-time").value.trim();
        const venue = document.getElementById("event-new-venue").value.trim();
        const capacity = document.getElementById("event-new-capacity").value;
        const banner = document.getElementById("event-new-banner").value.trim();
        const description = document.getElementById("event-new-desc").value.trim();
        const tags = document.getElementById("event-new-tags").value.split(",").map(t => t.trim()).filter(Boolean);

        store.addEvent({
          title,
          category,
          date,
          time,
          venue,
          capacity,
          banner,
          description,
          tags
        });

        eventForm.reset();
        Utils.closeModal("create-event-modal");
        Utils.showToast("Event published to campus calendar and social feed!", "success");

        if (store.getCurrentRole() === "club_admin") {
          Router.navigate("admin-events");
        } else {
          Router.navigate("events");
        }
      });
    }

    // 3. Club Admin: Create Recruitment Drive Modal Form
    const recForm = document.getElementById("create-recruitment-form");
    if (recForm) {
      recForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("rec-new-title").value.trim();
        const role = document.getElementById("rec-new-role").value.trim();
        const eligibility = document.getElementById("rec-new-eligibility").value.trim();
        const deadline = document.getElementById("rec-new-deadline").value;
        const positions = document.getElementById("rec-new-positions").value;
        const skills = document.getElementById("rec-new-skills").value;
        const description = document.getElementById("rec-new-desc").value.trim();

        store.addRecruitment({
          title,
          role,
          eligibility,
          deadline,
          positions,
          requiredSkills: skills,
          description
        });

        recForm.reset();
        Utils.closeModal("create-recruitment-modal");
        Utils.showToast("Recruitment drive published and announced!", "success");

        if (store.getCurrentRole() === "club_admin") {
          Router.navigate("admin-recruitments");
        } else {
          Router.navigate("recruitment");
        }
      });
    }

    // Modal Close Buttons (delegated)
    document.querySelectorAll(".modal-close, .modal-backdrop, [data-modal-close]").forEach(el => {
      el.addEventListener("click", () => {
        Utils.closeAllModals();
      });
    });

    // Escape Key listener
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        Utils.closeAllModals();
      }
    });
  },

  bindGlobalEvents() {
    // Mobile Drawer Navigation toggle
    const mobileMenuBtn = document.getElementById("btn-mobile-menu-toggle");
    const sidebar = document.getElementById("app-left-sidebar");
    const mobileOverlay = document.getElementById("sidebar-overlay");
    const closeDrawerBtn = document.getElementById("btn-close-drawer");

    const closeDrawer = () => {
      if (sidebar) sidebar.classList.remove("open");
      if (mobileOverlay) mobileOverlay.classList.remove("active");
      document.body.classList.remove("drawer-open");
    };

    const openDrawer = () => {
      if (sidebar) sidebar.classList.add("open");
      if (mobileOverlay) mobileOverlay.classList.add("active");
      document.body.classList.add("drawer-open");
    };

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", openDrawer);
    }

    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener("click", closeDrawer);
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener("click", closeDrawer);
    }

    // Mobile Search Panel Toggle
    const mobileSearchToggle = document.getElementById("btn-mobile-search-toggle");
    const mobileSearchPanel = document.getElementById("mobile-search-panel");
    const closeMobileSearch = document.getElementById("btn-close-mobile-search");

    if (mobileSearchToggle && mobileSearchPanel) {
      mobileSearchToggle.addEventListener("click", () => {
        const isShown = mobileSearchPanel.style.display === "block";
        mobileSearchPanel.style.display = isShown ? "none" : "block";
        if (!isShown) {
          const input = document.getElementById("mobile-search-input");
          if (input) setTimeout(() => input.focus(), 50);
        }
      });
    }

    if (closeMobileSearch && mobileSearchPanel) {
      closeMobileSearch.addEventListener("click", () => {
        mobileSearchPanel.style.display = "none";
      });
    }

    // Close drawer when any nav link is tapped on mobile
    if (sidebar) {
      sidebar.addEventListener("click", (e) => {
        if (e.target.closest(".nav-link") || e.target.closest(".btn-toggle-role-quick")) {
          closeDrawer();
        }
      });
    }
  }
};

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
