import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Order, SkipRecord } from '../types';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from '../lib/firebase';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  skipRecords: SkipRecord[];
  activeTrackedOrder: Order | null;
  trackingStep: number;
  
  // Auth actions
  login: (email: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  register: (name: string, email: string, phone: string, address: string, landmark?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string, address: string, landmark?: string) => Promise<void>;
  
  // Sub & Orders
  placeOrder: (orderData: Omit<Order, 'id' | 'userId' | 'userName' | 'userPhone' | 'paymentStatus' | 'orderStatus' | 'eta' | 'createdAt' | 'transactionId'>) => Promise<Order>;
  cancelSubscription: () => Promise<void>;
  
  // Skip meals
  addSkipRecord: (date: string, mealPreference: 'lunch' | 'dinner' | 'both') => Promise<boolean>;
  removeSkipRecord: (date: string) => Promise<void>;
  
  // Tracking
  startTracking: (order: Order) => void;
  stopTracking: () => void;
  setTrackingStep: React.Dispatch<React.SetStateAction<number>>;

  // Admin actions
  adminUpdateOrderStatus: (orderId: string, status: Order['orderStatus'], eta: string) => Promise<void>;
  adminSetUserPlan: (userId: string, planId: string | null, planName: string | null, mealsCount: number, subscriptionExpiresAt?: string | null) => Promise<void>;
  adminCreateUserSubscription: (userData: Omit<User, 'isAdmin'>) => Promise<void>;
  adminUpdateUserSubscription: (userId: string, updates: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getExpiryOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Initial Seed Data for testing/fallbacks (Only Admin account initialized)
const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'PUREATY Admin',
    email: 'admin@pureaty.com',
    phone: '9399372194',
    address: 'Scheme No. 54, Kitchen Headquarters, Vijay Nagar, Indore',
    isAdmin: true,
    createdAt: '2026-06-01T08:00:00Z'
  }
];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_SKIPS: SkipRecord[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [skipRecords, setSkipRecords] = useState<SkipRecord[]>(INITIAL_SKIPS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [activeTrackedOrder, setActiveTrackedOrder] = useState<Order | null>(null);
  const [trackingStep, setTrackingStep] = useState<number>(0);

  // 1. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Logged in via Firebase Auth
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        let userData: User;

        if (userDoc.exists()) {
          userData = userDoc.data() as User;
        } else {
          // If register wasn't explicitly called (e.g. Google Sign-In first time)
          const defaultUser = INITIAL_USERS.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
          userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || defaultUser?.name || 'Customer User',
            email: firebaseUser.email || '',
            phone: defaultUser?.phone || '9988776655',
            address: defaultUser?.address || 'Vijay Nagar, Indore',
            landmark: defaultUser?.landmark || '',
            isAdmin: firebaseUser.email === 'admin@pureaty.com',
            activePlanId: defaultUser?.activePlanId || null,
            activePlanName: defaultUser?.activePlanName || null,
            mealsRemaining: defaultUser?.mealsRemaining || 0,
            totalPaid: defaultUser?.totalPaid || 0,
            createdAt: defaultUser?.createdAt || new Date().toISOString(),
            subscriptionExpiresAt: defaultUser?.subscriptionExpiresAt || null
          };
          await setDoc(userDocRef, userData);
        }

        setCurrentUser(userData);
        localStorage.setItem('fm_current_user', JSON.stringify(userData));
      } else {
        // No Firebase user logged in
        setCurrentUser(null);
        localStorage.removeItem('fm_current_user');
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore synchronization for collections based on active user role
  useEffect(() => {
    if (!currentUser) return;

    let unsubUsers = () => {};
    let unsubOrders = () => {};
    let unsubSkips = () => {};

    // Initial database seed for clean demonstration if Firestore is empty
    const seedFirestoreIfEmpty = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
          // Seed INITIAL_USERS (Only Admin)
          for (const u of INITIAL_USERS) {
            await setDoc(doc(db, 'users', u.id), u);
          }
        } else {
          // Clean up old demo sample customer documents if present
          const demoUserIds = ['usr_test', 'usr_customer2', 'usr_customer3', 'usr_customer4', 'usr_customer5'];
          for (const id of demoUserIds) {
            const ref = doc(db, 'users', id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              await deleteDoc(ref);
            }
          }
          const demoOrderIds = ['ord_1001', 'ord_1002'];
          for (const id of demoOrderIds) {
            const ref = doc(db, 'orders', id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              await deleteDoc(ref);
            }
          }
        }
      } catch (err) {
        console.error('Error seeding Firestore:', err);
      }
    };
    seedFirestoreIfEmpty();

    if (currentUser.isAdmin) {
      // Admins listen to all documents
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const list: User[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as User);
        });
        setUsers(list);
      });

      unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Order);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
      });

      unsubSkips = onSnapshot(collection(db, 'skip_records'), (snapshot) => {
        const list: SkipRecord[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as SkipRecord);
        });
        setSkipRecords(list);
      });
    } else {
      // Customers listen to their own documents
      unsubUsers = onSnapshot(doc(db, 'users', currentUser.id), (docSnap) => {
        if (docSnap.exists()) {
          const freshData = docSnap.data() as User;
          setCurrentUser(freshData);
          setUsers(prev => prev.map(u => u.id === freshData.id ? freshData : u));
        }
      });

      const ordersQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.id));
      unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Order);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
      });

      const skipsQuery = query(collection(db, 'skip_records'), where('userId', '==', currentUser.id));
      unsubSkips = onSnapshot(skipsQuery, (snapshot) => {
        const list: SkipRecord[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as SkipRecord);
        });
        setSkipRecords(list);
      });
    }

    return () => {
      unsubUsers();
      unsubOrders();
      unsubSkips();
    };
  }, [currentUser?.id, currentUser?.isAdmin]);

  // Simulate vehicle progress for active tracked order
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTrackedOrder && (activeTrackedOrder.orderStatus === 'dispatched' || activeTrackedOrder.orderStatus === 'near_sector')) {
      interval = setInterval(async () => {
        setTrackingStep(prev => {
          if (prev < 4) {
            return prev + 1;
          } else {
            // Once reached, mark as delivered in Firestore and locally
            const orderId = activeTrackedOrder.id;
            const updatedData = { orderStatus: 'delivered' as const, eta: '0 mins' };
            
            // Async write to Firestore
            updateDoc(doc(db, 'orders', orderId), updatedData).catch(err => console.error(err));
            
            setActiveTrackedOrder(prevOrder => prevOrder ? { ...prevOrder, orderStatus: 'delivered', eta: '0 mins' } : null);
            clearInterval(interval);
            return 4;
          }
        });
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTrackedOrder]);

  // Keep active tracked order up to date if modified in list
  useEffect(() => {
    if (activeTrackedOrder) {
      const live = orders.find(o => o.id === activeTrackedOrder.id);
      if (live && live.orderStatus !== activeTrackedOrder.orderStatus) {
        setActiveTrackedOrder(live);
      }
    }
  }, [orders, activeTrackedOrder]);

  // Action: Sign In with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      let userData: User;

      if (userDoc.exists()) {
        userData = userDoc.data() as User;
      } else {
        const defaultUser = INITIAL_USERS.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
        userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || defaultUser?.name || 'Customer User',
          email: firebaseUser.email || '',
          phone: defaultUser?.phone || '9988776655',
          address: defaultUser?.address || 'Vijay Nagar, Indore',
          landmark: defaultUser?.landmark || '',
          isAdmin: firebaseUser.email === 'admin@pureaty.com',
          activePlanId: defaultUser?.activePlanId || null,
          activePlanName: defaultUser?.activePlanName || null,
          mealsRemaining: defaultUser?.mealsRemaining || 0,
          totalPaid: defaultUser?.totalPaid || 0,
          createdAt: new Date().toISOString(),
          subscriptionExpiresAt: defaultUser?.subscriptionExpiresAt || null
        };
        await setDoc(userDocRef, userData);
      }

      setCurrentUser(userData);
    } catch (err) {
      console.error('Google sign in error:', err);
      throw err;
    }
  };

  // Action: Custom Email Sign In
  const login = async (email: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user exists in local state, Firestore, or fallback seeds
    let foundUser: User | null = null;
    
    // 1. Search in memory
    const memoryUser = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (memoryUser) {
      foundUser = memoryUser;
    } else {
      // 2. Search in Firestore
      try {
        const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          foundUser = qSnap.docs[0].data() as User;
        } else {
          // 3. Fallback check seed accounts
          const seed = INITIAL_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
          if (seed) {
            foundUser = seed;
            // Instantly save to Firestore
            await setDoc(doc(db, 'users', seed.id), seed);
          }
        }
      } catch (err) {
        console.error('Email login Firestore check error:', err);
      }
    }

    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem('fm_current_user', JSON.stringify(foundUser));
      return true;
    }
    return false; // Not found
  };

  // Action: Registration
  const register = async (
    name: string, 
    email: string, 
    phone: string, 
    address: string, 
    landmark?: string
  ): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if email already taken
    const exists = users.some(u => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return false;
    }

    const newId = `usr_${Math.floor(Math.random() * 100000)}`;
    const newUser: User = {
      id: newId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      address: address.trim(),
      landmark: landmark?.trim() || '',
      isAdmin: normalizedEmail === 'admin@pureaty.com',
      createdAt: new Date().toISOString(),
      activePlanId: null,
      activePlanName: null,
      mealsRemaining: 0,
      totalPaid: 0
    };

    try {
      // Save to Firestore
      await setDoc(doc(db, 'users', newId), newUser);
      setCurrentUser(newUser);
      localStorage.setItem('fm_current_user', JSON.stringify(newUser));
      return true;
    } catch (err) {
      console.error('Registration Firestore error:', err);
      return false;
    }
  };

  // Action: Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setActiveTrackedOrder(null);
      localStorage.removeItem('fm_current_user');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Action: Update profile details
  const updateProfile = async (name: string, phone: string, address: string, landmark?: string) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      landmark: landmark?.trim() || ''
    };

    try {
      await setDoc(doc(db, 'users', currentUser.id), updatedUser);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Update profile Firestore error:', err);
    }
  };

  // Action: Buy Plan / Place Order
  const placeOrder = async (orderData: Omit<Order, 'id' | 'userId' | 'userName' | 'userPhone' | 'paymentStatus' | 'orderStatus' | 'eta' | 'createdAt' | 'transactionId'>): Promise<Order> => {
    const uId = currentUser ? currentUser.id : `usr_guest_${Math.floor(Math.random() * 10000)}`;
    const uName = currentUser ? currentUser.name : 'Guest User';
    const uPhone = currentUser ? currentUser.phone : '9399372194';
    const newOrderId = `ord_${1000 + orders.length + Math.floor(Math.random() * 100)}`;

    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      userId: uId,
      userName: uName,
      userPhone: uPhone,
      paymentStatus: 'paid',
      transactionId: `TXN_${orderData.paymentMethod.toUpperCase()}_${Math.floor(Math.random() * 1000000000)}`,
      orderStatus: 'cooking',
      eta: '25 mins',
      createdAt: new Date().toISOString()
    };

    // Calculate dynamic initial meals remaining
    let meals = 1;
    if (orderData.planId.includes('monthly_single')) meals = 26;
    else if (orderData.planId.includes('monthly_double')) meals = 52;
    else if (orderData.planId.includes('weekly')) meals = 6;
    else if (orderData.planId.includes('trial')) meals = 1;

    try {
      // 1. Write order to Firestore
      await setDoc(doc(db, 'orders', newOrderId), newOrder);

      // 2. Update subscription details in user document
      if (currentUser && uId === currentUser.id) {
        let days = 30;
        if (orderData.planId.includes('weekly')) days = 7;
        else if (orderData.planId.includes('trial')) days = 1;
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        const subscriptionExpiresAt = expiryDate.toISOString();

        const updatedUser: User = {
          ...currentUser,
          activePlanId: orderData.planId,
          activePlanName: orderData.planName,
          mealsRemaining: (currentUser.mealsRemaining || 0) + meals,
          totalPaid: (currentUser.totalPaid || 0) + orderData.price,
          subscriptionExpiresAt: subscriptionExpiresAt
        };
        await setDoc(doc(db, 'users', uId), updatedUser);
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.error('Place order Firestore error:', err);
    }

    return newOrder;
  };

  // Action: Cancel Subscription
  const cancelSubscription = async () => {
    if (!currentUser) return;
    
    const updatedUser: User = {
      ...currentUser,
      activePlanId: null,
      activePlanName: null,
      mealsRemaining: 0
    };

    try {
      await setDoc(doc(db, 'users', currentUser.id), updatedUser);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Cancel sub Firestore error:', err);
    }
  };

  // Action: Add Meal Skip Planner Entry
  const addSkipRecord = async (date: string, mealPreference: 'lunch' | 'dinner' | 'both'): Promise<boolean> => {
    if (!currentUser) return false;

    // Check duplicate skips
    if (skipRecords.some(r => r.userId === currentUser.id && r.date === date)) {
      return false;
    }

    const skipId = `skip_${Math.floor(Math.random() * 100000)}`;
    const newSkip: SkipRecord = {
      id: skipId,
      userId: currentUser.id,
      date,
      mealPreference,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save skip document
      await setDoc(doc(db, 'skip_records', skipId), newSkip);

      // 2. Refund meals remaining in profile
      const updatedUser: User = {
        ...currentUser,
        mealsRemaining: (currentUser.mealsRemaining || 0) + (mealPreference === 'both' ? 2 : 1)
      };
      await setDoc(doc(db, 'users', currentUser.id), updatedUser);
      setCurrentUser(updatedUser);
      return true;
    } catch (err) {
      console.error('Add skip Firestore error:', err);
      return false;
    }
  };

  // Action: Remove Skip Record
  const removeSkipRecord = async (date: string) => {
    if (!currentUser) return;
    const match = skipRecords.find(r => r.userId === currentUser.id && r.date === date);
    if (!match) return;

    try {
      // 1. Delete skip document
      await deleteDoc(doc(db, 'skip_records', match.id));

      // 2. Deduct meals remaining
      const updatedUser: User = {
        ...currentUser,
        mealsRemaining: Math.max(0, (currentUser.mealsRemaining || 0) - (match.mealPreference === 'both' ? 2 : 1))
      };
      await setDoc(doc(db, 'users', currentUser.id), updatedUser);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Remove skip Firestore error:', err);
    }
  };

  // Action Admin: Update Driver Delivery Status
  const adminUpdateOrderStatus = async (orderId: string, status: Order['orderStatus'], eta: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { orderStatus: status, eta });
    } catch (err) {
      console.error('Admin update order error:', err);
    }
  };

  // Action Admin: Assign Custom Subscription Plan
  const adminSetUserPlan = async (userId: string, planId: string | null, planName: string | null, mealsCount: number, subscriptionExpiresAt?: string | null) => {
    try {
      const updates: any = {
        activePlanId: planId,
        activePlanName: planName,
        mealsRemaining: mealsCount
      };
      if (subscriptionExpiresAt !== undefined) {
        updates.subscriptionExpiresAt = subscriptionExpiresAt;
      }
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (err) {
      console.error('Admin set user plan error:', err);
    }
  };

  const adminCreateUserSubscription = async (userData: Omit<User, 'isAdmin'>) => {
    try {
      const uId = userData.id || `usr_${Math.floor(Math.random() * 100000)}`;
      const newUser: User = {
        ...userData,
        id: uId,
        isAdmin: false,
        createdAt: userData.createdAt || new Date().toISOString()
      };
      await setDoc(doc(db, 'users', uId), newUser);
    } catch (err) {
      console.error('Admin create user subscription error:', err);
    }
  };

  const adminUpdateUserSubscription = async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (err) {
      console.error('Admin update user subscription error:', err);
    }
  };

  const startTracking = (order: Order) => {
    setActiveTrackedOrder(order);
    setTrackingStep(0);
  };

  const stopTracking = () => {
    setActiveTrackedOrder(null);
    setTrackingStep(0);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      orders,
      skipRecords,
      activeTrackedOrder,
      trackingStep,
      login,
      signInWithGoogle,
      register,
      logout,
      updateProfile,
      placeOrder,
      cancelSubscription,
      addSkipRecord,
      removeSkipRecord,
      startTracking,
      stopTracking,
      setTrackingStep,
      adminUpdateOrderStatus,
      adminSetUserPlan,
      adminCreateUserSubscription,
      adminUpdateUserSubscription
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

