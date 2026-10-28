# 04 — Epics & User Stories (Functional + Technical)

**Product:** CampusOne · **Version:** 1.0 · **Last updated:** 26 September 2026
**Structure:** 14 Epics · 67 Stories. Each has a user story, real-world scenario (per epic), acceptance criteria and technical specification. Names match `05-ARCHITECTURE.md`.

---

## 0. Conventions

**Story format:** ID `S{epic}.{n}` · Priority · Points (Fibonacci) · Depends on · Story · Acceptance criteria · Technical spec.

**Definition of Ready:** clear AC; dependencies merged or mocked; UI referenced in `03-DESIGN-SYSTEM.md`; data changes described.

**Definition of Done:**
1. PR reviewed and merged.
2. Pint, PHPStan L6 and Pest all green.
3. Every AC is covered by a test.
4. Policies and org scope are applied, with a scope-leak test for any staff list/detail.
5. No N+1 queries.
6. Migrations are reversible.
7. Sensitive writes are audit-logged.
8. Strings live in lang files.
9. Checked at 360 px and 1440 px.
10. Docs and CHANGELOG updated.

**Personas**
- *Aisha Musa*: 200L B.Sc. Computer Science (Faculty of Physical Sciences), failed MTH 101 at 100L.
- *Ibrahim Yusuf*: 400L (final year) B.Sc. Microbiology, needs 12 units to graduate.
- *Fatima Sani*: 200L B.Agric, CGPA 3.10, wants to transfer to B.Sc. Biochemistry (Faculty of Life Sciences).
- *Dr. Ngozi Eze*: Lecturer, Computer Science; coordinator of CSC 201; course adviser for 200L.
- *Prof. Adeyemi*: HOD Computer Science (Department Admin, role `hod`). *Mr. Danladi*: departmental exam officer.
- *Prof. Bello*: Dean, Faculty of Physical Sciences (Faculty Admin).
- *Mrs. Okafor*: Bursary officer. *Tunde*: Registry/ICT Super Admin.

---

## Epic summary

| # | Epic | Stories | Points | Milestone |
|---|---|---|---|---|
| E1 | Platform Foundation & Modular Architecture | 5 | 26 | M0 |
| E2 | Portals, Authentication & Hierarchical Access | 6 | 27 | M1 |
| E3 | Academic Structure & Curriculum | 5 | 24 | M1 |
| E4 | Student Records & Lifecycle | 4 | 22 | M1 |
| E5 | Lecturers, Offerings & Allocation | 4 | 13 | M1 |
| E6 | Course Registration Engine | 7 | 41 | M2 |
| E7 | Course Pricing, Fee Items & Invoicing | 4 | 24 | M3 |
| E8 | Payments & Student Finance | 4 | 23 | M3 |
| E9 | Course Form & Document Verification | 3 | 10 | M3 |
| E10 | Results Processing & GPA | 7 | 40 | M4 |
| E11 | Inter-Faculty Transfer | 4 | 18 | M5 |
| E12 | Role Dashboards | 4 | 18 | M5 |
| E13 | Notifications, Reports & Audit | 4 | 18 | M5 |
| E14 | Security, Performance, Deployment & Sample Module | 6 | 29 | M6 |
| | **Total** | **67** | **333** | |

---

# E1 — Platform Foundation & Modular Architecture

**Goal:** A Laravel 13 skeleton with quality gates, a module system with per-portal extension points, the design system for all five portals, settings and seeded reference data.

**Real-world scenario:** Tunde clones the repo, runs `composer setup` and `php artisan campusone:install`, and gets five branded login pages, a green student portal and indigo department portal, NUC grading preloaded, and all 36 states + FCT with LGAs. Later a contractor adds a Hostel module without touching `app/`.

