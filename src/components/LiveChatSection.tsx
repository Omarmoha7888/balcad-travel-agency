/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Image as ImageIcon, X, Circle, HelpCircle, CheckCheck, Loader2 } from 'lucide-react';
import { LocalDB, subscribeToDBUpdates } from '../lib/db';
import { ChatSession } from '../types';

export default function LiveChatSection() {
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false); // Waxaan ku darnay tan si AI-ga uu u muuqdo inuu fikirayo

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Load active session
  useEffect(() => {
    const checkActiveSession = () => {
      const storedActiveId = localStorage.getItem('active_client_chat_id');
      if (storedActiveId) {
        const chats = LocalDB.getChats();
        const found = chats.find(c => c.id === storedActiveId && c.active);
        setActiveSession(found || null);
      } else {
        setActiveSession(null);
      }
    };
    checkActiveSession();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

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
    if (!activeSession) return;

    const messageText = typedMessage.trim();
    if (!messageText && !attachedImage) return;

    // 1. U dir fariinta macaamiisha
    const updated = LocalDB.addMessageToChat(activeSession.id, 'user', messageText, undefined, attachedImage || undefined);
    if (updated) {
      setActiveSession({ ...updated });
      setTypedMessage("");
      setAttachedImage(null);

      // 2. Halkan ku dar jawaabta AI-ga
      setIsAiLoading(true);
      try {
        // Halkan geli logic-ga AI-gaaga (API call)
        // Tusaale: const aiResponse = await fetchAIResponse(messageText);
        // LocalDB.addMessageToChat(activeSession.id, 'ai', aiResponse);
        // setActiveSession({...});
      } catch (error) {
        console.error("AI Error:", error);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  // Halkan hoose waa halka aad ku samaynayso render-ka interface-ka chat-ka...
  return (
    // Ku dar koodhkii UI-gaaga halkan
    <div>
      {/* Interface-ka Chat-ka */}
    </div>
  );
}

