# 🎡 Legoland Gacha Application

[![Nuxt](https://img.shields.io/badge/Nuxt-3.18-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![PrimeVue](https://img.shields.io/badge/PrimeVue-4.0-3B82F6?logo=primevue&logoColor=white)](https://primevue.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red.svg)](README.md)

A professional, high-performance web application built with **Nuxt 3** and **Vue 3** for managing the Legoland Gacha ecosystem, including QR code scanning, spin logic, and prize redemptions.

---

## 🌟 Key Features

- 📸 **Advanced QR Scanning**: High-accuracy scanning using `@zxing/browser` and `vue-qrcode-reader`.
- 🎰 **Gacha Engine**: Complex spin logic with backend validation and state persistence.
- 🎁 **Prize Management**: Integrated flow for claiming and redeeming prizes.
- 🔐 **Secure Authentication**: Robust auth system with session management via Pinia.
- 📊 **Dashboard Integration**: Real-time monitoring and management metrics.
- 📱 **Mobile Optimized**: Responsive design tailored for seamless mobile experiences.
- 🔄 **Version Detection**: Built-in mechanism to detect and prompt for application updates.

---

## 🛠️ Tech Stack

### Core Frameworks
- **Framework**: [Nuxt 3](https://nuxt.com/) (Hybrid Vue Framework)
- **UI Library**: [PrimeVue 4](https://primevue.org/) (Tailwind-integrated theme)
- **State Management**: [Pinia](https://pinia.vuejs.org/) (with persisted state support)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [SASS](https://sass-lang.com/)

### Essential Libraries
- **API Client**: Axios (configured in `services/`)
- **QR/Barcode**: Vue QR Code Reader & ZXing
- **Validation**: Yup (Schema-based validation for forms)
- **I18n**: Vue I18n (Multi-language support)
- **Utilities**: Lodash, Moment, Crypto-js

---

## 📁 Project Structure

```text
├── assets/             # Global styles (SCSS), images, and fonts
├── components/         # Reusable Vue components
├── composables/        # Shared logic and reactive state
├── data/               # Static datasets and configuration
├── layouts/            # Nuxt layout templates
├── locales/            # Translation files for i18n
├── middleware/         # Navigation guards and auth logic
├── pages/              # Application routes and views
├── plugins/            # Nuxt plugins (GTag, PrimeVue config)
├── public/             # Static assets (robots.txt, favicon)
├── server/             # Server-side routes and API handlers
├── services/           # Data fetching and API interaction logic
├── stores/             # Pinia state stores
├── utils/              # Helper functions and constants
└── VERSIONING_GUIDE.md # Standards for versioning and releases
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `^18.0.0` or higher
- **Package Manager**: `pnpm` (recommended) or `npm`

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env` file based on [.env.example](.env.example):

```bash
cp .env.example .env
```

### Local Development

```bash
# Start development server
pnpm dev

# Expose to local network (useful for mobile testing)
pnpm expose
```

### Production

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## 📌 Versioning Strategy

This project follows **Semantic Versioning (SemVer) 2.0.0**. For a detailed guide on how we handle releases, commit messages, and version bumps, please refer to:

👉 [**Versioning & Release Guide**](./VERSIONING_GUIDE.md)

Current Version: `1.1.5`  
Check [**CHANGELOG.md**](./CHANGELOG.md) for full history.

---

## 🤝 Contribution & Standards

- **Linting**: Standard ESLint rules with Prettier integration.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) for automated changelog generation.
- **Workflow**: Create feature branches from `main` or `develop`.

---

*Developed with ❤️ for Legoland Gacha System.*
