// Shared map of fashion color names → hex values.
// Used by ProductCard swatches and the product detail page color selector.
export const COLOR_MAP: Record<string, string> = {
  'Black':      '#1a1a1a',
  'White':      '#f5f5f5',
  'Blue':       '#4a7ab5',
  'Navy':       '#1b2a4a',
  'Grey':       '#9e9e9e',
  'Gray':       '#9e9e9e',
  'Charcoal':   '#3d3d3d',
  'Beige':      '#d4b896',
  'Camel':      '#c19a6b',
  'Cream':      '#f0e8d8',
  'Ivory':      '#f2ead8',
  'Sage':       '#87a96b',
  'Sand':       '#c2b280',
  'Blush':      '#e8a0a8',
  'Dusty Blue': '#6a89a7',
  'Dusty Rose': '#c07e7e',
  'Natural':    '#d4c5a9',
};

export function swatchColor(name: string): string {
  return COLOR_MAP[name] ?? '#cccccc';
}

// Colors light enough to need a visible border so the swatch isn't invisible on white.
export function isLightSwatch(name: string): boolean {
  return ['White', 'Cream', 'Ivory', 'Natural', 'Beige'].includes(name);
}
