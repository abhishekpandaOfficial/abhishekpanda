import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { BooksSection } from "@/components/products/BooksSection";
import { BookNewsletterPopup } from "@/components/BookNewsletterPopup";
import { 
  Zap, 
  Code2, 
  BookOpen, 
  FileText,
  ShoppingCart,
  Eye,
  Download,
  Star,
  Filter
} from "lucide-react";

const categories = [
  { name: "All", icon: Zap },
  { name: "Automation Workflows", icon: Zap },
  { name: "Code Snippets", icon: Code2 },
  { name: "E-books", icon: BookOpen },
  { name: "Templates", icon: FileText },
];

const products = [
  {
    id: 1,
    title: "Multi-Agent AI Workflow Starter Kit",
    description: "Production-ready workflow templates for building multi-agent AI systems with LangChain and AutoGen.",
    category: "Automation Workflows",
    price: "₹1,999",
    originalPrice: "₹2,999",
    rating: 4.9,
    sales: 234,
    featured: true,
  },
  {
    id: 2,
    title: ".NET Microservices Boilerplate",
    description: "Complete microservices starter with authentication, API gateway, message broker, and more.",
    category: "Templates",
    price: "₹2,499",
    originalPrice: "₹3,499",
    rating: 4.8,
    sales: 456,
    featured: true,
  },
  {
    id: 3,
    title: "500+ Reusable C# Code Snippets",
    description: "Battle-tested code snippets for common patterns, utilities, and best practices in C#/.NET.",
    category: "Code Snippets",
    price: "₹999",
    originalPrice: "₹1,499",
    rating: 4.9,
    sales: 789,
    featured: false,
  },
  {
    id: 4,
    title: "System Design Interview Handbook",
    description: "Comprehensive e-book covering 25+ system design problems with detailed solutions.",
    category: "E-books",
    price: "₹799",
    originalPrice: "₹1,199",
    rating: 4.9,
    sales: 1234,
    featured: true,
  },
  {
    id: 5,
    title: "CI/CD Pipeline Templates",
    description: "GitHub Actions & Azure DevOps templates for .NET, Node.js, and Python projects.",
    category: "Automation Workflows",
    price: "₹1,499",
    originalPrice: "₹2,199",
    rating: 4.7,
    sales: 345,
    featured: false,
  },
  {
    id: 6,
    title: "Clean Architecture Project Template",
    description: "Opinionated .NET solution template with clean architecture, CQRS, and DDD patterns.",
    category: "Templates",
    price: "₹1,799",
    originalPrice: "₹2,499",
    rating: 4.8,
    sales: 567,
    featured: false,
  },
  {
    id: 7,
    title: "AI/ML E-book Collection",
    description: "3-book bundle covering ML fundamentals, deep learning, and MLOps best practices.",
    category: "E-books",
    price: "₹1,999",
    originalPrice: "₹2,999",
    rating: 4.8,
    sales: 890,
    featured: false,
  },
  {
    id: 8,
    title: "Terraform AWS Infrastructure Pack",
    description: "Production-ready Terraform modules for common AWS infrastructure patterns.",
    category: "Templates",
    price: "₹2,199",
    originalPrice: "₹2,999",
    rating: 4.9,
    sales: 234,
    featured: false,
  },
];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter(
    (product) => selectedCategory === "All" || product.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
                <ShoppingCart className="w-4 h-4" />
                Digital Products Marketplace
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                Premium <span className="gradient-text">Digital Products</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Accelerate your development with battle-tested templates, automation workflows, 
                code snippets, and e-books.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto px-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.name
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-glow"
                    : "glass-card hover:border-primary/30"
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </motion.div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                <div className="glass-card-hover rounded-2xl overflow-hidden h-full flex flex-col">
                  {/* Header */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 via-secondary/20 to-purple/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {product.category === "Automation Workflows" && <Zap className="w-12 h-12 text-primary/50" />}
                      {product.category === "Code Snippets" && <Code2 className="w-12 h-12 text-primary/50" />}
                      {product.category === "E-books" && <BookOpen className="w-12 h-12 text-primary/50" />}
                      {product.category === "Templates" && <FileText className="w-12 h-12 text-primary/50" />}
                    </div>
                    {product.featured && (
                      <span className="absolute top-3 left-3 badge-premium">Featured</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-primary text-xs font-semibold mb-2">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    {/* Rating & Sales */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        {product.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {product.sales} sold
                      </span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="font-bold text-lg gradient-text">{product.price}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {product.originalPrice}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="premium" size="sm">
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Books Section */}
        <BooksSection />
      </main>

      <Footer />
      <BookNewsletterPopup />
    </div>
  );
};

export default Products;