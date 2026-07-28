import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_PLANS } from '../data';
import { 
  User as UserIcon, Lock, Compass, Calendar, ShoppingBag, Settings, LogOut, CheckCircle, 
  AlertTriangle, X, Shield, Plus, Edit2, CreditCard, Sparkles, TrendingUp, Users, DollarSign, Clock, MapPin, Phone, Map, Star, Download,
  Bot, Send, Check, Search, Zap, Brain, HardDrive, Mail
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import OrderTrackerMap from './OrderTrackerMap';
import FeedbackModal from './FeedbackModal';
import GoogleDriveManager from './GoogleDriveManager';
import GmailNotificationModal from './GmailNotificationModal';

export default function Dashboard() {
  const { 
    currentUser, users, orders, skipRecords, activeTrackedOrder,
    login, signInWithGoogle, register, logout, updateProfile, addSkipRecord, removeSkipRecord, 
    startTracking, stopTracking, adminUpdateOrderStatus, adminSetUserPlan,
    adminCreateUserSubscription, adminUpdateUserSubscription
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'sub' | 'skips' | 'orders' | 'tracking' | 'admin'>('profile');
  
  // Feedback Rating States
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [gmailRecipientEmail, setGmailRecipientEmail] = useState('');
  const [gmailRecipientName, setGmailRecipientName] = useState('');
  const [preSelectedOrder, setPreSelectedOrder] = useState<any | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regLandmark, setRegLandmark] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Profile Form State
  const [profName, setProfName] = useState(currentUser?.name || '');
  const [profPhone, setProfPhone] = useState(currentUser?.phone || '');
  const [profAddress, setProfAddress] = useState(currentUser?.address || '');
  const [profLandmark, setProfLandmark] = useState(currentUser?.landmark || '');
  const [profileMessage, setProfileMessage] = useState('');

  // Skip state
  const [skipDate, setSkipDate] = useState('');
  const [skipPref, setSkipPref] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [skipError, setSkipError] = useState('');

  // Admin select customer state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [adminSelectedPlan, setAdminSelectedPlan] = useState('');
  const [adminMealsCount, setAdminMealsCount] = useState(26);
  const [adminExpiryDate, setAdminExpiryDate] = useState('');

  // New AI Tiffin Center Console states
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'delivery' | 'subscriptions' | 'reports'>('overview');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerCategory, setCustomerCategory] = useState<'all' | 'trial' | 'monthly' | 'daily'>('all');
  
  // AI Assistant Operational Copilot state
  const [aiInput, setAiInput] = useState('');
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ id: string; role: 'user' | 'model'; content: string; timestamp: Date }>>([
    {
      id: 'welcome-ops',
      role: 'model',
      content: "Hello Owner! 🤝 I am your **PUREATY Operations Copilot**. I have analyzed your customer data and live delivery lists. Ask me anything!\n\nTry asking me:\n- *'Generate a delivery report summary for today'*\n- *'Who are the customers with low remaining meals?'*\n- *'Which active plan is the most popular?'*",
      timestamp: new Date()
    }
  ]);
  const [aiMode, setAiMode] = useState<'standard' | 'low-latency' | 'thinking'>('thinking');

  // Add / Edit Subscriber Form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerLandmark, setNewCustomerLandmark] = useState('');
  const [newCustomerMapsLocation, setNewCustomerMapsLocation] = useState('');
  const [newCustomerStartDate, setNewCustomerStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newCustomerPlanId, setNewCustomerPlanId] = useState('monthly_single');
  const [newCustomerMealTiming, setNewCustomerMealTiming] = useState<'morning' | 'evening' | 'both'>('morning');
  const [newCustomerTotalMeals, setNewCustomerTotalMeals] = useState(26);
  const [newCustomerNotes, setNewCustomerNotes] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // Sync profile edits
  React.useEffect(() => {
    if (currentUser) {
      setProfName(currentUser.name);
      setProfPhone(currentUser.phone);
      setProfAddress(currentUser.address);
      setProfLandmark(currentUser.landmark || '');
      if (currentUser.isAdmin) {
        setActiveTab('admin');
      }
    }
  }, [currentUser]);

  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim() || aiIsLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: aiInput,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMsg]);
    const textToSend = aiInput;
    setAiInput('');
    setAiIsLoading(true);

    try {
      const activeCustomers = users.filter(u => !u.isAdmin);
      const response = await fetch('/api/gemini/tiffin-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          customers: activeCustomers,
          history: aiMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          mode: aiMode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI assistant');
      }

      const data = await response.json();
      setAiMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: 'model' as const,
        content: data.text,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('AI Copilot error:', error);
      setAiMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        role: 'model' as const,
        content: "I'm sorry, I encountered an issue accessing the data. Please check your internet connection and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (isLogin) {
      if (!authEmail.trim()) {
        setAuthError('Email is required');
        return;
      }
      try {
        const success = await login(authEmail);
        if (success) {
          setAuthSuccess('Successfully logged in!');
        } else {
          setAuthError('User not found. Please register a new account below.');
        }
      } catch (err: any) {
        setAuthError(err.message || 'An error occurred during login.');
      }
    } else {
      if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regAddress.trim()) {
        setAuthError('Please fill in all required fields');
        return;
      }
      try {
        const success = await register(regName, regEmail, regPhone, regAddress, regLandmark);
        if (success) {
          setAuthSuccess('Registration successful! Welcome to PUREATY.');
        } else {
          setAuthError('This email is already registered.');
        }
      } catch (err: any) {
        setAuthError(err.message || 'An error occurred during registration.');
      }
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    if (!profName.trim() || !profPhone.trim() || !profAddress.trim()) {
      setProfileMessage('Error: Name, phone, and address are required');
      return;
    }
    updateProfile(profName, profPhone, profAddress, profLandmark);
    setProfileMessage('Profile details updated successfully!');
    setTimeout(() => setProfileMessage(''), 3000);
  };

  const handleDownloadReceipt = (ord: any) => {
    if (!currentUser) return;
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');

      // Top colored bar (Emerald Green)
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 210, 8, 'F');

      // Company Brand Header
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22); // Orange brand color
      doc.text('PUREATY', 20, 25);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(115, 115, 115);
      doc.text('PURE HOMEMADE TIFFIN SERVICES', 20, 30);
      doc.text('Vijay Nagar Area, Indore, MP - 452010', 20, 34);
      doc.text('Support Desk: support@pureaty.com | +91 93993 72194', 20, 38);

      // Invoice Details on the Right side
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Emerald Green
      doc.text('TAX INVOICE', 140, 25);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(64, 64, 64);
      doc.text(`Invoice No: INV-${ord.id}`, 140, 32);
      doc.text(`Date: ${new Date(ord.createdAt).toLocaleDateString()}`, 140, 37);
      doc.text(`Status: PAID & SUCCESS`, 140, 42);

      // Section divider line
      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(0.5);
      doc.line(20, 48, 190, 48);

      // Left Column: Customer details (Billed To)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 23, 23);
      doc.text('BILLED TO:', 20, 56);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(64, 64, 64);
      doc.text(`Name: ${currentUser.name}`, 20, 62);
      doc.text(`Email: ${currentUser.email}`, 20, 67);
      doc.text(`Phone: +91 ${currentUser.phone || '9399372194'}`, 20, 72);
      doc.text(`Delivery: ${currentUser.address || 'Indore, MP'}`, 20, 77);

      // Right Column: Transaction Details
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 23, 23);
      doc.text('TRANSACTION RECEIPT:', 110, 56);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(64, 64, 64);
      doc.text(`Transaction ID: ${ord.transactionId || 'TXN_' + Date.now()}`, 110, 62);
      if (ord.timePreference) {
        doc.text(`Slot Preference: ${ord.timePreference}`, 110, 67);
      }
      doc.text(`Meal Choice: ${ord.mealPreference.toUpperCase()}`, 110, ord.timePreference ? 72 : 67);
      doc.text(`Tiffin Status: Active Subscription`, 110, 77);

      // Table of Items header
      doc.setFillColor(245, 245, 245);
      doc.rect(20, 85, 170, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(23, 23, 23);
      doc.text('Healthy Tiffin Description', 25, 90);
      doc.text('Qty', 130, 90);
      doc.text('Price Unit', 150, 90);
      doc.text('Total', 175, 90);

      // Table line items
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(64, 64, 64);
      doc.text(ord.planName, 25, 101);
      doc.text('1 Unit', 130, 101);
      doc.text(`INR ${ord.price}.00`, 150, 101);
      doc.text(`INR ${ord.price}.00`, 175, 101);

      // Separation line after row
      doc.line(20, 106, 190, 106);

      // Totals Panel
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal Price:', 135, 115);
      doc.text(`INR ${ord.price}.00`, 175, 115);

      doc.text('GST / Service Tax (0%):', 135, 120);
      doc.text('INR 0.00', 175, 120);

      // Final amount highlighted panel
      doc.setFillColor(240, 253, 244); // light green background
      doc.rect(130, 125, 60, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52); // Deep green
      doc.text('Net Paid Amount:', 132, 130);
      doc.text(`INR ${ord.price}.00`, 175, 130);

      // Terms & Conditions block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(23, 23, 23);
      doc.text('PUREATY Homemade Hygiene Pledge', 20, 150);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(115, 115, 115);
      doc.text('• This receipt confirms automatic credit allotment for fresh, home-cooked daily meals.', 20, 156);
      doc.text('• Subscriptions can be paused, skipped, or resumed any time via the user dashboard portal.', 20, 161);
      doc.text('• For invoice revisions or custom packaging options, connect with the WhatsApp desk or support@pureaty.com.', 20, 166);

      // Save PDF
      doc.save(`PUREATY_Invoice_${ord.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handleAddSkip = (e: React.FormEvent) => {
    e.preventDefault();
    setSkipError('');
    if (!skipDate) {
      setSkipError('Please select a skip date');
      return;
    }

    // Cut-off times validation (Current Vijay Nagar rules: Lunch: 9AM, Dinner: 5PM)
    const todayStr = new Date().toISOString().split('T')[0];
    if (skipDate === todayStr) {
      const now = new Date();
      const currentHour = now.getHours();
      
      if (skipPref === 'lunch' && currentHour >= 9) {
        setSkipError('Too late to skip today\'s Lunch! Cutoff was 9:00 AM.');
        return;
      }
      if (skipPref === 'dinner' && currentHour >= 17) {
        setSkipError('Too late to skip today\'s Dinner! Cutoff was 5:00 PM.');
        return;
      }
      if (skipPref === 'both' && currentHour >= 9) {
        setSkipError('Cutoff for Lunch skipping has passed. You can only skip dinner now.');
        return;
      }
    }

    const success = addSkipRecord(skipDate, skipPref);
    if (!success) {
      setSkipError('You already have a scheduled skip for this date.');
    } else {
      setSkipDate('');
    }
  };

  // Helper links for quickly filling credentials
  const fillDemoAccount = (email: string) => {
    setAuthEmail(email);
    setIsLogin(true);
  };

  // Auth Guard
  if (!currentUser) {
    return (
      <section id="account" className="py-20 bg-neutral-900 text-neutral-100 transition-colors border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] bg-emerald-950 text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-emerald-900 uppercase tracking-widest">
              Subscriber Portal
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight font-display">
              User Accounts & Real-Time Control Panel
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Log in to manage your tiffin subscription, schedule skip days, check invoices, or track your live driver on the map.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* Quick Demo Credentials Info card */}
            <div className="md:col-span-5 bg-neutral-950 p-6 sm:p-8 rounded-3xl border border-neutral-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Shield size={18} className="text-emerald-500 animate-pulse" />
                  Developer Demo Access
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Quick access for Kitchen Admin business management:
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@pureaty.com')}
                    className="w-full p-3.5 text-left rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-600/30 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-black text-orange-400 block group-hover:text-orange-300">Kitchen Admin (Business)</span>
                      <span className="text-[10px] text-neutral-500">admin@pureaty.com</span>
                    </div>
                    <span className="text-[10px] bg-neutral-800 px-2 py-1 rounded text-neutral-300 font-bold">Select</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl text-[10px] text-neutral-500 leading-relaxed border border-neutral-850">
                ⭐ Subscribing to any plan in the pricing table automatically links the purchase to your active account and triggers the tracking sequence.
              </div>
            </div>

            {/* Auth Form Card */}
            <div className="md:col-span-7 bg-neutral-950 p-6 sm:p-8 rounded-3xl border border-neutral-800 space-y-6">
              <div className="flex border-b border-neutral-800">
                <button
                  onClick={() => { setIsLogin(true); setAuthError(''); }}
                  className={`flex-1 pb-3 text-center font-bold text-sm border-b-2 transition-colors ${
                    isLogin ? 'border-emerald-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsLogin(false); setAuthError(''); }}
                  className={`flex-1 pb-3 text-center font-bold text-sm border-b-2 transition-colors ${
                    !isLogin ? 'border-emerald-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-red-950/40 text-red-400 text-xs rounded-xl border border-red-900/60 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-emerald-950/40 text-emerald-400 text-xs rounded-xl border border-emerald-900/60 flex items-center gap-2">
                  <CheckCircle size={15} />
                  {authSuccess}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isLogin ? (
                  /* LOGIN VIEW */
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-400 font-medium">Your Email Address</label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g. customer@example.com"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                ) : (
                  /* REGISTER VIEW */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-neutral-400 font-medium">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-neutral-400 font-medium">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="you@gmail.com"
                          className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-400 font-medium">10-Digit Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="93993 72194"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-400 font-medium">Full Delivery Address (Vijay Nagar, Indore) *</label>
                      <textarea
                        required
                        rows={2}
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="e.g. Flat 301, Scheme No. 54, Vijay Nagar"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-400 font-medium">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={regLandmark}
                        onChange={(e) => setRegLandmark(e.target.value)}
                        placeholder="e.g. Opposite BDA Complex ATM"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2"
                >
                  <Lock size={15} />
                  {isLogin ? 'Enter Secure Portal' : 'Register Subscription Account'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-neutral-950 px-3 text-neutral-500 font-bold">Or Continue With</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setAuthError('');
                  setAuthSuccess('');
                  try {
                    await signInWithGoogle();
                    setAuthSuccess('Successfully logged in with Google!');
                  } catch (err: any) {
                    setAuthError(err.message || 'Google Sign-In failed.');
                  }
                }}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all border border-neutral-800 hover:border-neutral-700 flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign In with Google
              </button>
            </div>

          </div>
        </div>
      </section>
    );
  }

  // LOGGED IN USER VIEWS
  const userOrders = orders.filter(o => o.userId === currentUser.id);
  const userSkips = skipRecords.filter(r => r.userId === currentUser.id);

  // Stats calculate
  const totalUsers = users.length;
  const activeSubs = users.filter(u => u.activePlanId).length;
  const totalIncome = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.price, 0);
  const totalMealsDelivered = orders.filter(o => o.orderStatus === 'delivered').length;

  return (
    <section id="account" className="py-20 bg-neutral-900 text-neutral-100 transition-colors border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Welcome bar */}
        <div className="p-6 sm:p-8 bg-neutral-950 rounded-3xl border border-neutral-800 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                currentUser.isAdmin ? 'bg-orange-950 text-orange-400 border border-orange-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
              }`}>
                {currentUser.isAdmin ? '🧑‍💼 Kitchen Administrator' : '🧑‍🍳 Active Subscriber'}
              </span>
              {currentUser.activePlanId && (
                <span className="text-[9px] bg-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded-md">
                  {currentUser.activePlanName}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Hello, {currentUser.name}!
            </h2>
            <p className="text-xs text-neutral-400">
              Registered Email: {currentUser.email} • Phone: +91 {currentUser.phone}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!currentUser.isAdmin && (
              <button
                onClick={() => {
                  const delivered = orders.filter(o => o.userId === currentUser.id && o.orderStatus === 'delivered');
                  setPreSelectedOrder(delivered.length > 0 ? delivered[0] : null);
                  setIsFeedbackOpen(true);
                }}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-950/20 cursor-pointer"
              >
                <Star size={14} className="fill-current text-neutral-950" />
                Rate Today's Meal
              </button>
            )}

            <button
              onClick={logout}
              className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-neutral-750"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Rating Feedback Success Alert */}
        {feedbackSuccess && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-2xl mb-8 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-bold">
              <CheckCircle size={16} />
              <span>{feedbackSuccess}</span>
            </div>
            <button
              onClick={() => setFeedbackSuccess('')}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Live Track Notification Alert Banner */}
        {orders.some(o => o.userId === currentUser.id && (o.orderStatus === 'dispatched' || o.orderStatus === 'near_sector')) && (
          <div className="p-4 bg-emerald-950/30 border border-emerald-800 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-pulse">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🚴</span>
              <div>
                <span className="text-xs font-black text-emerald-400 block uppercase tracking-wider">Your Hot Tiffin is on the way!</span>
                <p className="text-[11px] text-neutral-300 mt-0.5">Suresh Kumar is out for delivery with your insulated fresh home cooked lunch.</p>
              </div>
            </div>
            <button
              onClick={() => {
                const liveOrder = orders.find(o => o.userId === currentUser.id && (o.orderStatus === 'dispatched' || o.orderStatus === 'near_sector'));
                if (liveOrder) {
                  startTracking(liveOrder);
                  setActiveTab('tracking');
                  // Smooth scroll to tracking section
                  const el = document.getElementById('account');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs rounded-lg transition-colors"
            >
              Track Live Location
            </button>
          </div>
        )}

        {/* Subscription Expiring Alert Warning Banner (3 Days Cut-off) */}
        {!currentUser.isAdmin && currentUser.activePlanId && currentUser.subscriptionExpiresAt && (() => {
          const expiryDate = new Date(currentUser.subscriptionExpiresAt);
          const now = new Date();
          const diffTime = expiryDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays <= 3) {
            return (
              <div id="subscription-expiring-alert" className="p-4 bg-amber-950/40 border border-amber-850/80 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in shadow-lg shadow-amber-950/10">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5 shrink-0">⏳</span>
                  <div>
                    <span className="text-xs font-black text-amber-400 block uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-amber-400" />
                      Subscription Expires Soon (In {diffDays === 0 ? 'Today' : `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`})!
                    </span>
                    <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                      Your <strong className="text-white">{currentUser.activePlanName}</strong> expires on <strong className="text-amber-300">{expiryDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong>. Renew today to keep enjoying delicious, hygienic homemade tiffins.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <a
                    href="#plans"
                    className="w-full sm:w-auto inline-flex items-center justify-center py-2 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-950/20 text-center"
                  >
                    Renew Subscription
                  </a>
                </div>
              </div>
            );
          } else if (diffDays < 0) {
            return (
              <div id="subscription-expired-alert" className="p-4 bg-red-950/40 border border-red-900/80 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in shadow-lg shadow-red-950/10">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5 shrink-0">🚫</span>
                  <div>
                    <span className="text-xs font-black text-red-400 block uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-red-400 animate-pulse" />
                      Subscription Expired!
                    </span>
                    <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                      Your <strong className="text-white">{currentUser.activePlanName}</strong> expired on <strong className="text-red-300">{expiryDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong>. Please subscribe to a plan to resume delivery of fresh, hygienic homemade meals.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <a
                    href="#plans"
                    className="w-full sm:w-auto inline-flex items-center justify-center py-2 px-4 bg-red-500 hover:bg-red-400 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-red-950/20 text-center"
                  >
                    Resubscribe Now
                  </a>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* ADMIN PERSPECTIVE OVERLAY */}
        {currentUser.isAdmin ? (
          <div className="space-y-8 animate-fade-in text-white">
            {/* Admin Console Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-950 p-6 rounded-3xl border border-neutral-800">
              <div>
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block">OPERATIONS HEADQUARTERS</span>
                <h3 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  <span>PUREATY Tiffin Console</span>
                  <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-900 font-bold">Admin Level</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">Manage subscriptions, generate daily lists, track delivery credits and chat with AI operations copilot.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingCustomer(null);
                    setNewCustomerName('');
                    setNewCustomerPhone('');
                    setNewCustomerAddress('');
                    setNewCustomerLandmark('');
                    setNewCustomerMapsLocation('');
                    setNewCustomerStartDate(new Date().toISOString().slice(0, 10));
                    setNewCustomerPlanId('monthly_single');
                    setNewCustomerMealTiming('morning');
                    setNewCustomerTotalMeals(26);
                    setNewCustomerNotes('');
                    setShowAddModal(true);
                  }}
                  className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                >
                  <Plus size={14} className="stroke-[3]" />
                  Add Subscriber
                </button>
              </div>
            </div>

            {/* Inner Console Tabs */}
            <div className="flex border-b border-neutral-800 gap-1.5 overflow-x-auto pb-px">
              <button
                onClick={() => setAdminSubTab('overview')}
                className={`py-3 px-5 font-black text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  adminSubTab === 'overview' 
                    ? 'border-emerald-500 text-emerald-400' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📊 Overview & AI Assistant
              </button>
              <button
                onClick={() => setAdminSubTab('delivery')}
                className={`py-3 px-5 font-black text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  adminSubTab === 'delivery' 
                    ? 'border-emerald-500 text-emerald-400' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📋 Daily Delivery Lists
              </button>
              <button
                onClick={() => setAdminSubTab('subscriptions')}
                className={`py-3 px-5 font-black text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  adminSubTab === 'subscriptions' 
                    ? 'border-emerald-500 text-emerald-400' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                👥 Customers ({users.filter(u => !u.isAdmin).length})
              </button>
              <button
                onClick={() => setAdminSubTab('reports')}
                className={`py-3 px-5 font-black text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  adminSubTab === 'reports' 
                    ? 'border-emerald-500 text-emerald-400' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📈 Reports & Analytics
              </button>
              <button
                onClick={() => setIsDriveOpen(true)}
                className="py-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 border-transparent text-emerald-400 hover:text-emerald-300 transition-all whitespace-nowrap flex items-center gap-2 ml-auto"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Google Drive</span>
              </button>
              <button
                onClick={() => {
                  setGmailRecipientEmail('');
                  setGmailRecipientName('');
                  setIsGmailOpen(true);
                }}
                className="py-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 border-transparent text-emerald-400 hover:text-emerald-300 transition-all whitespace-nowrap flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gmail Dispatch</span>
              </button>
            </div>

            {/* CALCULATE LIVE STATS */}
            {(() => {
              const activeCustomers = users.filter(u => !u.isAdmin);

              const totalMorningTiffins = activeCustomers.filter(c => 
                (c.subscriptionStatus === 'active' || !c.subscriptionStatus) &&
                c.activePlanId && (c.mealsRemaining && c.mealsRemaining > 0) &&
                (c.mealTiming === 'morning' || c.mealTiming === 'both')
              ).length;

              const totalEveningTiffins = activeCustomers.filter(c => 
                (c.subscriptionStatus === 'active' || !c.subscriptionStatus) &&
                c.activePlanId && (c.mealsRemaining && c.mealsRemaining > 0) &&
                (c.mealTiming === 'evening' || c.mealTiming === 'both')
              ).length;

              const totalTrialMealsActive = activeCustomers.filter(c => 
                c.activePlanId === 'trial_meal' && 
                (c.subscriptionStatus === 'active' || !c.subscriptionStatus) && 
                (c.mealsRemaining && c.mealsRemaining > 0)
              ).length;

              const totalActiveSubs = activeCustomers.filter(c => 
                (c.subscriptionStatus === 'active' || !c.subscriptionStatus) && 
                c.activePlanId && (c.mealsRemaining && c.mealsRemaining > 0)
              ).length;

              const totalPausedSubs = activeCustomers.filter(c => 
                c.subscriptionStatus === 'paused'
              ).length;

              const totalExpiredSubs = activeCustomers.filter(c => 
                c.subscriptionStatus === 'expired' || 
                (c.mealsRemaining === 0 && c.activePlanId) ||
                c.subscriptionStatus === 'cancelled'
              ).length;

              const endingSoonCustomers = activeCustomers.filter(c => 
                (c.subscriptionStatus === 'active' || !c.subscriptionStatus) &&
                c.activePlanId && (c.mealsRemaining && c.mealsRemaining > 0) &&
                (c.mealsRemaining <= 3)
              );

              // 🌅 MORNING DELIVERY LIST
              const morningDeliveries = activeCustomers.filter(c => 
                (c.subscriptionStatus === 'active' || !c.subscriptionStatus) &&
                c.activePlanId && (c.mealsRemaining && c.mealsRemaining > 0) &&
                (c.mealTiming === 'morning' || c.mealTiming === 'both')
              );

              // 🌃 EVENING DELIVERY LIST
              const eveningDeliveries = activeCustomers.filter(c => 
                (c.subscriptionStatus === 'active' || !c.subscriptionStatus) &&
                c.activePlanId && (c.mealsRemaining && c.mealsRemaining > 0) &&
                (c.mealTiming === 'evening' || c.mealTiming === 'both')
              );

              const handleMarkDelivered = async (customer: any) => {
                const newCount = Math.max(0, (customer.mealsRemaining || 0) - 1);
                const updates: any = {
                  mealsRemaining: newCount,
                };
                if (newCount === 0) {
                  updates.subscriptionStatus = 'expired';
                }
                await adminUpdateUserSubscription(customer.id, updates);
                
                // Add an order record in database for history tracker
                const matchedPlan = SUBSCRIPTION_PLANS.find(p => p.id === customer.activePlanId);
                const orderId = `ord_auto_${Math.floor(Math.random() * 90000) + 10000}`;
                
                // Construct Order object
                const dummyOrder = {
                  id: orderId,
                  userId: customer.id,
                  userName: customer.name,
                  userPhone: customer.phone,
                  planId: customer.activePlanId || 'daily_order',
                  planName: customer.activePlanName || 'Daily Order',
                  price: matchedPlan ? Math.round(matchedPlan.price / 26) : 90,
                  mealPreference: customer.mealTiming === 'both' ? 'lunch' : (customer.mealTiming === 'evening' ? 'dinner' : 'lunch'),
                  timePreference: customer.mealTiming === 'evening' ? '07:30 PM - 08:30 PM' : '12:30 PM - 01:30 PM',
                  address: customer.address,
                  landmark: customer.landmark || '',
                  extraRotis: false,
                  paymentMethod: 'upi',
                  paymentStatus: 'paid',
                  orderStatus: 'delivered',
                  eta: '0 mins',
                  createdAt: new Date().toISOString()
                };
                
                // Try writing Order to firebase database
                try {
                  const { db } = await import('../lib/firebase');
                  const { doc, setDoc } = await import('firebase/firestore');
                  await setDoc(doc(db, 'orders', orderId), dummyOrder);
                } catch (e) {
                  console.error("Order logging skipped:", e);
                }
              };

              const handlePauseSubscription = async (customer: any, isPaused: boolean) => {
                await adminUpdateUserSubscription(customer.id, {
                  subscriptionStatus: isPaused ? 'paused' : 'active'
                });
              };

              const handleCancelSubscription = async (customer: any) => {
                await adminUpdateUserSubscription(customer.id, {
                  subscriptionStatus: 'cancelled',
                  mealsRemaining: 0,
                  activePlanId: null,
                  activePlanName: null
                });
              };

              const handleSaveCustomerForm = async (e: React.FormEvent) => {
                e.preventDefault();
                const matchedPlan = SUBSCRIPTION_PLANS.find(p => p.id === newCustomerPlanId);
                const planName = matchedPlan ? matchedPlan.name : 'Daily Meal';
                const price = matchedPlan ? matchedPlan.price : 90;

                // Validity Period (Default 35 Days from Start Date for Monthly, 1 Day for Trial/Daily)
                const sDateObj = new Date(newCustomerStartDate);
                const expDays = newCustomerPlanId.includes('monthly') ? 35 : 1;
                sDateObj.setDate(sDateObj.getDate() + expDays);
                const expiryStr = sDateObj.toISOString();

                if (editingCustomer) {
                  // Edit Existing Customer
                  const updates = {
                    name: newCustomerName,
                    phone: newCustomerPhone,
                    address: newCustomerAddress,
                    landmark: newCustomerLandmark,
                    mapsLocation: newCustomerMapsLocation,
                    startDate: newCustomerStartDate,
                    activePlanId: newCustomerPlanId,
                    activePlanName: planName,
                    mealTiming: newCustomerMealTiming,
                    mealsRemaining: newCustomerTotalMeals,
                    totalMealsPurchased: newCustomerTotalMeals,
                    deliveryNotes: newCustomerNotes,
                    subscriptionExpiresAt: expiryStr,
                    subscriptionStatus: 'active' as const
                  };
                  await adminUpdateUserSubscription(editingCustomer.id, updates);
                } else {
                  // Create New Customer
                  const customId = `usr_${Math.floor(Math.random() * 90000) + 10000}`;
                  const newUserData = {
                    id: customId,
                    name: newCustomerName,
                    email: `${newCustomerName.toLowerCase().replace(/\s+/g, '')}@pureaty-client.com`,
                    phone: newCustomerPhone,
                    address: newCustomerAddress,
                    landmark: newCustomerLandmark,
                    mapsLocation: newCustomerMapsLocation,
                    startDate: newCustomerStartDate,
                    activePlanId: newCustomerPlanId,
                    activePlanName: planName,
                    mealTiming: newCustomerMealTiming,
                    mealsRemaining: newCustomerTotalMeals,
                    totalMealsPurchased: newCustomerTotalMeals,
                    deliveryNotes: newCustomerNotes,
                    subscriptionExpiresAt: expiryStr,
                    subscriptionStatus: 'active' as const,
                    totalPaid: price,
                    createdAt: new Date().toISOString()
                  };
                  await adminCreateUserSubscription(newUserData);
                }

                setShowAddModal(false);
                setEditingCustomer(null);
              };

              return (
                <div className="space-y-8">
                  
                  {/* OVERVIEW TAB */}
                  {adminSubTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                      {/* Operational Stats Row */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">🌅 Morning Tiffins</span>
                            <span className="text-2xl font-black text-white">{totalMorningTiffins}</span>
                          </div>
                          <Clock size={24} className="text-amber-500 shrink-0" />
                        </div>

                        <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">🌃 Evening Tiffins</span>
                            <span className="text-2xl font-black text-white">{totalEveningTiffins}</span>
                          </div>
                          <Clock size={24} className="text-indigo-400 shrink-0" />
                        </div>

                        <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">🌸 Trial Meals Today</span>
                            <span className="text-2xl font-black text-emerald-400">{totalTrialMealsActive}</span>
                          </div>
                          <Sparkles size={24} className="text-emerald-500 shrink-0" />
                        </div>

                        <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">👥 Active Subscribers</span>
                            <span className="text-2xl font-black text-white">{totalActiveSubs}</span>
                          </div>
                          <Users size={24} className="text-neutral-500 shrink-0" />
                        </div>
                      </div>

                      {/* Split Column: Notifications Alerts vs AI Copilot Assistant */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Alert Notifications Column */}
                        <div className="lg:col-span-5 bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                            <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                              <AlertTriangle size={15} className="text-amber-400" />
                              Critical Account Alerts
                            </h4>
                            <span className="text-[9px] bg-amber-950/50 text-amber-400 px-2 py-0.5 rounded border border-amber-900/40 font-bold">
                              {endingSoonCustomers.length + totalExpiredSubs} Issues
                            </span>
                          </div>

                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                            {/* Ending Soon Alert Row */}
                            {endingSoonCustomers.map(c => (
                              <div key={c.id} className="p-3.5 bg-amber-950/20 rounded-2xl border border-amber-900/30 flex justify-between items-start gap-2">
                                <div className="space-y-0.5">
                                  <h5 className="text-xs font-black text-amber-300">{c.name}</h5>
                                  <p className="text-[10px] text-neutral-400">Phone: +91 {c.phone}</p>
                                  <p className="text-[9px] bg-amber-900/40 text-amber-400 inline-block px-1.5 py-0.5 rounded mt-1 font-bold">
                                    ONLY {c.mealsRemaining} meals left!
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingCustomer(c);
                                    setNewCustomerName(c.name);
                                    setNewCustomerPhone(c.phone);
                                    setNewCustomerAddress(c.address);
                                    setNewCustomerLandmark(c.landmark || '');
                                    setNewCustomerMapsLocation(c.mapsLocation || '');
                                    setNewCustomerStartDate(c.startDate || new Date().toISOString().slice(0, 10));
                                    setNewCustomerPlanId(c.activePlanId || 'monthly_single');
                                    setNewCustomerMealTiming(c.mealTiming || 'morning');
                                    setNewCustomerTotalMeals((c.mealsRemaining || 0) + 26); // Quick add month
                                    setNewCustomerNotes(c.deliveryNotes || '');
                                    setShowAddModal(true);
                                  }}
                                  className="text-[9px] py-1 px-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-lg transition-colors shrink-0"
                                >
                                  Add Meals
                                </button>
                              </div>
                            ))}

                            {/* Expired List Alert Row */}
                            {activeCustomers.filter(c => c.subscriptionStatus === 'expired' || (c.mealsRemaining === 0 && c.activePlanId)).map(c => (
                              <div key={c.id} className="p-3.5 bg-red-950/20 rounded-2xl border border-red-900/30 flex justify-between items-start gap-2">
                                <div className="space-y-0.5">
                                  <h5 className="text-xs font-black text-red-400">{c.name}</h5>
                                  <p className="text-[10px] text-neutral-400">Phone: +91 {c.phone}</p>
                                  <span className="text-[9px] text-neutral-500 block">Plan expired or 0 credits remaining.</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingCustomer(c);
                                    setNewCustomerName(c.name);
                                    setNewCustomerPhone(c.phone);
                                    setNewCustomerAddress(c.address);
                                    setNewCustomerLandmark(c.landmark || '');
                                    setNewCustomerMapsLocation(c.mapsLocation || '');
                                    setNewCustomerStartDate(new Date().toISOString().slice(0, 10));
                                    setNewCustomerPlanId('monthly_single');
                                    setNewCustomerMealTiming('morning');
                                    setNewCustomerTotalMeals(26);
                                    setNewCustomerNotes(c.deliveryNotes || '');
                                    setShowAddModal(true);
                                  }}
                                  className="text-[9px] py-1 px-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-lg transition-colors shrink-0"
                                >
                                  Resubscribe
                                </button>
                              </div>
                            ))}

                            {endingSoonCustomers.length === 0 && activeCustomers.filter(c => c.subscriptionStatus === 'expired' || (c.mealsRemaining === 0 && c.activePlanId)).length === 0 && (
                              <div className="py-12 text-center text-neutral-500">
                                <CheckCircle size={28} className="mx-auto text-emerald-500 opacity-60 mb-2" />
                                <span className="text-xs font-black">All subscriptions healthy!</span>
                                <p className="text-[10px] mt-0.5">No immediate renewal notices required.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI Operational Assistant Console */}
                        <div className="lg:col-span-7 bg-neutral-950 p-6 rounded-3xl border border-neutral-800 flex flex-col space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                            <div className="flex items-center gap-2">
                              <Bot size={18} className="text-emerald-400 shrink-0" />
                              <div>
                                <h4 className="font-extrabold text-white text-sm">AI Operations Copilot</h4>
                                <span className="text-[9px] text-neutral-500 block">Directly connected to customer subscriptions database</span>
                              </div>
                            </div>
                            <span className="text-[9px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900 font-bold">Live AI Agent</span>
                          </div>

                          {/* Dynamic Mode Selector */}
                          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">AI Engine:</span>
                              <span className="text-[9px] text-neutral-500 font-medium">Configure reasoning / latency</span>
                            </div>
                            <div className="flex bg-neutral-950 border border-neutral-850 rounded-lg p-0.5 w-full sm:max-w-[240px]">
                              <button
                                type="button"
                                onClick={() => setAiMode('low-latency')}
                                className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[9px] font-extrabold tracking-tight transition-all ${
                                  aiMode === 'low-latency'
                                    ? 'bg-emerald-500 text-neutral-950 shadow-sm font-black'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                                title="Super fast, low-latency responses using Gemini 3.1 Flash Lite"
                              >
                                <Zap size={9} className={aiMode === 'low-latency' ? 'animate-bounce' : ''} />
                                <span>Speed</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAiMode('standard')}
                                className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[9px] font-extrabold tracking-tight transition-all ${
                                  aiMode === 'standard'
                                    ? 'bg-neutral-850 text-emerald-400 border border-neutral-800 font-black'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                                title="Balanced capability and speed using Gemini 3.5 Flash"
                              >
                                <Sparkles size={9} />
                                <span>Standard</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAiMode('thinking')}
                                className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[9px] font-extrabold tracking-tight transition-all ${
                                  aiMode === 'thinking'
                                    ? 'bg-purple-600 text-white shadow-sm font-black'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                                title="Advanced reasoning and high-thinking model using Gemini 3.1 Pro"
                              >
                                <Brain size={9} className={aiMode === 'thinking' ? 'animate-pulse' : ''} />
                                <span>Thinker</span>
                              </button>
                            </div>
                          </div>

                          {/* Message Logs */}
                          <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3.5 pr-1 scrollbar-thin text-xs leading-relaxed">
                            {aiMessages.map(m => (
                              <div key={m.id} className={`p-3 rounded-2xl border ${
                                m.role === 'user' 
                                  ? 'bg-neutral-900/80 border-neutral-800 ml-8 text-neutral-200' 
                                  : 'bg-emerald-950/10 border-emerald-900/30 mr-8 text-neutral-300'
                              }`}>
                                <span className={`text-[9px] font-black uppercase tracking-wider block mb-1 ${
                                  m.role === 'user' ? 'text-neutral-500' : 'text-emerald-400'
                                }`}>
                                  {m.role === 'user' ? 'Tiffin Owner' : 'Operations Assistant'}
                                </span>
                                <div className="space-y-1 text-[11px]">
                                  {m.content.split('\n').map((line, idx) => (
                                    <p key={idx}>{line}</p>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {aiIsLoading && (
                              <div className="flex flex-col gap-1.5 p-2 bg-neutral-900/50 rounded-xl border border-neutral-800/40">
                                <div className="flex items-center gap-2 text-neutral-500 italic text-[11px]">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                                  <span>AI Copilot is analyzing customer records...</span>
                                </div>
                                {aiMode === 'thinking' && (
                                  <span className="text-[9px] text-purple-400 font-black tracking-wider uppercase animate-pulse pl-4">
                                    🧠 Deep reasoning mode active (Gemini 3.1 Pro)...
                                  </span>
                                )}
                                {aiMode === 'low-latency' && (
                                  <span className="text-[9px] text-emerald-400 font-black tracking-wider uppercase animate-pulse pl-4">
                                    ⚡ Low-latency mode active (Gemini 3.1 Flash Lite)...
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quick suggestions chips */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <button
                              onClick={() => {
                                setAiInput("Generate morning delivery list summary for today.");
                              }}
                              className="text-[9px] py-1 px-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 transition-colors"
                            >
                              📋 Morning Deliveries
                            </button>
                            <button
                              onClick={() => {
                                setAiInput("Who are the customers with low remaining meals?");
                              }}
                              className="text-[9px] py-1 px-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 transition-colors"
                            >
                              ⚠️ Low Credits
                            </button>
                            <button
                              onClick={() => {
                                setAiInput("Which plan is the most popular among our subscribers?");
                              }}
                              className="text-[9px] py-1 px-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 transition-colors"
                            >
                              📊 Popular Plan
                            </button>
                          </div>

                          {/* Input Bar Form */}
                          <form onSubmit={handleSendAiMessage} className="flex gap-2 border-t border-neutral-900 pt-3">
                            <input
                              type="text"
                              value={aiInput}
                              onChange={(e) => setAiInput(e.target.value)}
                              placeholder="Ask AI Copilot to generate, search, or analyze..."
                              className="flex-1 py-2 px-3 bg-neutral-900 border border-neutral-800 text-xs rounded-xl text-white focus:outline-hidden focus:border-emerald-500 placeholder-neutral-500"
                              disabled={aiIsLoading}
                            />
                            <button
                              type="submit"
                              className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-neutral-950 rounded-xl transition-all font-black text-xs shrink-0 flex items-center justify-center"
                              disabled={aiIsLoading || !aiInput.trim()}
                            >
                              <Send size={13} />
                            </button>
                          </form>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* DAILY DELIVERY LISTS TAB */}
                  {adminSubTab === 'delivery' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                        <div>
                          <h4 className="font-extrabold text-white text-sm">Automated Schedule & Route sequencer</h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">Lists update dynamically. Deliveries instantly deduct customer subscription meal credits.</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 flex">
                            <span className="px-3 py-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                              ☀️ AM Delivery: {morningDeliveries.length}
                            </span>
                            <span className="px-3 py-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-wider border-l border-neutral-800 block">
                              🌙 PM Delivery: {eveningDeliveries.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Morning Delivery Column */}
                        <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>🌅 Morning Delivery List (A.M.)</span>
                            </span>
                            <span className="text-[9px] bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded border border-amber-900/50 font-bold">
                              {morningDeliveries.length} Tiffins Scheduled
                            </span>
                          </div>

                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                            {morningDeliveries.map((c, index) => (
                              <div key={c.id} className="p-4 bg-neutral-900/40 hover:bg-neutral-900/70 rounded-2xl border border-neutral-850 space-y-2.5 transition-all">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[9px] bg-neutral-850 px-1.5 py-0.5 rounded text-neutral-400 font-bold">#{index + 1} Route Sequence</span>
                                      <h5 className="text-xs font-black text-white">{c.name}</h5>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                                      <Phone size={10} className="text-neutral-500" />
                                      <span>+91 {c.phone}</span>
                                    </p>
                                    <p className="text-[10px] text-neutral-300 mt-1 flex items-start gap-1 leading-relaxed">
                                      <MapPin size={10} className="text-neutral-500 mt-0.5 shrink-0" />
                                      <span>{c.address} {c.landmark && <strong className="text-emerald-400">({c.landmark})</strong>}</span>
                                    </p>
                                    {c.deliveryNotes && (
                                      <div className="mt-1.5 p-1.5 bg-neutral-950 rounded border border-neutral-900 text-[10px] text-emerald-400 leading-relaxed font-medium">
                                        <strong className="text-neutral-500 font-bold uppercase tracking-wider block text-[8px] mb-0.5">Instruction:</strong>
                                        {c.deliveryNotes}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] text-neutral-400 block">{c.activePlanName}</span>
                                    <span className="text-[9px] font-black text-amber-400 block mt-0.5 uppercase tracking-wider">
                                      {c.mealsRemaining} Meals Left
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-neutral-900 flex justify-between items-center gap-2">
                                  {c.mapsLocation ? (
                                    <a
                                      href={c.mapsLocation}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="py-1 px-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-emerald-400 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <Map size={10} />
                                      <span>Navigate Link</span>
                                    </a>
                                  ) : (
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address + ' Indore')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="py-1 px-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <MapPin size={10} />
                                      <span>Auto-Map</span>
                                    </a>
                                  )}

                                  <button
                                    onClick={() => handleMarkDelivered(c)}
                                    className="py-1 px-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[10px] rounded-lg transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1"
                                  >
                                    <Check size={11} className="stroke-[3]" />
                                    <span>Mark Delivered</span>
                                  </button>
                                </div>
                              </div>
                            ))}

                            {morningDeliveries.length === 0 && (
                              <div className="py-16 text-center text-neutral-500">
                                <span>No morning deliveries scheduled for today.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Evening Delivery Column */}
                        <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>🌃 Evening Delivery List (P.M.)</span>
                            </span>
                            <span className="text-[9px] bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/50 font-bold">
                              {eveningDeliveries.length} Tiffins Scheduled
                            </span>
                          </div>

                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                            {eveningDeliveries.map((c, index) => (
                              <div key={c.id} className="p-4 bg-neutral-900/40 hover:bg-neutral-900/70 rounded-2xl border border-neutral-850 space-y-2.5 transition-all">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[9px] bg-neutral-850 px-1.5 py-0.5 rounded text-neutral-400 font-bold">#{index + 1} Route Sequence</span>
                                      <h5 className="text-xs font-black text-white">{c.name}</h5>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                                      <Phone size={10} className="text-neutral-500" />
                                      <span>+91 {c.phone}</span>
                                    </p>
                                    <p className="text-[10px] text-neutral-300 mt-1 flex items-start gap-1 leading-relaxed">
                                      <MapPin size={10} className="text-neutral-500 mt-0.5 shrink-0" />
                                      <span>{c.address} {c.landmark && <strong className="text-emerald-400">({c.landmark})</strong>}</span>
                                    </p>
                                    {c.deliveryNotes && (
                                      <div className="mt-1.5 p-1.5 bg-neutral-950 rounded border border-neutral-900 text-[10px] text-emerald-400 leading-relaxed font-medium">
                                        <strong className="text-neutral-500 font-bold uppercase tracking-wider block text-[8px] mb-0.5">Instruction:</strong>
                                        {c.deliveryNotes}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] text-neutral-400 block">{c.activePlanName}</span>
                                    <span className="text-[9px] font-black text-indigo-400 block mt-0.5 uppercase tracking-wider">
                                      {c.mealsRemaining} Meals Left
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-neutral-900 flex justify-between items-center gap-2">
                                  {c.mapsLocation ? (
                                    <a
                                      href={c.mapsLocation}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="py-1 px-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-emerald-400 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <Map size={10} />
                                      <span>Navigate Link</span>
                                    </a>
                                  ) : (
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address + ' Indore')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="py-1 px-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <MapPin size={10} />
                                      <span>Auto-Map</span>
                                    </a>
                                  )}

                                  <button
                                    onClick={() => handleMarkDelivered(c)}
                                    className="py-1 px-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[10px] rounded-lg transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1"
                                  >
                                    <Check size={11} className="stroke-[3]" />
                                    <span>Mark Delivered</span>
                                  </button>
                                </div>
                              </div>
                            ))}

                            {eveningDeliveries.length === 0 && (
                              <div className="py-16 text-center text-neutral-500">
                                <span>No evening deliveries scheduled for today.</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* CUSTOMER LIST TAB */}
                  {adminSubTab === 'subscriptions' && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Search Bar + Filters */}
                      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                        <div className="relative flex-1">
                          <Search size={16} className="absolute left-3 top-2.5 text-neutral-500" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Search by name or mobile number..."
                            className="w-full py-2 pl-9 pr-4 bg-neutral-900 border border-neutral-800 text-xs rounded-xl text-white focus:outline-hidden focus:border-emerald-500 placeholder-neutral-500"
                          />
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-px">
                          <button
                            onClick={() => setCustomerCategory('all')}
                            className={`py-1.5 px-3 text-[10px] font-black uppercase rounded-lg border transition-all ${
                              customerCategory === 'all' 
                                ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            All Subscribers
                          </button>
                          <button
                            onClick={() => setCustomerCategory('monthly')}
                            className={`py-1.5 px-3 text-[10px] font-black uppercase rounded-lg border transition-all ${
                              customerCategory === 'monthly' 
                                ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            Monthly Subscriptions
                          </button>
                          <button
                            onClick={() => setCustomerCategory('trial')}
                            className={`py-1.5 px-3 text-[10px] font-black uppercase rounded-lg border transition-all ${
                              customerCategory === 'trial' 
                                ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            Trial Meals
                          </button>
                          <button
                            onClick={() => setCustomerCategory('daily')}
                            className={`py-1.5 px-3 text-[10px] font-black uppercase rounded-lg border transition-all ${
                              customerCategory === 'daily' 
                                ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            Daily Orders
                          </button>
                        </div>
                      </div>

                      {/* Customer Cards List */}
                      {(() => {
                        const filtered = activeCustomers.filter(c => {
                          // Search Match
                          const sQuery = customerSearch.trim().toLowerCase();
                          const matchesSearch = c.name.toLowerCase().includes(sQuery) || c.phone.includes(sQuery);
                          
                          if (!matchesSearch) return false;

                          // Category Match
                          if (customerCategory === 'trial') return c.activePlanId === 'trial_meal';
                          if (customerCategory === 'daily') return c.activePlanId === 'daily_order';
                          if (customerCategory === 'monthly') return c.activePlanId && c.activePlanId.startsWith('monthly');
                          return true;
                        });

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(c => {
                              const sStatus = c.subscriptionStatus || 'active';
                              const expiryDateStr = c.subscriptionExpiresAt ? new Date(c.subscriptionExpiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

                              return (
                                <div key={c.id} className="p-5 bg-neutral-950 rounded-3xl border border-neutral-800 flex flex-col justify-between gap-4">
                                  <div className="space-y-3.5">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-0.5">
                                        <h5 className="text-sm font-black text-white">{c.name}</h5>
                                        <p className="text-[10px] text-neutral-500">Registered: {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                                      </div>
                                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                        sStatus === 'active' 
                                          ? 'bg-emerald-950 text-emerald-400 border-emerald-900' 
                                          : sStatus === 'paused'
                                            ? 'bg-amber-950 text-amber-400 border-amber-900'
                                            : 'bg-red-950 text-red-400 border-red-900'
                                      }`}>
                                        {sStatus}
                                      </span>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between text-neutral-400 py-1 border-b border-neutral-900">
                                        <span>Mobile:</span>
                                        <span className="text-white font-medium">+91 {c.phone}</span>
                                      </div>
                                      <div className="flex justify-between text-neutral-400 py-1 border-b border-neutral-900">
                                        <span>Plan Type:</span>
                                        <span className="text-emerald-400 font-bold">{c.activePlanName || 'No Active Plan'}</span>
                                      </div>
                                      <div className="flex justify-between text-neutral-400 py-1 border-b border-neutral-900">
                                        <span>Meals Left:</span>
                                        <span className="text-white font-black">{c.mealsRemaining !== undefined ? c.mealsRemaining : 0} Meals</span>
                                      </div>
                                      <div className="flex justify-between text-neutral-400 py-1 border-b border-neutral-900">
                                        <span>Meal Shift:</span>
                                        <span className="text-white font-medium uppercase tracking-wider">{c.mealTiming || 'Both'}</span>
                                      </div>
                                      <div className="flex justify-between text-neutral-400 py-1 border-b border-neutral-900">
                                        <span>Validity Period:</span>
                                        <span className="text-white font-medium">{expiryDateStr}</span>
                                      </div>
                                      {c.address && (
                                        <div className="pt-2 text-neutral-400 space-y-0.5">
                                          <span className="text-[10px] text-neutral-500 font-bold block">DELIVERY ADDRESS:</span>
                                          <p className="text-[10px] text-neutral-300 leading-relaxed">{c.address} {c.landmark && `(${c.landmark})`}</p>
                                        </div>
                                      )}
                                      {c.deliveryNotes && (
                                        <div className="pt-1 text-emerald-400 text-[10px]">
                                          <span className="text-neutral-500 text-[9px] font-bold block">DELIVERY NOTE:</span>
                                          <span>"{c.deliveryNotes}"</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-neutral-900 flex justify-between items-center gap-1.5">
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handlePauseSubscription(c, sStatus !== 'paused')}
                                        className="py-1.5 px-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white text-[9px] font-black rounded-lg border border-neutral-850 transition-colors flex items-center gap-1"
                                      >
                                        <span>{sStatus === 'paused' ? '▶ Resume' : '⏸ Pause'}</span>
                                      </button>
                                      <button
                                        onClick={() => handleCancelSubscription(c)}
                                        className="py-1.5 px-2.5 bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 text-[9px] font-black rounded-lg border border-neutral-850 hover:border-red-900/30 transition-all flex items-center gap-1"
                                      >
                                        <span>Cancel</span>
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => {
                                        setEditingCustomer(c);
                                        setNewCustomerName(c.name);
                                        setNewCustomerPhone(c.phone);
                                        setNewCustomerAddress(c.address);
                                        setNewCustomerLandmark(c.landmark || '');
                                        setNewCustomerMapsLocation(c.mapsLocation || '');
                                        setNewCustomerStartDate(c.startDate || new Date().toISOString().slice(0, 10));
                                        setNewCustomerPlanId(c.activePlanId || 'monthly_single');
                                        setNewCustomerMealTiming(c.mealTiming || 'morning');
                                        setNewCustomerTotalMeals(c.mealsRemaining || 26);
                                        setNewCustomerNotes(c.deliveryNotes || '');
                                        setShowAddModal(true);
                                      }}
                                      className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[9px] rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <Edit2 size={10} />
                                      <span>Edit</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {filtered.length === 0 && (
                              <div className="py-24 text-center text-neutral-500 col-span-full">
                                <span>No customers found matching filters.</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* REPORTS TAB */}
                  {adminSubTab === 'reports' && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Top reports display panels */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-2">
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Daily Projections</span>
                          <span className="text-2xl font-black text-white">₹{ (totalMorningTiffins + totalEveningTiffins) * 90 }</span>
                          <p className="text-[10px] text-neutral-400 leading-relaxed">Estimated earnings based on {totalMorningTiffins + totalEveningTiffins} meals served today at ₹90 per meal.</p>
                        </div>

                        <div className="p-6 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-2">
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Weekly Revenue (Est)</span>
                          <span className="text-2xl font-black text-emerald-400">₹{ (totalMorningTiffins + totalEveningTiffins) * 90 * 6 }</span>
                          <p className="text-[10px] text-neutral-400 leading-relaxed">Projected weekly revenue for 6 active days of kitchen operations (kitchen remains closed on Sundays).</p>
                        </div>

                        <div className="p-6 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-2">
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Monthly Recurring (Est)</span>
                          <span className="text-2xl font-black text-white">₹{ activeCustomers.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0) }</span>
                          <p className="text-[10px] text-neutral-400 leading-relaxed">Sum total of subscription payments received from all registered customer plans this month.</p>
                        </div>
                      </div>

                      {/* Plans Visual distribution breakdown chart */}
                      <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                        <h4 className="font-extrabold text-white text-sm">Active Subscription Plan Distribution</h4>
                        <div className="space-y-4">
                          {(() => {
                            const plans = [
                              { id: 'monthly_single', name: 'Single Meal Plan (Monthly)', color: 'bg-amber-500', count: activeCustomers.filter(c => c.activePlanId === 'monthly_single').length },
                              { id: 'monthly_double', name: 'Double Meal Plan (Monthly)', color: 'bg-emerald-500', count: activeCustomers.filter(c => c.activePlanId === 'monthly_double').length },
                              { id: 'trial_meal', name: 'Trial Meal (Disposable)', color: 'bg-indigo-400', count: activeCustomers.filter(c => c.activePlanId === 'trial_meal').length },
                              { id: 'daily_order', name: 'Daily Order (Disposable)', color: 'bg-pink-500', count: activeCustomers.filter(c => c.activePlanId === 'daily_order').length }
                            ];
                            const total = plans.reduce((acc, p) => acc + p.count, 0) || 1;

                            return (
                              <div className="space-y-3">
                                {/* Visual bar scale */}
                                <div className="h-4 w-full bg-neutral-900 rounded-full overflow-hidden flex">
                                  {plans.map(p => {
                                    const percent = (p.count / total) * 100;
                                    if (p.count === 0) return null;
                                    return (
                                      <div 
                                        key={p.id}
                                        style={{ width: `${percent}%` }}
                                        className={`h-full ${p.color}`}
                                        title={`${p.name}: ${p.count}`}
                                      />
                                    );
                                  })}
                                </div>

                                {/* Custom Legend */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                  {plans.map(p => {
                                    const percent = Math.round((p.count / total) * 100);
                                    return (
                                      <div key={p.id} className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-850 flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${p.color} shrink-0`} />
                                        <div>
                                          <span className="text-[10px] text-neutral-400 block font-bold leading-none">{p.name}</span>
                                          <strong className="text-white text-xs block mt-1">{p.count} Active ({percent}%)</strong>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM MODAL POPUP FOR ADDING / EDITING CUSTOMERS */}
                  {(showAddModal || editingCustomer) && (
                    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                      <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl shadow-neutral-950">
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                          <h4 className="font-extrabold text-white text-sm">
                            {editingCustomer ? `Edit Subscriber: ${editingCustomer.name}` : '➕ Add New Subscriber'}
                          </h4>
                          <button
                            onClick={() => {
                              setShowAddModal(false);
                              setEditingCustomer(null);
                            }}
                            className="p-1 rounded hover:bg-neutral-900 text-neutral-500 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <form onSubmit={handleSaveCustomerForm} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Customer Name *</label>
                              <input
                                type="text"
                                value={newCustomerName}
                                onChange={(e) => setNewCustomerName(e.target.value)}
                                placeholder="E.g. Rishabh Panchal"
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500 placeholder-neutral-600"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Mobile Number *</label>
                              <input
                                type="tel"
                                value={newCustomerPhone}
                                onChange={(e) => setNewCustomerPhone(e.target.value)}
                                placeholder="10-digit mobile number"
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500 placeholder-neutral-600"
                                pattern="[0-9]{10}"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Delivery Address *</label>
                              <input
                                type="text"
                                value={newCustomerAddress}
                                onChange={(e) => setNewCustomerAddress(e.target.value)}
                                placeholder="House no, block, road, sector..."
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500 placeholder-neutral-600"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Nearby Landmark (Optional)</label>
                              <input
                                type="text"
                                value={newCustomerLandmark}
                                onChange={(e) => setNewCustomerLandmark(e.target.value)}
                                placeholder="E.g. near Apollo Hospital"
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500 placeholder-neutral-600"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Google Maps Location Link (Optional)</label>
                              <input
                                type="url"
                                value={newCustomerMapsLocation}
                                onChange={(e) => setNewCustomerMapsLocation(e.target.value)}
                                placeholder="Paste Google Maps URL"
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500 placeholder-neutral-600"
                              />
                            </div>
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Start Date</label>
                              <input
                                type="date"
                                value={newCustomerStartDate}
                                onChange={(e) => setNewCustomerStartDate(e.target.value)}
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Subscription Plan</label>
                              <select
                                value={newCustomerPlanId}
                                onChange={(e) => {
                                  const plan = e.target.value;
                                  setNewCustomerPlanId(plan);
                                  // Auto set total meals matching plan counts
                                  if (plan === 'monthly_single') setNewCustomerTotalMeals(26);
                                  else if (plan === 'monthly_double') setNewCustomerTotalMeals(52);
                                  else setNewCustomerTotalMeals(1);
                                }}
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500"
                              >
                                <option value="monthly_single">Single Meal Plan (26 meals)</option>
                                <option value="monthly_double">Double Meal Plan (52 meals)</option>
                                <option value="trial_meal">Trial Meal (1 meal)</option>
                                <option value="daily_order">Daily Order (1 meal)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Meal Timing</label>
                              <select
                                value={newCustomerMealTiming}
                                onChange={(e) => setNewCustomerMealTiming(e.target.value as any)}
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500"
                              >
                                <option value="morning">Morning Shift (AM)</option>
                                <option value="evening">Evening Shift (PM)</option>
                                <option value="both">Both Shifts (AM + PM)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-neutral-400 font-bold block mb-1">Meals Purchased / Left</label>
                              <input
                                type="number"
                                value={newCustomerTotalMeals}
                                onChange={(e) => setNewCustomerTotalMeals(Number(e.target.value))}
                                className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500"
                                min="0"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-neutral-400 font-bold block mb-1">Special Delivery / Dietary Notes</label>
                            <textarea
                              value={newCustomerNotes}
                              onChange={(e) => setNewCustomerNotes(e.target.value)}
                              placeholder="E.g. Less oil, deliver to security guard, no salt in salad..."
                              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-hidden focus:border-emerald-500 placeholder-neutral-600 h-16 resize-none"
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-900">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddModal(false);
                                setEditingCustomer(null);
                              }}
                              className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 text-xs font-black rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/10"
                            >
                              {editingCustomer ? 'Update Subscription' : 'Create Subscription'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

          </div>
        ) : (
          /* REGULAR CUSTOMER DASHBOARD */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar Menu */}
            <div className="lg:col-span-3 flex lg:flex-col gap-2 bg-neutral-950 p-4 rounded-3xl border border-neutral-800 overflow-x-auto scrollbar-thin shrink-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                  activeTab === 'profile' 
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-950/20' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                <Settings size={16} />
                Profile Settings
              </button>

              <button
                onClick={() => setActiveTab('sub')}
                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                  activeTab === 'sub' 
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-950/20' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                <CreditCard size={16} />
                My Subscription
              </button>

              <button
                onClick={() => setActiveTab('skips')}
                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                  activeTab === 'skips' 
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-950/20' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                <Calendar size={16} />
                Meal Skip Planner
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                  activeTab === 'orders' 
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-950/20' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                <ShoppingBag size={16} />
                Order History ({userOrders.length})
              </button>

              <button
                onClick={() => {
                  const o = orders.find(ord => ord.userId === currentUser.id && ord.orderStatus !== 'delivered') || userOrders[0];
                  if (o) startTracking(o);
                  setActiveTab('tracking');
                }}
                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                  activeTab === 'tracking' 
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-950/20' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                <Compass size={16} />
                Live Driver Map
              </button>
            </div>

            {/* Right Tab Content Block */}
            <div className="lg:col-span-9 bg-neutral-950 p-6 sm:p-8 rounded-3xl border border-neutral-800 min-h-[420px]">
              
              {/* TAB 1: PROFILE EDIT */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-white">Contact & Delivery Information</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Update your primary contact coordinates and default drop-off address. Delivery executives will reference these coordinates for your daily meals.
                    </p>
                  </div>

                  {profileMessage && (
                    <div className="p-3 bg-emerald-950/40 text-emerald-400 text-xs rounded-xl border border-emerald-900/50">
                      ✓ {profileMessage}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-neutral-400 font-medium">Full Name</label>
                        <input
                          type="text"
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-neutral-400 font-medium">10-Digit Mobile Number</label>
                        <input
                          type="tel"
                          value={profPhone}
                          onChange={(e) => setProfPhone(e.target.value)}
                          className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-400 font-medium">Delivery Drop Address (Vijay Nagar, Indore)</label>
                      <textarea
                        rows={2.5}
                        value={profAddress}
                        onChange={(e) => setProfAddress(e.target.value)}
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-400 font-medium">Landmark / Drop Instructions</label>
                      <input
                        type="text"
                        value={profLandmark}
                        onChange={(e) => setProfLandmark(e.target.value)}
                        placeholder="e.g. Leave with gatekeeper / opposite park"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-950/20"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: ACTIVE SUBSCRIPTION CARD */}
              {activeTab === 'sub' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-white">Active Subscription</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Manage your current dining credits, packaging guidelines, and active monthly commitments.
                    </p>
                  </div>

                  {currentUser.activePlanId ? (
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 sm:p-8 rounded-3xl border border-neutral-800 relative overflow-hidden space-y-6">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">Currently Activated</span>
                          <h4 className="text-xl font-black text-white mt-1">{currentUser.activePlanName}</h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Activated on: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                          {currentUser.subscriptionExpiresAt && (
                            <p className="text-[11px] text-amber-400 font-bold mt-1.5 flex items-center gap-1.5">
                              <Clock size={12} />
                              Expires on: {new Date(currentUser.subscriptionExpiresAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-900/60 text-center min-w-[120px]">
                          <span className="text-[10px] text-neutral-400 font-extrabold uppercase block tracking-wider">Remaining Meals</span>
                          <span className="text-3xl font-black text-white block mt-1">{currentUser.mealsRemaining}</span>
                          <span className="text-[8px] text-neutral-500">Tiffin counts left</span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-850 pt-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-500 font-extrabold block">Tiffin Box Responsibility</span>
                          <p className="text-neutral-400 max-w-sm">
                            Keep your insulated stainless steel tiffin container clean and return it during the next delivery.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to pause/cancel your subscription? Pausing holds remaining tiffin credits.')) {
                              alert('Subscription canceled. Your remaining credits have been held in escrow.');
                            }
                          }}
                          className="py-2 px-3.5 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-400 rounded-lg text-xs font-bold border border-neutral-750"
                        >
                          Pause Subscription
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 text-center space-y-4 rounded-3xl border border-neutral-850 bg-neutral-900/30">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mx-auto text-neutral-600">
                        <CreditCard size={24} />
                      </div>
                      <h4 className="font-bold text-white">No Active Subscription</h4>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                        You do not have an active tiffin subscription plan yet. Subscribe to any of our healthy weekly or monthly organic plans above!
                      </p>
                      <a
                        href="#plans"
                        className="inline-block py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-colors shadow-lg"
                      >
                        Explore Meal Plans
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MEAL SKIP PLANNER */}
              {activeTab === 'skips' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-white">Meal Skip Planner</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Going out or ordering elsewhere? Schedule a meal skip at least before 9:00 AM for lunch and 5:00 PM for dinner. Suspended meals are fully credited back to your account!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Add Skip Form */}
                    <div className="md:col-span-5 bg-neutral-900/60 p-5 rounded-2xl border border-neutral-850 space-y-4">
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <Calendar size={16} className="text-orange-500" />
                        Schedule New Skip
                      </h4>

                      {skipError && (
                        <p className="p-2.5 bg-red-950/40 text-red-400 rounded-lg border border-red-900/60 text-[10px] leading-relaxed">
                          ⚠️ {skipError}
                        </p>
                      )}

                      <form onSubmit={handleAddSkip} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Select Skip Date</label>
                          <input
                            type="date"
                            value={skipDate}
                            onChange={(e) => setSkipDate(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Which Meal?</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['lunch', 'dinner', 'both'] as const).map(pref => (
                              <button
                                key={pref}
                                type="button"
                                onClick={() => setSkipPref(pref)}
                                className={`p-2 rounded-lg text-[10px] font-bold border capitalize transition-colors ${
                                  skipPref === pref
                                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                                }`}
                              >
                                {pref}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-colors"
                        >
                          Confirm & Hold Credits
                        </button>
                      </form>
                    </div>

                    {/* Active Skip History */}
                    <div className="md:col-span-7 space-y-3">
                      <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest block">Your Scheduled Skips</h4>

                      {userSkips.length > 0 ? (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                          {userSkips.map((skip) => (
                            <div key={skip.id} className="p-3 bg-neutral-900/30 border border-neutral-850 rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <span className="font-extrabold text-white block">
                                  {new Date(skip.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-[10px] text-neutral-500 uppercase mt-0.5 block">
                                  Slot: <strong className="text-emerald-400">{skip.mealPreference}</strong> • Credits Refunded (+1)
                                </span>
                              </div>
                              <button
                                onClick={() => removeSkipRecord(skip.date)}
                                className="p-1.5 hover:bg-neutral-800 text-neutral-500 hover:text-red-400 rounded-lg transition-colors text-[10px] font-bold"
                              >
                                Cancel Skip
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center rounded-2xl border border-neutral-850/40 text-neutral-500 bg-neutral-900/10">
                          <span className="text-xl block mb-2">📅</span>
                          <span className="text-xs font-bold block">No Pending Meal Skips</span>
                          <p className="text-[10px] text-neutral-600 mt-1">If you need to skip any lunch or dinner, schedule it from the left menu.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 4: ORDER TRANSACTION HISTORY */}
              {activeTab === 'orders' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-white">Subscription & Trial Invoice History</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Check your past billing history, digital payment gateway receipts, or launch live map tracking.
                    </p>
                  </div>

                  {userOrders.length > 0 ? (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                      {userOrders.map((ord) => (
                        <div key={ord.id} className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white">#{ord.id}</span>
                              <span className="text-[9px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                                {ord.transactionId?.slice(0, 16)}...
                              </span>
                            </div>
                            <h5 className="font-black text-white mt-1.5">{ord.planName}</h5>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              {ord.timePreference ? `${ord.timePreference} • ` : ''}{ord.mealPreference.toUpperCase()}
                            </p>
                            <p className="text-[9px] text-neutral-500 mt-1">Paid on: {new Date(ord.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex sm:flex-col items-end gap-2 justify-between w-full sm:w-auto border-t sm:border-t-0 border-neutral-800 pt-2 sm:pt-0">
                            <span className="font-black text-emerald-400 text-sm">₹{ord.price}.00</span>
                            
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                ord.orderStatus === 'delivered' ? 'bg-neutral-800 text-neutral-500' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                              }`}>
                                {ord.orderStatus.replace('_', ' ')}
                              </span>

                              <button
                                onClick={() => handleDownloadReceipt(ord)}
                                className="py-1 px-2.5 bg-neutral-800 hover:bg-emerald-950 border border-neutral-700 hover:border-emerald-700/40 text-neutral-300 hover:text-emerald-400 font-bold text-[10px] rounded-md transition-all flex items-center gap-1 cursor-pointer"
                                title="Download Transaction PDF Receipt"
                              >
                                <Download size={10} />
                                Receipt
                              </button>

                              {ord.orderStatus === 'delivered' && (
                                <button
                                  onClick={() => {
                                    setPreSelectedOrder(ord);
                                    setIsFeedbackOpen(true);
                                  }}
                                  className="py-1 px-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[10px] rounded-md transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Star size={10} className="fill-current text-neutral-950" />
                                  Rate Meal
                                </button>
                              )}

                              {ord.orderStatus !== 'delivered' && (
                                <button
                                  onClick={() => {
                                    startTracking(ord);
                                    setActiveTab('tracking');
                                  }}
                                  className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-md transition-all"
                                >
                                  Track Live
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-neutral-500 space-y-2">
                      <span className="text-2xl block">🧾</span>
                      <span className="text-xs font-bold block">No order history found.</span>
                      <p className="text-[10px] text-neutral-600">Once you submit your checkout form, the orders will generate here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ACTIVE LIVE MAP TRACKING */}
              {activeTab === 'tracking' && (
                <div className="space-y-4 animate-fade-in">
                  <OrderTrackerMap onBack={() => setActiveTab('profile')} />
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {currentUser && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          currentUser={currentUser}
          deliveredOrders={orders.filter(o => o.userId === currentUser.id && o.orderStatus === 'delivered')}
          preSelectedOrder={preSelectedOrder}
          onSuccess={(msg) => {
            setFeedbackSuccess(msg);
            // Smooth scroll to top of dashboard where success banner is shown
            const el = document.getElementById('account');
            el?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => setFeedbackSuccess(''), 8000);
          }}
        />
      )}

      <GoogleDriveManager
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
      />

      <GmailNotificationModal
        isOpen={isGmailOpen}
        onClose={() => setIsGmailOpen(false)}
        defaultRecipientEmail={gmailRecipientEmail}
        defaultRecipientName={gmailRecipientName}
      />
    </section>
  );
}
