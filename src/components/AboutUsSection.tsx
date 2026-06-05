/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, MessageCircleCode, Mail, Award } from 'lucide-react';

export default function AboutUsSection() {
  
  // Direct dialer strings
  const phone1 = "0612483838";
  const phone2 = "0612141414";

  // Whatsapp links
  const whatsapp1 = "https://wa.me/252612483838";
  const whatsapp2 = "https://wa.me/252612141414";

  // Gmail address
  const gmailAddress = "balcadtravel@gmail.com";

  return (
    <section id="about-us" className="py-12 px-4 bg-white dark:bg-zinc-900 transition-colors duration-300 border-t border-zinc-100 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Title & Description of Section 2 */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-100 dark:bg-amber-950/50 px-3 py-1 pb-1.5 rounded-full inline-block mb-3 border border-amber-300/30">
            Nala baro & Na la xiriir
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">
            Ku saabsan Balcad Travel Agency
          </h2>
        </div>

        {/* Qoraalka Sharaxaada (Explanation Description Text) */}
        <div className="p-6 md:p-8 rounded-3xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 mb-8">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center mb-4 shadow-sm">
            <Award className="w-5 h-5 text-zinc-950" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Waa Kuma Balcad Travel Agency?
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-350 leading-relaxed mb-4">
            Balcad Travel Agency waa wakaalad u taagan u adeegidda bulshada Soomaaliyeed meel kasta oo ay joogaan. Waxaan aasaasnay shirkaddan si aan u dhowrno tayada, amniga, iyo badbaadada safaradaada caalamiga ah iyo kuwa gudaha.
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-350 leading-relaxed">
            Hadafkeenu waa inaan macaamiisha siino xal dhameystiran oo u sahlaya boosaska tikidhada diyaaradaha, diyaarinta huteelada barakeysan ama kuwa dalxiiska, foomamka fiisooyinka aduunka oo dhan, iyo daryeelidda socdaalka.
          </p>
        </div>

        {/* Buttons Gmailka iyo Numbers-ka (Gmail and Phone Dialers Buttons Panel) */}
        <div id="contact-buttons-panel" className="p-6 md:p-8 rounded-3xl bg-neutral-950 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-xl font-extrabold tracking-tight mb-3">
            Inaga Kula Xiriir Lambarada & Gmail-ka!
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl mb-6">
            Fadlan taabo mid ka mid ah badhamada hoose si aad u wacdo telefoonnada, ama noogu soo dirto farriinta WhatsApp iyo Gmail toos ah.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            
            {/* BUTTON 1: Dialer 0612483838 */}
            <a
              id="link_call_1"
              href={`tel:${phone1}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 transition-all text-left group"
            >
              <div className="p-2 bg-amber-400 text-zinc-950 rounded-lg group-hover:scale-105 transition-transform">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block leading-none mb-1">Direct Call 1</span>
                <span className="text-sm font-extrabold text-amber-400">{phone1}</span>
              </div>
            </a>

            {/* BUTTON 2: Dialer 0612141414 */}
            <a
              id="link_call_2"
              href={`tel:${phone2}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 transition-all text-left group"
            >
              <div className="p-2 bg-amber-400 text-zinc-950 rounded-lg group-hover:scale-105 transition-transform">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block leading-none mb-1">Direct Call 2</span>
                <span className="text-sm font-extrabold text-amber-400">{phone2}</span>
              </div>
            </a>

            {/* BUTTON 3: WhatsApp to 0612483838 */}
            <a
              id="link_whatsapp_1"
              href={whatsapp1}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 transition-all text-left group"
            >
              <div className="p-2 bg-emerald-500 text-white rounded-lg group-hover:scale-105 transition-transform">
                <MessageCircleCode className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block leading-none mb-1">WhatsApp 1</span>
                <span className="text-sm font-extrabold text-emerald-400">{phone1}</span>
              </div>
            </a>

            {/* BUTTON 4: WhatsApp to 0612141414 */}
            <a
              id="link_whatsapp_2"
              href={whatsapp2}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 transition-all text-left group"
            >
              <div className="p-2 bg-emerald-500 text-white rounded-lg group-hover:scale-105 transition-transform">
                <MessageCircleCode className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block leading-none mb-1">WhatsApp 2</span>
                <span className="text-sm font-extrabold text-emerald-400">{phone2}</span>
              </div>
            </a>

            {/* BUTTON 5: Gmail Direct application */}
            <a
              id="link_gmail_direct"
              href={`mailto:${gmailAddress}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 transition-all text-left sm:col-span-2 lg:col-span-1 group"
            >
              <div className="p-2 bg-amber-400 text-zinc-950 rounded-lg group-hover:scale-105 transition-transform">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block leading-none mb-1">Gmail Company</span>
                <span className="text-xs font-bold text-zinc-200">{gmailAddress}</span>
              </div>
            </a>

          </div>
        </div>

      </div>
    </section>
  );
}
