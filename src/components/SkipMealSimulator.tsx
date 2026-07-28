import React, { useState } from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2, ShieldAlert, Coins, HelpCircle } from 'lucide-react';

export default function SkipMealSimulator() {
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  // Calculate skip eligibility
  // Lunch cutoff is 9:00 AM. Dinner cutoff is 5:00 PM.
  const calculateEligibility = () => {
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) hour24 += 12;
    if (ampm === 'AM' && hour === 12) hour24 = 0;

    const totalMinutes = hour24 * 60 + minute;
    
    if (mealType === 'lunch') {
      const cutoffMinutes = 9 * 60; // 9:00 AM
      const eligible = totalMinutes <= cutoffMinutes;
      return {
        eligible,
        cutoff: '9:00 AM',
        message: eligible 
          ? 'Skip Eligible! You requested before 9:00 AM. Your subscription validity is extended by 1 day!' 
          : 'Meal Consumed! You requested after 9:00 AM. Since our chef has already prepared and packed your lunch, this meal is counted as consumed.',
        tip: eligible
          ? 'Great! Your meal credits are safe and carried forward.'
          : 'Tip: Always set a reminder to inform us before 9:00 AM!'
      };
    } else {
      const cutoffMinutes = 17 * 60; // 5:00 PM
      const eligible = totalMinutes <= cutoffMinutes;
      return {
        eligible,
        cutoff: '5:00 PM',
        message: eligible 
          ? 'Skip Eligible! You requested before 5:00 PM. Your subscription validity is extended by 1 day!' 
          : 'Meal Consumed! You requested after 5:00 PM. Since our chef has already cooked and dispatched your hot dinner, this meal is counted as consumed.',
        tip: eligible
          ? 'Superb! Your meal credit is preserved.'
          : 'Tip: Always inform us before 5:00 PM for dinner skips!'
      };
    }
  };

  const status = calculateEligibility();

  // Rules and Policies data
  const policies = [
    {
      title: 'Payment Policy',
      desc: '100% Full Payment in Advance is collected before activating subscriptions.',
      icon: '💰',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Working Days',
      desc: 'Monday to Saturday delivery. Sunday is our weekly kitchen holiday.',
      icon: '📅',
      bg: 'bg-orange-50 dark:bg-orange-950/20 text-orange-500'
    },
    {
      title: 'Containers Policy',
      desc: 'Monthly plans delivered in premium steel tiffins. Trial meals in disposable containers.',
      icon: '🍱',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
    },
    {
      title: 'Tiffin Care',
      desc: 'Monthly subscribers are responsible for properly washing and caring for the steel tiffin.',
      icon: '🧼',
      bg: 'bg-orange-50 dark:bg-orange-950/20 text-orange-500'
    },
    {
      title: 'No Discount Policy',
      desc: 'We prioritize high-quality ingredients, pure desi ghee & organic veggies. No discounts available.',
      icon: '❌',
      bg: 'bg-red-50 dark:bg-red-950/20 text-red-500'
    }
  ];

  return (
    <section 
      id="policies" 
      className="py-16 sm:py-24 bg-neutral-50 dark:bg-neutral-900/50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-3.5 py-1.5 rounded-full border border-orange-100 dark:border-orange-900/30">
            Skip Policy & Info
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            Policies & Important Information
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            We work with strict transparency. Test our meal skip rules using the interactive simulator below and view our standard kitchen guidelines.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Skip Simulator Interactive Tool */}
          <div className="lg:col-span-6 bg-white dark:bg-neutral-950 rounded-4xl p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800/80 shadow-md flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-950/20 text-orange-500 rounded-2xl">
                  <Clock size={22} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-lg leading-tight">
                    Meal Skip Cutoff Simulator
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    See what happens when you notify us to pause a meal
                  </p>
                </div>
              </div>

              {/* Meal Select Button */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  1. Select Meal to Pause
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMealType('lunch')}
                    className={`p-3 rounded-2xl font-bold border-2 text-center text-sm transition-all ${
                      mealType === 'lunch'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    ☀️ Lunch Skip (9 AM cutoff)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('dinner')}
                    className={`p-3 rounded-2xl font-bold border-2 text-center text-sm transition-all ${
                      mealType === 'dinner'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    🌙 Dinner Skip (5 PM cutoff)
                  </button>
                </div>
              </div>

              {/* Time Sliders */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  2. Adjust Notification Time
                </label>
                
                {/* Visual Digital Clock */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl text-center border border-neutral-100 dark:border-neutral-800">
                  <span className="text-3xl font-black font-mono tracking-widest text-neutral-800 dark:text-neutral-100">
                    {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} {ampm}
                  </span>
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setAmpm('AM')}
                      className={`px-3 py-1 text-xs font-extrabold rounded-lg ${
                        ampm === 'AM' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmpm('PM')}
                      className={`px-3 py-1 text-xs font-extrabold rounded-lg ${
                        ampm === 'PM' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Hour and Minute Range Inputs */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-neutral-500">
                      <span>Hour</span>
                      <span>{hour} hr</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={hour}
                      onChange={(e) => setHour(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-neutral-500">
                      <span>Minute</span>
                      <span>{minute} min</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="59"
                      value={minute}
                      onChange={(e) => setMinute(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Simulated Output Status Banner */}
            <div className={`mt-8 p-5 rounded-2xl border transition-all ${
              status.eligible 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 text-neutral-800 dark:text-neutral-200' 
                : 'bg-red-50/50 dark:bg-red-950/10 border-red-200/50 text-neutral-800 dark:text-neutral-200'
            }`}>
              <div className="flex gap-3">
                <span className="text-2xl mt-0.5">
                  {status.eligible ? '✅' : '❌'}
                </span>
                <div className="space-y-1 text-left">
                  <h4 className="font-extrabold text-sm">
                    {status.eligible ? 'Pause Request Accepted' : 'Pause Request Late'}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {status.message}
                  </p>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    {status.tip}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Guidelines / Policies Grid */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            <div className="bg-white dark:bg-neutral-950 rounded-4xl p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800/80 shadow-md space-y-6 flex-1">
              <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-lg leading-tight pb-3 border-b border-neutral-100 dark:border-neutral-800">
                General Business Guidelines
              </h3>

              <div className="space-y-4">
                {policies.map((pol, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-2.5 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${pol.bg}`}>
                      {pol.icon}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-neutral-800 dark:text-neutral-200 text-sm">
                        {pol.title}
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {pol.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact Promo */}
            <div className="p-5 bg-gradient-to-tr from-emerald-600 to-emerald-800 text-white rounded-3xl shadow-md flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs">Need custom corporate plans?</h4>
                <p className="text-[10px] text-emerald-200">Get discounted rates for orders over 10 tiffins.</p>
              </div>
              <a
                id="policy-whatsapp-btn"
                href="https://wa.me/919399372194?text=Hi! I want to discuss a bulk/corporate tiffin subscription."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-emerald-800 hover:bg-neutral-100 rounded-xl font-bold text-xs"
              >
                Inquire
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
