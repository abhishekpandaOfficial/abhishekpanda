# Abhishek Panda - Personal Brand Website

A premium personal brand website for Abhishek Panda (.NET Architect | AI/ML Engineer | Cloud-Native Specialist).

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Storage)
- **UI**: shadcn/ui components
- **PWA**: Offline support with service workers

## Features

- 🎓 Academy - Course management and delivery
- 📚 Ebooks - 3D covers, preview, OTP-gated free downloads, premium unlock flow
- 📝 Blog - Content management with Markdown support
- 🧠 LLM Galaxy - AI model comparison and insights
- 👤 Admin Dashboard - Personal OS and command center
- 🔐 Biometric Authentication - Passkey and Face ID support

## Getting Started

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

## Ebooks Module Setup (Supabase)

```sh
# Apply DB schema
supabase db push

# Set required function secrets
supabase secrets set RESEND_API_KEY=YOUR_KEY --project-ref qayywyddbprlhkqcqllf
supabase secrets set EMAIL_FROM="Abhishek Panda <no-reply@abhishekpanda.com>" --project-ref qayywyddbprlhkqcqllf
supabase secrets set JWT_DOWNLOAD_SECRET=YOUR_LONG_RANDOM_SECRET --project-ref qayywyddbprlhkqcqllf
supabase secrets set SITE_URL=https://www.abhishekpanda.com --project-ref qayywyddbprlhkqcqllf

# Deploy ebook edge functions
supabase functions deploy ebooks-lead --project-ref qayywyddbprlhkqcqllf
supabase functions deploy ebooks-verify-otp --project-ref qayywyddbprlhkqcqllf
supabase functions deploy ebooks-download --project-ref qayywyddbprlhkqcqllf
```

## Validation

```sh
npm run build
npm run test:ebooks-otp
```

## Admin URLs

- Admin Login: `https://www.abhishekpanda.com/admin/login` (local: `http://localhost:8080/admin/login`)
- Admin Dashboard (protected): `https://www.abhishekpanda.com/admin` (local: `http://localhost:8080/admin`)

## License

© Abhishek Panda. All rights reserved.
