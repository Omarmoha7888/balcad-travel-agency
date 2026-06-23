/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, ChatSession, AdminUser, Advertisement, ChatMessage } from '../types';

const STORAGE_KEYS = {
  ORDERS: 'balcad_orders',
  CHATS: 'balcad_chats',
  ADMINS: 'balcad_admins',
  ADS: 'balcad_ads',
  ACTIVE_ADMIN: 'balcad_active_admin',
};

// Seed baseline superadmin and sample ads
const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'super-1',
    fullName: 'Hussein Mohamud Ali ,
    phone: '0615501050',
    email: 'balcadtravel@gmail.com',
    username: 'Xuseen',
    passwordHash: 'admin',
    role: 'super',
  }
];

const DEFAULT_ADS: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'Xirmo Dalxiis oo Gaar ah: Dubai & Turkey',
    description: 'Booqasho 7 maalmood ah oo aad ku xulanayso huteelada ugu fiican, safar dalxiis, iyo fududeynta fiisaha oo dhameystiran. Dalbo hadda!',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=400',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-2',
    title: 'Ciraaq & Sacuudiga (Cumro & Xaj)',
    description: 'Ku geyso goobaha barakeysan adigoo helaya barbaarinta iyo adeegyada ugu tayada sarreeya ee Balcad Travel Agency.',
    image: 'https://images.unsplash.com/photo-1564769625905-50e9ad63ee9f?auto=format&fit=crop&q=80&w=400',
    createdAt: new Date().toISOString()
  }
];

// Callbacks for change notifications
const DB_LISTENERS = new Set<() => void>();

export function subscribeToDBUpdates(listener: () => void): () => void {
  DB_LISTENERS.add(listener);
  return () => {
    DB_LISTENERS.delete(listener);
  };
}

function notifyDBListeners() {
  DB_LISTENERS.forEach(cb => {
    try { cb(); } catch (e) { console.error(e); }
  });
  // Notify other windows/tabs
  window.dispatchEvent(new Event('storage'));
}

// Global Storage Change Sync Setup
if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    DB_LISTENERS.forEach(cb => cb());
  });
}

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyDBListeners();
  } catch (e) {
    console.error('Failed to write storage key:', key, e);
  }
}

