# 🚀 Client Onboarding & Fast Deployment Playbook
### Vertical AI WhatsApp Sales Assistant & Dental Operating System

This template is a **production-ready, white-label vertical AI operating system**. Whenever you acquire a new dental clinic or medical practice client, follow this 5-minute playbook (or feed this file to any AI coding assistant) to hook up all of the client's tools, branding, and data.

---

## ⚡ Quick Start: 3-Step Client Configuration

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│   1. Set Environment Keys │ ──►  │  2. Run Supabase Database │ ──►  │    3. Deploy to Vercel    │
│     (Meta + Gemini + DB)  │      │       SQL Migrations      │      │     (1-Click Production)  │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

---

## 📁 Key Files to Customize for Each Client

| Customization Area | File Path | What to Change |
| :--- | :--- | :--- |
| **Branding & Doctor Info** | `client/src/data/mockData.ts` | Clinic Name, Doctor Name, Bio, Phone, Email, Address |
| **Treatments & Fee Schedule** | `client/src/pages/LandingPage.tsx` | Fees table rows (e.g. Whitening £395, Implants £2,800) |
| **Booking Slots Catalog** | `client/src/components/booking/InteractiveSlotPicker.tsx` | Services list in 2-step appointment picker |
| **Conversational AI Knowledge** | `client/src/services/geminiHumanEngine.ts` | Exact treatment quotes and triage guidelines |
| **API Keys & Credentials** | `.env` (from `.env.example`) | Meta WhatsApp Token, Supabase URL, Gemini Key |

---

## 🛠️ Step-by-Step Setup Guide

### Step 1: Clone & Configure `.env`
Create a `.env` file in the root directory and fill in the client's keys:

```bash
# 1. Supabase (Database & pgvector)
SUPABASE_URL=https://[client-project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[client_service_role_key]

# 2. Google Gemini 2.5 Flash
GEMINI_API_KEY=[client_gemini_api_key]
GEMINI_MODEL=gemini-2.5-flash

# 3. Meta WhatsApp Cloud API
WHATSAPP_API_TOKEN=[client_meta_permanent_access_token]
WHATSAPP_PHONE_NUMBER_ID=[client_phone_number_id]
WHATSAPP_WABA_ID=[client_waba_id]
WHATSAPP_VERIFY_TOKEN=whatsapp_sales_assistant_verify_token

# 4. Morning Executive Briefing Alerts
OWNER_NOTIFICATION_PHONE=[+1234567890]
OWNER_NOTIFICATION_EMAIL=[owner@clientclinic.com]
CLINIC_NAME=[Client Practice Name]
```

---

### Step 2: Initialize Client's Database (Supabase)
In your client's Supabase dashboard $\rightarrow$ **SQL Editor**, run the 3 migration files located in `supabase/migrations/`:
1. `supabase/migrations/20260829_init_schema.sql` (Tables: leads, appointments, vector chunks)
2. `supabase/migrations/20260831_enable_rls_security.sql` (HIPAA/GDPR Row Level Security)
3. `supabase/migrations/20260902_ai_selftraining_and_metrics.sql` (AI Self-Training Queue & Missed Revenue Radar)

---

### Step 3: Configure Meta WhatsApp Webhook
In the **Meta Developers Portal**:
1. Go to **WhatsApp** $\rightarrow$ **Configuration** $\rightarrow$ **Webhook**.
2. **Callback URL**: `https://[client-deployment-domain].vercel.app/api/v1/whatsapp/webhook`
3. **Verify Token**: `whatsapp_sales_assistant_verify_token`
4. Subscribe to webhook field: `messages`.

---

### Step 4: Test & Verify Locally
```bash
# 1. Install dependencies
npm install
npm --prefix client install

# 2. Run backend and frontend together
npm run dev:backend
npm --prefix client run dev
```

---

### Step 5: 1-Click Deploy to Vercel
```bash
npx vercel --prod
```

---

## 🤖 Instructions for AI Coding Assistants
If you are an AI assistant tasked with onboarding a new client using this template:
1. Ask the user for the client's **Clinic Name**, **Doctor/Staff Roster**, **Treatments & Prices**, and **Credentials**.
2. Update `mockData.ts`, `LandingPage.tsx`, `InteractiveSlotPicker.tsx`, and `geminiHumanEngine.ts` to reflect the client's exact branding.
3. Verify that `npm run build:backend` and `npm --prefix client run build` compile with 0 errors.
4. Deploy the project with `npx vercel --prod`.
