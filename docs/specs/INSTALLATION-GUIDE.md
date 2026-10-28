# CampusOne — Step-by-Step Manual Installation Guide

**Product:** CampusOne (University/College Student Portal & Academic Operations System)  
**Target Environment:** Local Development (Windows / Laragon / Herd / Sail)  
**PHP Target:** PHP 8.3+ (Recommended: PHP 8.4)  
**Database:** MySQL 8.0+ / MariaDB 10.6+  
**Frontend Stack:** Blade + Bootstrap 5.3 (Sass via Vite) + Bootstrap Icons + Alpine.js  

---

## Table of Contents
1. [System Prerequisites & PHP Extensions](#1-system-prerequisites--php-extensions)
2. [Step 1: Install Laravel Framework](#step-1-install-laravel-framework)
3. [Step 2: Database Creation & Environment (.env) Setup](#step-2-database-creation--environment-env-setup)
4. [Step 3: Install Production Composer Packages](#step-3-install-production-composer-packages)
5. [Step 4: Install Development & Testing Composer Packages](#step-4-install-development--testing-composer-packages)
6. [Step 5: Configure composer.json (Merge Plugin & Custom Scripts)](#step-5-configure-composerjson-merge-plugin--custom-scripts)
7. [Step 6: Install Frontend & NPM Packages](#step-6-install-frontend--npm-packages)
8. [Step 7: Publish Package Configurations & Migrations](#step-7-publish-package-configurations--migrations)
9. [Step 8: Configure Disks & Run Initial Migrations](#step-8-configure-disks--run-initial-migrations)
10. [Step 9: Configure Vite (vite.config.js) & Build Assets](#step-9-configure-vite-viteconfigjs--build-assets)
11. [Step 10: Run & Verify Local Environment](#step-10-run--verify-local-environment)
12. [Troubleshooting & Windows Gotchas](#troubleshooting--windows-gotchas)

---

## 1. System Prerequisites & PHP Extensions

Before running any installation commands, verify that your machine has the required tools installed.

### 1.1 Check Tool Versions
Open PowerShell or your terminal and verify:
```powershell
php -v          # Must be >= 8.3 (8.4 recommended)
composer -V     # Must be >= 2.7
node -v         # Must be >= 20 LTS (Node 22 LTS recommended)
npm -v          # Must be >= 10
mysql -V        # MySQL 8.0+ or MariaDB 10.6+
git --version
```

### 1.2 Enable Required PHP Extensions
In your `php.ini` (e.g. in Laragon: *Menu → PHP → Extensions*, or your active PHP folder):
Ensure the following extensions are enabled (remove `;` at the beginning of the line):
```ini
extension=bcmath
extension=ctype
extension=curl
extension=dom
extension=fileinfo
extension=filter
extension=gd
extension=intl
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=session
extension=tokenizer
extension=xml
extension=zip
```
*(Also recommended: `opcache` and `redis` if you plan to use Redis locally).*

> **Note on `intl`:** CampusOne uses PHP's `intl` extension for spelling out amounts in words and currency formatting on invoices and receipts.

---

## Step 1: Install Laravel Framework

Navigate to the directory where you want to create the project (e.g., `C:\laragon\www\` or your workspace directory):

```powershell
# Create a new Laravel project named "campusone"
composer create-project laravel/laravel campusone

# Navigate into the project folder
cd campusone
```

*If you are installing inside the current existing directory:*
```powershell
composer create-project laravel/laravel .
```

---

## Step 2: Database Creation & Environment (.env) Setup

### 2.1 Create MySQL Database
Log in to your MySQL terminal or GUI (HeidiSQL, phpMyAdmin, TablePlus, or DBeaver):
```sql
CREATE DATABASE campusone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Configure `.env`
Open `.env` in the root of `campusone` and adjust the key configuration values:

```dotenv
APP_NAME="CampusOne"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://campusone.test
APP_TIMEZONE=Africa/Lagos

LOG_CHANNEL=daily
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=campusone
DB_USERNAME=root
DB_PASSWORD=

# Drivers (configured for local development per specs)
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=false
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
CAMPUSONE_DOCUMENTS_DISK=private

# Mail Setup for Dev (Mailpit or Log)
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_FROM_ADDRESS="portal@example.edu.ng"
MAIL_FROM_NAME="${APP_NAME}"

# Shared hosting queue switch (false for local/VPS)
CAMPUSONE_QUEUE_VIA_SCHEDULER=false
```

### 2.3 Generate Application Key
```powershell
php artisan key:generate
```

---

## Step 3: Install Production Composer Packages

Run the following command to install the required production packages specified in `06-DEPLOYMENT-AND-DEV-SETUP.md`:

```powershell
composer require `
  laravel/fortify `
  nwidart/laravel-modules:^13 `
  wikimedia/composer-merge-plugin `
  spatie/laravel-permission `
  spatie/laravel-activitylog `
  spatie/laravel-settings `
  spatie/laravel-backup `
  spatie/simple-excel `
  barryvdh/laravel-dompdf `
  setasign/fpdi `
  simplesoftwareio/simple-qrcode `
  intervention/image-laravel `
  propaganistas/laravel-phone `
  mews/purifier
```

*(On Linux / Bash / Git Bash, use `\` instead of backtick `` ` `` at line breaks)*:
```bash
composer require \
  laravel/fortify \
  nwidart/laravel-modules:^13 \
  wikimedia/composer-merge-plugin \
  spatie/laravel-permission \
  spatie/laravel-activitylog \
  spatie/laravel-settings \
  spatie/laravel-backup \
  spatie/simple-excel \
  barryvdh/laravel-dompdf \
  setasign/fpdi \
  simplesoftwareio/simple-qrcode \
  intervention/image-laravel \
  propaganistas/laravel-phone \
  mews/purifier
```

### Package Manifest Breakdown
| Package | Role in CampusOne |
|---|---|
| `laravel/fortify` | Headless authentication (password resets, 2FA/TOTP engine, rate limiting) |
| `nwidart/laravel-modules:^13` | Modular monolith architecture (e.g., Hostel, CourseEvaluation modules) |
| `wikimedia/composer-merge-plugin` | Merges module `composer.json` files automatically into core |
| `spatie/laravel-permission` | Role & capability management layered with OrgScope |
| `spatie/laravel-activitylog` | Full audit trail of grading, billing, approvals, and admin actions |
| `spatie/laravel-settings` | Typed, database-backed, encrypted institution settings (payment keys, branding) |
| `spatie/laravel-backup` | Database and private documents backup management |
| `spatie/simple-excel` | Low-memory streaming CSV/XLSX score imports, student rosters, and broadsheet exports |
| `barryvdh/laravel-dompdf` | PDF generation for course forms, payment receipts, result slips, and invoices |
| `setasign/fpdi` | Merges stored PDFs for bulk course-form printing per department |
| `simplesoftwareio/simple-qrcode` | Generates SVG verification QR codes for printed course forms and receipts |
| `intervention/image-laravel` | Student passport photo resizing, cropping, and GD re-encoding |
| `propaganistas/laravel-phone` | E.164 phone number validation (especially Nigerian phone formats) |
| `mews/purifier` | HTML sanitisation for rich-text announcements and course instructions |

---

## Step 4: Install Development & Testing Composer Packages

Run the following command to install the development and testing suite:

```powershell
composer require --dev `
  pestphp/pest `
  pestphp/pest-plugin-laravel `
  pestphp/pest-plugin-arch `
  larastan/larastan `
  laravel/pint `
  barryvdh/laravel-debugbar `
  barryvdh/laravel-ide-helper `
  fakerphp/faker `
  mockery/mockery `
  nunomaduro/collision
```

*(On Linux / Bash / Git Bash)*:
```bash
composer require --dev \
  pestphp/pest \
  pestphp/pest-plugin-laravel \
  pestphp/pest-plugin-arch \
  larastan/larastan \
  laravel/pint \
  barryvdh/laravel-debugbar \
  barryvdh/laravel-ide-helper \
  fakerphp/faker \
  mockery/mockery \
  nunomaduro/collision
```

### Optional Packages (For Cloud / VPS / Production Monitoring)
If deploying to a VPS with Redis or using Sentry:
```powershell
composer require laravel/horizon sentry/sentry-laravel spatie/laravel-health spatie/laravel-csp
```

---

## Step 5: Configure `composer.json` (Merge Plugin & Custom Scripts)

Open `composer.json` in your project root and update the `extra`, `config`, and `scripts` blocks as specified in `06-DEPLOYMENT-AND-DEV-SETUP.md §2.4`:

### 5.1 Add to `extra`
```json
"extra": {
  "laravel": {
    "dont-discover": []
  },
  "merge-plugin": {
    "include": [
      "Modules/*/composer.json"
    ]
  }
}
```

### 5.2 Add to `config.allow-plugins`
```json
"config": {
  "optimize-autoloader": true,
  "preferred-install": "dist",
  "sort-packages": true,
  "allow-plugins": {
    "pestphp/pest-plugin": true,
    "php-http/discovery": true,
    "wikimedia/composer-merge-plugin": true
  }
}
```

### 5.3 Add Custom Dev Scripts
Update the `"scripts"` section in `composer.json`:
```json
"scripts": {
  "setup": [
    "composer install",
    "@php -r \"file_exists('.env') || copy('.env.example', '.env');\"",
    "@php artisan key:generate",
    "@php artisan migrate --seed",
    "@php artisan module:migrate --all",
    "npm install",
    "npm run build"
  ],
  "lint": "pint --test",
  "lint:fix": "pint",
  "analyse": "phpstan analyse --memory-limit=1G",
  "test": "pest --parallel",
  "ci": [
    "@lint",
    "@analyse",
    "@test"
  ]
}
```

### 5.4 Re-dump Autoload
Run this command to register the merge plugin and permissions:
```powershell
composer dump-autoload
```

---

## Step 6: Install Frontend & NPM Packages

Install Bootstrap 5.3, Alpine.js, Bootstrap Icons, Typography, and Vite build tooling:

### 6.1 Install Frontend Runtime Dependencies
```powershell
npm i bootstrap@^5.3 @popperjs/core bootstrap-icons alpinejs @fontsource/inter @fontsource/plus-jakarta-sans chart.js
```

### 6.2 Install Frontend Dev Tooling (Vite & Sass)
```powershell
npm i -D vite laravel-vite-plugin sass
```

### NPM Package Roles
- `bootstrap@^5.3` & `@popperjs/core`: Core UI components, modals, offcanvas, tooltips, and grid.
- `sass`: Compiles SCSS stylesheets for Evergreen Campus branding tokens across all 5 portals.
- `bootstrap-icons`: UI iconography for sidebar navigation, status indicators, and actions.
- `alpinejs`: Lightweight micro-interactions (collapsible drawers, sticky totals, live price meter).
- `@fontsource/plus-jakarta-sans`: Primary font for headers, page titles, and hero sections.
- `@fontsource/inter`: Tabular font for data tables, forms, and general body text.
- `chart.js`: Dashboard visual analytics (admissions, revenue, registration counters).

---

## Step 7: Publish Package Configurations & Migrations

Publish the vendor assets and configuration files for the installed packages:

### 7.1 Fortify (Authentication)
```powershell
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
```

### 7.2 Modules (nwidart/laravel-modules)
```powershell
php artisan vendor:publish --provider="Nwidart\Modules\LaravelModulesServiceProvider"
```

### 7.3 Spatie Permissions
```powershell
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

### 7.4 Spatie Activitylog
```powershell
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-config"
```

### 7.5 Spatie Settings
```powershell
php artisan vendor:publish --provider="Spatie\LaravelSettings\LaravelSettingsServiceProvider" --tag="migrations"
php artisan vendor:publish --provider="Spatie\LaravelSettings\LaravelSettingsServiceProvider" --tag="settings"
```

### 7.6 Spatie Backup
```powershell
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```

### 7.7 DomPDF
```powershell
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
```

### 7.8 Intervention Image
```powershell
php artisan vendor:publish --provider="Intervention\Image\Laravel\ServiceProvider"
```

### 7.9 Mews Purifier (HTML Sanitiser)
```powershell
php artisan vendor:publish --provider="Mews\Purifier\PurifierServiceProvider"
```

### 7.10 Initialize Pest Testing Framework
```powershell
php artisan pest:install
```

---

## Step 8: Configure Disks & Run Initial Migrations

### 8.1 Configure Private Disk in `config/filesystems.php`
Open `config/filesystems.php` and ensure the `'private'` disk is registered:
```php
'disks' => [
    // ...
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
        'throw' => false,
    ],

    'private' => [
        'driver' => 'local',
        'root'   => storage_path('app/private'),
        'serve'  => false, // never publicly routable directly
        'throw'  => true,
    ],
    // ...
],
```

### 8.2 Create Private Storage Folder
In PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path "storage\app\private"
```
*(On Linux/macOS: `mkdir -p storage/app/private`)*

### 8.3 Create Queue & Cache & Session Database Tables
Because our `.env` uses `database` for queue, cache, and session drivers, create the required migration tables:
```powershell
php artisan queue:table
php artisan cache:table
php artisan session:table
```
*(Note: On Laravel 11/12/13, some of these may already be included in `database/migrations/`).*

### 8.4 Run Migrations
Run the base migrations to set up the published package tables:
```powershell
php artisan migrate
```

### 8.5 Create Public Storage Symlink
```powershell
php artisan storage:link
```

---

## Step 9: Configure Vite (`vite.config.js`) & Build Assets

### 9.1 Update `vite.config.js`
Replace the content of `vite.config.js` with the CampusOne configuration from `06-DEPLOYMENT-AND-DEV-SETUP.md §2.5`:

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/scss/app.scss',
        'resources/scss/staff.scss',
        'resources/scss/print.scss',
        'resources/js/app.js'
      ],
      refresh: [
        'resources/views/**',
        'Modules/**/resources/views/**'
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
});
```

### 9.2 Create SCSS Directory & Initial Files
In PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path "resources\scss"
New-Item -ItemType File -Force -Path "resources\scss\app.scss"
New-Item -ItemType File -Force -Path "resources\scss\staff.scss"
New-Item -ItemType File -Force -Path "resources\scss\print.scss"
```

In `resources/scss/app.scss`:
```scss
// Fonts
@import "@fontsource/plus-jakarta-sans/latin.css";
@import "@fontsource/inter/latin.css";

// Icons
@import "bootstrap-icons/font/bootstrap-icons.css";

// Evergreen Campus Brand Colors
$primary: #0E8A4F;
$info: #0E7490;
$warning: #D97706;
$danger: #DC2626;
$success: #12B76A;
$secondary: #667085;
$dark: #101828;
$light: #F9FAFB;

// Import Bootstrap
@import "bootstrap/scss/bootstrap";
```

### 9.3 Build Assets
Run Vite in build mode:
```powershell
npm run build
```

---

## Step 10: Run & Verify Local Environment

### 10.1 Start Development Servers
Open two terminal tabs:

**Terminal 1 — Laravel Dev Server:**
```powershell
php artisan serve
```
*(If using Laragon or Herd, access `http://campusone.test` directly).*

**Terminal 2 — Vite Hot Module Reload:**
```powershell
npm run dev
```

### 10.2 Queue Worker (Required for billing, PDFs, & emails)
When testing background operations:
```powershell
php artisan queue:work --queue=billing,emails,default,results,pdf,exports
```

### 10.3 Scheduler Worker
To test window open/close and background monitors:
```powershell
php artisan schedule:work
```

### 10.4 Run Verification Tests
```powershell
# Run Pest test suite
php artisan test

# Run code style linter
composer lint

# Verify modules setup
php artisan module:list
```

---

## Troubleshooting & Windows Gotchas

1. **`Class 'IntlDateFormatter' not found` or amount-in-words error**:
   - Ensure `extension=intl` is uncommented in your active `php.ini`.
   - In Laragon: click *Menu → PHP → Extensions → intl* (ensure it has a checkmark), then restart Apache/Nginx.

2. **`GD extension is required for passport processing`**:
   - Ensure `extension=gd` is uncommented in `php.ini`.

3. **PowerShell Script Execution Error (`running scripts is disabled on this system`)**:
   - Run in PowerShell (as Administrator or CurrentUser):
     ```powershell
     Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
     ```

4. **Vite Sass Depreciation Warnings**:
   - The `quietDeps: true` setting in `vite.config.js` suppresses internal Sass warnings originating from Bootstrap's Sass files.

5. **`wikimedia/composer-merge-plugin` Prompt**:
   - If Composer asks whether you trust `wikimedia/composer-merge-plugin`, answer `y` (Yes). This allows modular extension folders under `Modules/*` to autoload their own dependencies.

---

### You are all set!
Your environment is now configured with the complete Laravel core, domain packages, styling system, and test runner ready for building out the CampusOne epics.
