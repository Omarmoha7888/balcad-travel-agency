/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, ChatSession, AdminUser, Advertisement, Message } from '../types';

// Default Super Admin seeded on first-time initialization
const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: "super-1",
  fullName: "Maamulaha Sare (Super Admin)",
  phone: "0612483838",
  email: "balcadtravel@gmail.com",
  username: "superadmin",
  passwordHash: "123", // Default password '123' (as requested)
  role: "super",
  createdAt: new Date().toISOString()
};

// Initial default active ads to show some beauty from start
const DEFAULT_ADS: Advertisement[] = [
  {
    id: "ad-1",
    title: "Cumro iyo Xaj Aad u Qurux Badan",
    description: "Xirmooyinka Xajka iyo Cumrada oo dhammaystiran: Huteelo u dhow Xaramka, diyaarad toos ah, iyo adeeg fiiso oo fudud.",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=800",
    createdAt: new Date().toISOString()
  },
  {
    id: "ad-2",
    title: "Dalxiiska Turkiga (Istanbul)",
    description: "U safar magaalada taariikhiga ah ee Istanbul! 7 maalmood oo ka kooban huteel, tikidh, iyo meelaha ugu quruxda badan oo la booqanayo.",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=800",
    createdAt: new Date().toISOString()
  }
];

// Helper functions for localStorage syncing
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger standard custom event for same-window syncing
    window.dispatchEvent(new Event('db-update'));
  } catch (e) {
    console.error("Local storage save error", e);
  }
}

