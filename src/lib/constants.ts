// Skopyr Design Tokens
// =====================
// Dark hero → Light editorial content
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

  // Text — dark sections
  text1: '#FAFAF9',
  text2: 'rgba(255,255,255,0.55)',
  text3: 'rgba(255,255,255,0.3)',

  // Text — light sections
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
  { id: 'generator', name: 'Generator', icon: '⚡', tag: 'Most requested' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', tag: null },
  { id: 'cleaning', name: 'Cleaning', icon: '✨', tag: 'Popular' },
  { id: 'auto', name: 'Auto Mechanic', icon: '🚗', tag: null },
  { id: 'ac', name: 'AC Repair', icon: '❄️', tag: null },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚', tag: null },
  { id: 'catering', name: 'Catering', icon: '🍽️', tag: null },
  { id: 'tech', name: 'Tech Support', icon: '💻', tag: null },
  { id: 'electrical', name: 'Electrical', icon: '💡', tag: 'Popular' },
  { id: 'painting', name: 'Painting', icon: '🎨', tag: null },
  { id: 'moving', name: 'Moving & Hauling', icon: '📦', tag: null },
  { id: 'laundry', name: 'Laundry', icon: '👔', tag: null },
  { id: 'gardening', name: 'Gardening', icon: '🌿', tag: null },
  { id: 'security', name: 'Security', icon: '🔐', tag: null },
  { id: 'photography', name: 'Photography', icon: '📸', tag: null },
  { id: 'tailoring', name: 'Tailoring', icon: '🧵', tag: null },
  { id: 'welding', name: 'Welding & Metal', icon: '🔩', tag: null },
  { id: 'tiling', name: 'Tiling & Flooring', icon: '🧱', tag: null },
  { id: 'pest', name: 'Pest Control', icon: '🐛', tag: null },
  { id: 'salon', name: 'Hair & Beauty', icon: '💇', tag: null },
  { id: 'tutoring', name: 'Tutoring', icon: '📚', tag: null },
  { id: 'delivery', name: 'Delivery & Errand', icon: '🏃', tag: null },
  { id: 'solar', name: 'Solar & Inverter', icon: '☀️', tag: 'Trending' },
  { id: 'cctv', name: 'CCTV & Alarms', icon: '📹', tag: null },
] as const;

export type Category = typeof categories[number];
