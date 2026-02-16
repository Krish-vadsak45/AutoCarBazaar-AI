import NextAuth from "next-auth/next";

import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";

import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import Vendor from "@/models/vendor.model";

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // ✅ Credentials Provider
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any): Promise<any> {
        if (!credentials?.email || !credentials?.password) return null;

        // ✅ Connect DB
        await connectToDatabase();

        // ✅ Find user
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        // ✅ Compare password
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        // ✅ If a specific role was requested (e.g. from admin/login), verify it
        if (credentials.role && user.role !== credentials.role) {
          throw new Error(
            `Unauthorized: You do not have ${credentials.role} privileges`,
          );
        }

        // ✅ Return user (must match NextAuth User type)
        const userData: any = {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };

        if (user.role === "vendor") {
          const vendor = await Vendor.findOne({ userId: user._id.toString() });
          if (vendor) {
            userData.vendorId = vendor._id.toString();
          }
        }

        return userData;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user object is only available on initial sign in
        token._id = (user as any)._id;
        token.role = (user as any).role;
        token.vendorId = (user as any).vendorId;
        token.name = user.name;
        token.email = user.email;
      } else if (!token.role) {
        // Fetch role if missing
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token._id = dbUser._id.toString();
          token.role = dbUser.role;
          if (dbUser.role === "vendor") {
            const vendor = await Vendor.findOne({
              userId: dbUser._id.toString(),
            });
            if (vendor) {
              token.vendorId = vendor._id.toString();
            }
          }
        }
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
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
