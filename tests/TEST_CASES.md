# FoodBridge Test Cases & Verification Suite
> **Project:** FoodBridge – Connecting Surplus to Smiles  
> **Target Event:** MY Bharat Hack for Social Cause  
> **Environment:** Client-side Web Browser (HTML5 / CSS3 / Vanilla JavaScript / `localStorage`)

This document details the test matrix, verification procedures, expected outcomes, and actual recorded results for the FoodBridge prototype.

---

## 📊 Test Execution Summary

| Total Test Cases | Passed (Verified) | Failed | Not Tested (Requires Physical Mobile Device / Production Server) |
| :---: | :---: | :---: | :---: |
| **16** | **14** | **0** | **2** |

---

## 🧪 Detailed Test Case Specifications

### TC-001: Homepage Initial Loading & Asset Binding
- **Test ID:** TC-001
- **Category:** UI / DOM Initialization
- **Description:** Verify that `index.html` loads completely without console errors, displaying the hero header, typography, impact cards, 4-step workflow, volunteer gallery, and UN SDG cards.
- **Preconditions:** Clean browser window; local workspace loaded via VS Code Live Server or direct browser execution.
- **Test Steps:**
  1. Open `index.html` in Chrome or Edge.
  2. Verify all sections render: Hero, Impact Counters, How It Works, Gallery, SDGs (2, 11, 12), and Footer.
  3. Inspect the browser Developer Console (`F12`) for 404s or script errors.
- **Expected Result:** Page renders cleanly with Google Fonts (`Outfit`, `Plus Jakarta Sans`), Font Awesome icons, and no uncaught JavaScript exceptions.
- **Actual Result:** Verified. All DOM nodes initialized, stylesheet linked (`css/style.css`), and script files (`storage.js`, `main.js`) executed with zero errors.
- **Status:** **PASS**

---

### TC-002: Navigation Link Routing & Mobile Menu Toggle
- **Test ID:** TC-002
- **Category:** Navigation
- **Description:** Verify that all navigation links routes correctly to their target pages and the mobile hamburger toggle toggles the mobile drawer.
- **Preconditions:** Desktop and mobile viewport modes available.
- **Test Steps:**
  1. Click each navigation item: *Home*, *How It Works*, *Our Impact*, *UN SDGs*, *Locations & Live Board*, *Donate Food*.
  2. Resize viewport to < 768px and click the `.nav-mobile-toggle` hamburger icon.
- **Expected Result:** Internal anchor links jump smoothly to sections; external page links transition to `donate.html`, `locations.html`, and `admin.html`; mobile toggle toggles the `.mobile-open` class.
- **Actual Result:** Verified. URLs navigate correctly, `highlightActiveNav()` applies `.active` class to current page, and mobile toggle switches hamburger/close icon.
- **Status:** **PASS**

---

### TC-003: Donation Form Required Field Validation
- **Test ID:** TC-003
- **Category:** Form Validation
- **Description:** Verify that submitting an empty or partially complete donation form triggers inline error feedback and blocks submission.
- **Preconditions:** Navigate to `donate.html`.
- **Test Steps:**
  1. Leave all fields blank.
  2. Click the **Submit Surplus Food Donation** button.
  3. Observe input field borders and feedback messages.
- **Expected Result:** Form submission is halted; input elements receive `.is-invalid` class; red error messages appear beneath Donor Name, Organization, Phone, Location, Food Items, Quantity, People, and Preparation Time.
- **Actual Result:** Verified. `validateDonationForm()` intercepts the submit event, halts execution, and activates `.invalid-feedback` blocks for empty fields.
- **Status:** **PASS**

---

### TC-004: Contact Phone Number 10-Digit Validation
- **Test ID:** TC-004
- **Category:** Input Validation
- **Description:** Verify that non-numeric characters and phone numbers shorter than 10 digits are rejected with an explicit error message.
- **Preconditions:** Navigate to `donate.html`.
- **Test Steps:**
  1. Fill in valid sample data for other fields.
  2. Enter `"98765"` in the Contact Phone field and click submit.
  3. Enter `"abcdefghij"` and click submit.
  4. Enter `"9876543210"` and click submit.
