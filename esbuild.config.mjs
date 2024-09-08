import * as esbuild from 'esbuild';
const TIMER_LABEL = '✨ Build successful';

try {
  console.time(TIMER_LABEL);
  const context = await esbuild.context({
    entryPoints: ['./scripts/index.ts'],
    outdir: './build',
    bundle: true,
    minify: true,
  });
  console.timeEnd(TIMER_LABEL);
  const isWatching = process.argv.includes('--watch');
  context.watch();

  if (isWatching) {
    console.log('Watching for changes...');
  } else {
    context.dispose();
  }
} catch (e) {
  console.timeEnd(TIMER_LABEL);
  process.exit(1);
}
