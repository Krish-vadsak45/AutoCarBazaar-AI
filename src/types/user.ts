import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    vendorId?: string;
  }

  interface Session {
    user: {
      _id?: string;
      name?: string;
      email?: string;
      role?: string;
      vendorId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    vendorId?: string;
  }
}
