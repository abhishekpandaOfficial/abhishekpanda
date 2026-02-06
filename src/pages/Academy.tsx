import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  Lock,
  Filter,
  GraduationCap,
  Award,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const filters = {
  levels: ["All", "Beginner", "Intermediate", "Advanced"],
  types: ["All", "Free", "Premium"],
};

const Academy = () => {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['published-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredCourses = courses.filter((course) => {
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    const matchesType = selectedType === "All" || 
      (selectedType === "Free" && !course.is_premium) ||
      (selectedType === "Premium" && course.is_premium);
    return matchesLevel && matchesType;
  });

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
                <GraduationCap className="w-4 h-4" />
                Industry-Proven Curriculum
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                Level Up Your <span className="gradient-text">Engineering Skills</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Learn from real-world projects and battle-tested architectures. 
                Master .NET, AI/ML, cloud-native development, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Expert-Led Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Certificates Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Community Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filters.levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedLevel === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            <div className="flex flex-wrap gap-2">
              {filters.types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Course Grid */}
        <section className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Courses Available Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                New courses are being crafted. Check back soon for expert-led content.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/courses/${course.slug}`} className="block group h-full">
                    <div className="glass-card-hover rounded-2xl overflow-hidden h-full flex flex-col">
                      <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-purple/20 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                            <Play className="w-6 h-6 text-primary-foreground ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 flex gap-2">
                          {course.is_premium ? (
                            <span className="badge-premium"><Lock className="w-3 h-3" />Premium</span>
                          ) : (
                            <span className="badge-free">Free</span>
                          )}
                          {course.level && (
                            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-card/90 text-foreground">{course.level}</span>
                          )}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{course.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className={`font-bold text-xl ${course.is_premium ? 'gradient-text' : 'text-accent'}`}>
                            {course.is_premium && course.price_amount ? `₹${course.price_amount}` : 'Free'}
                          </span>
                          <Button variant={course.is_premium ? "premium" : "default"} size="sm">
                            {course.is_premium ? "Enroll" : "Start"}<ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Academy;
