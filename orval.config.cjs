const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  tickit: {
    input: {
      target: `${process.env.VITE_API_URL}/api/docs-json`,
    },
    output: {
      mode: 'tags-split',
      target: 'src/features/auth/infrastructure/api/tickit.ts',
      schemas: 'src/features/auth/infrastructure/api/model',
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
