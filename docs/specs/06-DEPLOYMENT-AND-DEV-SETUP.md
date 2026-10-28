# 06 — Development Environment, Packages & Deployment Guide

**Targets:** Local (Windows/macOS/Linux) · Laravel Cloud · VPS (Ubuntu 24.04) · Shared hosting (cPanel)
**Last updated:** 26 September 2026

---

## 1. System requirements

| Component | Minimum | Recommended |
|---|---|---|
| PHP | 8.3 | 8.4 |
| PHP extensions | bcmath, ctype, curl, dom, fileinfo, filter, gd, hash, intl*, mbstring, openssl, pcre, pdo_mysql, session, tokenizer, xml, zip | + opcache, redis (VPS) |
| Composer | 2.7 | latest 2.x |
| Node.js (build only) | 20 LTS | 22 LTS |
| MySQL | 8.0 | 8.4 LTS |
| MariaDB (shared hosting alt.) | 10.6 | 10.11 |
| Redis (optional) | 6 | 7 |

\* `intl` is used for amount-in-words and number formatting; a pure-PHP fallback exists for hosts without it.

## 2. Package manifest

### 2.1 Composer — production
```bash
composer require \
  laravel/fortify \
  nwidart/laravel-modules:^13 wikimedia/composer-merge-plugin \
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
Optional (VPS/Cloud): `laravel/horizon`, `sentry/sentry-laravel`, `spatie/laravel-health`, `spatie/laravel-csp`.

| Package | Why |
|---|---|
| laravel/fortify | Headless auth (password reset, 2FA); portal-specific login controllers and Bootstrap views are ours |
| nwidart/laravel-modules | Module system (v13 targets Laravel 13 / PHP 8.3+) |
| spatie/laravel-permission | Roles/permissions (combined with our OrgScope layer) |
| spatie/laravel-activitylog | Audit trail |
| spatie/laravel-settings | Typed, cached, encrypted-capable settings |
| spatie/laravel-backup | DB + private files backups |
| spatie/simple-excel | Streaming CSV/XLSX: student/course/score imports and all exports (low memory, shared-hosting friendly) |
| barryvdh/laravel-dompdf | Pure-PHP PDFs: course forms, invoices, receipts, statements, broadsheets |
| setasign/fpdi | Merge stored PDFs for department bulk course-form printing |
| simplesoftwareio/simple-qrcode | SVG QR codes on course forms and receipts |
| intervention/image-laravel | Passport re-encoding (GD) |
| propaganistas/laravel-phone | Nigerian phone validation |
| mews/purifier | Sanitise announcement/instruction rich text |

### 2.2 Composer — development
```bash
composer require --dev \
  pestphp/pest pestphp/pest-plugin-laravel pestphp/pest-plugin-arch \
  larastan/larastan laravel/pint \
  barryvdh/laravel-debugbar barryvdh/laravel-ide-helper \
  fakerphp/faker mockery/mockery nunomaduro/collision
```

### 2.3 NPM
```bash
npm i bootstrap@^5.3 @popperjs/core bootstrap-icons alpinejs \
      @fontsource/inter @fontsource/plus-jakarta-sans chart.js
