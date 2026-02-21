import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  Building2,
  Clock3,
  FileText,
  KeyRound,
  Mail,
  Package,
  Phone,
  Plus,
  Trash2,
  Upload,
  Eye,
  Download,
  Pencil,
  Layers,
  UserRound,
} from "lucide-react";

type Company = {
  id: string;
  legal_name: string;
  brand_name: string;
  website: string | null;
  website_urls: string[];
  registered_date: string | null;
  incorporation_date: string | null;
  company_type: string | null;
  registered_office: string | null;
  corporate_offices: string[];
  cin: string | null;
  gstin: string | null;
  udyam_registration: string | null;
  dpiit_recognition: string | null;
  notes: string | null;
  pan_number: string | null;
  tan_number: string | null;
  gst_number: string | null;
  startup_india_id: string | null;
  regulatory_ids: string[];
  created_at: string;
  updated_at: string;
};

type ProductStatus = "active" | "inactive" | "pending" | "working" | "development" | "inprogress" | "live";

type Product = {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  tags: string[];
  product_url: string | null;
  documentation_url: string | null;
  hosting: string | null;
  platform_web: boolean;
  platform_mobile: boolean;
  platform_desktop: boolean;
  status: ProductStatus | string;
  created_at: string;
  updated_at: string;
};

type Credential = {
  id: string;
  company_id: string | null;
  product_id: string | null;
  label: string;
  system: string | null;
  username: string | null;
  secret_hint: string | null;
  notes: string | null;
  last_rotated_at: string | null;
  created_at: string;
  updated_at: string;
};

type BusinessDocument = {
  id: string;
  company_id: string | null;
  product_id: string | null;
  title: string;
  description: string | null;
  tags: string[];
  document_url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
  updated_at: string;
};

type ContactStage = "active" | "inactive" | "lead" | "prospect" | "partner";

