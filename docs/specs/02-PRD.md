# 02 — Product Requirements Document (PRD)

**Product:** CampusOne — University/College Student Portal
**Version:** 1.0 · **Status:** Draft for build · **Last updated:** 26 September 2026
**Priority keys:** **P0** must ship · **P1** should ship · **P2** future/module

---

## 1. Background and research findings

| # | Finding (from Nigerian university regulations and portals) | Design consequence |
|---|---|---|
| 1 | Nigerian universities use the NUC 5-point CGPA scale with classes First (4.50–5.00), Second Upper (3.50–4.49), Second Lower (2.40–3.49), Third (1.50–2.39) and Pass (1.00–1.49). | Grading scheme and class bands are **configurable tables**, seeded with NUC defaults (FR-10). |
| 2 | Credit load is regulated. One published regulation sets 16 min / 24 max units per semester. Final-year students needing fewer units may register only outstanding courses. The Dean may approve under- or over-load on the HOD's recommendation. | Per-level/programme **min/max units**, a **final-year exception** and an **overload/underload request** workflow (FR-6.8). |
| 3 | A prerequisite must be taken before the course it gates, may only gate higher-level courses, and can be **waived by the department**. | Prerequisite rules with type (*passed* / *taken*), level validation on setup, and **department waivers** (FR-3.7, FR-6.6). |
| 4 | Failed courses are **carried over** and retaken in a later session. The failed attempt stays on record. Students may not graduate with outstanding carry-overs. Exceeding normal duration creates **spill-over**. A maximum registration period is commonly 1.5× programme duration. | Carry-overs **auto-added** with priority; attempts history; spill-over flag; max-duration guard (FR-6.5, FR-4.5). |
| 5 | Typical assessment is **CA 40% + exam 60%**. Results are compiled at **Departmental and Faculty Boards of Examiners**, then approved by **Senate**. | Configurable score components; **4-stage approval** (Lecturer → HOD → Faculty → Senate) then publication (FR-10). |
| 6 | Inter/intra-faculty transfer runs in an **announced window** with a **form fee**. Eligibility: current CGPA ≥ 1.00, completed ≥ 200 level, O'level prerequisites for the new programme, and only within **permissible areas of transfer**. The form is signed by the **current HOD and Dean and the proposed HOD and Dean**, then processed by Academic Affairs. | Transfer windows with fee, **permissible-transfer matrix**, eligibility engine and the same **approval chain**, then an automatic programme change (FR-11). |
| 7 | Portals let students pay fees, register courses (with **HOD approval tracking**), print course forms, view results/CGPA, request transcripts and hostel. Remita is common for fee collection. | Core covers registration, fees, course form and results. Hostel, transcript and clearance become **modules**. Remita driver is planned (FR-8). |
| 8 | Returning students typically log in with **matriculation number**. New students get their matric number assigned at registration or school-fee payment. | Students log in with matric no **or** email. Matric number generator follows a configurable pattern (FR-2, FR-4). |

## 2. Scope
In scope: `01-PROJECT-OVERVIEW.md §4 Goals`. Out of scope: §4 Non-goals.

## 3. Roles and permissions matrix

Scope column: **All** = institution-wide, **Fac** = own faculty, **Dept** = own department, **Own** = own records/allocations.

