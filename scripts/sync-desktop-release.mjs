import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const root = process.cwd();

dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });

const tauriConfigPath = path.join(root, "src-tauri", "tauri.conf.json");
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));

const productName = tauriConfig.productName || "Abhishek Admin";
const version = tauriConfig.version || "0.1.0";
const downloadUrl =
  process.env.VITE_ADMIN_DESKTOP_DOWNLOAD_URL?.trim() ||
  "https://www.abhishekpanda.com/downloads/Abhishek-Admin.dmg";
const updateManifestUrl =
  process.env.VITE_ADMIN_DESKTOP_UPDATE_MANIFEST_URL?.trim() ||
  "https://www.abhishekpanda.com/downloads/latest.json";

const generatedDir = path.join(root, "src", "generated");
fs.mkdirSync(generatedDir, { recursive: true });

const generatedTs = `export const DESKTOP_APP_NAME = ${JSON.stringify(productName)};
export const DESKTOP_APP_VERSION = ${JSON.stringify(version)};
export const DESKTOP_APP_DOWNLOAD_URL = ${JSON.stringify(downloadUrl)};
export const DESKTOP_APP_UPDATE_MANIFEST_URL = ${JSON.stringify(updateManifestUrl)};
`;

fs.writeFileSync(path.join(generatedDir, "desktopRelease.ts"), generatedTs);

const publicDownloadsDir = path.join(root, "public", "downloads");
fs.mkdirSync(publicDownloadsDir, { recursive: true });

const releaseManifest = {
  productName,
  version,
  publishedAt: new Date().toISOString(),
  notes: `Desktop release ${version}`,
  downloadUrl,
  platform: "macos-apple-silicon",
};

fs.writeFileSync(
  path.join(publicDownloadsDir, "latest.json"),
  `${JSON.stringify(releaseManifest, null, 2)}\n`,
);

console.log(`Synced desktop release metadata for ${productName} ${version}`);
