import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  ShoppingCart, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Award,
  Sparkles,
  Share2,
  Instagram,
  Linkedin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

// Book images
import awakeCover from "@/assets/books/awake-while-alive-cover.jpg";
import awakeContents from "@/assets/books/awake-contents.jpg";
import awakeChapter1 from "@/assets/books/awake-chapter1.jpg";
import awakeChapter2 from "@/assets/books/awake-chapter2.jpg";
import awakeChapter8 from "@/assets/books/awake-chapter8.jpg";
import perfectImperfectionistCover from "@/assets/books/perfect-imperfectionist-cover.jpg";

// Social Icons
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const books = [
  {
    id: 1,
    title: "Awake While Alive!",
    subtitle: "For the Next Generation Who Refuses to Live in Cages",
    author: "Abhishek Panda",
    description: "A thought-provoking journey that challenges conventional beliefs about life, freedom, and purpose. This book is not here to comfort you—it's here to wake you up.",
    status: "published",
    publishDate: "August 2025",
    award: "Rising Star Author Award - Notion Press",
    images: [awakeCover, awakeContents, awakeChapter1, awakeChapter2, awakeChapter8],
    links: {
      amazon: "https://amzn.in/d/f2kbz5j",
      flipkart: "https://www.flipkart.com/awake-while-alive/p/itmc8fc663e9b8aa",
      kindle: "https://amzn.in/d/hUih88n",
      notionPress: "https://notionpress.com/in/read/awake-while-alive/",
    },
  },
  {
    id: 2,
    title: "The Perfect Imperfectionist",
    subtitle: "The bravest act in a world of Filters is To live unfiltered",
    author: "Abhishek Panda",
    description: "Coming soon - A bold exploration of authenticity in a filtered world. Embrace your imperfections and discover the power of living unfiltered.",
    status: "upcoming",
    publishDate: "2026",
    images: [perfectImperfectionistCover],
    links: {},
  },
];

// Share functions
const shareOnTwitter = (title: string, url: string) => {
  window.open(
    `https://twitter.com/intent/tweet?text=Check out "${title}" by Abhishek Panda&url=${encodeURIComponent(url)}`,
    "_blank"
  );
};

const shareOnFacebook = (url: string) => {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    "_blank"
  );
};

const shareOnLinkedIn = (title: string, url: string) => {
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    "_blank"
  );
};

const shareOnWhatsApp = (title: string, url: string) => {
  window.open(
    `https://wa.me/?text=Check out "${title}" by Abhishek Panda: ${encodeURIComponent(url)}`,
    "_blank"
  );
};

const shareOnInstagram = () => {
  toast({
    title: "Share on Instagram",
    description: "Screenshot this page and share it on your Instagram story!",
  });
};

const copyLink = (url: string) => {
  navigator.clipboard.writeText(url);
  toast({
    title: "Link copied!",
    description: "Book link copied to clipboard.",
  });
};

export const BooksSection = () => {
  const [selectedBook, setSelectedBook] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const book = books[selectedBook];
  const images = book.images;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Author & Writer
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            My <span className="gradient-text">Books</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thought-provoking books that challenge conventional thinking and inspire transformation
          </p>
        </motion.div>

        {/* Book Selector */}
        <div className="flex justify-center gap-4 mb-12">
          {books.map((b, index) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBook(index);
                setCurrentImageIndex(0);
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedBook === index
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-glow"
                  : "glass-card hover:border-primary/30"
              }`}
            >
              {b.title}
              {b.status === "upcoming" && (
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image Gallery */}
          <motion.div
            key={selectedBook}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`${book.title} - Page ${currentImageIndex + 1}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImageIndex === index
                          ? "bg-primary w-6"
                          : "bg-background/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Book Details */}
          <motion.div
            key={`details-${selectedBook}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {book.status === "upcoming" && (
              <Badge variant="secondary" className="text-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Coming Soon - {book.publishDate}
              </Badge>
            )}
            
            <h3 className="text-3xl md:text-4xl font-black text-foreground">
              {book.title}
            </h3>
            <p className="text-lg text-primary font-medium italic">
              "{book.subtitle}"
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {book.description}
            </p>

            {book.award && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <Award className="w-6 h-6 text-amber-500" />
                <span className="font-medium text-foreground">{book.award}</span>
              </div>
            )}

            {book.status === "published" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Published: {book.publishDate} • By {book.author}
                </p>

                <div className="flex flex-wrap gap-3 pt-4">
                  <Button variant="hero" asChild>
                    <a href={book.links.amazon} target="_blank" rel="noopener noreferrer">
                      <ShoppingCart className="w-4 h-4" />
                      Buy on Amazon
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                  <Button variant="hero-outline" asChild>
                    <a href={book.links.flipkart} target="_blank" rel="noopener noreferrer">
                      <ShoppingCart className="w-4 h-4" />
                      Buy on Flipkart
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={book.links.kindle} target="_blank" rel="noopener noreferrer">
                      Kindle Edition
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={book.links.notionPress} target="_blank" rel="noopener noreferrer">
                      Notion Press
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>

                {/* Social Share Buttons */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Share this book:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30"
                      onClick={() => shareOnTwitter(book.title, book.links.amazon)}
                    >
                      <XIcon />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 hover:bg-[#E4405F]/10 hover:text-[#E4405F] hover:border-[#E4405F]/30"
                      onClick={shareOnInstagram}
                    >
                      <Instagram className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30"
                      onClick={() => shareOnFacebook(book.links.amazon)}
                    >
                      <FacebookIcon />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 hover:bg-[#0077B5]/10 hover:text-[#0077B5] hover:border-[#0077B5]/30"
                      onClick={() => shareOnLinkedIn(book.title, book.links.amazon)}
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30"
                      onClick={() => shareOnWhatsApp(book.title, book.links.amazon)}
                    >
                      <WhatsAppIcon />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyLink(book.links.amazon)}>
                          Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </>
            )}

            {book.status === "upcoming" && (
              <div className="p-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-center">
                <p className="text-muted-foreground">
                  Stay tuned for the release announcement!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