| Capability | Student | Lecturer | Dept Admin | Faculty Admin | Bursary | Super Admin |
|---|---|---|---|---|---|---|
| Log in via own portal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Faculty Admin logins | | | | | | ✅ |
| Create Department Admin logins | | | | Fac | | ✅ |
| Create/manage lecturers | | | Dept | Fac | | ✅ |
| Create/import/manage students | | | Dept | Fac | | ✅ |
| Sessions, semesters, calendar | | | | | | ✅ |
| Faculties | | | | view | | ✅ |
| Departments | | | view | Fac | | ✅ |
| Programmes | | | Dept | Fac | | ✅ |
| Courses & curriculum | | | Dept | Fac | | ✅ |
| Course allocation to lecturers | | | Dept | Fac | | ✅ |
| Open/close registration windows | | | | | | ✅ |
| Register own courses | ✅ | | | | | |
| Approve registrations | | advisees | Dept | Fac | | ✅ |
| Prerequisite waivers / overload | | | Dept (recommend) | Fac (approve) | | ✅ |
| Course prices & fee items | | | | | ✅ | ✅ |
| Pay invoices | ✅ | | | | | |
| Reconcile/confirm payments | | | | | ✅ | ✅ |
| Print course forms | Own | | Dept | Fac | | ✅ |
| Enter scores | | Own courses | Dept (exam officer) | | | ✅ |
| Approve results | | submit | HOD stage | Faculty stage | | Senate stage + publish |
| View own results | ✅ | | | | | |
| Open transfer window / permissible matrix | | | | | | ✅ |
| Apply for transfer | ✅ | | | | | |
| Approve transfers | | | HOD stages | Dean stages | | Registry final |
| Reports & exports | | own courses | Dept | Fac | finance | All |
| Settings, gateways, audit, modules | | | | | | ✅ |

## 4. Functional requirements

### FR-1 Portals & Authentication
| ID | Requirement | P |
|---|---|---|
| FR-1.1 | Five login pages with distinct branding and layouts: `/student/login`, `/lecturer/login`, `/department/login`, `/faculty/login`, `/admin/login`. A user can only authenticate at the portal matching their account type. | P0 |
| FR-1.2 | Students log in with matric number or email plus password. Staff log in with staff email (or staff ID) plus password. | P0 |
| FR-1.3 | First-login flows: students **activate** with matric no + registered email (OTP/link) and set a password. Staff receive invite links (72 h expiry) and must set a password. | P0 |
| FR-1.4 | Password reset by email; lockout 5 attempts/min per identifier+IP; session regeneration. | P0 |
| FR-1.5 | TOTP 2FA mandatory for Super Admin, Bursary and Faculty Admin (configurable for others). | P0 |
| FR-1.6 | Idle timeouts: staff 30 min, students 60 min. | P0 |

### FR-2 Hierarchical Account & Scope Management
| ID | Requirement | P |
|---|---|---|
| FR-2.1 | Super Admin creates Faculty Admin accounts bound to one faculty (multiple admins per faculty allowed). | P0 |
| FR-2.2 | Faculty Admin creates Department Admin accounts for departments in their faculty, with sub-roles: HOD, Exam Officer, Department Officer. | P0 |
| FR-2.3 | Department Admin creates Lecturer accounts in their department. Lecturers may be allocated courses from other departments by the owning department. | P0 |
| FR-2.4 | Every staff record has an **org scope** (`faculty_id` / `department_id`). All lists, detail pages, exports and searches are filtered to that scope. | P0 |
| FR-2.5 | Account actions (suspend, reset, role change) are allowed only downward in the hierarchy and are audit-logged. | P0 |
| FR-2.6 | A lecturer can be flagged **Course Adviser** for a level (and optionally a programme) in a session. | P0 |

### FR-3 Academic Structure & Curriculum
| ID | Requirement | P |
|---|---|---|
| FR-3.1 | Sessions (`YYYY/YYYY`, one current), semesters per session (First, Second, or single "Year"), with start/end dates and an academic calendar of key events. | P0 |
| FR-3.2 | Faculties (code, name, dean name) and departments (code, name, faculty). | P0 |
| FR-3.3 | Programmes: code, name, award, department, duration (years), max duration (default 1.5× duration), entry levels (100/200 for DE), mode, min graduation units. | P0 |
| FR-3.4 | Levels per programme (100…N×100), with per-level **min/max credit units per semester** (default 15/24, final year min exempt). | P0 |
| FR-3.5 | Course catalogue: code (unique, e.g. `CSC 201`), title, credit units (0–6), owning department, level, semester offered (First/Second/Both/Year), description, active flag. General courses (e.g. GST) are owned by a service unit/department. | P0 |
| FR-3.6 | Curriculum: per programme and **catalogue version** (entry-year cohort), assign courses to level + semester with status C (compulsory), R (required), E (elective); elective groups with min units to pick. | P0 |
| FR-3.7 | Prerequisites and co-requisites per course: type `must_pass` or `must_have_taken`, optional minimum grade. A prerequisite must be a lower-level course (validated on save). | P0 |
| FR-3.8 | Curriculum validation report per programme: total units per level, missing semesters, circular prerequisites, units below graduation minimum. | P0 |
| FR-3.9 | Course offerings per session/semester, generated from curricula (bulk) and editable: price override, capacity (optional), lecturers, coordinator. | P0 |

