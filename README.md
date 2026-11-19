# AgroHelp

<p align="center">
  <strong>AI-powered crop and hybrid agriculture advisory for Indian farmers</strong>
</p>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://agro-help-six.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

AgroHelp is a full-stack Next.js web application that provides location-aware crop recommendations, detailed hybrid information, and agricultural business analysis. It combines browser geolocation, live weather data, and AI-generated guidance to help farmers explore suitable crops and make informed farming decisions.

> **Disclaimer:** AgroHelp provides advisory information for educational and decision-support purposes. Market prices, yields, schemes, and farming guidance should be verified with local agricultural officers, certified agronomists, and official government sources before implementation.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Live Application](#live-application)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Routes](#api-routes)
- [User Flow](#user-flow)
- [Caching and Location](#caching-and-location)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

AgroHelp presents agricultural recommendations in four categories:

- **Field crops**
- **Vegetables**
- **Fruit trees**
- **Flowering plants**

The application first asks for the user's location. It either uses the browser's geolocation API or falls back to a default Pune, India coordinate. The server retrieves live weather data, sends that context to an AI model, and returns structured crop recommendations.

Users can then explore:

- Recommended crops and hybrid varieties
- Irrigation and water requirements
- Estimated yield and profit
- Detailed farming methods
- Seed and machinery options
- Market and value-addition opportunities
- Government schemes and selling platforms

## Features

- Browser-based location detection
- 30-minute local recommendation cache
- Location-aware weather context
- AI-generated crop recommendations
- Four agricultural categories
- Hybrid variety exploration
- Detailed hybrid farming guidance
- Business and market analytics
- Cost breakdown and profit projection
- Selling-platform and mandi guidance
- Value-added product ideas
- Loading, error, retry, and fallback states
- Global AI agent popup
- Responsive interface built with Tailwind CSS
- Interactive 3D and animated UI components

## Live Application

The deployed application is available at:

**https://agro-help-six.vercel.app**

## Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Animations | Framer Motion |
| 3D | React Three Fiber, Drei, Three.js |
| Charts | Chart.js, React Chart.js 2 |
| HTTP | Axios |
| AI | Groq SDK, Google Gemini API |
| Weather | OpenWeather API |
| Icons | React Icons |
| Hosting | Vercel |
| Package Manager | npm |

## Architecture

```text
Browser
  |
  | geolocation or default coordinates
  v
Next.js React client
  |
  | POST /api/recommend
  v
Next.js server route
  |
  +--> OpenWeather API
  |
  +--> Groq AI model
  |
  +--> structured JSON recommendation
  |
  v
Category and crop UI
  |
  +--> /api/hybrid-details
  +--> /api/business-analytics
  +--> /api/gemini
```

### Frontend

The main application is in `app/page.tsx`. It manages location permissions, loading stages, cache state, category navigation, and error handling. Reusable presentation components live in `components/`.

### Backend

Backend functionality is implemented with Next.js Route Handlers under `app/api/`. API handlers use server-side environment variables, keeping provider keys out of the browser bundle.

### AI providers

- **Groq** generates crop recommendations, hybrid details, and business analytics.
- **Google Gemini** supports the global AI agent popup.
- **OpenWeather** supplies location-specific temperature and humidity context.

### Fallback behavior

Several routes include fallback data or fallback responses when an external provider is unavailable. This helps keep the interface usable during service or configuration failures.

## Project Structure

```text
AgroHelp/
├── app/
│   ├── api/
│   │   ├── business-analytics/route.ts
│   │   ├── gemini/route.ts
│   │   ├── hybrid-details/route.ts
│   │   └── recommend/route.ts
│   ├── hybrid/[crop]/
│   ├── hybrid-business/[crop]/
│   ├── utils/cropParser.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AIAgentPopup.tsx
│   ├── AIIcon.tsx
│   ├── CategoryIntro.tsx
│   ├── CropSection.tsx
│   ├── Hybrid3DIcon.tsx
│   ├── HybridDetailView.tsx
│   ├── HybridFlower.tsx
│   ├── HybridOptionCard.tsx
│   ├── HybridSkeleton.tsx
│   └── Loader.tsx
├── public/
├── types/crop.ts
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- **Node.js 20 or newer**
- **npm** (included with Node.js)
- API credentials for the providers you want to use:
  - Groq API key
  - Google Gemini API key
  - OpenWeather API key

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Regression028/AgroHelp.git
cd AgroHelp
```

### 2. Install dependencies

```bash
npm install
```

For a reproducible install matching `package-lock.json`:

```bash
npm ci
```

### 3. Create environment configuration

Create `.env.local` in the repository root:

```bash
# macOS/Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

If `.env.example` is not present, create `.env.local` manually using the variable names below.

### 4. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in a browser.

Development refreshes the page automatically when source files change. Location access must be allowed by the browser for geolocation-based recommendations.

## Environment Variables

Create these variables in `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
WEATHER_API_KEY=your_openweather_api_key
```

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Crop, hybrid, and business AI responses |
| `GEMINI_API_KEY` | In-app AI agent responses |
| `OPENWEATHER_API_KEY` | Weather used by recommendation routes |
| `WEATHER_API_KEY` | Weather context used by hybrid-detail routes |

> `WEATHER_API_KEY` and `OPENWEATHER_API_KEY` can refer to the same OpenWeather key. Never commit API keys or `.env.local` to Git.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js development mode |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |

### Production build

```bash
npm run build
npm run start
```

The production server normally runs on port `3000` unless a different port is configured.

## API Routes

### `POST /api/recommend`

Returns location-aware crop recommendations and also supports related hybrid operations.

Example request:

```json
{
  "lat": 18.5204,
  "lon": 73.8567
}
```

Example response:

```json
{
  "success": true,
  "location": "Pune",
  "weather": {
    "temperature": 24,
    "humidity": 65
  },
  "recommendation": {
    "fieldCrops": [],
    "vegetables": [],
    "fruitTrees": [],
    "floweringPlants": []
  }
}
```

The same route can return generated hybrids or specific hybrid details when the request contains:

```json
{
  "cropName": "Wheat",
  "generateHybrids": true
}
```

or:

```json
{
  "cropName": "Wheat",
  "hybridName": "HD 3086",
  "getHybridDetails": true
}
```

### `POST /api/hybrid-details`

Returns detailed farming, market, soil, seasonal, and financial information for a hybrid.

```json
{
  "cropName": "Wheat",
  "hybridName": "HD 3086",
  "lat": 18.5204,
  "lon": 73.8567
}
```

### `POST /api/business-analytics`

Generates seed sources, machinery, cost breakdown, profit analysis, selling platforms, market trends, value-added products, and government scheme information.

```json
{
  "cropName": "Wheat",
  "hybridName": "HD 3086"
}
```

### `POST /api/gemini`

Sends a prompt to Google Gemini for the global AI assistant.

```json
{
  "prompt": "How should I manage water for a newly planted wheat crop?"
}
```

## User Flow

1. The home page checks for valid cached recommendations in local storage.
2. If no valid cache exists, the user chooses browser geolocation or the default location.
3. Browser coordinates are sent to `/api/recommend`.
4. The server fetches local weather and requests AI-generated recommendations.
5. The user browses four crop categories.
6. The user opens crop details and hybrid options.
7. Hybrid routes generate additional farming and business guidance.

## Caching and Location

- Recommendations remain in `localStorage` for 30 minutes.
- The cache key is `crop_recommendation_cache`.
- Development mode shows a button to clear the cache and reload.
- The default location is approximately **Pune, India: 18.5204, 73.8567**.
- Location values are used to personalize weather and recommendations and are not sent to a permanent first-party database by this implementation.

## Deployment

The repository is configured for deployment to Vercel.

### Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. Select **Next.js** as the framework.
3. Add `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`, and `WEATHER_API_KEY` as environment variables.
4. Deploy the project.

The project can also be deployed to any platform that supports a Next.js Node.js server.

For static export, verify route-handler compatibility and provider requirements before changing Next.js output settings.

## Troubleshooting

### Location permission denied

Allow location access in your browser settings or select the default-location option.

### Missing API key error

Confirm the required variable is present in `.env.local` and restart `npm run dev` after adding it.

### Weather fetch failure

Verify:

- The OpenWeather key is valid.
- The coordinates are valid.
- The key has activated in the provider dashboard.
- Outbound network access is available.

### AI response is invalid or incomplete

Groq or Gemini may reject a prompt, return a parsing issue, or experience downtime. Most routes implement fallback or parsing logic, but generated numbers should still be treated as estimates.

### Gemini model unavailable

The route currently uses `gemini-3-flash-preview`. Update the model name in `app/api/gemini/route.ts` if it is unavailable for your API account.

### Port 3000 is already in use

```bash
npm run dev -- --port 3001
```

## Contributing

1. Fork the repository.
2. Create a descriptive feature branch.
3. Make and test your changes.
4. Run lint and build checks:

```bash
npm run lint
npm run build
```

5. Open a pull request with a clear summary and testing steps.

When changing AI prompts or API responses, preserve strict validation and fallback behavior where practical.

## License

No license has currently been declared in this repository.

Until a license is added, the source is subject to the repository owner's copyright. Consult the owner before reuse or redistribution.

---

**Repository:** https://github.com/Regression028/AgroHelp  
**Live demo:** https://agro-help-six.vercel.app
