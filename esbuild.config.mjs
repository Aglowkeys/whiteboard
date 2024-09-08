import * as esbuild from 'esbuild';

await esbuild
  .build({
    entryPoints: ['./pre-build/index.js'],
    outdir: './build',
    bundle: true,
    minify: true,
    allowOverwrite: true,
  })
  .catch(() => process.exit(1));