### FR-4 Student Records
| ID | Requirement | P |
|---|---|---|
| FR-4.1 | Student record: matric no, names, gender, DOB, phone, email, address, state, LGA, nationality, programme, entry session, entry level, entry mode (UTME/DE/Transfer), current level, catalogue version, status, passport, next of kin. | P0 |
| FR-4.2 | Create students manually, via CSV import (validated preview, row errors), or by importing admitted candidates from AdmitPro (CSV/JSON export; API P1). | P0 |
| FR-4.3 | Matric number generation on a configurable pattern, e.g. `U{YY}/{FAC}/{DEPT}/{SEQ:4}` → `U26/FPS/CSC/0042`. Unique and immutable once issued (changes only by Super Admin with reason). | P0 |
| FR-4.4 | Student status: active, deferred, suspended, withdrawn, graduated. `spill_over` flag computed when level exceeds normal duration. | P0 |
| FR-4.5 | End-of-session **promotion** (bulk, by department): advance level if academic standing permits; final-year handling; max-duration breach flag. | P0 |
| FR-4.6 | Student profile self-service: contact info, next of kin, passport (locked after first approved registration; changes need department approval). | P0 |

### FR-5 Lecturers & Allocation
| ID | Requirement | P |
|---|---|---|
| FR-5.1 | Lecturer profile: staff ID, title, names, email, phone, rank, department, specialisation. | P0 |
| FR-5.2 | Allocate lecturers to course offerings (many-to-many, one **coordinator** who submits results). | P0 |
| FR-5.3 | Lecturer dashboard: allocated courses by session/semester, class lists (registered and approved students), downloadable class list (CSV/PDF), score entry. | P0 |
| FR-5.4 | Course adviser view: advisees' pending registrations with approve/return. | P0 |

### FR-6 Course Registration
| ID | Requirement | P |
|---|---|---|
| FR-6.1 | Super Admin opens/closes **registration windows** per session+semester with audience scope (all, or selected faculties/levels/programmes), normal close date, and optional **late registration** period with a late fee item. Scheduled auto-open/close. | P0 |
| FR-6.2 | Only one registration per student per session+semester. Students not `active`, or with outstanding debts from previous sessions (setting), cannot register. | P0 |
| FR-6.3 | Eligible list is built from the curriculum for the student's programme, level, semester and catalogue version: compulsory and required courses pre-selected; electives selectable; **carry-overs auto-added and locked**. | P0 |
| FR-6.4 | **Elective browser**: students can add approved electives or free electives **filtered by faculty and department**, subject to the programme's elective rules and capacity. | P0 |
| FR-6.5 | Carry-over detection: any course with latest attempt grade F (or below the pass mark), or registered but no result (absent), appears as carry-over in the next session in which it is offered. | P0 |
| FR-6.6 | **Prerequisite validation** in real time and server-side: missing prerequisite blocks adding, with a reason ("CSC 301 requires a pass in CSC 201"), unless a **waiver** exists. | P0 |
| FR-6.7 | Co-requisite validation: both courses must be in the same registration. | P0 |
| FR-6.8 | Credit-unit limits enforced (min/max per level). Final-year students may register below the minimum. Above the max requires an **overload request** (HOD recommends, Dean approves). | P0 |
| FR-6.9 | Live summary: total units, number of courses, **price per course and total**, estimated invoice including additional fees. | P0 |
| FR-6.10 | Submit → status `submitted`; course adviser/HOD approves or returns with a comment. Approval triggers the invoice (or the invoice is generated at submit, per setting). | P0 |
| FR-6.11 | **Add/drop** while the window (or add/drop period) is open: after approval, changes create an amendment that needs re-approval; fee differences generate a supplementary invoice (adds) or a credit note (drops). | P0 |
| FR-6.12 | Department can register or modify on behalf of a student, with a reason (audit). | P1 |
| FR-6.13 | Window close: drafts are not auto-submitted. Unpaid approved registrations follow the policy setting (keep, or flag as "not validated" after the payment deadline). | P0 |