npm i -D vite laravel-vite-plugin sass
```

### 2.4 `composer.json` excerpts
```json
{
  "require": { "php": "^8.3" },
  "extra": { "merge-plugin": { "include": ["Modules/*/composer.json"] } },
  "config": {
    "optimize-autoloader": true, "sort-packages": true,
    "allow-plugins": { "wikimedia/composer-merge-plugin": true, "pestphp/pest-plugin": true }
  },
  "scripts": {
    "setup": [
      "composer install",
      "@php -r \"file_exists('.env') || copy('.env.example', '.env');\"",
      "@php artisan key:generate",
      "@php artisan migrate --seed",
      "@php artisan module:migrate --all",
      "npm install", "npm run build"
    ],
    "lint": "pint --test",
    "analyse": "phpstan analyse --memory-limit=1G",
    "test": "pest --parallel",
    "ci": ["@lint", "@analyse", "@test"]
  }
}
```

### 2.5 `vite.config.js`
```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/scss/app.scss', 'resources/scss/staff.scss', 'resources/scss/print.scss', 'resources/js/app.js'],
      refresh: ['resources/views/**', 'Modules/**/resources/views/**'],
    }),
  ],
  css: { preprocessorOptions: { scss: { quietDeps: true } } },
});
```

### 2.6 Route files registration (`bootstrap/app.php`)
```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        foreach (['student','lecturer','department','faculty','admin'] as $portal) {
            Route::middleware(['web'])->prefix($portal)->name("$portal.")
                ->group(base_path("routes/$portal.php"));
        }
        Route::middleware('api')->prefix('webhooks')->group(base_path('routes/webhooks.php'));
    },
)
->withMiddleware(function (Middleware $m) {
    $m->alias(['portal' => EnsurePortal::class, 'scope' => ApplyOrgScope::class,
               '2fa' => EnsureTwoFactor::class, 'idle' => IdleTimeout::class]);
    $m->validateCsrfTokens(except: ['webhooks/*']);
})
```

## 3. Local development setup

### 3.1 Option A — Windows with Laragon (recommended for this team)
1. Install **Laragon Full**; switch PHP to 8.3/8.4 (*Menu → PHP → Version*), MySQL 8.
2. Enable extensions: `intl`, `gd`, `zip`, `fileinfo` (*Menu → PHP → Extensions*).
3. Install Node 22 LTS and Git for Windows.
4. Clone into `C:\laragon\www\campusone` — Laragon auto-creates `http://campusone.test`.
5. Run:
   ```bash
   composer setup
   php artisan campusone:install     # institution name + first Super Admin
   composer run dev                 # serves, runs queue:listen, logs (pail) and vite concurrently
   ```

### 3.2 Option B — macOS/Windows with Laravel Herd
`herd link campusone` in the project folder, use Herd's MySQL (Pro) or DBngin, then the same commands.

### 3.3 Option C — Docker via Laravel Sail
```bash
composer require laravel/sail --dev
php artisan sail:install --with=mysql,redis,mailpit
./vendor/bin/sail up -d
./vendor/bin/sail composer setup
```

### 3.4 Mail in development
Use **Mailpit** (bundled with Sail/Herd) or `MAIL_MAILER=log`. Never point dev at a real SMTP with real students.

### 3.5 Payments in development
Use Paystack/Flutterwave **test keys**. Expose webhooks with `ngrok http https://campusone.test` (or Herd share / Expose) and set the webhook URL in each gateway's test dashboard to `https://<tunnel>/webhooks/paystack` and `/webhooks/flutterwave`.

### 3.6 Seed demo data
```bash
php artisan db:seed --class=DemoUniversitySeeder
# 1 session (2 semesters), 3 faculties, 8 departments, 10 programmes with curricula,
# 180 courses with prerequisites, 25 lecturers, 1,200 students across levels,
# 1 open registration window, fee items, and published results for the previous session
```
The seeder prints one demo login per portal (Student, Lecturer, Department, Faculty, Admin). It refuses to run in production.

### 3.7 Everyday commands
| Task | Command |
|---|---|
| Run tests | `composer test` / `php artisan test --filter=Eligibility` |
| Lint & fix | `./vendor/bin/pint` |
| Static analysis | `composer analyse` |
| New module | `php artisan module:make Hostel` |
| Module migration | `php artisan module:make-migration create_hostels_table Hostel` then `php artisan module:migrate Hostel` |
| Enable/disable module | `php artisan module:enable Announcements` / `module:disable` |
| IDE helpers | `php artisan ide-helper:models -N` |
| Queue worker | `php artisan queue:work --queue=billing,emails,default,results,pdf,exports` |
| Scheduler | `php artisan schedule:work` |

## 4. Configuration

### 4.1 `.env.example` (annotated)
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

# Drivers — choose per environment (see matrix §4.2)
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=false
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
CAMPUSONE_DOCUMENTS_DISK=private        # private | s3

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_FROM_ADDRESS="portal@example.edu.ng"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=auto
AWS_BUCKET=
AWS_ENDPOINT=
AWS_USE_PATH_STYLE_ENDPOINT=false

# Shared hosting: let the scheduler drain the DB queue each minute
CAMPUSONE_QUEUE_VIA_SCHEDULER=false

