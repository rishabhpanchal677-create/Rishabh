import React from 'react';
import { Home, Clock, Sparkles, UtensilsCrossed, Award, TrendingUp, Truck, Smile, CheckCircle } from 'lucide-react';
import { CORE_FEATURES } from '../data';

export default function AboutUs() {
  // Map feature icons to lucide icons
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <Home className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'clock':
        return <Clock className="w-6 h-6 text-orange-500" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'chef-hat':
        return <UtensilsCrossed className="w-6 h-6 text-orange-500" />;
      case 'award':
        return <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'trending-up':
        return <TrendingUp className="w-6 h-6 text-orange-500" />;
      case 'truck':
        return <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'smile':
        return <Smile className="w-6 h-6 text-orange-500" />;
      default:
        return <CheckCircle className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <section 
      id="about" 
      className="py-16 sm:py-24 bg-neutral-50 dark:bg-neutral-900/50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-3.5 py-1.5 rounded-full border border-orange-100 dark:border-orange-900/30">
            About Our Kitchen
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            Why Choose Our Tiffin Service?
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            We are dedicated to bringing you wholesome home-cooked meals that nourish your body and delight your palate. Here is why thousands of corporate professionals and students trust us daily.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CORE_FEATURES.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-neutral-950 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800/80 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 shadow-xs hover:shadow-lg transition-all duration-300 group flex gap-4"
            >
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 transition-all shrink-0 self-start">
                {getIcon(feature.icon)}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-sm flex items-center gap-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
