import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Calendar,
  Tag,
  Image as ImageIcon,
  Save,
  X,
  Bold,
  Italic,
  List,
  Link2,
  Code,
  Quote,
  Heading1,
  Heading2,
  AlignLeft,
  Globe,
  Clock,
  TrendingUp,
  Crown,
  Shield,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BiometricVerificationModal } from "./BiometricVerificationModal";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  heroImage: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  isPremium: boolean;
  views: number;
  createdAt: string;
  publishedAt: string | null;
}

const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "Building Scalable Microservices with .NET 8",
    slug: "scalable-microservices-dotnet-8",
    excerpt: "Learn how to architect and build production-ready microservices using .NET 8 and modern patterns.",
    content: "# Introduction\n\nMicroservices architecture has become the standard...",
    heroImage: "/placeholder.svg",
    tags: [".NET", "Microservices", "Architecture"],
    metaTitle: "Building Scalable Microservices with .NET 8 | Abhishek Panda",
    metaDescription: "Comprehensive guide to building scalable microservices with .NET 8, covering DDD, CQRS, and event sourcing patterns.",
    isPublished: true,
    isPremium: false,
    views: 12500,
    createdAt: "2024-01-15",
    publishedAt: "2024-01-16"
  },
  {
    id: "2",
    title: "The Future of AI in Enterprise Applications",
    slug: "future-ai-enterprise-applications",
    excerpt: "Exploring how AI is transforming enterprise software development and what architects need to know.",
    content: "# AI Revolution\n\nArtificial Intelligence is reshaping...",
    heroImage: "/placeholder.svg",
    tags: ["AI", "Enterprise", "Machine Learning"],
    metaTitle: "The Future of AI in Enterprise Applications",
    metaDescription: "Deep dive into AI adoption in enterprise applications with practical insights for architects.",
    isPublished: true,
    isPremium: true,
    views: 8900,
    createdAt: "2024-01-20",
    publishedAt: "2024-01-21"
  },
  {
    id: "3",
    title: "Cloud-Native Design Patterns [Draft]",
    slug: "cloud-native-design-patterns",
    excerpt: "Essential patterns for building cloud-native applications on Azure and AWS.",
    content: "# Cloud Native...",
    heroImage: "",
    tags: ["Cloud", "Patterns", "Azure"],
    metaTitle: "",
    metaDescription: "",
    isPublished: false,
    isPremium: false,
    views: 0,
    createdAt: "2024-02-01",
    publishedAt: null
  }
];

