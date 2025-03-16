import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: '../backend/openapi.json',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    '@hey-api/transformers',
    {
      name: '@hey-api/sdk', 
      transformer: true, 
    },
  ],
};