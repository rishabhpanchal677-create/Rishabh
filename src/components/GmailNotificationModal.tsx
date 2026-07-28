import React, { useState, useEffect } from 'react';
import { 
  connectGmail, 
  getGmailToken, 
  setGmailToken, 
  sendGmail, 
  buildDispatchEmailHtml 
} from '../lib/gmailService';
import { useApp } from '../context/AppContext';
import { 
  Mail, Send, CheckCircle2, AlertCircle, X, Shield, RefreshCw, 
  UserCheck, Sparkles, Truck, FileText, Lock
} from 'lucide-react';

interface GmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientEmail?: string;
  defaultRecipientName?: string;
}

export default function GmailNotificationModal({
  isOpen,
  onClose,
  defaultRecipientEmail = '',
  defaultRecipientName = ''
}: GmailNotificationModalProps) {
  const { users } = useApp();
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email form state
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail);
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [templateType, setTemplateType] = useState<'dispatch' | 'invoice' | 'custom'>('dispatch');
  const [subject, setSubject] = useState('🚚 Your PUREATY Fresh Tiffin is On The Way!');
  const [customMessage, setCustomMessage] = useState('');

  // Mandatory confirmation dialog state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const activeToken = getGmailToken();
      if (activeToken) {
        setToken(activeToken);
      }
      if (defaultRecipientEmail) {
        setRecipientEmail(defaultRecipientEmail);
      }
      if (defaultRecipientName) {
        setRecipientName(defaultRecipientName);
      }
    }
  }, [isOpen, defaultRecipientEmail, defaultRecipientName]);

  useEffect(() => {
    if (templateType === 'dispatch') {
      setSubject('🚚 Your PUREATY Fresh Meal Has Been Dispatched!');
    } else if (templateType === 'invoice') {
      setSubject('🧾 PUREATY Subscription Confirmation & Digital Receipt');
    } else {
      setSubject('📢 Update from PUREATY Kitchen Headquarters');
    }
  }, [templateType]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      const accessToken = await connectGmail();
      setToken(accessToken);
      setStatusMessage({ type: 'success', text: 'Gmail account connected successfully!' });
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'Failed to authenticate with Gmail.' 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSelectCustomer = (email: string) => {
    const selected = users.find(u => u.email === email);
    setRecipientEmail(email);
    if (selected) {
      setRecipientName(selected.name);
    }
  };

  const generateEmailBodies = () => {
    const name = recipientName.trim() || 'Valued Subscriber';
    const email = recipientEmail.trim();

    if (templateType === 'dispatch') {
      const selectedUser = users.find(u => u.email === email);
      const planName = selectedUser?.activePlanName || 'Monthly Tiffin Subscription';
      const address = selectedUser?.address || 'Your registered delivery address';
      const timing = selectedUser?.mealTiming || 'morning';

      const html = buildDispatchEmailHtml(name, planName, address, timing);
      const text = `Hello ${name},\n\nYour fresh PUREATY meal under ${planName} has been dispatched to ${address}.\nArrival in approx 15-25 minutes!\n\nPureaty Kitchens`;
      return { html, text };
    } else if (templateType === 'invoice') {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #30363d;">
          <h2 style="color: #10b981; font-size: 20px; margin-top: 0;">PUREATY Subscription Invoice</h2>
          <p style="color: #c9d1d9;">Hello <strong>${name}</strong>,</p>
          <p style="color: #c9d1d9;">Thank you for subscribing to PUREATY Premium Tiffin Service. Your subscription is active!</p>
          <div style="background: #161b22; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="margin: 0; color: #8b949e; font-size: 12px;">INVOICE DETAILS:</p>
            <p style="margin: 4px 0; color: #10b981; font-weight: bold;">Status: PAID</p>
            <p style="margin: 4px 0; color: #f0f6fc;">Service: Daily Hygienic Homemade Meals</p>
          </div>
          <p style="color: #8b949e; font-size: 12px;">Warm regards,<br>PUREATY Kitchen Team</p>
        </div>
      `;
      const text = `Hello ${name},\n\nThank you for subscribing to PUREATY Tiffin Service. Your subscription payment has been confirmed.\n\nPureaty Kitchen Team`;
      return { html, text };
    } else {
      const bodyText = customMessage.trim() || `Hello ${name},\n\nThis is an official message from PUREATY Kitchens.\n\nBest regards,\nPUREATY Operations Team`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #30363d;">
          <h2 style="color: #10b981; font-size: 20px; margin-top: 0;">PUREATY Operations Update</h2>
          <p style="color: #c9d1d9;">Hello <strong>${name}</strong>,</p>
          <p style="color: #c9d1d9; white-space: pre-wrap; line-height: 1.6;">${bodyText}</p>
          <p style="color: #8b949e; font-size: 12px; margin-top: 24px;">PUREATY Kitchens • Vijay Nagar, Indore</p>
        </div>
      `;
      return { html, text: bodyText };
    }
  };

  const handlePreSendCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter or select a recipient email address.' });
      return;
    }
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Please connect your Gmail account first.' });
      return;
    }
    setStatusMessage(null);
    // Show mandatory confirmation dialog before sending
    setShowConfirmModal(true);
  };

  const confirmSendEmail = async () => {
    if (!token) return;
    setIsSending(true);
    try {
      const { html, text } = generateEmailBodies();
      await sendGmail({
        token,
        to: recipientEmail.trim(),
        subject: subject.trim(),
        bodyText: text,
        bodyHtml: html
      });

      setStatusMessage({ 
        type: 'success', 
        text: `Email successfully sent to ${recipientEmail} via Gmail!` 
      });
      setShowConfirmModal(false);
      setCustomMessage('');
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'Failed to send email via Gmail API.' 
      });
      setShowConfirmModal(false);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Gmail Dispatch & Notifications
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  Workspace API
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Send real-time meal alerts & receipts directly from your official Gmail account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium animate-fade-in ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
                : 'bg-red-950/40 border-red-800/60 text-red-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Connection Card */}
          {!token ? (
            <div className="p-8 rounded-3xl bg-neutral-950 border border-neutral-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-emerald-400">
                <Mail className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">Connect Your Gmail Account</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Authorize Google Mail access to send authenticated dispatch notifications, daily delivery updates, and customer receipts directly from your email address.
                </p>
              </div>

              {/* Standard Material Google Button */}
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 text-neutral-900 font-bold px-6 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isConnecting ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handlePreSendCheck} className="space-y-5">
              
              {/* Connected Header */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-300">Gmail Connected & Ready</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setGmailToken(null); setToken(null); }}
                  className="text-xs text-neutral-400 hover:text-red-400 underline"
                >
                  Disconnect
                </button>
              </div>

              {/* Template Selection Tabs */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 block mb-2">
                  Select Email Template
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplateType('dispatch')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      templateType === 'dispatch'
                        ? 'bg-emerald-950/50 border-emerald-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Truck className="w-4 h-4 mb-2 text-emerald-400" />
                    <span className="text-xs font-bold block">Meal Dispatched</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateType('invoice')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      templateType === 'invoice'
                        ? 'bg-emerald-950/50 border-emerald-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 mb-2 text-emerald-400" />
                    <span className="text-xs font-bold block">Receipt / Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateType('custom')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      templateType === 'custom'
                        ? 'bg-emerald-950/50 border-emerald-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-4 h-4 mb-2 text-emerald-400" />
                    <span className="text-xs font-bold block">Custom Email</span>
                  </button>
                </div>
              </div>

              {/* Recipient Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 block">
                    Recipient Details
                  </label>
                  
                  {/* Select from registered subscribers dropdown */}
                  {users.filter(u => !u.isAdmin).length > 0 && (
                    <select
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      className="text-xs bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1 text-emerald-400 focus:outline-none"
                    >
                      <option value="">-- Choose Registered Customer --</option>
                      {users.filter(u => !u.isAdmin).map((u) => (
                        <option key={u.id} value={u.email}>
                          {u.name} ({u.email || 'No Email'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Subscriber Name (e.g. Aman Verma)"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Subscriber Email Address"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Custom Message input if templateType === 'custom' */}
              {templateType === 'custom' && (
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 block mb-1">
                    Email Content Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write your custom announcement or message to the customer here..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-2xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Review & Send Email via Gmail</span>
              </button>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Google Gmail REST API Integration</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>

      {/* Mandatory User Confirmation Dialog before sending email */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Confirm Sending Email?</h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                You are about to send an email to <strong className="text-white">{recipientEmail}</strong> with the subject:
                <span className="block italic text-emerald-400 mt-1 font-medium">"{subject}"</span>
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSending}
                className="flex-1 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSendEmail}
                disabled={isSending}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                {isSending ? 'Sending via Gmail...' : 'Yes, Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
