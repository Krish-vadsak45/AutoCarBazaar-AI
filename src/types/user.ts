import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    vendorId?: string;
    isVerified?: boolean;
    isActive?: boolean;
    image?: string;
  }

  interface Session {
    user: {
      _id?: string;
      name?: string;
      email?: string;
      role?: string;
      vendorId?: string;
      isVerified?: boolean;
      isActive?: boolean;
      image?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    vendorId?: string;
    isVerified?: boolean;
    isActive?: boolean;
  }
}
