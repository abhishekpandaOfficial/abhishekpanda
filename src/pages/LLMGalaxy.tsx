import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AtlasHero } from "@/components/atlas/AtlasHero";
import { ModelFamilies } from "@/components/atlas/ModelFamilies";
import { BenchmarkLeaderboard } from "@/components/atlas/BenchmarkLeaderboard";
import { ModelComparison } from "@/components/atlas/ModelComparison";
import { UseCaseNavigator } from "@/components/atlas/UseCaseNavigator";
import { TrendsInsights } from "@/components/atlas/TrendsInsights";
import { AtlasNewsletter } from "@/components/atlas/AtlasNewsletter";

const LLMAtlas = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <AtlasHero />
        <ModelFamilies />
        <BenchmarkLeaderboard />
        <ModelComparison />
        <UseCaseNavigator />
        <TrendsInsights />
        <AtlasNewsletter />
      </main>

      <Footer />
    </div>
  );
};

export default LLMAtlas;