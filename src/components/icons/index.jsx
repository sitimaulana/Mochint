import React from 'react';

const createIcon = (children, defaultViewBox = '0 0 24 24') => {
  return function Icon({ size = 24, className = '', strokeWidth = 2, fill = 'none', stroke = 'currentColor', ...props }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={defaultViewBox}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {children}
      </svg>
    );
  };
};

export const Home = createIcon(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-7h6v7" /></>);
export const LayoutDashboard = createIcon(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="4" rx="1" /><rect x="14" y="10" width="7" height="11" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>);
export const CalendarCheck = createIcon(<><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m8 15 2 2 4-4" /></>);
export const ChevronRight = createIcon(<polyline points="9 18 15 12 9 6" />);
export const ChevronLeft = createIcon(<polyline points="15 18 9 12 15 6" />);
export const ChevronDown = createIcon(<polyline points="6 9 12 15 18 9" />);
export const ArrowRight = createIcon(<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>);
export const ArrowLeft = createIcon(<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>);
export const Clock = createIcon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>);
export const Calendar = createIcon(<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>);
export const Search = createIcon(<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>);
export const X = createIcon(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>);
export const Check = createIcon(<polyline points="20 6 9 17 4 12" />);
export const CheckCircle = createIcon(<><circle cx="12" cy="12" r="10" /><polyline points="16 8 10.5 14 8 11.5" /></>);
export const CheckCircle2 = CheckCircle;
export const AlertCircle = createIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>);
export const AlertTriangle = createIcon(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>);
export const Info = createIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="10" x2="12" y2="16" /><line x1="12" y1="7" x2="12.01" y2="7" /></>);
export const Lightbulb = createIcon(<><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8 14a6 6 0 1 1 8 0c-.84.74-1.5 1.68-1.8 2.86H9.8C9.5 15.68 8.84 14.74 8 14z" /></>);
export const SearchIcon = Search;
export const Filter = createIcon(<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3" />);
export const SlidersHorizontal = createIcon(<><line x1="4" y1="6" x2="20" y2="6" /><circle cx="10" cy="6" r="2" /><line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="8" cy="18" r="2" /></>);
export const Plus = createIcon(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>);
export const Menu = createIcon(<><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>);
export const HomeIcon = Home;
export const User = createIcon(<><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></>);
export const Users = createIcon(<><circle cx="9" cy="8" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3.5 21a5.5 5.5 0 0 1 11 0" /><path d="M13.5 21a4.5 4.5 0 0 1 7 0" /></>);
export const UserPlus = createIcon(<><circle cx="9" cy="8" r="3" /><path d="M3.5 21a5.5 5.5 0 0 1 11 0" /><line x1="17" y1="8" x2="17" y2="14" /><line x1="14" y1="11" x2="20" y2="11" /></>);
export const Edit3 = createIcon(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>);
export const Edit2 = createIcon(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>);
export const Trash2 = createIcon(<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>);
export const History = createIcon(<><path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 4 3 10 9 10" /></>);
export const ClipboardList = createIcon(<><rect x="8" y="3" width="8" height="4" rx="1" /><path d="M9 5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><line x1="8" y1="11" x2="16" y2="11" /><line x1="8" y1="15" x2="16" y2="15" /></>);
export const Award = createIcon(<><circle cx="12" cy="8" r="5" /><path d="M8.5 13.5 7 22l5-2.5L17 22l-1.5-8.5" /></>);
export const Send = createIcon(<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9" /></>);
export const MessageCircle = createIcon(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />);
export const MessageSquare = createIcon(<path d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />);
export const Mail = createIcon(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7 10-7" /></>);
export const Phone = createIcon(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.22 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.67 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.47-1.24a2 2 0 0 1 2.11-.45c.83.33 1.71.55 2.61.67A2 2 0 0 1 22 16.92z" />);
export const Eye = createIcon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>);
export const EyeOff = createIcon(<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><circle cx="12" cy="12" r="3" /><line x1="1" y1="1" x2="23" y2="23" /></>);
export const Star = createIcon(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21 12 17.77 5.82 21 7 14.14 2 9.27 8.91 8.26" />);
export const Settings = createIcon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-1.42 3.42 1.65 1.65 0 0 0-1.18.49 1.65 1.65 0 0 0-.49 1.18 2 2 0 0 1-3.42 1.42l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.5V24a2 2 0 0 1-4 0v-.06a1.65 1.65 0 0 0-1-1.5 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-3.42-1.42 1.65 1.65 0 0 0-.49-1.18 1.65 1.65 0 0 0-1.18-.49A2 2 0 0 1 2.24 16l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.5-1H1a2 2 0 0 1 0-4h.06a1.65 1.65 0 0 0 1.5-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 2.59 2.9a1.65 1.65 0 0 0 1.18-.49 1.65 1.65 0 0 0 .49-1.18A2 2 0 0 1 7.68-.19l.06.06a1.65 1.65 0 0 0 1.82.33A1.65 1.65 0 0 0 11 0h2a1.65 1.65 0 0 0 1.44 1.2 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 0 1 19.74 2.2a1.65 1.65 0 0 0 .49 1.18 1.65 1.65 0 0 0 1.18.49A2 2 0 0 1 23.97 7h-.06a1.65 1.65 0 0 0-1.5 1 1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-1.42 3.42 1.65 1.65 0 0 0-1.18.49 1.65 1.65 0 0 0-.49 1.18z" /></>);
export const Loader = createIcon(<><circle cx="12" cy="12" r="10" opacity="0.25" /><path d="M22 12a10 10 0 0 0-10-10" /></>);
export const Loader2 = createIcon(<><circle cx="12" cy="12" r="10" opacity="0.25" /><path d="M22 12a10 10 0 0 0-10-10" /></>);
export const Lock = createIcon(<><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>);
export const ShieldCheck = createIcon(<><path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5z" /><polyline points="9 12 11 14 15 10" /></>);
export const ShoppingBag = createIcon(<><path d="M6 7h12l-1 14H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></>);
export const Tag = createIcon(<><path d="M20.59 13.41 11 23l-9-9V4h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><circle cx="7.5" cy="7.5" r="1.5" /></>);
export const ExternalLink = createIcon(<><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>);
export const Printer = createIcon(<><path d="M6 9V3h12v6" /><rect x="6" y="13" width="12" height="8" rx="1" /><path d="M6 17H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" /></>);
export const List = createIcon(<><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>);
export const CircleDot = createIcon(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></>);
export const Sparkles = createIcon(<><path d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5z" /><path d="M17 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" /><path d="M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6z" /></>);
export const Percent = createIcon(<><line x1="19" y1="5" x2="5" y2="19" /><circle cx="7" cy="7" r="2" /><circle cx="17" cy="17" r="2" /></>);
export const MapPin = createIcon(<><path d="M12 21s6-5.3 6-11a6 6 0 0 0-12 0c0 5.7 6 11 6 11z" /><circle cx="12" cy="10" r="2.5" /></>);
export const Share2 = createIcon(<><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 11.1 15.8 6.9" /><path d="M8.2 12.9 15.8 17.1" /></>);
export const Map = createIcon(<><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z" /><path d="M9 3v15" /><path d="M15 6v15" /></>);
export const Building2 = createIcon(<><rect x="3" y="3" width="8" height="18" rx="1" /><rect x="13" y="7" width="8" height="14" rx="1" /><line x1="7" y1="7" x2="7.01" y2="7" /><line x1="7" y1="11" x2="7.01" y2="11" /><line x1="7" y1="15" x2="7.01" y2="15" /><line x1="17" y1="11" x2="17.01" y2="11" /><line x1="17" y1="15" x2="17.01" y2="15" /></>);
export const Instagram = createIcon(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></>);
export const Facebook = createIcon(<><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v9h4v-9h3l1-4h-4V8a1 1 0 0 1 1-1z" /></>);
export const Twitter = createIcon(<><path d="M22 5.8a8.2 8.2 0 0 1-2.36.65A4.1 4.1 0 0 0 21.4 4a8.2 8.2 0 0 1-2.6.99A4.1 4.1 0 0 0 12 8v1a11.6 11.6 0 0 1-8.4-4.3 4.1 4.1 0 0 0 1.27 5.48A4.1 4.1 0 0 1 2.4 9v.05A4.1 4.1 0 0 0 5.7 13a4.1 4.1 0 0 1-1.85.07A4.1 4.1 0 0 0 7.7 16a8.2 8.2 0 0 1-5.1 1.76A8.4 8.4 0 0 1 2 17.7 11.6 11.6 0 0 0 8.29 19c7.55 0 11.68-6.26 11.68-11.69l-.01-.53A8.4 8.4 0 0 0 22 5.8z" /></>);
export const RefreshCw = createIcon(<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>);
export const Bed = createIcon(<><path d="M3 20V10" /><path d="M21 20V14" /><path d="M3 14h18" /><path d="M5 10h7a4 4 0 0 1 4 4v2H5z" /><path d="M7 10V7" /></>);
export const Stethoscope = createIcon(<><path d="M6 4v7a6 6 0 0 0 12 0V4" /><path d="M18 4a2 2 0 1 1-4 0" /><path d="M10 11v4a2 2 0 0 0 4 0v-4" /><circle cx="12" cy="19" r="1.5" /></>);
export const CalendarIcon = Calendar;
export const CreditCard = createIcon(<><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="7" y1="15" x2="11" y2="15" /></>);
export const Save = createIcon(<><path d="M5 3h11l3 3v15H5z" /><path d="M7 3v6h8V3" /><path d="M8 21v-7h8v7" /></>);
export const LogOut = createIcon(<><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 3v18" /></>);
export const LoaderSpin = Loader2;
export const TrendingUp = createIcon(<><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>);
export const SearchSimple = Search;
export const Hash = createIcon(<><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></>);
export const Beaker = createIcon(<><path d="M10 2h4" /><path d="M11 2v5l-5 9a3 3 0 0 0 2.6 4.5h6.8A3 3 0 0 0 18 16l-5-9V2" /><path d="M8 14h8" /></>);
export const XCircle = createIcon(<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>);
export const Thermometer = createIcon(<><path d="M14 14.76V5a2 2 0 1 0-4 0v9.76a4 4 0 1 0 4 0z" /></>);

export const MessageCircle2 = MessageCircle;
export const Bell = createIcon(<><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M9 21a3 3 0 0 0 6 0" /></>);