type BusinessContact = {
  id: string;
  company_id: string | null;
  full_name: string;
  role: string | null;
  contact_type: string;
  relationship_stage: ContactStage | string;
  email: string | null;
  mobile: string | null;
  associated_since: string | null;
  last_contacted_at: string | null;
  reason: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type UploadQueueStatus = "queued" | "uploading" | "saving" | "done" | "failed";

type UploadQueueItem = {
  id: string;
  file: File;
  title: string;
  status: UploadQueueStatus;
  progress: number;
  error: string | null;
};

const fmt = (ts?: string | null) => (ts ? new Date(ts).toLocaleString() : "N/A");
const size = (b?: number | null) => (b ? `${(b / 1024 / 1024).toFixed(2)} MB` : "N/A");
const bucket = "business-docs";

const STATUS_OPTIONS: ProductStatus[] = ["active", "inactive", "pending", "working", "development", "inprogress", "live"];
const CONTACT_STAGES: ContactStage[] = ["active", "lead", "prospect", "partner", "inactive"];

const statusBorder: Record<string, string> = {
  active: "border-emerald-500/60",
  inactive: "border-slate-500/60",
  pending: "border-amber-500/60",
  working: "border-blue-500/60",
  development: "border-violet-500/60",
  inprogress: "border-cyan-500/60",
  live: "border-green-500/70",
};

const contactBorder: Record<string, string> = {
  active: "border-emerald-500/55",
  lead: "border-blue-500/55",
  prospect: "border-amber-500/55",
  partner: "border-violet-500/55",
  inactive: "border-slate-500/55",
};

const emptyCompanyForm = {
  legal_name: "CodeXIntel Technologies Pvt. Ltd.",
  brand_name: "OriginX Labs",
  website: "",
  website_urls: "",
  registered_date: "2025-10-16",
  incorporation_date: "2025-10-16",
  company_type: "Private Limited",
  registered_office: "Odisha, India",
  corporate_offices: "",
  cin: "U62010OD2025PTC051089",
  gstin: "21AANCC1954F1ZW",
  udyam_registration: "UDYAM-OD-03-0076858",
  dpiit_recognition: "DIPP230789",
  notes: "",
  pan_number: "",
  tan_number: "",
  gst_number: "21AANCC1954F1ZW",
  startup_india_id: "",
  regulatory_ids: "",
};

export default function AdminBusinessHub() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [contacts, setContacts] = useState<BusinessContact[]>([]);

  const [activeCompanyId, setActiveCompanyId] = useState<string>("");
  const [productView, setProductView] = useState<"grid" | "list">("grid");
  const [docView, setDocView] = useState<"grid" | "list">("list");

  const [previewUrlMap, setPreviewUrlMap] = useState<Record<string, string>>({});

  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [companyDialogMode, setCompanyDialogMode] = useState<"add" | "edit" | "view">("add");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<BusinessDocument | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const [selectedContact, setSelectedContact] = useState<BusinessContact | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const [productForm, setProductForm] = useState({
    company_id: "",
    name: "",
    description: "",
    tags: "",
    product_url: "",
    documentation_url: "",
    hosting: "",
    status: "active" as ProductStatus,
    platform_web: true,
    platform_mobile: false,
    platform_desktop: false,
  });

  const [credentialForm, setCredentialForm] = useState({
    company_id: "",
    product_id: "",
    label: "",
    system: "",
    username: "",
    secret_hint: "",
    notes: "",
    last_rotated_at: "",
  });

  const [documentForm, setDocumentForm] = useState({
    company_id: "",
    product_id: "",
    title: "",
    description: "",
    tags: "",
    files: [] as File[],
  });

  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);

  const [contactForm, setContactForm] = useState({
    company_id: "",
    full_name: "",
    role: "",
    contact_type: "business",
    relationship_stage: "active" as ContactStage,
    email: "",
    mobile: "",
    associated_since: "",
    last_contacted_at: "",
    reason: "",
    notes: "",
    is_active: true,
  });

  const sb: any = supabase;

  const companyMap = useMemo(() => {
    const map = new Map<string, Company>();
    companies.forEach((c) => map.set(c.id, c));
    return map;
  }, [companies]);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        toast.error("Please login again.");
        return;
      }

      const [
        { data: cRows, error: cErr },
        { data: pRows, error: pErr },
        { data: crRows, error: crErr },
        { data: dRows, error: dErr },
        { data: ctRows, error: ctErr },
      ] =
        await Promise.all([
          sb.from("business_companies").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          sb.from("business_products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          sb.from("business_credentials").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          sb.from("business_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          sb.from("business_contacts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        ]);

      if (cErr) throw cErr;
      if (pErr) throw pErr;
      if (crErr) throw crErr;
      if (dErr) throw dErr;
      if (ctErr) throw ctErr;

      const companiesData = (cRows || []) as Company[];
      setCompanies(companiesData);
      setProducts((pRows || []) as Product[]);
      setCredentials((crRows || []) as Credential[]);
      setDocuments((dRows || []) as BusinessDocument[]);
      setContacts((ctRows || []) as BusinessContact[]);

      const defaultCompanyId = companiesData[0]?.id || "";
      setActiveCompanyId((prev) => prev || defaultCompanyId);
      setProductForm((prev) => ({ ...prev, company_id: prev.company_id || defaultCompanyId }));
      setCredentialForm((prev) => ({ ...prev, company_id: prev.company_id || defaultCompanyId }));
      setDocumentForm((prev) => ({ ...prev, company_id: prev.company_id || defaultCompanyId }));
      setContactForm((prev) => ({ ...prev, company_id: prev.company_id || defaultCompanyId }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to load business data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const hydratePreviews = async () => {
      if (!documents.length) return;
      const next: Record<string, string> = {};
      for (const doc of documents) {
        if (doc.storage_path) {
          const { data } = await supabase.storage.from(bucket).createSignedUrl(doc.storage_path, 60 * 60);
          if (data?.signedUrl) next[doc.id] = data.signedUrl;
        } else if (doc.document_url) {
          next[doc.id] = doc.document_url;
        }
      }
      setPreviewUrlMap(next);
    };
    hydratePreviews();
  }, [documents]);

  const openAddCompany = () => {
    setCompanyDialogMode("add");
    setSelectedCompany(null);
    setCompanyForm({ ...emptyCompanyForm });
    setCompanyDialogOpen(true);
  };

  const openViewCompany = (company: Company) => {
    setCompanyDialogMode("view");
    setSelectedCompany(company);
    setCompanyForm({
      legal_name: company.legal_name || "",
      brand_name: company.brand_name || "",
      website: company.website || "",
      website_urls: (company.website_urls || []).join(", "),
      registered_date: company.registered_date || "",
      incorporation_date: company.incorporation_date || "",
      company_type: company.company_type || "",
      registered_office: company.registered_office || "",
      corporate_offices: (company.corporate_offices || []).join(", "),
      cin: company.cin || "",
      gstin: company.gstin || company.gst_number || "",
      udyam_registration: company.udyam_registration || "",
      dpiit_recognition: company.dpiit_recognition || "",
      notes: company.notes || "",
      pan_number: company.pan_number || "",
      tan_number: company.tan_number || "",
      gst_number: company.gst_number || company.gstin || "",
      startup_india_id: company.startup_india_id || "",
      regulatory_ids: (company.regulatory_ids || []).join(", "),
    });
    setCompanyDialogOpen(true);
  };

  const saveCompany = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const payload = {
      user_id: user.id,
      legal_name: companyForm.legal_name.trim() || "Unnamed Company",
      brand_name: companyForm.brand_name.trim() || companyForm.legal_name.trim() || "Unnamed",
      website: companyForm.website.trim() || null,
      website_urls: companyForm.website_urls.split(",").map((x) => x.trim()).filter(Boolean),
      registered_date: companyForm.registered_date || null,
      incorporation_date: companyForm.incorporation_date || null,
      company_type: companyForm.company_type.trim() || null,
      registered_office: companyForm.registered_office.trim() || null,
      corporate_offices: companyForm.corporate_offices.split(",").map((x) => x.trim()).filter(Boolean),
      cin: companyForm.cin.trim() || null,
      gstin: companyForm.gstin.trim() || null,
      udyam_registration: companyForm.udyam_registration.trim() || null,
      dpiit_recognition: companyForm.dpiit_recognition.trim() || null,
      notes: companyForm.notes.trim() || null,
      pan_number: companyForm.pan_number.trim() || null,
      tan_number: companyForm.tan_number.trim() || null,
      gst_number: (companyForm.gst_number || companyForm.gstin).trim() || null,
      startup_india_id: companyForm.startup_india_id.trim() || null,
      regulatory_ids: companyForm.regulatory_ids.split(",").map((x) => x.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    let error: any = null;
    if (companyDialogMode === "edit" && selectedCompany) {
      ({ error } = await sb.from("business_companies").update(payload).eq("id", selectedCompany.id));
    } else {
      ({ error } = await sb.from("business_companies").insert(payload));
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(companyDialogMode === "edit" ? "Company updated." : "Company added.");
    setCompanyDialogOpen(false);
    await loadAll();
  };

  const deleteCompany = async (companyId: string) => {
    const { error } = await sb.from("business_companies").delete().eq("id", companyId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Company deleted.");
    setCompanyDialogOpen(false);
    await loadAll();
  };

  const addProduct = async () => {
    if (!productForm.name.trim() || !productForm.company_id) return;
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const { error } = await sb.from("business_products").insert({
      user_id: user.id,
      company_id: productForm.company_id,
      name: productForm.name.trim(),
      description: productForm.description.trim() || null,
      tags: productForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      product_url: productForm.product_url.trim() || null,
      documentation_url: productForm.documentation_url.trim() || null,
      hosting: productForm.hosting.trim() || null,
      status: productForm.status,
      platform_web: productForm.platform_web,
      platform_mobile: productForm.platform_mobile,
      platform_desktop: productForm.platform_desktop,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Product added.");
    setProductForm((p) => ({
      ...p,
      name: "",
      description: "",
      tags: "",
      product_url: "",
      documentation_url: "",
      hosting: "",
      status: "active",
      platform_web: true,
      platform_mobile: false,
      platform_desktop: false,
    }));
    await loadAll();
  };

  const updateProduct = async (product: Product) => {
    const { error } = await sb
      .from("business_products")
      .update({
        company_id: product.company_id,
        name: product.name,
        description: product.description,
        tags: product.tags,
        product_url: product.product_url,
        documentation_url: product.documentation_url,
        hosting: product.hosting,
        status: product.status,
        platform_web: product.platform_web,
        platform_mobile: product.platform_mobile,
        platform_desktop: product.platform_desktop,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Product updated.");
    setProductDialogOpen(false);
    await loadAll();
  };

  const removeProduct = async (id: string) => {
    const { error } = await sb.from("business_products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product deleted.");
    setProductDialogOpen(false);
    await loadAll();
  };

  const addCredential = async () => {
    if (!credentialForm.label.trim() || !credentialForm.company_id) return;
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const { error } = await sb.from("business_credentials").insert({
      user_id: user.id,
      company_id: credentialForm.company_id,
      product_id: credentialForm.product_id || null,
      label: credentialForm.label.trim(),
      system: credentialForm.system.trim() || null,
      username: credentialForm.username.trim() || null,
      secret_hint: credentialForm.secret_hint.trim() || null,
      notes: credentialForm.notes.trim() || null,
      last_rotated_at: credentialForm.last_rotated_at || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Credential record added.");
    setCredentialForm((p) => ({ ...p, label: "", system: "", username: "", secret_hint: "", notes: "", last_rotated_at: "", product_id: "" }));
    await loadAll();
  };

  const updateCredential = async (credential: Credential) => {
    const { error } = await sb
      .from("business_credentials")
      .update({
        company_id: credential.company_id,
        product_id: credential.product_id,
        label: credential.label,
        system: credential.system,
        username: credential.username,
        secret_hint: credential.secret_hint,
        notes: credential.notes,
        last_rotated_at: credential.last_rotated_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", credential.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Credential updated.");
    setCredentialDialogOpen(false);
    await loadAll();
  };

  const removeCredential = async (id: string) => {
    const { error } = await sb.from("business_credentials").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Credential deleted.");
    setCredentialDialogOpen(false);
    await loadAll();
  };

  const updateQueueItem = (id: string, patch: Partial<UploadQueueItem>) => {
    setUploadQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addFilesToQueue = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      title: file.name.replace(/\.[^/.]+$/, ""),
      status: "queued" as UploadQueueStatus,
      progress: 0,
      error: null,
    }));
    setUploadQueue((prev) => [...prev, ...next]);
  };

  const uploadDocumentsBulk = async () => {
    if (!documentForm.company_id) {
      toast.error("Select a company before uploading.");
      return;
    }
    if (!uploadQueue.length) {
      toast.error("Add at least one document to queue.");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    let successCount = 0;
    for (const item of uploadQueue) {
      if (item.status === "done") continue;
      updateQueueItem(item.id, { status: "uploading", progress: 25, error: null });
      const path = `${user.id}/${Date.now()}-${item.file.name}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, item.file, {
        upsert: true,
        contentType: item.file.type,
      });

      if (upErr) {
        updateQueueItem(item.id, { status: "failed", progress: 100, error: upErr.message });
        continue;
      }

      updateQueueItem(item.id, { status: "saving", progress: 70 });
      const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
      const queueTitle = uploadQueue.find((q) => q.id === item.id)?.title?.trim() || item.title;
      const title = documentForm.title.trim() ? `${documentForm.title.trim()} - ${queueTitle}` : queueTitle;
      const { error } = await sb.from("business_documents").insert({
        user_id: user.id,
        company_id: documentForm.company_id,
        product_id: documentForm.product_id || null,
        title,
        description: documentForm.description.trim() || null,
        tags: documentForm.tags.split(",").map((x) => x.trim()).filter(Boolean),
        document_url: signed?.signedUrl || null,
        storage_path: path,
        mime_type: item.file.type || null,
        size_bytes: item.file.size || null,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        updateQueueItem(item.id, { status: "failed", progress: 100, error: error.message });
        continue;
      }

      successCount += 1;
      updateQueueItem(item.id, { status: "done", progress: 100, error: null });
    }

    if (successCount) {
      toast.success(`${successCount} document(s) uploaded.`);
    } else {
      toast.error("No documents were uploaded.");
    }
    setDocumentForm((p) => ({ ...p, title: "", description: "", tags: "", files: [], product_id: "" }));
    await loadAll();
  };

  const updateDocument = async (doc: BusinessDocument) => {
    const { error } = await sb
      .from("business_documents")
      .update({
        company_id: doc.company_id,
        product_id: doc.product_id,
        title: doc.title,
        description: doc.description,
        tags: doc.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doc.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Document metadata updated.");
    setDocumentDialogOpen(false);
    await loadAll();
  };

  const removeDocument = async (doc: BusinessDocument) => {
    if (doc.storage_path) {
      await supabase.storage.from(bucket).remove([doc.storage_path]);
    }
    const { error } = await sb.from("business_documents").delete().eq("id", doc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Document deleted.");
    setDocumentDialogOpen(false);
    await loadAll();
  };

  const addContact = async () => {
    if (!contactForm.full_name.trim() || !contactForm.company_id) {
      toast.error("Company and contact name are required.");
      return;
    }
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const { error } = await sb.from("business_contacts").insert({
      user_id: user.id,
      company_id: contactForm.company_id,
      full_name: contactForm.full_name.trim(),
      role: contactForm.role.trim() || null,
      contact_type: contactForm.contact_type.trim() || "business",
      relationship_stage: contactForm.relationship_stage,
      email: contactForm.email.trim() || null,
      mobile: contactForm.mobile.trim() || null,
      associated_since: contactForm.associated_since || null,
      last_contacted_at: contactForm.last_contacted_at || null,
      reason: contactForm.reason.trim() || null,
      notes: contactForm.notes.trim() || null,
      is_active: contactForm.is_active,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Business contact saved.");
    setContactForm((p) => ({
      ...p,
      full_name: "",
      role: "",
      contact_type: "business",
      relationship_stage: "active",
      email: "",
      mobile: "",
      associated_since: "",
      last_contacted_at: "",
      reason: "",
      notes: "",
      is_active: true,
    }));
    await loadAll();
  };

  const updateContact = async (contact: BusinessContact) => {
    const { error } = await sb
      .from("business_contacts")
      .update({
        company_id: contact.company_id,
        full_name: contact.full_name,
        role: contact.role,
        contact_type: contact.contact_type,
        relationship_stage: contact.relationship_stage,
        email: contact.email,
        mobile: contact.mobile,
        associated_since: contact.associated_since,
        last_contacted_at: contact.last_contacted_at,
        reason: contact.reason,
        notes: contact.notes,
        is_active: contact.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contact.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contact updated.");
    setContactDialogOpen(false);
    await loadAll();
  };

  const removeContact = async (id: string) => {
    const { error } = await sb.from("business_contacts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contact deleted.");
    setContactDialogOpen(false);
    await loadAll();
  };

  const getDocUrl = (doc: BusinessDocument) => previewUrlMap[doc.id] || doc.document_url || "";

  const stats = {
    companies: companies.length,
    products: products.length,
    documents: documents.length,
    credentials: credentials.length,
    contacts: contacts.length,
  };

  const selectedCompanyProducts = products.filter((p) => !activeCompanyId || p.company_id === activeCompanyId);
  const selectedCompanyDocs = documents.filter((d) => !activeCompanyId || d.company_id === activeCompanyId);
  const selectedCompanyContacts = contacts.filter((c) => !activeCompanyId || c.company_id === activeCompanyId);

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Business Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border/60 p-3 text-sm">Companies: <span className="font-semibold">{stats.companies}</span></div>
          <div className="rounded-lg border border-border/60 p-3 text-sm">Products: <span className="font-semibold">{stats.products}</span></div>
          <div className="rounded-lg border border-border/60 p-3 text-sm">Documents: <span className="font-semibold">{stats.documents}</span></div>
          <div className="rounded-lg border border-border/60 p-3 text-sm">Credentials: <span className="font-semibold">{stats.credentials}</span></div>
          <div className="rounded-lg border border-border/60 p-3 text-sm">Contacts: <span className="font-semibold">{stats.contacts}</span></div>
        </CardContent>
      </Card>

      <Card className="border-blue-500/35 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-400" />Add Company</span>
            <Button onClick={openAddCompany}><Plus className="mr-1 h-4 w-4" />New Company</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Active Company</label>
            <select
              value={activeCompanyId}
              onChange={(e) => {
                setActiveCompanyId(e.target.value);
                setProductForm((p) => ({ ...p, company_id: e.target.value }));
                setCredentialForm((p) => ({ ...p, company_id: e.target.value }));
                setDocumentForm((p) => ({ ...p, company_id: e.target.value }));
                setContactForm((p) => ({ ...p, company_id: e.target.value }));
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All companies</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openViewCompany(c)}
                className="rounded-xl border border-blue-500/45 bg-gradient-to-br from-blue-500/10 via-background/50 to-cyan-500/10 p-4 text-left hover:border-blue-400/70"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-extrabold tracking-wide">{c.brand_name}</p>
                  <Badge className="border-blue-400/50 bg-blue-500/10 text-blue-300" variant="outline">{c.company_type || "Company"}</Badge>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">{c.legal_name}</p>
                <div className="mt-3 grid gap-1 text-[11px]">
                  <p><span className="font-extrabold text-sky-300">CIN</span> <span className="font-semibold">{c.cin || "N/A"}</span></p>
                  <p><span className="font-extrabold text-emerald-300">GSTIN</span> <span className="font-semibold">{c.gstin || c.gst_number || "N/A"}</span></p>
                  <p><span className="font-extrabold text-amber-300">PAN</span> <span className="font-semibold">{c.pan_number || "N/A"}</span></p>
                  <p><span className="font-extrabold text-violet-300">TAN</span> <span className="font-semibold">{c.tan_number || "N/A"}</span></p>
                  <p><span className="font-extrabold text-cyan-300">Udyam</span> <span className="font-semibold">{c.udyam_registration || "N/A"}</span></p>
                  <p><span className="font-extrabold text-fuchsia-300">DPIIT</span> <span className="font-semibold">{c.dpiit_recognition || c.startup_india_id || "N/A"}</span></p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{c.registered_office || "No registered office added"}</p>
                {c.corporate_offices?.length ? (
                  <p className="text-[11px] text-muted-foreground">Corporate offices: <span className="font-semibold">{c.corporate_offices.length}</span></p>
                ) : null}
                <p className="mt-1 text-[11px] text-muted-foreground">Updated: {fmt(c.updated_at)}</p>
              </button>
            ))}
            {!companies.length && <p className="text-sm text-muted-foreground">No companies added yet.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-cyan-500/35 bg-gradient-to-br from-cyan-500/10 via-sky-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-cyan-400" />Business Contacts & Leads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <select
              value={contactForm.company_id}
              onChange={(e) => setContactForm((p) => ({ ...p, company_id: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
            </select>
            <Input value={contactForm.full_name} onChange={(e) => setContactForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Full name" />
            <Input value={contactForm.role} onChange={(e) => setContactForm((p) => ({ ...p, role: e.target.value }))} placeholder="Role (CA, Legal, Advisor, etc.)" />
            <select
              value={contactForm.relationship_stage}
              onChange={(e) => setContactForm((p) => ({ ...p, relationship_stage: e.target.value as ContactStage }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CONTACT_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
            <Input value={contactForm.contact_type} onChange={(e) => setContactForm((p) => ({ ...p, contact_type: e.target.value }))} placeholder="Type (business, CA, lead, etc.)" />
            <Input value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
            <Input value={contactForm.mobile} onChange={(e) => setContactForm((p) => ({ ...p, mobile: e.target.value }))} placeholder="Mobile number" />
            <Input value={contactForm.associated_since} onChange={(e) => setContactForm((p) => ({ ...p, associated_since: e.target.value }))} placeholder="Associated since (YYYY-MM-DD)" />
            <Input value={contactForm.last_contacted_at} onChange={(e) => setContactForm((p) => ({ ...p, last_contacted_at: e.target.value }))} placeholder="Last contacted (YYYY-MM-DD)" />
            <Input value={contactForm.reason} onChange={(e) => setContactForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Reason / purpose" className="md:col-span-2 lg:col-span-3" />
            <div className="flex items-center gap-2 rounded-md border border-border/50 px-3">
              <Switch checked={contactForm.is_active} onCheckedChange={(v) => setContactForm((p) => ({ ...p, is_active: v }))} />
              <span className="text-sm">Currently associated</span>
            </div>
          </div>
          <Textarea value={contactForm.notes} onChange={(e) => setContactForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" rows={2} />
          <Button onClick={addContact}><Plus className="mr-1 h-4 w-4" />Add Contact / Lead</Button>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedCompanyContacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setSelectedContact(c); setContactDialogOpen(true); }}
                className={cn("rounded-lg border bg-background/45 p-3 text-left", contactBorder[c.relationship_stage] || "border-cyan-500/35")}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{c.full_name}</p>
                  <Badge variant="outline">{c.relationship_stage}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.role || c.contact_type || "contact"}</p>
                <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email || "No email"}</p>
                  <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.mobile || "No mobile"}</p>
                  <p className="flex items-center gap-1"><Clock3 className="h-3 w-3" />Last: {c.last_contacted_at ? fmt(c.last_contacted_at) : "N/A"}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{c.reason || c.notes || "No notes"}</p>
              </button>
            ))}
            {!selectedCompanyContacts.length && <p className="text-sm text-muted-foreground">No contacts/leads for current selection.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/35 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-amber-400" />Add Business Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <select
              value={documentForm.company_id}
              onChange={(e) => setDocumentForm((p) => ({ ...p, company_id: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
            </select>
            <select
              value={documentForm.product_id}
              onChange={(e) => setDocumentForm((p) => ({ ...p, product_id: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Link product (optional)</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Input value={documentForm.title} onChange={(e) => setDocumentForm((p) => ({ ...p, title: e.target.value }))} placeholder="Optional custom title prefix" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={documentForm.tags} onChange={(e) => setDocumentForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated)" />
            <Input type="file" multiple onChange={(e) => {
              const files = e.target.files;
              if (!files?.length) return;
              setDocumentForm((p) => ({ ...p, files: [...p.files, ...Array.from(files)] }));
              addFilesToQueue(files);
              e.currentTarget.value = "";
            }} />
          </div>
          <Textarea value={documentForm.description} onChange={(e) => setDocumentForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant={docView === "list" ? "default" : "outline"} size="sm" onClick={() => setDocView("list")}>List</Button>
              <Button variant={docView === "grid" ? "default" : "outline"} size="sm" onClick={() => setDocView("grid")}>Grid</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { setUploadQueue([]); setDocumentForm((p) => ({ ...p, files: [] })); }}>Clear Queue</Button>
              <Button onClick={uploadDocumentsBulk}><Upload className="mr-1 h-4 w-4" />Upload Queue</Button>
            </div>
          </div>
          <div className="rounded-lg border border-amber-500/35 bg-background/40 p-3">
            <p className="mb-2 text-sm font-semibold">Bulk Upload Queue</p>
            <div className="space-y-2">
              {uploadQueue.map((item) => (
                <div key={item.id} className="rounded-md border border-border/50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={item.title}
                      onChange={(e) => updateQueueItem(item.id, { title: e.target.value })}
                      className="h-8"
                    />
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">{item.file.name}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-border/50">
                    <div className={cn("h-full transition-all", item.status === "failed" ? "bg-red-500" : "bg-amber-400")} style={{ width: `${item.progress}%` }} />
                  </div>
                  {item.error ? <p className="mt-1 text-[11px] text-red-400">{item.error}</p> : null}
                </div>
              ))}
              {!uploadQueue.length ? <p className="text-xs text-muted-foreground">No files in queue.</p> : null}
            </div>
          </div>

          <div className={cn("gap-3", docView === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "space-y-2") }>
            {selectedCompanyDocs.map((d) => (
              <div key={d.id} className="rounded-lg border border-amber-500/35 bg-background/45 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{companyMap.get(d.company_id || "")?.brand_name || "N/A"}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => { setSelectedDocument(d); setDocumentDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{d.mime_type || "file"} • {size(d.size_bytes)}</p>
                <p className="text-[11px] text-muted-foreground">{fmt(d.created_at)}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {d.tags.map((t) => <Badge key={`${d.id}-${t}`} variant="secondary">{t}</Badge>)}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { const url = getDocUrl(d); if (url) window.open(url, "_blank"); }}>Preview</Button>
                  <a href={getDocUrl(d)} target="_blank" rel="noreferrer" download>
                    <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Download</Button>
                  </a>
                </div>
              </div>
            ))}
            {!selectedCompanyDocs.length && <p className="text-sm text-muted-foreground">No documents for current selection.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/35 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-emerald-400" />Add Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <select
              value={productForm.company_id}
              onChange={(e) => setProductForm((p) => ({ ...p, company_id: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
            </select>
            <Input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" />
            <select
              value={productForm.status}
              onChange={(e) => setProductForm((p) => ({ ...p, status: e.target.value as ProductStatus }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input value={productForm.product_url} onChange={(e) => setProductForm((p) => ({ ...p, product_url: e.target.value }))} placeholder="Product URL" />
            <Input value={productForm.documentation_url} onChange={(e) => setProductForm((p) => ({ ...p, documentation_url: e.target.value }))} placeholder="Documentation URL" />
            <Input value={productForm.hosting} onChange={(e) => setProductForm((p) => ({ ...p, hosting: e.target.value }))} placeholder="Hosting" />
          </div>
          <Input value={productForm.tags} onChange={(e) => setProductForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated)" />
          <Textarea value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} />
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-2"><Switch checked={productForm.platform_web} onCheckedChange={(v) => setProductForm((p) => ({ ...p, platform_web: v }))} /><span className="text-sm">Web</span></div>
            <div className="flex items-center gap-2"><Switch checked={productForm.platform_mobile} onCheckedChange={(v) => setProductForm((p) => ({ ...p, platform_mobile: v }))} /><span className="text-sm">Mobile</span></div>
            <div className="flex items-center gap-2"><Switch checked={productForm.platform_desktop} onCheckedChange={(v) => setProductForm((p) => ({ ...p, platform_desktop: v }))} /><span className="text-sm">Desktop</span></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant={productView === "grid" ? "default" : "outline"} size="sm" onClick={() => setProductView("grid")}>Grid</Button>
              <Button variant={productView === "list" ? "default" : "outline"} size="sm" onClick={() => setProductView("list")}>List</Button>
            </div>
            <Button onClick={addProduct}><Plus className="mr-1 h-4 w-4" />Add Product</Button>
          </div>

          <div className={cn("gap-3", productView === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "space-y-2")}>
            {selectedCompanyProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setSelectedProduct(p); setProductDialogOpen(true); }}
                className={cn("rounded-lg border bg-background/45 p-3 text-left", statusBorder[p.status] || "border-border/60")}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{p.name}</p>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{companyMap.get(p.company_id || "")?.brand_name || "N/A"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.hosting || "No hosting"}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.platform_web && <Badge variant="secondary">Web</Badge>}
                  {p.platform_mobile && <Badge variant="secondary">Mobile</Badge>}
                  {p.platform_desktop && <Badge variant="secondary">Desktop</Badge>}
                </div>
              </button>
            ))}
            {!selectedCompanyProducts.length && <p className="text-sm text-muted-foreground">No products for current selection.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-violet-500/35 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-violet-400" />Add Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-amber-500">Store metadata/hints only. Do not store raw passwords/secrets.</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <select
              value={credentialForm.company_id}
              onChange={(e) => setCredentialForm((p) => ({ ...p, company_id: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
            </select>
            <select
              value={credentialForm.product_id}
              onChange={(e) => setCredentialForm((p) => ({ ...p, product_id: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Linked product (optional)</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Input value={credentialForm.label} onChange={(e) => setCredentialForm((p) => ({ ...p, label: e.target.value }))} placeholder="Label" />
            <Input value={credentialForm.system} onChange={(e) => setCredentialForm((p) => ({ ...p, system: e.target.value }))} placeholder="System" />
            <Input value={credentialForm.username} onChange={(e) => setCredentialForm((p) => ({ ...p, username: e.target.value }))} placeholder="Username / email" />
            <Input value={credentialForm.last_rotated_at} onChange={(e) => setCredentialForm((p) => ({ ...p, last_rotated_at: e.target.value }))} placeholder="Last rotated (YYYY-MM-DD)" />
          </div>
          <Input value={credentialForm.secret_hint} onChange={(e) => setCredentialForm((p) => ({ ...p, secret_hint: e.target.value }))} placeholder="Secret hint" />
          <Textarea value={credentialForm.notes} onChange={(e) => setCredentialForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" rows={2} />
          <Button onClick={addCredential}><Plus className="mr-1 h-4 w-4" />Add Credential</Button>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {credentials
              .filter((c) => !activeCompanyId || c.company_id === activeCompanyId)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelectedCredential(c); setCredentialDialogOpen(true); }}
                  className="rounded-lg border border-violet-500/35 bg-background/45 p-3 text-left"
                >
                  <p className="font-semibold">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.system || "N/A"} • {c.username || "N/A"}</p>
                  <p className="text-[11px] text-muted-foreground">Rotated: {c.last_rotated_at || "N/A"}</p>
                </button>
              ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {companyDialogMode === "add" ? "Add Company" : companyDialogMode === "edit" ? "Edit Company" : "Company Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={companyForm.legal_name} onChange={(e) => setCompanyForm((p) => ({ ...p, legal_name: e.target.value }))} placeholder="Legal name" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.brand_name} onChange={(e) => setCompanyForm((p) => ({ ...p, brand_name: e.target.value }))} placeholder="Brand name" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.website} onChange={(e) => setCompanyForm((p) => ({ ...p, website: e.target.value }))} placeholder="Primary website" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.registered_date} onChange={(e) => setCompanyForm((p) => ({ ...p, registered_date: e.target.value }))} placeholder="Registered date (YYYY-MM-DD)" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.incorporation_date} onChange={(e) => setCompanyForm((p) => ({ ...p, incorporation_date: e.target.value }))} placeholder="Incorporation date (YYYY-MM-DD)" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.company_type} onChange={(e) => setCompanyForm((p) => ({ ...p, company_type: e.target.value }))} placeholder="Company type" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.registered_office} onChange={(e) => setCompanyForm((p) => ({ ...p, registered_office: e.target.value }))} placeholder="Registered office" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.corporate_offices} onChange={(e) => setCompanyForm((p) => ({ ...p, corporate_offices: e.target.value }))} placeholder="Corporate offices (comma separated)" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.cin} onChange={(e) => setCompanyForm((p) => ({ ...p, cin: e.target.value }))} placeholder="CIN" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.gstin} onChange={(e) => setCompanyForm((p) => ({ ...p, gstin: e.target.value, gst_number: e.target.value }))} placeholder="GSTIN" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.udyam_registration} onChange={(e) => setCompanyForm((p) => ({ ...p, udyam_registration: e.target.value }))} placeholder="Udyam registration" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.dpiit_recognition} onChange={(e) => setCompanyForm((p) => ({ ...p, dpiit_recognition: e.target.value }))} placeholder="DPIIT recognition" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.pan_number} onChange={(e) => setCompanyForm((p) => ({ ...p, pan_number: e.target.value }))} placeholder="PAN" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.tan_number} onChange={(e) => setCompanyForm((p) => ({ ...p, tan_number: e.target.value }))} placeholder="TAN" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.gst_number} onChange={(e) => setCompanyForm((p) => ({ ...p, gst_number: e.target.value }))} placeholder="GST" disabled={companyDialogMode === "view"} />
              <Input value={companyForm.startup_india_id} onChange={(e) => setCompanyForm((p) => ({ ...p, startup_india_id: e.target.value }))} placeholder="Startup India ID" disabled={companyDialogMode === "view"} />
            </div>
            <Input value={companyForm.website_urls} onChange={(e) => setCompanyForm((p) => ({ ...p, website_urls: e.target.value }))} placeholder="Website URLs (comma separated)" disabled={companyDialogMode === "view"} />
            <Input value={companyForm.regulatory_ids} onChange={(e) => setCompanyForm((p) => ({ ...p, regulatory_ids: e.target.value }))} placeholder="Other IDs (comma separated)" disabled={companyDialogMode === "view"} />
            <Textarea value={companyForm.notes} onChange={(e) => setCompanyForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" rows={3} disabled={companyDialogMode === "view"} />

            <div className="flex flex-wrap justify-end gap-2">
              {companyDialogMode === "view" && selectedCompany && (
                <>
                  <Button variant="outline" onClick={() => setCompanyDialogMode("edit")}><Pencil className="mr-1 h-4 w-4" />Edit</Button>
                  <Button variant="destructive" onClick={() => deleteCompany(selectedCompany.id)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                </>
              )}
              {companyDialogMode !== "view" && (
                <Button onClick={saveCompany}>Save Company</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={selectedProduct.name} onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })} />
                <select
                  value={selectedProduct.status}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, status: e.target.value })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={selectedProduct.company_id || ""}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, company_id: e.target.value || null })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">No company</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
                </select>
                <Input value={selectedProduct.hosting || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, hosting: e.target.value })} placeholder="Hosting" />
                <Input value={selectedProduct.product_url || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, product_url: e.target.value })} placeholder="Product URL" className="md:col-span-2" />
                <Input value={selectedProduct.documentation_url || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, documentation_url: e.target.value })} placeholder="Documentation URL" className="md:col-span-2" />
              </div>
              <Input
                value={selectedProduct.tags.join(", ")}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                placeholder="Tags"
              />
              <Textarea value={selectedProduct.description || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })} rows={3} placeholder="Description" />

              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-2"><Switch checked={selectedProduct.platform_web} onCheckedChange={(v) => setSelectedProduct({ ...selectedProduct, platform_web: v })} /><span className="text-sm">Web</span></div>
                <div className="flex items-center gap-2"><Switch checked={selectedProduct.platform_mobile} onCheckedChange={(v) => setSelectedProduct({ ...selectedProduct, platform_mobile: v })} /><span className="text-sm">Mobile</span></div>
                <div className="flex items-center gap-2"><Switch checked={selectedProduct.platform_desktop} onCheckedChange={(v) => setSelectedProduct({ ...selectedProduct, platform_desktop: v })} /><span className="text-sm">Desktop</span></div>
              </div>

              <div className="rounded-lg border border-border/60 p-3">
                <p className="mb-2 text-sm font-semibold flex items-center gap-2"><Layers className="h-4 w-4" />Linked Documents</p>
                {documents.filter((d) => d.product_id === selectedProduct.id).map((d) => (
                  <div key={d.id} className="mb-2 flex items-center justify-between rounded-md border border-border/40 p-2 text-sm">
                    <span>{d.title}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { const u = getDocUrl(d); if (u) window.open(u, "_blank"); }}>Preview</Button>
                      <a href={getDocUrl(d)} target="_blank" rel="noreferrer" download>
                        <Button size="sm" variant="outline">Download</Button>
                      </a>
                    </div>
                  </div>
                ))}
                {!documents.filter((d) => d.product_id === selectedProduct.id).length && (
                  <p className="text-xs text-muted-foreground">No linked documents.</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => removeProduct(selectedProduct.id)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                <Button onClick={() => updateProduct(selectedProduct)}>Update Product</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={credentialDialogOpen} onOpenChange={setCredentialDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Credential Details</DialogTitle>
          </DialogHeader>
          {selectedCredential && (
            <div className="space-y-3">
              <Input value={selectedCredential.label} onChange={(e) => setSelectedCredential({ ...selectedCredential, label: e.target.value })} />
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={selectedCredential.company_id || ""}
                  onChange={(e) => setSelectedCredential({ ...selectedCredential, company_id: e.target.value || null })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">No company</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
                </select>
                <select
                  value={selectedCredential.product_id || ""}
                  onChange={(e) => setSelectedCredential({ ...selectedCredential, product_id: e.target.value || null })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">No product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Input value={selectedCredential.system || ""} onChange={(e) => setSelectedCredential({ ...selectedCredential, system: e.target.value })} placeholder="System" />
                <Input value={selectedCredential.username || ""} onChange={(e) => setSelectedCredential({ ...selectedCredential, username: e.target.value })} placeholder="Username" />
                <Input value={selectedCredential.secret_hint || ""} onChange={(e) => setSelectedCredential({ ...selectedCredential, secret_hint: e.target.value })} placeholder="Secret hint" />
                <Input value={selectedCredential.last_rotated_at || ""} onChange={(e) => setSelectedCredential({ ...selectedCredential, last_rotated_at: e.target.value })} placeholder="Last rotated" />
              </div>
              <Textarea value={selectedCredential.notes || ""} onChange={(e) => setSelectedCredential({ ...selectedCredential, notes: e.target.value })} rows={3} />
              <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => removeCredential(selectedCredential.id)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                <Button onClick={() => updateCredential(selectedCredential)}>Update Credential</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" />Business Contact / Lead</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={selectedContact.full_name} onChange={(e) => setSelectedContact({ ...selectedContact, full_name: e.target.value })} />
                <Input value={selectedContact.role || ""} onChange={(e) => setSelectedContact({ ...selectedContact, role: e.target.value })} placeholder="Role" />
                <select
                  value={selectedContact.company_id || ""}
                  onChange={(e) => setSelectedContact({ ...selectedContact, company_id: e.target.value || null })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">No company</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
                </select>
                <Input value={selectedContact.contact_type || ""} onChange={(e) => setSelectedContact({ ...selectedContact, contact_type: e.target.value })} placeholder="Contact type" />
                <select
                  value={selectedContact.relationship_stage}
                  onChange={(e) => setSelectedContact({ ...selectedContact, relationship_stage: e.target.value })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CONTACT_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                </select>
                <div className="flex items-center gap-2 rounded-md border border-border/50 px-3">
                  <Switch checked={selectedContact.is_active} onCheckedChange={(v) => setSelectedContact({ ...selectedContact, is_active: v })} />
                  <span className="text-sm">Associated now</span>
                </div>
                <Input value={selectedContact.email || ""} onChange={(e) => setSelectedContact({ ...selectedContact, email: e.target.value })} placeholder="Email" />
                <Input value={selectedContact.mobile || ""} onChange={(e) => setSelectedContact({ ...selectedContact, mobile: e.target.value })} placeholder="Mobile" />
                <Input value={selectedContact.associated_since || ""} onChange={(e) => setSelectedContact({ ...selectedContact, associated_since: e.target.value })} placeholder="Associated since (YYYY-MM-DD)" />
                <Input value={selectedContact.last_contacted_at || ""} onChange={(e) => setSelectedContact({ ...selectedContact, last_contacted_at: e.target.value })} placeholder="Last contacted (YYYY-MM-DD)" />
                <Input value={selectedContact.reason || ""} onChange={(e) => setSelectedContact({ ...selectedContact, reason: e.target.value })} placeholder="Reason" className="md:col-span-2" />
              </div>
              <Textarea value={selectedContact.notes || ""} onChange={(e) => setSelectedContact({ ...selectedContact, notes: e.target.value })} rows={3} />
              <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => removeContact(selectedContact.id)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                <Button onClick={() => updateContact(selectedContact)}>Update Contact</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Business Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-3">
              <Input value={selectedDocument.title} onChange={(e) => setSelectedDocument({ ...selectedDocument, title: e.target.value })} />
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={selectedDocument.company_id || ""}
                  onChange={(e) => setSelectedDocument({ ...selectedDocument, company_id: e.target.value || null })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">No company</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.brand_name}</option>)}
                </select>
                <select
                  value={selectedDocument.product_id || ""}
                  onChange={(e) => setSelectedDocument({ ...selectedDocument, product_id: e.target.value || null })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">No product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <Input
                value={selectedDocument.tags.join(", ")}
                onChange={(e) => setSelectedDocument({ ...selectedDocument, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                placeholder="Tags"
              />
              <Textarea value={selectedDocument.description || ""} onChange={(e) => setSelectedDocument({ ...selectedDocument, description: e.target.value })} rows={3} />

              <div className="rounded-lg border border-border/60 p-3 text-sm">
                <p>MIME: {selectedDocument.mime_type || "N/A"}</p>
                <p>Size: {size(selectedDocument.size_bytes)}</p>
                <p>Created: {fmt(selectedDocument.created_at)}</p>
                <p>Updated: {fmt(selectedDocument.updated_at)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => { const u = getDocUrl(selectedDocument); if (u) window.open(u, "_blank"); }}><Eye className="mr-1 h-4 w-4" />Preview</Button>
                <a href={getDocUrl(selectedDocument)} target="_blank" rel="noreferrer" download>
                  <Button variant="outline"><Download className="mr-1 h-4 w-4" />Download</Button>
                </a>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => removeDocument(selectedDocument)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                <Button onClick={() => updateDocument(selectedDocument)}>Update Document</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? <p className="text-sm text-muted-foreground">Loading business hub...</p> : null}
    </div>
  );
}
