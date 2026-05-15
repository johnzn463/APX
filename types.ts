export interface User {
  email: string;
  name: string;
  loginTime: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  image: string;
  badge: string;
  badgeColor: string;
  features: string[];
  description: string;
  groups: number;
  messages: string;
  support: string;
}

export interface CartItem {
  plan: Plan;
  quantity: number;
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  userName: string;
  action: 'login' | 'purchase' | 'cancel';
  details: string;
  timestamp: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number; // percentage 0-100
  active: boolean;
  usageCount: number;
  createdAt: string;
}
