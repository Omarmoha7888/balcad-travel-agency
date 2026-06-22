/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Clock, CheckCircle, XCircle, Ban, AlertTriangle, 
  Plane, Hotel, Landmark, Compass, Car, FileText, User, Phone, Mail, ArrowRight
} from 'lucide-react';
import { LocalDB, subscribeToDBUpdates } from '../lib/db';
import { Order } from '../types';

export default function MyOrdersSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbTick, setDbTick] = useState(0);

  // States for customer cancellation confirmation modal
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  // Auto-fill from localStorage if customer had previous bookings or chats
  useEffect(() => {
    // Look up for previous email/phone used in bookings/chats
    try {
      const chats = LocalDB.getChats();
      if (chats.length > 0) {
        setSearchTerm(chats[0].userPhone || chats[0].userEmail || '');
        setActiveSearch(chats[0].userPhone || chats[0].userEmail || '');
      } else {
        const storedOrders = LocalDB.getOrders();
        if (storedOrders.length > 0) {
          setSearchTerm(storedOrders[0].data.phone || storedOrders[0].data.email || '');
          setActiveSearch(storedOrders[0].data.phone || storedOrders[0].data.email || '');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch orders when activeSearch or DB changes
  useEffect(() => {
    const handleSync = () => {
      const allOrders = LocalDB.getOrders();
      if (activeSearch.trim()) {
        const cleaned = activeSearch.trim().toLowerCase();
        // Filter by email or phone
        const filtered = allOrders.filter(
          o => (o.data.email && o.data.email.toLowerCase() === cleaned) || 
               (o.data.phone && o.data.phone.replace(/\s+/g, '') === cleaned.replace(/\s+/g, '')) ||
               (o.data.fullName && o.data.fullName.toLowerCase().includes(cleaned))
        );
        // Only show 3 most recent orders as requested
        setOrders(filtered.slice(0, 3));
      } else {
        setOrders([]);
      }
    };

    handleSync();
    const unsubscribe = subscribeToDBUpdates(handleSync);
    return () => unsubscribe();
  }, [activeSearch, dbTick]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const handleCancelClick = (orderId: string) => {
    setCancelingOrderId(orderId);
  };

  const confirmCancellation = () => {
    if (cancelingOrderId) {
      LocalDB.cancelOrder(cancelingOrderId);
      setCancelingOrderId(null);
      setDbTick(prev => prev + 1);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Socota (Processing)</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>La Aqbalay (Completed)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>La Diiday (Rejected)</span>
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-zinc-100 text-zinc-600 border border-zinc-300/30">
            <Ban className="w-3.5 h-3.5" />
            <span>La Joojiyay (Canceled)</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getServiceIcon = (type: Order['type']) => {
    switch (type) {
      case 'ticketing':
        return <Plane className="w-5 h-5 text-blue-500" />;
      case 'hotel':
        return <Hotel className="w-5 h-5 text-emerald-500" />;
      case 'visa':
        return <Landmark className="w-5 h-5 text-purple-500" />;
      case 'tour':
        return <Compass className="w-5 h-5 text-amber-500" />;
      case 'airport':
        return <Car className="w-5 h-5 text-teal-500" />;
      default:
        return <FileText className="w-5 h-5 text-zinc-550" />;
    }
  };

  const getServiceLabel = (type: Order['type']) => {
    switch (type) {
      case 'ticketing': return 'Qaybta Diyaaradaha (Flight Ticket)';
      case 'hotel': return 'Dalabka Huteelka (Hotel Booking)';
      case 'visa': return 'Adeega Fiisaha (Visa Application)';
      case 'tour': return 'Socdaalka Dalxiiska (Tour Package)';
      case 'airport': return 'Adeega Garoonka (Airport Transfer)';
      default: return 'Adeeg kale';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Info */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center justify-center gap-2">
          📋 Dalabyadaada (My Bookings)
        </h2>
        <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
          Ku qor Email-kaaga ama Taleefoonkaaga si aad u aragto 3-dii dalabaad ee kuugu dambeeyey oo faahfaahsan iyo heerka xaaladdoodu marayso.
        </p>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mb-10 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Gali Lambarkaaga ama Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-zinc-250 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
        >
          <span>Eeg</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Orders List View */}
      <div className="space-y-6">
        {activeSearch && orders.length === 0 && (
          <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-805 bg-zinc-50/50 dark:bg-zinc-950/20 max-w-md mx-auto">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Ma jiro dalab laga helay: "{activeSearch}"
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Fadlan hubi inaad isticmaashay isla Email-kii ama Taleefoonkii aad ku xiratay markii aad dalbanaysay adeegga.
            </p>
          </div>
        )}

        {orders.map((ord) => (
          <motion.div
            key={ord.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all"
          >
            {/* Header / Type / Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-805 rounded-2xl">
                  {getServiceIcon(ord.type)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {getServiceLabel(ord.type)}
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    ID: <strong className="font-mono text-zinc-500">{ord.id}</strong> • Dalbadey: {new Date(ord.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                {getStatusBadge(ord.status)}
              </div>
            </div>

            {/* Travel / Service details */}
            <div className="space-y-3 mb-6 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-805">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="text-zinc-500">Macaamiilka:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100">{ord.data.fullName}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="text-zinc-500">Taleefoon:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100">{ord.data.phone}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="text-zinc-500">Email:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">{ord.data.email}</strong>
                </div>

                {/* Type customized variables rendering */}
                {ord.type === 'ticketing' && (
                  <>
                    <div>🛄 Goobta bixitaanka: <strong className="text-amber-600 dark:text-amber-400 font-bold">{(ord.data as any).departure}</strong></div>
                    <div>🛬 Goobta u socoto: <strong className="text-amber-600 dark:text-amber-400 font-bold">{(ord.data as any).destination}</strong></div>
                    <div className="sm:col-span-2">👥 Dadka safaraya: <strong>{(ord.data as any).passengersCount} qof</strong></div>
                  </>
                )}

                {ord.type === 'hotel' && (
                  <div className="sm:col-span-2">🏨 Magaalada huteelka: <strong>{(ord.data as any).cityOrLocation}</strong></div>
                )}

                {ord.type === 'visa' && (
                  <>
                    <div>🗺️ Dalka dalxiiska: <strong>{(ord.data as any).country}</strong></div>
                    <div>🎫 Nooca fiisah: <strong>{(ord.data as any).visaType}</strong></div>
                  </>
                )}

                {ord.type === 'tour' && (
                  <>
                    <div>🌴 Xirmada: <strong className="text-amber-500">{(ord.data as any).packageName}</strong></div>
                    <div>👑 Heerka: <strong>{(ord.data as any).packageType}</strong></div>
                  </>
                )}

                {ord.type === 'airport' && (
                  <>
                    <div>📍 Wadanka: <strong>{(ord.data as any).country}</strong></div>
                    <div>✈️ Garoonka: <strong className="text-emerald-500">{(ord.data as any).airport}</strong></div>
                  </>
                )}
              </div>
            </div>

            {/* Cancel Actions */}
            {ord.status === 'processing' ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleCancelClick(ord.id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-black rounded-xl transition-all border border-red-200/20"
                >
                  Ka Laabo Dalabka (Cancel Request)
                </button>
              </div>
            ) : ord.status === 'accepted' ? (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic text-right font-bold bg-emerald-500/10 p-2 rounded-xl inline-block ml-auto">
                Maadaama dalabkaaga uu yahay mid la oggolaaday (Completed), ma laaban kartid hadda.
              </p>
            ) : null}
          </motion.div>
        ))}
      </div>

      {/* CONFIRMATION POPUP FOR CANCELLATION */}
      <AnimatePresence>
        {cancelingOrderId && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancelingOrderId(null)}
              className="fixed inset-0 bg-neutral-950"
            />
            {/* Box modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center z-10"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-md font-black text-zinc-900 dark:text-zinc-100">
                Xaqiiji Joojinta Dalabka
              </h4>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed font-bold">
                Ma hubtaa inaad rabto inaad ka laabato dalabkaan oo laga saaro liiska?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={confirmCancellation}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow"
                >
                  Haa (Yes)
                </button>
                <button
                  type="button"
                  onClick={() => setCancelingOrderId(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-805 text-zinc-850 dark:text-zinc-200 text-xs font-black py-2.5 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700"
                >
                  Maya (No)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
            }
