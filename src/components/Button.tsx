import { ButtonHTMLAttributes, ReactNode } from 'react';
import { colors } from '@/lib/constants';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
  children: ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', full, children, style, ...props }: Props) {
  const isDisabled = Boolean(props.disabled);
  const variants = {
    primary: { background: colors.accent, color: '#fff', border: 'none', boxShadow: '0 2px 16px rgba(255,107,43,0.25)' },
    ghost: { background: 'rgba(255,255,255,0.05)', color: colors.text1, border: `1px solid ${colors.border}` },
    outline: { background: 'transparent', color: colors.accent, border: `1.5px solid ${colors.accentBorder}` },
  };

  const sizes = {
    sm: { padding: '10px 18px', fontSize: 13 },
    md: { padding: '14px 28px', fontSize: 15 },
    lg: { padding: '18px 36px', fontSize: 16 },
  };

  return (
    <button
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: 10, fontWeight: 700, cursor: isDisabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.3px', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        width: full ? '100%' : 'auto',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: isDisabled ? 0.6 : 1,
        ...style,
      }}
      onMouseEnter={e => {
        if (isDisabled) return;
        e.currentTarget.style.transform = 'translateY(-1px)';
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,107,43,0.4)';
      }}
      onMouseLeave={e => {
        if (isDisabled) return;
        e.currentTarget.style.transform = 'translateY(0)';
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 2px 16px rgba(255,107,43,0.25)';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
