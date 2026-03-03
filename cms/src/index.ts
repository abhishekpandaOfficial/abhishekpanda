import type { Core, Modules } from '@strapi/strapi';
import { enforceBlogLintRules } from './utils/lint-publish-rules';
import { triggerBuildHook } from './utils/trigger-build-hook';

const REBUILD_UIDS = new Set([
  'api::blog-post.blog-post',
  'api::course.course',
  'api::interview-pack.interview-pack',
]);

const shouldTriggerRebuild = (ctx: Modules.Documents.Middleware.Context) => {
  if (!REBUILD_UIDS.has(ctx.uid)) {
    return false;
  }

  return ctx.action === 'publish' || ctx.action === 'update';
};

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register([
      {
        name: 'mermaid-editor',
        type: 'text',
        inputSize: {
          default: 12,
          isResizable: true,
        },
      },
      {
        name: 'code-editor',
        type: 'json',
        inputSize: {
          default: 12,
          isResizable: true,
        },
      },
      {
        name: 'embed-picker',
        type: 'json',
        inputSize: {
          default: 12,
          isResizable: true,
        },
      },
    ]);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (ctx, next) => {
      await enforceBlogLintRules(strapi, ctx);

      const result = await next();

      if (shouldTriggerRebuild(ctx)) {
        const documentId = (ctx.params as { documentId?: string }).documentId;
        void triggerBuildHook({
          strapi,
          uid: ctx.uid,
          action: ctx.action,
          source: 'documents-middleware',
          documentId,
        });
      }

      return result;
    });
  },
};