### FR-7 Pricing, Fees & Invoices
| ID | Requirement | P |
|---|---|---|
| FR-7.1 | **Course price**: each course has a default price; each offering may override it per session. Optional pricing mode *per credit unit* (rate × units) per programme/level. | P0 |
| FR-7.2 | **Additional fee items** created by Super Admin/Bursary: name, code, amount, frequency (per semester / per session / one-off), mandatory or optional, category (tuition, levy, late fee, penalty, service). | P0 |
| FR-7.3 | Fee **targeting rules**: all students, or filtered by faculty, department, programme, level, entry mode, new/returning, nationality (e.g. ICT levy for all, lab fee for Faculty of Science 200 level). | P0 |
| FR-7.4 | Invoice built from approved (or submitted) registration: one line per course (code, units, price) plus one line per applicable fee item. Amounts are **snapshotted**. | P0 |
| FR-7.5 | Admin can add an ad-hoc charge to a specific student or group (e.g. damage, reparation), with reason. | P0 |
| FR-7.6 | Discounts/waivers/scholarships as negative lines with approval (percentage or fixed, scoped). | P1 |
| FR-7.7 | Invoice number pattern `INV/{SESSION}/{SEM}/{SEQ}`. Statuses: unpaid, part_paid, paid, cancelled. Credit balance tracked per student. | P0 |
| FR-7.8 | Instalments: allow part payments with a minimum first instalment (setting). | P1 |

### FR-8 Payments
| ID | Requirement | P |
|---|---|---|
| FR-8.1 | Gateways: Paystack, Flutterwave (P0), Remita (P1), manual bank teller (P0, bursary-confirmed). | P0 |
| FR-8.2 | Server-side verification plus signed webhooks, idempotent crediting, scheduled re-verification of pending transactions. | P0 |
| FR-8.3 | Student finance page: invoices and payments **grouped by session and semester**, receipts (PDF), balance, credit notes. | P0 |
| FR-8.4 | Bursary: search, reconcile, re-verify, manual confirm with evidence, exports. | P0 |

### FR-9 Course Form & Verification
| ID | Requirement | P |
|---|---|---|
| FR-9.1 | Course form PDF: crest, institution, session/semester, passport, name, matric no, programme, department, faculty, level, table of courses (code, title, units, status C/R/E/carry-over), total units, invoice no and **paid status**, adviser/HOD approval name and date, signature blocks, QR code and verification code. | P0 |
| FR-9.2 | Available when registration is approved **and** invoice is paid (or part-paid, per setting). Otherwise shows "Provisional — not valid". | P0 |
| FR-9.3 | Department/Faculty/Admin can search a student and print their form. Department can bulk print for a level (merged PDF, queued). | P0 |
| FR-9.4 | Public verification page shows masked name, matric no, session/semester, course count, status (valid/superseded). | P0 |

