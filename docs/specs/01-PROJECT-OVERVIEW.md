# 01 — Project Overview

**Product codename:** CampusOne — University/College Student Portal (rename freely)
**Document owner:** Sulaiman Ahmad (Samboy) — Misnova Technologies Ltd
**Status:** Draft v1.0 · **Last updated:** 26 September 2026
**Related docs:** `02-PRD.md`, `03-DESIGN-SYSTEM.md`, `04-EPICS-AND-STORIES.md`, `05-ARCHITECTURE.md`, `06-DEPLOYMENT-AND-DEV-SETUP.md`
**Sister product:** AdmitPro (admission portal). Admitted candidates can be imported into CampusOne as students (see S4.2).

---

## 1. Summary

CampusOne is a self-hostable **student information and academic operations portal** for universities, polytechnics and colleges of education. It runs the whole semester loop for enrolled students:

1. Admins configure sessions, semesters, faculties, departments, programmes and a **curriculum** (which courses are taken at which level and semester, with prerequisites).
2. Admins **open course registration** for a session/semester. Students register for courses filtered by **faculty, department, level and prerequisite eligibility**, with carry-over courses added automatically and credit-unit limits enforced.
3. Every course has a **price**, and admins can add **additional fee items** (e.g. ICT levy, medical, sports, late registration). The student's registration produces an **invoice**, which they pay online.
4. After approval and payment, the student prints a **course form** showing passport, bio-data and every registered and paid course. Departments can print it for them too.
5. Lecturers enter **scores**. Results move through **HOD → Faculty → Senate approval** and are published, and **GPA/CGPA** is computed automatically.
6. Students see registered courses, payments, invoices and **transaction history by session and semester**, plus their **results**. When the window is open, they can apply for an **inter-faculty transfer**.

Access is **hierarchical** and each level has its own login portal: **Super Admin** creates **Faculty Admin** logins, Faculty Admins create **Department Admin** logins, and Department Admins manage their **Lecturers** and **Students**.

## 2. Problem statement
- Course registration is often done on paper or through spreadsheets. Prerequisites and credit-unit limits are checked by hand and usually inconsistently.
- Carry-over courses get forgotten, which blocks graduation later.
- Fees are opaque: students can't see what each course costs or why a levy was added.
- Course forms need several signatures and are easy to forge.
- Results travel as spreadsheets between lecturer, HOD, Dean and Senate. Nobody knows which version is final, and changes after approval leave no trace.
- Faculty and department offices have no scoped view of "their" students, courses and lecturers.
- Inter-faculty transfer is paper-based and needs four signatures with no tracking.

## 3. Vision
> "One login for every role, a registration a student can finish in ten minutes, and an approved result that nobody can quietly change."

## 4. Goals and non-goals

### Goals (v1.0)
1. **Five portals with separate login pages:** Student, Lecturer, Department, Faculty and Admin (Super Admin/Registry and Bursary).
2. Hierarchical account creation and **data scoping** (faculty → department → lecturer/student).
3. Academic structure: sessions, semesters (or year-long terms), faculties, departments, programmes, levels, course catalogue and curriculum ("course progression") with prerequisites/co-requisites.
4. **Course registration windows** that admins open and close, scoped by session, semester, faculty or level, with late registration.
5. A registration engine with curriculum-driven lists, **faculty/department filters** for electives, **prerequisite validation**, credit-unit min/max, carry-over auto-inclusion, add/drop, and adviser/HOD approval.
6. **Per-course pricing** plus **admin-defined additional fees**, with invoices built from registration and online payment (Paystack, Flutterwave, Remita-ready).
7. Student finance area: invoices, receipts and transaction history grouped by session and semester.
8. **Course form PDF** with passport and QR verification, printable by the student or the department.
9. **Results**: score entry (CA + exam), multi-stage approval, publication, GPA/CGPA, academic standing, statement of results.
10. **Inter-faculty transfer**: admin-opened window, eligibility checks, fee, 4-stage approval, automatic programme change.
11. Scoped dashboards for every role; notifications; reports; audit trail.
12. Modular architecture: all features above live in core, plus one sample module (`CourseEvaluation`).
13. Deployable on Laravel Cloud, VPS and shared hosting.

