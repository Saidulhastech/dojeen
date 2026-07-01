// Shared color-name → CSS color resolver.
// Used by ProductCard swatches and the PDP color selector.
//
// Priority:
//   1. COLOR_MAP (curated fashion names + CSS named colors)
//   2. Lowercase exact CSS named-color check (covers any standard color)
//   3. Deterministic HSL hash so unknown names always get a unique, consistent color

// ---------- curated map (fashion + CSS overlap) ----------
export const COLOR_MAP: Record<string, string> = {
  // Neutrals
  Black:          '#1a1a1a',
  White:          '#f5f5f5',
  'Off White':    '#f5f0e8',
  'Off-White':    '#f5f0e8',
  Grey:           '#9e9e9e',
  Gray:           '#9e9e9e',
  'Light Grey':   '#d0d0d0',
  'Light Gray':   '#d0d0d0',
  'Dark Grey':    '#555555',
  'Dark Gray':    '#555555',
  Charcoal:       '#3d3d3d',
  Slate:          '#6b7280',
  Stone:          '#928e85',
  Ash:            '#b2beb5',
  Silver:         '#c0c0c0',

  // Browns & earth tones
  Brown:          '#795548',
  'Dark Brown':   '#3e2723',
  'Light Brown':  '#a1887f',
  Tan:            '#d2b48c',
  Beige:          '#d4b896',
  Camel:          '#c19a6b',
  Cream:          '#f0e8d8',
  Ivory:          '#f2ead8',
  Natural:        '#d4c5a9',
  Sand:           '#c2b280',
  Khaki:          '#c3b091',
  Taupe:          '#483c32',
  Chocolate:      '#3d1c02',
  Coffee:         '#6f4e37',
  Mocha:          '#967969',
  Latte:          '#c8a882',
  Rust:           '#b7410e',
  Terracotta:     '#e2725b',
  Sienna:         '#a0522d',
  Copper:         '#b87333',
  Bronze:         '#cd7f32',
  Gold:           '#d4a017',
  Cognac:         '#9a463d',
  Caramel:        '#c68642',
  Champagne:      '#f7e7ce',
  Ecru:           '#c2b280',
  Vanilla:        '#f3e5ab',
  Nude:           '#e8c5a0',
  Skin:           '#e8c5a0',

  // Blues
  Blue:           '#4a7ab5',
  'Light Blue':   '#add8e6',
  'Sky Blue':     '#87ceeb',
  'Baby Blue':    '#89cff0',
  'Royal Blue':   '#4169e1',
  Navy:           '#1b2a4a',
  'Navy Blue':    '#1b2a4a',
  'Dark Blue':    '#00008b',
  Cobalt:         '#0047ab',
  'Cobalt Blue':  '#0047ab',
  Denim:          '#1560bd',
  'Denim Blue':   '#1560bd',
  Chambray:       '#7da5c5',
  'Steel Blue':   '#4682b4',
  Teal:           '#008080',
  'Dusty Blue':   '#6a89a7',
  'Powder Blue':  '#b0e0e6',
  'Ice Blue':     '#99c5c4',
  Indigo:         '#4b0082',
  Ocean:          '#006994',
  Petrol:         '#005f6b',
  Midnight:       '#191970',
  'Midnight Blue':'#191970',
  Peacock:        '#005f69',
  Turquoise:      '#40e0d0',
  Aqua:           '#00bcd4',
  Cyan:           '#00bcd4',

  // Greens
  Green:          '#4caf50',
  'Light Green':  '#8bc34a',
  'Dark Green':   '#1b5e20',
  'Forest Green': '#228b22',
  Forest:         '#228b22',
  Olive:          '#808000',
  'Olive Green':  '#6b8e23',
  Sage:           '#87a96b',
  'Sage Green':   '#87a96b',
  Mint:           '#98ff98',
  'Mint Green':   '#98ff98',
  Emerald:        '#50c878',
  'Emerald Green':'#50c878',
  'Hunter Green': '#355e3b',
  'Bottle Green': '#006a4e',
  'Kelly Green':  '#4cbb17',
  Lime:           '#32cd32',
  'Lime Green':   '#32cd32',
  'Army Green':   '#4b5320',
  Camo:           '#78866b',
  Seafoam:        '#93e9be',
  Jade:           '#00a86b',
  Moss:           '#8a9a5b',
  Fern:           '#4f7942',
  Pistachio:      '#93c572',
  Chartreuse:     '#7fff00',

  // Reds
  Red:            '#d0473e',
  'Light Red':    '#ff6b6b',
  'Dark Red':     '#8b0000',
  Crimson:        '#dc143c',
  Scarlet:        '#ff2400',
  Burgundy:       '#800020',
  Wine:           '#722f37',
  Maroon:         '#800000',
  Oxblood:        '#4a0000',
  Cherry:         '#de3163',
  Raspberry:      '#e30b5c',
  'Red Orange':   '#ff4500',
  Tomato:         '#ff6347',

  // Pinks
  Pink:           '#e91e63',
  'Light Pink':   '#ffb6c1',
  'Hot Pink':     '#ff69b4',
  Blush:          '#e8a0a8',
  'Blush Pink':   '#de5d83',
  'Dusty Rose':   '#c07e7e',
  Rose:           '#ff007f',
  'Rose Gold':    '#b76e79',
  Salmon:         '#fa8072',
  Coral:          '#ff6b6b',
  Peach:          '#ffcba4',
  Fuchsia:        '#ff00ff',
  Magenta:        '#cc00cc',
  Mauve:          '#e0b0ff',
  Lilac:          '#c8a2c8',
  Bubblegum:      '#ff85ce',
  Flamingo:       '#fc8eac',
  Watermelon:     '#fc6c85',

  // Purples & violets
  Purple:         '#9c27b0',
  'Light Purple': '#ce93d8',
  'Dark Purple':  '#4a148c',
  Violet:         '#ee82ee',
  Lavender:       '#e6e6fa',
  Plum:           '#8e4585',
  Grape:          '#6f2da8',
  Orchid:         '#da70d6',
  Amethyst:       '#9b59b6',
  Heather:        '#9982a4',
  Mulberry:       '#c54b8c',
  Eggplant:       '#380835',
  Iris:           '#5a4fcf',
  Periwinkle:     '#ccccff',

  // Yellows & oranges
  Yellow:         '#ffc107',
  'Light Yellow': '#fff9c4',
  Mustard:        '#ffdb58',
  'Mustard Yellow':'#ffdb58',
  Goldenrod:      '#daa520',
  Honey:          '#ffa500',
  Amber:          '#ffbf00',
  Orange:         '#ff9800',
  'Light Orange': '#ffcc80',
  'Dark Orange':  '#e65100',
  'Burnt Orange': '#cc5500',
  Apricot:        '#fbceb1',
  Pumpkin:        '#ff7518',
  Tangerine:      '#f28500',
  Saffron:        '#f4c430',
  Lemon:          '#fff44f',
  Citrus:         '#e4d00a',
};

