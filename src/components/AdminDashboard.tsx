/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert, Eye, EyeOff, ClipboardList, ImageUp, 
  UserCog, UserPlus, Trash2, CheckCircle, LogOut, X, Plane, Hotel, Landmark, Compass, Car, Send, Loader2,
  Clock, Ban, AlertTriangle
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

  // Deletions confirmation dialog states
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [confirmDeleteStaff, setConfirmDeleteStaff] = useState<{ id: string; name: string } | null>(null);
  const [confirmDeleteAd, setConfirmDeleteAd] = useState<{ id: string; title: string } | null>(null);

  // Order Resolution states (Accept / Reject)
  const [confirmAcceptOrderId, setConfirmAcceptOrderId] = useState<string | null>(null);
  const [confirmRejectOrderId, setConfirmRejectOrderId] = useState<string | null>(null);
  const [viewingResolverOrder, setViewingResolverOrder] = useState<Order | null>(null);

  // Ads Creation Form State
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adImage, setAdImage] = useState<string | null>(null);
  const [isUploadingAdImage, setIsUploadingAdImage] = useState(false);
  const [adSuccessMsg, setAdSuccessMsg] = useState("");
  const [adErrorMsg, setAdErrorMsg] = useState("");

  // Profile credentials form
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
      
      // Auto-populate profile credentials
      if (session) {
        setProfUsername(session.username);
      }
      setDbTick(prev => prev + 1);
    };

    handleSync();
    const unsubscribe = subscribeToDBUpdates(handleSync);
    return () => unsubscribe();
  }, []);

  // Soft auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, dbTick]);

  // Handle administrator authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!username.trim() || !password.trim()) {
      setLoginError("Fadlan buuxiyo meelaha laga baahan yahay");
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
    if (activeAdmin?.role !== 'super') return;
    setConfirmDeleteOrderId(orderId);
  };

  const executeDeleteOrder = () => {
    if (confirmDeleteOrderId && activeAdmin?.role === 'super') {
      LocalDB.deleteOrder(confirmDeleteOrderId);
      setConfirmDeleteOrderId(null);
    }
  };

  const executeAcceptOrder = () => {
    if (confirmAcceptOrderId && activeAdmin) {
      LocalDB.updateOrderStatus(confirmAcceptOrderId, 'accepted', activeAdmin);
      setConfirmAcceptOrderId(null);
      setDbTick(prev => prev + 1);
    }
  };

  const executeRejectOrder = () => {
    if (confirmRejectOrderId && activeAdmin) {
      LocalDB.updateOrderStatus(confirmRejectOrderId, 'rejected', activeAdmin);
      setConfirmRejectOrderId(null);
      setDbTick(prev => prev + 1);
    }
  };

  // Send admin chat responses
  const handleAdminChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId) return;

    const textPayload = adminReplyText.trim();
    if (!textPayload) return;

    // Auto-assign to current admin on reply if not yet assigned
    const chat = LocalDB.getChats().find(c => c.id === activeChatId);
    if (chat && !chat.assignedAdminId && activeAdmin) {
      LocalDB.assignChatToAdmin(activeChatId, activeAdmin.id, activeAdmin.fullName);
    }

    const updated = LocalDB.addMessageToChat(activeChatId, 'admin', textPayload);
    if (updated) {
      setAdminReplyText("");
      setDbTick(prev => prev + 1);
    }
  };

  // Handle Chat selection and assignment (passive monitoring)
  const handleSelectChat = (chat: ChatSession) => {
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

  // Handle Ads creation
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    setAdErrorMsg("");
    setAdSuccessMsg("");

    if (!adTitle.trim() || !adDescription.trim()) {
      setAdErrorMsg("Fadlan qor cinwaanka iyo sharaxaadda.");
      return;
    }

    if (!adImage) {
      setAdErrorMsg("Sawirka waa ku khasab si aad u dhigto xayeysiis cusub.");
      return;
    }

    LocalDB.createAd(adTitle.trim(), adDescription.trim(), adImage);
    setAdSuccessMsg("Xayeysiiska si guul leh ayaa loo dhigay!");
    
    setAdTitle("");
    setAdDescription("");
    setAdImage(null);
  };

  // Handle Ad Deletion
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
    
    setRegFullName("");
    setRegNumber("");
    setRegEmail("");
    setRegUsername("");
    setRegPassword("balcad123");
  };

  // Delete Sub Admin Staff
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

  const ordersList = LocalDB.getOrders();
  const adsList = LocalDB.getAds();
  const adminStaffList = LocalDB.getAdmins().filter(a => a.id !== 'super-1'); 
  const chatsList = LocalDB.getChats().filter(chat => chat.active);

  const currentOpenChat = LocalDB.getChats().find(c => c.id === activeChatId);
  const isAssignedToOther = currentOpenChat && activeAdmin && currentOpenChat.assignedAdminId && currentOpenChat.assignedAdminId !== activeAdmin.id;

  return (
    <section id="admin-panel" className="py-12 px-4 transition-colors max-w-7xl mx-auto">
      
      <AnimatePresence mode="wait">
        {!activeAdmin ? (
          
          /* LOGIN PANEL */
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
              <span className="text-[10px] text-zinc-405 uppercase tracking-widest block mt-2 font-bold select-none leading-none">
                Balcad Travel Admin Portal
              </span>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-300/30 rounded-xl text-xs font-bold flex gap-2 items-start">
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
                  placeholder="superadmin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Password-ka (Siri-da)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Tusaale: balcad123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn_admin_login_submit"
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-955 hover:from-amber-500 hover:to-amber-600 font-extrabold text-xs py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4.5 h-4.5 text-zinc-950" />
                  <span>Sii Soco & Soo gal</span>
                </button>
              </div>
            </form>
          </motion.div>

        ) : (

          /* ADMIN MAIN PORTAL */
          <motion.div
            key="portal-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            
            {/* Top Bar Banner with Logout */}
            <div className="p-4 rounded-3xl bg-neutral-950 text-white flex flex-col md:flex-row gap-4 items-center justify-between border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-zinc-955 rounded-xl font-black">
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
                    Ku soo dhowow xarunta kantaroolka daryeelka macaamiisha iyo maamulka diyaar-garaynta.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-755 text-zinc-350 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ka Bax Session (Logout)</span>
                </button>
              </div>
            </div>

            {/* Middle Grid Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Tab selectors */}
              <div className="flex flex-col gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-2 py-1.5">
                  Kantaroolka
                </p>
                
                {/* 1. Orders Tab */}
                <button
                  type="button"
                  onClick={() => { setActiveSubTab('orders'); setActiveChatId(null); }}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'orders'
                      ? 'bg-amber-400 text-zinc-955 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-250'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Maamulka Dalabaadka</span>
                  <span className="ml-auto bg-zinc-950/10 px-2 py-0.5 text-[9px] rounded-full">
                    {ordersList.length}
                  </span>
                </button>

                {/* 2. Chats Tab */}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('live-chats')}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'live-chats'
                      ? 'bg-amber-400 text-zinc-955 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-250'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Support Center (Live Chats)</span>
                  <span className="ml-auto bg-zinc-950/10 px-2 py-0.5 text-[9px] rounded-full">
                    {chatsList.length}
                  </span>
                </button>

                {/* 3. Ads Tab */}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('ads')}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'ads'
                      ? 'bg-amber-400 text-zinc-955 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-250'
                  }`}
                >
                  <ImageUp className="w-4 h-4" />
                  <span>Soo dhig Xayeysiis (Ads)</span>
                  <span className="ml-auto bg-zinc-950/10 px-2 py-0.5 text-[9px] rounded-full">
                    {adsList.length}
                  </span>
                </button>

                {/* 4. Staff Tab */}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('staff')}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'staff'
                      ? 'bg-amber-400 text-zinc-955 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-250'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Staff / Admin</span>
                  {activeAdmin.role === 'super' ? (
                    <span className="ml-auto bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 text-[9px] rounded font-bold uppercase">
                      Super
                    </span>
                  ) : (
                    <span className="ml-auto bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 rounded font-bold">
                      Locked
                    </span>
                  )}
                </button>

                {/* 5. Profile Tab */}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('profile')}
                  className={`w-full flex items-center gap-3 p-3 text-left text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'profile'
                      ? 'bg-amber-400 text-zinc-955 shadow-md'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-250'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  <span>Maamulka Profile</span>
                </button>
              </div>

              {/* Work Desk right-hand side */}
              <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 min-h-[460px]">

                {/* TAB 1: ORDERS */}
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
                      <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-405 uppercase tracking-widest leading-none">
                          Wax dalabaad ah weli ma jiraan!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ordersList.map((ord: Order) => {
                          const orderTagColors: Record<string, string> = {
                            ticketing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                            hotel: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            visa: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                            tour: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            airport: "bg-teal-500/10 text-teal-600 dark:text-teal-400"
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
                              className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-805 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col md:flex-row justify-between gap-4 items-start"
                            >
                              <div className="space-y-2 flex-grow">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${orderTagColors[ord.type] || 'bg-zinc-250'}`}>
                                    {labelText[ord.type] || ord.type}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    ID: {ord.id}
                                  </span>
                                  <span className="text-[10px] text-zinc-405">
                                    • {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                <div className="space-y-1 text-xs">
                                  <p className="text-zinc-900 dark:text-zinc-100 font-bold">
                                    👤 Macmiilka: <span className="font-extrabold text-amber-605 dark:text-amber-450">{ord.data.fullName}</span>
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 p-2.5 rounded-xl bg-white dark:bg-zinc-905 border border-zinc-100 dark:border-zinc-800 text-zinc-655">
                                    <p>📞 Phone: <strong>{ord.data.phone}</strong></p>
                                    <p>✉️ Email: <strong>{ord.data.email}</strong></p>
                                    
                                    {ord.type === 'ticketing' && (
                                      <>
                                        <p>🛫 Departure: <strong className="text-amber-600 dark:text-amber-400">{ord.data.departure}</strong></p>
                                        <p>🛬 Destination: <strong className="text-amber-600 dark:text-amber-400">{ord.data.destination}</strong></p>
                                        <p className="sm:col-span-2">👥 Rikaabka: <strong>{ord.data.passengersCount} qof</strong></p>
                                      </>
                                    )}

                                    {ord.type === 'hotel' && (
                                      <p className="sm:col-span-2">🏨 Meesha: <strong>{ord.data.cityOrLocation}</strong></p>
                                    )}

                                    {ord.type === 'visa' && (
                                      <>
                                        <p>🗺️ Dalka: <strong>{ord.data.country}</strong></p>
                                        <p>🎫 Nooca: <strong>{ord.data.visaType}</strong></p>
                                      </>
                                    )}

                                    {ord.type === 'tour' && (
                                      <>
                                        <p>🌴 Xirmada: <strong className="text-amber-500">{ord.data.packageName}</strong></p>
                                        <p>👑 Qaybta: <strong>{ord.data.packageType}</strong></p>
                                      </>
                                    )}

                                    {ord.type === 'airport' && (
                                      <>
                                        <p>📍 Dalka: <strong>{ord.data.country}</strong></p>
                                        <p className="sm:col-span-2">✈️ Madaarka: <strong className="text-emerald-500">{ord.data.airport}</strong></p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:items-end justify-between h-full gap-4 shrink-0 mt-3 md:mt-0 md:min-w-[170px] self-stretch">
                                {/* Admin Status Tag */}
                                <div className="text-right">
                                  {ord.status === 'processing' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400 rounded-full border border-amber-300/20">
                                      <Clock className="w-3 h-3 animate-pulse" />
                                      <span>Sugaya (Processing)</span>
                                    </span>
                                  )}
                                  {ord.status === 'accepted' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-955/20 dark:text-emerald-450 rounded-full border border-emerald-300/25">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>La Aqbalay</span>
                                    </span>
                                  )}
                                  {ord.status === 'rejected' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-red-100 text-red-800 dark:bg-red-955/20 dark:text-red-400 rounded-full border border-red-300/25">
                                      <X className="w-3 h-3" />
                                      <span>La Diiday</span>
                                    </span>
                                  )}
                                  {ord.status === 'canceled' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 rounded-full border border-zinc-300/25">
                                      <Ban className="w-3 h-3" />
                                      <span>La Joojiyay (Customer)</span>
                                    </span>
                                  )}
                                </div>

                                {/* Resolve Actions */}
                                {ord.status === 'processing' && (
                                  <div className="flex flex-wrap items-center gap-1.5 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setConfirmAcceptOrderId(ord.id)}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-all shadow-sm cursor-pointer"
                                    >
                                      Aqbal
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmRejectOrderId(ord.id)}
                                      className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg transition-all shadow-sm cursor-pointer"
                                    >
                                      Diid
                                    </button>
                                  </div>
                                )}

                                {/* Super Admin: view resolving staff member */}
                                {activeAdmin?.role === 'super' && (ord.status === 'accepted' || ord.status === 'rejected') && (
                                  <div className="text-right">
                                    <button
                                      type="button"
                                      onClick={() => setViewingResolverOrder(ord)}
                                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-955/10 dark:hover:bg-amber-955/20 text-amber-850 dark:text-amber-400 border border-amber-300/20 text-[9px] font-black rounded-lg transition-colors cursor-pointer"
                                    >
                                      {ord.status === 'accepted' ? 'Fiiri stuff ka aqbalay' : 'Fiiri stuff ka diiday'}
                                    </button>
                                  </div>
                                )}

                                {/* Delete Controls - Super Admin Only */}
                                {activeAdmin?.role === 'super' && (
                                  <div className="flex gap-2 justify-end items-center mt-auto w-full">
                                    <button
                                      type="button"
                                      onClick={() => triggerDeleteOrder(ord.id)}
                                      className="p-1 px-1.5 bg-zinc-50 hover:bg-red-50 dark:bg-zinc-950/40 text-zinc-400 hover:text-red-655 border border-zinc-200/50 hover:border-red-300/20 rounded-lg transition-all cursor-pointer"
                                      title="Tirtir"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: LIVE CHATS */}
                {activeSubTab === 'live-chats' && (
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        🛡️ Xarunta Wada-sheekaysiga (Support Hub)
                      </h3>
                      <p className="text-xs text-zinc-405 mt-0.5">
                        La hadal macaamiisha online-ka ah hadda. Macaamiisha markay boggooda ka xiraan chat-ka waa la ka saaraya halkan (Constraint compliant).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                      
                      {/* Sidebar online users selection list */}
                      <div className="md:col-span-1 border-r border-zinc-105 dark:border-zinc-800 space-y-2 pr-2">
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2">
                          Macaamiisha Online
                        </p>
                        {chatsList.length === 0 ? (
                          <div className="text-center py-6 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-805 bg-zinc-50/50">
                            <p className="text-[10px] font-bold text-zinc-400 leading-none">Weli chat ma firfircoona</p>
                          </div>
                        ) : (
                          chatsList.map((chat) => (
                            <button
                              key={chat.id}
                              type="button"
                              onClick={() => handleSelectChat(chat)}
                              className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer ${
                                activeChatId === chat.id
                                  ? 'bg-amber-400/15 border-amber-400 text-amber-950 dark:text-amber-100 font-bold shadow-sm'
                                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-850 border-zinc-100 dark:border-zinc-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 justify-between w-full">
                                <span className="text-xs font-extrabold truncate">{chat.userName}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              </div>
                              <span className="text-[9px] text-zinc-404 truncate block leading-none">{chat.userEmail}</span>
                              <span className="text-[9px] text-zinc-404 font-semibold truncate block mt-0.5">📞 {chat.userPhone}</span>

                              {chat.assignedAdminId && (
                                <div className="mt-1">
                                  {chat.assignedAdminId === activeAdmin?.id ? (
                                    <span className="text-[8px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold leading-none">
                                      Adiga ayaa gacanta ku haya
                                    </span>
                                  ) : (
                                    <span className="text-[8px] bg-amber-100 text-amber-800 dark:bg-amber-955/40 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold leading-none truncate max-w-[150px]">
                                      {chat.assignedAdminName} baa haya
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Chat box */}
                      <div className="md:col-span-2 flex flex-col justify-between border border-zinc-150 dark:border-zinc-808 rounded-2xl min-h-[360px] bg-zinc-50/10 dark:bg-zinc-950/20 relative overflow-hidden">
                        {currentOpenChat ? (
                          <div className="flex flex-col h-full justify-between relative">
                            {/* Window header */}
                            <div className="p-3 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-t-2xl flex items-center justify-between">
                              <div>
                                <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-tight">
                                  {currentOpenChat.userName} (Live Chat)
                                </h4>
                                <span className="text-[9px] font-bold text-emerald-500">📞 {currentOpenChat.userPhone}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveChatId(null)}
                                className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-800 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* AI / Admin Control Status Banner */}
                            <div className="p-2 px-3 border-b border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-amber-500/5 dark:bg-amber-400/5 text-[10px] gap-2">
                              {!currentOpenChat.assignedAdminId ? (
                                <>
                                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-bold leading-normal">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                    <span>🤖 AI-ga (Gemini) ayaa hadda ku jawaabaya. Admin-ku kor buu kala socdaa.</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (activeAdmin) {
                                        LocalDB.assignChatToAdmin(currentOpenChat.id, activeAdmin.id, activeAdmin.fullName);
                                        setDbTick(prev => prev + 1);
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-zinc-955 font-black rounded-lg transition-all shadow-sm shrink-0 uppercase tracking-wide cursor-pointer text-[9px]"
                                  >
                                    📥 Soo Dhexgal (Intervene)
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold w-full justify-between">
                                  <div className="flex items-center gap-1.5 leading-normal">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    <span>👨‍💻 Wada-sheekaysiga waxaa xalinaya: <span className="text-zinc-900 dark:text-zinc-100 font-extrabold">{currentOpenChat.assignedAdminName}</span> (AI-gii waa ka baxay).</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Release custody back to AI
                                      const chats = LocalDB.getChats();
                                      const c = chats.find(item => item.id === currentOpenChat.id);
                                      if (c) {
                                        delete c.assignedAdminId;
                                        delete c.assignedAdminName;
                                        localStorage.setItem('balcad_chats', JSON.stringify(chats));
                                        // Trigger update
                                        window.dispatchEvent(new Event('storage'));
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-305 rounded-lg font-bold text-[9px] shadow-sm tracking-wider shrink-0"
                                    title="U soo celi AI-ga"
                                  >
                                    🤖 AI ku celi
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Feed scroll */}
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
                                        ? 'bg-amber-400 text-zinc-955 font-bold rounded-tr-none text-right'
                                        : 'bg-zinc-150 text-zinc-900 dark:bg-zinc-850 dark:text-zinc-100 rounded-tl-none'
                                    }`}>
                                      {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                      {msg.image && (
                                        <div className="mt-1.5 rounded-lg overflow-hidden border border-zinc-250 dark:border-zinc-700 bg-white max-w-[200px]">
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

                            {/* Input form */}
                            <form 
                              onSubmit={handleAdminChatSend} 
                              className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-2xl flex gap-2"
                            >
                              <input
                                type="text"
                                placeholder={`Ku jawaab ${currentOpenChat.userName}...`}
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-950 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                              />
                              <button
                                type="submit"
                                className="px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-505 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all outline-none cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5 text-zinc-955" />
                              </button>
                            </form>

                            {/* LOCK OVERLAY */}
                            {isAssignedToOther && (
                              <div className="absolute inset-0 z-30 bg-zinc-950/80 dark:bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
                                <div className="w-12 h-12 bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mb-4">
                                  <ShieldAlert className="w-6 h-6 text-red-500" />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                                  Macmiilkan stuff ayaa xalinaya
                                </h4>
                                <p className="text-xs text-zinc-350 mt-2 max-w-sm leading-relaxed px-4">
                                  Wada-sheekaysiga macmiilkan waxaa hadda gacanta ku haya oo xalinaya: <strong className="text-amber-400">{currentOpenChat.assignedAdminName}</strong>.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setActiveChatId(null)}
                                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-405 hover:scale-105 active:scale-95 text-zinc-955 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
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
                            <p className="text-[10px] text-zinc-405 mt-1 max-w-xs mx-auto leading-relaxed">
                              Guji mid ka mid ah magacyada macaamiisha online-ka ah si aad u furto wada-sheekaysi rasmi ah oo aad u xaliso baahidooda.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 3: ADS */}
                {activeSubTab === 'ads' && (
                  <div className="space-y-6">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <ImageUp className="w-5 h-5 text-amber-500" />
                        Maamulka & Soo Upload-garaynta Xayeysiisyada (Ads)
                      </h3>
                      <p className="text-xs text-zinc-405 mt-0.5">
                        Ku soo dheji xayeysiis cusub oo ka so baxaya meel ka mid ah website-ka.
                      </p>
                    </div>

                    {adSuccessMsg && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300/30 rounded-2xl text-xs font-bold flex gap-2 items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span>Fariin: {adSuccessMsg}!</span>
                      </div>
                    )}

                    {adErrorMsg && (
                      <div className="p-3.5 bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-300/30 rounded-xl text-xs font-bold">
                        ⚠️ khaladaad baa dhacay: {adErrorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                            Qoraalka Caadiga ee Sharaxaadda (Description) <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Faahfaahin ku saabsan xayeysiiska xaga daryeelka..."
                            value={adDescription}
                            onChange={(e) => setAdDescription(e.target.value)}
                            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                            Soo dhig Sawirka <span className="text-red-500">*</span>
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
                              onClick={() => adImageInputRef.current?.click()}
                              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                              disabled={isUploadingAdImage}
                            >
                              {isUploadingAdImage ? "Soo raraya..." : "Ka soo dooro Gallery-ga"}
                            </button>
                            {adImage && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 rounded">
                                Image ready 🏷️
                              </span>
                            )}
                          </div>
                        </div>

                        {adImage && (
                          <div className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-100 dark:bg-zinc-950">
                            <img
                              src={adImage}
                              alt="Uploading advertisement preview"
                              className="w-full max-h-40 object-cover rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <button
                          id="btn_submit_ad_creative"
                          type="submit"
                          className="w-full bg-gradient-to-r from-amber-400 via-yellow-405 to-amber-500 text-zinc-955 font-extrabold text-xs py-3.5 rounded-xl hover:shadow-lg active:scale-95 transition-all outline-none cursor-pointer"
                        >
                          Dhig Ad-ka cusub
                        </button>
                      </form>

                      {/* Active ads catalog */}
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-500">
                          Xayeysiisyada Socda ({adsList.length})
                        </h4>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto w-full">
                          {adsList.map((ad: Advertisement) => (
                            <div key={ad.id} className="p-3 bg-white dark:bg-zinc-905 border border-zinc-100 dark:border-zinc-800 rounded-xl flex justify-between items-start gap-2">
                              <div className="flex gap-3">
                                <img
                                  src={ad.image}
                                  alt={ad.title}
                                  className="w-16 h-16 object-cover rounded-lg border border-zinc-105 dark:border-zinc-800 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-tight">{ad.title}</h5>
                                  <p className="text-[10px] text-zinc-404 mt-1 line-clamp-2">{ad.description}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteAd(ad.id, ad.title)}
                                className="p-2 text-zinc-404 hover:text-red-505 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-xl transition-all cursor-pointer shrink-0"
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

                {/* TAB 4: PROFILE */}
                {activeSubTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-amber-500" />
                        Beddel Profile-ka Maamulaha
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Admin-ku waa inuu beddeli karo Username-kiisa iyo Password-kiisa si loo ilaaliyo amniga daryeelka.
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
                          className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Password-ka Cusub (New Password)
                        </label>
                        <div className="relative">
                          <input
                            type={showProfPassword ? "text" : "password"}
                            value={profPassword}
                            onChange={(e) => setProfPassword(e.target.value)}
                            placeholder="Macaamiil, soo qor password-ka cusub halkan..."
                            className="w-full pl-4 pr-10 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowProfPassword(!showProfPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            {showProfPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        id="btn_submit_profile_edit"
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-955 font-extrabold text-xs py-3.5 rounded-xl hover:shadow-lg active:scale-95 transition-all outline-none cursor-pointer"
                      >
                        Bedbadi & Dhameystir Profile
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 5: STAFF */}
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
                      <div className="p-6 text-center border border-red-300/20 bg-red-50/50 dark:bg-red-955/15 rounded-3xl text-red-600">
                        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h4 className="font-extrabold text-sm">
                          Awood u diidid: Ma lihid awooddan (Requires Super Admin)
                        </h4>
                        <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                          Waxa diiwaan-gelin kara ama tirtiri kara maamulayaasha yar-yar oo kaliya Super Admin-ka wayn ee Balcad Travel Agency.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        
                        {/* Registration Form */}
                        <form onSubmit={handleRegisterAdmin} className="space-y-4">
                          <p className="text-xs font-black uppercase tracking-wider text-amber-500">
                            Foomka Diiwaan-gelinta Staff
                          </p>

                          {regSuccess && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300/30 rounded-2xl text-xs font-bold leading-relaxed">
                              ✅ {regSuccess}
                            </div>
                          )}

                          {regError && (
                            <div className="p-3 bg-red-50 dark:bg-red-955/15 text-red-500 border border-red-300/10 rounded-xl text-xs font-bold">
                              ⚠️ {regError}
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                              Magaca oo Buuxa (Full Name) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Fadlan qor magaca..."
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value)}
                              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                Namberka Telefoonka <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="Tusaale: 061XXXX"
                                value={regNumber}
                                onChange={(e) => setRegNumber(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-105 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                Email-ka <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                required
                                placeholder="Email..."
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-705 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                Username-ka <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="ex. cali"
                                value={regUsername}
                                onChange={(e) => setRegUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                              />
                            </div>

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
                                  className="w-full pl-4 pr-10 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-105 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegPassword(!showRegPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                                >
                                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            id="btn_submit_registered_admin"
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-955 font-extrabold text-xs py-3 rounded-xl hover:shadow-lg active:scale-95 transition-all text-center cursor-pointer"
                          >
                            Diiwaan-geli Staff-kaan
                          </button>
                        </form>

                        {/* Sub Admins list */}
                        <div className="space-y-4">
                          <p className="text-xs font-black uppercase tracking-wider text-amber-500">
                            Maamulayaasha Diiwaan-gashan ({adminStaffList.length})
                          </p>
                          <div className="space-y-2 max-h-[380px] overflow-y-auto">
                            {adminStaffList.map((admin: AdminUser) => (
                              <div 
                                key={admin.id} 
                                className="p-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-805 flex justify-between items-center"
                              >
                                <div>
                                  <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-tight">
                                    {admin.fullName}
                                  </h5>
                                  <span className="text-[9px] font-semibold text-zinc-400 block mt-1.5">
                                    User: <strong>{admin.username}</strong> | 📞 {admin.phone}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdminStaff(admin.id, admin.fullName)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg transition-colors cursor-pointer"
                                  title="Tirtir Admin-kaan"
                                >
                                  <Trash2 className="w-4.5 h-4.5 text-red-550" />
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

      {/* CONFIRMATOR POPUPS */}
      <AnimatePresence>
        {confirmDeleteOrderId && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteOrderId(null)}
              className="fixed inset-0 bg-neutral-950 cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-red-100 text-red-505 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Xaqiijinta Tirtirista
              </h4>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Ma hubtaa inaad tirtirto dalabakan rasmiga ah?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={executeDeleteOrder}
                  className="flex-1 bg-red-505 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Haa
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOrderId(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  Maya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteStaff && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteStaff(null)}
              className="fixed inset-0 bg-neutral-950 cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-red-100 text-red-505 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Ruqsaynta Shaqaalaha
              </h4>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed font-semibold">
                Ma hubtaa inaad ruqseesid shaqaalahaan: <strong className="text-zinc-900 dark:text-zinc-100">{confirmDeleteStaff.name}</strong>?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={executeDeleteAdminStaff}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Haa
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteStaff(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  Maya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteAd && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteAd(null)}
              className="fixed inset-0 bg-neutral-950 cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-red-100 text-red-550 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-505" />
              </div>
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Tirtirista Xayeysiiska
              </h4>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed font-semibold">
                Ma hubtaa inaad tirtirto xayeysiiskaan: <strong className="text-zinc-900 dark:text-zinc-100">{confirmDeleteAd.title}</strong>?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={executeDeleteAd}
                  className="flex-1 bg-red-550 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Haa
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAd(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  Maya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM ACCEPT ORDER MODAL */}
      <AnimatePresence>
        {confirmAcceptOrderId && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAcceptOrderId(null)}
              className="fixed inset-0 bg-neutral-950 cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-650 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Aqbalidda Dalabka
              </h4>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed font-bold">
                Ma hubtaa inaad aqbasho dalabkaan? (Haddii aad aqbasho macmiilka kama laaban karo dalabka).
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={executeAcceptOrder}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Haa
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAcceptOrderId(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  Maya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM REJECT ORDER MODAL */}
      <AnimatePresence>
        {confirmRejectOrderId && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmRejectOrderId(null)}
              className="fixed inset-0 bg-neutral-950 cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-red-100 text-red-650 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Diidmada Dalabka
              </h4>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed font-semibold">
                Ma hubtaa inaad diiddo dalabkaan?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={executeRejectOrder}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Haa
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRejectOrderId(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  Maya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUPER ADMIN: VIEW STAFF DETAILS RESOLVER MODAL */}
      <AnimatePresence>
        {viewingResolverOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingResolverOrder(null)}
              className="fixed inset-0 bg-neutral-950 cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCog className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="text-md font-extrabold text-zinc-900 dark:text-zinc-100">
                Xogta Shaqaalihii Xaliyay
              </h4>
              
              <div className="mt-4 text-xs space-y-2 text-left bg-zinc-50 dark:bg-zinc-955/45 p-3.5 border border-zinc-150 dark:border-zinc-800 rounded-2xl">
                <div>
                  <span className="text-zinc-405 block font-bold text-[10px] uppercase">Magaca Shaqaalaha:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold">{viewingResolverOrder.resolvedByAdminName || "Maamulaha Sare ee Balcad"}</strong>
                </div>
                <div>
                  <span className="text-zinc-405 block font-bold text-[10px] uppercase">Taleefan:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold">{viewingResolverOrder.resolvedByAdminPhone || "0612483838"}</strong>
                </div>
                <div>
                  <span className="text-zinc-405 block font-bold text-[10px] uppercase">Email:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold">{viewingResolverOrder.resolvedByAdminEmail || "balcadtravel@gmail.com"}</strong>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setViewingResolverOrder(null)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Xir (Close)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}