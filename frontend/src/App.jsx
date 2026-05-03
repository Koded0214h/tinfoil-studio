import { Routes, Route } from "react-router-dom";

import "./App.css";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import LandingPage from "@/pages/landing";
import JobStatusPage from "@/pages/job-status";
import HistoryPage from "@/pages/history";
import SettingsPage from "@/pages/settings";

function App() {
  return (
    <div id="top" className="relative min-h-screen w-full bg-background">
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs/:jobId" element={<JobStatusPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
