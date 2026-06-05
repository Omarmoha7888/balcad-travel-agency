/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Hotel, Landmark, Compass, Car, Check, AlertCircle, X, MapPin } from 'lucide-react';
import { LocalDB } from '../lib/db';
import { ALL_COUNTRIES, getAirportsForCountry } from '../data/airports';

// List of products with beautiful Circular/Rounded themes
interface ServiceItem {
  id: string;
  titleKey: 'ticketing' | 'hotel' | 'visa' | 'tour' | 'airport';
  titleSomali: string;
  descriptionSomali: string;
  imageUrl: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'ticket',
    titleKey: 'ticketing',
    titleSomali: "Tikidhada Diyaaradaha (Ticketing)",
    descriptionSomali: "Tikidho jaban oo ku socda madaar kasta oo caalami ah ama gudaha ah oo si dhakhso ah laguugu goynayo.",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400",
    icon: Plane
  },
  {
    id: 'hotel',
    titleKey: 'hotel',
    titleSomali: "Qabsashada Huteelada (Hotel Booking)",
    descriptionSomali: "Dalbo huteelka kuugu habboon oo leh qiimo dhimis gaar ah oo ku saabsan booqashooyinkaaga.",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400",
    icon: Hotel
  },
  {
    id: 'visa',
    titleKey: 'visa',
    titleSomali: "Adeegga Fiisaha (Visa Services)",
    descriptionSomali: "Waxaan kaa caawinaynaa fududaynta qaadashada fiisooyinka dalxiiska, waxbarashada, iyo shaqada.",
    imageUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=400",
    icon: Landmark
  },
  {
    id: 'tour',
    titleKey: 'tour',
    titleSomali: "Xirmooyinka Dalxiiska (Tour Packages)",
    descriptionSomali: "Safarro lagugu diyaariyey oo la qorsheeyey sida Xajka, Cumrada, Turkiga iyo magaalooyin kale oo caan ah.",
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=400",
    icon: Compass
  },
  {
    id: 'airport',
    titleKey: 'airport',
    titleSomali: "Gaadiidka Garoonka (Airport Transfer)",
    descriptionSomali: "Gaadiid diyaar ah oo kugu kaa sugaya madaarka marka aad soo degto ama ku geynaya marka aad dhoofayso.",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400",
    icon: Car
  }
];

// Seeded destinations for tour packages
const TOUR_PACKAGES_LIST = [
  { id: 'hajj_umrah', name: "Xajka iyo Cumrada (Makkah & Madinah)" },
  { id: 'tr_ist', name: "Dalxiiska Istanbul & Antalya (Turkey)" },
  { id: 'ke_nbo', name: "Dalxiiska Nairobi & Mombasa (Kenya)" },
  { id: 'so_mgq', name: "Dalxiiska Xeebta Geeska Afrika (Mogadishu & Kismayo)" },
  { id: 'ae_dxb', name: "Ganacsiga iyo Dalxiiska Dubai (UAE)" }
];

