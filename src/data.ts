import { MenuItem, SubscriptionPlan, Review, FAQItem } from './types';

export const WEEKLY_MENU: MenuItem[] = [
  {
    day: 'Monday',
    lunch: {
      rotis: '5 Desi Ghee Rotis',
      dal: 'Dal Fry (Yellow Lentils)',
      rice: 'Basmati Rice',
      sabji: 'Seasonal Veg (Aloo Gobi Matar)',
      salad: 'Fresh Cucumber & Carrot Salad',
      achar: 'Homemade Mango Pickle (Achar)',
    }
  },
  {
    day: 'Tuesday',
    lunch: {
      rotis: '5 Desi Ghee Rotis',
      dal: 'Rajma Masala (Red Kidney Beans)',
      rice: 'Basmati Rice',
      sabji: 'Mix Veg Dry',
      salad: 'Fresh Salad',
      achar: 'Homemade Spicy Lemon Achar',
    }
  },
  {
    day: 'Wednesday',
    lunch: {
      rotis: '5 Desi Ghee Rotis',
      dal: 'Pindi Chole (Chickpeas)',
      rice: 'Jeera Rice',
      sabji: 'Aloo Gobhi Masala',
      salad: 'Fresh Garden Salad',
      achar: 'Mixed Vegetable Achar',
    }
  },
  {
    day: 'Thursday',
    lunch: {
      rotis: '5 Desi Ghee Rotis',
      dal: 'Dal Tadka (Lentils Tempered with Ghee & Spices)',
      rice: 'Basmati Rice',
      sabji: 'Paneer Bhurji / Paneer Sabji',
      salad: 'Onion & Lemon Salad',
      achar: 'Green Chili Achar',
    }
  },
  {
    day: 'Friday',
    lunch: {
      rotis: '5 Desi Ghee Rotis',
      dal: 'Dal Makhani (Slow cooked creamy black lentils)',
      rice: 'Jeera Rice',
      sabji: 'Shahi Paneer (Rich Paneer Gravy)',
      salad: 'Fresh Salad',
      achar: 'Special Mango Achar',
      special: true,
    },
    dinner: {
      rotis: '5 Desi Ghee Rotis',
      dal: 'Dal Fry (Yellow Lentils with Desi Ghee)',
      rice: 'Basmati Rice',
      sabji: 'Kadhai Paneer (Tangy & Spicy Bell Pepper Paneer)',
      salad: 'Fresh Salad',
      achar: 'Achar',
      sweet: 'Hot Kesari Sooji Halwa / Gulab Jamun',
      special: true,
    }
  },
  {
    day: 'Saturday',
    lunch: {
      rotis: '5 Desi Ghee Rotis',
      dal: 'Punjabi Kadhi Pakoda (Yogurt curry with gram flour fritters)',
      rice: 'Basmati Rice',
      sabji: 'Aloo Matar Rasdar',
      salad: 'Fresh Salad',
      achar: 'Homemade Mix Achar',
    }
  },
  {
    day: 'Sunday',
    isHoliday: true,
    lunch: {
      rotis: 'No Rotis (Holiday)',
      dal: 'Holiday',
      rice: 'Holiday',
      sabji: 'Holiday',
      salad: 'Holiday',
      achar: 'Holiday',
    }
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'single_meal',
    name: 'Single Meal Plan',
    price: 1900,
    mealsCount: '26 Meals',
    type: 'single',
    description: 'Perfect for professionals needing either Lunch or Dinner at their workplace.',
    features: [
      'Lunch OR Dinner',
      'Monday to Saturday delivery',
      'Fresh homemade taste & ingredients',
      'Validity: 1 Month + 7 Days Grace period',
      'Delivered in Premium Insulated Steel Tiffin'
    ],
    period: 'Month'
  },
  {
    id: 'double_meal',
    name: 'Double Meal Plan',
    price: 3400,
    mealsCount: '52 Meals',
    type: 'double',
    description: 'Complete nutritional coverage for both of your major meals of the day.',
    features: [
      'Lunch + Dinner',
      'Monday to Saturday delivery',
      'Fresh homemade taste & ingredients',
      'Validity: 1 Month + 7 Days Grace period',
      'Delivered in Premium Insulated Steel Tiffin',
      'Weekly Friday sweet dish included'
    ],
    period: 'Month'
  },
  {
    id: 'daily_meal',
    name: 'Daily Meal',
    price: 90,
    mealsCount: '1 Meal',
    type: 'daily',
    description: 'Perfect for occasional orders when your cook is on holiday or you crave home food.',
    features: [
      'Lunch OR Dinner option',
      'Flexible same-day ordering',
      'Fresh homemade quality',
      'Disposable hygienic container packing',
      'No advance commitment required'
    ],
    period: 'Meal'
  },
  {
    id: 'trial_meal',
    name: 'Trial Meal',
    price: 90,
    mealsCount: '1 Meal',
    type: 'trial',
    description: 'Experience our kitchen\'s quality, freshness, and taste before subscribing.',
    features: [
      'Full lunch or dinner portion',
      'Delivered in disposable containers',
      'Try out the taste first hand',
      'Same premium menu as subscribers',
      'No obligation to subscribe'
    ],
    period: 'Trial'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev_1',
    name: 'Aman Agrawal',
    rating: 5,
    comment: 'Hands down the best tiffin service in Vijay Nagar, Indore! The food is super fresh, hygienic, and tastes exactly like home-cooked meals. The Desi Ghee rotis are incredibly soft.',
    date: 'Yesterday',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'rev_2',
    name: 'Palak Patidar',
    rating: 4,
    comment: "I've tried multiple tiffins in Sheetal Nagar and Vijay Nagar, but Pureaty is by far the most consistent. Clean packing, low on oil, and perfect for daily lunch. Delivery is prompt.",
    date: '4 days ago',
    avatarColor: 'bg-orange-500'
  },
  {
    id: 'rev_3',
    name: 'Rishabh Panchal',
    rating: 5,
    comment: 'Highly satisfied subscriber! Really healthy food with no excess spices. The Friday special paneer and sweet dish are amazing. Highly recommended for professionals in Indore.',
    date: '1 week ago',
    avatarColor: 'bg-teal-600'
  },
  {
    id: 'rev_4',
    name: 'Nisha Dwivedi',
    rating: 4,
    comment: 'Great quality meals. Tastes clean and healthy. Love their dal fry and soft rotis. Best part is the flexible subscription where we can skip meals in the app easily.',
    date: '2 weeks ago',
    avatarColor: 'bg-yellow-600'
  },
  {
    id: 'rev_5',
    name: 'Siddharth Jain',
    rating: 5,
    comment: 'Super hygienic kitchen and premium steel tiffins. It’s hard to find authentic home-cooked taste in Indore when living away from family, but Pureaty makes it easy.',
    date: '3 weeks ago',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'rev_6',
    name: 'Aditya Sharma',
    rating: 4,
    comment: 'Tasty and healthy food. The portion size is very generous, and the menu has a lot of variety throughout the week. Perfect tiffin service.',
    date: '1 month ago',
    avatarColor: 'bg-indigo-600'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'How do I subscribe?',
    answer: 'Choose your preferred plan from our plans section, click "Subscribe Now" to complete your preferences, and contact us through WhatsApp or phone call. We will set up your address and activate your delivery.'
  },
  {
    id: 'faq_2',
    question: 'Can I skip meals?',
    answer: 'Yes! You can easily pause/skip your delivery. To skip lunch, inform us before 9:00 AM. To skip dinner, inform us before 5:00 PM on the same day. Late notifications will count as a consumed meal.'
  },
  {
    id: 'faq_3',
    question: 'Is Sunday service available?',
    answer: 'No, Sunday is our weekly holiday for our kitchen and delivery staff. We operate and deliver from Monday to Saturday.'
  },
  {
    id: 'faq_4',
    question: 'What payment methods do you accept?',
    answer: 'We accept payments through all UPI apps (Google Pay, PhonePe, Paytm), Cash on delivery/activation, Net Banking, and Direct Bank Transfers. All subscription payments are collected full in advance.'
  },
  {
    id: 'faq_5',
    question: 'Is payment monthly?',
    answer: 'Yes. Full subscription payment is collected in advance before activating your daily tiffin delivery. For single/daily meals, same-day digital payment or COD is accepted.'
  },
  {
    id: 'faq_6',
    question: 'What is the grace period on monthly plans?',
    answer: 'Our monthly plans come with a 7-day grace period. This means if you skip a few meals, your monthly subscription validity can be extended up to an extra 7 days so you don\'t lose money!'
  }
];

