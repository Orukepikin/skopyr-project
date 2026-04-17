# SKOPYR

> **Scope the best. Pick the best.**

The reverse marketplace where customers post service requests and verified providers compete with bids.

## Tech Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Styling:** Tailwind CSS + Custom design tokens
- **Fonts:** Space Grotesk (display) + DM Sans (body)
- **Payments:** Paystack (escrow)
- **Database:** PostgreSQL + Redis
- **SMS:** Termii
- **Storage:** Cloudinary

## Design System

- **Background:** `#09090B` (near-black)
- **Accent:** `#FF6B2B` (hot orange)
- **Typography:** Bold geometric (Space Grotesk) + Clean sans (DM Sans)
- **Aesthetic:** Dark & sleek, Uber/Revolut-inspired

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys in .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
skopyr-project/
├── public/              # Static assets, PWA manifest
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Splash.tsx
│   │   ├── Hero.tsx
│   │   ├── Categories.tsx
│   │   ├── RequestForm.tsx
│   │   ├── BidsView.tsx
│   │   └── BrowseJobs.tsx
│   ├── pages/           # Next.js pages
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   └── index.tsx
│   ├── lib/             # Constants, utilities, API helpers
│   │   └── constants.ts
│   ├── hooks/           # Custom React hooks
│   └── styles/          # Global styles
│       └── globals.css
├── .env.example         # Environment variables template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Deployment

Recommended: **Vercel** for frontend, **Railway** for backend services.

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Brand

- **Name:** Skopyr
- **Tagline:** Scope the best. Pick the best.
- **Company:** Kwaghhii Technology Solutions Limited (RC 7400704)

---

Built with 🔥 by Kwaghhii Technology Solutions Limited
