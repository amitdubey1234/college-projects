/**
 * IIPS Connect - Reusable UI Components
 * Generates semantic, accessible, and reactive HTML templates for posts, cards, widgets, and empty states.
 */

const Components = {
  /**
   * Render Feed Post Card
   */
  renderPostCard(post, currentUser, currentRole, activeClubId) {
    const isOwner = currentRole === "club_admin" 
      ? post.authorId === activeClubId 
      : post.authorId === currentUser.id;

    const currentViewerId = currentRole === "club_admin" ? activeClubId : currentUser.id;
    const isLiked = post.likes && post.likes.includes(currentViewerId);
    const isBookmarked = post.bookmarks && post.bookmarks.includes(currentUser.id);
    const likeCount = post.likes ? post.likes.length : 0;
    const commentCount = post.comments ? post.comments.length : 0;

    const postTypeBadges = {
      announcement: `<span class="badge badge-accent"><i data-lucide="megaphone" class="icon-xs"></i> Announcement</span>`,
      recruitment: `<span class="badge badge-warning"><i data-lucide="briefcase" class="icon-xs"></i> Recruitment</span>`,
      project: `<span class="badge badge-success"><i data-lucide="code" class="icon-xs"></i> Project Showcase</span>`,
      achievement: `<span class="badge badge-purple"><i data-lucide="award" class="icon-xs"></i> Achievement</span>`
    };

    const typeBadge = postTypeBadges[post.type] || "";

    const tagsHtml = (post.tags && post.tags.length > 0)
      ? `<div class="post-tags">${post.tags.map(t => `<span class="tag-chip">#${Utils.escapeHtml(t)}</span>`).join("")}</div>`
      : "";

    const imageHtml = post.image
      ? `<div class="post-media-container">
           <img src="${Utils.escapeHtml(post.image)}" alt="Post image" class="post-media" loading="lazy" onerror="this.style.display='none'">
         </div>`
      : "";

    // Comments list markup
    const commentsListHtml = (post.comments || []).map(c => `
      <div class="comment-item" id="comment-${c.id}">
        <img src="${Utils.escapeHtml(c.authorAvatar)}" class="avatar avatar-xs" alt="${Utils.escapeHtml(c.authorName)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName)}&background=3657D6&color=fff'">
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">${Utils.escapeHtml(c.authorName)}</span>
            <span class="comment-time">${Utils.timeAgo(c.createdAt)}</span>
          </div>
          <p class="comment-text">${Utils.escapeHtml(c.content)}</p>
        </div>
      </div>
    `).join("");

    return `
      <article class="post-card" id="post-${post.id}" data-post-id="${post.id}">
        <header class="post-header">
          <div class="post-author-info">
            <img src="${Utils.escapeHtml(post.authorAvatar)}" alt="${Utils.escapeHtml(post.authorName)}" class="avatar avatar-md" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=3657D6&color=fff'">
            <div>
              <div class="post-author-name-row">
                <span class="post-author-name">${Utils.escapeHtml(post.authorName)}</span>
                ${post.authorType === "club" ? `<i data-lucide="check-circle-2" class="verified-club-icon" title="Official IIPS Club"></i>` : ""}
                ${typeBadge}
              </div>
              <div class="post-author-meta">
                <span class="text-secondary">${Utils.escapeHtml(post.authorBadge || "")}</span>
                <span class="meta-dot">•</span>
                <time datetime="${post.createdAt}" class="text-secondary">${Utils.timeAgo(post.createdAt)}</time>
              </div>
            </div>
          </div>
          <div class="post-actions-menu">
            ${isOwner ? `
              <button type="button" class="btn-icon btn-ghost btn-delete-post" data-post-id="${post.id}" title="Delete post" aria-label="Delete post">
                <i data-lucide="trash-2"></i>
              </button>
            ` : ""}
          </div>
        </header>

        <div class="post-content">
          ${post.title ? `<h3 class="post-title">${Utils.escapeHtml(post.title)}</h3>` : ""}
          <p class="post-text">${Utils.escapeHtml(post.content).replace(/\n/g, "<br>")}</p>
          ${imageHtml}
          ${tagsHtml}
        </div>

        <footer class="post-footer">
          <div class="post-engagement-stats">
            <span class="engagement-count" id="like-count-${post.id}">
              <strong>${likeCount}</strong> ${likeCount === 1 ? "like" : "likes"}
            </span>
            <span class="meta-dot">•</span>
            <span class="engagement-count" id="comment-count-${post.id}">
              <strong>${commentCount}</strong> ${commentCount === 1 ? "comment" : "comments"}
            </span>
          </div>

          <div class="post-action-buttons">
            <button type="button" class="post-action-btn btn-like ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
              <i data-lucide="heart" class="${isLiked ? 'icon-filled' : ''}"></i>
              <span>${isLiked ? "Liked" : "Like"}</span>
            </button>
            <button type="button" class="post-action-btn btn-toggle-comments" data-post-id="${post.id}">
              <i data-lucide="message-square"></i>
              <span>Comment</span>
            </button>
            <button type="button" class="post-action-btn btn-bookmark ${isBookmarked ? 'active' : ''}" data-post-id="${post.id}">
              <i data-lucide="bookmark" class="${isBookmarked ? 'icon-filled' : ''}"></i>
              <span>${isBookmarked ? "Saved" : "Save"}</span>
            </button>
          </div>

          <!-- Comments Drawer -->
          <div class="post-comments-section" id="comments-section-${post.id}" style="display: none;">
            <div class="comments-list" id="comments-list-${post.id}">
              ${commentsListHtml.length > 0 ? commentsListHtml : '<p class="text-secondary text-sm no-comments-msg">No comments yet. Start the conversation!</p>'}
            </div>
            <form class="comment-composer-form" data-post-id="${post.id}">
              <img src="${Utils.escapeHtml(currentUser.avatar)}" class="avatar avatar-xs" alt="${Utils.escapeHtml(currentUser.name)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3657D6&color=fff'">
              <div class="comment-input-wrap">
                <input type="text" class="comment-input" placeholder="Write a supportive comment..." required maxlength="300">
                <button type="submit" class="btn-comment-submit" title="Send comment" aria-label="Send comment">
                  <i data-lucide="send"></i>
                </button>
              </div>
            </form>
          </div>
        </footer>
      </article>
    `;
  },

  /**
   * Render Student Directory Card
   */
  renderStudentCard(student) {
    const skillsHtml = (student.skills || []).slice(0, 4).map(skill => `
      <span class="skill-tag">${Utils.escapeHtml(skill)}</span>
    `).join("");

    const remainingCount = (student.skills || []).length - 4;
    const remainingBadge = remainingCount > 0 ? `<span class="skill-tag skill-more">+${remainingCount}</span>` : "";

    return `
      <div class="student-card" data-student-id="${student.id}">
        <div class="student-card-banner" style="background-image: url('${Utils.escapeHtml(student.coverImage)}')"></div>
        <div class="student-card-body">
          <div class="student-card-avatar-wrap">
            <img src="${Utils.escapeHtml(student.avatar)}" alt="${Utils.escapeHtml(student.name)}" class="avatar avatar-lg student-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3657D6&color=fff'">
          </div>
          <h3 class="student-name">${Utils.escapeHtml(student.name)}</h3>
          <p class="student-course">${Utils.escapeHtml(student.course)} • ${Utils.escapeHtml(student.year)}</p>
          <p class="student-headline">${Utils.escapeHtml(student.headline || student.bio || "")}</p>
          
          <div class="student-skills-row">
            ${skillsHtml}
            ${remainingBadge}
          </div>

          <div class="student-card-footer">
            <button type="button" class="btn btn-outline btn-sm btn-view-student-profile" data-student-id="${student.id}">
              <i data-lucide="user"></i> View Profile
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render Club Directory Card
   */
  renderClubCard(club) {
    const isRecruiting = club.recruitmentOpen;
    return `
      <div class="club-card" data-club-id="${club.id}">
        <div class="club-card-banner" style="background-image: url('${Utils.escapeHtml(club.coverImage)}')">
          <span class="club-category-pill" style="border-left: 3px solid ${club.accentColor}">${Utils.escapeHtml(club.category)}</span>
        </div>
        <div class="club-card-body">
          <div class="club-logo-wrap">
            <img src="${Utils.escapeHtml(club.logo)}" alt="${Utils.escapeHtml(club.name)}" class="club-logo" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(club.name)}&background=3657D6&color=fff'">
          </div>
          <div class="club-title-row">
            <h3 class="club-title">${Utils.escapeHtml(club.name)}</h3>
            <i data-lucide="check-circle-2" class="verified-club-icon" title="Official IIPS Club"></i>
          </div>
          <p class="club-tagline">${Utils.escapeHtml(club.tagline)}</p>

          <div class="club-stats-row">
            <div class="club-stat-item">
              <i data-lucide="users" class="icon-xs"></i>
              <span><strong>${club.memberCount || (club.members ? club.members.length : 0)}</strong> members</span>
            </div>
            <div class="club-stat-item">
              ${isRecruiting 
                ? `<span class="badge badge-success badge-dot">Recruiting Now</span>` 
                : `<span class="badge badge-neutral">Applications Closed</span>`}
            </div>
          </div>

          <div class="club-card-footer">
            <button type="button" class="btn btn-primary btn-sm btn-view-club-detail" data-club-id="${club.id}">
              View Club &amp; Drives <i data-lucide="arrow-right" class="icon-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render Campus Event Card
   */
  renderEventCard(event, isRegistered = false, currentRole = "student") {
    const dateParts = Utils.getDateParts(event.date);
    const regCount = event.registeredStudentIds ? event.registeredStudentIds.length : 0;
    const capacity = event.capacity || 100;
    const percentFilled = Math.min(100, Math.round((regCount / capacity) * 100));
    const isFull = regCount >= capacity;

    return `
      <div class="event-card" id="event-${event.id}" data-event-id="${event.id}">
        <div class="event-banner-wrap" style="background-image: url('${Utils.escapeHtml(event.banner)}')">
          <div class="event-date-badge">
            <span class="event-date-month">${dateParts.month}</span>
            <span class="event-date-day">${dateParts.day}</span>
          </div>
          <span class="event-category-tag">${Utils.escapeHtml(event.category)}</span>
        </div>
        <div class="event-body">
          <div class="event-organizer-row">
            <span class="event-organizer">${Utils.escapeHtml(event.organizerName)}</span>
          </div>
          <h3 class="event-title">${Utils.escapeHtml(event.title)}</h3>
          
          <div class="event-meta-info">
            <div class="event-meta-item">
              <i data-lucide="clock" class="icon-xs"></i>
              <span>${Utils.escapeHtml(event.time)}</span>
            </div>
            <div class="event-meta-item">
              <i data-lucide="map-pin" class="icon-xs"></i>
              <span>${Utils.escapeHtml(event.venue)}</span>
            </div>
          </div>

          <p class="event-desc">${Utils.escapeHtml(event.description)}</p>

          <div class="event-capacity-bar-wrap">
            <div class="capacity-text-row">
              <span class="capacity-label">Registered Spots</span>
              <span class="capacity-value"><strong>${regCount}</strong> / ${capacity}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${percentFilled > 85 ? 'fill-warning' : ''}" style="width: ${percentFilled}%"></div>
            </div>
          </div>

          <div class="event-card-footer">
            ${currentRole === "student" ? `
              <button type="button" class="btn ${isRegistered ? 'btn-outline-danger' : 'btn-primary'} btn-toggle-event-reg" data-event-id="${event.id}" ${(!isRegistered && isFull) ? 'disabled' : ''}>
                ${isRegistered 
                  ? `<i data-lucide="calendar-x" class="icon-xs"></i> Cancel Registration` 
                  : (isFull 
                      ? `<i data-lucide="slash" class="icon-xs"></i> Event Full` 
                      : `<i data-lucide="calendar-check" class="icon-xs"></i> Register for Event`)}
              </button>
            ` : `
              <button type="button" class="btn btn-outline btn-view-event-roster" data-event-id="${event.id}">
                <i data-lucide="list"></i> View Registrations (${regCount})
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render Recruitment Opportunity Card
   */
  renderRecruitmentCard(rec, hasApplied = false, currentRole = "student") {
    const isClosed = rec.status === "closed";
    const club = store.state.clubs.find(c => c.id === rec.clubId);
    const clubLogo = club ? club.logo : "";
    const clubName = club ? club.name : "IIPS Club";

    const skillsHtml = (rec.requiredSkills || []).map(s => `
      <span class="skill-tag">${Utils.escapeHtml(s)}</span>
    `).join("");

    return `
      <div class="recruitment-card ${isClosed ? 'recruitment-closed' : ''}" id="recruitment-${rec.id}" data-recruitment-id="${rec.id}">
        <div class="recruitment-card-header">
          <div class="recruitment-club-row">
            <img src="${Utils.escapeHtml(clubLogo)}" alt="${Utils.escapeHtml(clubName)}" class="avatar avatar-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(clubName)}&background=3657D6&color=fff'">
            <div>
              <h4 class="recruitment-club-name">${Utils.escapeHtml(clubName)}</h4>
              <span class="text-secondary text-xs">Role: ${Utils.escapeHtml(rec.role || "Member")}</span>
            </div>
          </div>
          <div>
            ${Utils.renderStatusBadge(rec.status)}
          </div>
        </div>

        <h3 class="recruitment-title">${Utils.escapeHtml(rec.title)}</h3>
        <p class="recruitment-eligibility"><i data-lucide="info" class="icon-xs"></i> ${Utils.escapeHtml(rec.eligibility)}</p>
        <p class="recruitment-desc">${Utils.escapeHtml(rec.description)}</p>

        <div class="recruitment-skills-section">
          <span class="skills-heading">Skills Required:</span>
          <div class="skills-chip-list">
            ${skillsHtml}
          </div>
        </div>

        <div class="recruitment-card-footer">
          <div class="deadline-pill">
            <i data-lucide="calendar" class="icon-xs"></i>
            <span>Deadline: <strong>${Utils.formatDate(rec.deadline)}</strong></span>
          </div>

          ${currentRole === "student" ? `
            <button type="button" class="btn ${hasApplied ? 'btn-outline' : 'btn-primary'} btn-apply-recruitment" data-recruitment-id="${rec.id}" ${hasApplied || isClosed ? 'disabled' : ''}>
              ${hasApplied 
                ? `<i data-lucide="check" class="icon-xs"></i> Applied` 
                : (isClosed 
                    ? `<i data-lucide="lock" class="icon-xs"></i> Closed` 
                    : `<i data-lucide="send" class="icon-xs"></i> Apply Now`)}
            </button>
          ` : `
            <button type="button" class="btn btn-outline btn-manage-recruitment-applicants" data-recruitment-id="${rec.id}">
              <i data-lucide="users"></i> View Applicants
            </button>
          `}
        </div>
      </div>
    `;
  },

  /**
   * Render Student's Application Item in "My Applications"
   */
  renderApplicationItem(app) {
    const club = store.state.clubs.find(c => c.id === app.clubId);
    const clubLogo = club ? club.logo : "";

    // Determine timeline states
    // Step 1: Submitted (always complete)
    // Step 2: Under Review (active if pending, completed if accepted/rejected)
    // Step 3: Decision (completed accepted/rejected)
    const isPending = app.status === "pending";
    const isAccepted = app.status === "accepted";
    const isRejected = app.status === "rejected";

    return `
      <div class="application-card" id="app-${app.id}" data-app-id="${app.id}">
        <div class="application-header">
          <div class="app-club-info">
            <img src="${Utils.escapeHtml(clubLogo)}" class="avatar avatar-md" alt="${Utils.escapeHtml(app.clubName)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(app.clubName)}&background=3657D6&color=fff'">
            <div>
              <h3 class="app-role-title">${Utils.escapeHtml(app.roleTitle)}</h3>
              <p class="app-club-name">${Utils.escapeHtml(app.clubName)} • Submitted on ${Utils.formatDate(app.appliedDate)}</p>
            </div>
          </div>
          <div>
            ${Utils.renderStatusBadge(app.status)}
          </div>
        </div>

        <div class="application-timeline-container">
          <div class="timeline-step step-completed">
            <div class="timeline-dot"><i data-lucide="check" class="icon-xxs"></i></div>
            <div class="timeline-info">
              <span class="timeline-title">Submitted</span>
              <span class="timeline-date">${Utils.formatDate(app.appliedDate)}</span>
            </div>
          </div>
          <div class="timeline-line ${isPending ? 'line-active' : 'line-completed'}"></div>
          
          <div class="timeline-step ${isPending ? 'step-active' : 'step-completed'}">
            <div class="timeline-dot">
              ${isPending ? `<span class="pulse-dot"></span>` : `<i data-lucide="check" class="icon-xxs"></i>`}
            </div>
            <div class="timeline-info">
              <span class="timeline-title">Under Review</span>
              <span class="timeline-date">${isPending ? "In Progress" : (app.reviewedDate ? Utils.formatDate(app.reviewedDate) : "Completed")}</span>
            </div>
          </div>
          <div class="timeline-line ${(isAccepted || isRejected) ? 'line-completed' : ''}"></div>

          <div class="timeline-step ${isAccepted ? 'step-accepted' : (isRejected ? 'step-rejected' : 'step-waiting')}">
            <div class="timeline-dot">
              ${isAccepted ? `<i data-lucide="check-circle" class="icon-xxs"></i>` : (isRejected ? `<i data-lucide="x" class="icon-xxs"></i>` : `<i data-lucide="clock" class="icon-xxs"></i>`)}
            </div>
            <div class="timeline-info">
              <span class="timeline-title">${isAccepted ? "Accepted" : (isRejected ? "Not Selected" : "Decision")}</span>
              <span class="timeline-date">${app.reviewedDate ? Utils.formatDate(app.reviewedDate) : "Awaiting Club"}</span>
            </div>
          </div>
        </div>

        <div class="application-summary-box">
          <div class="summary-field">
            <span class="field-label">Motivation Statement:</span>
            <p class="field-value">${Utils.escapeHtml(app.motivation)}</p>
          </div>
          ${app.skills && app.skills.length > 0 ? `
            <div class="summary-field mt-2">
              <span class="field-label">Skills Mentioned:</span>
              <div class="skills-chip-list">
                ${app.skills.map(s => `<span class="skill-tag">${Utils.escapeHtml(s)}</span>`).join("")}
              </div>
            </div>
          ` : ""}
          ${app.resumeFileName ? `
            <div class="summary-attachment mt-2">
              <i data-lucide="file-text" class="icon-xs"></i>
              <span class="text-xs text-secondary">${Utils.escapeHtml(app.resumeFileName)}</span>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  },

  /**
   * Render Club Admin Applicant Review Card/Row
   */
  renderApplicantReviewCard(app) {
    const isPending = app.status === "pending";

    return `
      <div class="applicant-card" id="applicant-${app.id}" data-app-id="${app.id}">
        <div class="applicant-card-header">
          <div class="applicant-profile-meta">
            <img src="${Utils.escapeHtml(app.studentAvatar)}" class="avatar avatar-md" alt="${Utils.escapeHtml(app.studentName)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(app.studentName)}&background=3657D6&color=fff'">
            <div>
              <h4 class="applicant-name">${Utils.escapeHtml(app.studentName)}</h4>
              <p class="applicant-academic">${Utils.escapeHtml(app.studentCourse)}</p>
              <span class="text-xs text-secondary">Applied on ${Utils.formatDate(app.appliedDate)} for <strong>${Utils.escapeHtml(app.roleTitle)}</strong></span>
            </div>
          </div>
          <div>
            ${Utils.renderStatusBadge(app.status)}
          </div>
        </div>

        <div class="applicant-details-box">
          <div class="mb-2">
            <span class="text-xs font-semibold text-secondary uppercase">Motivation & Statement:</span>
            <p class="text-sm mt-1">${Utils.escapeHtml(app.motivation)}</p>
          </div>
          ${app.skills && app.skills.length > 0 ? `
            <div class="mb-2">
              <span class="text-xs font-semibold text-secondary uppercase">Declared Skills:</span>
              <div class="skills-chip-list mt-1">
                ${app.skills.map(s => `<span class="skill-tag">${Utils.escapeHtml(s)}</span>`).join("")}
              </div>
            </div>
          ` : ""}
          <div class="applicant-meta-links">
            ${app.portfolioUrl ? `
              <a href="${Utils.escapeHtml(app.portfolioUrl)}" target="_blank" rel="noopener noreferrer" class="link-chip">
                <i data-lucide="external-link" class="icon-xxs"></i> Portfolio / GitHub
              </a>
            ` : ""}
            ${app.resumeFileName ? `
              <span class="link-chip text-secondary">
                <i data-lucide="file-text" class="icon-xxs"></i> ${Utils.escapeHtml(app.resumeFileName)}
              </span>
            ` : ""}
          </div>
        </div>

        <div class="applicant-actions-bar">
          <button type="button" class="btn btn-outline btn-sm btn-inspect-student" data-student-id="${app.studentId}">
            <i data-lucide="user"></i> View Profile
          </button>
          ${isPending ? `
            <div class="action-buttons-group">
              <button type="button" class="btn btn-outline-danger btn-sm btn-reject-app" data-app-id="${app.id}">
                <i data-lucide="x"></i> Reject
              </button>
              <button type="button" class="btn btn-success btn-sm btn-accept-app" data-app-id="${app.id}">
                <i data-lucide="check"></i> Accept as Member
              </button>
            </div>
          ` : `
            <span class="text-xs text-secondary italic">Decision finalized on ${app.reviewedDate ? Utils.formatDate(app.reviewedDate) : "recent date"}</span>
          `}
        </div>
      </div>
    `;
  },

  /**
   * Render Standard Empty State
   */
  renderEmptyState({ icon = "inbox", title = "No items found", message = "There are no records to display at this time.", actionHtml = "" }) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon-wrap">
          <i data-lucide="${icon}" class="empty-state-icon"></i>
        </div>
        <h3 class="empty-state-title">${Utils.escapeHtml(title)}</h3>
        <p class="empty-state-desc">${Utils.escapeHtml(message)}</p>
        ${actionHtml ? `<div class="empty-state-action">${actionHtml}</div>` : ""}
      </div>
    `;
  }
};
