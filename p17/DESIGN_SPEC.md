# Varidhi — Design Specifications & Style Guide

This document preserves the official design tokens, UI/UX rules, and architectural standards for the Varidhi project. All pages strictly adhere to these rules.

---

## 1. Color Palette (Strictly Enforced)
- **Background Color (60%)**: `#D4DE95` (Soft Olive / Matcha)
- **Text & Brand Color (30%)**: `#000000` (Pure Black)
- **Button / Interactive Color (10%)**: `#3D4127` (Deep Forest Olive)
  - *Button text: `#D4DE95` for high-contrast legibility.*
- **Scrapbook / Card Palette**:
  - Deckled Mat White: `#FAF9F5`
  - Torn Kraft Paper Backing: `#383027`
  - Parchment Label Tag: `#F0EAD6`
  - Translucent Washi Tape: `rgba(238, 228, 208, 0.75)`
- **Footer Theme**: `#3D4127` with `#D4DE95` typography and border accents.

---

## 2. Typography Rules
- **Headings, Subheadings & Buttons**: `'Playfair Display', Georgia, serif`
  - Applied to all headings (H1, H2, H3), button text, card tags, step pills, and pricing displays across the entire website.
- **Body & Content Text**: `'Inter', sans-serif`
  - Applied to all regular content, descriptions, itinerary paragraphs, policy text, and guidelines.
- **Untouched Elements**:
  - **"Varidhi" Wordmark**: Custom vector SVG geometry (pure code in `#000000`).
  - **Poetic Tagline**: *“Choose the shore you adore — we’ll craft memories forevermore.”* (retains its original italicized Inter styling).

---

## 3. Directory of Pages
- **Homepage** (`index.html`): Top brand mark, hairline divider, poetic tagline, 3 step boxes, "Explore Islands" heading, 2-column scrapbook photo grid, minimalist footer.
- **Expedition Booking** (`booking.html`): Pure client-side dynamic reservation portal matching the Varidhi design system (Inter font throughout, `#D4DE95` background, zero white cards, dash-prefixed headings). Automatically preselects the destination island via URL parameter, calculates 15-day fixed-duration return dates from the user-selected boarding date without clutter or redundant labels, hides browser spin buttons on number inputs, dynamically generates fields for 5+ travellers (Name, Email, Age) with unified single-consent checkbox for Terms & Privacy at the bottom, computes real-time 25% advance and 75% arrival balance pricing under "— Advance Payment", features a clean "Pay Now [Amount]" button, executes an interactive simulated dummy QR payment workflow, and generates a downloadable executive PDF Booking Confirmation & Travel Voucher directly on the client side via **jsPDF** upon successful payment.
- **Mobile Payment Simulator** (`pay.html`): Simulated mobile payment interface reached via QR scan or direct link, displaying the exact payment amount, island reference, and interactive dummy payment execution.
- **About Us** (`about.html`): Clean minimal company overview without card containers or badges, dash-prefixed Playfair Display headings, concise profiles for founders **Devendra Singh Parihar** and **Amar Kumar Panika** (desktop view: horizontal side-by-side arrangement with 135px circular photos on the left and name + single-line designation to the right; mobile view: circular photos aligned exactly in the centre of the page with centered typography underneath; all frames with transparent outlines), detailed Varidhi responsibilities (Delhi airport takeover vs. personal independent activities), company headquarters in Indore, contact information (`concierge@varidhi.com`), and sticky top bar with left-pointing back arrow only.
- **Privacy Policy** (`privacy.html`): Dedicated legal compliance document structured with em-dash (`—`) subheadings and detailed explanatory paragraphs (strictly zero bullet points, zero white cards, zero section numbers, zero table-of-contents). Features the 5 designated topics: Privacy Policy and Data Protection (highlighting pure client-side frontend architecture with zero backend server storage or data harvesting), Data Control and User Information, Personal Safety, Liability and Maritime Safety Guidelines, and Force Majeure and Unforeseen Circumstances. Includes sticky top bar with left-pointing back arrow only.
- **Terms & Conditions** (`terms.html`): Comprehensive operational guidelines and terms of service structured with em-dash (`—`) subheadings and detailed explanatory paragraphs (strictly zero bullet points, zero white cards, zero section numbers, zero table-of-contents). Features the 6 designated topics: Booking Policies (15-day scope, 5+ group format, 25%/75% payment model), Refund and Cancellation Policy, Visa and Passport Requirements, Varidhi's Contribution and Responsibilities (Delhi airport takeover onwards), International Travel Guidelines, and Medical Requirements and Guidelines. Includes sticky top bar with left-pointing back arrow only.
- **Sitemap** (`sitemap.html`): Clean single-column vertical directory connecting all pages, island tours, and dedicated legal sections without card backgrounds, styled in dark black Inter typography with sticky top bar featuring only the left-pointing back arrow.
- **Policies Hub** (`policies.html`): Legal directory and overview connecting directly to dedicated `terms.html` and `privacy.html` documents with clean layout directly on background.
- **10 Curated Islands**:
  1. **Bora Bora** (`bora-bora.html`) – French Polynesia | ₹ 7,49,000 / person
  2. **Maldives** (`maldives.html`) – Baa Atoll Biosphere | ₹ 1,99,000 / person
  3. **Santorini** (`santorini.html`) – Cyclades, Greece | ₹ 3,79,000 / person
  4. **Bali & Nusa Islands** (`bali.html`) – Indonesia | ₹ 2,29,000 / person
  5. **Maui** (`maui.html`) – Hawaii, USA | ₹ 6,19,000 / person
  6. **Seychelles** (`seychelles.html`) – Mahé & Praslin | ₹ 3,69,000 / person
  7. **Galápagos Islands** (`galapagos.html`) – Ecuador | ₹ 5,39,000 / person
  8. **Capri & Ischia** (`capri.html`) – Bay of Naples, Italy | ₹ 3,99,000 / person
  9. **Palawan** (`palawan.html`) – El Nido & Coron, Philippines | ₹ 1,89,000 / person
  10. **Fiji** (`fiji.html`) – Mamanuca & Yasawa | ₹ 3,59,000 / person
  
  *Unified Page Architecture across all 10 Islands:*
  - **Sticky Top Bar**: Back arrow icon on left, rectangular "Book Now" button on right (flush above image corner).
  - **Hero Photograph Visual Treatment**: Signature scrapbook aesthetic identical to homepage cards (torn dark kraft backing `#383027`, rotated deckled white mat `#FAF9F5`, washi tape corners, and 16:10 aspect ratio).
  - **Typography & Content**: Inter font throughout, ₹ price per person, 2-line intro, and three single-word headings (**Adventure**, **Cuisine**, **Facts**) with small dash (`—`) bullet markers.
  - **Typography**: 100% Inter font family throughout the entire page.
  - **Content Flow**: Prominent Hero Photograph → Island Introduction (Name, Price alongside, Location, 2-line overview) → Single-word headings (**Adventure**, **Cuisine**, **Facts**) with short dash (`—`) bullet markers → Clean minimalist footer.

