import { Connection } from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

declare module 'next-auth' {
  interface User {
    _id: string;
    role: string;
    vendorId?: string;
    isVerified?: boolean;
    isActive?: boolean;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string;
    role: string;
    vendorId?: string;
    isVerified?: boolean;
    isActive?: boolean;
  }
}

export {};
