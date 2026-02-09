import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AtlasHero } from "@/components/atlas/AtlasHero";
import { ModelFamilies } from "@/components/atlas/ModelFamilies";
import { BenchmarkLeaderboard } from "@/components/atlas/BenchmarkLeaderboard";
import { ModelComparison } from "@/components/atlas/ModelComparison";
import { UseCaseNavigator } from "@/components/atlas/UseCaseNavigator";
import { TrendsInsights } from "@/components/atlas/TrendsInsights";
import { AtlasNewsletter } from "@/components/atlas/AtlasNewsletter";
import { useLLMModels, getLastUpdated } from "@/hooks/useLLMModels";

const LLMGalaxy = () => {
  const { data: models = [] } = useLLMModels();
  const lastUpdated = getLastUpdated(models);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <AtlasHero models={models} lastUpdated={lastUpdated} />
        <ModelFamilies models={models} />
        <BenchmarkLeaderboard models={models} lastUpdated={lastUpdated} />
        <ModelComparison models={models} />
        <UseCaseNavigator models={models} />
        <TrendsInsights models={models} />
        <AtlasNewsletter />
      </main>

      <Footer />
    </div>
  );
};

export default LLMGalaxy;