SENTRY_LARAVEL_DSN=
```
Gateway keys are **not** in `.env`; they are entered in *Settings → Payments* and stored encrypted (so non-technical admins can rotate them). `.env` fallbacks `PAYSTACK_SECRET_KEY` etc. are supported for CI.

### 4.2 Environment driver matrix
| Key | Local | Laravel Cloud | VPS | Shared hosting |
|---|---|---|---|---|
| `CACHE_STORE` | database | (injected KV/Redis) | redis | database *(or file)* |
| `SESSION_DRIVER` | database | database/redis | redis | database |
| `QUEUE_CONNECTION` | database | database/redis (Cloud workers) | redis | database |
| `CAMPUSONE_DOCUMENTS_DISK` | private | **s3** (Cloud bucket) | private or s3 | private |
| `CAMPUSONE_QUEUE_VIA_SCHEDULER` | false | false | false | **true** |
| `SESSION_SECURE_COOKIE` | false | true | true | true |

### 4.3 `config/campusone.php` (key options)
```php
return [
    'documents_disk'        => env('CAMPUSONE_DOCUMENTS_DISK', 'private'),
    'queue_via_scheduler'   => (bool) env('CAMPUSONE_QUEUE_VIA_SCHEDULER', false),
    'matric_format'         => 'U{YY}/{FAC}/{DEPT}/{SEQ:4}',
    'matric_sequence_scope' => 'department_year',       // department_year | faculty_year | global_year
    'invoice_format'        => 'INV/{SESSION}/{SEM}/{SEQ:6}',
    'default_unit_limits'   => ['min' => 15, 'max' => 24],
    'eligible_list_cache_ttl' => 600,                   // seconds
    'gpa_chunk_size'        => 200,
    'payment_reverify_window_hours' => 48,
    'staff_idle_timeout_minutes'    => 30,
    'student_idle_timeout_minutes'  => 60,
    'export_link_hours'     => 24,
];
```
Policy settings (billing on submit/approve, course-form payment threshold, carry-over pricing, CGPA attempt policy, transfer defaults) live in *Admin → Settings*, not config, so Registry can change them without a deploy.

### 4.4 Filesystem disks (`config/filesystems.php`)
```php
'private' => [
    'driver' => 'local',
    'root'   => storage_path('app/private'),
    'serve'  => false,          // never publicly routable
    'throw'  => true,
],
```

### 4.5 Scheduler (`routes/console.php`)
```php
Schedule::command('campusone:sync-window-status')->everyMinute()->withoutOverlapping()->onOneServer();   // registration & transfer windows
Schedule::job(new ReverifyPendingPayments)->everyTenMinutes()->withoutOverlapping();
Schedule::command('campusone:send-window-reminders')->hourly();          // 48h / 24h before close
Schedule::command('campusone:publish-scheduled-results')->everyFiveMinutes();
Schedule::command('campusone:reconcile-counters')->dailyAt('02:00');     // offering registered_count, stats tables
Schedule::command('campusone:purge-exports')->dailyAt('03:00');
Schedule::command('activitylog:clean --days=1825')->weekly();
Schedule::command('backup:clean')->dailyAt('01:00');
Schedule::command('backup:run')->dailyAt('01:30');
Schedule::call(fn () => cache()->put('scheduler:heartbeat', now(), 300))->everyMinute();

if (config('campusone.queue_via_scheduler')) {   // shared hosting mode
    Schedule::command('queue:work --queue=billing,emails,default,results,pdf,exports --stop-when-empty --max-time=50 --tries=3')
        ->everyMinute()->withoutOverlapping(2);
}
```

### 4.6 Queues
| Queue | Jobs | Priority |
|---|---|---|
| `billing` | BuildInvoice, supplementary invoices, credit notes | highest (students wait for invoices) |
| `emails` | all notifications | high |
| `default` | webhooks processing, misc listeners | normal |
| `results` | ComputeStudentGpa batches, promotion batches | normal |
| `pdf` | course forms, receipts, statements, bulk prints | normal |
| `exports` | reports, imports | low |

## 5. Database conventions
- Charset `utf8mb4`, collation `utf8mb4_unicode_ci`; InnoDB; strict mode on.
- Every FK indexed; composite indexes per `05-ARCHITECTURE.md §4.2`.
- Migrations are **forward-only in production** (`down()` still written for local).
- Never edit a released migration — add a new one.
- `php artisan migrate --pretend` reviewed in PR for schema changes on large tables.

## 6. Deploying to Laravel Cloud

1. **Create application** in Laravel Cloud from the GitHub repository; choose region closest to users (EU West is typically the lowest-latency option for Nigeria — verify current regions in the Cloud dashboard).
2. **Attach resources** to the environment:
   - Database: Laravel MySQL (or a supported MySQL cluster).
   - Cache: the managed KV/Redis-compatible cache.
   - **Object storage bucket** — required, because the app filesystem is ephemeral. Set `CAMPUSONE_DOCUMENTS_DISK=s3`, and use the injected `AWS_*` variables (mark bucket **private**).
3. **Environment variables:** `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, `APP_TIMEZONE=Africa/Lagos`, mail provider credentials, `SESSION_SECURE_COOKIE=true`, `SENTRY_LARAVEL_DSN`.
4. **Build commands:**
   ```bash
   composer install --no-dev --optimize-autoloader --no-interaction
   npm ci && npm run build
   ```
