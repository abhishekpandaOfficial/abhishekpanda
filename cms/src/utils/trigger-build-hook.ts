import type { Core } from '@strapi/strapi';

type TriggerBuildHookInput = {
  strapi: Core.Strapi;
  uid: string;
  action: string;
  source?: string;
  documentId?: string;
};

export const triggerBuildHook = async ({
  strapi,
  uid,
  action,
  source = 'documents-middleware',
  documentId,
}: TriggerBuildHookInput) => {
  const hookUrl = process.env.BUILD_HOOK_URL?.trim();
  if (!hookUrl) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(hookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        action,
        source,
        documentId,
        triggeredAt: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `HTTP ${response.status}`);
    }

    strapi.log.info(`[build-hook] Triggered from ${source} for ${uid} (${action})`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    strapi.log.warn(`[build-hook] Failed for ${uid} (${action}): ${reason}`);
  } finally {
    clearTimeout(timeout);
  }
};
