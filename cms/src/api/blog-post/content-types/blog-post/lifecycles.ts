import { triggerBuildHook } from '../../../../utils/trigger-build-hook';

const UID = 'api::blog-post.blog-post';

export default {
  async afterCreate(event: any) {
    await triggerBuildHook({
      strapi,
      uid: UID,
      action: 'create',
      source: 'lifecycle',
      documentId: event?.result?.documentId,
    });
  },

  async afterUpdate(event: any) {
    await triggerBuildHook({
      strapi,
      uid: UID,
      action: 'update',
      source: 'lifecycle',
      documentId: event?.result?.documentId,
    });
  },
};