5. **Deploy commands:**
   ```bash
   php artisan migrate --force
   php artisan module:migrate --all --force
   php artisan optimize
   ```
6. Enable **Scheduler** and create a **queue worker** (queues `billing,emails,default,results,pdf,exports`), sized up during registration and result periods.
7. Add custom domain (e.g. `portal.example.edu.ng`); TLS is managed.
8. First run: `php artisan campusone:install` via Cloud command runner.
9. Configure gateway webhooks to `https://portal.example.edu.ng/webhooks/{paystack|flutterwave}`.

## 7. Deploying to a VPS (Ubuntu 24.04 LTS)

### 7.1 Server provisioning (once)
```bash
sudo apt update && sudo apt upgrade -y
sudo add-apt-repository ppa:ondrej/php -y && sudo apt update
sudo apt install -y nginx mysql-server redis-server supervisor unzip git curl ufw certbot python3-certbot-nginx \
  php8.4-fpm php8.4-cli php8.4-mysql php8.4-redis php8.4-mbstring php8.4-xml php8.4-curl \
  php8.4-zip php8.4-gd php8.4-intl php8.4-bcmath php8.4-opcache
curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo mysql_secure_installation
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
sudo adduser deploy && sudo usermod -aG www-data deploy
```
Create DB and user:
```sql
CREATE DATABASE campusone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'campusone'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON campusone.* TO 'campusone'@'localhost';
FLUSH PRIVILEGES;
```

### 7.2 Directory layout (zero-downtime)
```
/var/www/campusone/
├── releases/20261001120000/
├── shared/.env
├── shared/storage/
└── current -> releases/20261001120000
```

### 7.3 Nginx (`/etc/nginx/sites-available/campusone`)
```nginx
server {
    listen 80;
    server_name portal.example.edu.ng;
    root /var/www/campusone/current/public;
    index index.php;
    client_max_body_size 10M;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }
    location ~* \.(css|js|woff2|svg|png|jpg|ico)$ { expires 1y; access_log off; add_header Cache-Control "public, immutable"; }
    location ~ /\.(?!well-known) { deny all; }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/campusone /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d portal.example.edu.ng
```

### 7.4 PHP tuning (`/etc/php/8.4/fpm/conf.d/99-campusone.ini`)
```ini
upload_max_filesize = 10M
post_max_size = 12M
memory_limit = 256M
opcache.enable = 1
opcache.memory_consumption = 192
opcache.validate_timestamps = 0   ; reload php-fpm on deploy
expose_php = Off
```

### 7.5 Supervisor (`/etc/supervisor/conf.d/campusone-worker.conf`)
```ini
[program:campusone-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/campusone/current/artisan queue:work redis --queue=billing,emails,default,results,pdf,exports --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=deploy
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/campusone/shared/storage/logs/worker.log
stopwaitsecs=3600
```
(Or `php artisan horizon` as a single supervisor program if Horizon is installed.)

### 7.6 Cron (`crontab -u deploy -e`)
```cron
* * * * * cd /var/www/campusone/current && php artisan schedule:run >> /dev/null 2>&1
```