### Non-goals (v1.0 → future modules)
- Hostel allocation, clearance, ID cards and transcript ordering (`Hostel`, `Clearance`, `Transcript` modules).
- LMS/e-learning, CBT exams, timetable generation, attendance.
- Payroll/HR for staff.
- NELFUND loan integration (no public integration spec yet; handled as a payment channel only if it becomes available).
- Multi-institution SaaS (the architecture keeps the door open).

## 5. Target users

| Persona | Portal | Primary needs |
|---|---|---|
| **Student** | `/student` | Register courses fast, see and pay fees, print the course form, see results, apply for transfer |
| **Lecturer** | `/lecturer` | See allocated courses and class lists, enter/upload scores, submit results; if course adviser, approve advisees' registrations |
| **Department Admin** (HOD / Exam Officer / Dept. Secretary) | `/department` | Manage department courses, curriculum, lecturers, students, allocations; approve registrations and results; print course forms |
| **Faculty Admin** (Dean / Faculty Officer) | `/faculty` | Create department logins; oversee departments, courses, lecturers, students; approve results at faculty board; handle transfers |
| **Super Admin** (Registry / Academic Affairs / ICT) | `/admin` | Everything: structure, windows, fees, Senate approval, transfers, settings, users |
| **Bursary Officer** | `/admin` (Bursary role) | Fee items, pricing, reconciliation, manual confirmations, finance reports |

## 6. Core domain concepts (glossary)

| Term | Meaning |
|---|---|
| **Academic Session** | e.g. `2026/2027`; exactly one is current |
| **Semester** | First/Second (or a single "Year" term for year-long programmes). Each has a registration window and results |
| **Faculty / School / College** | Top academic unit, with a Faculty Admin |
| **Department** | Belongs to one faculty and owns programmes and courses. Has a Department Admin |
| **Programme** | Degree/diploma a student is enrolled in (e.g. *B.Sc. Computer Science*), with duration and max duration |
| **Level** | 100, 200 … 700 (or ND1/ND2, NCE1…). Student's current year of study |
| **Course** | Catalogue item: code (`CSC 201`), title, credit units, owning department, semester offered, level |
| **Curriculum Entry** | Course placed in a programme at a level and semester with a status: **Compulsory (C)**, **Required (R)** or **Elective (E)** |
| **Prerequisite / Co-requisite** | Course that must be passed (or taken) before, or taken with, another course |
| **Course Offering** | A course offered in a specific session and semester, with price, capacity and lecturers |
| **Registration Window** | Admin-controlled open/close period for course registration, scoped by session, semester and audience |
| **Course Registration** | One student's set of courses for a session and semester. Statuses: draft, submitted, approved, returned, cancelled |
| **Carry-over** | A previously failed course the student must re-register for |
| **Fee Item** | A chargeable item. Either *course-based* (from course prices) or *additional* (flat levies defined by admin, targeted by rules) |
| **Invoice** | Bill generated from a registration plus applicable fees. Payment status: unpaid, part-paid or paid |
| **Course Form** | Official PDF of registered and paid courses, with passport and QR verification |
| **Result Sheet** | All scores for one course offering. Moves through approval stages to publication |
| **GPA / CGPA** | Credit-weighted grade point average for a semester and cumulatively (5-point scale by default) |
| **Transfer Window / Application** | Admin-opened period in which students apply to move to a programme in another faculty |

## 7. Student journey

```
Activate account (matric no + email) → Complete profile + passport
→ Dashboard shows "Registration OPEN: 2026/2027 First Semester"
→ Register courses: curriculum courses pre-listed + carry-overs auto-added + pick electives (filter by faculty/department)
   → prerequisite & credit-unit checks live → price preview → Submit
→ Course adviser/HOD approves (or returns with comment)
→ Invoice generated (course prices + additional fees) → Pay online → Receipt
→ Print Course Form (passport, courses, paid stamp, QR)
→ End of semester: results published → view GPA/CGPA → next semester
→ (Optional) Transfer window opens → apply → approvals → new programme
```

