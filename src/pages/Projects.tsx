import { ResourceHubPage } from "@/components/content/ResourceHubPage";
import { PROJECT_CARDS, PROJECT_METRICS } from "@/lib/projectsCatalog";

export default function Projects() {
  return (
    <ResourceHubPage
      eyebrow="Projects"
      title="Projects, Platforms, and Build-Focused Destinations"
      description="Use the Projects header as a direct portfolio-style entry point into your live products, engineering platforms, and project-oriented learning tracks."
      primaryAction={{ label: "Open Products", to: "/products" }}
      secondaryAction={{ label: "Contact for Projects", to: "/contact" }}
      metrics={PROJECT_METRICS}
      cards={PROJECT_CARDS}
      sectionTitle="Projects and Product-Facing Routes"
      sectionDescription="This page is positioned as the top-level discovery layer for platforms, products, and project-shaped technical assets already present across the website."
    />
  );
}
