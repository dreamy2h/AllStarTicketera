import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/Navbar.js';
import { HomePage } from './pages/HomePage.js';
import { LandingPage } from './pages/LandingPage.js';
import { ScannerPage } from './pages/ScannerPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { TicketViewPage } from './pages/TicketViewPage.js';
import { LoginPage } from './pages/LoginPage.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 dark:bg-allstar-dark flex flex-col text-slate-900 dark:text-slate-100 selection:bg-allstar-gold selection:text-black transition-colors duration-200">
            <Navbar />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/eventos/:slug" element={<LandingPage />} />
                <Route path="/scanner" element={<ScannerPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/ticket/:ticketCode" element={<TicketViewPage />} />
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <footer className="border-t border-slate-200 dark:border-white/5 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 font-mono bg-white/80 dark:bg-transparent backdrop-blur-sm transition-colors duration-200">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>© 2026 AllStar Ticket • Network Marketing & Cruise Events Platform</span>
                <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Sistema Operativo</span>
                  <span>•</span>
                  <span>Node.js + MongoDB + React</span>
                </div>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
