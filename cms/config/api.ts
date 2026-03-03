import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Api => ({
  rest: {
    prefix: env('REST_PREFIX', '/cms-api'),
    defaultLimit: 25,
    maxLimit: 200,
    withCount: true,
  },
});

export default config;
