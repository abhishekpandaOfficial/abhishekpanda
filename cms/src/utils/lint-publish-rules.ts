import type { Core, Modules } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const BLOG_POST_UID = 'api::blog-post.blog-post';

const hasComponent = (blocks: unknown[], componentUid: string) =>
  blocks.some(
    (block) =>
      typeof block === 'object' &&
      block !== null &&
      '__component' in block &&
      (block as { __component?: string }).__component === componentUid,
  );

export const enforceBlogLintRules = async (
  strapi: Core.Strapi,
  ctx: Modules.Documents.Middleware.Context,
) => {
  if (ctx.uid !== BLOG_POST_UID || ctx.action !== 'publish') {
    return;
  }

  const documentId = (ctx.params as { documentId?: string }).documentId;
  const locale = (ctx.params as { locale?: string }).locale;

  if (!documentId) {
    return;
  }

  const draft = await strapi.documents(BLOG_POST_UID).findOne({
    documentId,
    status: 'draft',
    locale,
    fields: ['title', 'level'],
    populate: {
      contentBlocks: {
        populate: '*',
      },
    },
  });

  if (!draft) {
    return;
  }

  const level = (draft as { level?: string }).level;
  if (level !== 'lead' && level !== 'architect') {
    return;
  }

  const blocks = ((draft as { contentBlocks?: unknown[] }).contentBlocks ?? []) as unknown[];
  const missingRules: string[] = [];

  if (!hasComponent(blocks, 'content-blocks.mermaid-diagram')) {
    missingRules.push('at least one mermaidDiagram block');
  }

  if (!hasComponent(blocks, 'content-blocks.checklist')) {
    missingRules.push('at least one checklist block');
  }

  if (missingRules.length > 0) {
    throw new errors.ValidationError(
      `Lint rule failed for \"${(draft as { title?: string }).title || 'Untitled post'}\": ` +
        `level \"${level}\" requires ${missingRules.join(' and ')} before publishing.`,
    );
  }
};