export const AdminBlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [newTag, setNewTag] = useState("");
  const [showBiometricModal, setShowBiometricModal] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPublishBiometric, setShowPublishBiometric] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);

  const handleBiometricSuccess = () => {
    setIsUnlocked(true);
    setShowBiometricModal(false);
  };

  const handlePublishBiometricSuccess = () => {
    setShowPublishBiometric(false);
    if (selectedPost && pendingPublish) {
      setSelectedPost({ ...selectedPost, isPublished: true, publishedAt: new Date().toISOString().split("T")[0] });
      setPendingPublish(false);
    }
  };

  const handlePublishToggle = (checked: boolean) => {
    if (checked && !selectedPost?.isPublished) {
      // Require biometric verification to publish
      setPendingPublish(true);
      setShowPublishBiometric(true);
    } else {
      setSelectedPost({ ...selectedPost!, isPublished: checked });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.isPublished).length,
    drafts: posts.filter(p => !p.isPublished).length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0)
  };

  const handleCreatePost = () => {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: "Untitled Post",
      slug: "untitled-post",
      excerpt: "",
      content: "",
      heroImage: "",
      tags: [],
      metaTitle: "",
      metaDescription: "",
      isPublished: false,
      isPremium: false,
      views: 0,
      createdAt: new Date().toISOString().split("T")[0],
      publishedAt: null
    };
    setSelectedPost(newPost);
    setIsEditing(true);
  };

  const handleAddTag = () => {
    if (newTag && selectedPost && !selectedPost.tags.includes(newTag)) {
      setSelectedPost({
        ...selectedPost,
        tags: [...selectedPost.tags, newTag]
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (selectedPost) {
      setSelectedPost({
        ...selectedPost,
        tags: selectedPost.tags.filter(t => t !== tagToRemove)
      });
    }
  };

  const EditorToolbar = () => (
    <div className="flex items-center gap-1 p-2 bg-muted rounded-lg mb-2">
      {[
        { icon: Bold, label: "Bold" },
        { icon: Italic, label: "Italic" },
        { icon: Heading1, label: "H1" },
        { icon: Heading2, label: "H2" },
        { icon: List, label: "List" },
        { icon: Quote, label: "Quote" },
        { icon: Code, label: "Code" },
        { icon: Link2, label: "Link" },
        { icon: ImageIcon, label: "Image" },
        { icon: AlignLeft, label: "Align" },
      ].map((tool, index) => (
        <Button 
          key={index} 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-background" 
          title={tool.label}
        >
          <tool.icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );

  if (!isUnlocked) {
    return (
      <>
        <BiometricVerificationModal
          isOpen={showBiometricModal}
          onClose={() => setShowBiometricModal(false)}
          onSuccess={handleBiometricSuccess}
          title="Access CMS Studio"
          subtitle="Verify identity to manage blog content"
          moduleName="CMS STUDIO"
        />
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center border border-purple-500/30">
            <FileText className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">CMS Studio Protected</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Biometric verification required to manage blog content
          </p>
          <Button
            onClick={() => setShowBiometricModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            <Shield className="w-4 h-4 mr-2" />
            Verify Identity
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Publish Biometric Modal */}
      <BiometricVerificationModal
        isOpen={showPublishBiometric}
        onClose={() => {
          setShowPublishBiometric(false);
          setPendingPublish(false);
        }}
        onSuccess={handlePublishBiometricSuccess}
        title="Publish Content"
        subtitle="Verify identity to publish this post"
        moduleName="PUBLISH"
      />
      
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: stats.total, icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Published", value: stats.published, icon: Globe, color: "from-green-500 to-green-600" },
          { label: "Drafts", value: stats.drafts, icon: Clock, color: "from-amber-500 to-amber-600" },
          { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: "from-purple-500 to-purple-600" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-input"
          />
        </div>
        <Button onClick={handleCreatePost} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">All Posts</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => { setSelectedPost(post); setIsEditing(false); setActiveTab("content"); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPost?.id === post.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-2">{post.title}</h4>
                  {post.isPremium && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {post.isPublished ? (
                    <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Published</Badge>
                  ) : (
                    <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Draft</Badge>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" />{post.views}
                  </span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {post.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">+{post.tags.length - 2}</Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Post Editor */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedPost ? (
              <motion.div
                key={selectedPost.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    {(["content", "seo", "settings"] as const).map(tab => (
                      <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab(tab)}
                        className={activeTab === tab ? "bg-primary text-primary-foreground" : ""}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Tab */}
                {activeTab === "content" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                      <Input
                        value={selectedPost.title}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPost({ ...selectedPost, title: e.target.value })}
                        className="bg-background text-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Hero Image</label>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                          {selectedPost.heroImage ? (
                            <img src={selectedPost.heroImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        {isEditing && (
                          <Button variant="outline" size="sm">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Excerpt</label>
                      <Textarea
                        value={selectedPost.excerpt}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPost({ ...selectedPost, excerpt: e.target.value })}
                        className="bg-background min-h-[80px]"
                        placeholder="Brief summary of the post..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
                      {isEditing && <EditorToolbar />}
                      <Textarea
                        value={selectedPost.content}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPost({ ...selectedPost, content: e.target.value })}
                        className="bg-background min-h-[300px] font-mono text-sm"
                        placeholder="Write your post content in Markdown..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedPost.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            {isEditing && (
                              <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTag(tag)} />
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add tag..."
                            className="bg-background flex-1"
                            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                          />
                          <Button variant="outline" size="sm" onClick={handleAddTag}>
                            <Tag className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === "seo" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Slug</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">abhishekpanda.com/blog/</span>
                        <Input
                          value={selectedPost.slug}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedPost({ ...selectedPost, slug: e.target.value })}
                          className="bg-background flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Meta Title</label>
                      <Input
                        value={selectedPost.metaTitle}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPost({ ...selectedPost, metaTitle: e.target.value })}
                        className="bg-background"
                        placeholder="SEO-optimized title (60 chars max)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{selectedPost.metaTitle.length}/60 characters</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Meta Description</label>
                      <Textarea
                        value={selectedPost.metaDescription}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPost({ ...selectedPost, metaDescription: e.target.value })}
                        className="bg-background min-h-[100px]"
                        placeholder="SEO description (160 chars max)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{selectedPost.metaDescription.length}/160 characters</p>
                    </div>

                    {/* SEO Preview */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Google Preview</p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm truncate">
                        {selectedPost.metaTitle || selectedPost.title}
                      </p>
                      <p className="text-green-600 dark:text-green-400 text-xs truncate">
                        abhishekpanda.com/blog/{selectedPost.slug}
                      </p>
                      <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                        {selectedPost.metaDescription || selectedPost.excerpt}
                      </p>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Publish Status</p>
                          <p className="text-sm text-muted-foreground">Requires biometric verification to publish</p>
                        </div>
                      </div>
                      <Switch
                        checked={selectedPost.isPublished}
                        disabled={!isEditing}
                        onCheckedChange={handlePublishToggle}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Premium Content</p>
                        <p className="text-sm text-muted-foreground">Require payment to access full content</p>
                      </div>
                      <Switch
                        checked={selectedPost.isPremium}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => setSelectedPost({ ...selectedPost, isPremium: checked })}
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium text-foreground mb-3">Post Information</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="text-foreground font-medium">{selectedPost.createdAt}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Published</p>
                          <p className="text-foreground font-medium">{selectedPost.publishedAt || "Not published"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="text-foreground font-medium">{selectedPost.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Post ID</p>
                          <p className="text-foreground font-medium font-mono text-xs">{selectedPost.id}</p>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[600px] flex items-center justify-center bg-card border border-border rounded-xl"
              >
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Post Selected</h3>
                  <p className="text-muted-foreground mb-4">Select a post from the list or create a new one</p>
                  <Button onClick={handleCreatePost} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Post
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </>
  );
};
