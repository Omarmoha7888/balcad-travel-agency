import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { LocalDB } from '../lib/db';
import { ChatSession } from '../types';

export default function LiveChatSection() {
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg("Fadlan buuxi dhammaan meelaha banaan");
      return;
    }
    const session = LocalDB.startChat(fullName, phone, email);
    localStorage.setItem('active_client_chat_id', session.id);
    setActiveSession(session);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !typedMessage.trim()) return;

    const updated = LocalDB.addMessageToChat(activeSession.id, 'user', typedMessage);
    setActiveSession({ ...updated });
    setTypedMessage("");
    
    setIsAiLoading(true);
    // Halkan ayaad ku dari kartaa wicitaanka API-gaaga
    setIsAiLoading(false);
  };

  return (
    <section className="p-4 bg-white shadow-lg rounded-lg max-w-md mx-auto">
      {!activeSession ? (
        <form onSubmit={handleStartChat} className="space-y-4">
          <h2 className="text-xl font-bold">Ku soo dhawaaw Balcad Travel</h2>
          <input className="w-full border p-2" placeholder="Magacaaga" onChange={(e) => setFullName(e.target.value)} />
          <input className="w-full border p-2" placeholder="Telefoonka" onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full border p-2" placeholder="Emailka" onChange={(e) => setEmail(e.target.value)} />
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
          <button className="w-full bg-blue-600 text-white p-2">Bilow Chat</button>
        </form>
      ) : (
        <div className="h-[400px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-2">
            {activeSession.messages.map((msg, i) => (
              <div key={i} className={`p-2 ${msg.sender === 'user' ? 'text-right bg-blue-100' : 'text-left bg-gray-100'}`}>
                {msg.text}
              </div>
            ))}
            {isAiLoading && <Loader2 className="animate-spin" />}
            <div ref={messageEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
            <input className="flex-1 border p-2" value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} placeholder="Fariin qor..." />
            <button className="bg-blue-600 text-white p-2"><Send size={20} /></button>
          </form>
        </div>
      )}
    </section>
  );
}