### FR-10 Results
| ID | Requirement | P |
|---|---|---|
| FR-10.1 | Grading scheme (default NUC 5-point: A 70–100 = 5, B 60–69 = 4, C 50–59 = 3, D 45–49 = 2, E 40–44 = 1, F 0–39 = 0; E band disable-able) and degree class bands, versioned by effective session. | P0 |
| FR-10.2 | Score components per offering (default CA 40, Exam 60; configurable). Scores are entered on screen or by CSV upload with row validation. Special codes: ABS (absent), INC (incomplete), SICK (medical deferral). | P0 |
| FR-10.3 | Result sheet workflow: `draft → submitted (lecturer) → hod_approved → faculty_approved → senate_approved → published`. Any approver can **return** it with a comment. Each stage locks editing for the previous one. | P0 |
| FR-10.4 | GPA = Σ(grade point × units) / Σ units for the semester; CGPA cumulative over all attempts per institutional rule (default: all attempts count). TCP/TNU/TCU shown. Recomputed on publish. | P0 |
| FR-10.5 | Academic standing: Good (CGPA ≥ 1.00), Probation (< 1.00), Withdrawal (probation 2 consecutive sessions) — thresholds configurable. | P0 |
| FR-10.6 | Students see published results per semester: course, units, score (optional), grade, GP, GPA, CGPA, standing, carry-overs. Printable statement of result. | P0 |
| FR-10.7 | Amendments after publication require a request (lecturer/HOD) with reason and evidence, re-approval through the chain, and full audit. The old value is retained. | P0 |
| FR-10.8 | Broadsheet (department/level/semester) and summary (pass rates, grade distribution). | P0 |

### FR-11 Inter-Faculty Transfer
| ID | Requirement | P |
|---|---|---|
| FR-11.1 | Super Admin opens a transfer window (session, dates, fee, eligible levels, instructions). | P0 |
| FR-11.2 | Permissible transfer matrix: from faculty/department to allowed target faculties/programmes (with exclusions). | P0 |
| FR-11.3 | Eligibility: status active, CGPA ≥ threshold (default 1.00), completed ≥ min level (default 200), not on transfer before (setting), target programme O'level requirements (student attests and uploads results), target within matrix. | P0 |
| FR-11.4 | Application: target programme, reason, uploads (O'level/A'level, statement of result auto-attached), fee payment. | P0 |
| FR-11.5 | Approval chain: current HOD → current Dean → receiving HOD → receiving Dean → Registry (Super Admin) final. Any stage can reject with reason. | P0 |
| FR-11.6 | On final approval: programme/department/faculty changed from a chosen effective session; entry level set; credited courses mapped (receiving department selects which passed courses count); matric number kept or reissued (setting); history retained. | P0 |
| FR-11.7 | Intra-faculty transfer (department to department in the same faculty) uses the same flow with the Dean stages merged. | P1 |

### FR-12 Dashboards
| ID | Requirement | P |
|---|---|---|
| FR-12.1 | Student: registration status card, fees due, latest CGPA, quick links, announcements. | P0 |
| FR-12.2 | Lecturer: my courses, pending score submissions, advisees pending. | P0 |
| FR-12.3 | Department: students by level, registration progress, unpaid count, courses, lecturers, results pending HOD. | P0 |
| FR-12.4 | Faculty: per-department summaries, results pending faculty, transfers pending, lecturers, courses. | P0 |
| FR-12.5 | Super Admin: institution KPIs, revenue, windows status, Senate queue. | P0 |

### FR-13 Notifications, Reports & Audit
| ID | Requirement | P |
|---|---|---|
| FR-13.1 | Email + in-app notifications for account invites, registration submitted/approved/returned, invoice generated, payment received, results published, transfer status changes, window opening/closing reminders. Templates editable. | P0 |
| FR-13.2 | Announcements scoped by audience (all, faculty, department, level, role). | P0 |
| FR-13.3 | Reports: registration statistics, course enrolment, unpaid students, revenue by fee item and faculty, results summaries, carry-over list, probation list, graduation-eligible list. CSV/XLSX export, queued for large sets. | P0 |
| FR-13.4 | Audit log of all sensitive actions. | P0 |

## 5. Status models

