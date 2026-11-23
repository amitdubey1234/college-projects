<p align="center">
  <img src="assets/images/logo-full.png" alt="IIPS Connect Logo" width="240">
</p>

# IIPS Connect — Official College Community Platform
**International Institute of Professional Studies (IIPS), Devi Ahilya Vishwavidyalaya (DAVV), Indore, India**

![IIPS Connect Banner](https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80)

---

## 1. Project Overview

**IIPS Connect** is an exclusive, collegiate social network designed for the students and official clubs of the **International Institute of Professional Studies (IIPS), DAVV Indore** (Takshashila Campus, Khandwa Road).

It bridges the gap between students across MCA, M.Tech, MBA (MS / TA / APR), BCA, and B.Com batches and verified campus organizations (Tech, Entrepreneurship, Cultural, Visual Arts, Sports, and Design).

### Core Philosophy & Rules
- **Institutional Focus:** Exclusively tailored for IIPS DAVV Indore students and faculty-backed clubs.
- **Strictly Non-Commercial:** No paid tutoring, no session bookings, and no skill marketplace.
- **Direct Student-to-Club Communication:** Messaging is strictly between students and official club representatives.
- **Verified Membership Lifecycle:** Students submit structured applications to open club recruitment drives. Club membership is granted exclusively upon formal acceptance by club administrators.
- **Zero Backend Required:** 100% frontend implementation using browser `localStorage` for reactive persistence across page refreshes.

---

## 2. Technology Stack

