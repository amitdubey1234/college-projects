/**
 * IIPS Connect - Central State Management
 * Persistent reactive store backed by browser localStorage with Pub/Sub event dispatcher.
 */

class Store {
  constructor() {
    this.STORAGE_KEY = "iips_connect_store_v1";
    this.subscribers = {};
    this.state = this.loadState();
  }

  loadState() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Verify minimum structural integrity
        if (parsed.students && parsed.clubs && parsed.posts && parsed.applications) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load state from localStorage, falling back to defaults", e);
    }
    // Deep copy INITIAL_DATA as fallback
    const defaultState = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState(defaultState);
    return defaultState;
  }

  saveState(stateToSave = null) {
    try {
      const data = stateToSave || this.state;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  resetToDefaults() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState();
    this.emit("state_reset");
    this.emit("state_changed");
    return this.state;
  }

  // --- Pub/Sub Event System ---
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    };
  }

  emit(event, payload = null) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(cb => {
        try {
          cb(payload, this.state);
        } catch (err) {
          console.error(`Error in subscriber for event ${event}:`, err);
        }
      });
    }
    // Notify catch-all subscribers
    if (event !== "state_changed" && this.subscribers["*"]) {
      this.subscribers["*"].forEach(cb => {
        try {
          cb(event, payload, this.state);
        } catch (err) {
          console.error(`Error in catch-all subscriber for ${event}:`, err);
        }
      });
    }
  }

  // --- Current Context & Role ---
  getCurrentRole() {
    return this.state.currentUser.role; // "student" or "club_admin"
  }

  getCurrentUser() {
    const student = this.state.students.find(s => s.id === this.state.currentUser.id);
    return student || this.state.students[0];
  }

  getActiveClub() {
    const clubId = this.state.currentUser.activeClubId || "club_codelab";
    const club = this.state.clubs.find(c => c.id === clubId);
    return club || this.state.clubs[0];
  }

  setRole(role, clubId = null) {
    if (role !== "student" && role !== "club_admin") return;
    this.state.currentUser.role = role;
    if (clubId) {
      this.state.currentUser.activeClubId = clubId;
    }
    this.saveState();
    this.emit("role_changed", { role, activeClubId: this.state.currentUser.activeClubId });
    this.emit("state_changed");
  }

  setActiveClub(clubId) {
    const exists = this.state.clubs.find(c => c.id === clubId);
    if (exists) {
      this.state.currentUser.activeClubId = clubId;
      this.saveState();
      this.emit("active_club_changed", exists);
      this.emit("state_changed");
    }
  }

  // --- Student Profile Operations ---
  updateStudentProfile(studentId, updatedFields) {
    const studentIndex = this.state.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return false;

    this.state.students[studentIndex] = {
      ...this.state.students[studentIndex],
      ...updatedFields
    };

    // Also update any references if name or avatar changed
    if (updatedFields.name || updatedFields.avatar) {
      const name = updatedFields.name || this.state.students[studentIndex].name;
      const avatar = updatedFields.avatar || this.state.students[studentIndex].avatar;

      // Update in posts
      this.state.posts.forEach(p => {
        if (p.authorId === studentId) {
          if (updatedFields.name) p.authorName = name;
          if (updatedFields.avatar) p.authorAvatar = avatar;
        }
        // Update in comments
        if (p.comments) {
          p.comments.forEach(c => {
            if (c.authorId === studentId) {
              if (updatedFields.name) c.authorName = name;
              if (updatedFields.avatar) c.authorAvatar = avatar;
            }
          });
        }
      });

      // Update in applications
      this.state.applications.forEach(a => {
        if (a.studentId === studentId) {
          if (updatedFields.name) a.studentName = name;
          if (updatedFields.avatar) a.studentAvatar = avatar;
        }
      });
    }

    this.saveState();
    this.emit("profile_updated", this.state.students[studentIndex]);
    this.emit("state_changed");
    return true;
  }

  // --- Social Feed Operations ---
  getPosts(filter = "all") {
    let posts = [...this.state.posts];
    if (filter === "students") {
      posts = posts.filter(p => p.authorType === "student");
    } else if (filter === "clubs") {
      posts = posts.filter(p => p.authorType === "club");
    } else if (filter === "projects") {
      posts = posts.filter(p => p.type === "project");
    } else if (filter === "announcements") {
      posts = posts.filter(p => p.type === "announcement" || p.type === "recruitment");
    }
    // Sort descending by date
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  addPost({ type = "general", title = "", content = "", image = null, tags = [] }) {
    const role = this.getCurrentRole();
    let authorId, authorType, authorName, authorAvatar, authorBadge;

    if (role === "club_admin") {
      const club = this.getActiveClub();
      authorId = club.id;
      authorType = "club";
      authorName = club.name;
      authorAvatar = club.logo;
      authorBadge = `${club.category} Club`;
    } else {
      const student = this.getCurrentUser();
      authorId = student.id;
      authorType = "student";
      authorName = student.name;
      authorAvatar = student.avatar;
      authorBadge = `${student.course} • ${student.year}`;
    }

    const newPost = {
      id: "post_" + Date.now(),
      authorId,
      authorType,
      authorName,
      authorAvatar,
      authorBadge,
      createdAt: new Date().toISOString(),
      type,
      title: title.trim(),
      content: content.trim(),
      image: image || null,
      tags: tags || [],
      likes: [],
      bookmarks: [],
      comments: []
    };

    this.state.posts.unshift(newPost);
    this.saveState();
    this.emit("post_added", newPost);
    this.emit("state_changed");
    return newPost;
  }

  toggleLikePost(postId) {
    const post = this.state.posts.find(p => p.id === postId);
    if (!post) return null;

    const currentUserId = this.getCurrentRole() === "club_admin" 
      ? this.getActiveClub().id 
      : this.getCurrentUser().id;

    const index = post.likes.indexOf(currentUserId);
    let liked = false;
    if (index > -1) {
      post.likes.splice(index, 1);
      liked = false;
    } else {
      post.likes.push(currentUserId);
      liked = true;

      // Create notification for author if liked by someone else
      if (post.authorId !== currentUserId && post.authorType === "student") {
        this.addNotification({
          type: "post",
          title: "New Like on your post",
          message: `${this.getCurrentUser().name} liked "${post.title || post.content.slice(0, 30)}..."`,
          link: "#feed",
          icon: "heart",
          iconColor: "#EC4899"
        });
      }
    }

    this.saveState();
    this.emit("post_updated", post);
    this.emit("state_changed");
    return { liked, count: post.likes.length };
  }

  toggleBookmarkPost(postId) {
    const post = this.state.posts.find(p => p.id === postId);
    if (!post) return null;

    const currentUserId = this.getCurrentUser().id;
    if (!post.bookmarks) post.bookmarks = [];

    const index = post.bookmarks.indexOf(currentUserId);
    let bookmarked = false;
    if (index > -1) {
      post.bookmarks.splice(index, 1);
      bookmarked = false;
    } else {
      post.bookmarks.push(currentUserId);
      bookmarked = true;
    }

    this.saveState();
    this.emit("post_updated", post);
    this.emit("state_changed");
    return { bookmarked, count: post.bookmarks.length };
  }

  addComment(postId, content) {
    const post = this.state.posts.find(p => p.id === postId);
    if (!post || !content || !content.trim()) return null;

    const role = this.getCurrentRole();
    let authorId, authorName, authorAvatar;

    if (role === "club_admin") {
      const club = this.getActiveClub();
      authorId = club.id;
      authorName = club.name;
      authorAvatar = club.logo;
    } else {
      const student = this.getCurrentUser();
      authorId = student.id;
      authorName = student.name;
      authorAvatar = student.avatar;
    }

    const newComment = {
      id: "c_" + Date.now(),
      authorId,
      authorName,
      authorAvatar,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);

    this.saveState();
    this.emit("post_updated", post);
    this.emit("state_changed");
    return newComment;
  }

  deletePost(postId) {
    const post = this.state.posts.find(p => p.id === postId);
    if (!post) return false;

    // Verify ownership
    const currentId = this.getCurrentRole() === "club_admin" 
      ? this.getActiveClub().id 
      : this.getCurrentUser().id;

    if (post.authorId !== currentId) {
      console.warn("Unauthorized attempt to delete post");
      return false;
    }

    this.state.posts = this.state.posts.filter(p => p.id !== postId);
    this.saveState();
    this.emit("post_deleted", postId);
    this.emit("state_changed");
    return true;
  }

  // --- Recruitment & Application Operations ---
  hasStudentApplied(recruitmentId, studentId = null) {
    const sid = studentId || this.getCurrentUser().id;
    return this.state.applications.some(a => a.recruitmentId === recruitmentId && a.studentId === sid);
  }

  applyToRecruitment(recruitmentId, { motivation, skills, portfolioUrl, resumeFileName }) {
    const student = this.getCurrentUser();
    const recruitment = this.state.recruitments.find(r => r.id === recruitmentId);
    if (!recruitment) {
      return { success: false, message: "Recruitment opportunity not found." };
    }

    if (recruitment.status === "closed") {
      return { success: false, message: "This recruitment drive has closed." };
    }

    if (this.hasStudentApplied(recruitmentId, student.id)) {
      return { success: false, message: "You have already applied to this recruitment." };
    }

    const club = this.state.clubs.find(c => c.id === recruitment.clubId);

    const newApplication = {
      id: "app_" + Date.now(),
      recruitmentId,
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar,
      studentCourse: `${student.course} • ${student.year}`,
      clubId: recruitment.clubId,
      clubName: club ? club.name : "College Club",
      roleTitle: recruitment.title,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
      reviewedDate: null,
      motivation: motivation.trim(),
      skills: Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()).filter(Boolean),
      portfolioUrl: portfolioUrl || "",
      resumeFileName: resumeFileName || "Student_Portfolio_Resume.pdf",
      timeline: [
        {
          title: "Application Submitted",
          date: new Date().toISOString().split("T")[0],
          note: "Application submitted successfully."
        },
        {
          title: "Under Review",
          date: new Date().toISOString().split("T")[0],
          note: `Awaiting review by ${club ? club.name : "club"} representatives.`
        }
      ]
    };

    this.state.applications.unshift(newApplication);

    // Add notification for the student
    this.addNotification({
      type: "application",
      title: "Application Submitted",
      message: `Your application for ${recruitment.title} at ${club ? club.name : "the club"} has been recorded.`,
      link: "#applications",
      icon: "send",
      iconColor: "#3657D6"
    });

    this.saveState();
    this.emit("application_created", newApplication);
    this.emit("state_changed");
    return { success: true, application: newApplication };
  }

  updateApplicationStatus(applicationId, newStatus, note = "") {
    const app = this.state.applications.find(a => a.id === applicationId);
    if (!app) return { success: false, message: "Application not found" };

    if (newStatus !== "accepted" && newStatus !== "rejected") {
      return { success: false, message: "Invalid status value" };
    }

    app.status = newStatus;
    app.reviewedDate = new Date().toISOString().split("T")[0];

    const today = new Date().toISOString().split("T")[0];
    if (newStatus === "accepted") {
      app.timeline.push({
        title: "Application Accepted! 🎉",
        date: today,
        note: note || `Congratulations! You have been accepted into ${app.clubName}.`
      });

      // Cross-feature update 1: Add student to club's member list
      const club = this.state.clubs.find(c => c.id === app.clubId);
      if (club) {
        if (!club.members) club.members = [];
        const alreadyMember = club.members.some(m => m.studentId === app.studentId);
        if (!alreadyMember) {
          club.members.push({
            studentId: app.studentId,
            role: "Member",
            joinedDate: today
          });
          club.memberCount = (club.memberCount || club.members.length) + 1;
        }
      }

      // Cross-feature update 2: Add club to student's clubsJoined list
      const student = this.state.students.find(s => s.id === app.studentId);
      if (student) {
        if (!student.clubsJoined) student.clubsJoined = [];
        if (!student.clubsJoined.includes(app.clubId)) {
          student.clubsJoined.push(app.clubId);
        }
      }

      // Cross-feature update 3: Create notification for student
      this.addNotification({
        type: "application",
        title: "Application Accepted! 🎉",
        message: `Congratulations! Your application to ${app.clubName} for "${app.roleTitle}" was accepted.`,
        link: "#applications",
        icon: "check-circle",
        iconColor: "#10B981"
      });

    } else if (newStatus === "rejected") {
      app.timeline.push({
        title: "Application Status Updated",
        date: today,
        note: note || `Application not selected for this recruitment cohort.`
      });

      this.addNotification({
        type: "application",
        title: "Application Status Update",
        message: `Your application to ${app.clubName} for "${app.roleTitle}" was not selected.`,
        link: "#applications",
        icon: "x-circle",
        iconColor: "#EF4444"
      });
    }

    this.saveState();
    this.emit("application_updated", app);
    this.emit("state_changed");
    return { success: true, application: app };
  }

  addRecruitment(recruitmentData) {
    const club = this.getActiveClub();
    const newRec = {
      id: "rec_" + Date.now(),
      clubId: club.id,
      title: recruitmentData.title.trim(),
      role: recruitmentData.role ? recruitmentData.role.trim() : "Core Member",
      category: club.category,
      status: "open",
      deadline: recruitmentData.deadline,
      eligibility: recruitmentData.eligibility || "Open to all students",
      positions: parseInt(recruitmentData.positions, 10) || 2,
      description: recruitmentData.description.trim(),
      requiredSkills: Array.isArray(recruitmentData.requiredSkills) 
        ? recruitmentData.requiredSkills 
        : recruitmentData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
      responsibilities: recruitmentData.responsibilities || [
        "Collaborate on club projects and events",
        "Participate in weekly team syncs"
      ],
      createdAt: new Date().toISOString().split("T")[0]
    };

    this.state.recruitments.unshift(newRec);

    // Also post an announcement about recruitment in feed
    this.addPost({
      type: "recruitment",
      title: `Recruitment Alert: ${newRec.title} @ ${club.name}`,
      content: `${club.name} is hiring for ${newRec.title}!\n\n${newRec.description}\n\nDeadline: ${newRec.deadline}. Apply via the Recruitment tab!`,
      tags: ["Recruitment", club.category.replace(/\s+/g, ""), "Hiring"]
    });

    this.saveState();
    this.emit("recruitment_added", newRec);
    this.emit("state_changed");
    return newRec;
  }

  toggleRecruitmentStatus(recruitmentId) {
    const rec = this.state.recruitments.find(r => r.id === recruitmentId);
    if (!rec) return null;
    rec.status = rec.status === "open" ? "closed" : "open";
    this.saveState();
    this.emit("recruitment_updated", rec);
    this.emit("state_changed");
    return rec;
  }

  // --- Events Operations ---
  isRegisteredForEvent(eventId, studentId = null) {
    const sid = studentId || this.getCurrentUser().id;
    const event = this.state.events.find(e => e.id === eventId);
    return event && event.registeredStudentIds ? event.registeredStudentIds.includes(sid) : false;
  }

  toggleEventRegistration(eventId) {
    const event = this.state.events.find(e => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    const student = this.getCurrentUser();
    if (!event.registeredStudentIds) event.registeredStudentIds = [];

    const index = event.registeredStudentIds.indexOf(student.id);
    let registered = false;

    if (index > -1) {
      // Cancel registration
      event.registeredStudentIds.splice(index, 1);
      registered = false;
      this.addNotification({
        type: "event",
        title: "Registration Cancelled",
        message: `Your registration for "${event.title}" has been cancelled.`,
        link: "#events",
        icon: "calendar-x",
        iconColor: "#6B7280"
      });
    } else {
      // Check capacity
      if (event.registeredStudentIds.length >= event.capacity) {
        return { success: false, message: "Event has reached maximum capacity." };
      }
      event.registeredStudentIds.push(student.id);
      registered = true;
      this.addNotification({
        type: "event",
        title: "Event Registration Confirmed! 🎟️",
        message: `You are registered for "${event.title}" on ${event.date} at ${event.venue}.`,
        link: "#events",
        icon: "calendar-check",
        iconColor: "#10B981"
      });
    }

    this.saveState();
    this.emit("event_updated", event);
    this.emit("state_changed");
    return { success: true, registered, count: event.registeredStudentIds.length };
  }

  addEvent(eventData) {
    const club = this.getActiveClub();
    const newEvent = {
      id: "event_" + Date.now(),
      clubId: club.id,
      title: eventData.title.trim(),
      category: eventData.category || club.category,
      date: eventData.date,
      time: eventData.time || "04:30 PM",
      venue: eventData.venue.trim(),
      banner: eventData.banner || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
      organizerName: club.name,
      capacity: parseInt(eventData.capacity, 10) || 100,
      registeredStudentIds: [],
      deadline: eventData.deadline || eventData.date,
      description: eventData.description.trim(),
      tags: Array.isArray(eventData.tags) ? eventData.tags : (eventData.tags ? eventData.tags.split(",").map(t => t.trim()) : [club.category, "CampusEvent"])
    };

    this.state.events.unshift(newEvent);

    // Cross-post announcement to social feed
    this.addPost({
      type: "announcement",
      title: `Upcoming Event: ${newEvent.title}`,
      content: `${club.name} is hosting "${newEvent.title}" on ${newEvent.date} at ${newEvent.venue}.\n\n${newEvent.description}\n\nRegister via the Events tab now!`,
      image: newEvent.banner,
      tags: ["Event", club.category.replace(/\s+/g, ""), "CampusLife"]
    });

    this.saveState();
    this.emit("event_added", newEvent);
    this.emit("state_changed");
    return newEvent;
  }

  deleteEvent(eventId) {
    const event = this.state.events.find(e => e.id === eventId);
    if (!event) return false;

    this.state.events = this.state.events.filter(e => e.id !== eventId);
    this.saveState();
    this.emit("event_deleted", eventId);
    this.emit("state_changed");
    return true;
  }

  // --- Club Management Operations ---
  updateClubProfile(clubId, updatedData) {
    const club = this.state.clubs.find(c => c.id === clubId);
    if (!club) return false;

    Object.assign(club, updatedData);

    // Also update club name/logo in posts authored by this club
    if (updatedData.name || updatedData.logo) {
      this.state.posts.forEach(p => {
        if (p.authorId === clubId) {
          if (updatedData.name) p.authorName = updatedData.name;
          if (updatedData.logo) p.authorAvatar = updatedData.logo;
        }
      });
    }

    this.saveState();
    this.emit("club_updated", club);
    this.emit("state_changed");
    return true;
  }

  removeMemberFromClub(clubId, studentId) {
    const club = this.state.clubs.find(c => c.id === clubId);
    if (!club) return false;

    club.members = club.members.filter(m => m.studentId !== studentId);
    club.memberCount = club.members.length;

    // Remove from student's clubsJoined
    const student = this.state.students.find(s => s.id === studentId);
    if (student && student.clubsJoined) {
      student.clubsJoined = student.clubsJoined.filter(id => id !== clubId);
    }

    this.saveState();
    this.emit("club_updated", club);
    this.emit("state_changed");
    return true;
  }

  // --- Messaging Operations ---
  getConversation(clubId, studentId = null) {
    const sid = studentId || this.getCurrentUser().id;
    let conv = this.state.conversations.find(c => c.clubId === clubId && c.studentId === sid);
    if (!conv) {
      const club = this.state.clubs.find(c => c.id === clubId);
      const student = this.state.students.find(s => s.id === sid);
      if (!club || !student) return null;

      conv = {
        id: `conv_${clubId}_${sid}`,
        clubId,
        studentId: sid,
        clubName: club.name,
        clubAvatar: club.logo,
        studentName: student.name,
        studentAvatar: student.avatar,
        lastMessage: "Conversation started",
        lastMessageTime: new Date().toISOString(),
        unreadCountStudent: 0,
        unreadCountClub: 0,
        messages: []
      };
      this.state.conversations.push(conv);
      this.saveState();
    }
    return conv;
  }

  sendMessage(clubId, studentId, text, sender = "student") {
    if (!text || !text.trim()) return null;
    const conv = this.getConversation(clubId, studentId);
    if (!conv) return null;

    const newMsg = {
      id: "m_" + Date.now(),
      sender, // "student" or "club"
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    conv.messages.push(newMsg);
    conv.lastMessage = newMsg.text;
    conv.lastMessageTime = newMsg.timestamp;

    if (sender === "student") {
      conv.unreadCountClub = (conv.unreadCountClub || 0) + 1;
    } else {
      conv.unreadCountStudent = (conv.unreadCountStudent || 0) + 1;
      this.addNotification({
        type: "message",
        title: `Message from ${conv.clubName}`,
        message: newMsg.text.slice(0, 60),
        link: "#messages",
        icon: "message-square",
        iconColor: "#8B5CF6"
      });
    }

    this.saveState();
    this.emit("message_sent", { conversation: conv, message: newMsg });
    this.emit("state_changed");
    return newMsg;
  }

  markConversationRead(convId, readerRole = "student") {
    const conv = this.state.conversations.find(c => c.id === convId);
    if (!conv) return;

    if (readerRole === "student") {
      conv.unreadCountStudent = 0;
    } else {
      conv.unreadCountClub = 0;
    }
    this.saveState();
    this.emit("conversation_read", conv);
  }

  // --- Notifications Operations ---
  addNotification(notifData) {
    const newNotif = {
      id: "notif_" + Date.now(),
      type: notifData.type || "system",
      title: notifData.title,
      message: notifData.message,
      timestamp: new Date().toISOString(),
      read: false,
      link: notifData.link || "#notifications",
      icon: notifData.icon || "bell",
      iconColor: notifData.iconColor || "#3657D6"
    };

    if (!this.state.notifications) this.state.notifications = [];
    this.state.notifications.unshift(newNotif);
    this.saveState();
    this.emit("notification_added", newNotif);
    return newNotif;
  }

  markNotificationRead(notificationId) {
    const notif = this.state.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      this.saveState();
      this.emit("notification_updated", notif);
      this.emit("state_changed");
    }
  }

  markAllNotificationsRead() {
    if (this.state.notifications) {
      this.state.notifications.forEach(n => (n.read = true));
      this.saveState();
      this.emit("notifications_all_read");
      this.emit("state_changed");
    }
  }

  getUnreadNotificationsCount() {
    return (this.state.notifications || []).filter(n => !n.read).length;
  }

  getUnreadMessagesCount() {
    const role = this.getCurrentRole();
    if (role === "student") {
      const studentId = this.getCurrentUser().id;
      return (this.state.conversations || [])
        .filter(c => c.studentId === studentId)
        .reduce((sum, c) => sum + (c.unreadCountStudent || 0), 0);
    } else {
      const clubId = this.getActiveClub().id;
      return (this.state.conversations || [])
        .filter(c => c.clubId === clubId)
        .reduce((sum, c) => sum + (c.unreadCountClub || 0), 0);
    }
  }
}

// Global store singleton
const store = new Store();
