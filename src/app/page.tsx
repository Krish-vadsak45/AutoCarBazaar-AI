import Company from '@/components/Company';
import Faq from '@/components/FAQ';
import Hero from '@/components/Hero';
import HeroCTA from '@/components/HeroCTA';
import LandingPage from '@/components/LandingPage';
import Platform from '@/components/platform';
import Top10Cars from '@/components/Top10Cars';
import { ReviewsSection } from '@/components/ReviewsSection';

export default function Home() {
  return (
    <>
      <LandingPage />
      <Hero />
      <Top10Cars />
      <Company />
      <Platform />
      <div className="container mx-auto px-4">
        <ReviewsSection carId="" />
      </div>
      <Faq />
      <HeroCTA />
    </>
  );
}
