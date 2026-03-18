import { type ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export const GlassPanel = ({ children, className = '' }: GlassPanelProps) => {
  return (
    <div className={`bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
