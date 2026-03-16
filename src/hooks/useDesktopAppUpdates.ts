import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DESKTOP_APP_DOWNLOAD_URL,
  DESKTOP_APP_UPDATE_MANIFEST_URL,
  DESKTOP_APP_VERSION,
} from "@/generated/desktopRelease";
import { isDesktopAdminRuntime } from "@/lib/adminRuntime";

type DesktopReleaseManifest = {
  version?: string;
  publishedAt?: string;
  notes?: string;
  downloadUrl?: string;
};

const normalizeVersion = (value: string) =>
  value
    .trim()
    .replace(/^[^\d]*/, "")
    .split(".")
    .map((segment) => Number.parseInt(segment, 10) || 0);

const compareVersions = (left: string, right: string) => {
  const a = normalizeVersion(left);
  const b = normalizeVersion(right);
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (a[index] || 0) - (b[index] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

const openDownload = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const useDesktopAppUpdates = () => {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState(DESKTOP_APP_DOWNLOAD_URL);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const shownToastForVersion = useRef<string | null>(null);

  useEffect(() => {
    if (!isDesktopAdminRuntime()) return;

    let cancelled = false;

    const checkForUpdates = async (silent = false) => {
      if (!silent) setIsChecking(true);

      try {
        const response = await fetch(`${DESKTOP_APP_UPDATE_MANIFEST_URL}?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Update manifest returned ${response.status}`);
        }

        const manifest = (await response.json()) as DesktopReleaseManifest;
        if (cancelled) return;

        const nextVersion = manifest.version?.trim() || null;
        const nextDownloadUrl = manifest.downloadUrl?.trim() || DESKTOP_APP_DOWNLOAD_URL;

        setLatestVersion(nextVersion);
        setDownloadUrl(nextDownloadUrl);
        setPublishedAt(manifest.publishedAt?.trim() || null);
        setNotes(manifest.notes?.trim() || null);

        const updateAvailable =
          !!nextVersion && compareVersions(nextVersion, DESKTOP_APP_VERSION) > 0;

        setHasUpdate(updateAvailable);

        if (
          updateAvailable &&
          shownToastForVersion.current !== nextVersion
        ) {
          shownToastForVersion.current = nextVersion;
          toast.info(`Desktop update ${nextVersion} is ready`, {
            description: "Download the latest build, replace the app, and relaunch.",
            duration: 12000,
            action: {
              label: "Download",
              onClick: () => openDownload(nextDownloadUrl),
            },
          });
        }
      } catch (error) {
        if (!silent) {
          console.error("Failed to check desktop updates", error);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    void checkForUpdates();

    const intervalId = window.setInterval(() => {
      void checkForUpdates(true);
    }, 5 * 60 * 1000);

    const handleFocus = () => {
      void checkForUpdates(true);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return {
    currentVersion: DESKTOP_APP_VERSION,
    latestVersion,
    downloadUrl,
    publishedAt,
    notes,
    isChecking,
    hasUpdate,
    openDownload: () => openDownload(downloadUrl),
  };
};
