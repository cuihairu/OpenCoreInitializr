import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from './components/ui/Toast';

import HardwareConfigPage from './pages/HardwareConfig';
import { ResponsiveLayout } from './components/layout/ResponsiveLayout';
import MobileNavigation, { useMobileNavigation } from './components/layout/MobileNavigation';
import { ThemeToggle } from './components/ui/theme-toggle';
import { LanguageToggleCompact } from './components/ui/LanguageToggle';
import { ThemeProvider } from './components/theme-provider';
import './App.css';

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mobileNav = useMobileNavigation();

  return (
    <div className="app-container" style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={mobileNav.isOpen}
        onToggle={mobileNav.toggle}
        onClose={mobileNav.close}
      />

      {/* Responsive Layout */}
       <ResponsiveLayout
         header={
           <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
             <div className="flex items-center ml-12 md:ml-0">
               <h1 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                 OpenCore Initializr
               </h1>
             </div>
             
             <div className="flex items-center space-x-4">
               <nav className="hidden md:flex space-x-8">
                 <a href="/hardware" className="px-3 py-2 rounded-md text-sm font-medium transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--foreground))'} onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>
                   Hardware
                 </a>
                 <a href="/configuration" className="px-3 py-2 rounded-md text-sm font-medium transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--foreground))'} onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>
                   Configuration
                 </a>
                 <a href="/download" className="px-3 py-2 rounded-md text-sm font-medium transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--foreground))'} onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>
                   Download
                 </a>
               </nav>
               
               {/* 主题和语言切换器 */}
               <div className="flex items-center space-x-2">
                 <LanguageToggleCompact />
                 <ThemeToggle />
               </div>
             </div>
           </div>
         }
         footer={
           <div className="text-center py-4 text-sm" style={{ color: 'hsl(var(--muted-foreground))', borderTop: '1px solid hsl(var(--border))' }}>
             <p>© 2024 OpenCore Initializr. Built with ❤️ for the Hackintosh community.</p>
           </div>
         }
       >
         {children}
       </ResponsiveLayout>
      
      <ToastContainer />
    </div>
  );
};

// Main App Component
const App: React.FC = () => {

  return (
    <ThemeProvider defaultTheme="system" storageKey="opencore-ui-theme">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/hardware" replace />} />
            <Route path="/hardware" element={<HardwareConfigPage />} />
            <Route path="/configuration" element={<div className="p-8 text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>Configuration page coming soon...</div>} />
            <Route path="/download" element={<div className="p-8 text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>Download page coming soon...</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
