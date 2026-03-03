import type { Schema, Struct } from '@strapi/strapi';

export interface ContentBlocksCallout extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_callouts';
  info: {
    description: 'Callout panel';
    displayName: 'callout';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    title: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<
      ['note', 'tip', 'warning', 'danger']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'note'>;
  };
}

export interface ContentBlocksChecklist extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_checklists';
  info: {
    description: 'Checklist items';
    displayName: 'checklist';
  };
  attributes: {
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.checklist-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface ContentBlocksCodeBlock extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_code_blocks';
  info: {
    description: 'Formatted source code block';
    displayName: 'codeBlock';
  };
  attributes: {
    filename: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    snippet: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::code-editor'>;
  };
}

export interface ContentBlocksEmbed extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_embeds';
  info: {
    description: 'External media embed';
    displayName: 'embed';
  };
  attributes: {
    heading: Schema.Attribute.String;
    resource: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::embed-picker'>;
  };
}

export interface ContentBlocksImageBlock extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_image_blocks';
  info: {
    description: 'Inline image block';
    displayName: 'imageBlock';
  };
  attributes: {
    alt: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface ContentBlocksMermaidDiagram extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_mermaid_diagrams';
  info: {
    description: 'Mermaid diagram block';
    displayName: 'mermaidDiagram';
  };
  attributes: {
    diagram: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::mermaid-editor'>;
    heading: Schema.Attribute.String;
  };
}

export interface ContentBlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_rich_texts';
  info: {
    description: 'Rich narrative text block';
    displayName: 'richText';
  };
  attributes: {
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
    heading: Schema.Attribute.String;
  };
}

export interface ContentBlocksSteps extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_steps';
  info: {
    description: 'Step-by-step instructions';
    displayName: 'steps';
  };
  attributes: {
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.step-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface ContentBlocksTabs extends Struct.ComponentSchema {
  collectionName: 'components_content_blocks_tabs';
  info: {
    description: 'Tabbed content';
    displayName: 'tabs';
  };
  attributes: {
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.tab-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface SharedChecklistItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_checklist_items';
  info: {
    displayName: 'checklistItem';
  };
  attributes: {
    checked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
  };
}

export interface SharedStepItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_step_items';
  info: {
    displayName: 'stepItem';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    completed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTabItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_tab_items';
  info: {
    displayName: 'tabItem';
  };
  attributes: {
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'content-blocks.callout': ContentBlocksCallout;
      'content-blocks.checklist': ContentBlocksChecklist;
      'content-blocks.code-block': ContentBlocksCodeBlock;
      'content-blocks.embed': ContentBlocksEmbed;
      'content-blocks.image-block': ContentBlocksImageBlock;
      'content-blocks.mermaid-diagram': ContentBlocksMermaidDiagram;
      'content-blocks.rich-text': ContentBlocksRichText;
      'content-blocks.steps': ContentBlocksSteps;
      'content-blocks.tabs': ContentBlocksTabs;
      'shared.checklist-item': SharedChecklistItem;
      'shared.step-item': SharedStepItem;
      'shared.tab-item': SharedTabItem;
    }
  }
}
