/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Image, X, Circle, HelpCircle, CheckCheck, Loader2 } from 'lucide-react';
import { LocalDB, subscribeToDBUpdates } from '../lib/db';
import { ChatSession } from '../types';

export default function LiveChatSection() {
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Chat message inputs
  const [typedMessage, setTypedMessage] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load active session from localStorage on mount (if still active)
  useEffect(() => {
    const checkActiveSession = () => {
      const storedActiveId = localStorage.getItem('active_client_chat_id');
      if (storedActiveId) {
        const chats = LocalDB.getChats();
        const found = chats.find(c => c.id === storedActiveId && c.active);
        if (found) {
          setActiveSession(found);
        } else {
          // If no longer found or inactive, clear local key
          localStorage.removeItem('active_client_chat_id');
          setActiveSession(null);
        }
      } else {
        setActiveSession(null);
      }
    };

    checkActiveSession();

    // Subscribe to multi-window/tab database syncs (real-time chat!)
    const unsubscribe = subscribeToDBUpdates(() => {
      checkActiveSession();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Soft auto-scroll on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Handle Form Submission to start Chat
  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg("Fadlan buuxi dhammaan meelaha banaan") ;
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("Fadlan qor email sax ah");
      return;
    }

    // Start in local db
    const session = LocalDB.startChat(fullName, phone, email);
    localStorage.setItem('active_client_chat_id', session.id);
    setActiveSession(session);
  };

  //   // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || (!typedMessage.trim() && !attachedImage)) return;

    const userText = typedMessage.trim();
    
    // 1. Marka hore, fariinta macaamilka ku dar database-ka
    const updatedWithUser = LocalDB.addMessageToChat(
      activeSession.id, 
      'user', 
      userText, 
      undefined, 
      attachedImage || undefined
    );
    
    setActiveSession({ ...updatedWithUser });
    setTypedMessage("");
    setAttachedImage(null);
    setIsAiLoading(true);

    // 2. Halkan waxaan u diraynaa fariinta AI-ga (Gemini API)
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }]
        })
      });

      const data = await response.json();
      const aiResponseText = data.candidates[0].content.parts[0].text;

      // 3. Jawaabta AI-ga ku dar database-ka (sender: 'ai')
      const updatedWithAi = LocalDB.addMessageToChat(activeSession.id, 'ai', aiResponseText);
      setActiveSession({ ...updatedWithAi });

    } catch (error) {
      console.error("AI wuu fashilmay:", error);
      LocalDB.addMessageToChat(activeSession.id, 'ai', "Waan ka xumahay, hadda ma awoodo inaan jawaabo, fadlan isku day mar kale.");
    } finally {
      setIsAiLoading(false);
    }
  };

    
    // 2. Reset states
    setTypedMessage("");
    setAttachedImage(null);

    // 3. AI-ga ayaa u jawaabaya
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageText }),
      });
      const data = await response.json();

      // 4. Ku dar jawaabta AI-ga ee database-ka
      const updatedWithAI = LocalDB.addMessageToChat(activeSession.id, 'assistant', data.text);
      if (updatedWithAI) {
        setActiveSession({ ...updatedWithAI });
      }
    } catch (error) {
      console.error("AI-ga wuu ka jawaabi waayay:", error);
    }
  };


  // Convert uploaded image to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Fadlan dooro sawir kaliya");
        return;
      }
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Close active chat
  const handleCloseChat = () => {
    if (activeSession) {
      // 1. Mark as inactive in DB
      LocalDB.closeChat(activeSession.id);
      // 2. Clear client session
      localStorage.removeItem('active_client_chat_id');
      setActiveSession(null);
      // 3. Reset fields
      setFullName("");
      setPhone("");
      setEmail("");
    }
  };

  return (
    <section id="live-chat" className="py-16 px-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        {/* Title block */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-100 dark:bg-amber-950/50 px-3 py-1 pb-1.5 rounded-full inline-block mb-3 border border-amber-300/30">
            Wada-sheekaysi Toos Ah
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Taageerada Wada-sheekaysiga
          </h2>
          <p className="mt-3 text-xs text-zinc-550 dark:text-zinc-400 max-w-xl mx-auto">
            Ma u baahan tahay caawimaad dhow oo degdeg ah? Nala hadal hadda. Kooxda shaqada ee Balcad Travel Agency ayaa halkan kuugu diyaarsan 24/7.
          </p>
        </div>

        {/* Outer Chat Box Container */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xl max-w-2xl mx-auto">
          
          <AnimatePresence mode="wait">
            {!activeSession ? (
              
              /* PRE-CHAT REGISTRATION FORM */
              <motion.div
                key="chat-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-400 text-zinc-950 rounded-2xl">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-md text-zinc-900 dark:text-zinc-100">
                      Ku Biir Wada-sheekaysiga
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Macaamiil, buuxi foomkan yar si aad u bilowdo wadahadalka kooxdeena.
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-300/30 rounded-xl text-xs font-bold">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <form onSubmit={handleStartChat} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Magacaaga oo Buuxa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Maxamed Cali"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Phone/Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Lambarka Telefoonka <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="061XXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Email-kaaga <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="cali@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    id="btn_start_chat_session"
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-extrabold text-xs py-3.5 rounded-xl hover:shadow-lg active:scale-95 transition-all outline-none"
                  >
                    Bilow Wada-sheekaysiga
                  </button>
                </form>
              </motion.div>

            ) : (

              /* ACTIVE LIVE CHAT ROOM */
              <motion.div
                key="chat-room"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-[500px]"
              >
                {/* Chat Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 bg-amber-400 text-zinc-950 font-extrabold flex items-center justify-center rounded-full text-xs shadow-sm capitalize">
                        {activeSession.userName.substring(0, 2)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-zinc-950 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-none">
                        {activeSession.userName}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
                        Balcad Live Support
                      </span>
                    </div>
                  </div>
                  
                  {/* CLOSE CHAT BUTTON OF CONSTRAINTS */}
                  <button
                    id="btn_close_active_chat"
                    type="button"
                    onClick={handleCloseChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-300/10 hover:border-red-300/20 text-[10px] font-bold rounded-full transition-all"
                    title="Xar ga sheekaysiga si ammaan ah"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Xir Chat-ka</span>
                  </button>
                </div>

                {/* Messages Feed View */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/20 dark:bg-zinc-950/10">
                  <div className="text-center my-2 text-[10px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full w-max mx-auto uppercase tracking-wider">
                    Bilowgii Wada-sheekaysiga
                  </div>
                  
                  {activeSession.messages.map((msg) => {
                    const isMe = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-zinc-900 text-white dark:bg-amber-400 dark:text-zinc-950 rounded-tr-none' 
                            : 'bg-zinc-150 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-none'
                        }`}>
                          {/* Text message if exists */}
                          {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                          
                          {/* Uploaded Photo rendering inside Chat */}
                          {msg.image && (
                            <div className="mt-1.5 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
                              <img
                                src={msg.image}
                                alt="Chat attachment"
                                className="w-full max-h-40 object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          <span className={`text-[9px] block text-right mt-1.5 opacity-60`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>

                {/* Attached image preview buffer */}
                {attachedImage && (
                  <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={attachedImage} 
                        alt="Preview upload file" 
                        className="w-10 h-10 object-cover rounded-md border border-amber-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] font-bold text-amber-500">
                        Sawir la xiriiriyey (Ready to send)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="p-1 bg-zinc-950/10 hover:bg-zinc-950/20 rounded-full transition-all"
                    >
                      <X className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                    </button>
                  </div>
                )}

                {/* Chat Control Input Bar */}
                <form 
                  onSubmit={handleSendMessage} 
                  className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2"
                >
                  {/* File input for Picture Gallery upload */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-650 dark:text-zinc-355 rounded-xl transition-all relative shrink-0"
                    title="Soo rar sawir"
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin text-amber-500" />
                    ) : (
                      <Image className="w-4.5 h-4.5 text-zinc-550 dark:text-zinc-400" />
                    )}
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    placeholder="Qor farriintaada..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />

                  {/* Send Action */}
                  <button
                    id="btn_send_chat_msg"
                    type="submit"
                    className="p-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all outline-none text-xs shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
    }


