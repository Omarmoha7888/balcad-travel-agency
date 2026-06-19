/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert, Eye, EyeOff, ClipboardList, MessageSquareCode, ImageUp, 
  UserCog, UserPlus, Trash2, CheckCircle, HelpCircle, LogOut, Check, X, Plane, Hotel, Landmark, Compass, Car, Send, Loader2
} from 'lucide-react';
import { LocalDB, subscribeToDBUpdates } from '../lib/db';
import { Order, ChatSession, AdminUser, Advertisement } from '../types';
import { Logo } from './Logo';

export default function AdminDashboard() {
  const [activeAdmin, setActiveAdmin] = useState<AdminUser | null>(null);
  
  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Sub-tabs in panel
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'live-chats' | 'ads' | 'profile' | 'staff'>('orders');

  // Trigger reactive database synchronization loops
  const [dbTick, setDbTick] = useState(0);

  // Active Chats Support Hub state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");

  // Sub-Admin Registration Form State
  const [regFullName, setRegFullName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("balcad123"); // default initial password
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");

  // Order deletions confirmation dialog state
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);

  // Staff deletions confirmation dialog state
  const [confirmDeleteStaff, setConfirmDeleteStaff] = useState<{ id: string; name: string } | null>(null);

  // Ad deletions confirmation dialog state
  const [confirmDeleteAd, setConfirmDeleteAd] = useState<{ id: string; title: string } | null>(null);

  // Ads Creation Form State
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adImage, setAdImage] = useState<string | null>(null);
  const [isUploadingAdImage, setIsUploadingAdImage] = useState(false);
  const [adSuccessMsg, setAdSuccessMsg] = useState("");
  const [adErrorMsg, setAdErrorMsg] = useState("");

  // Profile management credentials form
  const [profUsername, setProfUsername] = useState("");
  const [profPassword, setProfPassword] = useState("");
  const [showProfPassword, setShowProfPassword] = useState(false);
  const [profSuccess, setProfSuccess] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const adImageInputRef = useRef<HTMLInputElement | null>(null);

  // Sync session and active records
  useEffect(() => {
    const handleSync = () => {
      const session = LocalDB.getActiveSession();
      setActiveAdmin(session);
      
      // Auto-populate profile modifiers
      if (session) {
        setProfUsername(session.username);
      }
      setDbTick(prev => prev + 1);
    };

    handleSync();
    const unsubscribe = subscribeToDBUpdates(handleSync);
    return () => unsubscribe();
  }, []);

  // Soft auto-scrollTo bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, dbTick]);

  // Handle administrator authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!username.trim() || !password.trim()) {
      setLoginError("Fadlan buuxiyo meelaha ku haboon");
      return;
    }

    const allAdmins = LocalDB.getAdmins();
    const foundAdmin = allAdmins.find(
      a => a.username.toLowerCase() === username.trim().toLowerCase() && a.passwordHash === password
    );

    if (foundAdmin) {
      LocalDB.saveActiveSession(foundAdmin);
      setActiveAdmin(foundAdmin);
      setProfUsername(foundAdmin.username);
      setUsername("");
      setPassword("");
    } else {
      // Check if username exists but password failed, or user does not exist indeed
      const userExists = allAdmins.some(a => a.username.toLowerCase() === username.trim().toLowerCase());
      if (userExists) {
        setLoginError("Macaamiil, Password-ka aad galisay waa khalad!");
      } else {
        setLoginError("User-kaan ma ahan mid jira");
      }
    }
  };

  const handleLogout = () => {
    LocalDB.clearSession();
    setActiveAdmin(null);
    setActiveChatId(null);
  };

  // Resolve / delete order triggers
  const triggerDeleteOrder = (orderId: string) => {
    setConfirmDeleteOrderId(orderId);
  };

  const executeDeleteOrder = () => {
    if (confirmDeleteOrderId) {
      LocalDB.deleteOrder(confirmDeleteOrderId);
      setConfirmDeleteOrderId(null);
    }
  };

  // Send admin chat responses
  const handleAdminChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId) return;

    const textPayload = adminReplyText.trim();
    if (!textPayload) return;

    const updated = LocalDB.addMessageToChat(activeChatId, 'admin', textPayload);
    if (updated) {
      setAdminReplyText("");
      setDbTick(prev => prev + 1);
    }
  };

  // Handle Chat selection and assignment
  const handleSelectChat = (chat: ChatSession) => {
    if (!activeAdmin) return;
    // Automatically assign when open if not assigned to anyone yet
    if (!chat.assignedAdminId) {
      LocalDB.assignChatToAdmin(chat.id, activeAdmin.id, activeAdmin.fullName);
    }
    setActiveChatId(chat.id);
  };

  // Convert Advertisement image to base64
  const handleAdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAdImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdImage(reader.result as string);
        setIsUploadingAdImage(false);
      };
      reader.onerror = () => {
        setIsUploadingAdImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Ads creation Form with forced file upload
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    setAdErrorMsg("");
    setAdSuccessMsg("");

    if (!adTitle.trim() || !adDescription.trim()) {
      setAdErrorMsg("Fadlan qor cinwaanka iyo sharaxaadda.");
      return;
    }

    if (!adImage) {
      setAdErrorMsg("Sawirka waa QASAB (Required) si aad u dhigto xayeysiis cusub.");
      return;
    }

    LocalDB.createAd(adTitle.trim(), adDescription.trim(), adImage);
    setAdSuccessMsg("Waad ku guuleystay");
    
    // Clear forms
    setAdTitle("");
    setAdDescription("");
    setAdImage(null);
  };

  // Handle Ad Deletion with custom confirmation dialog
  const handleDeleteAd = (adId: string, title: string) => {
    setConfirmDeleteAd({ id: adId, title });
  };

  const executeDeleteAd = () => {
    if (confirmDeleteAd) {
      LocalDB.deleteAd(confirmDeleteAd.id);
      setConfirmDeleteAd(null);
      setDbTick(prev => prev + 1);
    }
  };

  // Register New Sub-Admin
  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!activeAdmin || activeAdmin.role !== 'super') {
      setRegError("Ma lihid awooddan (Awoodda Maamulaha Sare kaliya ayaa oggol)");
      return;
    }

    if (!regFullName.trim() || !regNumber.trim() || !regEmail.trim() || !regUsername.trim()) {
      setRegError("Fadlan buuxi dhammaan macluumaadka laga rabo shaqaalaha.");
      return;
    }

    // Check if Username already registered (prevent duplicates)
    const existingAdmins = LocalDB.getAdmins();
    const duplicate = existingAdmins.some(
      a => a.username.toLowerCase() === regUsername.trim().toLowerCase()
    );

    if (duplicate) {
      setRegError(`Username-ka '${regUsername}' horey ayaa loo isticmaalay!`);
      return;
    }

    LocalDB.registerAdmin({
      fullName: regFullName.trim(),
      phone: regNumber.trim(),
      email: regEmail.trim(),
      username: regUsername.trim().toLowerCase(),
      role: 'sub',
      createdBy: activeAdmin.id,
      initialPassword: regPassword
    });

    setRegSuccess(`Waad ku guuleystay! Waxaa si guul leh loo diiwaan-geliyey ${regFullName} oo ah Sub-Admin.`);
    
    // Clear registration parameters
    setRegFullName("");
    setRegNumber("");
    setRegEmail("");
    setRegUsername("");
    setRegPassword("balcad123");
  };

  // Delete Sub Admin Staff (Strictly Super Admin privilege)
  const handleDeleteAdminStaff = (targetStaffId: string, name: string) => {
    if (!activeAdmin || activeAdmin.role !== 'super') return;
    setConfirmDeleteStaff({ id: targetStaffId, name });
  };

  const executeDeleteAdminStaff = () => {
    if (confirmDeleteStaff && activeAdmin && activeAdmin.role === 'super') {
      const ok = LocalDB.deleteAdmin(confirmDeleteStaff.id, 'super');
      if (ok) {
        setConfirmDeleteStaff(null);
        setDbTick(prev => prev + 1);
      }
    }
  };

  // Handle Admin Profile Modification
  const handleUpdateAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfSuccess("");
    if (!activeAdmin) return;

    if (!profUsername.trim()) {
      alert("Username-ku ma bannaanaan karo!");
      return;
    }

    const ok = LocalDB.updateAdminProfile(activeAdmin.id, profUsername.trim(), profPassword || undefined);
    if (ok) {
      setProfSuccess("Profile-kaaga waa la cusbooneysiiyay successfully!");
      setProfPassword("");
    }
  };

  // Retrieve active dataset from client actions
  const ordersList = LocalDB.getOrders();
  const adsList = LocalDB.getAds();
  const adminStaffList = LocalDB.getAdmins().filter(a => a.id !== 'super-1'); // exclude base Super-1

  // "Marka uu macmiilku dhankiisa ka tirtiro (ama xiro) chat-ka, waa in si toos ah looga qariyo Admin-ka"
  // Thus we filter chats to only include active chats!
  const chatsList = LocalDB.getChats().filter(chat => chat.active);

  // Active support message logs loading
  const currentOpenChat = LocalDB.getChats().find(c => c.id === activeChatId);
  const isAssignedToOther = currentOpenChat && activeAdmin && currentOpenChat.assignedAdminId && currentOpenChat.assignedAdminId !== activeAdmin.id;

  return (
    <section id="admin-panel" className="py-12 px-4 transition-colors max-w-7xl mx-auto">
      
      <AnimatePresence mode="wait">
        {!activeAdmin ? (
          
          /* ADMIN SECURITY AUTHENTICATION LANDING CARD */
          <motion.div
            key="login-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="text-center mb-6">
              <div className="w-40 h-28 flex items-center justify-center mx-auto mb-2">
                <Logo size="100%" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight block leading-none">
                Gali Magacaaga & Password
              </h2>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-2 font-bold">
                Balcad Travel Admin Portal
              </span>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-300/30 rounded-xl text-xs font-bold flex gap-2 items-start">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Username Maamulaha
                </label>
                <input
                  type="text"
                  required
                  placeholder="superadmin ama magacaaga"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Qor password-kaaga"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {/* CALAAMADDA ISHA TOGGLE (Show/Hide password) */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn_admin_login_submit"
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 hover:from-amber-500 hover:to-amber-600 font-extrabold text-xs py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4.5 h-4.5" />
                  <span>Sii Soco & Soo gal</span>
                </button>
              </div>
            </form>
          </motion.div>

        ) : (

          /* REGISTERED ADMINS MAIN PORTAL DASHBOARD */
          <motion.div
            key="portal-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            
            {/* Top Bar Status Center with Logout */}
            <div className="p-4 rounded-3xl bg-neutral-950 text-white flex flex-col md:flex-row gap-4 items-center justify-between border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-zinc-950 rounded-xl font-black">
                  🛡️ Balcad Admin
                </div>
                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-2 text-zinc-100">
                    Sufiirka: {activeAdmin.fullName} 
                    <span className="text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                      {activeAdmin.role === 'super' ? "Super Admin" : "Sub-Admin Staff"}
                    </span>
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Ku soo dhowow xarunta kantaroolka macaamiisha iyo maamulka diyaar-garaynta.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ka Bax Session (Logout)</span>
                </button>
              </div>
            </div>

            {/* Middle Workspace: Sidebar Tabs and Sub Tab Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Tab selector bar Left side */}
              <div className="flex flex-col gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-2 py-1.5">
                  Kantaroolka
                </p>
                
                {/* 1. Orders Tab button */}
                <button
                  type="button"
                  onClick={() => { setActiveSubTab('orders'); setActiveChatId(null); }}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all ${
                    activeSubTab === 'orders'
                      ? 'bg-amber-400 text-zinc-950 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-750 dark:text-zinc-200'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Maamulka Dalabaadka</span>
                  <span className="ml-auto bg-zinc-950/20 px-2 py-0.5 text-[9px] rounded-full">
                    {ordersList.length}
                  </span>
                </button>

                {/* 2. Chats Tab button */}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('live-chats')}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all ${
                    activeSubTab === 'live-chats'
                      ? 'bg-amber-400 text-zinc-950 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-750 dark:text-zinc-200'
                  }`}
                >
                  <MessageSquareCode className="w-4 h-4" />
                  <span>Support Center (Live Chats)</span>
                  <span className="ml-auto bg-zinc-950/20 px-2 py-0.5 text-[9px] rounded-full">
                    {chatsList.length}
                  </span>
                </button>

                {/* 3. Ads Tab button */}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('ads')}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all ${
                    activeSubTab === 'ads'
                      ? 'bg-amber-400 text-zinc-950 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-750 dark:text-zinc-200'
                  }`}
                >
                  <ImageUp className="w-4 h-4" />
                  <span>Soo dhig Xayeysiis (Ads)</span>
                  <span className="ml-auto bg-zinc-950/20 px-2 py-0.5 text-[9px] rounded-full">
                    {adsList.length}
                  </span>
                </button>

                {/* 4. Staff Registry Tab (Super Admin ONLY) */}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('staff')}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all ${
                    activeSubTab === 'staff'
                      ? 'bg-amber-400 text-zinc-950 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-750 dark:text-zinc-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Staff / Admin</span>
                  {activeAdmin.role === 'super' ? (
                    <span className="ml-auto bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] rounded font-bold uppercase">
                      Super
                    </span>
                  ) : (
                    <span className="ml-auto bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 rounded font-bold">
                      Locked
                    </span>
                  )}
                </button>

                {/* 5. Profile Edit Tab */}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('profile')}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all ${
                    activeSubTab === 'profile'
                      ? 'bg-amber-400 text-zinc-950 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-750 dark:text-zinc-200'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  <span>Maamulka Profile</span>
                </button>
              </div>

              {/* Main Workspace content area right side */}
              <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 min-h-[460px]">

                {/* SUB TAB 1: CUSTOMER ORDERS MANAGEMENT */}
                {activeSubTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <ClipboardList className="w-5 h-5 text-amber-500" />
                          Maamulka Dalabaadka Macaamiisha
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Halkan waxaad ku maamuli kartaa dhammaan foomamka dadka ka soo buuxiyeen boggaga socdaalka ee Balcad.
                        </p>
                      </div>
                    </div>

                    {ordersList.length === 0 ? (
                      <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Wax dalabaad ah weli ma jiraan!
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Marka macmiilku ka dalbado Ticketing, Huteelada, amase Visa boga hore, halkan baa u so dhacaya diyaar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ordersList.map((ord: Order) => {
                          const orderTagColors: Record<string, string> = {
                            ticketing: "bg-blue-105 bg-blue-500/10 text-blue-500",
                            hotel: "bg-emerald-105 bg-emerald-500/10 text-emerald-500",
                            visa: "bg-purple-105 bg-purple-500/10 text-purple-500",
                            tour: "bg-amber-105 bg-amber-500/10 text-amber-550 dark:text-amber-400",
                            airport: "bg-teal-105 bg-teal-500/10 text-teal-500"
                          };

                          const labelText: Record<string, string> = {
                            ticketing: "Ticketing",
                            hotel: "Hotel Booking",
                            visa: "Visa Service",
                            tour: "Tour Package",
                            airport: "Airport Transfer"
                          };

                          return (
                            <div 
                              key={ord.id} 
                              className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col md:flex-row justify-between gap-4 items-start"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${orderTagColors[ord.type] || 'bg-zinc-200'}`}>
                                    {labelText[ord.type] || ord.type}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    ID: {ord.id}
                                  </span>
                                  <span className="text-[10px] text-zinc-400">
                                    • {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                {/* Order specific data fields */}
                                <div className="space-y-1 text-xs">
                                  <p className="text-zinc-900 dark:text-zinc-100 font-bold">
                                    👤 Macmiilka: <span className="font-extrabold">{ord.data.fullName}</span>
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 mt-2 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text_zinc-600 dark:text-zinc-300">
                                    <p>📞 Phone: <strong>{ord.data.phone}</strong></p>
                                    <p>✉️ Email: <strong>{ord.data.email}</strong></p>
                                    
                                    {/* Type structures matching */}
                                    {ord.type === 'ticketing' && (
                                      <>
                                        <p>🛫 Departure: <strong className="text-amber-505 text-amber-600 dark:text-amber-400 font-bold">{(ord.data as any).departure}</strong></p>
                                        <p>🛬 Destination: <strong className="text-amber-505 text-amber-600 dark:text-amber-400 font-bold">{(ord.data as any).destination}</strong></p>
                                        <p className="sm:col-span-2">👥 Pax count: <strong>{(ord.data as any).passengersCount} Rikaab</strong></p>
                                      </>
                                    )}

                                    {ord.type === 'hotel' && (
                                      <p className="sm:col-span-2">🏨 Magaalada Huteelka: <strong>{(ord.data as any).cityOrLocation}</strong></p>
                                    )}

                                    {ord.type === 'visa' && (
                                      <>
                                        <p>🗺️ Wadanka: <strong>{(ord.data as any).country}</strong></p>
                                        <p>🎫 Nooca Fiisaha: <strong>{(ord.data as any).visaType}</strong></p>
                                      </>
                                    )}

                                    {ord.type === 'tour' && (
                                      <>
                                        <p>🌴 Xirmada: <strong className="text-amber-500">{(ord.data as any).packageName}</strong></p>
                                        <p>👑 Qaybta: <strong>{(ord.data as any).packageType}</strong></p>
                                      </>
                                    )}

                                    {ord.type === 'airport' && (
                                      <>
                                        <p>📍 Dalka: <strong>{(ord.data as any).country}</strong></p>
                                        <p className="sm:col-span-2">✈️ Madaarka: <strong className="text-emerald-500">{(ord.data as any).airport}</strong></p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action resolver and Deletor button */}
                              <div className="flex gap-2 self-end sm:self-auto shrink-0 mt-3 sm:mt-0">
                                <button
                                  type="button"
                                  onClick={() => triggerDeleteOrder(ord.id)}
                                  className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-300/10 hover:border-red-300/20 rounded-xl transition-all"
                                  title="Tirtir dalabka"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* SUB TAB 2: LIVE CHATS SUPPORT HUB (Live Chat Hub) */}
                {activeSubTab === 'live-chats' && (
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <MessageSquareCode className="w-5 h-5 text-blue-500" />
                        Xarunta Wada-sheekaysiga rasmiga ee Balcad (Support Hub)
                      </h3>
                      <p className="text-xs text-zinc-450 dark:text-zinc-400 mt-0.5">
                        La hadal macaamiisha tooska ugu xiran website-ka hadda. 
                        Macaamiisha markay boggooda ka xiraan chat-ka, halkan si toos ah ayay uga xunbaysmayaan/qarinayaan (Constraint enforced).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                      
                      {/* Active chats sidebar selectors */}
                      <div className="md:col-span-1 border-r border-zinc-100 dark:border-zinc-800 space-y-2 pr-2">
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2">
                          Macaamiisha Online-ka ah
                        </p>
                        {chatsList.length === 0 ? (
                          <div className="text-center py-6 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50">
                            <p className="text-[10px] font-bold text-zinc-400">Weli chat ma firfircoona</p>
                          </div>
                        ) : (
                          chatsList.map((chat) => (
                            <button
                              key={chat.id}
                              type="button"
                              onClick={() => { handleSelectChat(chat); }}
                              className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 border ${
                                activeChatId === chat.id
                                  ? 'bg-amber-400/15 border-amber-400 text-amber-950 dark:text-amber-100 font-bold shadow-sm'
                                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 border-zinc-100 dark:border-zinc-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 justify-between w-full">
                                <span className="text-xs font-extrabold truncate">{chat.userName}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              </div>
                              <span className="text-[9px] text-zinc-400 font-semibold truncate block leading-none">{chat.userEmail}</span>
                              <span className="text-[9px] text-zinc-400 font-semibold truncate block mt-0.5">📞 {chat.userPhone}</span>

                              {/* Assignment Badge */}
                              {chat.assignedAdminId && (
                                <div className="mt-1 flex items-center">
                                  {chat.assignedAdminId === activeAdmin?.id ? (
                                    <span className="text-[8px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold leading-none">
                                      Adiga ayaa xalinaya
                                    </span>
                                  ) : (
                                    <span className="text-[8px] bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold leading-none truncate max-w-[150px]">
                                      {chat.assignedAdminName} ayaa xalinaya
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Chat screen pane */}
                      <div className="md:col-span-2 flex flex-col justify-between border border-zinc-150 dark:border-zinc-800 rounded-2xl min-h-[360px] bg-zinc-50/10 dark:bg-zinc-950/20 relative overflow-hidden">
                        {currentOpenChat ? (
                          <div className="flex flex-col h-full justify-between relative">
                            {/* Chat Window header */}
                            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-t-2xl flex items-center justify-between">
                              <div>
                                <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-tight">
                                  {currentOpenChat.userName} (Live Chat)
                                </h4>
                                <span className="text-[9px] font-bold text-emerald-500">📞 {currentOpenChat.userPhone}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveChatId(null)}
                                className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-800"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Chat Message Scroll feed */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 h-[260px]">
                              {currentOpenChat.messages.map((msg) => {
                                const isAdminObj = msg.sender === 'admin';
                                return (
                                  <div
                                    key={msg.id}
                                    className={`flex ${isAdminObj ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm text-xs leading-relaxed ${
                                      isAdminObj
                                        ? 'bg-amber-400 text-zinc-950 font-bold rounded-tr-none text-right'
                                        : 'bg-zinc-150 text-zinc-900 dark:bg-zinc-850 dark:text-zinc-100 rounded-tl-none'
                                    }`}>
                                      {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                      {/* Photo attachment from student user */}
                                      {msg.image && (
                                        <div className="mt-1.5 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 max-w-[200px]">
                                          <img
                                            src={msg.image}
                                            alt="Customer attachment"
                                            className="w-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      )}
                                      <span className="text-[8px] block mt-1 opacity-70">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                              <div ref={chatEndRef} />
                            </div>

                            {/* Reply Form */}
                            <form 
                              onSubmit={handleAdminChatSend} 
                              className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-2xl flex gap-2"
                            >
                              <input
                                type="text"
                                placeholder={`Ku jawaab ${currentOpenChat.userName}-ga...`}
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-950 dark:text-zinc-150 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                              />
                              <button
                                type="submit"
                                className="px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all outline-none"
                              >
                                <Send className="w-3.5 h-3.5 text-zinc-950" />
                              </button>
                            </form>

                            {/* LOCKOUT COVER OVERLAY */}
                            {isAssignedToOther && (
                              <div className="absolute inset-0 z-30 bg-zinc-950/80 dark:bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
                                <div className="w-12 h-12 bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mb-4">
                                  <ShieldAlert className="w-6 h-6 text-red-500" />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                                  Macmiilkan stuff ayaa xalinaya
                                </h4>
                                <p className="text-xs text-zinc-300 mt-2 max-w-sm leading-relaxed px-4">
                                  Wada-sheekaysiga macmiilkan waxaa hadda gacanta ku haya oo xalinaya shaqaalaha kale: <strong className="text-amber-400">{currentOpenChat.assignedAdminName}</strong>. 
                                </p>
                                <p className="text-[10px] text-zinc-500 mt-2 italic">
                                  Fadlan u daa asaga si aad uga fogaato khaladaadka wada-hadalka.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setActiveChatId(null)}
                                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:scale-105 active:scale-95 text-zinc-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                                >
                                  ← Ku laabo liiska
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-16 p-4">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                              Eeg Wadahadallada Macaamiisha
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1 max-w-xs mx-auto">
                              Macmiilka ka soo xiro online-ka horteeda, dhaji badhanka <strong className="text-blue-500 font-bold">Fur Chat-ka</strong> ama guji magacooda si aad ula hadasho rasmiga ahaan.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB 3: ADS MANAGEMENT */}
                {activeSubTab === 'ads' && (
                  <div className="space-y-6">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <ImageUp className="w-5 h-5 text-amber-550 text-amber-500" />
                        Maamulka & Soo Upload-garaynta Xayeysiisyada (Ads)
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Ku soo dheji xayeysiis cusub bogga hore. Sawirka wuxuu diyaar u yahay inuu ka soo raro mobile-kasta oo casri ah (Gallery-ga).
                      </p>
                    </div>

                    {adSuccessMsg && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300/30 rounded-2xl text-xs font-bold flex gap-2 items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span>Fariin: {adSuccessMsg}!</span>
                      </div>
                    )}

                    {adErrorMsg && (
                      <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-300/30 rounded-xl text-xs font-bold">
                        ⚠️ khalad oo dhacay: {adErrorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Ads uploading form */}
                      <form onSubmit={handleCreateAd} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                            Cinwaanka Xayeysiiska (Title) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Tusaale: Cumro iyo Xaj 2026 dalabka hadda"
                            value={adTitle}
                            onChange={(e) => setAdTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                            Qoraalka Caadiga ee Sharaxaadda (Description) <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Faahfaahin ku saabsan waxyaabaha ku jira ad-ka..."
                            value={adDescription}
                            onChange={(e) => setAdDescription(e.target.value)}
                            className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>

                        {/* Forced Image selection / mobile files */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                            Soo dhig Sawirka (Khasab / Required) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            ref={adImageInputRef}
                            onChange={handleAdImageChange}
                            className="hidden"
                          />
                          <div className="flex gap-3 items-center">
                            <button
                              type="button"
                              onClick={() => { adImageInputRef.current?.click(); }}
                              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold rounded-xl transition-all"
                              disabled={isUploadingAdImage}
                            >
                              {isUploadingAdImage ? "Soo raraya..." : "Ka soo dooro Mobile-ka (Gallery)"}
                            </button>
                            {adImage && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 rounded">
                                Image ready 🏷️
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            Nooc kasta oo mobile aad isticmaalayso, gallery-ga si buuxda ayuu u furmaya.
                          </p>
                        </div>

                        {/* Rendering selected picture pre-uploader */}
                        {adImage && (
                          <div className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-100 dark:bg-zinc-950">
                            <img
                              src={adImage}
                              alt="Uploading advertisement attachment"
                              className="w-full max-h-40 object-cover rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <button
                          id="btn_submit_ad_creative"
                          type="submit"
                          className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-extrabold text-xs py-3.5 rounded-xl hover:shadow-lg active:scale-95 transition-all outline-none"
                        >
                          Dhig Ad-ka cusub
                        </button>
                      </form>

                      {/* Active ads preview lists */}
                      <div className="border border-zinc-150 dark:border-zinc-800 rounded-3xl p-4 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-500">
                          Xayeysiisyada Bogga Socda hadda ({adsList.length})
                        </h4>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto w-full">
                          {adsList.map((ad: Advertisement) => (
                            <div key={ad.id} className="p-3 bg-white dark:bg-zinc-905 border border-zinc-100 dark:border-zinc-800 rounded-xl flex justify-between items-start gap-2">
                              <div className="flex gap-3">
                                <img
                                  src={ad.image}
                                  alt={ad.title}
                                  className="w-16 h-16 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-tight">{ad.title}</h5>
                                  <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{ad.description}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteAd(ad.id, ad.title)}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer shrink-0 border border-transparent hover:border-red-500/10"
                                title="Tirtir xayeysiiska"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB 4: PROFILE MANAGE */}
                {activeSubTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-amber-500" />
                        Beddel Profile-ka Maamulaha
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Admin-ku waa inuu beddeli karo Username-kiisa iyo Password-kiisa mar kasta si uu u ilaaliyo amniga.
                      </p>
                    </div>

                    {profSuccess && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300/30 rounded-2xl text-xs font-bold flex gap-2 items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span>{profSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpdateAdminProfile} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Username Maamulaha Cusub
                        </label>
                        <input
                          type="text"
                          required
                          value={profUsername}
                          onChange={(e) => setProfUsername(e.target.value)}
                          placeholder="Qor username cusub..."
                          className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Password-ka Cusub (Re-write)
                        </label>
                        <div className="relative">
                          <input
                            type={showProfPassword ? "text" : "password"}
                            value={profPassword}
                            onChange={(e) => setProfPassword(e.target.value)}
                            placeholder="Macaamiil, qor password-ka cusub haddii aad rabo inaad badasho..."
                            className="w-full pl-4 pr-10 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          {/* SHOW / HIDE PASSWORD INPUT BUTTON EYE ICON FOR SAFETY */}
                          <button
                            type="button"
                            onClick={() => setShowProfPassword(!showProfPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-500 transition-colors"
                          >
                            {showProfPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        id="btn_submit_profile_edit"
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-extrabold text-xs py-3.5 rounded-xl hover:shadow-lg active:scale-95 transition-all outline-none"
                      >
                        Nadiifi & Badbadi Profile
                      </button>
                    </form>
                  </div>
                )}

                {/* SUB TAB 5: STAFF REGISTRY (SUPER ADMIN VS SUB ADMIN ROLE HIERARCHIES) */}
                {activeSubTab === 'staff' && (
                  <div className="space-y-6">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-emerald-500" />
                        Diiwaan-gelinta Maamulayaasha kale (Staff Registry)
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Xog ka kooban Super Admin iyo Sub-Admin. Super Admin waa ka kaliya ee diiwaan-gelin kara ama tirtiri kara Sub-Admin.
                      </p>
                    </div>

                    {activeAdmin.role !== 'super' ? (
                      
                      /* SUB-ADMIN LOCK OUT CONSTRAINT ENFORCED */
                      <div className="p-6 text-center border border-red-300/20 bg-red-50/50 dark:bg-red-950/15 rounded-3xl text-red-650 dark:text-red-400">
                        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h4 className="font-extrabold text-sm text-red-600 dark:text-red-400">
                          Awood u diidid: Ma lihid awooddan (Awoodda Maamulaha Sare)
                        </h4>
                        <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto">
                          Waxa diiwaan-gelin kara ama tirtiri kara maamulayaasha yar-yar oo kaliya Super Admin-ka wayn ee Balcad Travel Agency.
                        </p>
                      </div>

                    ) : (

                      /* REGISTER CAPABLE (SUPER ADMIN VIEW) */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        
                        {/* Diwaan gelinta Form */}
                        <form onSubmit={handleRegisterAdmin} className="space-y-4">
                          <p className="text-xs font-black uppercase tracking-wider text-amber-500">
                            Foomka Diiwaan-gelinta Cusub (Admin)
                          </p>

                          {regSuccess && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300/30 rounded-2xl text-xs font-bold leading-relaxed">
                              ✅ {regSuccess}
                            </div>
                          )}

                          {regError && (
                            <div className="p-3 bg-red-50 dark:bg-red-950/15 text-red-500 border border-red-350/25 rounded-xl text-xs font-bold">
                              ⚠️ {regError}
                            </div>
                          )}

                          {/* Full Name */}
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                              Magaca oo Buuxa (Full Name) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Fadlan qor magaca cusub..."
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value)}
                              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-250 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                            />
                          </div>

                          {/* Phone/Number */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                Namberka Telefoonka <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="061XXXXXXX"
                                value={regNumber}
                                onChange={(e) => setRegNumber(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-250 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                              />
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                Email-ka <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                required
                                placeholder="Email-ka..."
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-250 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                              />
                            </div>
                          </div>

                          {/* Username */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                Username-ka uu Isticmaali Lahaa <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Username... (ex. ali)"
                                value={regUsername}
                                onChange={(e) => setRegUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-250 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                              />
                            </div>

                            {/* Password input registry */}
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                Password <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type={showRegPassword ? "text" : "password"}
                                  required
                                  value={regPassword}
                                  onChange={(e) => setRegPassword(e.target.value)}
                                  className="w-full pl-4 pr-10 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-250 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegPassword(!showRegPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-500 transition-colors"
                                >
                                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            id="btn_submit_registered_admin"
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-extrabold text-xs py-3 rounded-xl hover:shadow-lg active:scale-95 transition-all text-center"
                          >
                            Diiwaan-geli Admin-kaan
                          </button>
                        </form>

                        {/* Registered Sub Admins list table */}
                        <div className="space-y-4">
                          <p className="text-xs font-black uppercase tracking-wider text-amber-500">
                            Maamulayaasha diiwaan-gashan hadda ({adminStaffList.length})
                          </p>
                          <div className="space-y-2 max-h-[380px] overflow-y-auto">
                            {adminStaffList.map((admin: AdminUser) => (
                              <div 
                                key={admin.id} 
                                className="p-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center"
                              >
                                <div>
                                  <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-tight">
                                    {admin.fullName}
                                  </h5>
                                  <span className="text-[9px] text-zinc-405 font-medium leading-none mt-1 bg-zinc-150 dark:bg-zinc-805 px-2 py-0.5 rounded text-zinc-400 font-mono">
                                    User: {admin.username}
                                  </span>
                                  <span className="text-[9px] font-semibold text-zinc-400 block mt-1.5">
                                    📞 {admin.phone} | ✉️ {admin.email}
                                  </span>
                                </div>

                                {/* Super admin can DELETE sub-admins */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdminStaff(admin.id, admin.fullName)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors border border-transparent hover:border-red-300/20"
                                  title="Tirtir Admin-kaan"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION POPUP FOR DELETING ORDER */}
      <AnimatePresence>
        {confirmDeleteOrderId && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteOrderId(null)}
              className="fixed inset-0 bg-neutral-950"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-red-105 bg-red-500/10 text-red-550 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Xaqiijinta Tirtirista (Confirm Delete)
              </h4>
              
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Ma hubtaa inaad tirtirto dalabka?
              </p>
              
              <div className="flex gap-3 mt-6">
                {/* [ Haa ] */}
                <button
                  type="button"
                  onClick={executeDeleteOrder}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                >
                  Haa
                </button>
                {/* [ Maya ] */}
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOrderId(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700"
                >
                  Maya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION POPUP FOR DELETING STAFF */}
      <AnimatePresence>
        {confirmDeleteStaff && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteStaff(null)}
              className="fixed inset-0 bg-neutral-950"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Xaqiijinta Ruqsaynta Shaqaalaha
              </h4>
              
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed font-semibold">
                Ma hubtaa inaad ruqseesid shaqaalahaan: <strong className="text-zinc-900 dark:text-zinc-100">{confirmDeleteStaff.name}</strong>?
              </p>
              
              <div className="flex gap-3 mt-6">
                {/* [ Haa ] */}
                <button
                  type="button"
                  onClick={executeDeleteAdminStaff}
                  className="flex-1 bg-red-500 hover:bg-red-650 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                >
                  Haa
                </button>
                {/* [ Maya ] */}
                <button
                  type="button"
                  onClick={() => setConfirmDeleteStaff(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700"
                >
                  Maya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION POPUP FOR DELETING ADS */}
      <AnimatePresence>
        {confirmDeleteAd && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteAd(null)}
              className="fixed inset-0 bg-neutral-950"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-550" />
              </div>
              
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Xaqiijinta Tirtirista Xayeysiiska
              </h4>
              
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed font-semibold">
                Ma hubtaa inaad tirtirto xayeysiiskaan: <strong className="text-zinc-900 dark:text-zinc-100">{confirmDeleteAd.title}</strong>?
              </p>
              
              <div className="flex gap-3 mt-6">
                {/* [ Haa ] */}
                <button
                  type="button"
                  onClick={executeDeleteAd}
                  className="flex-1 bg-red-500 hover:bg-red-650 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                >
                  Haa
                </button>
                {/* [ Maya ] */}
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAd(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700"
                >
                  Maya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}