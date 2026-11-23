/**
 * IIPS Connect - Utility Library
 * Core helper functions for escaping, formatting, toasts, modals, confirmation dialogs, and icons.
 */

const Utils = {
  /**
   * Escape HTML to safely render user-generated strings
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * Format ISO date string into human-friendly relative time (e.g. "2h ago")
   */
  timeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 30) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },

  /**
   * Format date into readable calendar format (e.g. "Oct 24, 2026")
   */
  formatDate(dateString, options = { month: "short", day: "numeric", year: "numeric" }) {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", options);
    } catch (e) {
      return dateString;
    }
  },

  /**
   * Split date into { month: "OCT", day: "24", year: "2026" } for calendar badges
   */
  getDateParts(dateString) {
    if (!dateString) return { month: "TBD", day: "--", year: "" };
    try {
      const date = new Date(dateString);
      return {
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: date.getDate(),
        year: date.getFullYear()
      };
    } catch (e) {
      return { month: "DATE", day: "??", year: "" };
    }
  },

  /**
   * Simple Debounce function for inputs
   */
  debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Toast notification system
   */
  showToast(message, type = "info", duration = 3600) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type} toast-enter`;

    const iconMap = {
      success: `<i data-lucide="check-circle" class="toast-icon"></i>`,
      error: `<i data-lucide="alert-circle" class="toast-icon"></i>`,
      warning: `<i data-lucide="alert-triangle" class="toast-icon"></i>`,
      info: `<i data-lucide="info" class="toast-icon"></i>`
    };

    toast.innerHTML = `
      <div class="toast-content">
        ${iconMap[type] || iconMap.info}
        <span class="toast-message">${this.escapeHtml(message)}</span>
      </div>
      <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);
    this.refreshIcons();

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.remove("toast-enter");
      toast.classList.add("toast-visible");
    });

    const closeToast = () => {
      toast.classList.remove("toast-visible");
      toast.classList.add("toast-leave");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    };

    const closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeToast);
    }

    if (duration > 0) {
      setTimeout(closeToast, duration);
    }
  },

  /**
   * Modal management
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    // Focus first interactive element in modal
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 50);
    }

    this.refreshIcons();
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");

    const anyActiveModal = document.querySelector(".modal.active");
    if (!anyActiveModal) {
      document.body.classList.remove("modal-open");
    }
  },

  closeAllModals() {
    document.querySelectorAll(".modal.active").forEach(m => {
      m.classList.remove("active");
      m.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("modal-open");
  },

  /**
   * Dynamic Confirmation Modal Dialog
   */
  showConfirmDialog({
    title = "Confirm Action",
    message = "Are you sure you want to proceed with this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmType = "primary", // "primary" or "danger"
    onConfirm = () => {}
  }) {
    let dialog = document.getElementById("generic-confirm-modal");
    if (!dialog) {
      dialog = document.createElement("div");
      dialog.id = "generic-confirm-modal";
      dialog.className = "modal";
      dialog.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-dialog modal-dialog-sm" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h3 class="modal-title" id="confirm-dialog-title"></h3>
            <button type="button" class="modal-close" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirm-dialog-msg" class="text-secondary"></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="confirm-dialog-cancel">Cancel</button>
            <button type="button" class="btn" id="confirm-dialog-action">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }

    const titleEl = dialog.querySelector("#confirm-dialog-title");
    const msgEl = dialog.querySelector("#confirm-dialog-msg");
    const confirmBtn = dialog.querySelector("#confirm-dialog-action");
    const cancelBtn = dialog.querySelector("#confirm-dialog-cancel");
    const closeBtn = dialog.querySelector(".modal-close");
    const backdrop = dialog.querySelector(".modal-backdrop");

    titleEl.textContent = title;
    msgEl.textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    // Reset classes
    confirmBtn.className = `btn btn-${confirmType === "danger" ? "danger" : "primary"}`;

    const cleanup = () => {
      dialog.classList.remove("active");
      document.body.classList.remove("modal-open");
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      closeBtn.onclick = null;
      backdrop.onclick = null;
    };

    confirmBtn.onclick = () => {
      cleanup();
      if (typeof onConfirm === "function") onConfirm();
    };

    cancelBtn.onclick = cleanup;
    closeBtn.onclick = cleanup;
    backdrop.onclick = cleanup;

    dialog.classList.add("active");
    document.body.classList.add("modal-open");
  },

  /**
   * Safe status badge HTML generator
   */
  renderStatusBadge(status) {
    const s = String(status || "").toLowerCase();
    let badgeClass = "badge-neutral";
    let label = status;

    if (s === "accepted" || s === "open") {
      badgeClass = "badge-success";
      label = s === "open" ? "Open" : "Accepted";
    } else if (s === "pending") {
      badgeClass = "badge-warning";
      label = "Under Review";
    } else if (s === "rejected" || s === "closed") {
      badgeClass = "badge-danger";
      label = s === "closed" ? "Closed" : "Not Selected";
    }

    return `<span class="badge ${badgeClass}">${this.escapeHtml(label)}</span>`;
  },

  /**
   * Safely render Lucide icons with fallback
   */
  refreshIcons() {
    try {
      if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
        lucide.createIcons();
      }
    } catch (e) {
      console.warn("Lucide icons refresh skipped:", e);
    }
  },

  /**
   * Generates a realistic fallback avatar with initials if image fails
   */
  getInitials(name) {
    if (!name) return "II";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
};