### 7.7 Deploy script (`deploy/vps-deploy.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail
APP=/var/www/campusone; REL=$APP/releases/$(date +%Y%m%d%H%M%S)
git clone --depth 1 --branch "${1:-main}" git@github.com:Samboy2022/campusone.git "$REL"
cd "$REL"
ln -s $APP/shared/.env .env
rm -rf storage && ln -s $APP/shared/storage storage
composer install --no-dev --optimize-autoloader --no-interaction
npm ci && npm run build && rm -rf node_modules
php artisan migrate --force
php artisan module:migrate --all --force
php artisan optimize
ln -sfn "$REL" $APP/current
sudo systemctl reload php8.4-fpm
php artisan queue:restart
ls -1dt $APP/releases/* | tail -n +6 | xargs -r rm -rf   # keep 5 releases
echo "Deployed $REL"
```
Laravel Forge + Envoyer are a managed alternative to the above.

## 8. Deploying to shared hosting (cPanel)

> Works without SSH. Terminal access (if your host provides it) makes steps 4–6 easier.

1. **Check PHP**: cPanel → *MultiPHP Manager* → set the domain to **PHP 8.3+**; *Select PHP Extensions*: enable `fileinfo`, `gd`, `intl`, `mbstring`, `pdo_mysql`, `zip`, `bcmath`. Set `upload_max_filesize=10M`, `memory_limit=256M`.
2. **Build locally or use the CI release artifact** (`campusone-vX.Y.Z.zip`) which already contains `vendor/` (no dev) and `public/build/`. Shared hosts usually lack Node, so never build there.
3. **Upload**: in *File Manager*, upload the zip to `/home/USER/campusone` (**outside** `public_html`) and extract.
4. **Document root**:
   - *Preferred:* create the site as a subdomain/addon domain (e.g. `portal.example.edu.ng`) whose document root is `/home/USER/campusone/public`.
   - *If the main domain must use `public_html`:* copy the contents of `campusone/public/` into `public_html/` and edit `public_html/index.php`:
     ```php
     require __DIR__.'/../campusone/vendor/autoload.php';
     $app = require_once __DIR__.'/../campusone/bootstrap/app.php';
     ```
     and in `AppServiceProvider::register()` bind `$this->app->usePublicPath(base_path('../public_html'));` (guarded by `env('CAMPUSONE_PUBLIC_PATH')`).
5. **Database**: *MySQL Databases* → create DB + user, grant ALL. Import nothing — migrations will create tables.
6. **`.env`**: copy `.env.example` → `.env` in `/home/USER/campusone`, set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, DB credentials, cPanel mail SMTP (`mail.example.edu.ng`, port 465, `MAIL_SCHEME=smtps`), drivers per §4.2 shared column (`CACHE_STORE=database`, `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`, `CAMPUSONE_QUEUE_VIA_SCHEDULER=true`).
7. **Run first-time commands** — via cPanel *Terminal*:
   ```bash
   cd ~/campusone
   php artisan key:generate --force
   php artisan migrate --force --seed
   php artisan module:migrate --all --force
   php artisan storage:link        # if symlinks blocked, the /branding route fallback serves logos
   php artisan optimize
   php artisan campusone:install
   ```
   *No terminal?* Use the **web installer** at `/install` (enabled only when `storage/installed` does not exist and `APP_KEY` is set; protected by a one-time token printed in `storage/logs/install-token.txt`), which runs the same steps and then disables itself.
8. **Cron job** (cPanel → *Cron Jobs*, every minute):
   ```
   /usr/local/bin/php /home/USER/campusone/artisan schedule:run >> /dev/null 2>&1
   ```
   (Confirm the PHP binary path with your host, e.g. `/opt/cpanel/ea-php84/root/usr/bin/php`.) This one cron runs the scheduler **and** drains the queue every minute.
9. **Permissions**: `storage/` and `bootstrap/cache/` writable (755 dirs / 644 files typically suffice under suPHP/LSAPI).
10. **SSL**: cPanel *SSL/TLS Status* → run AutoSSL; then set `SESSION_SECURE_COOKIE=true`.
11. **Updates**: upload the new release zip, extract over the old folder **except** `.env` and `storage/`, then run `php artisan migrate --force && php artisan optimize` (terminal or web updater).

**Shared hosting limits to accept:** emails leave within ~1 minute (cron cadence); very large exports may hit `max_execution_time` — keep exports chunked (built-in); mail providers on shared hosts often cap ~200–500 emails/hour → set the broadcast rate limit accordingly or use an external SMTP (Mailgun, Zoho, Brevo).

## 9. CI/CD — GitHub Actions (`.github/workflows/ci.yml`)
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.4
        env: { MYSQL_DATABASE: campusone_test, MYSQL_ROOT_PASSWORD: secret }
        ports: ['3306:3306']
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-retries=5
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.4', extensions: 'mbstring, intl, gd, zip, pdo_mysql, bcmath', coverage: pcov }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: composer install --no-interaction --prefer-dist
      - run: npm ci && npm run build
      - run: cp .env.ci .env && php artisan key:generate
      - run: composer lint
      - run: composer analyse
      - run: php artisan test --parallel --coverage --min=70
        env: { DB_HOST: 127.0.0.1, DB_DATABASE: campusone_test, DB_USERNAME: root, DB_PASSWORD: secret }
      - run: composer audit && npm audit --audit-level=high

  release:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.3' }        # lowest supported, so the artifact runs on shared hosts
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: composer install --no-dev --optimize-autoloader --no-interaction
      - run: npm ci && npm run build && rm -rf node_modules
      - run: zip -r campusone-${GITHUB_REF_NAME}.zip . -x ".git/*" "tests/*" ".github/*" ".env*"
      - uses: softprops/action-gh-release@v2
        with: { files: 'campusone-*.zip' }
```
Branching: trunk-based with short-lived feature branches (`feat/S5.4-wizard-engine`), PR titles referencing story IDs, semantic version tags.

## 10. Go-live checklist
- [ ] `APP_ENV=production`, `APP_DEBUG=false`; `APP_KEY` backed up securely (it decrypts gateway keys and 2FA secrets).
- [ ] HTTPS forced; `SESSION_SECURE_COOKIE=true`; HSTS after TLS verified.
- [ ] All five portal logins tested with real accounts; Super Admin, Bursary and Faculty Admin have 2FA enabled; demo data absent.
- [ ] Every programme's curriculum validation report has no blocking issues; offerings generated for the first semester.
- [ ] Grading scheme, degree classes and unit limits confirmed with Academic Affairs.
- [ ] Fee items and rules reviewed by Bursary; "Who pays this?" previews checked for 3 sample students per faculty.
- [ ] Gateways in live mode; webhook URLs and secrets set; a real ₦100 invoice paid and verified end-to-end, then cancelled.
- [ ] Course form, receipt and statement PDFs approved by Registry (crest, signatures, wording).
- [ ] Mail SPF/DKIM/DMARC configured; test emails land in Gmail inbox.
- [ ] Cron running (scheduler heartbeat green); queues draining (< 2 min lag).
- [ ] Load test (S14.3) passed on the production-sized environment.
- [ ] Backups ran and a restore was rehearsed on staging.
- [ ] Scope-leak test suite green on the release commit.
- [ ] Registration window audience/dates double-checked; staggering by level configured if needed.

## 11. Backup & restore procedure
**Backup:** `spatie/laravel-backup` dumps MySQL and zips `storage/app/private` to the `backups` disk (S3-compatible recommended: Cloudflare R2, DigitalOcean Spaces, Backblaze B2). Shared hosting without `mysqldump` access → rely on cPanel's *Backup Wizard* scheduled daily and download weekly.

**Restore (rehearse each release):**
1. `php artisan down --secret=<token>`
2. Restore DB: `mysql -u campusone -p campusone < db-dumps/mysql-campusone.sql`
3. Restore files into `storage/app/private`.
4. `php artisan optimize:clear && php artisan optimize && php artisan up`
5. Verify: log in to each portal, open a registration, download a course form and a receipt, view a published result, check `/admin/system/health`.

## 12. Troubleshooting
| Symptom | Likely cause / fix |
|---|---|
| Emails never arrive (shared hosting) | Cron not running or wrong PHP path → check scheduler heartbeat; inspect `jobs` table growth. |
| 419 Page Expired on forms | Session cookie domain/secure mismatch → verify `APP_URL`, `SESSION_DOMAIN`, HTTPS. |
| Payment paid but still "Unpaid" | Webhook blocked or wrong secret → check `webhook_events` for `signature_valid=0`; use "Re-verify now" in Bursary. |
| Student sees empty course list | No active curriculum version for their cohort, or offerings not generated → run the curriculum validation report and "Generate offerings". |
| "Not offered this semester" everywhere | Course `semester_type` mismatch (First vs Second) or offering closed. |
| Department sees other departments' data | Scope bug — run `php artisan test --filter=ScopeLeak`; check the controller uses `scopedTo()` or a policy-bound model. |
| GPA not updated after publish | `results` queue not running → check failed jobs; re-run `php artisan campusone:recompute-gpa --semester=ID`. |
| Bulk course-form print times out on shared hosting | Keep the queued path (default); reduce chunk size in `config/campusone.php`. |
| PDF shows boxes instead of ₦ | Non-DejaVu font used in template → use `DejaVu Sans`. |
| Uploads fail > 2 MB | `upload_max_filesize` / Nginx `client_max_body_size` (score CSVs and imports can be large). |
| Module routes 404 | Module disabled or caches stale → `php artisan module:enable X && php artisan optimize:clear`. |
| `Class Modules\... not found` | merge-plugin not configured → check `extra.merge-plugin.include` and run `composer dump-autoload`. |
| Slow admin queue | Missing indexes after manual DB changes → `php artisan db:show --counts` and compare with migrations. |
