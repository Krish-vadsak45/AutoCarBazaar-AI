import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';

import { AuthUser } from '@/src/types';
import connectToDatabase from '@/lib/db';
import User from '@/models/user.model';
import Vendor from '@/models/vendor.model';

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ GitHub Provider
    GitHubProvider({
      clientId: process.env.PROVIDER_GITHUB_CLIENT_ID!,
      clientSecret: process.env.PROVIDER_GITHUB_CLIENT_SECRET!,
    }),

    // ✅ Credentials Provider
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // ✅ Connect DB
        await connectToDatabase();

        // ✅ Find user
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error('User not found');
        }

        // ✅ Compare password
        const isPasswordCorrect = await bcrypt.compare(
          credentials?.password as string,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error('Invalid password');
        }

        // // ✅ Check verification status BEFORE role validation - removed logic so they can login and pay
        let vendor = null;
        if (user.role === 'vendor' || (credentials as Record<string, string>).role === 'vendor') {
          vendor = await Vendor.findOne({ userId: user._id.toString() });

          if ((credentials as Record<string, string>).role === 'vendor' && !vendor) {
            throw new Error('Vendor profile not found.');
          }

          if (vendor && vendor.verificationStatus === 'REJECTED') {
            throw new Error('Your vendor application has been rejected.');
          }
        }

        // ✅ If a specific role was requested (e.g. from admin/login), verify it
        if (
          (credentials as Record<string, string>).role &&
          user.role !== (credentials as Record<string, string>).role
        ) {
          throw new Error(
            `Unauthorized: You do not have \${(credentials as Record<string, string>).role} privileges`
          );
        }

        // ✅ Return user (must match NextAuth User type)
        const userData: AuthUser = {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name ?? user.email ?? 'User',
          email: user.email ?? '',
          role: user.role as AuthUser['role'],
          image: user.image,
          vendorId: vendor?._id.toString(),
          isVerified: vendor?.isVerified,
          isActive: vendor?.isActive,
        };

        return userData;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          await connectToDatabase();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            const oauthEmail = user.email ?? '';
            const oauthName = user.name ?? oauthEmail ?? 'User';

            await User.create({
              name: oauthName,
              email: oauthEmail,
              role: 'user', // Default role
              isVerified: true, // OAuth users are verified by provide
              isActive: true,
            });
          }
          return true;
        } catch (error) {
          console.error('Error checking if user exists: ', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        if (session.isActive !== undefined) {
          token.isActive = session.isActive;
        }
        if (session.isVerified !== undefined) {
          token.isVerified = session.isVerified;
        }
      }

      if (user) {
        // 🔹 For Credentials Provider: user has `_id` & `role` from authorize()
        if (user._id) {
          token._id = user._id;
          token.role = user.role;
          token.vendorId = user.vendorId; // Ensure vendorId is passed
          token.isVerified = user.isVerified;
          token.image = user.image;
          token.isActive = user.isActive;
        }
        // 🔹 For OAuth (Google/GitHub): Fetch user from DB
        else {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email });

          if (dbUser) {
            token._id = dbUser._id.toString();
            token.role = dbUser.role ?? 'user';
            token.image = dbUser.image;

            if (dbUser.role === 'vendor') {
              const vendor = await Vendor.findOne({
                userId: dbUser._id.toString(),
              });
              if (vendor) {
                token.vendorId = vendor._id.toString();
                token.isVerified = vendor.isVerified;
                token.isActive = vendor.isActive;
              }
            }
          }
        }
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id as string;
        session.user.role = token.role as string;
        session.user.vendorId = token.vendorId as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isVerified = token.isVerified as boolean | undefined;
        session.user.isActive = token.isActive as boolean | undefined;
        session.user.image = token.image as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
