const CarSpinner = ({
  message = "Finding your perfect ride...",
}: {
  message?: string;
}) => {
  const spinnerVars = {
    "--spinner-track": "220 14% 88%",
    "--spinner-glow": "38 92% 50%",
    "--spinner-icon": "220 25% 20%",
    "--spinner-bg": "220 20% 95%",
    "--spinner-dot": "38 92% 50%",
    "--spinner-text": "220 10% 46%",
  } as React.CSSProperties;

  return (
    <div
      className="flex flex-col items-center justify-center gap-8 select-none"
      style={spinnerVars}
    >
      {/* Main spinner container */}
      <div className="relative w-32 h-32 animate-scale-breathe">
        {/* Ambient glow */}
        <div className="absolute inset-[-16px] rounded-full bg-[hsl(var(--spinner-glow))] opacity-10 blur-2xl animate-pulse-glow" />
        <div className="absolute inset-[-4px] rounded-full bg-[hsl(var(--spinner-glow))] opacity-5 blur-lg animate-pulse-glow" />

        {/* Outer spinning arc */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-outer"
          viewBox="0 0 128 128"
        >
          {/* Track ring */}
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="hsl(var(--spinner-track))"
            strokeWidth="2"
          />
          {/* Active arc */}
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="hsl(var(--spinner-glow))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="240 364"
            className="animate-dash-arc"
          />
        </svg>

        {/* Inner counter-spinning arc */}
        <svg
          className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] animate-spin-inner"
          viewBox="0 0 104 104"
        >
          {/* Inner track */}
          <circle
            cx="52"
            cy="52"
            r="46"
            fill="none"
            stroke="hsl(var(--spinner-track))"
            strokeWidth="1.5"
            opacity="0.5"
          />
          {/* Inner active arc */}
          <circle
            cx="52"
            cy="52"
            r="46"
            fill="none"
            stroke="hsl(var(--spinner-glow))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="160 289"
            opacity="0.6"
            className="animate-dash-arc-reverse"
          />
        </svg>

        {/* Orbiting dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-orbit-dot">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--spinner-dot))] shadow-[0_0_8px_2px_hsl(var(--spinner-glow)/0.5)]" />
          </div>
        </div>

        {/* Center hub with steering wheel */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[hsl(var(--spinner-bg))] border border-[hsl(var(--spinner-track))] shadow-sm flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--spinner-icon))"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer wheel */}
              <circle cx="12" cy="12" r="9" />
              {/* Hub */}
              <circle
                cx="12"
                cy="12"
                r="2.5"
                fill="hsl(var(--spinner-glow))"
                stroke="hsl(var(--spinner-glow))"
                strokeWidth="1"
              />
              {/* Spokes */}
              <path d="M12 3.5V9.5" />
              <path d="M5.1 16.5L10.2 13.2" />
              <path d="M18.9 16.5L13.8 13.2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading text with dots */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[hsl(var(--spinner-text))] animate-fade-text">
          {message}
        </p>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full bg-[hsl(var(--spinner-dot))]"
              style={{
                animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarSpinner;
