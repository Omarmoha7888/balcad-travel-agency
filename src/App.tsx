/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import SidebarMenu from './components/SidebarMenu';
import ProductsSection from './components/ProductsSection';
import AboutUsSection from './components/AboutUsSection';
import LiveChatSection from './components/LiveChatSection';
import AdminDashboard from './components/AdminDashboard';
import { Compass, Users, Award, ShieldAlert } from 'lucide-react';

export default function App() {
  const darkMode = false;
  const setDarkMode = () => {};
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'about-us' | 'live-chat' | 'admin'>('products');

  // Ensure dark mode is disabled on mount
  useEffect(() => {
    localStorage.setItem('balcad_theme_dark', 'false');
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-900">
      
      {/* 1. Header component (with toggle) */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* 2. Responsive sliding Menu Selector */}
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 3. Main Master Viewports */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab !== 'admin' ? (
            
            /* CLIENT FACING VIEWPORT CONTAINER */
            <motion.div
              key="client-portal"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
            >
              
              {/* Eye-catching Hero Area with Unsplash visuals */}
              <div className="relative py-20 px-4 overflow-hidden bg-neutral-950 text-white border-b border-amber-400/25">
                <div className="absolute inset-0 z-0 opacity-40">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200"
                    alt="Scenic Travel View"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex gap-2 items-center px-4 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-400 font-bold text-xs uppercase tracking-widest leading-none"
                  >
                    <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>Balcad, Somalia</span>
                  </motion.div>

                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight italic">
                    U Boqo Caalamka Si Fudud & Raxmad leh!
                  </h2>

                  <p className="text-sm md:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                    Wakaaladda Socdaalka iyo Dalxiiska ee <strong className="text-amber-400 font-extrabold">Balcad Travel Agency</strong> waxay kuugu adeegaysaa Tikidhada Diyaaradaha, Diyaarinta Hoteelada, Adeega Fiisooyinka, iyo Dalxiiska gudihiisa iyo dibadiisaba.
                  </p>
                </div>

   

              
 

              {/* RENDER ONLY ACTIVE SECTION VIEW ON SCREEN */}
              <div className="py-2">
                <AnimatePresence mode="wait">
                  {activeTab === 'products' && (
                    <motion.div
                      key="products-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductsSection />
                    </motion.div>
                  )}

                  {activeTab === 'about-us' && (
                    <motion.div
                      key="about-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AboutUsSection />
                    </motion.div>
                  )}

                  {activeTab === 'live-chat' && (
                    <motion.div
                      key="chat-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LiveChatSection />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          ) : (
            
            /* SECURE ADMINISTRATOR CONTROL PANEL VIEWPORT */
            <motion.div
              key="admin-portal"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-zinc-100 dark:bg-zinc-950/60 p-1 border-b border-zinc-200 dark:border-zinc-900">
                <div className="max-w-6xl mx-auto py-3 px-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-lg border border-amber-400/20 select-none cursor-pointer transition-colors"
                  >
                    ← Ku laabo bogga macmiilka
                  </button>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest font-bold">
                    Secured SSL Workspace
                  </span>
                </div>
              </div>
              
              {/* Admin Panel content */}
              <AdminDashboard />

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* STRICT NO FOOTER CONSTRAINT COMPLIED EXACTLY */}

    </div>
  );
}
