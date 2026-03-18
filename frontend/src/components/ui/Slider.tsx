import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  unit?: string;
}

export const Slider = ({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  className = '',
  unit = '%'
}: SliderProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const displayValue = value > 0 ? `+${value}` : value.toString();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex justify-between items-end">
        <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-white/50">{label}</span>
        <span className="font-serif text-[1rem] leading-none tracking-tight text-[#E07B35]">
          {displayValue}<span className="text-[10px] opacity-60 ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="relative h-1.5 w-full mt-1">
        {/* Custom Track Background */}
        <div className="absolute inset-0 rounded-full bg-white/[0.04]" />
        
        {/* Custom Track Fill */}
        <div 
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[rgba(224,123,53,0.2)] to-[#E07B35]"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Native Range Input (Invisible overlay for mechanics) */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Custom Thumb - visual only */}
        <div 
          className="absolute top-1/2 -mt-[5px] h-2.5 w-2.5 -ml-[5px] rounded-full bg-white shadow-[0_0_8px_rgba(224,123,53,0.8)] pointer-events-none transition-transform"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
