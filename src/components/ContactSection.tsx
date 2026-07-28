import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Mail, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { ContactFormData } from '../types';

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    plan: 'single_meal',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const contactInfo = {
    address: 'Vijay Nagar, Sector A, Sheetal Nagar, Indore, Madhya Pradesh 452011',
    phone: '+91 93993 72194',
    whatsapp: '+91 93993 72194',
    email: 'hello@pureaty.com',
    mapQuery: 'https://maps.google.com/maps?q=Vijay%20Nagar,%20Indore&t=&z=14&ie=UTF8&iwloc=&output=embed'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Your name is required';
    }
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please provide a valid email';
    }
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim().replace(/[-+()\s]/g, ''))) {
      tempErrors.phone = 'Please enter a valid 10-digit number';
    }
    if (!formData.message.trim()) {
      tempErrors.message = 'Message cannot be empty';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        plan: 'single_meal',
        message: '',
      });
      setTimeout(() => setSuccess(false), 4000);
    }, 1500);
  };

  return (
    <section 
      id="contact" 
      className="py-16 sm:py-24 bg-white dark:bg-neutral-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            Contact Our Kitchen
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            Have questions about subscriptions or corporate lunch events? Reach out via our direct hotlines or drop us a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Contact Details & Google Maps Embed */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-4xl p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800/80 shadow-xs space-y-6">
              <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-lg border-b border-neutral-200/50 dark:border-neutral-700/50 pb-3 leading-tight">
                Our Details
              </h3>

              <div className="space-y-5">
                {/* Address */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">Kitchen Address</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700 rounded-xl text-orange-500 shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">Phone Number</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {contactInfo.phone}
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700 rounded-xl text-emerald-500 shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">WhatsApp support</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {contactInfo.whatsapp}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700 rounded-xl text-orange-500 shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">Email Address</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {contactInfo.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons list */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-neutral-200/50 dark:border-neutral-700/50">
                <a
                  id="contact-call-btn"
                  href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                  className="px-3 py-2.5 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[10px] font-black uppercase text-center text-neutral-700 dark:text-neutral-200 tracking-wider shadow-2xs"
                >
                  Call Now
                </a>
                <a
                  id="contact-wa-btn"
                  href={`https://wa.me/919399372194?text=Hi! I am calling from the website.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase text-center tracking-wider shadow-xs"
                >
                  WhatsApp
                </a>
                <a
                  id="contact-dir-btn"
                  href="https://maps.app.goo.gl/tJo62Xh1gpEi6yJh7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase text-center tracking-wider shadow-xs"
                >
                  Directions
                </a>
              </div>
            </div>

            {/* Google Maps iFrame */}
            <div className="rounded-3xl overflow-hidden shadow-md h-52 lg:flex-1 border border-neutral-100 dark:border-neutral-800">
              <iframe
                title="PUREATY Kitchen Google Maps"
                src={contactInfo.mapQuery}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Contact Us validated form */}
          <div className="lg:col-span-7 bg-neutral-50 dark:bg-neutral-800/20 rounded-4xl p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-lg border-b border-neutral-200/50 dark:border-neutral-700/50 pb-3 leading-tight">
                  Send a Message
                </h3>

                {success && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-2xl text-xs flex items-center gap-2.5 animate-scale-up">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <p><strong>Success!</strong> Your message has been sent. We will get in touch with you within 2 hours!</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="E.g. Shivam Gupta"
                      className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Mobile Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="93993 72194"
                      className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="shivam@example.com"
                      className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email}</p>}
                  </div>

                  {/* Plan interest */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Plan of Interest</label>
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                    >
                      <option value="single_meal">🍱 Single Meal Plan (₹1900/mo)</option>
                      <option value="double_meal">🍱 Double Meal Plan (₹3400/mo)</option>
                      <option value="daily_meal">🍽️ Daily Meal (₹90/meal)</option>
                      <option value="trial_meal">⭐ Trial Meal (₹90)</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Message or Delivery Address</label>
                  <textarea
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter details about your address, preferred meal timing, or any food allergy..."
                    className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                  />
                  {errors.message && <p className="text-red-500 text-[10px] mt-0.5">{errors.message}</p>}
                </div>
              </div>

              <button
                id="contact-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/15 transition-all text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sending Message...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
