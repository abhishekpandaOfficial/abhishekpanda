import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const uploadProvider = env('UPLOAD_PROVIDER', 'local');

  if (uploadProvider !== 'aws-s3') {
    return {};
  }

  return {
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          baseUrl: env('UPLOAD_BASE_URL'),
          rootPath: env('UPLOAD_ROOT_PATH', ''),
          s3Options: {
            credentials: {
              accessKeyId: env('AWS_ACCESS_KEY_ID'),
              secretAccessKey: env('AWS_ACCESS_SECRET'),
            },
            region: env('AWS_REGION', 'us-east-1'),
            endpoint: env('AWS_ENDPOINT'),
            forcePathStyle: env.bool('AWS_FORCE_PATH_STYLE', true),
            params: {
              Bucket: env('AWS_BUCKET'),
            },
          },
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};

export default config;
