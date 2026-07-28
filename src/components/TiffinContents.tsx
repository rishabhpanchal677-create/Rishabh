import React, { useState } from 'react';
import { TIFFIN_INCLUSIONS } from '../data';
import { ShieldCheck, Leaf, HelpCircle, Flame, Star, Coffee } from 'lucide-react';

export default function TiffinContents() {
  const [packMode, setPackMode] = useState<'steel' | 'disposable'>('steel');

  return (
    <section 
      id="how-it-works" 
      className="py-16 sm:py-24 bg-white dark:bg-neutral-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            What's Included
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            Inside Every PUREATY Tiffin
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            We deliver a complete balanced nutritious plate every single time. Here is the perfect composition of your daily tiffin lunch or dinner.
          </p>
        </div>

        {/* Packing Mode Switcher */}
        <div className="mt-10 flex justify-center">
          <div className="p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center shadow-xs border border-neutral-200/40 dark:border-neutral-700/40">
            <button
              type="button"
              id="pkg-steel-btn"
              onClick={() => setPackMode('steel')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                packMode === 'steel'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100'
              }`}
            >
              🍱 Insulated Steel Tiffins
              <span className="text-[9px] uppercase tracking-wide bg-emerald-700 text-white px-1.5 py-0.5 rounded-xs font-black">Monthly</span>
            </button>
            <button
              type="button"
              id="pkg-disposable-btn"
              onClick={() => setPackMode('disposable')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                packMode === 'disposable'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100'
              }`}
            >
              📦 Recyclable Containers
              <span className="text-[9px] uppercase tracking-wide bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-xs font-black dark:bg-neutral-700 dark:text-neutral-200">Trial</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Visual Showcase (Insulated steel tiffin description) */}
          <div className="lg:col-span-5 bg-neutral-50 dark:bg-neutral-800/40 rounded-4xl p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between h-full min-h-[400px]">
            <div className="space-y-6">
              {packMode === 'steel' ? (
                /* Beautiful 3-Tier Interactive Tiffin Tower (White with Neon Green details) */
                <div className="flex flex-col items-center justify-center py-6 group select-none">
                  {/* Metal carrying handle */}
                  <div className="w-20 h-7 border-t-[4px] border-x-[4px] border-emerald-500 rounded-t-2xl mx-auto relative z-20 group-hover:-translate-y-1 transition-transform duration-300" />
                  
                  {/* Handle locking mechanism */}
                  <div className="w-24 h-2.5 bg-emerald-600 rounded-md relative z-10 -mt-0.5 shadow-sm" />
                  
                  {/* Stack of Tiffins */}
                  <div className="relative mt-1 flex flex-col items-center">
                    {/* Vertical Latch Brackets */}
                    <div className="absolute left-[-6px] top-1 bottom-1 w-1.5 bg-emerald-500 rounded-full z-20 shadow-[0_0_8px_#39ff14]" />
                    <div className="absolute right-[-6px] top-1 bottom-1 w-1.5 bg-emerald-500 rounded-full z-20 shadow-[0_0_8px_#39ff14]" />

                    {/* Tier 3 (Top Container) */}
                    <div className="w-32 h-10 bg-white border border-neutral-200 rounded-md flex flex-col items-center justify-center shadow-xs text-center z-10 group-hover:-translate-y-4 transition-transform duration-500 relative">
                      <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase">TIER 3</span>
                      <span className="text-[10px] text-neutral-800 font-extrabold -mt-1">PANEER & DRY VEG</span>
                      <div className="absolute inset-x-2 bottom-1 h-0.5 bg-emerald-500/20" />
                    </div>

                    {/* Tier 2 (Middle Container) */}
                    <div className="w-32 h-10 bg-white border border-neutral-200 rounded-md flex flex-col items-center justify-center shadow-xs text-center z-10 mt-1 group-hover:scale-102 transition-all duration-500 relative">
                      <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase">TIER 2</span>
                      <span className="text-[10px] text-neutral-800 font-extrabold -mt-1">DAL TADKA & RICE</span>
                      <div className="absolute inset-x-2 bottom-1 h-0.5 bg-emerald-500/20" />
                    </div>

                    {/* Tier 1 (Bottom Container) */}
                    <div className="w-32 h-10 bg-white border border-neutral-200 rounded-md flex flex-col items-center justify-center shadow-xs text-center z-10 mt-1 group-hover:translate-y-4 transition-transform duration-500 relative">
                      <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase">TIER 1</span>
                      <span className="text-[10px] text-neutral-800 font-extrabold -mt-1">ROTI & FRESH SALAD</span>
                      <div className="absolute inset-x-2 bottom-1 h-0.5 bg-emerald-500/20" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mt-4 animate-pulse">
                    Hover to separate tiffin tiers
                  </span>
                </div>
              ) : (
                /* Disposable Box presentation */
                <div className="flex flex-col items-center justify-center py-6 group select-none">
                  {/* Clean paper container */}
                  <div className="w-40 h-28 bg-white border-2 border-dashed border-emerald-500/30 rounded-3xl p-3 flex flex-col justify-between shadow-md relative group-hover:scale-105 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-xl">📦</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-black rounded-sm uppercase tracking-wider">
                        Tamper Seal
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-neutral-800">ECO BOX PACKING</p>
                      <p className="text-[8px] text-neutral-400 leading-none">Microwave safe • Food grade</p>
                    </div>
                    <div className="absolute -top-1.5 left-6 right-6 h-3 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 mt-4">
                    Sealed Sanitized Delivery Box
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-neutral-800 dark:text-neutral-100">
                  {packMode === 'steel' ? 'Premium Insulated Steel Tiffin' : 'Hygienic Disposable Boxes'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {packMode === 'steel' 
                    ? 'Our standard monthly subscribers receive their hot meals in eco-friendly 3-tier food-grade vacuum insulated steel containers. They lock in the moisture, heat, and nutrition, ensuring you enjoy piping-hot food at your convenience.'
                    : 'Occasional, daily, or trial orders are packed in leak-proof, food-grade, micro-wave safe disposable containers. Sturdy, ultra-hygienic, and sealed with tamper-evident liners for your maximum safety.'}
                </p>
              </div>

              {/* Quality Checklist */}
              <ul className="space-y-3 pt-4 border-t border-neutral-200/40 dark:border-neutral-700/40 text-xs text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {packMode === 'steel' ? '100% Leak-proof and Airtight locking technology' : 'Microwave-safe for easy re-heating'}
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {packMode === 'steel' ? 'Keeps meals warm for up to 4 hours easily' : 'Sealed with protective high-temp sanitized films'}
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Eco-friendly, chemical-free, BPA-free food grade material
                </li>
              </ul>
            </div>

            <div className="mt-8 p-4 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                🌱
              </div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-400">
                We wash and steam-sterilize all steel tiffins at 120°C in industrial dishwasher systems daily.
              </p>
            </div>
          </div>

          {/* Tiffin Inclusions Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TIFFIN_INCLUSIONS.map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 dark:bg-neutral-800/20 hover:bg-white dark:hover:bg-neutral-800 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800/50 hover:border-emerald-500/10 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl bg-white dark:bg-neutral-900 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    {item.icon}
                  </span>
                  <h4 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-sm">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
