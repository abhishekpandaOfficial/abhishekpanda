import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Plus,
  Calendar,
  Clock,
  Send,
  Trash2,
  Edit,
  Heart,
  MessageCircle,
  CheckCircle2,
  BarChart3,
  ExternalLink,
  Link2,
  BookOpen,
  GraduationCap,
  Layers,
  Globe,
  Code,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAdminSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import AdminSocialProfilesManager from "./AdminSocialProfilesManager";

interface SocialPost {
  id: string;
  content: string;
  platforms: string[]; // platform keys from `public.social_profiles.platform`
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledAt: string | null;
  publishedAt: string | null;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  image?: string;
}

interface SocialAccount {
  key: string;
  platform: string;
  connected: boolean;
  username: string;
  profileUrl: string;
  followers: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}

const SOCIAL_ACCOUNTS: SocialAccount[] = [
  { 
    key: "instagram",
    platform: "Instagram", 
    connected: true, 
    username: "the_abhishekpanda", 
    profileUrl: "https://www.instagram.com/the_abhishekpanda/",
    followers: 1250, 
    icon: Instagram, 
    color: "text-[#E4405F]",
    bgColor: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    description: "Photo & Reels content"
  },
  { 
    key: "youtube",
    platform: "YouTube", 
    connected: true, 
    username: "abhishekpanda_official", 
    profileUrl: "https://www.youtube.com/@abhishekpanda_official",
    followers: 5600, 
    icon: Youtube, 
    color: "text-[#FF0000]",
    bgColor: "bg-[#FF0000]",
    description: "Video tutorials & content"
  },
  { 
    key: "linkedin",
    platform: "LinkedIn", 
    connected: true, 
    username: "abhishekpandaofficial", 
    profileUrl: "https://www.linkedin.com/in/abhishekpandaofficial/",
    followers: 8200, 
    icon: Linkedin, 
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]",
    description: "Professional network"
  },
  { 
    key: "github",
    platform: "GitHub", 
    connected: true, 
    username: "abhishekpandaOfficial", 
    profileUrl: "https://github.com/abhishekpandaOfficial",
    followers: 1500, 
    icon: Code, 
    color: "text-foreground",
    bgColor: "bg-[#333]",
    description: "Open source & code"
  },
  { 
    key: "x",
    platform: "Twitter/X", 
    connected: true, 
    username: "Panda_Abhishek8", 
    profileUrl: "https://x.com/Panda_Abhishek8",
    followers: 0,
    icon: Twitter, 
    color: "text-foreground",
    bgColor: "bg-black",
    description: "Tweets & threads"
  },
  { 
    key: "udemy",
    platform: "Udemy", 
    connected: true, 
    username: "abhishek-panda-134", 
    profileUrl: "https://www.udemy.com/user/abhishek-panda-134/",
    followers: 3200, 
    icon: GraduationCap, 
    color: "text-[#A435F0]",
    bgColor: "bg-[#A435F0]",
    description: "Online courses"
  },
  { 
    key: "medium",
    platform: "Medium", 
    connected: true, 
    username: "official.abhishekpanda", 
    profileUrl: "https://medium.com/@official.abhishekpanda",
    followers: 980, 
    icon: BookOpen, 
    color: "text-foreground",
    bgColor: "bg-black",
    description: "Blog articles"
  },
  { 
    key: "substack",
    platform: "Substack", 
    connected: true, 
    username: "abhishekpanda08", 
    profileUrl: "https://substack.com/@abhishekpanda08",
    followers: 450, 
    icon: Layers, 
    color: "text-[#FF6719]",
    bgColor: "bg-[#FF6719]",
    description: "Newsletter"
  },
  { 
    key: "website",
    platform: "Website", 
    connected: true, 
    username: "abhishekpanda.com", 
    profileUrl: "https://www.abhishekpanda.com/",
    followers: 0, 
    icon: Globe, 
    color: "text-primary",
    bgColor: "bg-primary",
    description: "Personal website"
  },
  { 
    key: "stackexchange",
    platform: "Stack Overflow", 
    connected: true, 
    username: "abhishek-official", 
    profileUrl: "https://writing.stackexchange.com/users/82639/abhishek-official",
    followers: 320, 
    icon: Layers, 
    color: "text-[#F48024]",
    bgColor: "bg-[#F48024]",
    description: "Q&A community"
  },
  { 
    key: "hashnode",
    platform: "Hashnode", 
    connected: true, 
    username: "abhishekpanda", 
    profileUrl: "https://hashnode.com/@abhishekpanda",
    followers: 680, 
    icon: Hash, 
    color: "text-[#2962FF]",
    bgColor: "bg-[#2962FF]",
    description: "Developer blog"
  },
];

const SAMPLE_POSTS: SocialPost[] = [
  {
    id: "1",
    content: "🚀 Just published a new blog post on building scalable microservices with .NET 8! Check it out and let me know your thoughts. #dotnet #microservices #architecture",
    platforms: ["linkedin", "medium"],
    status: "published",
    scheduledAt: null,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    engagement: { likes: 245, comments: 32, shares: 18 },
  },
  {
    id: "2",
    content: "Excited to announce my upcoming course on AI/ML Engineering! Stay tuned for early bird pricing 🎓 #AI #MachineLearning #Learning",
    platforms: ["linkedin", "youtube", "instagram"],
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    publishedAt: null,
    engagement: { likes: 0, comments: 0, shares: 0 },
  },
  {
    id: "3",
    content: "Working on something exciting! 🔥 Can't wait to share it with you all. #BuildInPublic #Innovation",
    platforms: ["instagram"],
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    engagement: { likes: 0, comments: 0, shares: 0 },
  },
];

