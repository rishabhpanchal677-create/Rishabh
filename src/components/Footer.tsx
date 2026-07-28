import React, { useState } from 'react';
import { Utensils, Shield, Heart, HelpCircle, X, ChevronRight } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'terms' | null>(null);

  const footerLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Weekly Menu', href: '#menu' },
    { name: 'Subscription Plans', href: '#plans' },
    { name: 'Customer Reviews', href: '#reviews' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact Us', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-neutral-900 text-neutral-400 dark:bg-neutral-950 pt-16 pb-8 transition-colors border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Brand details */}
          <div className="md:col-span-5 space-y-4">
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, '#home')}
              className="inline-flex items-center gap-2"
            >
              <BrandLogo size="md" showSubtext={true} />
            </a>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              We deliver hygienic, premium, and delicious home-cooked meals right to your doorstep. Low on spice, rich in taste, and cooked daily using local organic ingredients.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-emerald-400 font-extrabold uppercase tracking-wider text-[10px]">
                Active In Indore, Vijay Nagar
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-widest">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {footerLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-xs hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight size={10} className="text-neutral-600 group-hover:text-emerald-400 transition-transform" />
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Guidelines info block */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-widest">
              Kitchen Hours
            </h4>
            <div className="space-y-2 text-xs">
              <p className="flex justify-between">
                <span>Monday - Saturday:</span>
                <span className="font-bold text-white">7:00 AM - 10:00 PM</span>
              </p>
              <p className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-bold text-red-500">HOLIDAY (Closed)</span>
              </p>
              <p className="pt-2 border-t border-neutral-800 text-[10px] text-neutral-500">
                Please place occasional lunch orders before 10:00 AM & dinner orders before 6:00 PM.
              </p>
            </div>
          </div>

        </div>

        {/* Footer legal & Copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-neutral-500 text-center sm:text-left">
            Copyright © 2026 <span className="font-bold text-neutral-400">PUREATY Tiffin Service</span>. All Rights Reserved.
          </p>

          <div className="flex gap-4">
            <button
              id="privacy-policy-btn"
              type="button"
              onClick={() => setActivePolicyModal('privacy')}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              id="terms-conditions-btn"
              type="button"
              onClick={() => setActivePolicyModal('terms')}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Terms & Conditions
            </button>
          </div>
        </div>

      </div>

      {/* POLICY MODALS POPUP OVERLAY */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-100 dark:border-neutral-800 relative shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setActivePolicyModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X size={18} />
            </button>

            {activePolicyModal === 'privacy' ? (
              <div className="space-y-3 text-left">
                <h3 className="font-black text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                  <Shield size={20} className="text-emerald-500" />
                  Privacy Policy
                </h3>
                <div className="text-xs space-y-2 text-neutral-500 dark:text-neutral-400 leading-relaxed max-h-60 overflow-y-auto pr-2">
                  <p><strong>1. Information Collection:</strong> We collect your name, mobile number, and address during registration/booking to facilitate daily hot tiffin deliveries and collect feedback.</p>
                  <p><strong>2. Data Use:</strong> Your coordinates are shared only with our internal kitchen chefs and designated delivery executives. We never sell, lease, or rent your personal coordinates to marketing aggregators.</p>
                  <p><strong>3. Communications:</strong> We use WhatsApp or SMS solely to issue payment confirmations, menus, subscription warnings, or response updates regarding meal skips.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <h3 className="font-black text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                  <Heart size={20} className="text-orange-500" />
                  Terms & Conditions
                </h3>
                <div className="text-xs space-y-2 text-neutral-500 dark:text-neutral-400 leading-relaxed max-h-60 overflow-y-auto pr-2">
                  <p><strong>1. Advance Payments:</strong> Subscriptions must be fully prepaid prior to activation. We accept UPI payments, online net banking, or direct bank transfer.</p>
                  <p><strong>2. Insulated Tiffin Responsibility:</strong> subscribers receive food in premium thermal insulated stainless steel containers. It is the subscriber's absolute responsibility to keep them clean and return the container during the next day's delivery.</p>
                  <p><strong>3. Skip Deadlines:</strong> Meal pause requests must strictly meet cutoff timers (Lunch: 9:00 AM, Dinner: 5:00 PM). Late requests cannot be accommodated, and the credit will be counted as consumed.</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActivePolicyModal(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Close Guidelines
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
