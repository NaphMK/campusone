# 03 — Design System

**Name:** CampusOne UI ("Evergreen Campus"), sharing its base tokens with AdmitPro so the two products feel like one suite
**Built on:** Bootstrap 5.3 (Sass) · Bootstrap Icons · Alpine.js · Blade components
**Principles:** Know-where-you-are · Numbers you can trust · Role clarity · Fast on registration day · Print-ready

---

## 1. Principles
1. **Every portal looks related but distinct.** The same base with a role accent colour, so staff with multiple windows open never confuse the Department and Faculty dashboards.
2. **Money and units are always visible.** On registration, the running totals (units, courses, amount) stay pinned on screen.
3. **Rules explain themselves.** A disabled course always says *why* (prerequisite, level, capacity, units).
4. **Stages are visual.** Registration, result sheets and transfers show a stepper or timeline with who acted and when.
5. **Printable by default.** Course forms, receipts, statements and broadsheets are designed for A4 grayscale.

## 2. Colour

### 2.1 Brand (shared with AdmitPro)
| Token | Hex | Use |
|---|---|---|
| `--cp-green-50` | `#ECFDF3` | success/selected backgrounds |
| `--cp-green-100` | `#D1FADF` | hover tints |
| `--cp-green-500` | `#12B76A` | charts, icons on dark |
| **`--cp-green-600`** | **`#0E8A4F`** | **Primary** actions, links (4.6:1 on white) |
| `--cp-green-700` | `#0B6E3F` | hover/pressed |
| `--cp-green-800` | `#08532F` | student sidebar/header |
| `--cp-green-900` | `#053B22` | print headers |

### 2.2 Portal accent colours
Each portal sets `--cp-portal` and `--cp-portal-soft` on `<body data-portal="…">`. They are used for the sidebar, the top-bar underline and the login hero.

| Portal | Accent | Soft | Sidebar bg |
|---|---|---|---|
| Student | `#0E8A4F` green | `#ECFDF3` | `#08532F` |
| Lecturer | `#0E7490` teal | `#ECFEFF` | `#164E63` |
| Department | `#4F46E5` indigo | `#EEF2FF` | `#312E81` |
| Faculty | `#9333EA` purple | `#FAF5FF` | `#581C87` |
| Admin / Registry | `#1E3A5F` navy | `#EFF4FA` | `#0F2742` |
| Bursary (within Admin) | `#B45309` amber-brown badge only | `#FFFBEB` | — |

### 2.3 Semantic
| Role | Hex | Soft |
|---|---|---|
| Info | `#0E7490` | `#ECFEFF` |
| Warning | `#D97706` | `#FFFBEB` |
| Danger | `#DC2626` | `#FEF2F2` |
| Gold (honours, First Class) | `#D4A017` | `#FEF7E0` |

### 2.4 Neutrals
`gray-25 #FCFCFD` (bg) · `gray-50 #F9FAFB` · `gray-100 #F2F4F7` · `gray-200 #EAECF0` (borders) · `gray-300 #D0D5DD` · `gray-500 #667085` · `gray-700 #344054` (body) · `gray-900 #101828` (headings)

### 2.5 Sass mapping
```scss
$primary: #0E8A4F; $info: #0E7490; $warning: #D97706; $danger: #DC2626;
$success: #12B76A; $secondary: #667085; $dark: #101828; $light: #F9FAFB;
$theme-colors: map-merge($theme-colors, ("gold": #D4A017, "indigo": #4F46E5, "purple": #9333EA, "navy": #1E3A5F, "teal": #0E7490));
$body-bg: #FCFCFD; $body-color: #344054; $border-color: #EAECF0;
$border-radius: .625rem; $enable-shadows: true;
```
```scss
body[data-portal="lecturer"]   { --cp-portal:#0E7490; --cp-portal-soft:#ECFEFF; --cp-sidebar:#164E63; }
body[data-portal="department"] { --cp-portal:#4F46E5; --cp-portal-soft:#EEF2FF; --cp-sidebar:#312E81; }
/* … */
```
Institution branding can override `$primary` at runtime (validated for AA contrast).

