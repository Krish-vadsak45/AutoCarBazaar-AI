import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    _id?: string;
    name?: string;
    email?: string;
  }

  interface Session {
    user: {
      _id?: string;
      name?: string;
      email?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface CustomJWT extends DefaultJWT {
    _id?: string;
    name?: string;
    email?: string;
  }
}
