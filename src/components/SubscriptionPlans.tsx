import React from 'react';
import { SUBSCRIPTION_PLANS } from '../data';
import { SubscriptionPlan } from '../types';
import { Check, Info, Shield, HelpCircle, Star } from 'lucide-react';

interface SubscriptionPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export default function SubscriptionPlans({ onSelectPlan }: SubscriptionPlansProps) {
  return (
    <section 
      id="plans" 
      className="py-16 sm:py-24 bg-white dark:bg-neutral-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            Subscription Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            Flexible Subscription Plans
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            No long contracts, cancel or skip anytime. Choose the perfect meal companion designed to fit your busy schedule.
          </p>
        </div>

        {/* Subscription Plans Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isPopular = plan.id === 'double_meal';
            const isSingle = plan.id === 'single_meal';

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-neutral-900 text-white dark:bg-neutral-950 border-2 border-emerald-500 shadow-xl scale-102 lg:scale-105 z-10'
                    : 'bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <Star size={10} className="fill-current text-white" />
                    Best Value
                  </span>
                )}

                {isSingle && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  {/* Name and description */}
                  <div className="space-y-2">
                    <h3 className={`text-xl font-extrabold ${isPopular ? 'text-white' : 'text-neutral-800 dark:text-neutral-100'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs ${isPopular ? 'text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'} line-clamp-2`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing block */}
                  <div className="py-2.5 border-y border-neutral-200/20 dark:border-neutral-700/20">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${isPopular ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'}`}>
                        ₹{plan.price}
                      </span>
                      <span className={`text-xs font-semibold ${isPopular ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        / {plan.period}
                      </span>
                    </div>
                    {plan.mealsCount && (
                      <span className="inline-block mt-1.5 text-xs font-bold text-orange-500 dark:text-orange-400">
                        ({plan.mealsCount} included)
                      </span>
                    )}
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        <Check 
                          size={16} 
                          className={`mt-0.5 shrink-0 ${isPopular ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`} 
                        />
                        <span className={isPopular ? 'text-neutral-200' : 'text-neutral-600 dark:text-neutral-300'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit CTA Button */}
                <div className="mt-8 pt-4 border-t border-neutral-200/10 dark:border-neutral-700/10">
                  <button
                    id={`subscribe-btn-${plan.id}`}
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-98 ${
                      isPopular
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20'
                        : isSingle
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    {plan.type === 'trial' ? 'Book Trial' : plan.type === 'daily' ? 'Order Today' : 'Subscribe Now'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Safety Note bottom */}
        <div className="mt-12 p-6 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-3xl border border-emerald-100/30 dark:border-emerald-800/30 flex flex-col sm:flex-row items-center sm:items-start gap-4 max-w-4xl mx-auto">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0">
            <Shield size={24} />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">
              Our PUREATY Delivery Policy
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              For monthly subscribers, we deliver in premium insulated steel tiffins to keep meals sizzling hot. Occasional and trial meals are served in high-grade recyclable microwave-safe disposable containers. No hidden charges or registration fees!
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
