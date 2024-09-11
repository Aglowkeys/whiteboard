import * as esbuild from 'esbuild';

try {
  const context = await esbuild.context({
    entryPoints: ['./scripts/index.ts'],
    outdir: './build',
    bundle: true,
    minify: true,
    logLevel: 'info',
  });
  const isWatching = process.argv.includes('--watch');
  context.watch();

  if (!isWatching) context.dispose();
} catch (e) {
  process.exit(1);
}
