import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  register(app: StrapiApp) {
    app.customFields.register([
      {
        name: 'mermaid-editor',
        type: 'text',
        intlLabel: {
          id: 'custom-fields.mermaid-editor.label',
          defaultMessage: 'Mermaid Editor',
        },
        intlDescription: {
          id: 'custom-fields.mermaid-editor.description',
          defaultMessage: 'Monaco editor with live Mermaid preview.',
        },
        components: {
          Input: async () => import('./components/MermaidEditorField'),
        },
      },
      {
        name: 'code-editor',
        type: 'json',
        intlLabel: {
          id: 'custom-fields.code-editor.label',
          defaultMessage: 'Code Editor',
        },
        intlDescription: {
          id: 'custom-fields.code-editor.description',
          defaultMessage: 'Monaco editor with language picker and Shiki preview.',
        },
        components: {
          Input: async () => import('./components/CodeEditorField'),
        },
      },
      {
        name: 'embed-picker',
        type: 'json',
        intlLabel: {
          id: 'custom-fields.embed-picker.label',
          defaultMessage: 'Embed Picker',
        },
        intlDescription: {
          id: 'custom-fields.embed-picker.description',
          defaultMessage: 'Detect provider and preview embeds before saving.',
        },
        components: {
          Input: async () => import('./components/EmbedPickerField'),
        },
      },
    ]);
  },
};
