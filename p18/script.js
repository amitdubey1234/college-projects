let currentUser = JSON.parse(localStorage.getItem("zippyrideUser")) || null;
    let toastTimer;
    let lastCreatedBooking = null;

    const vehicleCards = [...document.querySelectorAll(".vehicle-card")];
    const filterButtons = [...document.querySelectorAll(".filter-chip")];
    const resultsCount = document.getElementById("resultsCount");
    const noResults = document.getElementById("noResults");
    const destinationInput = document.getElementById("destinationInput");
    const serviceSelect = document.getElementById("serviceSelect");

    const bookingDialog = document.getElementById("bookingDialog");
    const closeBookingModalBtn = document.getElementById("closeBookingModalBtn");
    const authDialog = document.getElementById("authDialog");
    const authModalBtn = document.getElementById("authModalBtn");
    const closeAuthModalBtn = document.getElementById("closeAuthModalBtn");

    const sideDrawer = document.getElementById("sideDrawer");
    const drawerPanel = document.getElementById("drawerPanel");
    const menuToggle = document.getElementById("menuToggle");
    const closeDrawer = document.getElementById("closeDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");

    document.getElementById("year").textContent = new Date().getFullYear();

    function showToast(message) {
      const toast = document.getElementById("toast");
      document.getElementById("toastMsg").textContent = message;
      toast.classList.remove("opacity-0", "pointer-events-none", "translate-y-3");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.add("opacity-0", "pointer-events-none", "translate-y-3");
      }, 3500);
    }

    function openMenuDrawer() {
      sideDrawer.classList.remove("opacity-0", "pointer-events-none");
      drawerPanel.classList.remove("-translate-x-full");
    }
    function closeMenuDrawer() {
      sideDrawer.classList.add("opacity-0", "pointer-events-none");
      drawerPanel.classList.add("-translate-x-full");
    }

    menuToggle.addEventListener("click", openMenuDrawer);
    closeDrawer.addEventListener("click", closeMenuDrawer);
    drawerOverlay.addEventListener("click", closeMenuDrawer);
    document.querySelectorAll(".drawer-link").forEach(link => {
      link.addEventListener("click", closeMenuDrawer);
    });

    document.querySelectorAll(".city-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const city = btn.dataset.city;
        destinationInput.value = city;
        applyFilters();
        document.getElementById("vehicles").scrollIntoView({ behavior: "smooth" });
      });
    });

    let activeFilter = "all";

    function applyFilters() {
      const destination = destinationInput.value.trim().toLowerCase();
      let visible = 0;

      vehicleCards.forEach(card => {
        const categoryMatch = activeFilter === "all" || card.dataset.category === activeFilter;
        const destinationMatch = !destination || 
          card.dataset.destination.includes(destination) || 
          card.dataset.search.includes(destination);

        const show = categoryMatch && destinationMatch;
        card.classList.toggle("hidden", !show);
        if (show) visible++;
      });

      resultsCount.textContent = `${visible} option${visible === 1 ? "" : "s"}`;
      noResults.classList.toggle("hidden", visible !== 0);
    }

    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        filterButtons.forEach(item => {
          item.classList.remove("active", "bg-ink", "text-white");
          item.classList.add("bg-white", "text-muted");
        });
        button.classList.add("active", "bg-ink", "text-white");
        button.classList.remove("bg-white", "text-muted");
        activeFilter = button.dataset.filter;
        applyFilters();
      });
    });

    document.getElementById("searchButton").addEventListener("click", () => {
      const service = serviceSelect.value;
      if (service === "driver" || service === "guide") {
        const label = service === "driver" ? "Verified EV Driver" : "Local Tour Guide";
        openBookingModal({
          service: label,
          name: label,
          price: service === "driver" ? 1500 : 1200,
          advance: 300,
          security: 0
        });
        return;
      }
      activeFilter = "all";
      filterButtons.forEach(b => {
        b.classList.remove("active", "bg-ink", "text-white");
        b.classList.add("bg-white", "text-muted");
      });
      filterButtons[0].classList.add("active", "bg-ink", "text-white");
      applyFilters();
      document.getElementById("vehicles").scrollIntoView({ behavior: "smooth" });
    });

    function openBookingModal(data) {
      document.getElementById("bookingStep1").classList.remove("hidden");
      document.getElementById("bookingStep2").classList.add("hidden");
      document.getElementById("bookingSuccess").classList.add("hidden");

      document.getElementById("selectedService").value = data.service || "Electric Vehicle";
      document.getElementById("selectedBasePrice").value = data.price || 1599;
      document.getElementById("selectedAdvanceFee").value = data.advance || 300;
      document.getElementById("selectedSecurityFee").value = data.security || 2000;

      document.getElementById("displayServiceName").textContent = data.name || "Electric Vehicle";
      document.getElementById("displayDailyRate").textContent = `₹${data.price || 1599} / day`;
      document.getElementById("customerDestination").value = destinationInput.value.trim();

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      document.getElementById("pickupDate").value = today.toISOString().split("T")[0];
      document.getElementById("dropDate").value = tomorrow.toISOString().split("T")[0];

      if (currentUser) {
        document.getElementById("customerName").value = currentUser.name || "";
        document.getElementById("customerPhone").value = currentUser.phone || "";
      }

      if (typeof bookingDialog.showModal === "function") {
        bookingDialog.showModal();
      }
    }

    function closeBookingModal() {
      if (bookingDialog.open) bookingDialog.close();
    }

    document.querySelectorAll(".book-vehicle").forEach(btn => {
      btn.addEventListener("click", () => {
        openBookingModal({
          service: `EV: ${btn.dataset.name}`,
          name: btn.dataset.name,
          price: parseInt(btn.dataset.price),
          advance: parseInt(btn.dataset.advance),
          security: parseInt(btn.dataset.security)
        });
      });
    });

    document.querySelectorAll(".request-service").forEach(btn => {
      btn.addEventListener("click", () => {
        openBookingModal({
          service: btn.dataset.service,
          name: btn.dataset.name,
          price: parseInt(btn.dataset.price),
          advance: parseInt(btn.dataset.advance),
          security: parseInt(btn.dataset.security)
        });
      });
    });

    closeBookingModalBtn.addEventListener("click", closeBookingModal);

    bookingDialog.addEventListener("click", (e) => {
      const rect = bookingDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) closeBookingModal();
    });

    document.getElementById("bookingFormStep1").addEventListener("submit", (e) => {
      e.preventDefault();
      
      const price = parseInt(document.getElementById("selectedBasePrice").value);
      const advance = parseInt(document.getElementById("selectedAdvanceFee").value);
      const security = parseInt(document.getElementById("selectedSecurityFee").value);

      document.getElementById("calcRentalFee").textContent = `₹${price}`;
      document.getElementById("calcSecurityDeposit").textContent = `₹${security}`;
      document.getElementById("calcTokenAdvance").textContent = `₹${advance}`;
      document.getElementById("calcTotalAdvancePayable").textContent = `₹${advance}`;

      document.getElementById("bookingStep1").classList.add("hidden");
      document.getElementById("bookingStep2").classList.remove("hidden");
    });

    document.getElementById("backToStep1").addEventListener("click", () => {
      document.getElementById("bookingStep2").classList.add("hidden");
      document.getElementById("bookingStep1").classList.remove("hidden");
    });

    document.getElementById("bookingFormStep2").addEventListener("submit", (e) => {
      e.preventDefault();

      const method = document.querySelector('input[name="paymentMethod"]:checked').value;
      lastCreatedBooking = {
        id: "ZR-EV-" + Math.floor(100000 + Math.random() * 900000),
        service: document.getElementById("displayServiceName").textContent,
        customerName: document.getElementById("customerName").value,
        phone: document.getElementById("customerPhone").value,
        destination: document.getElementById("customerDestination").value,
        pickupDate: document.getElementById("pickupDate").value + " at " + document.getElementById("pickupTime").value,
        dropDate: document.getElementById("dropDate").value + " at " + document.getElementById("dropTime").value,
        advancePaid: document.getElementById("calcTotalAdvancePayable").textContent,
        securityDeposit: document.getElementById("calcSecurityDeposit").textContent,
        paymentMethod: method,
        timestamp: new Date().toLocaleString()
      };

      const bookings = JSON.parse(localStorage.getItem("zippyrideBookings") || "[]");
      bookings.push(lastCreatedBooking);
      localStorage.setItem("zippyrideBookings", JSON.stringify(bookings));

      document.getElementById("summaryReceiptBox").innerHTML = `
        <div><strong>Booking Ref:</strong> ${lastCreatedBooking.id}</div>
        <div><strong>EV Model:</strong> ${lastCreatedBooking.service}</div>
        <div><strong>Customer:</strong> ${lastCreatedBooking.customerName} (${lastCreatedBooking.phone})</div>
        <div><strong>Destination:</strong> ${lastCreatedBooking.destination}</div>
        <div><strong>Dates:</strong> ${lastCreatedBooking.pickupDate} to ${lastCreatedBooking.dropDate}</div>
        <div><strong>Token Advance Paid:</strong> <span class="text-limeDark font-bold">${lastCreatedBooking.advancePaid}</span> via ${lastCreatedBooking.paymentMethod}</div>
        <div><strong>Refundable Security:</strong> ${lastCreatedBooking.securityDeposit} (At Hub)</div>
      `;

      document.getElementById("bookingStep2").classList.add("hidden");
      document.getElementById("bookingSuccess").classList.remove("hidden");
      showToast("Token Advance Paid Successfully! Ready for download.");
    });

    // DOWNLOAD TOKEN RECEIPT FEATURE (Requested Feature)
    document.getElementById("downloadReceiptBtn").addEventListener("click", () => {
      if (!lastCreatedBooking) return;
      const receiptContent = `========================================
ZIPPYRIDE ELECTRIC MOBILITY — TOKEN RECEIPT
========================================
Booking Reference ID : ${lastCreatedBooking.id}
Vehicle / Service    : ${lastCreatedBooking.service}
Customer Name        : ${lastCreatedBooking.customerName}
Phone Number         : ${lastCreatedBooking.phone}
Destination City     : ${lastCreatedBooking.destination}
Pickup Date & Time   : ${lastCreatedBooking.pickupDate}
Drop-off Date & Time : ${lastCreatedBooking.dropDate}
Token Advance Paid   : ${lastCreatedBooking.advancePaid} (${lastCreatedBooking.paymentMethod})
Security Deposit     : ${lastCreatedBooking.securityDeposit} (Payable at pickup hub)
Booking Timestamp    : ${lastCreatedBooking.timestamp}
----------------------------------------
Status               : CONFIRMED & PAID
Support Hotline      : +91 98765 43210
HQ Address           : MG Road, Vijay Nagar, Indore
========================================`;

      const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ZippyRide_Token_Receipt_${lastCreatedBooking.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Token receipt downloaded successfully as .txt file!");
    });

    document.getElementById("finishBookingBtn").addEventListener("click", closeBookingModal);

    document.querySelectorAll(".faq-toggle").forEach(button => {
      button.addEventListener("click", () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector("i");
        const isOpen = answer.classList.contains("open");

        document.querySelectorAll(".faq-answer").forEach(ans => ans.classList.remove("open"));
        document.querySelectorAll(".faq-toggle i").forEach(i => i.classList.remove("rotate-180"));

        if (!isOpen) {
          answer.classList.add("open");
          icon.classList.add("rotate-180");
        }
      });
    });

    document.getElementById("contactForm").addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thank you! Your inquiry has been sent to our EV support team.");
      e.target.reset();
    });

    function updateNavUserStatus() {
      if (currentUser) {
        document.getElementById("navUserStatus").textContent = currentUser.name.split(" ")[0];
      } else {
        document.getElementById("navUserStatus").textContent = "Login";
      }
    }

    function renderUserProfile() {
      if (!currentUser) return;
      document.getElementById("userAvatarChar").textContent = currentUser.name.charAt(0).toUpperCase();
      document.getElementById("userNameDisplay").textContent = currentUser.name;
      document.getElementById("userEmailDisplay").textContent = currentUser.email || currentUser.phone;

      const bookings = JSON.parse(localStorage.getItem("zippyrideBookings") || "[]");
      const listContainer = document.getElementById("userBookingsList");

      if (bookings.length === 0) {
        listContainer.innerHTML = `<p class="text-muted text-center py-3">No EV bookings found.</p>`;
      } else {
        listContainer.innerHTML = bookings.map(b => `
          <div class="bg-paper p-3 rounded-xl border border-lineColor flex justify-between items-center">
            <div>
              <strong class="block text-ink font-bold text-xs">${b.service} (${b.id})</strong>
              <span class="text-[10px] text-muted block">${b.pickupDate}</span>
            </div>
            <span class="bg-limeAccent text-ink font-bold text-[10px] px-2 py-0.5 rounded-md">${b.advancePaid}</span>
          </div>
        `).join("");
      }
    }

    authModalBtn.addEventListener("click", () => {
      if (currentUser) {
        document.getElementById("authFormsContainer").classList.add("hidden");
        document.getElementById("userProfileContainer").classList.remove("hidden");
        renderUserProfile();
      } else {
        document.getElementById("authFormsContainer").classList.remove("hidden");
        document.getElementById("userProfileContainer").classList.add("hidden");
      }
      authDialog.showModal();
    });

    closeAuthModalBtn.addEventListener("click", () => authDialog.close());

    authDialog.addEventListener("click", (e) => {
      const rect = authDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) authDialog.close();
    });

    document.getElementById("tabLogin").addEventListener("click", () => {
      document.getElementById("tabLogin").classList.add("border-ink", "text-ink");
      document.getElementById("tabLogin").classList.remove("border-transparent", "text-muted");
      document.getElementById("tabSignup").classList.remove("border-ink", "text-ink");
      document.getElementById("tabSignup").classList.add("border-transparent", "text-muted");
      document.getElementById("loginForm").classList.remove("hidden");
      document.getElementById("signupForm").classList.add("hidden");
    });

    document.getElementById("tabSignup").addEventListener("click", () => {
      document.getElementById("tabSignup").classList.add("border-ink", "text-ink");
      document.getElementById("tabSignup").classList.remove("border-transparent", "text-muted");
      document.getElementById("tabLogin").classList.remove("border-ink", "text-ink");
      document.getElementById("tabLogin").classList.add("border-transparent", "text-muted");
      document.getElementById("signupForm").classList.remove("hidden");
      document.getElementById("loginForm").classList.add("hidden");
    });

    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      currentUser = {
        name: "Priya Sharma",
        email: document.getElementById("loginEmail").value,
        phone: "+91 9876543210"
      };
      localStorage.setItem("zippyrideUser", JSON.stringify(currentUser));
      updateNavUserStatus();
      authDialog.close();
      showToast("Logged in as " + currentUser.name);
    });

    document.getElementById("signupForm").addEventListener("submit", (e) => {
      e.preventDefault();
      currentUser = {
        name: document.getElementById("signupName").value,
        phone: document.getElementById("signupPhone").value,
        email: document.getElementById("signupEmail").value
      };
      localStorage.setItem("zippyrideUser", JSON.stringify(currentUser));
      updateNavUserStatus();
      authDialog.close();
      showToast("EV account created successfully!");
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      currentUser = null;
      localStorage.removeItem("zippyrideUser");
      updateNavUserStatus();
      authDialog.close();
      showToast("Logged out successfully.");
    });

    updateNavUserStatus();