- **Markup:** Semantic HTML5 with accessible ARIA landmarks.
- **Styling:** Modern CSS3 featuring Custom Properties (Design Tokens), Flexbox, CSS Grid, and responsive breakpoints.
- **Typography:** [Inter](https://fonts.google.com/specimen/Inter) and [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via Google Fonts.
- **Icons:** [Lucide Icons](https://lucide.dev/) for crisp, consistent UI glyphs.
- **Application Logic:** Vanilla JavaScript (ES6+) with a centralized Pub/Sub state store and client-side hash router.
- **Persistence:** Browser `localStorage` with factory reset fallback.

---

## 3. Directory & File Structure

```
labproject/
├── index.html                   # Semantic HTML5 app shell & global modal dialogs
├── README.md                    # Comprehensive documentation and testing guide
├── css/
│   ├── variables.css            # Color tokens, warm off-white & dark themes, radii, shadows
│   ├── base.css                 # CSS reset, typography, buttons, badges, avatars, inputs
│   ├── layout.css               # 3-column social network layout, sticky header, sidebars
│   ├── components.css           # Cards (posts, students, clubs, events, recruitments), timeline
│   ├── views.css                # View-specific styles (chat, admin dashboard, profiles)
│   └── responsive.css           # Responsive breakpoints, slide-out drawer, mobile bottom bar
├── js/
│   ├── data.js                  # Initial authentic demo dataset (students, clubs, posts, events)
│   ├── state.js                 # Central reactive Store with localStorage synchronization
│   ├── utils.js                 # HTML escaping, relative timeago, toast alerts, confirm dialogs
│   ├── components.js            # Reusable HTML template generators
│   ├── router.js                # Hash router with query parameter parsing and widget updates
│   ├── app.js                   # Application bootstrap, global search autocomplete, modals
│   ├── test-suite.js            # Automated verification test suite (48 tests passing)
│   └── views/
│       ├── feedView.js          # Campus social feed, post composer, real comments & likes
│       ├── studentsView.js      # Discover students with live search, filters, profile modals
│       ├── clubsView.js         # Club directory & detailed club pages (About, Events, Roster)
│       ├── eventsView.js        # Campus events, capacity progress bars, attendee rosters
│       ├── recruitmentView.js   # Open hiring drives, application modal with duplicate checks
│       ├── applicationsView.js  # "My Applications" tracking with 3-step visual timeline
│       ├── messagesView.js      # Student-to-club messenger with simulated representative replies
│       ├── notificationsView.js # Notifications activity center with unread counter
│       ├── profileView.js       # Complete student portfolio & interactive Edit Profile modal
│       ├── adminViews.js        # Club Admin Dashboard, application review, member rosters
│       └── settingsView.js      # Persona switcher, theme toggle (light/dark), factory reset
└── assets/                      # Optional static image assets
```

---

## 4. Key Features & Experiences

### A. Student Experience
1. **Interactive Campus Feed:**
   - Post composer with categories (*General Update*, *Project Showcase*, *Achievement*, *Announcement*).
   - Real-time like counter toggle, bookmarking, and instant comment submission.
   - Author-only post deletion with confirmation modal.
   - Category filtering (*All*, *Students*, *Clubs*, *Projects*, *Announcements*).
2. **Student Directory & Portfolio Showcases:**
   - Search by student name, skills (e.g., *React*, *Python*, *Figma*), or enrollment.
   - Filter by course (*MCA*, *M.Tech IT*, *MBA*, *BCA*, *B.Com*) and academic year.
   - Detailed modal preview showcasing student bio, projects with external links, achievements, certificates, and affiliated clubs.
3. **Official Club Exploration:**
   - Categorized directories (*Technology*, *Entrepreneurship*, *Cultural*, *Photography*, *Design*, *Sports*).
   - Detailed club profile pages featuring tabs for *About*, *Announcements*, *Recruitment Drives*, *Campus Events*, and *Verified Member Rosters*.
4. **Recruitment & Application Tracking:**
   - Application modal pre-filling student academic details, requesting statement of purpose, skills, portfolio links, and resume PDF selection.
   - **Duplicate Prevention:** Prevents applying multiple times to the same role.
   - **My Applications Timeline:** 3-step visual tracker (`Submitted` → `Under Review` → `Accepted` or `Not Selected`).
5. **Campus Events & Capacity Management:**
   - Discover workshops, hackathons, and sports fixtures with editorial date blocks.
   - One-click registration and cancellation with real-time capacity progress bars.
6. **Direct Student-to-Club Chat:**
   - Dedicated communication channel strictly between students and official clubs.
   - Quick prompt question chips (*"When will recruitment results be announced?"*, *"Where do you hold weekly meetings?"*).
   - Instant message persistence + realistic simulated reply from the club representative after 1.4 seconds.
7. **Profile Management:**
   - Complete personal profile displaying projects, skills chips, certificates, and published posts.
   - Interactive **Edit Profile** modal to modify headline, bio, skills, and links with immediate local persistence.

---

### B. Club Admin Experience
1. **Club Executive Dashboard:**
   - 4 live metric cards: *Active Members*, *Pending Applications*, *Open Recruitments*, and *Scheduled Events*.
   - Quick Action buttons: *Host Campus Event*, *New Recruitment Drive*, *Post Announcement*, and *Review Applicants*.
   - Quick table of pending student submissions with direct **Accept** and **Reject** buttons.
2. **Application Review System:**
   - Filter applicant submissions by *All*, *Pending*, *Accepted*, and *Not Selected*.
   - Review applicant motivation statements, declared skills, portfolio URLs, and attached resumes.
   - Consequential action confirmation dialogs.
3. **Cross-Feature State Synchronization (Critical Consistency):**
   - **When an application is accepted:**
     1. Application status flips to `accepted`.
     2. The student is automatically enrolled into the club's official member roster.
     3. The club's total member count increments across all views.
     4. The club is automatically appended to the student's `clubsJoined` profile list.
     5. A personalized congratulatory notification is generated for the student.
4. **Member Roster Management:**
   - Verified student table with courses, roles, and join dates.
   - Member removal with confirmation dialog.
5. **Event Scheduling & Attendee Rosters:**
   - Create new events with titles, venues, dates, capacities, and banner image previews.
   - Automatic cross-posting of event announcements to the main campus feed.
   - Inspect list of registered student attendees.
6. **Recruitment Drive Management:**
   - Launch new recruitment drives with required skills, deadlines, and eligibility criteria.
   - Close or reopen existing drives with a single click.

---

## 5. How to Run Locally

Because IIPS Connect is built with standard web technologies without external build tools, you can run it using any static server or open it directly in a browser:

### Option 1: Python HTTP Server (Recommended)
Open a terminal in the project directory:
```bash
cd /Users/mac/Desktop/labproject
python3 -m http.server 8000
```
Then visit **`http://localhost:8000`** in your browser.

### Option 2: VS Code Live Server
1. Open the project folder in VS Code.
2. Right-click on `index.html` and click **"Open with Live Server"**.

### Option 3: Direct File Opening
Double-click `index.html` in your file manager to open it directly in Chrome, Safari, Edge, or Firefox.

---

## 6. Testing Guide for Both Demo Personas

IIPS Connect includes an instant **Demo Role Switcher** located in the top navigation bar and in the Settings tab.

### Scenario 1: Test Student Actions (Persona: Aarav Sharma)
1. **Publish a Post:**
   - Click the **"Share a project..."** box on the Home feed or the **"Create"** button in the top navigation bar.
   - Select *Project Showcase*, add a title, write a description, and click **Publish Post**.
   - Notice the post appears instantly at the top of the feed and in the student's profile.
2. **Apply to a Club Recruitment Drive:**
   - Navigate to **Recruitment Drives** in the left sidebar.
   - Find an open drive (e.g. *Corporate Sponsorship & Relations Associate* at E-Cell IIPS).
   - Click **Apply Now**, fill out the motivation statement, and submit.
   - Notice that the button updates to **Applied**, duplicate submission is prevented, and the application appears under **My Applications** with the status `Under Review`.
3. **Register for an Event:**
   - Navigate to **Campus Events**.
   - Click **Register for Event** on *IIPS HackSprint 2026*.
   - Notice the registered count increments, progress bar fills, a confirmation toast appears, and a notification is recorded.
4. **Send a Message to a Club:**
   - Navigate to **Chat** / **Messages**.
   - Select **IIPS CodeLab** from the conversation list.
   - Click a quick question chip or type a message and press Enter.
   - Observe your message appear on the right, followed by a typing indicator and an automated reply from the club representative after 1.4 seconds.

---

### Scenario 2: Test Club Admin Review Actions (Persona: Club Admin)
1. **Switch to Club Admin Mode:**
   - Click the role pill in the top navigation bar (or go to **Settings** → **Platform Settings**) and select **Demo Club Admin (IIPS CodeLab / E-Cell IIPS)**.
   - Notice that navigation automatically updates to show admin tools (*Dashboard*, *Review Applications*, *Manage Members*, *Club Events*, *Recruitment Drives*).
2. **Review & Accept Student Applications:**
   - Click **Review Applications** in the sidebar.
   - Locate the student application you submitted in Scenario 1 (or existing pending candidates like *Devendra Rathore*).
   - Click **Accept as Member** and confirm the dialog.
   - Notice the status changes to `Accepted`, the student is added to the official member list, and the club member count increments.
3. **Host a New Campus Event:**
   - Click **Club Events** → **Host New Event**.
   - Enter event details (*Title, Venue, Date, Capacity*) and submit.
   - Observe the event appear in the calendar and see the announcement cross-posted to the social feed.
4. **Switch Back to Student Persona:**
   - Switch back to **Demo Student** persona.
   - Open **My Applications** and see the application status updated to `Accepted` with a green checkmark!
   - Open **Notifications** to see the acceptance alert!
   - Open **My Profile** to see the new club listed under **Clubs Affiliation**!

---

### Scenario 3: Theme Toggle & Reset Demo Data
1. Navigate to **Settings**.
2. Click **Deep Obsidian (Dark)** to toggle into dark mode.
3. Click **Restore Default Demo Data** to clear all test changes and restore the initial pristine IIPS DAVV demo records.

---

## 7. Automated Test Suite

A comprehensive automated test suite has been implemented in [`js/test-suite.js`](file:///Users/mac/Desktop/labproject/js/test-suite.js) to verify all state transitions and consistency rules:

```bash
node js/test-suite.js
```

### Verification Coverage (48 Automated Tests Passing):
- **State Initialization:** Minimum 8 students, 5 clubs, 8 posts, 5 recruitments, 5 events.
- **Role Switching:** Seamless transitions between Student and Club Admin personas.
- **Profile Updates:** Profile mutations synchronize across authored posts and applications.
- **Social Feed:** Post creation, like/unlike counters, comment additions, bookmarking, and deletion.
- **Campus Events:** Registration toggles, capacity limit enforcement, cancellation, and cross-feed announcements.
- **Recruitment Lifecycle:** Submission, **strict duplicate prevention**, club admin acceptance, automatic roster enrollment, and student notification generation.
- **Club Messaging:** Student-to-club conversation history, unread counters, and reply persistence.
- **Demo Factory Reset:** Restores clean default records from `localStorage`.

---

## 8. Note on Prototype Architecture

This project is a high-fidelity frontend prototype. Browser `localStorage` is used to persist demo interactions across refreshes. In a future production phase, the state management layer in [`js/state.js`](file:///Users/mac/Desktop/labproject/js/state.js) can be connected to real REST or GraphQL APIs with zero modifications to the UI view layer.
