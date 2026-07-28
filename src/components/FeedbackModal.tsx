import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Heart, Flame, ShieldAlert, Sparkles, MessageSquare, CheckCircle, UtensilsCrossed } from 'lucide-react';
import { db, doc, setDoc } from '../lib/firebase';
import { Order, User } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  deliveredOrders: Order[];
  preSelectedOrder?: Order | null;
  onSuccess: (message: string) => void;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  currentUser,
  deliveredOrders,
  preSelectedOrder,
  onSuccess,
}: FeedbackModalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    preSelectedOrder?.id || (deliveredOrders.length > 0 ? deliveredOrders[0].id : '')
  );
  
  // Rating states (1 to 5)
  const [taste, setTaste] = useState<number>(5);
  const [quantity, setQuantity] = useState<number>(5);
  const [presentation, setPresentation] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  
  // Hover auxiliary states for ratings
  const [tasteHover, setTasteHover] = useState<number | null>(null);
  const [quantityHover, setQuantityHover] = useState<number | null>(null);
  const [presentationHover, setPresentationHover] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick comments tags
  const quickComments = [
    "Perfect spices! 🔥",
    "Loved the ghee rotis! 🫓",
    "Generous basmati portion! 🍚",
    "Arrived piping hot! ♨️",
    "Delicious sweet dish! 🍮",
    "Very clean packaging! ✨"
  ];

  const handleQuickCommentClick = (commentText: string) => {
    if (comments.includes(commentText)) {
      setComments(prev => prev.replace(commentText, '').trim());
    } else {
      setComments(prev => (prev ? prev + ' ' + commentText : commentText));
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      setError('Please select a delivered order to rate.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const ratingId = `rating_${Date.now()}`;
    const ratingData = {
      id: ratingId,
      userId: currentUser.id,
      userName: currentUser.name,
      orderId: selectedOrderId,
      taste,
      quantity,
      presentation,
      comments: comments.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      // Save directly to firestore
      await setDoc(doc(db, 'meal_ratings', ratingId), ratingData);
      
      // Success feedback
      onSuccess(`Thank you, ${currentUser.name}! Your meal feedback was recorded successfully.`);
      
      // Reset values
      setTaste(5);
      setQuantity(5);
      setPresentation(5);
      setComments('');
      onClose();
    } catch (err: any) {
      console.error('Error saving feedback:', err);
      setError('Could not save your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOrderDetails = deliveredOrders.find(o => o.id === selectedOrderId);

  // Star Rating Picker Widget
  const renderStarPicker = (
    label: string,
    currentValue: number,
    setValue: (val: number) => void,
    hoverValue: number | null,
    setHoverValue: (val: number | null) => void,
    icon: React.ReactNode,
    desc: string
  ) => {
    return (
      <div className="space-y-2 p-3 bg-neutral-900/40 rounded-2xl border border-neutral-850">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">{icon}</span>
            <span className="text-xs font-black text-white uppercase tracking-wider">{label}</span>
          </div>
          <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            {hoverValue !== null ? hoverValue : currentValue} / 5
          </span>
        </div>
        <p className="text-[10px] text-neutral-500">{desc}</p>
        <div className="flex items-center gap-2 pt-1.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoverValue !== null ? hoverValue : currentValue);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setValue(star)}
                onMouseEnter={() => setHoverValue(star)}
                onMouseLeave={() => setHoverValue(null)}
                className="transition-all duration-150 hover:scale-125 focus:outline-none"
              >
                <Star
                  size={24}
                  className={`${
                    active 
                      ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]' 
                      : 'text-neutral-700 hover:text-neutral-600'
                  }`}
                />
              </button>
            );
          })}
          <span className="text-[10px] font-bold text-neutral-400 ml-2">
            {(hoverValue !== null ? hoverValue : currentValue) === 5 ? 'Excellent! 😋' :
             (hoverValue !== null ? hoverValue : currentValue) === 4 ? 'Very Good! 😊' :
             (hoverValue !== null ? hoverValue : currentValue) === 3 ? 'Average! 🙂' :
             (hoverValue !== null ? hoverValue : currentValue) === 2 ? 'Needs Work! 😐' : 'Disappointing 😞'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-neutral-950 rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden"
            id="feedback-modal-body"
          >
            {/* Header */}
            <div className="p-5 border-b border-neutral-850 bg-gradient-to-r from-neutral-900 to-neutral-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                  <UtensilsCrossed size={18} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                    Rate Today's Meal
                    <Sparkles size={14} className="text-amber-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-medium">Your reviews guide our kitchen's taste standards</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 bg-red-950/40 border-b border-red-900/50 text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Content Form */}
            <form onSubmit={handleSubmitFeedback} className="p-5 sm:p-6 space-y-5">
              {/* Order Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block">Which delivered meal are you rating?</label>
                {deliveredOrders.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-750 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 text-xs text-white focus:outline-hidden"
                    >
                      {deliveredOrders.map(ord => (
                        <option key={ord.id} value={ord.id}>
                          Order #{ord.id} - {ord.planName} ({ord.mealPreference.toUpperCase()})
                        </option>
                      ))}
                    </select>
                    {selectedOrderDetails && (
                      <span className="text-[9px] text-neutral-500 block px-1">
                        Delivered on {new Date(selectedOrderDetails.createdAt).toLocaleDateString()} at {selectedOrderDetails.timePreference}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-850 text-center text-[11px] text-neutral-500">
                    No order history found to rate, rating on active trial meal.
                  </div>
                )}
              </div>

              {/* Star rating criteria block */}
              <div className="space-y-3.5">
                {renderStarPicker(
                  '1. Taste & Seasoning',
                  taste,
                  setTaste,
                  tasteHover,
                  setTasteHover,
                  <Flame size={14} className="text-red-400" />,
                  'How was the salt, spice profile, and authentic homemade taste?'
                )}

                {renderStarPicker(
                  '2. Portion Quantity',
                  quantity,
                  setQuantity,
                  quantityHover,
                  setQuantityHover,
                  <Heart size={14} className="text-emerald-400" />,
                  'Was there enough dal, basmati rice, rotis, and fresh seasonal salad?'
                )}

                {renderStarPicker(
                  '3. Delivery & Presentation',
                  presentation,
                  setPresentation,
                  presentationHover,
                  setPresentationHover,
                  <Sparkles size={14} className="text-amber-400" />,
                  'Was the tiffin neatly clean, hot, insulated, and professionally delivered?'
                )}
              </div>

              {/* Feedback/Suggestions comments */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block">Write a comment (Optional)</label>
                  <span className="text-[9px] text-neutral-500">{comments.length} / 200 chars</span>
                </div>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value.slice(0, 200))}
                  placeholder="Tell us what you loved or how we can improve today..."
                  className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-750 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 text-xs text-white placeholder-neutral-500 outline-none transition-all"
                />

                {/* Quick Tags Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickComments.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickCommentClick(tag)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-md border transition-all ${
                        comments.includes(tag)
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-850 hover:text-neutral-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold text-xs rounded-xl transition-all border border-neutral-800 hover:border-neutral-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                  ) : (
                    <>
                      <MessageSquare size={14} />
                      Submit Meal Rating
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
