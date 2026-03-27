import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleHelp, ChevronDown, PlayCircle, MessagesSquare, Mail } from 'lucide-react';

const items = [
  { label: 'Citizen Help Video', path: '/help/video', icon: PlayCircle },
  { label: 'Frequently Asked Questions', path: '/help/faq', icon: MessagesSquare },
  { label: 'Contact Us', path: '/help/contact', icon: Mail },
];

export default function HelpDropdown({ dark = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const buttonClass = dark
    ? 'px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/10 hover:bg-white/15 text-white transition-colors inline-flex items-center gap-1.5'
    : 'px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1.5';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={buttonClass}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <CircleHelp className="w-4 h-4" />
        <span className="hidden sm:inline">Help</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-lg shadow-md bg-white border border-slate-200 z-50 p-1 transition-all duration-200 origin-top-right ${
          open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        }`}
        role="menu"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              role="menuitem"
            >
              <Icon className="w-4 h-4 text-slate-500" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
