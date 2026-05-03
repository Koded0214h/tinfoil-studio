import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import "./App.css";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import IntroPage from "@/pages/intro";
import HomePage from "@/pages/home";
import PromptPage from "@/pages/prompt";
import JobStatusPage from "@/pages/job-status";
import HistoryPage from "@/pages/history";
import SettingsPage from "@/pages/settings";

function App() {
  const location = useLocation();
  // The intro is a self-contained takeover — no nav, no footer. The prompt
  // page also hides the footer because it has its own fixed bottom dock.
  const isIntro = location.pathname === "/";
  const hideChrome = isIntro;
  const hideFooter = isIntro || location.pathname === "/prompt";

  return (
    <div id="top" className="relative min-h-screen w-full bg-background">
      {!hideChrome && <Navbar />}

      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/prompt" element={<PromptPage />} />
        <Route path="/jobs/:jobId" element={<JobStatusPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
