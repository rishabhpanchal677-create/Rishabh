import React, { useState } from 'react';
import { FAQS } from '../data';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>('faq_1');

  const toggleFAQ = (id: string) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
    }
  };

  return (
    <section 
      id="faq" 
      className="py-16 sm:py-24 bg-neutral-50 dark:bg-neutral-900/50 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-3.5 py-1.5 rounded-full border border-orange-100 dark:border-orange-900/30">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Find answers to commonly asked questions about our scheduling, deliveries, skip options, and billing procedures.
          </p>
        </div>

        {/* FAQs Accordion Block */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 shadow-xs overflow-hidden transition-all duration-300"
              >
                {/* Accordion Toggle Header */}
                <button
                  type="button"
                  id={`faq-btn-${faq.id}`}
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4 focus:outline-hidden hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <span className="font-extrabold text-neutral-800 dark:text-neutral-200 text-sm sm:text-base pr-2 flex items-center gap-3">
                    <span className="text-emerald-500 font-black shrink-0">?</span>
                    {faq.question}
                  </span>
                  <span className={`p-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>

                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100 border-t border-neutral-100 dark:border-neutral-800/60' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <p className="p-5 sm:p-6 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Support Note */}
        <div className="mt-12 text-center p-6 bg-gradient-to-tr from-emerald-50 to-emerald-100/30 dark:from-emerald-950/10 dark:to-emerald-900/10 rounded-3xl border border-emerald-100/30 dark:border-emerald-800/20">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            Still have an unanswered question? Don't worry. We are here to help!
          </p>
          <a
            id="faq-contact-whatsapp-btn"
            href="https://wa.me/919399372194?text=Hi! I have a question regarding PUREATY Tiffin Service subscriptions."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3.5 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 group"
          >
            Ask us on WhatsApp
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