### S1.1 — Scaffold project & quality tooling
**Priority** P0 · **Points** 5 · **Depends on** —
**Story:** As a developer, I want a standard skeleton with linting, static analysis, tests and CI, so that quality is enforced from day one.
**Acceptance criteria**
1. `composer setup` installs dependencies, creates `.env`, generates the key, migrates, seeds and builds assets.
2. CI runs Pint (test), PHPStan L6, Pest with coverage, `composer audit`, `npm audit`; every job must pass.
3. Arch tests fail on `dd/dump/ray`, on controllers using `DB::`, or on `App\` referencing `Modules\`.
**Technical spec**
- Laravel 13, PHP ≥ 8.3, `APP_TIMEZONE=Africa/Lagos`; `Model::shouldBeStrict(!production)`, `DB::prohibitDestructiveCommands(production)`.
- Dev: pest, pest-plugin-laravel, pest-plugin-arch, larastan, pint, debugbar, ide-helper.
- `.github/workflows/ci.yml` (see 06 §9); `phpstan.neon` L6 over `app/`, `Modules/`.

### S1.2 — Module system & per-portal extension registries
**Priority** P0 · **Points** 8 · **Depends on** S1.1
**Story:** As a platform developer, I want modules to add menus, widgets, permissions, settings, registration rules and fee sources per portal, so that the system grows without editing core.
**Acceptance criteria**
1. `module:make` output autoloads via merge-plugin; enabling/disabling in `modules_statuses.json` toggles the provider.
2. `MenuRegistry::for('department')->add(...)` shows the item only in the department portal and only to users with the permission.
3. Widgets registered for `student` render on the student dashboard in order; disabled modules render nothing and throw no errors.
4. Tagged `registration.rules` and `billing.fee_sources` services are picked up by the registration validator and invoice builder.
**Technical spec**
- `composer require nwidart/laravel-modules:^13 wikimedia/composer-merge-plugin`.
- `App\Support\Extensibility\{MenuRegistry, DashboardWidgetRegistry, SettingsRegistry, PermissionRegistry, ReportRegistry}` as singletons keyed by portal.
- Core registers its own menus via the same registries (dog-fooding).
- Tests use a fixture module registered at runtime.

### S1.3 — Design system & five portal layouts
**Priority** P0 · **Points** 8 · **Depends on** S1.1
**Story:** As any user, I want a clean interface whose colour tells me which portal I'm in, so that I never act in the wrong place.
**Acceptance criteria**
1. Bootstrap 5.3 compiled from Sass with Evergreen tokens; `body[data-portal]` switches the accent and sidebar colour per portal (03 §2.2).
2. Layouts `auth`, `student`, `staff`, `print` exist and are responsive; staff top bar shows the scope badge.
3. Components from 03 §8 render in `/dev/ui-kit` (local only).
4. `app.css` ≤ 50 KB gz; axe-core reports no serious violations on the layouts.
**Technical spec**
- npm: bootstrap, @popperjs/core, bootstrap-icons, alpinejs, @fontsource/inter, @fontsource/plus-jakarta-sans, sass.
- Enums implement `HasBadge` (`badge(): array{label,class,icon}`) consumed by `<x-status-badge>`.

### S1.4 — Institution settings & branding
**Priority** P0 · **Points** 3 · **Depends on** S1.3, S2.2
**Story:** As a Super Admin, I want to set the institution's name, crest, registrar signature and policies, so that every page and PDF is official.
**Acceptance criteria**
1. General: name, short name, crest, favicon, address, contact, registrar and bursar names and signatures.
2. Policy tabs: Registration (billing_on submit|approve, block if prior debt, course-form payment threshold), Results (CGPA attempt policy, show scores to students), Transfer (reissue matric, min CGPA default).
3. Gateway secrets encrypted and masked; all changes audited.
**Technical spec**
- `spatie/laravel-settings`: `GeneralSettings`, `RegistrationSettings`, `BillingSettings`, `ResultSettings`, `TransferSettings`, `PaymentSettings` (encrypted).
- Branding files on the `public` disk, with a `/branding/{file}` route fallback for hosts without symlinks.

### S1.5 — Reference data & NUC grading seed
**Priority** P0 · **Points** 2 · **Depends on** S1.1
**Story:** As Registry, I want states, LGAs, countries, default levels and the NUC grading scheme preloaded, so that setup is quick and correct.
**Acceptance criteria**
1. 36 states + FCT and 774 LGAs seeded.
2. Default grading scheme: A 70–100 (5), B 60–69 (4), C 50–59 (3), D 45–49 (2), E 40–44 (1), F 0–39 (0); pass mark 40.
3. Degree classes: First 4.50–5.00, 2:1 3.50–4.49, 2:2 2.40–3.49, Third 1.50–2.39, Pass 1.00–1.49.
4. Institution-default level unit limits: min 15, max 24 per semester.
5. Seeders are idempotent.
**Technical spec**
- `database/data/*.json`; `updateOrCreate`; the `GradingSchemeSeeder` marks the scheme default.

---

# E2 — Portals, Authentication & Hierarchical Access

**Goal:** Five separate login portals and a strictly scoped hierarchy: Super Admin → Faculty Admin → Department Admin → Lecturers and Students.

**Real-world scenario:** Tunde creates Prof. Bello's Faculty Admin login for Physical Sciences. Prof. Bello creates logins for the HOD and exam officer of Computer Science. Prof. Adeyemi then creates Dr. Eze's lecturer account. Aisha activates her student account with her matric number. When Prof. Bello opens "Students", he sees only Physical Sciences students; typing a Faculty of Arts student's URL returns 404.

### S2.1 — Five portal login pages
**Priority** P0 · **Points** 5 · **Depends on** S1.3
**Story:** As a user, I want a login page for my role, so that I land in the right portal with the right tools.
**Acceptance criteria**
1. `/student/login` (matric no or email), `/lecturer/login`, `/department/login`, `/faculty/login`, `/admin/login` (email or staff ID), each branded with the portal accent.
2. Correct credentials at the wrong portal fail with a generic "Invalid credentials".
3. After login the user lands on their portal dashboard; visiting another portal's routes returns 403.
4. Lockout 5 attempts/min per identifier+IP; suspended accounts are told to contact their office.
5. Password reset per portal (email link, 60 min), which logs out other sessions.
**Technical spec**
- `PortalAuthenticator` resolves the identifier (matric_no → students join) and checks `users.type` against the portal.
- Middleware `EnsurePortal:{portal}`; route files `routes/{portal}.php` loaded in `bootstrap/app.php` with prefix/name/middleware.
- Fortify for reset and 2FA; custom login controllers per portal (shared trait).

### S2.2 — RBAC and OrgScope engine
**Priority** P0 · **Points** 8 · **Depends on** S2.1
**Story:** As the institution, I want every staff action limited to the staff member's faculty or department, so that data never leaks across units.
**Acceptance criteria**
1. Seeded roles and permissions per PRD §3 (e.g. `students.view`, `courses.manage`, `registrations.approve`, `results.approve.hod`, `results.approve.faculty`, `results.approve.senate`, `fees.manage`, `payments.confirm`, `transfers.decide`, `windows.manage`, `accounts.create.faculty_admin`, …).
2. Department Admins see only their department; Faculty Admins see all departments in their faculty; lecturers see only allocated offerings and advisees.
3. Every scoped list, detail, export and search respects scope. Out-of-scope record URLs return 404.
4. An automated test matrix covers each role × each scoped resource for leakage.
**Technical spec**
- `users.faculty_id`, `users.department_id`; `OrgScope` value object; `ApplyOrgScope` middleware binds it.
- Models implement `ScopedByOrg` with `scopeScopedTo(Builder, OrgScope)`; `Student` uses denormalised `department_id`/`faculty_id`.
- Policies check `$scope->covers($model)`; route model binding via `uuid`; `Gate::before` for super_admin.
- PHPStan custom rule or arch test ensures `Department\*` / `Faculty\*` controllers use scoped queries.

### S2.3 — Super Admin creates Faculty Admin logins
**Priority** P0 · **Points** 3 · **Depends on** S2.2, S3.2
**Story:** As a Super Admin, I want to create Faculty Admin accounts tied to a faculty, so that each Dean's office runs its own dashboard.
**Acceptance criteria**
1. Form: title, names, email, phone, faculty, role (Dean / Faculty Officer). Sends a 72 h invite link and sets `must_change_password`.
2. Multiple admins per faculty are allowed; the admin can be suspended or reactivated with a reason.
3. Invite resend and invalidation; all actions audited.
**Technical spec**
- `CreateFacultyAdmin` action; `StaffInvitation` notification with signed URL (`URL::temporarySignedRoute`), consumed once (token hash in `staff_invitations`).

### S2.4 — Faculty Admin creates Department logins
**Priority** P0 · **Points** 3 · **Depends on** S2.3
**Story:** As a Faculty Admin, I want to create login accounts for each department in my faculty, so that HODs and exam officers manage their own units.
**Acceptance criteria**
1. Department picker lists only the actor's faculty; sub-roles HOD, Exam Officer, Department Officer.
2. At most one active HOD per department (a warning offers to replace the current HOD).
3. Faculty Admin can suspend or reset department accounts in their faculty only.
**Technical spec**
- `CreateDepartmentAdmin` asserts `department.faculty_id === actor.faculty_id` (or super admin); spatie roles `hod`, `exam_officer`, `dept_officer` with permission sets.

### S2.5 — Student account activation
**Priority** P0 · **Points** 5 · **Depends on** S2.1, S4.1
**Story:** As a new or returning student, I want to activate my portal account with my matric number, so that I can set my own password securely.
**Acceptance criteria**
1. Activation form takes matric no + email on record → 6-digit OTP (valid 15 min) or link to that email.
2. Correct OTP lets the student set a password (policy: min 8, letters and numbers) and complete profile basics.
3. Wrong matric/email pairs get a generic response; 3 OTP requests/hour per matric.
4. If the email on record is wrong, the student sees "Visit your department to update your email", and the department can correct it (audited).
**Technical spec**
- `ActivateStudent` action; `student_activations` (matric, otp_hash, expires_at, attempts); throttle `activation`.

### S2.6 — 2FA, password policy & idle timeout
**Priority** P0 · **Points** 3 · **Depends on** S2.1
**Story:** As Registry, I want privileged accounts protected by 2FA and sessions that expire, so that stolen passwords can't change results or fees.
**Acceptance criteria**
1. super_admin, bursary and faculty_admin must enrol TOTP before any action (configurable per role).
2. Forced password change on first login; staff idle timeout 30 min, students 60 min.
3. Users can view recent logins (date, IP, device).
**Technical spec**
- Fortify 2FA; middleware `EnsureTwoFactor`, `ForcePasswordChange`, `IdleTimeout`; `login_events` table.

---

# E3 — Academic Structure & Curriculum

**Goal:** Sessions, semesters, faculties, departments, programmes, courses and a curriculum with prerequisites. This is the data the registration engine depends on.

**Real-world scenario:** Prof. Adeyemi builds the "2026 Catalogue" for B.Sc. Computer Science. At 200L First Semester, CSC 201 (3 units, C) requires a *pass* in CSC 101, and MTH 201 (3, C) requires MTH 101. There is an elective group "200L Free Electives" (min 2 units, allows other faculties). The validation report flags that 300L Second Semester totals only 13 units (below the minimum of 15) before the window opens.

### S3.1 — Sessions, semesters & academic calendar
**Priority** P0 · **Points** 3 · **Depends on** S2.2
**Story:** As Registry, I want sessions and semesters with a calendar, so that registration, fees and results are tied to the right period.
**Acceptance criteria**
1. Session `YYYY/YYYY` unique; set current (atomic switch).
2. Semesters per session: First, Second, or a single Year term for year-based programmes; dates validated within the session.
3. Calendar events (registration, lectures, exams, results) visible to all portals.
4. Records referenced by registrations/results cannot be deleted.
**Technical spec**
- `AcademicSession`, `Semester`, `CalendarEvent`; `SetCurrentSession` busts `current_session` cache; shared via view composer in the top-bar session switcher.

### S3.2 — Faculties & departments
**Priority** P0 · **Points** 3 · **Depends on** S2.2
**Story:** As Registry, I want to manage faculties and departments, so that the hierarchy matches our institution.
**Acceptance criteria**
1. CRUD with unique codes, active flag, dean name (faculty); a department may be marked a **service unit** (e.g. General Studies) that owns courses but no programmes.
2. Faculty Admins can edit department names/codes in their faculty (create/delete stays with Super Admin).
3. Deactivation hides the unit from new registrations but keeps history.
**Technical spec**
- `Faculty`, `Department` with SoftDeletes, LogsActivity; `withCount(['departments','programmes','students'])`.

### S3.3 — Programmes & level unit limits
**Priority** P0 · **Points** 5 · **Depends on** S3.2
**Story:** As a Department Admin, I want to define programmes with duration and credit-load limits, so that students are held to the right rules.
**Acceptance criteria**
1. Programme: code, name, award, department, duration (e.g. 4), max duration (default 6 = 1.5×), mode, entry levels, min graduation units, pricing mode (per course / per unit + unit rate), O'level requirements (used by transfers).
2. Level unit limits per programme, level and semester (min/max) override institution defaults.
3. The final level is derived from duration (e.g. 400L), and the min-unit exemption applies to it.
**Technical spec**
- `Programme`, `LevelUnitLimit`; `UnitLoadPolicy::limitsFor(Programme, level, semesterType)` cached.

### S3.4 — Course catalogue
**Priority** P0 · **Points** 5 · **Depends on** S3.2
**Story:** As a Department Admin, I want to create and maintain my department's courses with units, level, semester and default price, so that curricula and registrations use accurate data.
**Acceptance criteria**
1. Fields: code (normalised `ABC 123`, unique), title, units 0–6, level, semester (First/Second/Both/Year), description, default price (₦), active.
2. Department sees and edits only its own courses, but can **view** all active courses (for curricula using service/external courses).
3. Bulk import courses from CSV with preview and row errors.
4. Changing units/price affects future offerings only.
**Technical spec**
- `Course` (uuid, LogsActivity); `CourseCodeNormaliser`; `ImportCourses` via `spatie/simple-excel` with a formula-injection guard.

### S3.5 — Curriculum builder, prerequisites & validation
**Priority** P0 · **Points** 8 · **Depends on** S3.3, S3.4
**Story:** As a Department Admin, I want to lay out each level and semester's courses with C/R/E status, elective groups and prerequisites, so that students get the right course lists automatically.
**Acceptance criteria**
1. Curriculum versions per programme (e.g. "2026 Catalogue") applying to cohorts from an entry session; students keep the version they entered with.
2. Grid per level × semester: add courses (own, service or other departments), set status C/R/E, assign elective groups (min/max units, allow external faculties).
3. Requisites per course: prerequisite (pass, optional min grade), prerequisite (taken), co-requisite. Saving rejects same-or-higher-level prerequisites and cycles.
4. The validation report lists units per level/semester vs limits, empty semesters, courses offered in the wrong semester, requisite issues and the total vs min graduation units. Blocking errors must be fixed before a window can open for that programme.
5. "Preview as student" shows the eligible list for a sample level.
**Technical spec**
- `CurriculumVersion`, `CurriculumEntry`, `ElectiveGroup`, `CourseRequisite`; `SyncCurriculum` action (diff upsert).
- `RequisiteGraph::assertAcyclic()` (DFS); `CurriculumValidator` returns `Issue[]` (blocking/warning).
- Cache tag per version, busted on save.

---

# E4 — Student Records & Lifecycle

**Goal:** Accurate student records from admission to graduation, with bulk operations.

**Real-world scenario:** Registry imports 2,140 fresh students from the AdmitPro export. Matric numbers `U26/FPS/CSC/0001…` are generated, and activation emails go out. At session end, Prof. Adeyemi runs promotion for Computer Science. 188 of 200 move from 100L to 200L; 12 on probation are flagged for review, and one 500L student beyond max duration is flagged spill-over.

### S4.1 — Create & import students (incl. AdmitPro)
**Priority** P0 · **Points** 8 · **Depends on** S3.3, S2.2
**Story:** As Registry or a Department Admin, I want to add students one by one or in bulk, including admitted candidates from AdmitPro, so that everyone can register on time.
**Acceptance criteria**
1. Manual create form with all FR-4.1 fields; department scope pre-fills the programme list.
2. CSV/XLSX import: template download, upload, validated preview (row errors: unknown programme, duplicate email/phone/matric, invalid state/LGA), then commit valid rows. Runs queued with a progress bar and emails the report.
3. AdmitPro import accepts the AdmitPro admitted-list export (application no, bio-data, programme code, passport) and maps the programme by code. Duplicates (by application no) are skipped.
4. Imported students get `curriculum_version` = the active version for their entry session, and optionally a queued activation email.
**Technical spec**
- `ImportStudents` job (chunk 200) using `SimpleExcelReader`; `imports` table with report JSON; `CreateStudent` action reused per row inside a transaction.
- Passport from the AdmitPro zip is re-encoded and stored privately.

### S4.2 — Matric number generation
**Priority** P0 · **Points** 3 · **Depends on** S4.1
**Story:** As Registry, I want matric numbers generated in our format without duplicates, so that identity is reliable.
**Acceptance criteria**
1. Pattern tokens `{YY}`, `{YYYY}`, `{FAC}`, `{DEPT}`, `{PROG}`, `{SEQ:n}`, with sequence scope configurable (per department per year, etc.).
2. Issued on create (or on first fee payment, per setting); immutable except by Super Admin with reason (the old value kept in history).
3. Concurrent generation never duplicates.
**Technical spec**
- `SequenceGenerator` with `sequences` row `lockForUpdate()`; unique index on `students.matric_no`; `matric_histories` table.

### S4.3 — Student profile & passport
**Priority** P0 · **Points** 3 · **Depends on** S2.5
**Story:** As a student, I want to maintain my profile and passport, so that my course form and records are correct.
**Acceptance criteria**
1. Editable: phone, address, next of kin, passport (JPG/PNG ≤ 200 KB, min 300×300, re-encoded).
2. Names, DOB, gender, programme and matric no are read-only (change requests go to the department).
3. Passport locks after the first approved registration; a change request needs department approval.
**Technical spec**
- `intervention/image` GD re-encode; private disk `passports/{uuid}.jpg`; `ProfileChangeRequest` model for locked fields.

### S4.4 — Status, promotion & spill-over
**Priority** P0 · **Points** 8 · **Depends on** S10.4
**Story:** As a Department Admin, I want to promote students at session end and manage status, so that levels and standing are accurate for the next registration.
**Acceptance criteria**
1. Statuses: active, deferred (with sessions), suspended, withdrawn, graduated. Changes need a reason and are audited; non-active students cannot register.
2. Promotion wizard (department, current level): preview shows Promote / Hold (probation or withdrawal standing) / Final-year remains (outstanding courses) / Spill-over (beyond duration). Confirm runs as a queued batch.
3. Students beyond max duration are flagged for Senate review.
4. Final-year students with all required units passed and no carry-overs are listed as "graduation-eligible".
**Technical spec**
- `PromoteStudents` action per chunk; `AcademicStandingPolicy`; `GraduationEligibility` service (sum passed units ≥ min_graduation_units ∧ all C/R courses passed).

---

# E5 — Lecturers, Offerings & Allocation

**Goal:** Every course offered in a semester has lecturers, a coordinator and a class list.

**Real-world scenario:** Before registration opens, Prof. Adeyemi clicks "Generate offerings for 2026/2027 First Semester". 42 CSC offerings are created from the curriculum at default prices. He allocates Dr. Eze as coordinator of CSC 201 with a co-lecturer, and assigns her as 200L course adviser.

### S5.1 — Lecturer accounts
**Priority** P0 · **Points** 3 · **Depends on** S2.4
**Story:** As a Department Admin, I want to create lecturer accounts in my department, so that lecturers can manage their courses and scores.
**Acceptance criteria**
1. Fields: staff ID (unique), title, names, email, phone, rank, specialisation; invite email on create.
2. Department sees, edits and suspends only its lecturers; Faculty Admin sees all lecturers in the faculty.
3. CSV bulk import with preview.
**Technical spec**
- `CreateLecturer` action (user `type=lecturer`, `department_id`); `Lecturer` profile model.

### S5.2 — Course offerings per semester
**Priority** P0 · **Points** 5 · **Depends on** S3.5, S3.1
**Story:** As a Department Admin, I want to generate this semester's offerings from the curriculum, so that students can register and lecturers can be allocated.
**Acceptance criteria**
1. "Generate offerings" creates one offering per active course the department owns that appears in any active curriculum for that semester type (idempotent).
2. Each offering stores a price (default from the course; overridable), optional capacity, score components (default CA 40 / Exam 60) and an open flag.
3. Offerings with registrations cannot be deleted; they can be closed to new registrations.
**Technical spec**
- `GenerateOfferings` action; `course_offerings` unique(course, semester); price snapshot at generation, editable until the first invoice uses it (later edits affect new invoices only).

### S5.3 — Lecturer allocation & coordinator
**Priority** P0 · **Points** 3 · **Depends on** S5.1, S5.2
**Story:** As a Department Admin, I want to allocate lecturers to offerings and choose a coordinator, so that the right person submits results.
**Acceptance criteria**
1. Multiple lecturers per offering; exactly one coordinator required before score entry opens.
2. Lecturers from other departments can be allocated to our offerings (search across the institution, read-only profile).
3. The allocation matrix view shows per-lecturer load (courses and units).
**Technical spec**
- `AllocateLecturer` action; `offering_lecturers` with `is_coordinator` (unique partial via action check).

### S5.4 — Course adviser assignment
**Priority** P0 · **Points** 2 · **Depends on** S5.1
**Story:** As a Department Admin, I want to assign course advisers per level, so that registrations route to the right approver.
**Acceptance criteria**
1. Assign one adviser per department + level (+ optional programme) per session.
2. Without an adviser, registrations route to the HOD queue.
3. Advisers see an "Advisees" menu in the lecturer portal.
**Technical spec**
- `adviser_assignments`; `RegistrationApproverResolver` returns the adviser or the HOD role holders.

---

# E6 — Course Registration Engine

**Goal:** Students register the right courses in minutes, and the rules (prerequisites, units, carry-overs, electives by faculty) are enforced server-side.

**Real-world scenario:** Registration for 2026/2027 First Semester opens for 200L–500L on 5 October and closes on 19 October, with a late period to 26 October (₦5,000 late fee). Aisha opens Register: seven 200L CSC compulsory courses are pre-selected (19 units), and **MTH 101 is auto-added as a carry-over (CO, 3 units, locked)**, making 22 units. She opens the elective browser, filters Faculty → *Social Sciences*, Department → *Economics*, and tries ECO 301. It is blocked: "300-level external electives are not permitted for 200L." She adds ECO 101 (2 units), reaching 24/24. CSC 205 shows "Requires pass in CSC 102 — you scored F", so she can't add it. The summary bar shows ₦87,000 in course fees plus about ₦35,000 in levies. She submits. Dr. Eze approves the next morning, and Aisha's invoice appears.

### S6.1 — Registration windows (open, close, late, add/drop)
**Priority** P0 · **Points** 5 · **Depends on** S3.1, S7.2
**Story:** As a Super Admin, I want to open and close course registration by session, semester and audience, so that registration happens in controlled periods.
**Acceptance criteria**
1. Window fields: semester, title, audience (all, or selected faculties/programmes/levels), opens_at, closes_at, optional late_closes_at + late fee item, optional add/drop closing date.
2. Status auto-transitions `scheduled → open → late → closed` via scheduler (±1 min). Admin can close early, extend (audited, notifies affected students) or reopen for a specific department.
3. Opening is blocked if any in-scope programme has blocking curriculum issues or missing offerings (with a clear list).
4. Students see the countdown on their dashboard; outside a window, registration pages are read-only.
5. Multiple windows may coexist for different audiences (e.g. 100L later than returning students).
**Technical spec**
- `RegistrationWindow` model; `OpenWindow`/`CloseWindow` actions; `campusone:sync-window-status` every minute.
- `WindowResolver::forStudent($student, $semester)` returns the active window (audience match).

### S6.2 — Eligible course list & carry-over auto-inclusion
**Priority** P0 · **Points** 8 · **Depends on** S3.5, S5.2, S10.4
**Story:** As a student, I want my semester's courses and carry-overs listed automatically, so that I don't miss compulsory or failed courses.
**Acceptance criteria**
1. Starting registration creates a draft with the curriculum courses for my programme, curriculum version, level and semester: C and R pre-selected, E unselected.
2. Carry-overs (latest attempt F, ABS or missing result from a previous session) offered this semester are auto-added, labelled CO and **cannot be removed** by the student.
3. Already-passed courses never appear as selectable.
4. Courses without an offering this semester show "Not offered this semester" and cannot be selected.
5. Final-year students see only outstanding required courses plus carry-overs, and the minimum-unit rule is relaxed.
**Technical spec**
- `StartRegistration` action → `EligibleCourseResolver` (cached per version/level/semester) + `CarryOverResolver` (query `course_attempts`).
- Draft persisted in `course_registrations` + `registered_courses` with category.
- ≤ 6 queries measured by a feature test with query counting.

### S6.3 — Elective browser filtered by faculty & department
**Priority** P0 · **Points** 5 · **Depends on** S6.2
**Story:** As a student, I want to browse and add electives by faculty and department, so that I can choose courses outside my department where allowed.
**Acceptance criteria**
1. The offcanvas has Faculty → Department dependent selects, a search (code/title), level filter and "Show only eligible" toggle.
2. Courses listed come from the elective groups of my curriculum; if a group `allow_external` is on, any active offering at or below my level from any faculty qualifies (configurable max level).
3. Each course shows units, price, owning department, capacity left and eligibility state with its reason.
4. Group limits enforced: min/max units per elective group.
**Technical spec**
- `GET /student/registration/{reg}/electives?faculty=&department=&q=` returns a partial HTML fragment (Alpine fetch), paginated at 20.
- Validation reuses `RegistrationValidator`.

### S6.4 — Prerequisite & co-requisite validation with waivers
**Priority** P0 · **Points** 8 · **Depends on** S3.5, S6.2
**Story:** As a department, I want prerequisites enforced with the ability to waive them for qualified students, so that academic sequencing is protected but exceptions are possible.
**Acceptance criteria**
1. Adding a course with an unmet `prerequisite_pass` shows "CSC 301 requires a pass in CSC 201 (your latest: F)". With `prerequisite_taken`, "…requires that you have taken CSC 201."
2. Co-requisites must be added together (adding one offers to add the other; removing one warns).
3. A Department Admin (HOD) can grant a **waiver** for student + course + requisite with a reason (and optional expiry session). Waived courses show the gold `W` chip on the form.
4. Server-side validation re-checks on submit even if the UI was bypassed; violations return 422 with messages.
**Technical spec**
- `PrerequisiteChecker` (05 §6.2), `GrantPrerequisiteWaiver` action (permission `waivers.grant`, department scope of the *course*), `prerequisite_waivers`.
- Unit test datasets: pass/fail/ABS/multiple attempts/min-grade/waiver expiry.

### S6.5 — Credit-unit limits & overload requests
**Priority** P0 · **Points** 5 · **Depends on** S3.3, S6.2
**Story:** As a student, I want to know my unit limits and request an overload when justified, so that I can finish on time without breaking rules.
**Acceptance criteria**
1. The summary bar shows total units against the min–max meter. Submit is blocked below min (except final year) or above max.
2. Above max: "Request overload" (requested total + reason) → HOD recommends → Dean (Faculty Admin) approves or rejects. Approval raises that registration's max to the approved value.
3. Carry-overs count toward the total.
**Technical spec**
- `UnitLoadPolicy`; `RequestOverload`, `DecideOverload` actions; `overload_requests` with two-stage decision; notifications to the student.

### S6.6 — Submit, adviser/HOD approval & return
**Priority** P0 · **Points** 5 · **Depends on** S6.2–S6.5, S5.4
**Story:** As a student, I want to submit my registration for approval and fix it if returned, so that my courses become official.
**Acceptance criteria**
1. The review modal lists courses (code, title, units, category, price), totals and estimated fees. Submit needs a declaration checkbox.
2. Submit snapshots units/prices, sets `submitted`, and notifies the approver (adviser, else HOD queue).
3. Approvers see a queue (filters: level, programme, status, submitted date) with rule-check badges; they Approve (single/bulk) or Return with a required comment.
4. Returned registrations reopen for editing and show the comment; resubmission notifies the approver.
5. Approval triggers the invoice (if `billing_on=approve`) and the "Registration approved" email.
**Technical spec**
- `RegistrationStateMachine`; `SubmitRegistration`, `ApproveRegistration`, `ReturnRegistration` actions with optimistic locking.
- Event `RegistrationApproved` → `BuildInvoice` listener (queue `billing`) and notification.
- Maker-checker: an approver cannot approve their own registration (e.g. a staff member who is also a student).

### S6.7 — Add/drop amendments
**Priority** P0 · **Points** 5 · **Depends on** S6.6, S7.4
**Story:** As a student, I want to add or drop courses during the add/drop period, so that I can adjust my load, with fees adjusted automatically.
**Acceptance criteria**
1. During add/drop (window open or before `add_drop_closes_at`), an approved registration can be amended; status becomes `amending` with a visible diff.
2. The amendment is re-validated against all rules, then goes through approval again.
3. On approval, the system issues a supplementary invoice for added courses, or a credit note for dropped courses (if already invoiced), and the course form is regenerated as a new version (old QR marked superseded).
4. Departments can amend on a student's behalf with a reason (P1).
**Technical spec**
- `AmendRegistration` action; `registered_courses.added_in_version` / `dropped_in_version`; `registration_histories.diff` JSON; billing via `IssueSupplementaryInvoice` / `IssueCreditNote`.

---

# E7 — Course Pricing, Fee Items & Invoicing

**Goal:** Transparent, itemised invoices built from registered courses plus admin-defined additional fees.

**Real-world scenario:** Mrs. Okafor creates fee items: ICT Levy ₦10,000 (per session, all students), Medical ₦7,500 (per session), Laboratory Fee ₦12,000 (per semester, Faculty of Physical Sciences, 200–400L), Late Registration ₦5,000. Course prices default to ₦3,000/unit for Science programmes (per-unit mode) and ₦2,500/unit for Arts. Aisha's approved registration (24 units) produces an invoice of 9 course lines (₦72,000) + ICT + Medical + Lab = ₦101,500.

### S7.1 — Course pricing (per course / per unit)
**Priority** P0 · **Points** 3 · **Depends on** S5.2, S3.3
**Story:** As Bursary, I want each course to carry a price, set per course or per credit unit, so that students pay for exactly what they register.
**Acceptance criteria**
1. Programme pricing mode: `per_course` (offering price) or `per_unit` (programme unit rate × units).
2. Bulk price editor per semester: filter offerings by faculty/department/level and set or adjust prices (fixed or %), with preview; audited.
3. Carry-over pricing policy: full / discounted % / free (setting).
4. Prices shown to students in the registration UI match the invoice exactly.
**Technical spec**
- `CoursePricer::price(Student, CourseOffering): Money`; `BulkUpdateOfferingPrices` action (transaction); tests to confirm UI/invoice parity.

### S7.2 — Additional fee items & targeting rules
**Priority** P0 · **Points** 8 · **Depends on** S2.2
**Story:** As Bursary/Super Admin, I want to add fee items and target them to specific groups of students, so that levies and charges are applied correctly and automatically.
**Acceptance criteria**
1. Fee item: code, name, category, amount, frequency (per semester / per session / one-off), mandatory/optional, active.
2. Rules: session (or all), semester type, faculties, departments, programmes, levels, entry modes, new/returning, nationality, and an optional amount override per rule. Multiple rules are OR-ed; conditions within a rule are AND-ed.
3. "Who pays this?" preview shows the matching student count and a sample list.
4. Optional fee items appear on the invoice screen as opt-in checkboxes before payment.
5. Per-session items are charged once per session (first invoice of the session).
**Technical spec**
- `FeeItem`, `FeeRule`; `FeeRuleMatcher::match(Student, Semester): Collection<FeeCharge>` (pure, unit-tested); cached rule set per session.

### S7.3 — Invoice builder
**Priority** P0 · **Points** 8 · **Depends on** S7.1, S7.2, S6.6
**Story:** As a student, I want an itemised invoice for my registration, so that I know exactly what I'm paying for.
**Acceptance criteria**
1. Generated on submit or approve (setting): course lines (code, title, units, amount), fee lines, late fee if applicable, totals; number `INV/2026-27/1/000123`.
2. Snapshots: amounts never change after issue; later changes produce supplementary invoices or credit notes.
3. One registration invoice per registration version; regeneration before any payment replaces an unpaid invoice (cancelled + new).
4. Invoice PDF downloadable; the invoice page shows Pay button, balance and status.
5. Due date from settings (e.g. window close + 14 days).
**Technical spec**
- `InvoiceBuilder` (05 §6.3) inside a transaction; `SequenceGenerator('invoice:{session}:{sem}')`; `Invoice::recalculate()` is private to the builder.
- Tests: rule combinations, per-session de-duplication, late fee, cancel/replace.

### S7.4 — Ad-hoc charges, credit notes & discounts
**Priority** P0 (discounts P1) · **Points** 5 · **Depends on** S7.3
**Story:** As Bursary, I want to add ad-hoc charges, issue credit notes and apply approved discounts, so that exceptions are handled without editing invoices.
**Acceptance criteria**
1. Ad-hoc charge to one student or a filtered group (reason required) → an `adhoc` invoice.
2. Credit notes from course drops are auto-applied to the next unpaid invoice or kept as student credit (visible in finance).
3. Discounts/scholarships (P1): percentage or fixed, target rule, approval by a second Bursary user (maker-checker), shown as negative lines.
4. No refunds are processed in-app; refund requests are exported for manual processing.
**Technical spec**
- `AddAdhocCharge`, `IssueCreditNote`, `ApplyCredit` actions; `credit_notes`; `discounts` + `discount_approvals` (P1).

---

# E8 — Payments & Student Finance

**Goal:** Reliable payments and a clear finance history per session and semester.

**Real-world scenario:** Aisha pays ₦101,500 by card on Paystack. Her tab closes before the redirect, but the webhook marks the invoice paid 20 seconds later. Her finance page shows *2026/2027 → First Semester → INV/2026-27/1/000123 — Paid — receipt*. Ibrahim pays at a bank; Mrs. Okafor confirms his teller with evidence.

### S8.1 — Payment gateway drivers
**Priority** P0 · **Points** 5 · **Depends on** S1.4
**Story:** As a developer, I want a gateway abstraction with Paystack, Flutterwave, Remita (stub) and manual drivers, so that the institution can use its preferred channels.
**Acceptance criteria**
1. `PaymentGateway` contract: initialize, verify, verifyWebhookSignature, parseWebhook.
2. Paystack and Flutterwave pass contract tests with recorded fixtures.
3. Enabled gateways and keys come from encrypted settings, with test/live mode.
**Technical spec**
- `PaymentManager extends Manager`; drivers under `App\Payments\Drivers`; `Http::timeout(15)->retry(2, 500)`.

### S8.2 — Pay, verify, webhooks & idempotency
**Priority** P0 · **Points** 8 · **Depends on** S8.1, S7.3
**Story:** As a student, I want to pay my invoice online and have it confirmed immediately and exactly once, so that I can print my course form.
**Acceptance criteria**
1. Pay (full or instalment if enabled with min first %) → transaction `initiated` → redirect to gateway.
2. Callback does server-side verification; success requires matching amount and currency. The webhook with a valid signature is processed once via the queue.
3. Double processing (callback + webhook) credits once and sends one email.
4. `ReverifyPendingPayments` every 10 min for 48 h, then `abandoned`.
5. On success: `paid_kobo` updated, status derived, `InvoicePaid` event (receipt, course form eligibility).
**Technical spec**
- `InitiatePayment`, `VerifyPayment` (row lock + early return), `ProcessPaymentWebhook` job; `webhook_events` unique; CSRF-exempt `webhooks/*`.

### S8.3 — Student finance: history by session/semester & receipts
**Priority** P0 · **Points** 5 · **Depends on** S8.2
**Story:** As a student, I want to see all my invoices, payments and receipts grouped by session and semester, so that I can prove what I paid and when.
**Acceptance criteria**
1. Finance page: accordion Session → Semester, each with invoices (number, kind, total, paid, balance, status) and transactions (date, reference, gateway, amount, status).
2. Download invoice PDF and receipt PDF (receipt: amount in words, reference, QR).
3. Summary cards: total billed, total paid, outstanding balance, credit balance.
4. Filters: session, status; export statement (PDF) for a session.
**Technical spec**
- `Student\FinanceController`; eager loads `invoices.lines`, `invoices.transactions`; `GenerateReceipt` (dompdf); amount-in-words via `NumberFormatter` with a pure-PHP fallback.

### S8.4 — Bursary reconciliation & manual confirmation
**Priority** P0 · **Points** 5 · **Depends on** S8.2
**Story:** As Bursary, I want to reconcile transactions and confirm bank payments, so that every student's status is correct.
**Acceptance criteria**
1. Transactions list: filters (session, semester, faculty, gateway, status, date, amount), search (reference, matric, invoice), totals.
2. Re-verify button; view redacted gateway payloads.
3. Manual confirmation (teller no, bank, date, evidence upload, reason) creates a `manual` success transaction. Requires `payments.confirm`, is audited and notifies the student.
4. Debtors list per faculty/department/level exportable.
**Technical spec**
- `Admin\Bursary\TransactionController`, `ConfirmManualPayment` action; `ManualGateway` driver.

---

# E9 — Course Form & Document Verification

**Goal:** An official, verifiable course form the student or department can print.

**Real-world scenario:** After paying, Aisha downloads her course form: passport top-right, her details, 10 courses with MTH 101 marked CO, 24 units, invoice INV/…/000123 **PAID**, "Approved by Dr. N. Eze (Course Adviser), 06 Oct 2026", signature lines for Student, Adviser and HOD, and a QR code. The department office also bulk prints all 200L forms for filing.

### S9.1 — Course form PDF
**Priority** P0 · **Points** 5 · **Depends on** S6.6, S8.2
**Story:** As a student, I want to print my course form with my passport and all registered, paid courses, so that I have official proof of registration.
**Acceptance criteria**
1. Content per FR-9.1, A4 grayscale-safe, one page for up to 14 courses (overflow continues).
2. Valid version only when registration is `approved` and payment meets the threshold (setting: full / ≥ X%). Otherwise a "PROVISIONAL — NOT VALID" watermark and no QR.
3. Each registration version gets its own verification code; older versions are marked superseded.
4. Generated on a queue after approval/payment and cached; download is instant thereafter.
**Technical spec**
- `GenerateCourseForm` action (dompdf, DejaVu Sans, passport embedded base64, QR SVG); `issued_documents` versioned; listener on `RegistrationApproved`, `InvoicePaid`, `RegistrationAmended`.

### S9.2 — Department printing & bulk print
**Priority** P0 · **Points** 3 · **Depends on** S9.1
**Story:** As a Department Admin, I want to find a student and print their course form, or bulk print for a level, so that I can serve students at the office and keep records.
**Acceptance criteria**
1. Search by matric/name within scope, then print the latest valid form (or provisional, with watermark, if not valid).
2. Bulk print: filters (level, programme, semester, only valid) → queued merged PDF → notification with download link (expires in 24 h).
3. Every staff print is logged (who, when, which student).
**Technical spec**
- `BulkCourseForms` job concatenating stored PDFs (`setasign/fpdi` or dompdf multi-page render); `exports` table for links.

### S9.3 — Public document verification
**Priority** P0 · **Points** 2 · **Depends on** S9.1
**Story:** As an examiner or official, I want to scan a course form or receipt QR code, so that I can confirm it's genuine and current.
**Acceptance criteria**
1. `/verify/{code}` shows type, masked name, matric no, session/semester, course count/total units or amount, status (valid/superseded/cancelled).
2. Invalid codes return a neutral "No matching document". Throttled 30/min/IP; `noindex`.
**Technical spec**
- 12-char Crockford base32 codes; unique index on `issued_documents.verification_code`.

---

# E10 — Results Processing & GPA

**Goal:** Scores move from lecturer to published result through an auditable, locked approval chain. GPA and CGPA are computed automatically.

**Real-world scenario:** Dr. Eze downloads the CSC 201 score template (212 students), fills CA and exam scores in Excel, uploads it and fixes two rows flagged "Exam 72 exceeds max 60". She submits. Prof. Adeyemi reviews the grade distribution and approves at the Departmental Board. Prof. Bello approves at the Faculty Board. Tunde records Senate approval and publishes First Semester results for the faculty. Aisha sees a GPA of 3.42 and CGPA of 3.18, with MTH 101 now passed (C), which clears her carry-over.

### S10.1 — Grading scheme & score components
**Priority** P0 · **Points** 3 · **Depends on** S1.5
**Story:** As Registry, I want to configure grading scales and score components, so that the system matches our regulations (university, polytechnic or college).
**Acceptance criteria**
1. Grading schemes with bands (grade, min, max, point), pass mark and effective session; versioned (old sessions keep their scheme).
2. Degree class bands per scheme.
3. Default score components (CA 40 / Exam 60) editable per offering by the department before score entry starts.
4. Validation: bands contiguous 0–100 with no overlaps; components sum to 100.
**Technical spec**
- `GradingScheme`, `DegreeClass`; `GradingSchemeValidator`; `GradeCalculator::for(Semester)` resolves the effective scheme.

### S10.2 — Score entry & CSV upload
**Priority** P0 · **Points** 8 · **Depends on** S10.1, S5.3, S6.6
**Story:** As a course lecturer, I want to enter or upload scores for my class, so that results are captured accurately and quickly.
**Acceptance criteria**
1. The class list includes all students with **approved** registrations for the offering (including carry-over students).
2. On-screen grid: CA and exam inputs (max per component), live total and grade preview, remark codes ABS/INC/SICK, autosave draft, keyboard navigation.
3. CSV template download (matric, name, ca, exam); upload validates each row (unknown matric, out of range, duplicates) with a preview before applying.
4. Only the coordinator can submit; co-lecturers can enter scores. Submission requires every student to have a score or remark, and shows summary stats for confirmation.
5. After submission, scores are read-only for the lecturer unless the sheet is returned.
**Technical spec**
- `ResultSheet` auto-created per offering at first access; `SaveScores`, `ImportScores` (simple-excel, formula-injection guard), `SubmitResultSheet` actions.
- `result_entries.scores` JSON; totals and grades computed server-side only (client preview is advisory).

### S10.3 — Result approval chain (HOD → Faculty → Senate)
**Priority** P0 · **Points** 8 · **Depends on** S10.2
**Story:** As HOD, Dean and Registry, I want to review and approve result sheets in sequence, so that results are formally validated before release.
**Acceptance criteria**
1. Queues per stage: HOD sees submitted sheets of department-owned offerings; Faculty sees `hod_approved` sheets in the faculty; Senate (Super Admin with `results.approve.senate`) sees `faculty_approved` sheets.
2. The sheet view shows the read-only grid, stats (count, mean, pass %, grade distribution chart), carry-over count and anomalies (e.g. > 50% failure highlighted).
3. Approve (single or bulk) or Return with a comment → back to `draft` for the lecturer, and history keeps every transition.
4. Maker-checker: the same user cannot act at two consecutive stages for the same sheet.
5. On senate approval, a SHA-256 hash of the entries is stored.
**Technical spec**
- `ResultSheetStateMachine`; `ApproveResultSheet`, `ReturnResultSheet` actions; `result_sheets.*_by/_at` columns + `result_sheet_histories`; policies by stage permission + org scope.

### S10.4 — Publication & GPA/CGPA computation
**Priority** P0 · **Points** 8 · **Depends on** S10.3
**Story:** As Registry, I want to publish approved results and have GPAs and standings computed automatically, so that students get accurate results at once.
**Acceptance criteria**
1. Publish by semester and scope (institution, faculty or department) for all `senate_approved` sheets, immediately or at a scheduled time.
2. Publication triggers GPA/CGPA computation: semester TNU, TCP, GPA; cumulative TNU, TCP, CGPA; standing (Good / Probation / Withdrawal per policy), using only published entries.
3. Carry-over status is refreshed (a new pass clears the carry-over; F creates one); `course_attempts` updated.
4. Computation is idempotent and re-runnable; a verification report compares totals.
5. Students are notified; results become visible.
**Technical spec**
- `PublishResults` → `Bus::batch(ComputeStudentGpa chunks of 200)`; `GpaCalculator` pure class with known-transcript tests (e.g. units [3,3,2,2] with grades [A,C,B,F] → GPA 3.20).
- `semester_results` upsert; `students.cgpa`/`standing` cached columns.

### S10.5 — Student results view & statement of result
**Priority** P0 · **Points** 3 · **Depends on** S10.4
**Story:** As a student, I want to see my results per semester with GPA and CGPA, so that I know my standing and outstanding courses.
**Acceptance criteria**
1. Semester selector; table: code, title, units, grade, grade point (score shown only if the setting allows), remark; GPA and CGPA card, standing badge, carry-overs list.
2. CGPA trend chart across semesters and current class-of-degree band (informational).
3. Printable statement of result (unofficial, watermarked "Student copy") with QR.
4. Results from unpublished sheets are never visible.
**Technical spec**
- `Student\ResultController`; `GenerateStatementOfResult`; Chart.js lazy-loaded.

### S10.6 — Result amendments after publication
**Priority** P0 · **Points** 5 · **Depends on** S10.4
**Story:** As a lecturer/HOD, I want to request corrections to published results with justification, so that genuine errors are fixed transparently.
**Acceptance criteria**
1. Amendment request per entry: new scores, reason, evidence upload.
2. Goes through HOD → Faculty → Senate approval.
3. On approval: the entry is updated with a new version (old values retained), GPA/CGPA recomputed for affected students, the student notified, and the audit shows the full chain.
4. Rejected requests keep the original result.
**Technical spec**
- `result_amendments` with approvals JSON; `RequestAmendment`, `DecideAmendment` actions; recompute via `ComputeStudentGpa` for one student.

### S10.7 — Broadsheets & result analytics
**Priority** P0 · **Points** 5 · **Depends on** S10.4
**Story:** As a Department/Faculty Admin, I want broadsheets and summaries, so that boards of examiners can review performance.
**Acceptance criteria**
1. Broadsheet per department/programme/level/semester: rows = students, columns = courses (grade), then TNU, TCP, GPA, CGPA, standing. Exportable to XLSX and PDF (landscape).
2. Summary: pass rate per course, grade distribution, probation list, withdrawal list, carry-over list, first-class candidates.
3. Scoped to the viewer.
**Technical spec**
- `BroadsheetQuery` (pivot in PHP from `result_entries` + `semester_results`, chunked); `ReportRegistry` entries; queued exports.

---

# E11 — Inter-Faculty Transfer

**Goal:** A controlled, fully tracked transfer process that admin opens and closes.

**Real-world scenario:** Tunde opens the 2026/2027 transfer window (1–21 July, ₦20,000 form fee, min CGPA 1.00, completed ≥ 200L) and sets the permissible matrix (Agriculture → Life Sciences allowed; → Medicine excluded). Fatima (B.Agric 200L, CGPA 3.10) passes the eligibility check, chooses B.Sc. Biochemistry, uploads her O'level result, pays and submits. It moves through her HOD, her Dean, the Biochemistry HOD (who credits her passed CHM 101 and BIO 101) and the Life Sciences Dean, and Registry gives final approval. From 2026/2027 she registers as 200L Biochemistry, and her Agriculture results stay in her history.

### S11.1 — Transfer window & permissible matrix
**Priority** P0 · **Points** 3 · **Depends on** S3.2, S7.2
**Story:** As a Super Admin, I want to open a transfer window with rules and a permissible matrix, so that only allowed transfers are applied for, and only when open.
**Acceptance criteria**
1. Window: session, open/close dates, fee item, min CGPA, min completed level, eligible current levels, instructions; scheduled status transitions.
2. Matrix: from faculty (optionally department) → to faculty (optionally department), with excluded programmes; import/export as CSV.
3. The student portal shows a "Transfer" menu only when a window is open and the student is in an eligible level.
**Technical spec**
- `TransferWindow`, `PermissibleTransfer`; `OpenTransferWindow` action; `PermissibleTransferMatrix::allows(fromProgramme, toProgramme)`.

### S11.2 — Transfer application, eligibility & fee
**Priority** P0 · **Points** 5 · **Depends on** S11.1, S8.2
**Story:** As a student, I want to check my eligibility and apply for an inter-faculty transfer online, so that I don't need to chase paper forms.
**Acceptance criteria**
1. The eligibility panel shows each rule as pass/fail: active status, CGPA ≥ min, completed level, not previously transferred, target within matrix.
2. The target programme picker lists only allowed programmes; target O'level requirements are displayed and the student attests to meeting them and uploads O'level/A'level results.
3. Statement of result auto-attached; reason ≤ 500 words.
4. Fee invoice generated; submission only after payment. One application per window.
**Technical spec**
- `TransferEligibility` (rules returning `RuleOutcome`); `ApplyForTransfer` action; `transfer_applications` unique(window, student); invoice kind `transfer_form`.

### S11.3 — Transfer approval chain
**Priority** P0 · **Points** 5 · **Depends on** S11.2
**Story:** As the current and receiving HODs and Deans, and Registry, I want to act on transfer applications in sequence, so that every stakeholder signs off.
**Acceptance criteria**
1. Stages: current HOD (recommend/not) → current Dean (approve/reject) → receiving HOD (recommend + propose entry level + credited courses) → receiving Dean → Registry final.
2. Each stage's queue is scoped (from-side or to-side unit); a comment is required on rejection.
3. The student sees an approval stepper with stage outcomes (internal comments hidden, public reasons shown).
4. Any rejection ends the application; the student can withdraw before the final decision.
**Technical spec**
- `TransferStateMachine`; `DecideTransferStage` action with stage-specific payload validation; `transfer_decisions`.

### S11.4 — Effecting the transfer
**Priority** P0 · **Points** 5 · **Depends on** S11.3
**Story:** As Registry, I want an approved transfer applied automatically from the chosen session, so that the student's records, registration and fees follow the new programme.
**Acceptance criteria**
1. On final approval, choose the effective session (default next). At rollover, programme/department/faculty/curriculum version/level are updated.
2. Credited courses count as passed toward the new programme (`credited` flag, not re-graded). Other passed courses remain on the transcript but are excluded from new-programme graduation units unless credited.
3. Matric number kept or reissued per setting (old one kept in history and still verifies).
4. `programme_histories` written; the student and both departments are notified.
**Technical spec**
- `EffectTransfer` action (transaction); `course_credits` table (student_id, course_id, source_attempt_id, credited_by); `SessionRolledOver` listener applies pending effective transfers.

---

# E12 — Role Dashboards

**Goal:** Each portal opens on a scoped, actionable dashboard.

**Real-world scenario:** On day 3 of registration, Prof. Bello's faculty dashboard shows 71% of Physical Sciences students registered, 540 unpaid, 12 overload requests waiting for him, and Mathematics lagging at 48%.

### S12.1 — Student dashboard
**Priority** P0 · **Points** 5 · **Depends on** S6.1, S8.3, S10.5
**Story:** As a student, I want one screen showing registration status, fees due and my latest results, so that I know what to do next.
**Acceptance criteria**
1. Cards: registration (window state, countdown, my status, CTA), finance (outstanding balance, Pay), academics (CGPA, standing, carry-overs count), course form (download if valid), transfer (if window open and eligible).
2. Announcements for my audience; calendar highlights.
3. Module widgets (e.g. Course Evaluation) render via the registry.
4. Loads in ≤ 8 queries.
**Technical spec**
- `StudentDashboardService`; `NextActionResolver` returns the single top action.

### S12.2 — Lecturer & department dashboards
**Priority** P0 · **Points** 5 · **Depends on** S5.3, S6.6, S10.3
**Story:** As a lecturer or Department Admin, I want dashboards of my work queues and department statistics, so that nothing is left pending.
**Acceptance criteria**
1. Lecturer: my offerings (students count, sheet status), pending submissions, advisees awaiting approval.
2. Department: students by level/status, registration progress per level (bar), unpaid count, courses count, lecturers count, sheets awaiting HOD, waivers/overloads pending, course-form prints today.
3. Every tile links to the pre-filtered list.
**Technical spec**
- `DepartmentStatsService` cached 5 min per department; widgets via `DashboardWidgetRegistry::for('department')`.

### S12.3 — Faculty dashboard
**Priority** P0 · **Points** 3 · **Depends on** S12.2
**Story:** As a Faculty Admin, I want faculty-wide oversight of departments, students, courses and lecturers, so that I can manage the faculty effectively.
**Acceptance criteria**
1. Department table: students, registration %, paid %, lecturers, courses, sheets pending.
2. Queues: sheets awaiting faculty approval, overloads, transfers at Dean stages.
3. Quick links to the Students, Lecturers and Courses lists (scoped to the faculty with department filter).
**Technical spec**
- `FacultyStatsService` aggregates department stats (cached).

### S12.4 — Super Admin dashboard
**Priority** P0 · **Points** 5 · **Depends on** S12.3, S8.4
**Story:** As Registry/Super Admin, I want institution-wide KPIs and control points, so that I can run the academic calendar.
**Acceptance criteria**
1. KPIs: active students, registered %, revenue billed vs collected (by faculty), results published %, transfers in progress.
2. Window controls: current registration/transfer windows with quick close/extend.
3. Senate queue; failed jobs; scheduler heartbeat; pending manual payments.
**Technical spec**
- `InstitutionStatsService`; Chart.js lazy; health data from `SystemHealth` checks.

---

# E13 — Notifications, Reports & Audit

**Goal:** Everyone is informed, managers get the reports they need, and every sensitive action is traceable.

**Real-world scenario:** 48 hours before registration closes, 1,900 students with drafts or no registration get a reminder email and in-app notice. Bursary exports the Faculty of Arts debtors list, and the audit log shows who reopened the Mathematics window and why.

### S13.1 — Notifications & editable templates
**Priority** P0 · **Points** 5 · **Depends on** S1.1
**Story:** As any user, I want timely email and in-app notifications, so that I never miss an approval, payment or result.
**Acceptance criteria**
1. Catalogue per FR-13.1 plus window reminders (48 h, 24 h), returned registration, overload decision, score submission deadline reminder to lecturers.
2. Queued (`emails` queue), retried 3× with backoff, sent after commit, idempotent per event.
3. Admin-editable subject/body with merge tags, preview, test send, reset to default.
4. Bell icon with unread count in every portal.
**Technical spec**
- Notification classes (`mail`, `database`); `notification_templates`; `TemplateRenderer` (safe `{{ tag }}` replacement, no Blade compilation of user input).

### S13.2 — Scoped announcements
**Priority** P0 · **Points** 2 · **Depends on** S2.2
**Story:** As any admin level, I want to post announcements to my audience, so that notices reach the right people.
**Acceptance criteria**
1. Audience limited to the poster's scope: Super Admin (all/any), Faculty (its departments, levels, roles), Department (its students/lecturers, levels).
2. Start/end dates, pinned flag, optional email blast (throttled).
**Technical spec**
- `announcements` with audience JSON; `AnnouncementAudience::matches(User)`.

### S13.3 — Reports & exports
**Priority** P0 · **Points** 8 · **Depends on** S6.6, S7.3, S10.4
**Story:** As an officer at any level, I want standard reports and exports, so that committees, bursary and management have the data they need.
**Acceptance criteria**
1. Reports: registration statistics (by faculty/department/level), course enrolment and class lists, unregistered students, debtors, revenue by fee item/faculty/gateway, results summaries, carry-over list, probation/withdrawal lists, graduation-eligible list, transfer summary.
2. Every report is scoped, filterable and exportable to CSV/XLSX (PDF for class lists).
3. Large exports queued; link valid 24 h; files purged after 7 days; exports logged.
**Technical spec**
- `ReportRegistry` of `ReportDefinition` classes (query builder, columns, scope-aware); `spatie/simple-excel` streaming; CSV formula-injection escaping.

### S13.4 — Audit log
**Priority** P0 · **Points** 3 · **Depends on** S2.2
**Story:** As a Super Admin, I want an immutable audit trail, so that every change to accounts, registrations, money and results is accountable.
**Acceptance criteria**
1. Logged: logins (staff), account creation/suspension, structure changes, window open/close/extend, registration approve/return/amend, waivers, overloads, price/fee changes, invoices, payments, manual confirmations, every result stage, amendments, transfers, settings, prints and exports.
2. Filter by actor, subject, event and date; view old → new values (secrets masked).
3. Faculty/Department Admins can view audit entries within their scope (read-only). Retention 5 years.
**Technical spec**
- `spatie/laravel-activitylog` with `logOnlyDirty`; tap adds IP/UA/portal; scoped viewer; `activitylog:clean --days=1825`.

---

# E14 — Security, Performance, Deployment & Sample Module

**Goal:** Harden, load-test, ship to three targets and prove extensibility.

**Real-world scenario:** On opening morning, 6,000 students hit the portal in two hours. The VPS holds p95 under one second because eligibility lists are cached and invoices/PDFs are queued. A penetration test finds no way for a department account to read another department's results.

### S14.1 — Security hardening
**Priority** P0 · **Points** 8 · **Depends on** all feature epics
**Story:** As the institution, I want the portal hardened, so that records, money and results are protected.
**Acceptance criteria**
1. Security headers and nonce CSP; A rating on securityheaders.com.
2. A route inventory test asserts that every non-public route has auth + portal middleware and a policy/scope check.
3. A scope-leak suite covers each staff portal × each scoped model.
4. OWASP ZAP baseline shows no High findings; upload and CSV injection tests pass.
5. Maker-checker enforced for result stages, discounts and manual payment confirmation above a threshold.
**Technical spec**
- `SecurityHeaders` middleware or `spatie/laravel-csp`; `Vite::useCspNonce()`; `tests/Arch/RouteSecurityTest.php`; `mews/purifier` for rich text.

### S14.2 — Data protection (NDPA 2023)
**Priority** P0 · **Points** 3 · **Depends on** S13.4
**Story:** As the data controller, I want privacy notice, access controls and retention, so that we comply with the Nigeria Data Protection Act.
**Acceptance criteria**
1. Privacy notice accepted at activation (versioned).
2. Students can download their personal data (profile, registrations, invoices, results) as JSON/PDF.
3. Retention rules for graduated/withdrawn records per setting; academic results are retained permanently as required by academic regulation.
4. PII masked in logs; least-privilege scopes verified.
**Technical spec**
- `privacy_policies`; `ExportStudentData` job; `campusone:apply-retention --dry-run`.

### S14.3 — Performance, load testing & observability
**Priority** P0 · **Points** 5 · **Depends on** E6, E8
**Story:** As an operator, I want the system proven under registration-day load and monitored, so that it stays up when it matters.
**Acceptance criteria**
1. k6: 500 VUs, 15 min, scenario login → registration page → add 2 courses → submit → view invoice: p95 < 1 s (pages), < 1.5 s (submit), errors < 0.5% on the VPS reference.
2. OPcache and `php artisan optimize` in deploy; query budget tests on key pages.
3. `/up` and an admin health page (DB, cache, queue lag, scheduler heartbeat, disk, mail config); failed-job alerts; optional Sentry.
**Technical spec**
- `k6/registration-day.js`; `spatie/laravel-health` (optional); heartbeat key written by the scheduler each minute.

### S14.4 — Backups, session rollover & ops commands
**Priority** P0 · **Points** 3 · **Depends on** S4.4
**Story:** As an operator, I want backups and safe end-of-session commands, so that we can recover and move to the next session cleanly.
**Acceptance criteria**
1. Daily DB and private-files backup (14 daily / 8 weekly) off-server; failure alerts; documented, rehearsed restore.
2. `campusone:rollover-session` (preview + confirm): sets the next session current, applies effective transfers, generates offerings, locks the previous session's registrations.
3. Commands: `campusone:install`, `campusone:doctor`, `campusone:reconcile-counters`, `campusone:purge-exports`.
**Technical spec**
- `spatie/laravel-backup`; rollover dispatches `SessionRolledOver`; each step idempotent.

### S14.5 — CI/CD & multi-target deployment
**Priority** P0 · **Points** 5 · **Depends on** S1.1
**Story:** As a developer, I want automated pipelines and documented deployments to Laravel Cloud, VPS and shared hosting, so that releases are repeatable.
**Acceptance criteria**
1. PR pipeline: lint, analyse, test (MySQL service), build, audits.
2. Tag `v*` builds a release zip (no dev deps, built assets, PHP 8.3) for shared hosting.
3. VPS zero-downtime script; Laravel Cloud build/deploy commands; shared-hosting guide with cron-driven queue.
**Technical spec**
- See `06-DEPLOYMENT-AND-DEV-SETUP.md`; `deploy/` folder with scripts and configs.

### S14.6 — Sample module: Course Evaluation
**Priority** P0 · **Points** 5 · **Depends on** S1.2, S10.4
**Story:** As a platform developer, I want a small real module that uses the extension points, so that future developers have a working template.
**Acceptance criteria**
1. After results are published for a semester, students see a dashboard widget "Evaluate your courses" and rate each registered course/lecturer anonymously (6 criteria, 1–5, optional comment), once per course.
2. HOD sees aggregated reports per lecturer/course in the department portal (only when ≥ 5 responses); lecturers see their own aggregates.
3. Registers a department menu item, permissions, settings tab (open/close evaluation, min responses) and a report.
4. Listens to `ResultsPublished` to open the evaluation period automatically (setting).
5. `module:disable CourseEvaluation` removes the menu, widget, routes and listeners cleanly; its tests run in CI.
**Technical spec**
- `Modules/CourseEvaluation` (models `Evaluation`, `EvaluationResponse`; anonymity: store a salted hash of student_id + offering for de-duplication, not the student_id).

---

## Appendix A — Traceability (PRD → Stories)

| PRD area | Stories |
|---|---|
| FR-1 Portals & Authentication | S2.1, S2.5, S2.6 |
| FR-2 Hierarchy & Scope | S2.2, S2.3, S2.4, S5.1, S5.4 |
| FR-3 Academic Structure & Curriculum | S3.1–S3.5, S5.2 |
| FR-4 Student Records | S4.1–S4.4 |
| FR-5 Lecturers & Allocation | S5.1–S5.4, S12.2 |
| FR-6 Course Registration | S6.1–S6.7 |
| FR-7 Pricing, Fees & Invoices | S7.1–S7.4 |
| FR-8 Payments | S8.1–S8.4 |
| FR-9 Course Form | S9.1–S9.3 |
| FR-10 Results | S10.1–S10.7 |
| FR-11 Transfer | S11.1–S11.4 |
| FR-12 Dashboards | S12.1–S12.4 |
| FR-13 Notifications, Reports, Audit | S13.1–S13.4 |
| NFRs | S14.1–S14.5, S1.1, S1.3 |
| Modularity | S1.2, S14.6 |

## Appendix B — Sprint plan (2-week sprints, ~40 pts, 2–3 devs)

| Sprint | Stories |
|---|---|
| 1 | S1.1, S1.2, S1.3, S1.5 |
| 2 | S2.1, S2.2, S2.3, S2.4, S1.4 |
| 3 | S2.5, S2.6, S3.1, S3.2, S3.3, S3.4 |
| 4 | S3.5, S4.1, S4.2, S4.3, S5.1 |
| 5 | S5.2, S5.3, S5.4, S6.1, S7.1, S7.2 |
| 6 | S6.2, S6.3, S6.4 |
| 7 | S6.5, S6.6, S7.3, S8.1 |
| 8 | S8.2, S8.3, S8.4, S7.4, S6.7 |
| 9 | S9.1, S9.2, S9.3, S10.1, S10.2 |
| 10 | S10.3, S10.4, S10.5 |
| 11 | S10.6, S10.7, S4.4, S11.1, S11.2 |
| 12 | S11.3, S11.4, S12.1, S12.2, S12.3 |
| 13 | S12.4, S13.1–S13.4 |
| 14 | S14.1–S14.6, UAT, launch |