export const AdminSocialHub = () => {
  const [posts, setPosts] = useState<SocialPost[]>(SAMPLE_POSTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: socialRows } = useAdminSocialProfiles();
  const accounts: SocialAccount[] = useMemo(() => {
    if (!socialRows) return SOCIAL_ACCOUNTS;
    return socialRows
      .filter((r) => !!r.profile_url)
      .map((r) => ({
        key: r.platform,
        platform: r.display_name,
        connected: r.connected,
        username: r.username || "",
        profileUrl: r.profile_url || "",
        followers: r.followers ?? 0,
        icon: iconForKey(r.icon_key),
        color: "text-white",
        bgColor: r.brand_bg || "bg-muted",
        description: r.description || "",
      }));
  }, [socialRows]);
  const [newPost, setNewPost] = useState({
    content: "",
    platforms: [] as string[],
    schedulePost: false,
    scheduledAt: "",
  });

  const handleTogglePlatform = (platform: string) => {
    setNewPost((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleCreatePost = () => {
    if (!newPost.content || newPost.platforms.length === 0) {
      toast.error("Please add content and select at least one platform");
      return;
    }

    const post: SocialPost = {
      id: Date.now().toString(),
      content: newPost.content,
      platforms: newPost.platforms,
      status: newPost.schedulePost ? "scheduled" : "draft",
      scheduledAt: newPost.schedulePost ? newPost.scheduledAt : null,
      publishedAt: null,
      engagement: { likes: 0, comments: 0, shares: 0 },
    };

    setPosts((prev) => [post, ...prev]);
    setIsCreateOpen(false);
    setNewPost({ content: "", platforms: [], schedulePost: false, scheduledAt: "" });
    toast.success(newPost.schedulePost ? "Post scheduled successfully" : "Post saved as draft");
  };

  const handlePublishNow = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "published" as const, publishedAt: new Date().toISOString() }
          : p
      )
    );
    toast.success("Post published successfully!");
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Post deleted");
  };

  const getStatusBadge = (status: SocialPost["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Published</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Scheduled</Badge>;
      case "draft":
        return <Badge className="bg-muted text-muted-foreground">Draft</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
    }
  };

  const connectedAccounts = accounts.filter(a => a.connected);
  const totalFollowers = connectedAccounts.reduce((sum, a) => sum + a.followers, 0);
  const publishedPosts = posts.filter((p) => p.status === "published");
  const totalEngagement = publishedPosts.reduce(
    (sum, p) => sum + p.engagement.likes + p.engagement.comments + p.engagement.shares,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Share2 className="w-7 h-7 text-primary" />
            OmniFlow Social
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and schedule your social media content across all platforms
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{connectedAccounts.length}</div>
            <p className="text-sm text-muted-foreground">Connected Accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{totalFollowers.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Followers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{publishedPosts.length}</div>
            <p className="text-sm text-muted-foreground">Published Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{totalEngagement}</div>
            <p className="text-sm text-muted-foreground">Total Engagement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">
              {posts.filter((p) => p.status === "scheduled").length}
            </div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Platforms */}
                      <div className="flex flex-col gap-2">
                        {post.platforms.map((platform) => {
                          const account = accounts.find((a) => a.key === platform);
                          if (!account) return null;
                          return (
                            <div
                              key={platform}
                              className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center`}
                            >
                              <account.icon className={`w-4 h-4 ${account.color}`} />
                            </div>
                          );
                        })}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          {getStatusBadge(post.status)}
                          {post.scheduledAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.scheduledAt).toLocaleString()}
                            </span>
                          )}
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {new Date(post.publishedAt).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Engagement */}
                        {post.status === "published" && (
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Heart className="w-4 h-4" /> {post.engagement.likes}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MessageCircle className="w-4 h-4" /> {post.engagement.comments}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Share2 className="w-4 h-4" /> {post.engagement.shares}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {post.status === "draft" && (
                          <Button size="sm" onClick={() => handlePublishNow(post.id)}>
                            <Send className="w-4 h-4 mr-1" /> Publish
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <AdminSocialProfilesManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <BarChart3 className="w-16 h-16 mr-4" />
                <div>
                  <p className="text-lg font-medium">Analytics Coming Soon</p>
                  <p className="text-sm">Track your social media performance across all platforms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Post Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Compose and schedule your social media content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's on your mind?"
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground text-right">
                {newPost.content.length}/280 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {accounts
                  .filter((a) => a.connected)
                  .map((account) => (
                    <Button
                      key={account.key}
                      type="button"
                      variant={newPost.platforms.includes(account.key) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTogglePlatform(account.key)}
                      className="gap-2"
                    >
                      <account.icon className="w-4 h-4" />
                      {account.platform}
                    </Button>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newPost.schedulePost}
                  onCheckedChange={(checked) =>
                    setNewPost({ ...newPost, schedulePost: checked })
                  }
                />
                <Label>Schedule for later</Label>
              </div>
            </div>

            {newPost.schedulePost && (
              <div className="space-y-2">
                <Label>Schedule Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newPost.scheduledAt}
                  onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost}>
                {newPost.schedulePost ? "Schedule Post" : "Save as Draft"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSocialHub;
