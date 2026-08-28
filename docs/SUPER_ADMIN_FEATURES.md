# Gym OS v2.4 — Super Admin Panel Feature Documentation

**Last Updated:** August 28, 2026
**Live URL:** https://somilsharma2000.github.io/gym-os-frontend/#/super-admin
**Repository:** https://github.com/somilsharma2000/gym-os-frontend

---

## Overview

The Super Admin panel is the multi-tenant management layer of Gym OS. It allows the platform owner (Beyond Pixels) to create and manage multiple gym clients, generate branded websites, configure integrations, and monitor cross-gym statistics from a single dashboard.

---

## 1. Super Admin Dashboard (/super-admin)

### Stats Summary
- Total Gyms, Total Leads, Total Members, Active Memberships (aggregated across all gyms)

### Gym Cards Grid
Each gym card displays: branded color accent, gym name, ID, plan tier badge, owner info, location, website generation status, per-gym stats (leads/members/active), and two action buttons:
- Generate Website (creates branded HTML, downloads instantly)
- Integrations (links to that gym's integration settings)

### Add New Gym Modal
Form: gym name, subdomain, owner name/email/phone, address, description, primary/accent colors, plan tier. Creates GymProfile + GymSetting + GymAccount in one submission.

### Search & Filter
Real-time search by gym name, gym ID, or owner name.

---

## 2. Integration Hub (/settings)

### WhatsApp Business API
Fields: WABA ID, Phone Number ID, Access Token, Verify Token
Enables: Automated welcome messages, renewal reminders, payment receipts, lead follow-ups via WhatsApp.

### Social Media Integration
Per-gym credentials for Instagram, Facebook, LinkedIn (account IDs + access tokens).

### Payment Gateway
Razorpay (Key ID + Secret) for Indian payments, Stripe (Secret Key) for international.

### Automation Toggles (Manual Switches)
All have on/off switches: Welcome Lead, Renewal Reminder, Payment Receipt, At-Risk Alert, Daily Report, Low Attendance Alert, Trial Reminder, Class Capacity Alert, Weekly Revenue Report.

### Website & PWA
Website status tracking, URL field, PWA enable/disable toggle.

---

## 3. Website Generation

Clicking Generate Website creates a complete branded HTML page using the gym's custom colors, name, description, and phone. Includes: hero section, features, pricing (3 tiers), contact form wired to Gym OS CRM API, WhatsApp floating button. Downloads as HTML file ready to deploy.

---

## 4. PWA Support

manifest.json with Gym OS branding, service worker for offline caching, installable on any device. Per-gym PWA toggle in integration settings.

---

## 5. Backend Functions (26 total)

### New in v2.4 (7 functions)
createGym, getAllGyms, getGymProfile, updateGymProfile, updateIntegrations, getIntegrations, generateGymWebsite

### Existing from v2.0-v2.3 (19 functions)
getDashboardData, getLeads, createLeadWithConsent, updateLeadStatus, getMembers, getMemberships, getTrainers, getClasses, getCheckIns, getPayments, recordPayment, getExpenses, createExpense, getAtRiskMembers, qrCheckIn, getNotifications, createNotification, getGymSettings, updateGymSettings

---

## 6. Entity Schema

### GymProfile (New)
gym_id, gym_name, subdomain, owner_name/email/phone, address, description, branding (colors+logo), social links, hours, timezone, plan tier, status, website_generated, website_url, app_name, app_status

### GymSetting (Updated with 15+ integration fields)
WhatsApp (4 fields), Instagram (2), Facebook (2), LinkedIn (2), Telegram (2), Razorpay (2), Stripe (1), PWA enabled, website_status

---

## 7. Multi-Tenant Architecture

All gym data scoped by gym_id. Backend functions use ServiceRole to bypass RLS. Gym switching via localStorage gym_id key. Super Admin sees all gyms, gym owners see only their gym.

---

## 8. Planned for v2.5

1. Gym switcher dropdown in sidebar
2. Auto-deploy generated websites to GitHub Pages subfolders
3. PDF invoice generation on payment
4. Class self-enrollment for members
5. Gym owner login portal
6. Encrypted storage for API credentials
