/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TicketingOrder {
  fullName: string;
  phone: string;
  email: string;
  departure: string;
  destination: string;
  passengersCount: number;
}

export interface HotelBookingOrder {
  fullName: string;
  phone: string;
  email: string;
  cityOrLocation: string;
}

export interface VisaOrder {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  visaType: 'Dalxiis' | 'Waxbarasho' | 'Shaqo';
}

export interface TourOrder {
  packageType: 'VIP' | 'Caadi';
  packageName: string; // e.g., "Xajka iyo Cumrada", "Mugadishu Tour", "Istanbul Tour"
  fullName: string;
  phone: string;
  email: string;
}

export interface AirportTransferOrder {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  airport: string;
}

export interface Order {
  id: string;
  type: 'ticketing' | 'hotel' | 'visa' | 'tour' | 'airport';
  data: TicketingOrder | HotelBookingOrder | VisaOrder | TourOrder | AirportTransferOrder;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'admin';
  text?: string;
  image?: string; // Base64 or local object URL
  createdAt: string;
}

export interface ChatSession {
  id: string; // Dynamic unique ID preformed by combining email/phone/timestamp
  userName: string;
  userPhone: string;
  userEmail: string;
  messages: Message[];
  active: boolean; // becomes false when closed by user
  startedAt: string;
  lastMessageAt: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
}

export type AdminRole = 'super' | 'sub';

export interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  username: string;
  passwordHash: string; // In our simulated DB, just plaintext or simple hashed
  role: AdminRole;
  createdAt: string;
  createdBy?: string; // ID of the Super Admin who registered them
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image: string; // Base64 or local reference image
  createdAt: string;
}
