# 🌑 Chhaya
**The invisible cost of convenience.**

Chhaya is an AI-powered financial and environmental intelligence platform designed for individuals. By analyzing standard UPI and Bank statement PDFs, Chhaya automatically translates raw transactional data into meaningful financial tracking and estimated carbon emission profiles—all without requiring manual entry or connecting external databases.

**See your shadow.**

---

## ⚡ Features

- **UPI Auto-Parse:** Securely drop your standard PDF bank statements.
- **Gemini Categorization:** Leverage the Gemini 2.5 AI model to intelligently identify merchants and estimate realistic carbon footprints (kg CO₂) for each transaction based on the nature of the description.
- **Impact Streaks & Gamification:** Unlock brutalist badges and achievements by reducing your carbon intensity week-over-week.
- **AI Financial Coach:** Chat interactively with the *Chhaya AI Coach* right from your dashboard. Ask about your top spendings or get brutal but helpful feedback on your carbon emissions.
- **Local Privacy Focused:** Transactions and processed data are kept in the browser's `localStorage`. No data is stored centrally.

---

## 🛠 Prerequisites

Before starting, make sure you have the following installed and configured:

- **Node.js** (v18.x or later recommended)
- **NPM** (v9.x or later) or **Yarn** / **pnpm**
- **Google Gemini API Key:** You must have an active API key from [Google AI Studio](https://aistudio.google.com/app/apikey) to process the PDF contents and power the AI Coach.

---

## 🚀 Getting Started

Follow these steps to get your environment up and running locally.

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chhaya.git
cd chhaya
```

### 2. Install Dependencies

Install the necessary npm packages using your preferred package manager.

```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables

Rename the provided `.env.example` file to `.env` and configure your API keys.

```bash
cp .env.example .env
```

Ensure your `.env` contains your Gemini API key:
```env
GEMINI_API_KEY="AIzaSyYourGeneratedApiKey..."
```

### 4. Run the Development Server

The project uses a custom Express + Vite combined development server for the full-stack experience. 

```bash
npm run dev
```

The application should now be accessible at `http://localhost:3000`.

---

## 🏗 Tech Stack

- **Frontend Core:** React 19, TypeScript, React Router v7
- **Backend Core:** Node.js, Express
- **AI Processing:** `@google/genai` (Gemini 2.5 Flash)
- **Styling:** Tailwind CSS (v4), Framer Motion (for animations)
- **Charting & Data Viz:** Recharts, Lucide React (Icons)
- **Build Tooling:** Vite, ESBuild, tsx

---

## 🔒 Security & Data Privacy

- **No Remote Database:** Processed transactions are persisted strictly in your browser's local storage (`localStorage`). 
- **Ephemeral AI Generation:** PDF contents are sent securely to the Gemini API, processed, and categorized entirely in memory during the Express backend's request lifecycle, without being stored on our servers.

---

## 📄 License

This project is licensed under the MIT License.
