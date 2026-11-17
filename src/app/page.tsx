import { LandingCollections } from "@/components/landing/collections";
import { LandingHero } from "@/components/landing/hero";
import { LandingInvite } from "@/components/landing/invite";
import { LandingLooks } from "@/components/landing/looks";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function HomePage() {
  return (
    <div className="landing min-h-full bg-[#0c0a09] text-[var(--landing-ivory)]">
      <SiteHeader />
      <main>
        <LandingHero />
        <LandingCollections />
        <LandingLooks />
        <LandingInvite />
      </main>
      <SiteFooter />
    </div>
  );
}
