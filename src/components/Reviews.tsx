import React, { useState } from 'react';
import { REVIEWS } from '../data';
import { Review } from '../types';
import { Star, MessageSquare, Quote, User, Sparkles, Clock, MapPin, ShieldCheck, ExternalLink } from 'lucide-react';

export default function Reviews() {
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 10) {
      setError('Please write a review comment (minimum 10 characters).');
      return;
    }

    const colorPalettes = ['bg-emerald-600', 'bg-orange-500', 'bg-teal-600', 'bg-yellow-600', 'bg-blue-600', 'bg-indigo-600'];
    const randomColor = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

    const newReview: Review = {
      id: `rev_custom_${Date.now()}`,
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: 'Just now',
      avatarColor: randomColor
    };

    setReviewsList([newReview, ...reviewsList]);
    setName('');
    setComment('');
    setRating(5);
    setError('');
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
    }, 2500);
  };

  const calculateAverage = () => {
    const sum = reviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviewsList.length).toFixed(1);
  };

  return (
    <section 
      id="reviews" 
      className="py-16 sm:py-24 bg-white dark:bg-neutral-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            Happy Customers
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight flex justify-center items-center gap-2">
            Reviews & Testimonials
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            Hear what our daily subscribers say about the quality, freshness, and punctuality of PUREATY Tiffin Service.
          </p>
        </div>

        {/* Google Business Profile Verified Widget */}
        <div className="mt-12 max-w-4xl mx-auto bg-neutral-900 text-white rounded-3xl border border-neutral-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Top Info Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Pureaty - Best Tiffin Service in Indore
                </h3>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-sm">4.5</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star size={14} className="fill-current text-amber-500" />
                    <Star size={14} className="fill-current text-amber-500" />
                    <Star size={14} className="fill-current text-amber-500" />
                    <Star size={14} className="fill-current text-amber-500" />
                    <div className="relative w-3.5 h-3.5 flex items-center">
                      <Star size={14} className="absolute text-neutral-700" />
                      <div className="absolute top-0 left-0 w-[50%] overflow-hidden">
                        <Star size={14} className="fill-current text-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-neutral-700">•</span>
                <a 
                  href="https://maps.app.goo.gl/tJo62Xh1gpEi6yJh7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
                >
                  90 Google reviews
                </a>
                <span className="text-neutral-700">•</span>
                <span className="text-neutral-300">₹1–200</span>
                <span className="text-neutral-700">•</span>
                <span className="text-neutral-300">Tiffin Service Provider</span>
                <span className="text-neutral-700">•</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open
                </span>
              </div>

              {/* Verified badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 bg-neutral-800/80 px-2.5 py-1 rounded-full border border-neutral-700 text-[10px] text-neutral-300 font-bold">
                <ShieldCheck size={12} className="text-blue-400 fill-blue-400/10" />
                <span>You manage this Business Profile</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
              <a
                href="https://maps.app.goo.gl/tJo62Xh1gpEi6yJh7"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-neutral-700 grow md:grow-0"
              >
                <ExternalLink size={13} className="text-neutral-400" />
                Google Maps
              </a>
              <button
                id="write-review-toggle-btn"
                type="button"
                onClick={() => {
                  setShowForm(!showForm);
                  setError('');
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 grow md:grow-0"
              >
                <MessageSquare size={13} />
                {showForm ? 'Cancel Form' : 'Write a Review'}
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
            {/* Left side: map and address detail */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-neutral-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">Address</h4>
                  <p className="text-sm text-neutral-200 font-medium mt-1">
                    Vijay Nagar, Sector A, Sheetal Nagar, Indore, Madhya Pradesh 452011
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="text-neutral-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">Hours</h4>
                  <p className="text-sm text-neutral-200 font-medium mt-1">
                    Open • 9:00 AM - 10:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: AI / Google review summary summary */}
            <div className="bg-neutral-800/40 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Reviews Summary
                </h4>
                <p className="text-xs sm:text-sm text-neutral-300 italic mt-3 leading-relaxed">
                  "People say this tiffin service offers fresh, tasty, and healthy food that tastes just like home-cooked meals, with soft rotis and hygienic daily delivery in Indore."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
                <span>Summarized from 90 Google reviews</span>
                <span className="text-emerald-500 font-bold">4.5 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Review Form */}
        {showForm && (
          <div className="mt-8 p-6 sm:p-8 bg-neutral-50 dark:bg-neutral-800/40 rounded-3xl border border-neutral-100 dark:border-neutral-800/80 max-w-lg mx-auto shadow-md animate-fade-in">
            <form onSubmit={handleAddReview} className="space-y-4">
              <h3 className="font-black text-neutral-800 dark:text-neutral-100 text-base flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-500" />
                Share your Experience
              </h3>
              
              {error && (
                <p className="text-red-500 text-xs p-2 bg-red-50 dark:bg-red-950/20 border border-red-100 rounded-lg">{error}</p>
              )}
              {success && (
                <p className="text-emerald-600 text-xs p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 rounded-lg">✓ Review added successfully! Calculating scores...</p>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Shivam Gupta"
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star size={24} className={star <= rating ? "fill-current text-amber-500" : "text-neutral-300"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Review Comment</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the taste, freshness, and delivery service?"
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <button
                id="submit-review-btn"
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-wide"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Customer Reviews List */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
          {reviewsList.map((review) => (
            <div
              key={review.id}
              className="bg-neutral-50 dark:bg-neutral-800/20 p-6 sm:p-8 rounded-3xl border border-neutral-100/80 dark:border-neutral-800/60 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${review.avatarColor} text-white font-extrabold rounded-full flex items-center justify-center text-sm shadow-inner`}>
                      {review.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-neutral-800 dark:text-neutral-200 text-sm">
                        {review.name}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-semibold block">
                        Verified Subscriber
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={12} 
                        className={star <= review.rating ? "text-amber-500 fill-amber-500" : "text-neutral-200"} 
                      />
                    ))}
                  </div>
                </div>

                {/* Comment quote */}
                <div className="relative">
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic pr-4">
                    "{review.comment}"
                  </p>
                  <Quote size={32} className="absolute -top-3 -right-2 text-neutral-200 dark:text-neutral-800/40 -z-10 pointer-events-none transform rotate-180" />
                </div>
              </div>

              {/* Date bottom */}
              <div className="mt-6 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400 font-semibold">
                <span>PUREATY Subscriber</span>
                <span>{review.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