**Course Registration**
```
draft ─submit─▶ submitted ─approve─▶ approved ─(add/drop)─▶ amending ─submit─▶ submitted
                   │ return
                   ▼
               returned ─resubmit─▶ submitted          any → cancelled (admin, reason)
```
Separate `payment_status`: unpaid / part_paid / paid (derived from invoices).

**Result Sheet**
```
draft → submitted → hod_approved → faculty_approved → senate_approved → published
   ▲        │             │               │                  │
   └────────┴─── return (with comment) ───┴──────────────────┘
published → amendment_requested → (re-approval chain) → published (new version)
```

**Transfer Application**
```
draft → submitted(paid) → current_hod_recommended → current_dean_approved
      → receiving_hod_recommended → receiving_dean_approved → registry_approved → effected
any stage → rejected ; submitted..before effected → withdrawn (student)
```

## 6. Non-functional requirements
| ID | Requirement |
|---|---|
| NFR-1 Performance | Registration page p95 < 1 s, submit < 1.5 s at 500 concurrent students on the VPS reference (4 vCPU/8 GB) |
| NFR-2 Scalability | Stateless web tier; Redis or DB for cache/session/queue; S3-compatible storage on Cloud |
| NFR-3 Availability | 99.5% during registration and result periods |
| NFR-4 Security | OWASP ASVS L2; scope enforcement tested per role; maker-checker on results and money |
| NFR-5 Privacy | Nigeria Data Protection Act 2023: consent, least privilege, retention, data export |
| NFR-6 Integrity | Published results and paid invoices are immutable; corrections only by versioned amendments/credit notes |
| NFR-7 Accessibility | WCAG 2.1 AA |
| NFR-8 Mobile | Student portal fully usable from 360 px |
| NFR-9 Portability | Laravel Cloud, VPS, shared hosting (PHP 8.3+, MySQL 8) |
| NFR-10 Maintainability | Pint, PHPStan level 6, ≥ 75% coverage on registration, fees and GPA domains |
| NFR-11 Observability | Health page, failed-job alerts, structured logs, optional Sentry |
| NFR-12 Backup | Daily DB and files, 14 days retention, tested restore |

## 7. Business rules (canonical)
1. One registration per student per session+semester (DB unique).
2. A course can appear only once in a registration.
3. A carry-over must be registered in the next session in which it is offered; it counts toward the max units and cannot be dropped by the student.
4. A course with an unmet prerequisite cannot be registered without an active waiver for that student and course.
5. Total units must be within the level's min/max. Final-year students are exempt from the minimum. Exceeding the max needs an approved overload.
6. Invoice amounts are snapshots; later price changes never alter issued invoices.
7. Course form is "valid" only when registration is approved and payment meets the configured threshold.
8. Scores can be edited only while the sheet is in `draft` (or returned to draft). Published results change only via an approved amendment.
9. GPA/CGPA include only published results.
10. Transfers take effect from the start of a session. Previous records stay attached to the student with their original programme.
11. Staff can act only within their org scope; Super Admin is unrestricted.
12. Nothing academic or financial is hard-deleted once referenced; archive instead.

## 8. Assumptions
- Hosting targets follow the earlier AdmitPro decision (Laravel Cloud, VPS, shared hosting). Branding reuses the green "Evergreen" family so both products feel like one suite (institution colours can override).
- The course prices the client requested coexist with flat levies. Institutions that charge only flat tuition set course prices to ₦0 and use fee items.
- Course advisers are lecturers flagged per level. If none is assigned, registrations go to the Department Admin (HOD).
- Grading defaults follow NUC; polytechnics/colleges edit the scale (e.g. 4-point) in settings.

## 9. Acceptance of v1.0
All P0 FRs pass their stories in `04-EPICS-AND-STORIES.md`. A full semester cycle (open window → register → approve → pay → print form → enter scores → approve through Senate → publish → CGPA → promotion) and a full transfer succeed on each deployment target.