## 3. Typography
| Role | Font | Weight | Size |
|---|---|---|---|
| Page title | Plus Jakarta Sans | 700 | 26 px (22 mobile) |
| Section | Plus Jakarta Sans | 600 | 20 px |
| Card title | Plus Jakarta Sans | 600 | 17 px |
| Body | Inter | 400 | 15 px / 1.6 |
| Table | Inter (tabular numbers `font-variant-numeric: tabular-nums`) | 400/500 | 14 px |
| Codes (course codes, matric no, invoice no) | JetBrains Mono / ui-monospace | 500 | 14 px |

Fonts are self-hosted via `@fontsource`. PDFs use **DejaVu Sans** (supports ₦).

## 4. Spacing, radius, elevation
Bootstrap spacer 1rem; card radius 10 px; button radius 8 px; shadows `xs/sm/lg` as in AdmitPro; focus ring `0 0 0 4px rgba(var(--cp-portal-rgb), .2)`.

## 5. Iconography (Bootstrap Icons)
| Concept | Icon | Concept | Icon |
|---|---|---|---|
| Dashboard | `bi-speedometer2` | Course registration | `bi-journal-check` |
| Courses | `bi-journal-bookmark` | Curriculum | `bi-diagram-3` |
| Prerequisite | `bi-link-45deg` | Carry-over | `bi-arrow-repeat` |
| Credit units | `bi-stack` | Fees / invoices | `bi-receipt-cutoff` |
| Payments | `bi-credit-card-2-front` | Course form | `bi-file-earmark-person` |
| Results | `bi-clipboard-data` | GPA/CGPA | `bi-graph-up-arrow` |
| Transfer | `bi-arrow-left-right` | Students | `bi-people` |
| Lecturers | `bi-person-workspace` | Faculty | `bi-bank` |
| Department | `bi-building` | Session/semester | `bi-calendar3` |
| Window open/closed | `bi-door-open` / `bi-door-closed` | Approvals | `bi-check2-circle` |
| Returned | `bi-reply` | Print | `bi-printer` |
| Audit | `bi-shield-lock` | Settings | `bi-gear` |

## 6. Status badges (single source: enum `badge()` methods)

**Registration**
| Status | Label | Style | Icon |
|---|---|---|---|
| draft | Not submitted | gray | `bi-pencil` |
| submitted | Awaiting approval | info | `bi-hourglass-split` |
| returned | Returned — action needed | warning | `bi-reply` |
| approved | Approved | success | `bi-check2-circle` |
| amending | Add/drop pending | indigo | `bi-arrow-left-right` |
| cancelled | Cancelled | gray-500 | `bi-x-circle` |

**Payment:** Unpaid (danger soft) · Part-paid (warning) · Paid (success solid) · Credit (teal).

**Result sheet:** Draft (gray) · Submitted (info) · HOD approved (indigo) · Faculty approved (purple) · Senate approved (navy) · Published (success) · Returned (warning) · Amendment (gold).

**Transfer:** Draft · Submitted · In review (stage name) · Approved · Effected · Rejected · Withdrawn.

**Course chips in registration:** `C` compulsory (green outline) · `R` required (teal outline) · `E` elective (gray outline) · `CO` carry-over (danger solid) · `W` waived prerequisite (gold).

**Grades:** A (green) · B (teal) · C (indigo) · D (amber) · E (orange) · F (red) · ABS/INC (gray).

**Academic standing:** Good (success) · Probation (warning) · Withdrawal (danger).

## 7. Layouts
- **Login pages (`layouts.auth`)**: split screen. The left panel uses the portal accent with the crest, the portal name ("Lecturer Portal") and three bullet benefits. The right panel is a card form. A footer links to the other portals ("Are you a student? Log in here").
- **Student (`layouts.student`)**: top navbar and mobile bottom tabs (Home, Register, Finance, Results, More). Content max 1140 px.
- **Staff portals (`layouts.staff`)**: left sidebar 264 px in the portal sidebar colour, collapsible; the top bar has breadcrumb, scope badge ("Faculty of Physical Sciences" / "Dept. of Computer Science"), session switcher, search, notifications and user menu.
- **Print (`layouts.print`)**: A4, 15 mm margins, crest header, QR footer.

