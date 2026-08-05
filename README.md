# HireFlow — HR Email & Document Automation Platform

HireFlow is an enterprise-grade HR Email and Document Automation platform. It enables HR teams to register candidates, upload candidate details in bulk via Excel spreadsheets, compile customized PDF Offer Letters and Certificates with unique Certificate IDs and secure verification QR codes, and automatically dispatch them to candidates via secure SMTP channels.

Built with a refined, high-contrast, modern Web3-inspired visual interface.

---

## Technical Architecture

- **Core Framework:** Next.js (App Router, Server Actions, Server Components)
- **Programming Language:** TypeScript
- **Styling:** Vanilla CSS (CSS Variables, responsive grid layouts, glassmorphic panels)
- **Database & Storage:** Supabase (PostgreSQL tables, storage buckets, custom triggers)
- **Authentication:** Supabase Auth (Cookie-based session management, Next.js Middleware route guard)
- **PDF Generation:** PDFKit
- **QR Code Compiler:** qrcode
- **Excel Import Parser:** xlsx
- **Email Delivery:** Nodemailer SMTP client
- **Icons:** Lucide Icons (`lucide-react`)

---

## Getting Started

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher (v26.6.0 recommended)
- **Supabase Account:** Active project database and storage
- **SMTP Server:** A secure email gateway (e.g. Gmail SMTP, SendGrid, Amazon SES)

### 2. Environment Configurations
Create a `.env` file in the root directory (based on `.env.example`) and fill in your credentials:

```ini
# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# SMTP NodeMailer Configurations
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-smtp-username@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-sender-email@gmail.com

# Corporate Customizations
COMPANY_NAME=HireFlow Corp
COMPANY_EMAIL=hr@hireflow.com
COMPANY_ADDRESS="100 Enterprise Way, Suite 500, Tech City"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database & Storage Initialization
We have already deployed the database schema directly inside your active Supabase project (`dbprwhpjykgroaxlunmo`). The migration set up the following:
1. **Profiles Table:** Maps authentication users to executive, manager, or admin roles.
2. **Candidates Table:** Stores candidate records and statuses (Draft, Approved, Ready, Sent).
3. **Templates Table:** Holds document template body text.
4. **Documents Table:** Tracks generated PDFs.
5. **Email Logs & Audit Logs:** Historical registries of transmissions and administrator activities.
6. **Auto-Confirm Trigger:** Automatically confirms signups for instant testing.
7. **Storage Buckets:** Creates public `hireflow-assets` and private `hireflow-documents` buckets.
8. **Row Level Security (RLS):** Secures all tables with role-based policies.
9. **RPC Function:** `public.verify_certificate` runs as a privileged `security definer` function to support public certificate verification.

---

## Local Development Workflow

First, install dependencies:
```bash
npm install
```

Second, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the interface.

---

## Operational Features Walkthrough

### 1. Unified Authentication
- Register at `/signup`. Select your requested role: **HR Executive**, **HR Manager**, or **Admin**.
- Log in at `/login`. Features form validations, password visibility toggles, and loading states.
- Password resets are supported at `/forgot-password`.

### 2. Candidate Enrolments
- Executives, Managers, and Admins can add candidates manually at `/dashboard/candidates/new`.
- Executives create drafts. Once complete, click **Submit for Approval** to mark them `Pending Approval`.

### 3. Excel Spreadsheet Imports
- Navigate to `/dashboard/import`.
- Click **Download Excel Template** to grab a real `.xlsx` sheet.
- Populate columns, then drag-and-drop the file into the upload zone.
- Review validation errors (e.g. invalid emails, negative salaries, incorrect document types). Only valid rows are committed to Supabase.

### 4. Template Configurations
- Administrators access the `/dashboard/templates` view.
- Upload company logo and signatures directly to Supabase storage.
- Edit template body content using placeholders (e.g. `{{candidate_name}}`, `{{designation}}`). Click placeholders to insert them.
- Live Georgia-serif paper preview updates on the fly.

### 5. PDF Compilation & QR Codes
- Once candidate drafts are **Approved** by an HR Manager/Admin, the **Generate PDF** button appears.
- Generating compiles the template, embeds signatures, creates a unique Certificate ID, and prints a verification QR code (for certificates).
- The file is saved in a private Supabase Storage folder, accessible via secure signed URLs.

### 6. Email Transmission
- Once a PDF exists, the candidate status moves to **Ready**.
- HR Managers and Admins can click **Send Email** to dispatch the PDF as a secure attachment via Nodemailer SMTP.
- Admins can perform bulk distributions of all Approved/Ready candidate documents.

### 7. Verifications, Emails, and Audits
- Scanning a certificate QR code redirects users to public route `/verify/[certificateId]`. It verifies authenticity without displaying sensitive candidate details.
- Inspect email transmission response codes and failures at `/dashboard/emails`.
- Review platform action history at `/dashboard/audit`.

---

## Vercel Production Deployments

1. Push your repository to GitHub.
2. Link the repository to your [Vercel Dashboard](https://vercel.com/new).
3. Supply all environment variables specified in `.env.example` in Vercel's Environment Variables panel.
4. Click **Deploy**. Vercel will automatically compile the Next.js App Router project.
5. Update your `NEXT_PUBLIC_APP_URL` in Vercel settings to match your live Vercel deployment URL so that verification QR codes point to your live site!

---

## Security Compliance Notes
- **Row Level Security (RLS):** Active on all database tables. Authenticated keys are verified against database profiles.
- **Signed URLs:** Private PDF files cannot be accessed publicly. Signed URLs are valid for 60 minutes.
- **Credential Storage:** SMTP keys are handled on server-side modules only.
