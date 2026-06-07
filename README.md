# 🏆 FIFA World Cup 2026 Portal (WorldCupEleven)

Welcome to **WorldCupEleven**, the ultimate interactive dashboard and prediction portal for the FIFA World Cup 2026! 

Live Site: **[worldcupeleven.vercel.app](https://worldcupeleven.vercel.app/)**

---

## 🌟 Key Features

* **📅 Live Match Schedule & Results:** Track all tournament fixtures and match results with real-time updates.
* **🌎 Custom Timezone Selector:** Easily change your timezone (including local timezone support like **IST**) directly in the header. Kickoff times across the entire portal translate dynamically!
* **🔮 Match Prediction Game:** Create an account, log in, and make predictions on upcoming group stage and knockout matches.
* **🏆 Leaderboard:** Compete with fans worldwide! Earn 3 points for every correct prediction and climb the ranks.
* **📊 Group Standings & Stadiums:** Explore real-time group tables and view high-quality stadium layouts hosting the games.
* **⚡ Interactive Play Zone & FIFA Sync:** Play out mock scenarios in custom brackets or synchronize live scores directly with official FIFA updates.

---

## 🛠️ Software & Technologies Used

This project was built from scratch using a modern, scalable web stack:

* **Next.js & React (TypeScript):** Powering the dynamic frontend and fast server-side page rendering.
* **Tailwind CSS:** For the sleek, glassmorphic dark-theme design matching the World Cup aesthetic.
* **Supabase:** Used as our backend database for user account signups, secure logins, profile management, and prediction storage.
* **Vercel:** Hosting the website online with automatic production builds and deployments.
* **Git & GitHub:** For version control and collaborative deployments.
* **Antigravity (AI Companion):** Co-developed and pair-programmed alongside a Google DeepMind AI assistant to refine layouts, fix bugs, and implement database integrations.

---

## 🚀 Getting Started Locally

If you want to run this project on your own computer:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anuragmt20/worldcup-2026.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env.local` file at the root of the project and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. **Start the local development server:**
   ```bash
   npm run dev
   ```
5. Open **[localhost:3000](http://localhost:3000)** in your browser!
