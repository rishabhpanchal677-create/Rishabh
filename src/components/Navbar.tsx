import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Utensils, MessageSquare, Phone } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenQuickSubscribe: () => void;
}

export default function Navbar({ darkMode, onToggleDarkMode, onOpenQuickSubscribe }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Plans', href: '#plans' },
    { name: 'Dashboard', href: '#account' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const offset = 80; // height of sticky navbar
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
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-lg border-b border-neutral-100 dark:border-neutral-800 py-3' 
          : 'bg-white/50 dark:bg-neutral-900/30 backdrop-blur-xs py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-center group focus:outline-hidden"
            id="brand-logo-link"
          >
            <BrandLogo size="md" showSubtext={true} />
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3.5 py-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              id="desktop-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Trial CTA */}
            <button
              id="desktop-trial-cta"
              onClick={onOpenQuickSubscribe}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-98 transition-all"
            >
              Book Trial Meal
            </button>

            {/* Order Now Call to Action */}
            <a
              id="desktop-order-cta"
              href="#plans"
              onClick={(e) => handleLinkClick(e, '#plans')}
              className="px-5 py-2.5 text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 transition-all"
            >
              Subscribe Now
            </a>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              id="mobile-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        id="mobile-menu-drawer"
        className={`lg:hidden fixed inset-x-0 top-[70px] bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-3 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="block px-4 py-3 text-base font-semibold text-neutral-700 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-all"
            >
              {link.name}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
            <button
              id="mobile-trial-btn"
              onClick={() => {
                setIsOpen(false);
                onOpenQuickSubscribe();
              }}
              className="py-3 text-center text-xs font-bold uppercase tracking-wider bg-orange-500 text-white rounded-xl"
            >
              Book Trial
            </button>
            <a
              id="mobile-plans-btn"
              href="#plans"
              onClick={(e) => handleLinkClick(e, '#plans')}
              className="py-3 text-center text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white rounded-xl"
            >
              View Plans
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
