import { motion } from "framer-motion";
import { Users, BookOpen, Star, Award, Building2, Briefcase } from "lucide-react";

const stats = [
  { icon: Users, value: "15,000+", label: "Students Enrolled" },
  { icon: BookOpen, value: "50+", label: "Courses & Tutorials" },
  { icon: Star, value: "4.9", label: "Average Rating" },
  { icon: Award, value: "12+", label: "Years Experience" },
];

const industries = [
  "Banking & Finance",
  "Aviation",
  "Fintech",
  "Automotive",
  "E-commerce",
  "Healthcare",
];

export const TrustSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-purple/5" />
      
      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-4">
            Trusted by <span className="gradient-text">Developers & Teams</span> Worldwide
          </h2>
          <p className="section-subtitle mx-auto">
            Helping engineers, founders, and organizations build exceptional software
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-black gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Industries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Industries I've worked with
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((industry, index) => (
              <motion.span
                key={industry}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:shadow-glow transition-all duration-300"
              >
                {industry}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
