import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    rules: {
      // ShipAny's current codebase predates some stricter React Compiler lint
      // checks enabled by Next 16's flat config. Keep these visible during the
      // migration baseline without blocking unrelated product work.
      '@next/next/no-assign-module-variable': 'warn',
      'react/display-name': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      '.open-next/**',
      'node_modules/**',
      'public/_headers',
      'src/shared/types/cloudflare.d.ts',
    ],
  },
];

export default eslintConfig;
