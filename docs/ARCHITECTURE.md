# 🏗️ System Architecture: Option A (Lean Launch)

## Overview
This repository implements the **"Lean Launch"** architecture for the Hyper Vibe Coding Course. The goal is to minimize technical debt and maximize speed to market by leveraging proven external platforms for complex backend functionality (Payments, Auth, Content Delivery) while maintaining a custom, high-performance frontend for marketing.

## 🧩 Components

### 1. Frontend (Static Site)
- **Technology**: HTML5, CSS3, Vanilla JavaScript
- **Hosting**: GitHub Pages
- **Location**: `/frontend/public`
- **Responsibility**: 
  - Landing Page (Conversion)
  - Course Catalog (Discovery)
  - Brand Identity (The "Vibe")
- **Key Files**: `index.html`, `styles.css` (inline for now)

### 2. Backend (External Services)
Instead of a custom API, we use specialized SaaS tools:

| Feature | Provider | Integration Method |
|---------|----------|-------------------|
| **Payments** | Gumroad / Stripe Payment Links | Direct URL redirects |
| **Course Content** | Gumroad / Teachable | Hosted externally |
| **Gamification** | Airtable + Zapier | Webhooks (Future) |
| **Community** | Discord | Invite Links |

### 3. CI/CD Pipeline
- **Provider**: GitHub Actions
- **Triggers**: Push to `main`
- **Jobs**:
  - `lint`: Checks Markdown syntax
  - `test`: Validates HTML structure and links
  - `deploy`: Pushes `frontend/public` to GitHub Pages

## 🔄 Data Flow
1. **User Visits**: `https://w3lshdog.github.io/Hyper-Vibe-Coding-Course/`
2. **User Clicks "Buy"**: Redirects to `gumroad.com/...`
3. **User Pays**: Receives email with Course Content access + Discord Invite
4. **User Joins Discord**: Verifies purchase via bot (optional)

## 🛡️ Security & Scalability
- **Security**: No database to hack. No servers to patch. HTTPS provided by GitHub.
- **Scalability**: GitHub Pages handles global traffic via CDN. Gumroad handles payment spikes.

## 🚀 Future Roadmap (Phase 2)
Once we hit $10k MRR, we migrate to **Option B**:
- **Frontend**: Next.js (SEO, Dynamic Content)
- **Backend**: Supabase (Auth, Database)
- **Hosting**: Vercel
