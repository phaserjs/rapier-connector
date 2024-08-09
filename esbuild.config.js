const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  outdir: 'package/',
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  target: ['esnext'],
  format: 'esm', // Esto es importante para Skypack
}).catch(() => process.exit(1));
