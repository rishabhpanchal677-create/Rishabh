import React, { useState } from 'react';
import { WEEKLY_MENU } from '../data';
import { Check, Calendar, HelpCircle, Flame, Star, Sparkles, Smile } from 'lucide-react';

export default function WeeklyMenu() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');

  const currentMenu = WEEKLY_MENU.find((m) => m.day === selectedDay) || WEEKLY_MENU[0];

  // Specific high-quality food images for different Indian dishes based on days
  const getFoodImage = (day: string) => {
    switch (day) {
      case 'Monday':
        return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600'; // Dal Fry & Thali
      case 'Tuesday':
        return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600'; // Rajma / Rice
      case 'Wednesday':
        return 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600'; // Chole / Bhature / Rice thali
      case 'Thursday':
        return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600'; // Dal Tadka & Paneer
      case 'Friday':
        return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600'; // Rich Shahi Paneer Thali
      case 'Saturday':
        return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600'; // Kadhi / Punjabi comfort
      case 'Sunday':
      default:
        return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=600'; // Restaurant closed/holiday visual
    }
  };

  // Get active meal based on day specifications (Friday has dinner, others default to lunch or same as lunch)
  const activeMeal = (selectedDay === 'Friday' && mealType === 'dinner' && currentMenu.dinner)
    ? currentMenu.dinner 
    : currentMenu.lunch;

  return (
    <section 
      id="menu" 
      className="py-16 sm:py-24 bg-neutral-50 dark:bg-neutral-900/50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            Our Culinary Schedule
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            Explore Our Weekly Menu
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            We offer an exciting rotation of menus so you never get bored. Soft ghee rotis, fragrant Basmati rice, slow-cooked lentils, and flavorful seasonal vegetables prepared daily.
          </p>
        </div>

        {/* Dynamic Days Tab Selection */}
        <div className="mt-12 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200">
          <div className="flex justify-start md:justify-center gap-2.5 min-w-max px-2">
            {WEEKLY_MENU.map((m) => {
              const isSelected = m.day === selectedDay;
              const isSunday = m.isHoliday;
              const isFriday = m.day === 'Friday';

              return (
                <button
                  key={m.day}
                  type="button"
                  id={`tab-day-${m.day}`}
                  onClick={() => {
                    setSelectedDay(m.day);
                    // Reset to lunch if not friday
                    if (m.day !== 'Friday') setMealType('lunch');
                  }}
                  className={`px-5 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700/80'
                  }`}
                >
                  {isFriday && <span className="text-xs">⭐</span>}
                  {m.day}
                  {isSunday && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full dark:bg-red-950/20">Closed</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Menu Card Display */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Menu Details Column */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-950 rounded-4xl p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800/80 shadow-md flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Header with active meal switch (especially for Friday Specials) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="text-2xl font-black text-neutral-800 dark:text-neutral-100 flex items-center gap-2.5">
                    {selectedDay} Menu
                    {currentMenu.day === 'Friday' && (
                      <span className="text-xs font-bold uppercase tracking-widest bg-orange-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                        <Sparkles size={10} />
                        Special
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {currentMenu.isHoliday ? 'Weekly rest day for our kitchen' : 'Authentic homemade Indian delicacies cooked with love'}
                  </p>
                </div>

                {/* Friday lunch/dinner toggle */}
                {selectedDay === 'Friday' && (
                  <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setMealType('lunch')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        mealType === 'lunch'
                          ? 'bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      ☀️ Lunch
                    </button>
                    <button
                      type="button"
                      onClick={() => setMealType('dinner')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        mealType === 'dinner'
                          ? 'bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      🌙 Dinner
                    </button>
                  </div>
                )}
              </div>

              {/* Sunday Holiday State */}
              {currentMenu.isHoliday ? (
                <div className="py-12 text-center space-y-4">
                  <span className="text-4xl">😴</span>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-neutral-800 dark:text-neutral-200">Sunday is Holiday</h4>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      Our kitchen is closed on Sundays to give our chefs and delivery partners a well-deserved break. We return fresh on Monday morning!
                    </p>
                  </div>
                </div>
              ) : (
                /* Meal Items List */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Rotis */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100/40 dark:border-neutral-800/60 flex items-start gap-3">
                    <span className="text-2xl shrink-0">🥖</span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rotis</h4>
                      <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">{activeMeal.rotis}</p>
                    </div>
                  </div>

                  {/* Sabji */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100/40 dark:border-neutral-800/60 flex items-start gap-3">
                    <span className="text-2xl shrink-0">🥗</span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Seasonal Sabji</h4>
                      <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">{activeMeal.sabji}</p>
                    </div>
                  </div>

                  {/* Dal */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100/40 dark:border-neutral-800/60 flex items-start gap-3">
                    <span className="text-2xl shrink-0">🥣</span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Dal / Lentils</h4>
                      <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">{activeMeal.dal}</p>
                    </div>
                  </div>

                  {/* Rice */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100/40 dark:border-neutral-800/60 flex items-start gap-3">
                    <span className="text-2xl shrink-0">🍚</span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rice Portion</h4>
                      <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">{activeMeal.rice}</p>
                    </div>
                  </div>

                  {/* Salad */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100/40 dark:border-neutral-800/60 flex items-start gap-3">
                    <span className="text-2xl shrink-0">🥒</span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Salad Portion</h4>
                      <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">{activeMeal.salad}</p>
                    </div>
                  </div>

                  {/* Achar */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100/40 dark:border-neutral-800/60 flex items-start gap-3">
                    <span className="text-2xl shrink-0">🌶️</span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Accompaniment</h4>
                      <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">{activeMeal.achar}</p>
                    </div>
                  </div>

                  {/* Sweet Dish Add-on (for Friday dinner) */}
                  {activeMeal.sweet && (
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-start gap-3 animate-pulse">
                      <span className="text-2xl shrink-0">🍮</span>
                      <div>
                        <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">⭐ Friday Sweet Special</h4>
                        <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100 mt-0.5">{activeMeal.sweet}</p>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {!currentMenu.isHoliday && (
              <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Contains only fresh seasonal veggies
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Zero MSG or chemical food colors
                </span>
              </div>
            )}

          </div>

          {/* Graphics/Interactive Box Column */}
          <div className="lg:col-span-5 relative flex flex-col gap-6">
            
            {/* Image display card */}
            <div className="relative rounded-4xl overflow-hidden h-64 lg:h-auto lg:flex-1 shadow-lg border border-white dark:border-neutral-800">
              <img
                src={getFoodImage(selectedDay)}
                alt={`${selectedDay} food representation`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 w-max px-2 py-0.5 rounded-sm mb-1">
                  {selectedDay === 'Sunday' ? 'Kitchen Break' : 'Authentic Kitchen'}
                </span>
                <h4 className="text-lg font-black">{selectedDay === 'Sunday' ? 'Resting & Sourcing' : 'Home-style Daily Cooking'}</h4>
                <p className="text-xs text-neutral-200/95 mt-1 leading-snug">
                  {selectedDay === 'Sunday' 
                    ? 'Preparing spices & sourcing organic produce for the next week.'
                    : 'Dishes are ground, sautéed, and packed just 30 minutes before departure.'}
                </p>
              </div>
            </div>

            {/* Premium Ghee Rotis Info Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-3xl shadow-md flex items-center gap-4">
              <span className="text-3xl shrink-0">🌾</span>
              <div>
                <h4 className="font-extrabold text-sm leading-snug">Pure MP Sharbati Whole Wheat</h4>
                <p className="text-xs text-orange-100 mt-0.5 leading-normal">
                  Our rotis are prepared only using pure premium wheat flour and organic clarified cow ghee. Low on gluten, high on softness!
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