---

## 4. Legal Policies & International Regulations Directory (`policies.html`)
Comprehensive coverage specifically tailored to Varidhi's 15-day group island expedition model:
1. **Terms and Conditions**: Lead traveler contract authority, fixed 15-day scope, third-party luxury supplier terms.
2. **Privacy Policy**: GDPR compliance, biometric passport encryption, zero marketing resale, client data rights.
3. **Refund and Cancellation Policy**: Tiered cancellation schedule (60+ days, 30-59 days, <29 days) reflecting non-refundable luxury villa and private air/boat holds.
4. **Booking and Payment Policies**: 25% advance booking deposit locks pricing and triggers automated itinerary delivery; 75% balance settled on Day 1 island arrival; minimum group of 5 travelers constraint.
5. **International Travel Guidelines**: Luggage weight limits on seaplanes/catamarans (20-25kg), reef-safe sunscreen laws, drone bans in marine sanctuaries.
6. **Visa and Passport Requirements**: 6-month validity rule, Schengen requirements (Greece/Italy), US ESTA (Hawaii), Maldives 30-day on arrival, Galápagos TCT card & park fee, Seychelles & Fiji digital declarations.
7. **Travel Insurance and Medical Requirements**: Mandatory $100k emergency medical & aeromedical island evacuation insurance, PADI/SSI certifications, prescription protocols.
8. **Customer Responsibilities & Environmental Ethics**: Cultural respect (Fijian Kava, Balinese temples), strict marine conservation laws (no touching/riding wildlife), charter departure punctuality, group harmony.
9. **Liability and Safety Guidelines**: Inherent maritime/adventure risk disclosures, mandatory boat safety briefings, limited company liability, biometric in-room safe usage.
10. **Force Majeure and Unforeseen Circumstances**: Cyclones, tsunamis, volcanic eruptions (Batur, Haleakalā, Santorini), dynamic itinerary re-routing, 100% future credit voucher guarantee.

---

## 5. UI Component Specifications
- **Brand Typography ("Varidhi")**:
  - Recreated in pure vector code (`<svg>`) in pure black (`#000000`).
  - Top-centered with generous whitespace on the left, right, and top.
- **Horizontal Hairline Divider**:
  - Positioned directly underneath "Varidhi", pulled close to the text.
- **Poetic Tagline**:
  - Positioned underneath the hairline divider in italicized `'Inter'`.
- **3 Simple Process Step Boxes with Arrow Signs**:
  - `[ 1. Choose Island ] → [ 2. Book Now ] → [ 3. Enjoy your vacation ]`
  - Rectangular boxes styled in `#3D4127` with `#D4DE95` text.
- **"Explore islands" Heading**:
  - Positioned right below the 3 step boxes with a centered underline extending beyond the text. Formatted strictly in sentence case (`Explore islands` - only first letter capital, remainder in lowercase).
- **Scrapbook 2-Column Grid (Desktop) / 1-Column (Mobile)**:
  - Deckled torn-edge white paper frame, dark kraft backing paper, washi tape, and parchment label.
- **Footer**:
  - Clean, minimalist aesthetic centered in `#3D4127` with `#D4DE95` typography.
  - Contains only the four essential links in exact order (**Sitemap**, **About Us**, **Privacy Policy**, **Terms & Conditions**) and copyright line (**"Varidhi Incorporation Ltd."**), styled in `'Inter', sans-serif`.

---

## 6. Code Architecture Rules
- **Frontend-Only**: Pure HTML5, CSS3, and modern Vanilla JavaScript with zero backend dependencies.
- **No External CSS or JS Files**: Every page is an independent `.html` file with internal `<style>` and `<script>`.
- **Code Cleanliness & Documentation**: Thorough, educational comments throughout the codebase.
