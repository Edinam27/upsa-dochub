import HeroSection from '@/components/layout/HeroSection';
import FeaturesSection from '@/components/layout/FeaturesSection';
import ToolsGrid from '@/components/tools/ToolsGrid';

export default function Home() {
  return (
    <div className="pt-16"> {/* Account for fixed header */}
      <HeroSection />
      <ToolsGrid />
      <FeaturesSection />
    </div>
  );
}
