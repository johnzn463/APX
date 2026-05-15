import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { User, CartItem, Plan, ActivityLog, Coupon } from '../types';
import {
  secureData,
  createSession,
  getSession,
  clearSession,
  saveSession,
  isSessionValid,
  verifyAdminCredentials,
} from '../utils/security';

interface AppContextType {
  user: User | null;
  cart: CartItem[];
  logs: ActivityLog[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  isCartOpen: boolean;
  currentPage: 'login' | 'products' | 'admin';
  siteOnline: boolean;
  isAdmin: boolean;
  login: (email: string, name: string, asAdmin?: boolean) => void;
  logout: () => void;
  addToCart: (plan: Plan) => void;
  removeFromCart: (planId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  setCurrentPage: (page: 'login' | 'products' | 'admin') => void;
  addLog: (action: ActivityLog['action'], details: string) => void;
  checkout: () => void;
  cancelPurchase: (planId: string) => void;
  toggleSite: () => void;
  addCoupon: (code: string, discount: number) => boolean;
  updateCoupon: (id: string, code: string, discount: number) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  checkSession: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Session check interval (every 1 minute)
const SESSION_CHECK_INTERVAL = 60 * 1000;

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>(() => secureData.getLogs() as ActivityLog[]);
  const [coupons, setCoupons] = useState<Coupon[]>(() => secureData.getCoupons() as Coupon[]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'login' | 'products' | 'admin'>('login');
  const [siteOnline, setSiteOnline] = useState<boolean>(() => secureData.getSiteStatus());

  // ─── SESSION RESTORATION & MONITORING ────────────────────────────────────────
  useEffect(() => {
    // Try to restore session on mount
    const session = getSession();
    if (session && isSessionValid(session)) {
      setUser({
        email: session.email,
        name: session.name,
        loginTime: session.loginTime,
      });
      // Check if it was an admin session
      if (session.email === 'admin') {
        setIsAdmin(true);
        setCurrentPage('admin');
      } else {
        setCurrentPage('products');
      }
    }
  }, []);

  // Session expiration check
  useEffect(() => {
    const interval = setInterval(() => {
      const session = getSession();
      if (user && !isSessionValid(session)) {
        // Session expired, logout
        logout();
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  const checkSession = (): boolean => {
    const session = getSession();
    return isSessionValid(session);
  };

  const saveLogs = (newLogs: ActivityLog[]) => {
    setLogs(newLogs);
    secureData.saveLogs(newLogs);
  };

  const saveCoupons = (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    secureData.saveCoupons(newCoupons);
  };

  const addLog = useCallback(
    (action: ActivityLog['action'], details: string) => {
      const newLog: ActivityLog = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        userEmail: user?.email || 'unknown',
        userName: user?.name || 'Desconhecido',
        action,
        details,
        timestamp: new Date().toLocaleString('pt-BR'),
      };
      const updated = [newLog, ...logs];
      saveLogs(updated);
    },
    [user, logs]
  );

  const login = (email: string, name: string, asAdmin = false) => {
    const newUser = { email, name, loginTime: new Date().toLocaleString('pt-BR') };
    setUser(newUser);
    setIsAdmin(asAdmin);
    
    // Create and save secure session
    const session = createSession(asAdmin ? 'admin' : email, name);
    saveSession(session);
    
    if (asAdmin) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('products');
      // Log only for non-admin users
      const loginLog: ActivityLog = {
        id: Date.now().toString(),
        userEmail: email,
        userName: name,
        action: 'login',
        details: `Usuário ${name} (${email}) entrou no site`,
        timestamp: new Date().toLocaleString('pt-BR'),
      };
      const updated = [loginLog, ...logs];
      saveLogs(updated);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setCart([]);
    setAppliedCoupon(null);
    setCurrentPage('login');
    setIsCartOpen(false);
    clearSession();
  };

  const addToCart = (plan: Plan) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.plan.id === plan.id);
      if (exists) {
        return prev.map((item) =>
          item.plan.id === plan.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { plan, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (planId: string) => {
    setCart((prev) => prev.filter((item) => item.plan.id !== planId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const setCartOpen = (open: boolean) => setIsCartOpen(open);

  const checkout = () => {
    if (!user || cart.length === 0) return;
    const items = cart.map((i) => `${i.plan.name} (x${i.quantity})`).join(', ');
    const subtotal = cart.reduce((sum, i) => sum + i.plan.price * i.quantity, 0);
    const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
    const total = subtotal - discount;

    if (appliedCoupon) {
      const updatedCoupons = coupons.map((c) =>
        c.id === appliedCoupon.id ? { ...c, usageCount: c.usageCount + 1 } : c
      );
      saveCoupons(updatedCoupons);
    }

    const couponInfo = appliedCoupon
      ? `\n🎟️ Cupom: ${appliedCoupon.code} (-${appliedCoupon.discount}%)`
      : '';

    addLog(
      'purchase',
      `Comprou: ${items}${appliedCoupon ? ` | Cupom: ${appliedCoupon.code} (-${appliedCoupon.discount}%)` : ''} - Total: R$${total.toFixed(2)}`
    );

    const msg = encodeURIComponent(
      `Olá! Sou ${user.name} (${user.email}).\n\nQuero finalizar minha compra:\n${cart
        .map((i) => `• ${i.plan.name} (x${i.quantity}) - R$${(i.plan.price * i.quantity).toFixed(2)}`)
        .join('\n')}${couponInfo}\n\nTotal: R$${total.toFixed(2)}`
    );
    window.open(`https://wa.me/5571992773339?text=${msg}`, '_blank');
    setCart([]);
    setAppliedCoupon(null);
    setIsCartOpen(false);
  };

  const cancelPurchase = (planId: string) => {
    const item = cart.find((i) => i.plan.id === planId);
    if (item) {
      addLog('cancel', `Cancelou: ${item.plan.name}`);
      removeFromCart(planId);
    }
  };

  const toggleSite = () => {
    const newState = !siteOnline;
    setSiteOnline(newState);
    secureData.saveSiteStatus(newState);
  };

  // ─── COUPON METHODS ──────────────────────────────────────────────────────────

  const addCoupon = (code: string, discount: number): boolean => {
    const normalizedCode = code.toUpperCase().trim();
    if (coupons.some((c) => c.code === normalizedCode)) {
      return false;
    }
    const newCoupon: Coupon = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      code: normalizedCode,
      discount: Math.min(100, Math.max(0, discount)),
      active: true,
      usageCount: 0,
      createdAt: new Date().toLocaleString('pt-BR'),
    };
    saveCoupons([...coupons, newCoupon]);
    return true;
  };

  const updateCoupon = (id: string, code: string, discount: number) => {
    const normalizedCode = code.toUpperCase().trim();
    const updated = coupons.map((c) =>
      c.id === id
        ? { ...c, code: normalizedCode, discount: Math.min(100, Math.max(0, discount)) }
        : c
    );
    saveCoupons(updated);
    if (appliedCoupon?.id === id) {
      setAppliedCoupon({ ...appliedCoupon, code: normalizedCode, discount });
    }
  };

  const deleteCoupon = (id: string) => {
    saveCoupons(coupons.filter((c) => c.id !== id));
    if (appliedCoupon?.id === id) {
      setAppliedCoupon(null);
    }
  };

  const toggleCouponActive = (id: string) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    saveCoupons(updated);
    const coupon = updated.find((c) => c.id === id);
    if (appliedCoupon?.id === id && !coupon?.active) {
      setAppliedCoupon(null);
    }
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const normalizedCode = code.toUpperCase().trim();
    if (!normalizedCode) {
      return { success: false, message: 'Digite um código de cupom.' };
    }
    const coupon = coupons.find((c) => c.code === normalizedCode);
    if (!coupon) {
      return { success: false, message: 'Cupom não encontrado.' };
    }
    if (!coupon.active) {
      return { success: false, message: 'Este cupom está inativo.' };
    }
    setAppliedCoupon(coupon);
    return { success: true, message: `Cupom aplicado! ${coupon.discount}% de desconto.` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        logs,
        coupons,
        appliedCoupon,
        isCartOpen,
        currentPage,
        siteOnline,
        isAdmin,
        login,
        logout,
        addToCart,
        removeFromCart,
        clearCart,
        toggleCart,
        setCartOpen,
        setCurrentPage,
        addLog,
        checkout,
        cancelPurchase,
        toggleSite,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponActive,
        applyCoupon,
        removeCoupon,
        checkSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Export admin verification function for login page
export { verifyAdminCredentials };
