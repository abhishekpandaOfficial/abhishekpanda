import { Box, Field, Typography } from '@strapi/design-system';
import Editor from '@monaco-editor/react';
import mermaid from 'mermaid';
import { useEffect, useMemo, useState } from 'react';
import type { CustomFieldInputProps } from './types';

const DEFAULT_SNIPPET = `flowchart TD
  Draft[Draft] --> Review[Review]
  Review --> Publish[Publish]
  Publish --> Learn[Learn]`;

const toStringValue = (value: unknown) => (typeof value === 'string' ? value : '');

export const MermaidEditorField = ({
  attribute,
  disabled,
  error,
  hint,
  label,
  name,
  onChange,
  required,
  value,
}: CustomFieldInputProps<string>) => {
  const initial = useMemo(() => toStringValue(value), [value]);
  const [diagram, setDiagram] = useState(initial);
  const [previewSvg, setPreviewSvg] = useState('');
  const [renderError, setRenderError] = useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'default',
    });
  }, []);

  useEffect(() => {
    setDiagram(toStringValue(value));
  }, [value]);

  useEffect(() => {
    const source = diagram.trim() || DEFAULT_SNIPPET;
    const id = `mermaid-preview-${Math.random().toString(36).slice(2, 10)}`;
    let isMounted = true;

    const render = async () => {
      try {
        const rendered = await mermaid.render(id, source);
        if (!isMounted) {
          return;
        }
        setPreviewSvg(rendered.svg);
        setRenderError('');
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setRenderError(err instanceof Error ? err.message : 'Invalid Mermaid syntax');
      }
    };

    void render();

    return () => {
      isMounted = false;
    };
  }, [diagram]);

  const handleChange = (nextValue: string) => {
    setDiagram(nextValue);
    onChange({
      target: {
        name,
        type: attribute.type,
        value: nextValue,
      },
    });
  };

  return (
    <Field.Root name={name} hint={hint} error={error} required={required}>
      <Field.Label>{label || 'Mermaid Diagram'}</Field.Label>
      <Box paddingTop={2}>
        <Editor
          height="260px"
          language="markdown"
          value={diagram}
          onChange={(next) => handleChange(next ?? '')}
          options={{
            readOnly: disabled,
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </Box>
      <Box paddingTop={3}>
        <Typography variant="omega" textColor="neutral600">
          Live Mermaid Preview
        </Typography>
        <Box
          hasRadius
          borderColor={renderError ? 'danger500' : 'neutral200'}
          padding={4}
          background="neutral0"
          marginTop={2}
        >
          {renderError ? (
            <Typography textColor="danger600">{renderError}</Typography>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: previewSvg }} />
          )}
        </Box>
      </Box>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default MermaidEditorField;
