import { Box, Field, TextInput, Typography } from '@strapi/design-system';
import { useMemo, useState } from 'react';
import type { CustomFieldInputProps } from './types';

type Provider = 'youtube' | 'loom' | 'slides' | 'eraser' | 'unknown';

type EmbedValue = {
  embedUrl: string;
  provider: Provider;
  url: string;
};

const EMPTY_EMBED: EmbedValue = {
  url: '',
  provider: 'unknown',
  embedUrl: '',
};

const parseValue = (value: unknown): EmbedValue => {
  if (typeof value === 'object' && value !== null) {
    const current = value as Partial<EmbedValue>;
    return {
      url: typeof current.url === 'string' ? current.url : '',
      provider: (current.provider as Provider) || 'unknown',
      embedUrl: typeof current.embedUrl === 'string' ? current.embedUrl : '',
    };
  }

  return EMPTY_EMBED;
};

const detectEmbed = (raw: string): EmbedValue => {
  if (!raw.trim()) {
    return EMPTY_EMBED;
  }

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return {
      url: raw,
      provider: 'unknown',
      embedUrl: '',
    };
  }

  const hostname = url.hostname.replace(/^www\./, '');

  if (hostname === 'youtube.com' || hostname === 'youtu.be') {
    const id =
      hostname === 'youtu.be'
        ? url.pathname.split('/').filter(Boolean)[0]
        : url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);

    return {
      url: raw,
      provider: 'youtube',
      embedUrl: id ? `https://www.youtube.com/embed/${id}` : '',
    };
  }

  if (hostname === 'loom.com') {
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments.at(-1);
    return {
      url: raw,
      provider: 'loom',
      embedUrl: id ? `https://www.loom.com/embed/${id}` : '',
    };
  }

  if (hostname === 'docs.google.com' && url.pathname.includes('/presentation/')) {
    const id = url.pathname.split('/').filter(Boolean)[2];
    return {
      url: raw,
      provider: 'slides',
      embedUrl: id ? `https://docs.google.com/presentation/d/${id}/embed` : '',
    };
  }

  if (hostname === 'eraser.io') {
    const next = new URL(url.toString());
    next.searchParams.set('embed', 'true');

    return {
      url: raw,
      provider: 'eraser',
      embedUrl: next.toString(),
    };
  }

  return {
    url: raw,
    provider: 'unknown',
    embedUrl: '',
  };
};

export const EmbedPickerField = ({
  attribute,
  disabled,
  error,
  hint,
  label,
  name,
  onChange,
  required,
  value,
}: CustomFieldInputProps<EmbedValue>) => {
  const parsedValue = useMemo(() => parseValue(value), [value]);
  const [draftUrl, setDraftUrl] = useState(parsedValue.url);

  const handleUrlChange = (nextUrl: string) => {
    setDraftUrl(nextUrl);
    const detected = detectEmbed(nextUrl);

    onChange({
      target: {
        name,
        type: attribute.type,
        value: detected,
      },
    });
  };

  const previewValue = detectEmbed(draftUrl);

  return (
    <Field.Root name={name} hint={hint} error={error} required={required}>
      <Field.Label>{label || 'Embed URL'}</Field.Label>
      <Box paddingTop={2}>
        <TextInput
          name={`${name}-url`}
          value={draftUrl}
          onChange={(event) => handleUrlChange(event.target.value)}
          disabled={disabled}
          placeholder="Paste YouTube, Loom, Slides, or Eraser URL"
        />
      </Box>

      <Box paddingTop={3}>
        <Typography variant="omega" textColor="neutral600">
          Provider: {previewValue.provider}
        </Typography>

        <Box hasRadius borderColor="neutral200" padding={2} background="neutral0" marginTop={2}>
          {previewValue.embedUrl ? (
            <iframe
              title={`${previewValue.provider}-preview`}
              src={previewValue.embedUrl}
              style={{ width: '100%', height: 320, border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Typography textColor="neutral500">
              A live preview will appear when a supported provider URL is detected.
            </Typography>
          )}
        </Box>
      </Box>

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default EmbedPickerField;