// Colors light enough to need a visible border on white backgrounds.
export const LIGHT_SWATCHES = new Set([
  'White', 'Off White', 'Off-White', 'Cream', 'Ivory', 'Natural', 'Beige',
  'Champagne', 'Vanilla', 'Ecru', 'Lemon', 'Light Yellow', 'Lavender',
  'Powder Blue', 'Light Pink', 'Peach', 'Apricot', 'Bubblegum',
]);

// ---------- deterministic hue from an arbitrary name ----------
function nameToHsl(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h},45%,42%)`;
}

export function swatchColor(name: string): string {
  if (!name) return '#cccccc';
  // 1. Curated map (exact case)
  if (COLOR_MAP[name]) return COLOR_MAP[name];
  // 2. Case-insensitive map lookup
  const lower = name.toLowerCase();
  const ci = Object.keys(COLOR_MAP).find((k) => k.toLowerCase() === lower);
  if (ci) return COLOR_MAP[ci];
  // 3. Deterministic HSL so the swatch is always a unique color, never just grey
  return nameToHsl(name);
}

export function isLightSwatch(name: string): boolean {
  return LIGHT_SWATCHES.has(name) || LIGHT_SWATCHES.has(
    Object.keys(COLOR_MAP).find((k) => k.toLowerCase() === name.toLowerCase()) ?? '',
  );
}