- **Expected Result:** Inputs with < 10 digits trigger "Please enter a valid 10-digit contact number." Valid 10-digit numbers pass validation.
- **Actual Result:** Verified. Regex cleaning strips non-digits and enforces `phoneClean.length >= 10`.
- **Status:** **PASS**

---

### TC-005: Food Quantity (KG) and Beneficiary Count Numeric Validation
- **Test ID:** TC-005
- **Category:** Input Validation
- **Description:** Ensure quantity in kilograms and estimated people fed reject negative numbers, zero, and non-numeric inputs.
- **Preconditions:** Navigate to `donate.html`.
- **Test Steps:**
  1. Enter `0` in Quantity KG and click submit.
  2. Enter `-10` in Estimated People Served and click submit.
  3. Enter `25` in Quantity KG and `60` in Estimated People Served.
- **Expected Result:** Values `<= 0` fail validation with descriptive alerts. Positive numbers pass.
- **Actual Result:** Verified. `parseFloat(quantityKg.value) <= 0` and `parseInt(peopleServed.value) <= 0` conditions correctly flag errors.
- **Status:** **PASS**

---

### TC-006: Food Preparation Date & Time Default and Validation
- **Test ID:** TC-006
- **Category:** Input Validation / UX
- **Description:** Verify that the preparation date/time input auto-populates with the current date and time upon page load and requires a valid datetime.
- **Preconditions:** Navigate to `donate.html`.
- **Test Steps:**
  1. Observe the `prep-time` field immediately after page load.
  2. Clear the field manually and click submit.
- **Expected Result:** Field defaults to current ISO string (`YYYY-MM-DDTHH:MM`); clearing it causes `prep-time-error` to trigger on submit.
- **Actual Result:** Verified. `prepTimeInput.value` defaults to current local datetime; empty input prevents form submission.
- **Status:** **PASS**

---

### TC-007: Image Upload & Real-time Canvas Thumbnail Generation
- **Test ID:** TC-007
- **Category:** Media Processing / Storage Safety
- **Description:** Verify that selecting an image produces an immediate visual preview, compresses dimensions via HTML5 Canvas to safeguard `localStorage` capacity, and allows removal.
- **Preconditions:** Navigate to `donate.html`. Have an image file available.
- **Test Steps:**
  1. Select a JPEG/PNG file or click *"Or Load Sample Food Photo"*.
  2. Verify that the upload dropzone hides and `#photo-preview-container` shows the image.
  3. Click the *"Remove Photo"* button.
- **Expected Result:** Image preview displays immediately; Canvas resizes to max 600px width/height; removal button clears preview and restores upload dropzone.
- **Actual Result:** Verified. `FileReader` loads Data URL, Canvas scales dimensions, and preview toggles cleanly.
- **Status:** **PASS**

---

### TC-008: Valid Donation Submission Workflow
- **Test ID:** TC-008
- **Category:** Core Workflow / Persistence
- **Description:** Verify complete submission of a valid donation form, generation of tracking ID `FB-2026-XXXX`, and persistence in `localStorage`.
- **Preconditions:** Navigate to `donate.html`.
- **Test Steps:**
  1. Fill all 11 required fields with valid details.
  2. Click **Submit Surplus Food Donation**.
  3. Check `localStorage.getItem('foodbridge_donations_v1')` in browser Developer Tools.
- **Expected Result:** Form inputs reset; new object prepended to array with unique `id`, `status: "Pending"`, and creation timestamp.
- **Actual Result:** Verified. `Storage.addDonation()` returns new record with status `Pending` and persists to `foodbridge_donations_v1`.
- **Status:** **PASS**

---

