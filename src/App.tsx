import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';
import { LanguageToggleCompact } from '@/components/ui/LanguageToggle';
import WizardPage from '@/pages/WizardPage';
import DriverSupportPage from '@/components/driver-support/DriverSupportPage';
import { GearIcon } from '@radix-ui/react-icons';
import '@/App.css';

// A more modern and cleaner layout component
const ModernLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <GearIcon className="h-6 w-6" />
            <span className="font-bold sm:inline-block">
              OpenCore Initializr
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              to="/docs"
              className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              {t('navigation.docs')}
            </Link>
            <Link
              to="/kexts"
              className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              {t('navigation.kexts')}
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <LanguageToggleCompact />
            <ThemeToggleCompact />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for the Hackintosh community.
          </p>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="opencore-ui-theme">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ModernLayout>
          <Routes>
            <Route path="/" element={<WizardPage />} />
            {/* Placeholder routes for the new pages */}
            <Route path="/docs" element={<div className="container p-8 text-center text-muted-foreground">文档页面即将推出...</div>} />
            <Route path="/kexts" element={<DriverSupportPage />} />
            {/* Redirect any other path to the main wizard page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ModernLayout>
      </Router>
    </ThemeProvider>
  );
};

export default App;