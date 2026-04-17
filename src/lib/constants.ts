// Skopyr Design Tokens
// =====================
// Dark hero to light editorial content
// Fonts: DM Serif Display (editorial headlines) + Space Grotesk (bold UI) + DM Sans (body)

export const colors = {
  // Dark sections
  bg: '#0C0C0E',
  card: 'rgba(255,255,255,0.028)',
  cardHover: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',

  // Light sections
  bgLight: '#F8F6F3',
  bgCream: '#EFECE7',
  cardLight: '#FFFFFF',
  borderLight: 'rgba(0,0,0,0.08)',
  borderLightHover: 'rgba(0,0,0,0.15)',

  // Accent
  accent: '#FF6B2B',
  accentDim: 'rgba(255,107,43,0.08)',
  accentBorder: 'rgba(255,107,43,0.18)',
  accentHover: '#FF8347',

  // Status
  success: '#22C55E',
  successDim: 'rgba(34,197,94,0.1)',
  successBorder: 'rgba(34,197,94,0.25)',
  warning: '#F59E0B',
  error: '#EF4444',

  // Text - dark sections
  text1: '#FAFAF9',
  text2: 'rgba(255,255,255,0.55)',
  text3: 'rgba(255,255,255,0.3)',

  // Text - light sections
  textDark: '#1A1A1A',
  textMuted: '#6B6B6B',
  textLight: '#9A9A9A',
} as const;

export const fonts = {
  serif: "'DM Serif Display', serif",
  display: "'Space Grotesk', sans-serif",
  body: "'DM Sans', sans-serif",
} as const;

export const categories = [
  { id: 'generator', name: 'Generator', icon: '\u26A1', tag: 'Most requested' },
  { id: 'plumbing', name: 'Plumbing', icon: '\uD83D\uDD27', tag: null },
  { id: 'cleaning', name: 'Cleaning', icon: '\u2728', tag: 'Popular' },
  { id: 'auto', name: 'Auto Mechanic', icon: '\uD83D\uDE97', tag: null },
  { id: 'ac', name: 'AC Repair', icon: '\u2744\uFE0F', tag: null },
  { id: 'carpentry', name: 'Carpentry', icon: '\uD83E\uDE9A', tag: null },
  { id: 'catering', name: 'Catering', icon: '\uD83C\uDF7D\uFE0F', tag: null },
  { id: 'tech', name: 'Tech Support', icon: '\uD83D\uDCBB', tag: null },
  { id: 'electrical', name: 'Electrical', icon: '\uD83D\uDCA1', tag: 'Popular' },
  { id: 'painting', name: 'Painting', icon: '\uD83C\uDFA8', tag: null },
  { id: 'moving', name: 'Moving & Hauling', icon: '\uD83D\uDCE6', tag: null },
  { id: 'laundry', name: 'Laundry', icon: '\uD83D\uDC54', tag: null },
  { id: 'gardening', name: 'Gardening', icon: '\uD83C\uDF3F', tag: null },
  { id: 'security', name: 'Security', icon: '\uD83D\uDD10', tag: null },
  { id: 'photography', name: 'Photography', icon: '\uD83D\uDCF8', tag: null },
  { id: 'tailoring', name: 'Tailoring', icon: '\uD83E\uDDF5', tag: null },
  { id: 'welding', name: 'Welding & Metal', icon: '\uD83D\uDD29', tag: null },
  { id: 'tiling', name: 'Tiling & Flooring', icon: '\uD83E\uDDF1', tag: null },
  { id: 'pest', name: 'Pest Control', icon: '\uD83D\uDC1B', tag: null },
  { id: 'salon', name: 'Hair & Beauty', icon: '\uD83D\uDC87', tag: null },
  { id: 'tutoring', name: 'Tutoring', icon: '\uD83D\uDCDA', tag: null },
  { id: 'delivery', name: 'Delivery & Errand', icon: '\uD83C\uDFC3', tag: null },
  { id: 'solar', name: 'Solar & Inverter', icon: '\u2600\uFE0F', tag: 'Trending' },
  { id: 'cctv', name: 'CCTV & Alarms', icon: '\uD83D\uDCF9', tag: null },
] as const;

export type Category = typeof categories[number];
export type CustomCategory = {
  id: string;
  name: string;
  icon: string;
  tag: null;
};
export type SelectedCategory = Category | CustomCategory;