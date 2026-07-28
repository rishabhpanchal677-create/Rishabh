export interface MenuItem {
  day: string;
  isHoliday?: boolean;
  lunch: {
    rotis: string;
    dal: string;
    rice: string;
    sabji: string;
    salad: string;
    achar: string;
    sweet?: string;
    special?: boolean;
  };
  dinner?: {
    rotis: string;
    dal: string;
    rice: string;
    sabji: string;
    salad: string;
    achar: string;
    sweet?: string;
    special?: boolean;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  mealsCount?: string;
  type: 'single' | 'double' | 'daily' | 'trial';
  description: string;
  features: string[];
  period: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatarColor: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  plan: string;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  landmark?: string;
  isAdmin: boolean;
  activePlanId?: string | null;
  activePlanName?: string | null;
  mealsRemaining?: number;
  totalPaid?: number;
  createdAt: string;
  subscriptionExpiresAt?: string | null;
  
  // New Tiffin Center Subscription Manager Fields
  mapsLocation?: string | null;
  startDate?: string | null;
  mealTiming?: 'morning' | 'evening' | 'both' | null;
  subscriptionStatus?: 'active' | 'paused' | 'expired' | 'cancelled' | null;
  totalMealsPurchased?: number;
  deliveryNotes?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  planId: string;
  planName: string;
  price: number;
  mealPreference: 'lunch' | 'dinner' | 'both';
  timePreference: string;
  address: string;
  landmark?: string;
  extraRotis: boolean;
  paymentMethod: 'card' | 'upi' | 'paypal';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  transactionId?: string;
  orderStatus: 'cooking' | 'dispatched' | 'near_sector' | 'delivered';
  eta: string; // e.g. "12 mins"
  createdAt: string;
}

export interface SkipRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealPreference: 'lunch' | 'dinner' | 'both';
  createdAt: string;
}

export interface DriverPoint {
  lat: number;
  lng: number;
  name: string;
}

export interface MealRating {
  id: string;
  userId: string;
  userName: string;
  orderId: string;
  taste: number;
  quantity: number;
  presentation: number;
  comments?: string;
  createdAt: string;
}

