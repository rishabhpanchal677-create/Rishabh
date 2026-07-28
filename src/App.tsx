import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import SubscriptionPlans from './components/SubscriptionPlans';
import TiffinContents from './components/TiffinContents';
import SkipMealSimulator from './components/SkipMealSimulator';
import Dashboard from './components/Dashboard';
import Reviews from './components/Reviews';
import FAQ from './components/FAQ';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import CheckoutModal from './components/CheckoutModal';
import GeminiChatbot from './components/GeminiChatbot';
import { SubscriptionPlan } from './types';
import { SUBSCRIPTION_PLANS } from './data';
import { AppProvider, useApp } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pureaty_theme');
    if (saved) return saved === 'dark';
    return false; // Default to Light mode (white background)
  });

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Sync dark class on document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('pureaty_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pureaty_theme', 'light');
    }
  }, [darkMode]);

  // Handle document title
  useEffect(() => {
    document.title = "PUREATY Tiffin Service | Healthy Homemade Food Delivered";
  }, []);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    showToast(`Switched to ${!darkMode ? 'Dark' : 'Light'} Mode`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 4000);
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleOpenTrial = () => {
    const trialPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'trial_meal') || SUBSCRIPTION_PLANS[3];
    handleSelectPlan(trialPlan);
  };

  const handleOrderSuccess = (orderDetails: any) => {
    showToast(`Payment Approved for ${orderDetails.planName}!`, 'success');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 font-sans transition-colors duration-300">
      
      {/* Sticky Header Navigation */}
      <Navbar 
        darkMode={darkMode} 
        onToggleDarkMode={handleToggleDarkMode} 
        onOpenQuickSubscribe={handleOpenTrial} 
      />

      {/* Main Sections */}
      <main className="relative">
        <Hero 
          onOpenTrial={handleOpenTrial} 
        />
        
        <AboutUs />
        
        <SubscriptionPlans 
          onSelectPlan={handleSelectPlan} 
        />
        
        <TiffinContents />
        
        <SkipMealSimulator />
        
        {/* Dynamic Customer Dashboard & Admin panel Section */}
        <Dashboard />
        
        <Reviews />
        
        <FAQ />
        
        <ContactSection />
      </main>

      {/* Footer Details */}
      <Footer />

      {/* Floater CTA widgets */}
      <FloatingWhatsApp />
      <GeminiChatbot />

      {/* Subscription Planner Checkout Wizard Modal with Secure Gateway */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        selectedPlan={selectedPlan}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      {/* Notification Toasts popup alerts */}
      {activeToast && (
        <div 
          id="system-toast-alert"
          className="fixed bottom-6 left-6 z-50 p-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 dark:border-neutral-200 flex items-center gap-3 max-w-sm animate-scale-up animate-fade-in"
        >
          {activeToast.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ✦
            </div>
          )}
          <div>
            <p className="text-xs font-black">System Alert</p>
            <p className="text-[11px] text-neutral-300 dark:text-neutral-600 font-medium leading-tight mt-0.5">
              {activeToast.message}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
