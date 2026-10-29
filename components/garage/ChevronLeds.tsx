// Le pareti dell'officina WOW: tubi LED bianchi a "V" su fondo nero.
// Con `ignite` si accendono uno dopo l'altro con uno sfarfallio (steps), una volta sola.
export function ChevronLeds({ count = 5, ignite = false, className = "" }: { count?: number; ignite?: boolean; className?: string }) {
  const gap = 46;
  const width = count * gap + 40;
  return (
    <svg viewBox={`0 0 ${width} 120`} className={`wow-chevrons ${ignite ? "is-igniting" : ""} ${className}`} aria-hidden="true">
      <defs>
        <filter id="wow-led-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {Array.from({ length: count }, (_, i) => {
        const x = 20 + i * gap;
        return (
          <polyline
            key={i}
            points={`${x},20 ${x + 26},60 ${x},100`}
            className="wow-chevrons__tube"
            style={{ ["--i" as string]: i }}
            fill="none"
            stroke="#ffffff"
            strokeWidth={5}
            strokeLinecap="round"
            filter="url(#wow-led-glow)"
          />
        );
      })}
    </svg>
  );
}
