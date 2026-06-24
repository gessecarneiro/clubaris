
export default function ShirtIcon({
  player,
  size = 'large',
  color1,
  color2
}: {
  player: any;
  size?: 'large' | 'small';
  color1?: string;
  color2?: string;
}) {
  const isGK = player.position === 'GK';
  const width = size === 'large' ? 40 : 24;
  const height = size === 'large' ? 40 : 24;
  const fontSize = size === 'large' ? 14 : 10;

  // Usa cores da paleta ou fallback pra simular a camisa do time
  // Usa cores da paleta ou fallback pra simular a camisa do time
  let fillColorClass = "drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]";
  let textColorClass = "";
  
  if (!color1) {
    fillColorClass += isGK 
      ? " text-secondary-container" 
      : " text-primary-fixed";
    textColorClass = isGK ? "text-on-secondary" : "text-on-primary";
  }

  const svgStyle: React.CSSProperties = color1 && !isGK ? { color: color1 } : {};
  const svgStyleGK: React.CSSProperties = color1 && isGK ? { color: color2 || '#333' } : svgStyle;
  
  const textStyle: React.CSSProperties = color2 && !isGK ? { color: color2 } : {};
  const textStyleGK: React.CSSProperties = color1 && isGK ? { color: color1 } : textStyle;

  return (
    <div className={`flex flex-col items-center ${size === 'large' ? 'gap-1' : ''}`}>
      <div className={`relative flex items-center justify-center`} style={{ width, height }}>
        {/* SVG T-Shirt / Jersey */}
        <svg 
          viewBox="0 0 24 24" 
          width="100%" 
          height="100%" 
          className={`absolute ${fillColorClass}`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          style={isGK ? svgStyleGK : svgStyle}
        >
          {/* Corpo da camisa */}
          <path fill="currentColor" d="M7 4L5 7L2 6L1 10L5 12V22H19V12L23 10L22 6L19 7L17 4H7Z" />
          {/* Gola Redonda */}
          <path fill="#222" d="M10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4H10Z" stroke="none" />
        </svg>
        {/* Number inside the shirt */}
        <span className={`relative z-10 font-black tracking-tighter ${textColorClass}`} style={{ fontSize, ...(isGK ? textStyleGK : textStyle) }}>
          {player.number}
        </span>
      </div>
      
      {size === 'large' && (
        <span className="bg-surface-container-lowest font-bold tracking-[1px] px-1 text-[10px] border border-on-background whitespace-nowrap">
          {player.name.split(' ').slice(-1)[0]}
        </span>
      )}
    </div>
  );
}
