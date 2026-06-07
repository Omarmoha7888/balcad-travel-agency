/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sun, Moon, Menu } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSidebar: () => void;
}

export default function Header({ darkMode, setDarkMode, onOpenSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Left: Sidebar Toggle Hamburger & Web Logo */}
        <div className="flex items-center gap-3">
          <button
            id="btn_menu_hamburger"
            type="button"
            onClick={onOpenSidebar}
            className="p-2 hover:bg-white/20 active:bg-white/30 rounded-full transition-transform duration-200 active:scale-95"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5 text-zinc-900" />
          </button>
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-10 h-10 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
              <Logo size={40} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black tracking-wider text-zinc-900 uppercase leading-none font-sans">
                Balcad Travel
              </h1>
              <span className="text-[9px] font-extrabold tracking-widest text-zinc-800 uppercase leading-none mt-0.5">
                Agency
              </span>
            </div>
          </div>
        </div>

        {/* Center: Welcome Text in Somali */}
        <div className="text-center">
          
        </div>

        {/* Right: Beautiful Status Badge */}
      
        </div>

      </div>
    </header>
  );
}
