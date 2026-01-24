import Company from "@/components/Company";
import Faq from "@/components/FAQ";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HeroCTA from "@/components/HeroCTA";
import LandingPage from "@/components/LandingPage";
import Platform from "@/components/platform";
import Top10Cars from "@/components/Top10Cars";

export default function Home() {
  return (
    <>
      <LandingPage />
      <Hero />
      <Top10Cars />
      <Company />
      <Platform />
      <Faq />
      <HeroCTA />
      <Footer />
    </>
  );
}