export const LocalDB = {
  // Orders Area
  getOrders(): Order[] {
    const rawOrders = getStored<Order[]>(STORAGE_KEYS.ORDERS, []);
    return rawOrders.map(o => ({
      ...o,
      status: o.status || 'processing'
    }));
  },

  createOrder(type: Order['type'], data: any): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      id: 'ord-' + Math.random().toString(36).substring(2, 9),
      type,
      status: 'processing',
      createdAt: new Date().toISOString(),
      data,
    };
    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  updateOrderStatus(id: string, status: Order['status'], admin?: AdminUser) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      if (admin) {
        order.resolvedByAdminId = admin.id;
        order.resolvedByAdminName = admin.fullName;
        order.resolvedByAdminPhone = admin.phone;
        order.resolvedByAdminEmail = admin.email;
      }
      setStored(STORAGE_KEYS.ORDERS, orders);
    }
  },

  cancelOrder(id: string): boolean {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === id);
    if (order && order.status === 'processing') {
      order.status = 'canceled';
      setStored(STORAGE_KEYS.ORDERS, orders);
      return true;
    }
    return false;
  },

  deleteOrder(id: string) {
    const orders = this.getOrders();
    const updated = orders.filter(o => o.id !== id);
    setStored(STORAGE_KEYS.ORDERS, updated);
  },

  // Chats Support Area
  getChats(): ChatSession[] {
    return getStored<ChatSession[]>(STORAGE_KEYS.CHATS, []);
  },

  startChat(userName: string, userPhone: string, userEmail: string): ChatSession {
    const chats = this.getChats();
    // De-activate existing active chats for same email/number to keep session clean
    chats.forEach(c => {
      if (c.userEmail === userEmail || c.userPhone === userPhone) {
        c.active = false;
      }
    });

    const newSession: ChatSession = {
      id: 'chat-' + Math.random().toString(36).substring(2, 9),
      userName,
      userPhone,
      userEmail,
      active: true,
      messages: [
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Soodhawow macamiil ${userName}! Anigu waxaan ahay kaaliyaha rasmiga ah ee Balcad Travel Agency. Waxaan diyaar kuugu nahay inaan kaa caawino dhammaan su'aalaha ku saabsan tikidhada, huteelada, iyo fiisada. Sideen kuugu caawin karnaa maanta?`,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    chats.unshift(newSession);
    setStored(STORAGE_KEYS.CHATS, chats);
    return newSession;
  },

  addMessageToChat(chatId: string, sender: ChatMessage['sender'], text?: string, image?: string): ChatSession | null {
    const chats = this.getChats();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return null;

    const newMsg: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      sender,
      text,
      image,
      createdAt: new Date().toISOString()
    };

    chat.messages.push(newMsg);
    setStored(STORAGE_KEYS.CHATS, chats);
    return chat;
  },

  assignChatToAdmin(chatId: string, adminId: string, adminName: string) {
    const chats = this.getChats();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.assignedAdminId = adminId;
      chat.assignedAdminName = adminName;
      setStored(STORAGE_KEYS.CHATS, chats);
    }
  },

  closeChat(chatId: string) {
    const chats = this.getChats();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.active = false;
      setStored(STORAGE_KEYS.CHATS, chats);
    }
  },

  // Advertisements Setup
  getAds(): Advertisement[] {
    return getStored<Advertisement[]>(STORAGE_KEYS.ADS, DEFAULT_ADS);
  },

  createAd(title: string, description: string, image: string): Advertisement {
    const ads = this.getAds();
    const newAd: Advertisement = {
      id: 'ad-' + Math.random().toString(36).substring(2, 9),
      title,
      description,
      image,
      createdAt: new Date().toISOString(),
    };
    ads.unshift(newAd);
    setStored(STORAGE_KEYS.ADS, ads);
    return newAd;
  },

  deleteAd(id: string) {
    const ads = this.getAds();
    const updated = ads.filter(a => a.id !== id);
    setStored(STORAGE_KEYS.ADS, updated);
  },

  // Administrators Accounts Registry
  getAdmins(): AdminUser[] {
    return getStored<AdminUser[]>(STORAGE_KEYS.ADMINS, DEFAULT_ADMINS);
  },

  registerAdmin(param: {
    fullName: string;
    phone: string;
    email: string;
    username: string;
    role: 'sub' | 'super';
    createdBy: string;
    initialPassword?: string;
  }): AdminUser {
    const admins = this.getAdmins();
    const newUser: AdminUser = {
      id: 'adm-' + Math.random().toString(36).substring(2, 9),
      fullName: param.fullName,
      phone: param.phone,
      email: param.email,
      username: param.username.toLowerCase(),
      passwordHash: param.initialPassword || 'balcad123',
      role: param.role,
      createdBy: param.createdBy,
    };
    admins.push(newUser);
    setStored(STORAGE_KEYS.ADMINS, admins);
    return newUser;
  },

  deleteAdmin(id: string, requesterRole: 'super'): boolean {
    if (requesterRole !== 'super') return false;
    const admins = this.getAdmins();
    const filtered = admins.filter(a => a.id !== id);
    setStored(STORAGE_KEYS.ADMINS, filtered);
    return true;
  },

  updateAdminProfile(id: string, username: string, passwordHash?: string): boolean {
    const admins = this.getAdmins();
    const admin = admins.find(a => a.id === id);
    if (!admin) return false;

    admin.username = username.toLowerCase();
    if (passwordHash) {
      admin.passwordHash = passwordHash;
    }

    setStored(STORAGE_KEYS.ADMINS, admins);

    // If updating active logged in session
    const active = this.getActiveSession();
    if (active && active.id === id) {
      active.username = username;
      if (passwordHash) active.passwordHash = passwordHash;
      this.saveActiveSession(active);
    }
    return true;
  },

  // Current session storage
  getActiveSession(): AdminUser | null {
    return getStored<AdminUser | null>(STORAGE_KEYS.ACTIVE_ADMIN, null);
  },

  saveActiveSession(admin: AdminUser) {
    setStored(STORAGE_KEYS.ACTIVE_ADMIN, admin);
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ADMIN);
    notifyDBListeners();
  }
};
