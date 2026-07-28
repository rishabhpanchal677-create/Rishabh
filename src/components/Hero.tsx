import React from 'react';
import { ShieldCheck, Flame, HeartHandshake, Truck, ArrowRight, Play, Award } from 'lucide-react';
import heroTiffinImage from '../assets/images/pureaty_tiffin_hero_1785224404843.jpg';

interface HeroProps {
  onOpenTrial: () => void;
}

export default function Hero({ onOpenTrial }: HeroProps) {
  const badges = [
    { text: 'Fresh Ingredients', desc: 'Handpicked daily', icon: <Flame className="w-5 h-5 text-orange-500" /> },
    { text: 'Hygienic Kitchen', desc: 'Sanitized spaces', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
    { text: 'Home Style Taste', desc: 'Low oil & spices', icon: <HeartHandshake className="w-5 h-5 text-red-500" /> },
    { text: 'Timely Delivery', desc: 'Insulated hot bags', icon: <Truck className="w-5 h-5 text-blue-500" /> },
  ];

  const handleScrollToPlans = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const plansSec = document.querySelector('#plans');
    if (plansSec) {
      plansSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section 
      id="home" 
      className="relative pt-24 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-emerald-950/10 dark:via-neutral-900 dark:to-neutral-900 transition-colors"
    >
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 dark:bg-emerald-950/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 left-0 w-72 h-72 bg-orange-100/30 dark:bg-orange-950/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
                Premium Tiffin Delivery
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-800 dark:text-neutral-100 leading-tight tracking-tight">
              Healthy Homemade Food <br className="hidden md:inline" />
              <span className="text-emerald-600 dark:text-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                Delivered Fresh
              </span> Every Day
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Savor the taste of clean, nutritious, and absolutely delicious Indian food packed under ultra-hygienic conditions and delivered right to your workplace or residence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                id="hero-trial-btn"
                onClick={onOpenTrial}
                className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-xl shadow-orange-500/15 hover:shadow-orange-500/25 active:scale-98 transition-all inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                Order Trial Meal
                <ArrowRight size={16} />
              </button>

              <a
                id="hero-subscribe-btn"
                href="#plans"
                onClick={handleScrollToPlans}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/25 active:scale-98 transition-all inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                Subscribe Now
              </a>
            </div>

            {/* Subheading tag pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-5 text-sm text-neutral-500 dark:text-neutral-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Fresh
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Hygienic
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Affordable
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Homemade
              </span>
            </div>
          </div>

          {/* Graphics/Image Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px]">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-orange-400 rounded-full opacity-10 animate-pulse -z-10 blur-xl" />
              
              {/* Image Frame */}
              <div className="absolute inset-0 bg-neutral-900 rounded-3xl overflow-hidden border-4 border-white dark:border-neutral-800 shadow-2xl group">
                <img
                  src={heroTiffinImage}
                  alt="PUREATY Insulated Tiffin with Fresh Meal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700/60 max-w-[200px] flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/20 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-neutral-800 dark:text-neutral-100">#1 Tiffin</h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Pure Ghee Rotis & Fresh Veggies</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Trust Badges Grid */}
        <div className="mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-neutral-800/40 p-6 sm:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800/80 shadow-md">
          {badges.map((badge, idx) => (
            <div 
              key={idx} 
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-2 group hover:translate-y-[-2px] transition-all"
            >
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl group-hover:bg-white dark:group-hover:bg-neutral-700 shadow-sm transition-all shrink-0">
                {badge.icon}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">
                  {badge.text}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