export default function ProductsSection() {
  const [activeFormType, setActiveFormType] = useState<ServiceItem['titleKey'] | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Common Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Service specific form states
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [passengersCount, setPassengersCount] = useState(1);
  const [cityOrLocation, setCityOrLocation] = useState("");
  const [visaCountry, setVisaCountry] = useState("");
  const [visaType, setVisaType] = useState<'Dalxiis' | 'Waxbarasho' | 'Shaqo'>('Dalxiis');
  const [selectedTourPackage, setSelectedTourPackage] = useState(TOUR_PACKAGES_LIST[0].name);
  const [tourClass, setTourClass] = useState<'VIP' | 'Caadi'>('Caadi');

  // Airport transfer dropdown states
  const [transferCountry, setTransferCountry] = useState("Somalia");
  const [transferAirport, setTransferAirport] = useState("");

  // Error validations
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenForm = (type: ServiceItem['titleKey']) => {
    setActiveFormType(type);
    setErrors({});
    // Reset inputs
    setFullName("");
    setPhone("");
    setEmail("");
    setDeparture("");
    setDestination("");
    setPassengersCount(1);
    setCityOrLocation("");
    setVisaCountry("");
    setVisaType('Dalxiis');
    setSelectedTourPackage(TOUR_PACKAGES_LIST[0].name);
    setTourClass('Caadi');
    setTransferCountry("Somalia");
    const defaultAirports = getAirportsForCountry("Somalia");
    setTransferAirport(defaultAirports[0] || "");
  };

  const handleCountryChange = (c: string) => {
    setTransferCountry(c);
    const airports = getAirportsForCountry(c);
    setTransferAirport(airports[0] || "");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Fadlan qor magacaaga oo buuxa";
    if (!phone.trim()) newErrors.phone = "Fadlan qor lambarkaaga telefoonka";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Macaamiil, qor email sax ah";

    if (activeFormType === 'ticketing') {
      if (!departure.trim()) newErrors.departure = "Kaga bax meesha ka bixidda";
      if (!destination.trim()) newErrors.destination = "Ku dar meesha u socodka";
      if (passengersCount < 1) newErrors.passengersCount = "Tirada rikaabku waa inay ugu yaraan ahaato 1";
    } else if (activeFormType === 'hotel') {
      if (!cityOrLocation.trim()) newErrors.cityOrLocation = "Qor magaalada aad rabo huteelka";
    } else if (activeFormType === 'visa') {
      if (!visaCountry.trim()) newErrors.visaCountry = "Qor wadanka aad u baahan tahay fiisaha";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let orderData: any = {};

    if (activeFormType === 'ticketing') {
      orderData = { fullName, phone, email, departure, destination, passengersCount };
    } else if (activeFormType === 'hotel') {
      orderData = { fullName, phone, email, cityOrLocation };
    } else if (activeFormType === 'visa') {
      orderData = { fullName, phone, email, country: visaCountry, visaType };
    } else if (activeFormType === 'tour') {
      orderData = { fullName, phone, email, packageName: selectedTourPackage, packageType: tourClass };
    } else if (activeFormType === 'airport') {
      orderData = { fullName, phone, email, country: transferCountry, airport: transferAirport };
    }

    if (activeFormType) {
      // Save directly to localized persistent DB
      LocalDB.createOrder(activeFormType, orderData);

      // Setup and show success modal
      const SomaliTitles: Record<string, string> = {
        ticketing: "Tikid-goynta",
        hotel: "Booska Huteelka",
        visa: "Adeegga Fiisaha",
        tour: "Xirmada Dalxiiska",
        airport: "Gaadiidka Garoonka"
      };
      
      setSuccessMessage(`Waad ku mahadsan tahay macaamiil! Dalabkaaga ${SomaliTitles[activeFormType] || ""} waa la helay. Kooxda Balcad Travel Agency ayaa isla markiiba kula soo xiriiri doona lambarkaaga: ${phone}.`);
      setActiveFormType(null);
      setShowSuccessModal(true);
    }
  };

  return (
    <section id="products" className="py-16 px-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-100 dark:bg-amber-950/50 px-3 py-1 pb-1.5 rounded-full inline-block mb-3 border border-amber-300/30">
            Waxa Aan Bixino
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">
            Adeegyada Balcad Travel Agency
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Meel qudha ka ballanso dhammaan baahiyahaaga socdaal. Waxaan bixinaa adeegyo degdeg ah oo la isku halleyn karo. Garaac badhanka <strong className="text-amber-500 font-semibold">Dalbo</strong> si aad u buuxiso faahfaahinta.
          </p>
        </div>

        {/* Dynamic Advertisements Block */}
        <div className="mb-14 p-1 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500">
          <div className="bg-white dark:bg-zinc-900 rounded-[22px] p-6">
            <h3 className="text-md font-bold text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block animate-ping" />
              Dalabyada Gaarka ah ee Toddobaadkan (Ads)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LocalDB.getAds().map((ad) => (
                <div 
                  key={ad.id} 
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:shadow-md transition-shadow"
                >
                  <img 
                    src={ad.image || "https://images.unsplash.com/photo-1542856391-010fb87dcfed"} 
                    alt={ad.title} 
                    className="w-full sm:w-28 h-28 object-cover rounded-lg shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-snug">{ad.title}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 lines-clamp-3">{ad.description}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleOpenForm('tour')}
                      className="mt-3 sm:mt-0 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start"
                    >
                      Boor-garayso hadda →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Circular / Rounded Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {SERVICES.map((serv) => {
            const IconComponent = serv.icon;
            return (
              <div
                key={serv.id}
                className="group relative flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* CIRCULAR Avatar/Image Feature of Section 1 */}
                <div className="relative w-44 h-44 rounded-full overflow-hidden p-1.5 border-4 border-amber-400 group-hover:border-zinc-900 dark:group-hover:border-amber-400 transition-colors duration-300 mb-6 bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={serv.imageUrl}
                    alt={serv.titleSomali}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Absolute Floating Icon inside Circle */}
                  <div className="absolute bottom-2 right-2 bg-amber-400 hover:bg-yellow-500 text-zinc-950 p-2.5 rounded-full shadow-md z-10">
                    <IconComponent className="w-5 h-5 text-zinc-950" />
                  </div>
                </div>

                {/* Card Title & Desc */}
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                  {serv.titleSomali}
                </h3>
                
                <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 flex-grow px-2">
                  {serv.descriptionSomali}
                </p>

                {/* GOLDEN BUTTON with Circular features */}
                <button
                  id={`btn_order_${serv.id}`}
                  type="button"
                  onClick={() => handleOpenForm(serv.titleKey)}
                  className="mt-6 w-full max-w-[180px] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 hover:from-amber-500 hover:to-amber-600 font-extrabold text-xs py-3 px-6 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all text-center leading-none"
                >
                  Dalbo Adeega
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* RENDER DYNAMIC FORMS MODAL */}
      <AnimatePresence>
        {activeFormType && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFormType(null)}
              className="fixed inset-0 bg-neutral-950"
            />

            {/* Form Content container */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-xl border border-zinc-200 dark:border-zinc-800 z-10"
            >
              {/* Gold Header */}
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {activeFormType === 'ticketing' && <Plane className="w-5 h-5" />}
                  {activeFormType === 'hotel' && <Hotel className="w-5 h-5" />}
                  {activeFormType === 'visa' && <Landmark className="w-5 h-5" />}
                  {activeFormType === 'tour' && <Compass className="w-5 h-5" />}
                  {activeFormType === 'airport' && <Car className="w-5 h-5" />}
                  
                  <h3 className="font-extrabold text-sm tracking-tight capitalize">
                    Foomka Dalabka: {
                      activeFormType === 'ticketing' ? "Tikidhada" :
                      activeFormType === 'hotel' ? "Hotel Book" :
                      activeFormType === 'visa' ? "Adeegga Visa" :
                      activeFormType === 'tour' ? "Xirmooyinka" : "Gaadiidka Garoonka"
                    }
                  </h3>
                </div>
                
                <button
                  type="button"
                  onClick={() => setActiveFormType(null)}
                  className="p-1.5 bg-zinc-950/10 hover:bg-zinc-950/20 active:scale-95 rounded-full transition-all"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-zinc-950" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* 1. Common Input: Full Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Magacaaga oo Buuxa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tusaale: Maxamed Cali Axmed"
                    className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</p>}
                </div>

                {/* 2. Common Input: Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Lambarka Telefoonka <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Tusaale: 061XXXXXXXX"
                      className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                  </div>

                  {/* 3. Common Input: Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Email-kaaga <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="cali@gmail.com"
                      className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                  </div>
                </div>

                {/* SPECIFIC FORM TYPE FIELDS */}

                {/* TYPE 1: Ticketing FIELDS */}
                {activeFormType === 'ticketing' && (
                  <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Meesha ka Bixidda (Departure) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={departure}
                          onChange={(e) => setDeparture(e.target.value)}
                          placeholder="Mogadishu (MGQ)"
                          className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        {errors.departure && <p className="text-xs text-red-500 mt-1">{errors.departure}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Meesha u Socodka (Destination) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Istanbul (IST)"
                          className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Tirada Rikaabka (Passengers Count)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={passengersCount}
                        onChange={(e) => setPassengersCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* TYPE 2: Hotel Booking FIELDS */}
                {activeFormType === 'hotel' && (
                  <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Magaca Magaalada / Meesha aad Rabto Huteelka <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cityOrLocation}
                        onChange={(e) => setCityOrLocation(e.target.value)}
                        placeholder="Makkah ama Istanbul ama Mogadishu"
                        className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      {errors.cityOrLocation && <p className="text-xs text-red-500 mt-1">{errors.cityOrLocation}</p>}
                    </div>
                  </div>
                )}

                {/* TYPE 3: Visa Services FIELDS */}
                {activeFormType === 'visa' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Wadanka aad u Socoto <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={visaCountry}
                        onChange={(e) => setVisaCountry(e.target.value)}
                        placeholder="Turkey, Kenya, UAE, msn"
                        className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      {errors.visaCountry && <p className="text-xs text-red-500 mt-1">{errors.visaCountry}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Nooca Fiisaha (Visa Type)
                      </label>
                      <select
                        value={visaType}
                        onChange={(e) => setVisaType(e.target.value as any)}
                        className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="Dalxiis">Dalxiis (Tourism)</option>
                        <option value="Waxbarasho">Waxbarasho (Education / Study)</option>
                        <option value="Shaqo">Shaqo (Work visa)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TYPE 4: Tour Packages FIELDS */}
                {activeFormType === 'tour' && (
                  <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Nooca Xirmada (Package Options)
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-700 flex-1 hover:border-amber-400">
                            <input
                              type="radio"
                              name="tourClass"
                              checked={tourClass === 'Caadi'}
                              onChange={() => setTourClass('Caadi')}
                              className="accent-amber-500"
                            />
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Caadi (Standard)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-700 flex-1 hover:border-amber-400">
                            <input
                              type="radio"
                              name="tourClass"
                              checked={tourClass === 'VIP'}
                              onChange={() => setTourClass('VIP')}
                              className="accent-amber-500"
                            />
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">⭐ VIP Class</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Dooro Goobta Dalxiiska
                        </label>
                        <select
                          value={selectedTourPackage}
                          onChange={(e) => setSelectedTourPackage(e.target.value)}
                          className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          {TOUR_PACKAGES_LIST.map((pkg) => (
                            <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TYPE 5: Airport Transfer FIELDS with DYNAMIC DROPDOWNS */}
                {activeFormType === 'airport' && (
                  <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex gap-2 items-start">
                      <MapPin className="w-4.5 h-4.5 text-amber-505 shrink-0 mt-0.5" />
                      <p>
                        Markaad doorataa dalka aad joogto, waxaa si automatic ah safka danbe kuugu soo baxaya madaaradda rasmiga ah ee dalkaas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Dropdown 1: Country */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Dooro Dalka (Select Country)
                        </label>
                        <select
                          value={transferCountry}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          {ALL_COUNTRIES.map((countryName) => (
                            <option key={countryName} value={countryName}>{countryName}</option>
                          ))}
                        </select>
                      </div>

                      {/* Dropdown 2: Dynamic Airports */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                          Madaarka (Airports in Country)
                        </label>
                        <select
                          value={transferAirport}
                          onChange={(e) => setTransferAirport(e.target.value)}
                          className="w-full px-4 py-2.5 border border-zinc-250 dark:border-zinc-700 bg-amber-50/50 dark:bg-zinc-800 font-medium text-amber-700 dark:text-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          {getAirportsForCountry(transferCountry).map((port) => (
                            <option key={port} value={port}>{port}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    id="btn_submit_order_form"
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 hover:from-amber-500 hover:to-amber-600 font-extrabold text-xs py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Dhammaystir Dalabka</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="fixed inset-0 bg-neutral-950"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 text-center z-10"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300/30 text-emerald-505 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic">
                Waad ku Guuleystay!
              </h3>
              <p className="mt-3 text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-zinc-950 text-xs font-bold py-3 px-6 rounded-xl transition-all"
              >
                Haa, Waa Yahay
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
