import { useMemo, useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BookOpenText, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ScriptureCard from "@/components/scriptures/ScriptureCard";
import ScripturesHeader from "@/components/scriptures/ScripturesHeader";
import ScriptureDetail from "@/components/scriptures/ScriptureDetail";
import { SCRIPTURES, SCRIPTURES_BY_SLUG } from "@/content/scriptures";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

export default function Scriptures() {
  const { slug } = useParams();
  const scripture = slug ? SCRIPTURES_BY_SLUG.get(slug) : null;
  const isDetail = Boolean(slug);
  const isBoundDetail = Boolean(isDetail && scripture);

  const [query, setQuery] = useState("");
  const [religion, setReligion] = useState("All");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadStep, setUploadStep] = useState<"form" | "otp">("form");
  const [submitting, setSubmitting] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
    otp: "",
    fileName: "",
    fileContent: "",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCRIPTURES.filter((item) => {
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesReligion = religion === "All" || item.religion === religion;
      return matchesQuery && matchesReligion;
    });
  }, [query, religion]);

  const title = scripture ? `${scripture.title} | Scriptures | Abhishek Panda` : "Scriptures | Abhishek Panda";
  const description = scripture
    ? scripture.description
    : "Read scripture guides with rich cards, religion tags, symbolic imagery, and progress-aware reading.";
  const canonical = `${SITE_URL}${isDetail ? `/scriptures/${slug}` : "/scriptures"}`;
  const relatedPages = [
    { title: "Articles", to: "/articles", description: "Knowledge guides and deep dives" },
    { title: "Cheatsheets", to: "/cheatsheets", description: "Series and mastery tracks" },
    { title: "About", to: "/about", description: "Author and mission" },
  ];

  const normalizeForCompare = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();

  const onFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.html?$/i.test(file.name)) {
      toast.error("Only .html files are allowed.");
      return;
    }
    const text = await file.text();
    const duplicate = SCRIPTURES.some((item) => {
      const sameTitle = normalizeForCompare(item.title) === normalizeForCompare(file.name.replace(/\.html?$/i, "").replace(/[-_]+/g, " "));
      const sameContentSlice = normalizeForCompare(item.rawHtml).slice(0, 1500) === normalizeForCompare(text).slice(0, 1500);
      return sameTitle || sameContentSlice;
    });
    if (duplicate) {
      toast.error("This scripture appears similar to existing content.");
      return;
    }
    setUploadForm((prev) => ({ ...prev, fileName: file.name, fileContent: text }));
    toast.success("File loaded. Continue verification.");
  };

  const sendOtp = async () => {
    if (!uploadForm.name || !uploadForm.email || !uploadForm.mobile || !uploadForm.fileName || !uploadForm.fileContent) {
      toast.error("Please fill name, email, mobile and choose an HTML file.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("scripture-upload-send-otp", {
        body: {
          name: uploadForm.name,
          email: uploadForm.email,
          mobile: uploadForm.mobile,
          location: uploadForm.location,
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setUploadStep("otp");
      toast.success("OTP sent to your email.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitUpload = async () => {
    if (!uploadForm.otp) {
      toast.error("Please enter OTP.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("scripture-upload-submit", {
        body: {
          name: uploadForm.name,
          email: uploadForm.email,
          mobile: uploadForm.mobile,
          location: uploadForm.location,
          otp: uploadForm.otp,
          fileName: uploadForm.fileName,
          fileContent: uploadForm.fileContent,
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      toast.success("Scripture uploaded and sent for review.");
      setShowUploadForm(false);
      setUploadStep("form");
      setUploadForm({ name: "", email: "", mobile: "", location: "", otp: "", fileName: "", fileContent: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit scripture.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Navigation />

      <main className={isBoundDetail ? "pt-24 pb-6" : "pt-24 pb-20"}>
        {isBoundDetail && scripture ? (
          <div className="w-full px-0 md:px-4 xl:px-6">
            <ScriptureDetail scripture={scripture} />
          </div>
        ) : (
          <div className="container mx-auto px-4">
            {isDetail ? (
              <section className="py-20 text-center">
                <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Scripture not found</p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">That scripture route does not exist yet.</h1>
                  <Link
                    to="/scriptures"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Return to Scriptures
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            ) : (
              <>
                <ScripturesHeader />

                <section className="mt-8 mb-8 flex flex-wrap items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search scriptures..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full max-w-xs rounded-xl border border-border/60 bg-background px-4 py-2 text-base text-foreground"
                  />
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2 text-base text-foreground"
                  >
                    <option value="All">All Religions</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Buddhism">Buddhism</option>
                    <option value="Jainism">Jainism</option>
                    <option value="Taoism">Taoism</option>
                    <option value="General">General</option>
                  </select>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6 min-w-0">
                    {filtered.length ? (
                      filtered.map((item) => <ScriptureCard key={item.slug} scripture={item} />)
                    ) : (
                      <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/50 p-10 text-center">
                        <h2 className="text-2xl font-black tracking-tight text-foreground">No scriptures match your filter</h2>
                        <p className="mt-3 text-muted-foreground">Try another search term or religion filter.</p>
                      </div>
                    )}
                  </div>

                  <motion.aside
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="space-y-5 lg:sticky lg:top-24 lg:self-start"
                  >
                    <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                        <BookOpenText className="h-4 w-4" />
                        Scripture Hub
                      </div>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                        <p>Discover scripture guides in visually rich card format with tags and symbolic identity.</p>
                        <p>Open each guide in a full reading experience with progress and timer insights.</p>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Connected Pages</p>
                      <div className="mt-4 space-y-3">
                        {SCRIPTURES.map((item) => (
                          <Link
                            key={item.slug}
                            to={`/scriptures/${item.slug}`}
                            className="block rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                          >
                            <p className="font-semibold text-foreground">{item.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.religion}</p>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                        {relatedPages.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                          >
                            <p className="font-semibold text-foreground">{item.title}</p>
                            {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                      <button
                        type="button"
                        onClick={() => setShowUploadForm((prev) => !prev)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Scripture
                      </button>
                      {showUploadForm ? (
                        <div className="mt-4 space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Verified Upload</p>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={uploadForm.name}
                            onChange={(e) => setUploadForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={uploadForm.email}
                            onChange={(e) => setUploadForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                          />
                          <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={uploadForm.mobile}
                            onChange={(e) => setUploadForm((prev) => ({ ...prev, mobile: e.target.value }))}
                            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Location (optional)"
                            value={uploadForm.location}
                            onChange={(e) => setUploadForm((prev) => ({ ...prev, location: e.target.value }))}
                            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                          />
                          <input
                            type="file"
                            accept=".html,.htm,text/html"
                            onChange={onFileSelect}
                            className="w-full text-xs"
                          />
                          {uploadForm.fileName ? <p className="text-xs text-muted-foreground">Selected: {uploadForm.fileName}</p> : null}

                          {uploadStep === "form" ? (
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => void sendOtp()}
                              className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                            >
                              {submitting ? "Sending OTP..." : "Send OTP"}
                            </button>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder="Enter OTP"
                                value={uploadForm.otp}
                                onChange={(e) => setUploadForm((prev) => ({ ...prev, otp: e.target.value }))}
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                              />
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => void submitUpload()}
                                className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                              >
                                {submitting ? "Uploading..." : "Verify & Upload"}
                              </button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </motion.aside>
                </section>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