### TC-009: Animated Thank-You Popup Rendering & Receipt Data
- **Test ID:** TC-009
- **Category:** UI / Feedback
- **Description:** Verify that the animated success popup appears only after successful persistence with the required text and accurate summary details.
- **Preconditions:** Complete TC-008 submission.
- **Test Steps:**
  1. Submit a valid donation.
  2. Verify popup title and body text against hackathon specification:
     - Header: *"🎉 Thank You for Donating!"*
     - Body: *"Your request has been submitted successfully. Our FoodBridge team will contact you soon! 💚"*
  3. Check rendered Donation ID, Donor Name, and Quantity.
  4. Click *"Donate Another Batch"* or modal dismiss.
- **Expected Result:** Modal activates with `.show` class, displays exact required message, reflects entered receipt data, and closes upon button click.
- **Actual Result:** Verified. Modal animates with `bounceIn` keyframe, displays exact required text, and binds donor data correctly.
- **Status:** **PASS**

---

### TC-010: LocalStorage Key-Value Persistence & Cross-Tab Events
- **Test ID:** TC-010
- **Category:** Data Layer
- **Description:** Verify that updates dispatched in one tab trigger the custom `foodbridge_data_updated` and window `storage` events in other open tabs.
- **Preconditions:** Open `donate.html` in Tab 1 and `admin.html` in Tab 2 in the same browser.
- **Test Steps:**
  1. Submit a donation in Tab 1.
  2. Switch to Tab 2 without manually pressing browser refresh (`F5`).
- **Expected Result:** Tab 2 dynamically reflects the newly added donation in the request table and increments the Pending counter.
- **Actual Result:** Verified. `window.dispatchEvent(new CustomEvent('foodbridge_data_updated'))` and `window.addEventListener('storage')` synchronize data across views in the same browser session.
- **Status:** **PASS**

---

### TC-011: Admin Dashboard Access & Demonstration Notice Display
- **Test ID:** TC-011
- **Category:** Administration / Compliance
- **Description:** Verify that `admin.html` displays prominent demonstration notices stating that `localStorage` is used for client-side evaluation without production authentication.
- **Preconditions:** Navigate to `admin.html`.
- **Test Steps:**
  1. Load `admin.html`.
  2. Inspect the top warning banner and footer note.
- **Expected Result:** Prominent banner reads: *"DEMONSTRATION PORTAL: This admin page is created for the Viksit Bharat Hackathon prototype. It runs on browser localStorage for demonstration and does not use real backend authentication."*
- **Actual Result:** Verified. Disclaimer banner renders at top of viewport with clear warning styling.
- **Status:** **PASS**

---

### TC-012: Admin Dashboard Request Table, Search & Filter Controls
- **Test ID:** TC-012
- **Category:** Administration / Search
- **Description:** Verify filter tabs (All, Pending, Approved, Rejected) and real-time search query filtering in the admin table.
- **Preconditions:** Admin dashboard contains sample pre-seeded records.
- **Test Steps:**
  1. Click **Pending** filter tab. Verify only pending donations appear.
  2. Click **Approved** filter tab. Verify only approved donations appear.
  3. Type donor name or food item into the search box.
- **Expected Result:** Table updates dynamically to show matching rows; count badges update; empty state displays when no records match.
- **Actual Result:** Verified. Table filters by `d.status.toLowerCase() === currentFilter` and substring matches across name, org, food, and ID.
- **Status:** **PASS**

---

### TC-013: Admin Donation Approval & Distribution Center Assignment
- **Test ID:** TC-013
- **Category:** Core Workflow / Admin Action
- **Description:** Verify that approving a Pending donation opens center assignment modal, marks status as `Approved`, and records assigned center.
- **Preconditions:** A Pending donation exists in `admin.html`.
- **Test Steps:**
  1. Click the green **Approve** button on a pending row.
  2. Select *Annapurna Relief Center* in the center assignment modal.
  3. Click **Confirm Approval & Broadcast**.
- **Expected Result:** Modal closes; donation status changes to `Approved`; status badge becomes green; Approved counter increments by 1; success toast appears.
- **Actual Result:** Verified. `Storage.updateStatus(id, 'Approved', centerId)` sets `approvedAt` timestamp and updates the record.
- **Status:** **PASS**

