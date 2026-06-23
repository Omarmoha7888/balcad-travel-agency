/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'assistant';
  text?: string;
  image?: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  active: boolean;
  assignedAdminId?: string;
  assignedAdminName?: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface Order {
  id: string;
  type: 'ticketing' | 'hotel' | 'visa' | 'tour' | 'airport';
  createdAt: string;
  status: 'processing' | 'accepted' | 'rejected' | 'canceled';
  resolvedByAdminId?: string;
  resolvedByAdminName?: string;
  resolvedByAdminPhone?: string;
  resolvedByAdminEmail?: string;
  data: {
    fullName: string;
    phone: string;
    email: string;
    departure?: string;
    destination?: string;
    passengersCount?: number;
    cityOrLocation?: string;
    country?: string;
    visaType?: string;
    packageName?: string;
    packageType?: string;
    airport?: string;
  };
}

export interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  username: string;
  passwordHash: string; // Used for simple mock login validation
  role: 'super' | 'sub';
  createdBy?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image: string;
  createdAt: string;
}