## 8. Staff journeys
```
Super Admin: session/semesters → faculties → create Faculty Admin logins → fee items & pricing rules → open registration window → Senate approval → publish results → open transfer window
Faculty Admin: create departments' logins → monitor registrations → faculty board approval of results → transfer approvals
Department Admin: courses & curriculum → lecturer accounts → course allocation → approve registrations → print course forms → HOD approval of results
Lecturer: my courses → class list → enter scores / upload CSV → submit result sheet
```

## 9. Technology stack

| Layer | Choice |
|---|---|
| Framework | **Laravel 13** (PHP 8.3+, 8.4 recommended) |
| UI | **Blade + Bootstrap 5.3** (Sass via Vite), Bootstrap Icons, Alpine.js |
| Database | **MySQL 8.0+** (MariaDB 10.6+ tolerated) |
| Modularity | `nwidart/laravel-modules` ^13 (core in `app/`, one sample module) |
| Auth / RBAC | Laravel Fortify, `spatie/laravel-permission` with custom org-unit scoping |
| PDF / QR | `barryvdh/laravel-dompdf`, `simplesoftwareio/simple-qrcode` |
| Payments | Driver-based gateway layer (Paystack, Flutterwave; Remita stub; manual) |
| Import/Export | `spatie/simple-excel` (score CSV upload, student import, exports) |
| Audit | `spatie/laravel-activitylog` |
| Quality | Pest, Larastan, Pint, GitHub Actions |
| Hosting | Laravel Cloud · VPS · shared hosting (cPanel) |

## 10. Success metrics (first full session)

| Metric | Target |
|---|---|
| Students completing registration within the normal window | ≥ 90% |
| Median time to register (returning student) | < 10 minutes |
| Registrations violating prerequisite/unit rules without an approved waiver | 0 |
| Payment verification success | ≥ 99% auto-verified (no manual intervention) |
| Result sheets published through the full approval chain | 100% (no out-of-band edits) |
| p95 page time on registration day (VPS reference) | < 1 s at 500 concurrent students |

## 11. Key risks

| Risk | Mitigation |
|---|---|
| Registration-day traffic spike | Pre-computed eligible course lists, cached catalogue, queued invoices/PDFs, staggered windows by level, horizontal scale |
| Wrong curriculum data → wrong course lists | Curriculum validation report per programme before a window can open; dry-run "preview as student" |
| Result tampering | Stage locks, maker-checker approvals, amendment workflow with audit, published results immutable |
| Fee disputes | Price and fee snapshot on invoices, itemised invoices, credit notes for drops |
| Scope leakage between faculties | Central `ScopedQuery` + policies + automated tests per role |
| Shared hosting limits | DB queue driven by cron, chunked jobs, prebuilt assets |

## 12. Release plan

| Milestone | Scope | Epics |
|---|---|---|
| M0 Foundation (wk 1–2) | Skeleton, modules, design system, settings | E1 |
| M1 People & Structure (wk 3–6) | Portals and hierarchy, academic structure, students, lecturers | E2, E3, E4, E5 |
| M2 Registration (wk 7–10) | Registration engine | E6 |
| M3 Money (wk 11–13) | Pricing, fees, invoices, payments, course form | E7, E8, E9 |
| M4 Results (wk 14–17) | Scores, approvals, GPA | E10 |
| M5 Transfer & Ops (wk 18–20) | Transfers, dashboards, notifications, reports | E11, E12, E13 |
| M6 Harden & Ship (wk 21–22) | Security, performance, deployment, sample module | E14 |

## 13. Repository layout
```
campusone/
├── app/                 # Core (domain-organised)
├── Modules/CourseEvaluation/   # Sample module
├── routes/{web,student,lecturer,department,faculty,admin,webhooks}.php
├── resources/views/{student,lecturer,department,faculty,admin,pdf,components}
├── database/  tests/  docs/  deploy/
└── .github/workflows/
```
