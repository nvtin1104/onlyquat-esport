'use client';

import { useTheme } from 'next-themes';

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    grid:    isDark ? '#2A2A2B' : '#E5E5E5',
    axis:    isDark ? '#555555' : '#A0A0A0',
    tooltip: {
      bg:     isDark ? '#1A1A1B' : '#FFFFFF',
      border: isDark ? '#2A2A2B' : '#E5E5E5',
      text:   isDark ? '#E8E8E8' : '#1A1A1A',
    },
    accent:   isDark ? '#CCFF00' : '#7AB800',
    lava:     isDark ? '#FF4D00' : '#E04400',
    areaFill: isDark ? 'rgba(204,255,0,0.08)' : 'rgba(122,184,0,0.06)',
    tierColors: isDark
      ? { S: '#CCFF00', A: '#00FF88', B: '#00AAFF', C: '#FFB800', D: '#FF4D00', F: '#FF4444' }
      : { S: '#6B9E00', A: '#00B35F', B: '#0088CC', C: '#CC9200', D: '#CC3D00', F: '#CC3333' },
  };
}
