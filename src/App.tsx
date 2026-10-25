/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RegistrationProvider } from './context/RegistrationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TutorsDirectoryPage } from './pages/TutorsDirectoryPage';
import { LoginPage } from './pages/LoginPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Scroll to top upon navigating to a new route
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RegistrationProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans antialiased selection:bg-cyan-100 selection:text-cyan-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/teacher-registration" element={<RegistrationPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/tutors" element={<TutorsDirectoryPage />} />
                
                {/* Authentication & Portals */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
                <Route path="/dashboard" element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

                {/* Fallback to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </RegistrationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
