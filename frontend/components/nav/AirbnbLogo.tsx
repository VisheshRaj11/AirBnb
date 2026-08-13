import React from 'react';

export const AirbnbBeloIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <img
      src="/airbnb-logo.png"
      alt="Airbnb Logo"
      className={className}
    />
  );
};

export const AirbnbFullLogo: React.FC<{ className?: string }> = ({ className = 'h-8' }) => {
  return (
    <div className={`flex items-center text-brand ${className}`}>
      <img
        src="/airbnb-logo.png"
        alt="Airbnb Logo"
        className="w-12 h-14 shrink-0 object-contain"
      />
      <span className="text-2xl font-semibold tracking-tighter text-brand font-sans leading-none select-none">
        airbnb
      </span>
    </div>
  );
};
