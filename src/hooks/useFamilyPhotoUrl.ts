import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignedUrlCache {
  url: string;
  expiresAt: number;
}

const urlCache = new Map<string, SignedUrlCache>();
const CACHE_DURATION_MS = 55 * 60 * 1000; // 55 minutes (URLs expire in 1 hour)

export const useFamilyPhotoUrl = (photoPath: string | null) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignedUrl = useCallback(async () => {
    if (!photoPath) {
      setSignedUrl(null);
      return;
    }

    // Check cache first
    const cached = urlCache.get(photoPath);
    if (cached && cached.expiresAt > Date.now()) {
      setSignedUrl(cached.url);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const { data, error: invokeError } = await supabase.functions.invoke("family-photo-url", {
        body: { filePath: photoPath },
      });

      if (invokeError) throw invokeError;

      if (data?.signedUrl) {
        // Cache the URL
        urlCache.set(photoPath, {
          url: data.signedUrl,
          expiresAt: Date.now() + CACHE_DURATION_MS,
        });
        setSignedUrl(data.signedUrl);
      }
    } catch (err: any) {
      console.error("Error fetching signed URL:", err);
      setError(err.message || "Failed to load photo");
      setSignedUrl(null);
    } finally {
      setLoading(false);
    }
  }, [photoPath]);

  useEffect(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl]);

  return { signedUrl, loading, error, refetch: fetchSignedUrl };
};

// Hook to batch fetch multiple photo URLs
export const useFamilyPhotoUrls = (photoPaths: (string | null)[]) => {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchAllUrls = useCallback(async () => {
    const pathsToFetch = photoPaths.filter((p): p is string => 
      p !== null && !urlCache.has(p)
    );

    if (pathsToFetch.length === 0) {
      // Return cached URLs
      const cached: Record<string, string> = {};
      photoPaths.forEach(path => {
        if (path) {
          const cachedItem = urlCache.get(path);
          if (cachedItem && cachedItem.expiresAt > Date.now()) {
            cached[path] = cachedItem.url;
          }
        }
      });
      setSignedUrls(cached);
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error("Not authenticated for photo fetch");
        setLoading(false);
        return;
      }

      // Fetch URLs in parallel
      const results = await Promise.allSettled(
        pathsToFetch.map(async (path) => {
          const { data, error } = await supabase.functions.invoke("family-photo-url", {
            body: { filePath: path },
          });
          if (error) throw error;
          return { path, url: data?.signedUrl };
        })
      );

      const urls: Record<string, string> = {};
      
      // Add cached URLs
      photoPaths.forEach(path => {
        if (path) {
          const cachedItem = urlCache.get(path);
          if (cachedItem && cachedItem.expiresAt > Date.now()) {
            urls[path] = cachedItem.url;
          }
        }
      });

      // Add newly fetched URLs
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.url) {
          const { path, url } = result.value;
          urlCache.set(path, {
            url,
            expiresAt: Date.now() + CACHE_DURATION_MS,
          });
          urls[path] = url;
        }
      });

      setSignedUrls(urls);
    } catch (err) {
      console.error("Error fetching photo URLs:", err);
    } finally {
      setLoading(false);
    }
  }, [photoPaths.join(",")]);

  useEffect(() => {
    fetchAllUrls();
  }, [fetchAllUrls]);

  return { signedUrls, loading, refetch: fetchAllUrls };
};

export default useFamilyPhotoUrl;
