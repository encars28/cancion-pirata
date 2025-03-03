import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../backend/openapi.json',
  output: 'src/client',
  plugins: [
    '@hey-api/client-fetch',
    '@hey-api/transformers',
    {
      name: '@hey-api/sdk', 
      transformer: true, 
    },
  ],
});