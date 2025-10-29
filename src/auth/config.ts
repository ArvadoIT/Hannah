/**
 * NextAuth Configuration
 * Authentication setup with MongoDB adapter and credentials provider
 */

import { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getMongoClient, getDatabase } from '@/lib/db';
import { loginSchema } from '@/lib/validators';

export const authOptions: NextAuthOptions = {
  // Use MongoDB adapter for session storage
  adapter: MongoDBAdapter(getMongoClient()) as any,
  
  // Configure authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validated = loginSchema.parse(credentials);
          
          // Get user from database
          const db = await getDatabase();
          const user = await db.collection('users').findOne({
            email: validated.email,
          });

          if (!user) {
            console.error('User not found:', validated.email);
            return null;
          }

          // Check password
          const passwordMatch = await bcrypt.compare(
            validated.password,
            user.hashedPassword || ''
          );

          if (!passwordMatch) {
            console.error('Invalid password for user:', validated.email);
            return null;
          }

          // Return user object (without password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'client',
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Add user role and id to token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Add role and id to session
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // Pages
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },

  // Security
  secret: process.env.NEXTAUTH_SECRET,
  
  // Cookie settings
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
};

