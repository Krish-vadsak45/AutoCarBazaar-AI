import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { CarFront, Heart, Layout } from "lucide-react";

const Header = () => {
  return (
    <div>
      <SignedOut>
        <SignInButton />
        <SignUpButton>Sign Up</SignUpButton>
      </SignedOut>
      <div>
        <SignedIn>
          <Link href="/saved-cars">
            <Button>
              <Heart size={18} />
              Saved Cars
            </Button>
          </Link>
          <Link href="/reservations">
            <Button>
              <CarFront size={18} />
              My Reservations
            </Button>
          </Link>
          <Link href="/admin">
            <Button>
              <Layout size={18} />
              Admin Portal
            </Button>
          </Link>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
};

export default Header;
