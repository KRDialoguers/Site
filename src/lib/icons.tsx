const s = { fill: 'none', stroke: 'currentColor' } as const;
export const Play = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path d="M7 4.5v15l13-7.5z" fill={color} /></svg>
);
export const Pause = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" /></svg>
);
export const Video = () => (<svg width="13" height="13" viewBox="0 0 24 24" {...s} strokeWidth="2" aria-hidden><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3" /></svg>);
export const Audio = () => (<svg width="13" height="13" viewBox="0 0 24 24" {...s} strokeWidth="2" aria-hidden><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v4" /></svg>);
export const Pin = () => (<svg width="13" height="13" viewBox="0 0 24 24" {...s} strokeWidth="2" aria-hidden><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>);
export const Chat = () => (<svg width="14" height="14" viewBox="0 0 24 24" {...s} strokeWidth="2" aria-hidden><path d="M21 12a8 8 0 01-11.6 7.1L4 20.5l1.4-4.7A8 8 0 1121 12z" /></svg>);
export const Arrow = () => (<svg width="18" height="18" viewBox="0 0 24 24" {...s} strokeWidth="1.8" aria-hidden><path d="M4 12h15M13 6l6 6-6 6" /></svg>);
export const Search = () => (<svg width="16" height="16" viewBox="0 0 24 24" {...s} strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>);
const I20 = ({ d, children }: { d?: string; children?: React.ReactNode }) => (<svg width="20" height="20" viewBox="0 0 24 24" {...s} strokeWidth="1.6" aria-hidden>{d ? <path d={d} /> : children}</svg>);
export const Idea = () => <I20><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></I20>;
export const Why = () => <I20><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5" /></I20>;
export const Bolt = () => <I20 d="M13 2L4 14h7l-1 8 9-12h-7z" />;
export const Book = () => <I20 d="M2 5c3-1.5 7-1.5 10 1 3-2.5 7-2.5 10-1v14c-3-1.5-7-1.5-10 1-3-2.5-7-2.5-10-1z M12 6v14" />;
export const Layers = () => <I20 d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />;
export const Gauge = () => <I20 d="M12 3a6 6 0 00-6 6c0 2.2 1.2 3.4 2 4.5V17h8v-3.5c.8-1.1 2-2.3 2-4.5a6 6 0 00-6-6zM9 20h6" />;
export const Clock = () => <I20><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I20>;
export const Bulb = () => <I20 d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />;
