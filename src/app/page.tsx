import HeroSection from '@/components/layout/HeroSection';
import StatsSection from '@/components/layout/StatsSection';
import ToolsGrid from '@/components/tools/ToolsGrid';
import FeaturesSection from '@/components/layout/FeaturesSection';
import ContactSection from '@/components/layout/ContactSection';

export default function Home() {
  return (
    <div className="pt-16"> {/* Account for fixed header */}
      <HeroSection />
      <StatsSection />
      <ToolsGrid />
      <FeaturesSection />
      <ContactSection />
    </div>
  );
}