Sidebar menus per portal:
| Portal | Menu groups |
|---|---|
| Lecturer | Dashboard · My Courses · Score Entry · Advisees · Profile |
| Department | Dashboard · Students · Lecturers · Courses · Curriculum · Allocations · Registrations · Course Forms · Results · Waivers & Overloads · Reports |
| Faculty | Dashboard · Departments & Logins · Students · Lecturers · Courses · Registrations · Results (Faculty Board) · Transfers · Reports |
| Admin | Dashboard · Sessions & Calendar · Faculties · Departments · Programmes · Courses · Registration Windows · Fees & Pricing · Invoices & Payments · Results (Senate) · Transfers · Users & Roles · Announcements · Reports · Audit · Modules · Settings |

## 8. Components
| Component | Purpose |
|---|---|
| `<x-portal-login portal>` | Branded login card |
| `<x-scope-badge>` | Shows the staff member's faculty/department scope |
| `<x-page-header>`, `<x-card>`, `<x-stat-card>` | Layout primitives |
| `<x-status-badge :enum>` | Any enum with a `badge()` method |
| `<x-data-table>` + `<x-filter-drawer>` | Lists with filters, bulk bar, export |
| `<x-form.*>` | input, select, dependent select (faculty → department → programme), money (₦ ↔ kobo), file, date |
| `<x-registration.course-row :course :state>` | Checkbox, code, title, units, C/R/E/CO chip, price, lock/disabled reason tooltip |
| `<x-registration.summary-bar>` | Sticky totals: courses, units (min–max meter), amount, submit button |
| `<x-registration.elective-browser>` | Offcanvas: faculty and department filters, search, add buttons |
| `<x-rule-alert type="prerequisite">` | Inline explanation with a link to the prerequisite course |
| `<x-invoice-table :invoice>` | Itemised lines, subtotal, adjustments, paid, balance |
| `<x-approval-stepper :stages>` | Horizontal chain with actor, date, comment |
| `<x-score-grid>` | Spreadsheet-like grid (Alpine) with keyboard navigation, auto grade preview, validation colours |
| `<x-gpa-card :semester>` | GPA, CGPA, TNU, TCP, standing |
| `<x-timeline>`, `<x-empty-state>`, `<x-confirm-modal reason-required>` | Shared |

## 9. Key screens
1. **Student dashboard**: a registration card (window open with countdown / submitted / approved / closed), fees-due card with Pay button, CGPA card with sparkline, announcements, quick actions (Print course form, View results).
2. **Course registration**: header (session, semester, level, window closes in…); tabs *Semester courses* · *Carry-overs* · *Electives*. Course rows grouped by status. Sticky summary bar shows units against the min/max meter (green in range, amber near max, red over) and the ₦ total. The **Elective browser** offcanvas has Faculty and Department selects plus search. Submit opens a review modal with an itemised price preview.
3. **Finance**: accordion by session → semester, listing invoices (status, amount, balance) and payments (date, reference, channel) with receipt and invoice PDF buttons.
4. **Results**: semester selector, results table (code, title, units, grade, GP), GPA card and CGPA trend chart, standing badge, "Print statement".
5. **Department registrations queue**: filters (level, programme, status, paid), row actions Approve/Return/Print form; bulk approve.
6. **Score entry**: class list grid (matric, name, CA, exam, total, grade), CSV upload/download template, Save draft, Submit (with confirmation of summary stats).
7. **Result approval (HOD/Faculty/Senate)**: list of sheets with stats (count, pass %, grade distribution mini-bar), open a sheet to see the grid read-only, then Approve/Return.
8. **Transfer**: student wizard (eligibility check result → choose target → uploads → pay → submit), then an approver view with the approval stepper.

## 10. Content & formats
Dates `26 Sep 2026`; money `₦45,500.00`; units `18 units`; GPA two decimals `3.47`; course codes `CSC 201` (space). Use plain, directive language: "Add CSC 201 first. CSC 301 requires a pass in it."

## 11. Accessibility
Labels on all inputs; the score grid is keyboard-first and screen-reader-labelled per cell (`aria-label="CA score for U26/FPS/CSC/0042"`); colour never the only signal; focus visible; 44 px tap targets; tables have captions.

## 12. Asset budget
`app.css` ≤ 50 KB gz; `app.js` ≤ 55 KB gz; Chart.js lazy-loaded on dashboards only; fonts ≤ 120 KB.
