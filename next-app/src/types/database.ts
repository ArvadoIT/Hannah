/**
 * Database Type Definitions
 * TypeScript interfaces for MongoDB collections
 */

import { ObjectId } from 'mongodb';

/**
 * User document (managed by NextAuth)
 */
export interface User {
  _id: ObjectId;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  role: 'admin' | 'stylist' | 'client';
  hashedPassword?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Appointment document
 */
export interface Appointment {
  _id: ObjectId;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  service: string;
  stylist?: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  consentAccepted: boolean;
  consentDate: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message document (contact form submissions)
 */
export interface Message {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  message: string;
  consentAccepted: boolean;
  consentDate: Date;
  status: 'new' | 'read' | 'responded' | 'archived';
  responded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service document
 */
export interface Service {
  _id: ObjectId;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: 'manicure' | 'pedicure' | 'nail-art' | 'special';
  active: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Analytics document
 */
export interface Analytics {
  _id: ObjectId;
  date: Date;
  appointments: number;
  revenue: number;
  newClients: number;
  popularServices: { service: string; count: number }[];
  createdAt: Date;
}

/**
 * Create types for insertions (without _id and timestamps)
 */
export type NewAppointment = Omit<Appointment, '_id' | 'createdAt' | 'updatedAt'>;
export type NewMessage = Omit<Message, '_id' | 'createdAt' | 'updatedAt'>;
export type NewService = Omit<Service, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * Update types (partial with required _id)
 */
export type UpdateAppointment = Partial<Omit<Appointment, '_id' | 'createdAt'>> & {
  _id: ObjectId;
  updatedAt: Date;
};