export const LocalDB = {
  // --- Admin Users Management ---
  getAdmins(): AdminUser[] {
    const admins = getStored<AdminUser[]>('balcad_admins', [DEFAULT_SUPER_ADMIN]);
    return admins;
  },

  setAdmins(admins: AdminUser[]) {
    setStored('balcad_admins', admins);
  },

  registerAdmin(newAdmin: Omit<AdminUser, 'id' | 'createdAt' | 'passwordHash'> & { initialPassword?: string }): AdminUser {
    const admins = this.getAdmins();
    const createdAdmin: AdminUser = {
      ...newAdmin,
      id: "admin_" + Math.random().toString(36).substring(2, 11),
      passwordHash: newAdmin.initialPassword || "123", // default password
      createdAt: new Date().toISOString()
    };
    admins.push(createdAdmin);
    this.setAdmins(admins);
    return createdAdmin;
  },

  deleteAdmin(targetId: string, actorRole: string): boolean {
    if (actorRole !== 'super') {
      return false; // Strict rule: only super admin can delete
    }
    let admins = this.getAdmins();
    // Super-1 is locked / cannot be deleted
    admins = admins.filter(admin => admin.id !== targetId || admin.id === 'super-1');
    this.setAdmins(admins);
    return true;
  },

  updateAdminProfile(adminId: string, newUsername: string, newPassword?: string): boolean {
    const admins = this.getAdmins();
    const idx = admins.findIndex(a => a.id === adminId);
    if (idx !== -1) {
      admins[idx].username = newUsername;
      if (newPassword) {
        admins[idx].passwordHash = newPassword;
      }
      this.setAdmins(admins);
      // Update currently stored session if matching
      const currentSession = this.getActiveSession();
      if (currentSession && currentSession.id === adminId) {
        currentSession.username = newUsername;
        this.saveActiveSession(currentSession);
      }
      return true;
    }
    return false;
  },

  // --- Session Storage (Active logged-in Admin) ---
  getActiveSession(): AdminUser | null {
    const sessionAdmin = getStored<AdminUser | null>('balcad_admin_session', null);
    if (!sessionAdmin) return null;
    
    // Check if user still exists to fulfill strict delete rule
    const allAdmins = this.getAdmins();
    const valid = allAdmins.some(a => a.id === sessionAdmin.id);
    if (!valid) {
      // Clear session if they were deleted by Super Admin!
      this.clearSession();
      return null;
    }
    return sessionAdmin;
  },

  saveActiveSession(admin: AdminUser): void {
    setStored('balcad_admin_session', admin);
  },

  clearSession(): void {
    localStorage.removeItem('balcad_admin_session');
    window.dispatchEvent(new Event('db-update'));
  },

  // --- Orders Management ---
  getOrders(): Order[] {
    return getStored<Order[]>('balcad_orders', []);
  },

  setOrders(orders: Order[]): void {
    setStored('balcad_orders', orders);
  },

  createOrder(type: Order['type'], data: Order['data']): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      id: "order_" + Math.random().toString(36).substring(2, 11),
      type,
      data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder); // Add to beginning of array
    this.setOrders(orders);
    return newOrder;
  },

  deleteOrder(id: string): void {
    const orders = this.getOrders();
    const updated = orders.filter(o => o.id !== id);
    this.setOrders(updated);
  },

  // --- Live Chats Management ---
  getChats(): ChatSession[] {
    return getStored<ChatSession[]>('balcad_chats', []);
  },

  setChats(chats: ChatSession[]): void {
    setStored('balcad_chats', chats);
  },

  startChat(userName: string, userPhone: string, userEmail: string): ChatSession {
    const chats = this.getChats();
    const timestamp = new Date().toISOString();
    const newSession: ChatSession = {
      id: "chat_" + Math.random().toString(36).substring(2, 11),
      userName,
      userPhone,
      userEmail,
      messages: [
        {
          id: "m_welcome",
          sender: "admin",
          text: `Asc, Soo dhawoow ${userName}! Balcad Travel Agency waa diyaar si ay kuu caawiso. Sideen kuu caawinnaa maanta?`,
          createdAt: timestamp
        }
      ],
      active: true,
      startedAt: timestamp,
      lastMessageAt: timestamp
    };
    chats.unshift(newSession);
    this.setChats(chats);
    return newSession;
  },

  addMessageToChat(chatId: string, sender: 'user' | 'admin' | 'ai'; text?: string, image?: string): ChatSession | null {
    const chats = this.getChats();
    const idx = chats.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      const timestamp = new Date().toISOString();
      const newMessage: Message = {
        id: "m_" + Math.random().toString(36).substring(2, 11),
        sender,
        text,
        image,
        createdAt: timestamp
      };
      
      const session = chats[idx];
      // Only append if the chat is still active OR if sender is admin reviving it
      if (session.active || sender === 'admin') {
        session.messages.push(newMessage);
        session.lastMessageAt = timestamp;
        // Make sure it remains active if Admin replies
        if (sender === 'admin') {
          session.active = true;
        }
        chats[idx] = session;
        this.setChats(chats);
        return session;
      }
    }
    return null;
  },

  assignChatToAdmin(chatId: string, adminId: string, adminName: string): boolean {
    const chats = this.getChats();
    const idx = chats.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      const session = chats[idx];
      if (session.assignedAdminId && session.assignedAdminId !== adminId) {
        return false; // Alreay assigned to someone else
      }
      session.assignedAdminId = adminId;
      session.assignedAdminName = adminName;
      chats[idx] = session;
      this.setChats(chats);
      return true;
    }
    return false;
  },

  // Close chat (user side clears active state and will be removed from admin UI list)
  closeChat(chatId: string): void {
    const chats = this.getChats();
    const idx = chats.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      chats[idx].active = false;
      this.setChats(chats);
    }
  },

  // --- Advertisements (Ads) Management ---
  getAds(): Advertisement[] {
    return getStored<Advertisement[]>('balcad_ads', DEFAULT_ADS);
  },

  setAds(ads: Advertisement[]): void {
    setStored('balcad_ads', ads);
  },

  createAd(title: string, description: string, imageBase64: string): Advertisement {
    const ads = this.getAds();
    const newAd: Advertisement = {
      id: "ad_" + Math.random().toString(36).substring(2, 11),
      title,
      description,
      image: imageBase64,
      createdAt: new Date().toISOString()
    };
    ads.unshift(newAd);
    this.setAds(ads);
    return newAd;
  },

  deleteAd(id: string): void {
    const ads = this.getAds();
    const updated = ads.filter(ad => ad.id !== id);
    this.setAds(updated);
  }
};

// Simple utility hook for live syncing components inside same tab OR across tabs
export function subscribeToDBUpdates(callback: () => void) {
  const handleUpdate = () => callback();
  window.addEventListener('db-update', handleUpdate);
  window.addEventListener('storage', handleUpdate); // Handles cross-tab sync!
  
  return () => {
    window.removeEventListener('db-update', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}
