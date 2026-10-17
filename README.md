# 🎬 SlideCast Pro — PPTX to MP4 Conversion Platform

> Transform PowerPoint presentations into professional MP4 videos with embedded narration.

## 🎯 Target Audience
- 👨‍🏫 **Lecturers** — Create video lectures from slide decks
- 🎓 **Students** — Convert class presentations into video submissions
- 🏋️ **Trainers** — Produce training videos from corporate presentations
- 🎬 **Content Creators** — Turn informational slides into engaging video content

## ✨ Features

### Frontend (React + Bootstrap 5.3)
- 🏠 Landing page with feature highlights and target audience sections
- 📤 Drag & drop PPTX upload with real-time conversion progress
- 📊 Dashboard with conversion history and statistics
- 💰 Pricing page with subscription plans and credit packs
- 🔐 Authentication (Login/Register) with role selection
- 📱 Fully responsive design with dark theme
- 🔄 PWA installable with service worker

### Backend (Procedural PHP + MySQLi)
- 📦 One-click installation wizard (`install.php`)
- 🔄 Automatic upgrade system with database migrations
- 🗄️ Procedural MySQLi database layer
- 🎥 FFmpeg-based video rendering engine
- 🔊 Narration audio extraction and synchronization
- 💳 Credit-based monetization system
- 🔌 REST API endpoints
- 🛡️ Secure authentication with password hashing

### Video Output
- **480p** (854×480) — 1 credit
- **720p** (1280×720) — 2 credits  
- **1080p** (1920×1080) — 3 credits

## 💰 Monetization

### Subscription Plans
| Plan | Price | Credits/Month | Features |
|------|-------|---------------|----------|
| Free | $0 | 5 | 480p only, 20 slides max |
| Professional | $19/mo | 50 | All resolutions, unlimited slides |
| Enterprise | $79/mo | 200 | 4K, team features, priority support |

### Credit Packs
- 10 credits — $9
- 25 credits — $19 (Best Value)
- 50 credits — $35
- 100 credits — $59

## 📁 Project Structure

```
slidecast-pro/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── backend/               # PHP Backend Files
│       ├── install.php        # Installation wizard
│       ├── convert.php        # Video conversion engine
│       ├── database_schema.sql # Complete DB schema
│       ├── config.php         # Configuration (generated)
│       ├── db_connect.php     # MySQLi connection handler
│       ├── auth.php           # Authentication functions
│       ├── upgrade.php        # Upgrade system
│       ├── api.php            # REST API endpoints
│       └── index.php          # Main entry point
├── src/
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # Entry point
│   ├── index.css              # Global styles (Bootstrap-based)
│   ├── context/
│   │   └── AppContext.tsx     # Global state management
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation bar
│   │   └── Footer.tsx         # Footer
│   └── pages/
│       ├── Home.tsx           # Landing page
│       ├── Upload.tsx         # PPTX upload & conversion
│       ├── Dashboard.tsx      # User dashboard
│       ├── Pricing.tsx        # Plans & credits
│       ├── Login.tsx          # Login page
│       ├── Register.tsx       # Registration page
│       ├── About.tsx          # About page
│       └── BackendFiles.tsx   # PHP source viewer
├── index.html                 # HTML entry with PWA support
└── README.md                  # This file
```

## 🚀 Installation (PHP Backend)

### Requirements
- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.3+
- FFmpeg
- LibreOffice (headless mode)
- Apache/Nginx with mod_rewrite

### Quick Install
```bash
# 1. Extract files to web root
unzip slidecast-pro-v2.1.0.zip -d /var/www/

# 2. Set permissions
chmod -R 755 /var/www/slidecast-pro/
chmod -R 777 uploads/ output/ temp/ logs/ backups/

# 3. Visit install.php in browser
# Complete the installation wizard

# 4. Delete install.php for security
rm install.php
```

### Frontend Development
```bash
npm install
npm run dev      # Development server
npm run build    # Production build
```

## 🔄 Upgrade System

The platform includes a built-in upgrade system:
1. Checks for available updates from the update server
2. Downloads and applies update packages
3. Runs database migrations automatically
4. Creates backups before applying changes
5. Supports rollback if needed

## 🛡️ Security Features
- Password hashing with `password_hash()` (bcrypt)
- Prepared statements for all database queries (SQL injection prevention)
- CSRF protection on forms
- Session regeneration on login
- File upload validation (type, size)
- Input sanitization
- API key authentication

## 📄 License
© 2026 SlideCast Pro. All rights reserved.
