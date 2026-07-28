import React, { useState, useEffect } from 'react';
import { X, Check, Clock, MapPin, Phone, ChevronRight, MessageSquare, CreditCard, Landmark, Wallet, ShieldCheck, Lock, Copy, QrCode, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionPlan } from '../types';
import { useApp } from '../context/AppContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan | null;
  onSuccess: (orderDetail: any) => void;
}

export default function CheckoutModal({ isOpen, onClose, selectedPlan, onSuccess }: CheckoutModalProps) {
  const { currentUser, placeOrder, startTracking } = useApp();

  const [step, setStep] = useState(1);
  const [mealPreference, setMealPreference] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [timePreference, setTimePreference] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [extraRotis, setExtraRotis] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Gateway Form States
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiMode, setUpiMode] = useState<'qr' | 'collect'>('qr');
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [recentTxn, setRecentTxn] = useState<any>(null);

  // Set default preferences and prefill user profile details if logged in
  useEffect(() => {
    if (selectedPlan) {
      setStep(1);
      setErrors({});
      setIsSubmitting(false);
      
      // Prefill contact from session
      if (currentUser) {
        setCustomerName(currentUser.name);
        setCustomerPhone(currentUser.phone);
        setAddress(currentUser.address);
        setLandmark(currentUser.landmark || '');
      } else {
        setCustomerName('');
        setCustomerPhone('');
        setAddress('');
        setLandmark('');
      }

      if (selectedPlan.type === 'double') {
        setMealPreference('both');
        setTimePreference('');
      } else {
        setMealPreference('lunch');
        setTimePreference('');
      }
    }
  }, [selectedPlan, isOpen, currentUser]);

  if (!isOpen || !selectedPlan) return null;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleNextStep = () => {
    const currentErrors: Record<string, string> = {};
    if (step === 1) {
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (!customerName.trim()) {
        currentErrors.customerName = 'Name is required';
      }
      if (!customerPhone.trim()) {
        currentErrors.customerPhone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(customerPhone.trim().replace(/[-+()\s]/g, ''))) {
        currentErrors.customerPhone = 'Please enter a valid 10-digit mobile number';
      }
      if (!address.trim()) {
        currentErrors.address = 'Delivery address is required';
      }
      setErrors(currentErrors);
      if (Object.keys(currentErrors).length === 0) setStep(3);
    }
  };

  const calculateTotal = () => {
    let base = selectedPlan.price;
    if (extraRotis) {
      const meals = selectedPlan.type === 'single' ? 26 : selectedPlan.type === 'double' ? 52 : 1;
      base += meals * 15;
    }
    return base;
  };

  const handleFinalSubmit = () => {
    const currentErrors: Record<string, string> = {};

    // Validate Gateway Fields based on selected option
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        currentErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      if (!cardName.trim()) {
        currentErrors.cardName = 'Cardholder name is required';
      }
      if (cardExpiry.length < 5) {
        currentErrors.cardExpiry = 'Enter MM/YY';
      }
      if (cardCvv.length < 3) {
        currentErrors.cardCvv = 'CVV is required';
      }
    } else if (paymentMethod === 'upi') {
      if (upiMode === 'collect') {
        if (!upiId.trim() || !upiId.includes('@')) {
          currentErrors.upiId = 'Please enter a valid UPI address (e.g., user@upi)';
        }
      } else {
        if (utrNumber.trim() && !/^\d{12}$/.test(utrNumber.trim())) {
          currentErrors.utrNumber = 'UPI Ref/UTR must be exactly 12 digits (numbers only)';
        }
      }
    }

    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    setIsSubmitting(true);

    // Simulate SSL Handshake & Payment Gateway authorization (3s)
    setTimeout(() => {
      setIsSubmitting(false);

      const amountPaid = calculateTotal();
      
      // Save order in state manager
      const orderResult = placeOrder({
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        price: amountPaid,
        mealPreference,
        timePreference,
        address,
        landmark,
        extraRotis,
        paymentMethod
      });

      setRecentTxn(orderResult);
      onSuccess(orderResult);
      setStep(4); // Trigger success checkmark screen

      // Trigger high-quality, professional confetti particle explosions
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f97316', '#3b82f6', '#facc15', '#ec4899']
      });

      // Staggered side bursts for immersive celebration feel
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: ['#10b981', '#f97316', '#ffffff']
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ['#10b981', '#f97316', '#ffffff']
        });
      }, 400);
    }, 2500);
  };

  const generateWhatsAppMessage = () => {
    const total = calculateTotal();
    const text = `*PUREATY Tiffin Service - Payment Confirmed*
----------------------------------------
*Plan:* ${selectedPlan.name}
*Customer:* ${customerName}
*Phone:* ${customerPhone}
*Meal Preference:* ${mealPreference.toUpperCase()}
*Address:* ${address}${landmark ? ` (Landmark: ${landmark})` : ''}
*Payment Gateway:* ${paymentMethod.toUpperCase()} (SECURE ONLINE PAID)
*Total Price:* ₹${total}
----------------------------------------
Please dispatch my organic tiffin delivery schedule. Thank you!`;

    return `https://wa.me/919399372194?text=${encodeURIComponent(text)}`;
  };

  return (
    <div id="checkout-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div 
        id="checkout-modal-container"
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 transition-all transform duration-300 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {step < 4 ? `Step ${step} of 3` : 'Receipt Invoice'}
            </span>
            <h3 className="text-lg font-extrabold text-neutral-800 dark:text-neutral-100 mt-1">
              {step === 4 ? 'Payment Successful!' : `Secure Checkout • ${selectedPlan.name}`}
            </h3>
          </div>
          <button 
            id="close-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
          
          {/* Visual Progress Bar (Stepper) */}
          {step < 4 && (
            <div className="w-full pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
              <div className="relative flex items-center justify-between px-2">
                {/* Connecting Line Background */}
                <div className="absolute left-6 right-6 top-4 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full z-0" />
                
                {/* Connecting Line Foreground (Progress Fill) */}
                <div 
                  className="absolute left-6 top-4 h-1 bg-emerald-500 rounded-full transition-all duration-500 ease-in-out z-0 shadow-[0_0_8px_#39ff14]/30"
                  style={{ 
                    width: `calc(${step === 1 ? '0%' : step === 2 ? '50%' : '100%'} - ${step === 1 ? '0px' : '12px'})` 
                  }}
                />

                {/* Step 1: Plan & Timing */}
                <div className="flex flex-col items-center relative z-10 w-1/3">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step > 1 
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                        : step === 1
                        ? 'bg-white dark:bg-neutral-900 border-2 border-emerald-500 text-emerald-500 dark:text-emerald-400 ring-4 ring-emerald-500/15 shadow-md'
                        : 'bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-400'
                    }`}
                  >
                    {step > 1 ? <Check size={14} className="stroke-[3]" /> : '1'}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-2 text-center transition-colors duration-300 ${
                    step >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'
                  }`}>
                    {selectedPlan?.type === 'double' ? 'Meal Add-ons' : 'Meal Slot'}
                  </span>
                </div>

                {/* Step 2: Delivery Details */}
                <div className="flex flex-col items-center relative z-10 w-1/3">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step > 2 
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                        : step === 2
                        ? 'bg-white dark:bg-neutral-900 border-2 border-emerald-500 text-emerald-500 dark:text-emerald-400 ring-4 ring-emerald-500/15 shadow-md'
                        : 'bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-400'
                    }`}
                  >
                    {step > 2 ? <Check size={14} className="stroke-[3]" /> : '2'}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-2 text-center transition-colors duration-300 ${
                    step >= 2 ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-neutral-400 font-bold'
                  }`}>
                    Delivery Details
                  </span>
                </div>

                {/* Step 3: Payment */}
                <div className="flex flex-col items-center relative z-10 w-1/3">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step === 3
                        ? 'bg-white dark:bg-neutral-900 border-2 border-emerald-500 text-emerald-500 dark:text-emerald-400 ring-4 ring-emerald-500/15 shadow-md'
                        : 'bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-400'
                    }`}
                  >
                    3
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-2 text-center transition-colors duration-300 ${
                    step === 3 ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-neutral-400 font-bold'
                  }`}>
                    Payment
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: TIME AND MEAL SLOTS */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                {selectedPlan.type === 'double' ? 'Meal Add-ons & Customization' : 'Meal Preference & Add-ons'}
              </h4>
              
              {selectedPlan.type !== 'double' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Which meal slot do you want delivered?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMealPreference('lunch');
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-center text-xs font-bold transition-all ${
                        mealPreference === 'lunch'
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      ☀️ Lunch Only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMealPreference('dinner');
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-center text-xs font-bold transition-all ${
                        mealPreference === 'dinner'
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      🌙 Dinner Only
                    </button>
                  </div>
                </div>
              )}

              {/* Extra rotis add-on toggle */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl flex items-center justify-between border border-neutral-100 dark:border-neutral-800">
                <div>
                  <h5 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                    Need Extra Hot Rotis?
                  </h5>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Add +2 daily wheat rotis to every tiffin box (+₹15 per box)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExtraRotis(!extraRotis)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 shrink-0 ${
                    extraRotis ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-750'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                    extraRotis ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESS & PROFILE */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                Delivery Location Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-neutral-500">Contact Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter recipient's name"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:border-emerald-500"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-[10px] mt-0.5">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-neutral-500">Mobile Number (For Courier Call)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-bold">+91</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="93993 72194"
                      className="w-full p-2.5 pl-11 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  {errors.customerPhone && (
                    <p className="text-red-500 text-[10px] mt-0.5">{errors.customerPhone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-neutral-500">Complete Street Address (Vijay Nagar, Indore)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-neutral-400" size={15} />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 405, Block B, Scheme No. 54, Vijay Nagar, Indore"
                    className="w-full p-2.5 pl-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-[10px] mt-0.5">{errors.address}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-neutral-500">Landmark / Gate Instructions (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Behind Corner House Ice Cream"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl text-[10px] text-neutral-500 leading-normal">
                🚀 Thermal insulated stainless steel containers are provided free of cost. We will swap containers daily at your door.
              </div>
            </div>
          )}

          {/* STEP 3: INTEGRATED PAYMENT GATEWAY (Stripe elements mock) */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h4 className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                Review & Secure Gateway Payment
              </h4>

              {/* Order total receipt breakdown */}
              <div className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-800 space-y-3.5">
                <div className="flex justify-between items-start pb-2 border-b border-neutral-850">
                  <div>
                    <h5 className="font-extrabold text-white text-xs">{selectedPlan.name}</h5>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {selectedPlan.mealsCount} • {mealPreference.toUpperCase()}
                    </p>
                  </div>
                  <span className="font-extrabold text-white text-xs">₹{selectedPlan.price}</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-neutral-400">
                  {extraRotis && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Extra +2 Wheat Rotis daily</span>
                      <span>+₹{selectedPlan.type === 'single' ? 26 * 15 : selectedPlan.type === 'double' ? 52 * 15 : 15}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Contactless Delivery</span>
                    <span className="text-emerald-400 font-bold">FREE</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-dashed border-neutral-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-300">Total Charged Amount</span>
                  <span className="font-black text-xl text-emerald-400">₹{calculateTotal()}.00</span>
                </div>
              </div>

              {/* SECURE ONLINE PAYMENT FORM */}
              <div className="bg-neutral-900/40 p-5 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Choose Gateway Method</span>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 rounded-md">
                    <Lock size={10} />
                    SSL 256-Bit Secure
                  </div>
                </div>

                {/* Gateway select tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('card'); setErrors({}); }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-black transition-colors ${
                      paymentMethod === 'card'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                    }`}
                  >
                    <CreditCard size={15} />
                    Stripe Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('upi'); setErrors({}); }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-black transition-colors ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                    }`}
                  >
                    <Landmark size={15} />
                    Instant UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('paypal'); setErrors({}); }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-black transition-colors ${
                      paymentMethod === 'paypal'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                    }`}
                  >
                    <Wallet size={15} />
                    PayPal Account
                  </button>
                </div>

                {/* DYNAMIC FORM RENDERS BASED ON METHOD */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 animate-fade-in pt-1">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 2222 3333 4444"
                        className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-hidden"
                      />
                      {errors.cardNumber && <p className="text-red-500 text-[9px] mt-0.5">{errors.cardNumber}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Johnathan Doe"
                        className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-hidden"
                      />
                      {errors.cardName && <p className="text-red-500 text-[9px] mt-0.5">{errors.cardName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white text-center focus:outline-hidden"
                        />
                        {errors.cardExpiry && <p className="text-red-500 text-[9px] mt-0.5">{errors.cardExpiry}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">CVV Code</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="***"
                          className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white text-center focus:outline-hidden"
                        />
                        {errors.cardCvv && <p className="text-red-500 text-[9px] mt-0.5">{errors.cardCvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-4 animate-fade-in pt-1 text-left">
                    {/* Mode Selector */}
                    <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                      <button
                        type="button"
                        onClick={() => { setUpiMode('qr'); setErrors({}); }}
                        className={`py-2 px-3 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 transition-colors ${
                          upiMode === 'qr'
                            ? 'bg-neutral-850 text-emerald-400 font-extrabold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <QrCode size={12} />
                        Scan Payment QR
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUpiMode('collect'); setErrors({}); }}
                        className={`py-2 px-3 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 transition-colors ${
                          upiMode === 'collect'
                            ? 'bg-neutral-850 text-emerald-400 font-extrabold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Landmark size={12} />
                        Enter UPI ID
                      </button>
                    </div>

                    {upiMode === 'qr' ? (
                      <div className="space-y-4">
                        {/* High-Fidelity Google Pay styled UPI QR Canvas (Using high-contrast light theme for reliable camera scanning) */}
                        <div className="bg-[#f2f5fa] rounded-[32px] p-6 text-center border border-neutral-200/60 shadow-inner space-y-5 max-w-[310px] mx-auto text-neutral-900 select-none animate-fade-in">
                          
                          {/* Profile Header (Mimics GPay style above the card) */}
                          <div className="flex items-center justify-center gap-3">
                            {/* Realistic monogrammed selfie avatar mimicking the user's uploaded portrait */}
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-200 shrink-0 flex items-center justify-center">
                              {/* Soft warm skin-tone/clothing gradient mimicking Lalit's photo */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-[#3b5998]/30 via-[#f7b731]/25 to-[#4b6cb7]/20" />
                              <span className="font-extrabold text-[#3c4043] text-sm tracking-wider">LD</span>
                              {/* Monogram reflection sheen */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40" />
                              {/* Phone lens mirror reflection mock dot */}
                              <div className="absolute bottom-2 right-2.5 w-1.5 h-1.5 bg-white/70 rounded-full" />
                            </div>
                            <div className="text-left leading-tight">
                              <h5 className="font-bold text-[#3c4043] text-base tracking-tight">Lalit Dhupad</h5>
                              <p className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black leading-none">✓</span>
                                Verified UPI Merchant
                              </p>
                            </div>
                          </div>

                          {/* White Rounded Card (Identical to GPay card outline) */}
                          <div className="bg-white rounded-[24px] p-5 border border-neutral-100 shadow-md space-y-4 max-w-[270px] mx-auto relative group transition-transform duration-350 hover:scale-[1.01]">
                            
                            {/* Dynamic QR Code Container */}
                            <div className="relative bg-neutral-50 p-4 rounded-2xl inline-block border border-neutral-100 shadow-inner">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                  `upi://pay?pa=ldhupad@okicici&pn=Lalit Dhupad&am=${calculateTotal()}&cu=INR&tn=PUREATY Subscription`
                                )}`}
                                alt="UPI QR Code"
                                className="w-36 h-36 mx-auto rounded-md"
                                referrerPolicy="no-referrer"
                              />
                              
                              {/* Center Logo Badge (GPay colorful logo replica) */}
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md border border-neutral-200/70 flex items-center justify-center w-8 h-8">
                                <div className="flex items-center justify-center gap-[1.5px]">
                                  {/* Red, Yellow, Green, Blue pills */}
                                  <div className="w-[3px] h-[11px] bg-[#4285F4] rounded-full" />
                                  <div className="w-[3px] h-[15px] bg-[#EA4335] rounded-full -translate-y-[1px]" />
                                  <div className="w-[3px] h-[13px] bg-[#FBBC05] rounded-full translate-y-[1px]" />
                                  <div className="w-[3px] h-[9px] bg-[#34A853] rounded-full" />
                                </div>
                              </div>
                            </div>

                            {/* UPI ID block inside card with one-click clipboard utility */}
                            <div className="space-y-1">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('ldhupad@okicici');
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                }}
                                className="w-full flex flex-col items-center justify-center hover:bg-neutral-50 p-2 rounded-xl border border-dashed border-neutral-150 transition-colors"
                              >
                                <p className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-widest leading-none mb-1">UPI ID</p>
                                <div className="flex items-center gap-1.5">
                                  <code className="text-[11px] font-black text-neutral-700 tracking-tight">
                                    ldhupad@okicici
                                  </code>
                                  <span className={`p-1 rounded-md border transition-all ${
                                    copied
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                      : 'bg-white text-neutral-500 border-neutral-200'
                                  }`}>
                                    {copied ? <Check size={9} className="stroke-[3]" /> : <Copy size={9} />}
                                  </span>
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Instructions below the Card */}
                          <div className="space-y-1 text-center">
                            <p className="text-[#3c4043] font-bold text-xs">
                              Scan to pay with any UPI app
                            </p>
                            <p className="text-[10px] text-neutral-500 font-semibold leading-normal">
                              Payable amount: <span className="text-neutral-800 font-extrabold">₹{calculateTotal()}.00</span>
                            </p>
                          </div>
                        </div>

                        {/* UTR Input Field */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                              UPI Transaction ID / Ref No. (UTR)
                            </label>
                            <span className="text-[8px] text-neutral-500 italic">Optional</span>
                          </div>
                          <input
                            type="text"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            placeholder="Enter 12-digit UPI UTR number"
                            className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white tracking-widest text-center focus:outline-hidden focus:border-emerald-500"
                          />
                          {errors.utrNumber ? (
                            <p className="text-red-500 text-[9px] mt-0.5">{errors.utrNumber}</p>
                          ) : (
                            <p className="text-[8px] text-neutral-500 italic leading-normal">
                              Enter the 12-digit reference number from your payment confirmation screen to speed up verification.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Enter your UPI ID (BHIM/GPay/PhonePe)</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. name@gpay"
                            className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-hidden"
                          />
                          {errors.upiId && <p className="text-red-500 text-[9px] mt-0.5">{errors.upiId}</p>}
                        </div>

                        <div className="p-3 bg-neutral-950 rounded-lg text-[9px] text-neutral-500 leading-normal border border-neutral-800">
                          📲 A checkout notification request will be pushed directly to your linked UPI app. Confirm the transaction to authenticate.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="space-y-3 animate-fade-in text-center py-4 bg-neutral-950 rounded-xl border border-neutral-850">
                    <span className="text-xl">💳</span>
                    <h5 className="font-extrabold text-white text-xs mt-1">PayPal Checkout Express</h5>
                    <p className="text-[10px] text-neutral-500 max-w-xs mx-auto leading-relaxed mt-1">
                      You will be securely redirected to PayPal's authorization screens to complete the transaction upon confirming below.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: TRANSACTION CONFIRMED & INVOICE */}
          {step === 4 && recentTxn && (
            <div className="text-center space-y-6 py-6 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-800/80 shadow-inner">
                <ShieldCheck size={36} />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-white">Payment Authorized Successfully!</h4>
                <p className="text-xs text-neutral-400">Transaction ID: {recentTxn.transactionId}</p>
              </div>

              {/* Digital Invoice receipt details */}
              <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 text-left space-y-3 text-xs">
                <h5 className="font-black text-white border-b border-neutral-850 pb-2">Digital Meal Invoice</h5>
                
                <div className="space-y-2 text-[11px] text-neutral-400">
                  <div className="flex justify-between">
                    <span>Plan Subscribed:</span>
                    <strong className="text-white">{recentTxn.planName}</strong>
                  </div>
                  {recentTxn.timePreference && (
                    <div className="flex justify-between">
                      <span>Slot Timings:</span>
                      <strong className="text-white">{recentTxn.timePreference}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Executive:</span>
                    <strong className="text-white">Suresh Kumar</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Drop Coordinate:</span>
                    <strong className="text-white truncate max-w-[200px]">{recentTxn.address}</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-850">
                    <span className="font-bold">Total Amount Charged:</span>
                    <strong className="text-emerald-400 font-black">₹{recentTxn.price}.00</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    startTracking(recentTxn);
                    onClose();
                    // Go to map tracker dashboard
                    const trackerEl = document.getElementById('account');
                    trackerEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-950/40"
                >
                  🚴 Track Daily Tiffin Location Live
                </button>

                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold rounded-xl text-xs transition-colors border border-neutral-750"
                >
                  <MessageSquare size={14} />
                  Download WhatsApp Invoice
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions for step 1 to 3 */}
        {step < 4 && (
          <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black inline-flex items-center gap-1.5 transition-all"
              >
                Continue
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-5 py-2 text-xs rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black transition-all flex items-center gap-1.5 shadow-md shadow-orange-950/25"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Authorizing SSL...
                  </>
                ) : (
                  <>
                    Confirm & Securely Pay ₹{calculateTotal()}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
