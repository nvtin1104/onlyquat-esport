/**
 * useChartTheme — returns CSS variable references for Recharts components.
 * CSS vars work in SVG attributes (fill, stroke) in all modern browsers.
 */
export function useChartTheme() {
  return {
    /** Primary line/area stroke — acid green */
    stroke: 'var(--color-accent-acid)',
    /** Primary area fill — acid green */
    fill: 'var(--color-accent-acid)',
    /** Positive bar fill */
    positiveBar: 'var(--color-accent-acid)',
    /** Negative bar fill */
    negativeBar: 'var(--color-danger)',
    /** CartesianGrid stroke */
    gridStroke: 'var(--color-border-subtle)',
    /** Tooltip background */
    tooltipBg: 'var(--color-bg-card)',
    /** Tooltip border */
    tooltipBorder: 'var(--color-border-subtle)',
    /** Shared tick style for XAxis / YAxis */
    tickStyle: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      fill: 'var(--color-text-dim)',
    } as const,
  };
}