export const TIFFIN_INCLUSIONS = [
  {
    title: '5 Desi Ghee Rotis',
    description: 'Freshly puffed, whole wheat rotis smeared with pure desi cow ghee. Always soft and wholesome.',
    icon: '🥖'
  },
  {
    title: 'Basmati Rice',
    description: 'Premium quality aromatic long-grain Basmati rice, cooked perfectly fluffy and non-sticky.',
    icon: '🍚'
  },
  {
    title: 'Fresh Dal',
    description: 'High-protein cooked lentils cooked daily with fresh ginger, garlic, tomatoes, and organic spices.',
    icon: '🥣'
  },
  {
    title: 'Seasonal Sabji',
    description: 'Nutritious vegetable curries prepared daily using fresh green markets produce and authentic Indian spices.',
    icon: '🥗'
  },
  {
    title: 'Fresh Salad',
    description: 'Clean, crisp, and hygienic salad comprising cucumber, carrots, beetroots, onions, and fresh lemon slices.',
    icon: '🥒'
  },
  {
    title: 'Homemade Achar',
    description: 'Traditional grandma-style tangy pickles made in mustard oil to elevate the meal experience.',
    icon: '🌶️'
  }
];

export const CORE_FEATURES = [
  {
    title: 'Fresh Homemade Food',
    description: 'Prepared exactly like home, low on oil and high on nutrition with no preservatives.',
    icon: 'home'
  },
  {
    title: 'Prepared Daily',
    description: 'We source ingredients and cook everything fresh every morning and evening. Never frozen.',
    icon: 'clock'
  },
  {
    title: 'Hygienic Kitchen',
    description: 'Strict cleanliness guidelines, sanitized spaces, double-washed vegetables, and hairnets.',
    icon: 'sparkles'
  },
  {
    title: 'Desi Ghee Rotis',
    description: 'Our standard rotis are prepared from whole wheat flour and topped with standard pure cow ghee.',
    icon: 'chef-hat'
  },
  {
    title: 'Premium Quality Ingredients',
    description: 'Premium basmati rice, high-grade whole wheat flour, and branded fresh cold-pressed oils.',
    icon: 'award'
  },
  {
    title: 'Affordable Subscription Plans',
    description: 'Starting at only ₹1900/month with extra days of grace period for meal skips.',
    icon: 'trending-up'
  },
  {
    title: 'Timely Delivery',
    description: 'Insulated delivery boxes ensure hot and fresh meals arrive right at your doorstep.',
    icon: 'truck'
  },
  {
    title: 'Customer Satisfaction',
    description: '4.5 stars average rating with 90+ verified Google reviews and responsive support over WhatsApp.',
    icon: 'smile'
  }
];