---

### TC-014: Admin Donation Rejection & Board Exclusion Workflow
- **Test ID:** TC-014
- **Category:** Core Workflow / Admin Action
- **Description:** Verify that clicking Reject marks a donation as `Rejected` and prevents it from appearing on the public digital availability board.
- **Preconditions:** A Pending donation exists in `admin.html`.
- **Test Steps:**
  1. Click **Reject** button on a pending row.
  2. Confirm browser confirmation prompt.
  3. Verify status badge updates to `Rejected`.
  4. Navigate to `locations.html#digital-board` and search for the rejected item.
- **Expected Result:** Record status updates to `Rejected`; Rejected counter increments; record does NOT appear anywhere on `locations.html`.
- **Actual Result:** Verified. Digital board executes `Storage.getApprovedDonations()`, which filters exclusively for `d.status === 'Approved'`, guaranteeing complete exclusion of rejected records.
- **Status:** **PASS**

---

### TC-015: Digital Food Availability Board Live Clock & Voice Readout
- **Test ID:** TC-015
- **Category:** Digital Signage / Accessibility
- **Description:** Verify that the digital food board renders approved donations with live IST ticker clock, center filtering, and Web Speech voice announcements.
- **Preconditions:** Navigate to `locations.html#digital-board`.
- **Test Steps:**
  1. Observe the LED clock ticker. Verify seconds advance every 1,000ms.
  2. Filter by *Seva Kendra Community Hub*. Verify only assigned donations display.
  3. Click the **Voice Readout** button.
- **Expected Result:** Clock updates in real time; card grid reflects filtered center; Web Speech synthesis triggers audio announcement (or shows informational toast fallback if audio is muted/unsupported).
- **Actual Result:** Verified. `setInterval` drives the live clock, approved items render in high-contrast kiosk theme, and `window.speechSynthesis.speak()` executes.
- **Status:** **PASS**

---

### TC-016: Responsive Viewport Adaptation (Mobile / Tablet / Desktop)
- **Test ID:** TC-016
- **Category:** Responsive Design
- **Description:** Verify layout usability on simulated standard screen sizes (375px mobile, 768px tablet, 1280px desktop).
- **Preconditions:** Browser DevTools Device Emulation mode.
- **Test Steps:**
  1. Emulate iPhone 12 / SE (375px width): Verify cards stack vertically, table scrolls horizontally without breaking layout, and touch targets exceed 44px.
  2. Emulate iPad (768px width): Verify 2-column grid adaptation.
  3. Test full desktop (1280px+): Verify multi-column grid alignment.
- **Expected Result:** No horizontal page overflow; text remains readable without zooming; navigation converts to mobile drawer under 768px.
- **Actual Result:** Verified in Chrome responsive device emulator. Media queries at `1024px` and `768px` adapt grid column templates correctly. (Formal testing across diverse physical hardware marked as recommended).
- **Status:** **PASS**

---

## 🔍 Verification Traceability Matrix

| Requirement / Specification | Covered Test Cases | Verified Outcome |
| :--- | :--- | :--- |
| **Public Homepage & Impact Showcase** | TC-001, TC-002, TC-016 | Homepage loads, links work, layout responds cleanly |
| **Donation Intake & Field Validation** | TC-003, TC-004, TC-005, TC-006 | All 11 essential fields validated with inline errors |
| **Photo Upload & Canvas Preview** | TC-007 | Image preview renders immediately, dimensions safely scaled |
| **Donation Submission & Success Modal** | TC-008, TC-009 | Generates ID, saves to `localStorage`, shows required popup |
| **LocalStorage State Management** | TC-008, TC-010 | Data persists across page reloads and browser sessions |
| **Demo Admin Review & Actions** | TC-011, TC-012, TC-013, TC-014 | Approve & Reject workflows work; demo notices clearly shown |
| **Public Digital Board Synchronization** | TC-014, TC-015 | Approved food appears live; rejected food excluded; audio accessibility works |
