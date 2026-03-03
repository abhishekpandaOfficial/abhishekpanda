import { Box, Field, SingleSelect, SingleSelectOption, Typography } from '@strapi/design-system';
import Editor from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';
import type { CustomFieldInputProps } from './types';

type CodeValue = {
  code: string;
  language: string;
};

const LANGUAGE_OPTIONS = [
  'typescript',
  'javascript',
  'tsx',
  'json',
  'bash',
  'python',
  'sql',
  'yaml',
  'markdown',
  'html',
  'css',
  'text',
];

const parseValue = (value: unknown): CodeValue => {
  if (typeof value === 'object' && value !== null) {
    const current = value as Partial<CodeValue>;
    return {
      code: typeof current.code === 'string' ? current.code : '',
      language: typeof current.language === 'string' ? current.language : 'typescript',
    };
  }

  return {
    code: '',
    language: 'typescript',
  };
};

const escapeHtml = (input: string) =>
  input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const CodeEditorField = ({
  attribute,
  disabled,
  error,
  hint,
  label,
  name,
  onChange,
  required,
  value,
}: CustomFieldInputProps<CodeValue>) => {
  const parsed = useMemo(() => parseValue(value), [value]);
  const [codeValue, setCodeValue] = useState<CodeValue>(parsed);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    setCodeValue(parseValue(value));
  }, [value]);

  useEffect(() => {
    let alive = true;

    const buildPreview = async () => {
      if (!codeValue.code.trim()) {
        setPreviewHtml('');
        setPreviewError('');
        return;
      }

      try {
        const shiki = await import('shiki');
        const html = await shiki.codeToHtml(codeValue.code, {
          lang: codeValue.language,
          theme: 'github-dark-default',
        });

        if (!alive) {
          return;
        }

        setPreviewHtml(html);
        setPreviewError('');
      } catch (err) {
        if (!alive) {
          return;
        }

        setPreviewError(err instanceof Error ? err.message : 'Unable to render Shiki preview');
        setPreviewHtml(`<pre><code>${escapeHtml(codeValue.code)}</code></pre>`);
      }
    };

    void buildPreview();

    return () => {
      alive = false;
    };
  }, [codeValue.code, codeValue.language]);

  const emitChange = (nextValue: CodeValue) => {
    setCodeValue(nextValue);
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
      <Field.Label>{label || 'Code Block'}</Field.Label>
      <Box paddingTop={2}>
        <SingleSelect
          aria-label="Select language"
          value={codeValue.language}
          onChange={(language) =>
            emitChange({
              ...codeValue,
              language: String(language),
            })
          }
          disabled={disabled}
        >
          {LANGUAGE_OPTIONS.map((language) => (
            <SingleSelectOption key={language} value={language}>
              {language}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      </Box>
      <Box paddingTop={2}>
        <Editor
          height="260px"
          language={codeValue.language || 'text'}
          value={codeValue.code}
          onChange={(next) =>
            emitChange({
              ...codeValue,
              code: next ?? '',
            })
          }
          options={{
            readOnly: disabled,
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </Box>
      <Box paddingTop={3}>
        <Typography variant="omega" textColor="neutral600">
          Shiki Preview
        </Typography>
        <Box
          hasRadius
          borderColor={previewError ? 'danger500' : 'neutral200'}
          padding={4}
          background="neutral0"
          marginTop={2}
        >
          {previewError ? (
            <Typography textColor="danger600">{previewError}</Typography>
          ) : previewHtml ? (
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <Typography textColor="neutral500">Start typing code to preview highlighting.</Typography>
          )}
        </Box>
      </Box>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default CodeEditorField;
