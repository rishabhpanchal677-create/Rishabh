import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, X, Check, FileText, PauseCircle, Utensils, 
  HelpCircle, Sparkles, Send, MessageSquare 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TemplateOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  text: string;
}

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('general');
  const [customText, setCustomText] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  // Safely extract context data for pre-filling templates
  let context: any = null;
  try {
    context = useApp();
  } catch (e) {
    console.warn("AppContext not found in FloatingWhatsApp");
  }

  const currentUser = context?.currentUser || null;
  const userName = currentUser?.name || '[Your Name]';
  const userEmail = currentUser?.email || '[Your Email]';
  const userPhone = currentUser?.phone || '[Your Phone]';
  const planName = currentUser?.activePlanName || 'Single Meal Plan (Monthly)';
  const userAddress = currentUser?.address || '[Your Delivery Address]';

  const templates: TemplateOption[] = [
    {
      id: 'general',
      label: 'General Query',
      icon: <HelpCircle size={14} className="text-orange-400" />,
      text: `Hello PUREATY Tiffin Service! I am interested in subscribing to your healthy, homemade tiffin food services. Could you please share more details about your delivery timings, pricing options, and trial process in Indore?`
    },
    {
      id: 'invoice',
      label: 'Request Invoice',
      icon: <FileText size={14} className="text-blue-400" />,
      text: `Hello PUREATY Tiffin! I would like to request the tax invoice/receipt for my active subscription.\n\nName: ${userName}\nEmail: ${userEmail}\nPlan: ${planName}\n\nPlease email or send it to me here. Thanks!`
    },
    {
      id: 'pause',
      label: 'Pause Plan',
      icon: <PauseCircle size={14} className="text-red-400" />,
      text: `Hello PUREATY! I would like to temporarily pause/hold my active subscription.\n\nName: ${userName}\nPhone: +91 ${userPhone}\nActive Plan: ${planName}\nPause Dates: From [Start Date] to [End Date]\nReason: [e.g., Travelling / Out of station]\n\nPlease confirm the pause of my meals.`
    },
    {
      id: 'trial',
      label: 'Schedule Trial',
      icon: <Utensils size={14} className="text-emerald-400" />,
      text: `Hi PUREATY team, I would like to schedule a Trial Meal for today's lunch/dinner. Please let me know the daily menu and payment details.\n\nName: ${userName}\nPhone: +91 ${userPhone}\nDelivery Address: ${userAddress}`
    },
    {
      id: 'custom',
      label: 'Feedback / Other',
      icon: <MessageSquare size={14} className="text-amber-400" />,
      text: `Hello PUREATY Tiffin! I wanted to share some quick feedback regarding today's meal.\n\nName: ${userName}\nFeedback: [Enter your custom comments here]`
    }
  ];

  // Set default message text when template changes
  useEffect(() => {
    const selected = templates.find(t => t.id === selectedTemplateId);
    if (selected) {
      setCustomText(selected.text);
    }
  }, [selectedTemplateId, currentUser]);

  // Listen for custom close event from other panels
  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('close-whatsapp-panel', handleClose);
    return () => window.removeEventListener('close-whatsapp-panel', handleClose);
  }, []);

  // When state changes to open, dispatch close to other panels
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('close-gemini-panel'));
    }
  }, [isOpen]);

  // Handle outside clicks to close the popover nicely
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // Only close if not clicking the main floating toggle button
        const triggerBtn = document.getElementById('floating-whatsapp-btn');
        if (triggerBtn && !triggerBtn.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendToWhatsApp = () => {
    const cleanMsg = customText.trim();
    if (!cleanMsg) return;

    const encodedText = encodeURIComponent(cleanMsg);
    // WhatsApp contact number is 919399372194 (as in the original static button)
    const whatsappUrl = `https://wa.me/919399372194?text=${encodedText}`;
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        title="Quick WhatsApp Inquiry"
        id="floating-whatsapp-btn"
      >
        <MessageCircle size={20} className="fill-white/10 shrink-0" />
        
        {/* Pulse Notification Ring */}
        <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
        </span>
      </button>

      {/* Template Generator Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 md:w-[400px] bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col font-sans"
            id="whatsapp-template-window"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageCircle size={20} className="fill-emerald-400/20" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    PUREATY Support
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  </h4>
                  <p className="text-[9px] text-neutral-400 font-medium">Quick WhatsApp Message Generator</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Container */}
            <div className="p-4 space-y-4 flex-1">
              {/* Informative Label */}
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                <Sparkles size={12} className="text-emerald-400" />
                <span>Select a Message Template</span>
              </div>

              {/* Template Tabs/Selector Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {templates.map((temp) => {
                  const isSelected = selectedTemplateId === temp.id;
                  return (
                    <button
                      key={temp.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(temp.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-[10px] font-black tracking-tight text-left transition-all border ${
                        isSelected 
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' 
                          : 'bg-neutral-900 border-neutral-850 hover:border-neutral-750 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <span className="shrink-0">{temp.icon}</span>
                      <span className="truncate">{temp.label}</span>
                      {isSelected && <Check size={10} className="ml-auto text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Live Preview Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] text-neutral-500 font-black uppercase tracking-wider">
                    Edit Message Text Before Sending
                  </label>
                  {currentUser && (
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-bold">
                      Pre-filled with your Info ✨
                    </span>
                  )}
                </div>
                
                <textarea
                  rows={6}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type your custom message..."
                  className="w-full p-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs text-white placeholder-neutral-500 outline-none transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Footer Send Action */}
            <div className="p-3 bg-neutral-950 border-t border-neutral-850 flex items-center justify-between gap-3">
              <span className="text-[9px] text-neutral-500 font-bold px-1 select-none">
                Delivery Headquarters: Indore
              </span>
              <button
                onClick={handleSendToWhatsApp}
                disabled={!customText.trim()}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20 shrink-0"
              >
                <Send size={12} />
                Open WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
