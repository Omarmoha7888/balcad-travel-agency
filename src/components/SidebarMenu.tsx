/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, PhoneCall, MessageSquare, ShieldAlert, Award, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'products' | 'about-us' | 'live-chat' | 'admin';
  setActiveTab: (tab: 'products' | 'about-us' | 'live-chat' | 'admin') => void;
}

export default function SidebarMenu({
  isOpen,
  onClose,
  activeTab,
  setActiveTab
}: SidebarMenuProps) {

  const handleLinkClick = (tabId: 'products' | 'about-us' | 'live-chat' | 'admin') => {
    onClose();
    setActiveTab(tabId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Sliding Menu Shell */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto"
          >
            {/* Header Area */}
            <div>
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-amber-400 to-yellow-400 text-zinc-950">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <Logo size={40} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm tracking-tight">Balcad Travel</h2>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold opacity-75 leading-none">Wakaalad Socdaal</p>
                  </div>
                </div>
                <button
                  id="btn_close_sidebar"
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-900" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-2">
                <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                  Qaybaha Shirkadda
                </p>

                {/* Section 1 Link */}
                <button
                  type="button"
                  onClick={() => handleLinkClick('products')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    activeTab === 'products'
                      ? 'bg-amber-50 dark:bg-amber-950/25 text-amber-605 dark:text-amber-400 font-semibold border border-amber-400/20'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>Adeegyada (Products)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* Section 2 Link */}
                <button
                  type="button"
                  onClick={() => handleLinkClick('about-us')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    activeTab === 'about-us'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 font-semibold border border-emerald-550/15'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PhoneCall className="w-4 h-4 text-emerald-500" />
                    <span>Xogta & Xiriirka (About Us)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* Section 3 Link */}
                <button
                  type="button"
                  onClick={() => handleLinkClick('live-chat')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    activeTab === 'live-chat'
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-405 font-semibold border border-blue-550/15'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Live Chat (Support)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <div className="my-4 border-t border-zinc-100 dark:border-zinc-800" />

                <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                  Maamulka
                </p>

                {/* Admin Panel Link */}
                <button
                  type="button"
                  onClick={() => handleLinkClick('admin')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className={`w-4 h-4 ${activeTab === 'admin' ? 'text-zinc-900' : 'text-red-500'}`} />
                    <span>Dashboorka Admin-ka</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </div>

            {/* Compact Information Area */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-center">
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
                  Balcad Travel Agency
                </span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 block">
                  Balcad, Somalia
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
