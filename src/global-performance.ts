export async function globalPerformance() {
  return 'undefined' !== typeof(window) ?
    window.performance : (await import('perf_hooks')).performance;
}
