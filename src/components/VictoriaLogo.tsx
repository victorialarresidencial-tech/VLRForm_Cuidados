import React, { useState } from 'react';

interface VictoriaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const OFFICIAL_LOGO_PATH = '/assets/aistudio/image_d44b11c8.png';
export const OFFICIAL_SECONDARY_LOGO = '/assets/aistudio/image_82422409.png';

export const VictoriaLogo: React.FC<VictoriaLogoProps> = ({
  size = 'md',
  className = '',
  showSubtitle = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  }[size];

  if (hasError) {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dfb842] to-[#b38b25] flex items-center justify-center text-[#133827] font-bold font-serif-brand text-xl shadow-md border border-[#dfb842]/50">
          V
        </div>
        <div className="flex flex-col">
          <span className="font-serif-brand font-bold text-white text-base leading-tight tracking-wide">
            Victoria Lar
          </span>
          <span className="font-display-brand text-[10px] text-[#dfb842] tracking-widest uppercase">
            Residencial Sênior
          </span>
          {showSubtitle && (
            <span className="text-[11px] text-emerald-200/80 font-sans">
              Controle de Cuidados
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src={OFFICIAL_LOGO_PATH}
        alt="Victoria Lar Residencial"
        className={`${heightClasses} w-auto object-contain rounded-lg transition-transform hover:scale-[1.01]`}
        loading="eager"
        onError={() => setHasError(true)}
      />
      {showSubtitle && (
        <div className="hidden sm:flex flex-col border-l border-emerald-700/60 pl-3">
          <span className="font-serif-brand font-semibold text-amber-300 text-sm tracking-wide">
            Controle de Cuidados
          </span>
          <span className="text-[11px] text-emerald-200/70 font-sans">
            Prontuário & Plantão Assistencial
          </span>
        </div>
      )}
    </div>
  );
};
