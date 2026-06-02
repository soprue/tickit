import dotenv from 'dotenv';

dotenv.config();

export default {
  tickit: {
    input: {
      target: `${process.env.VITE_API_URL}/api/docs-json`,
    },
    output: {
      mode: 'tags-split',
      target: 'src/shared/infrastructure/api/tickit.ts',
      schemas: 'src/shared/infrastructure/api/model',
      client: 'react-query',
      override: {
        mutator: {
          path: 'src/shared/infrastructure/apiClient.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
