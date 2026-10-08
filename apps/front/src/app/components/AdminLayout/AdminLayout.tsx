import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/auth';

interface AdminLayoutProps {
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function getFormattedDate() {
  const d = new Date();
  return `Hoje, ${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <button
      className={
        '[width:38px] [height:38px] [border-radius:50%] border-0 [background:transparent] [color:#9ca3af] flex items-center justify-center cursor-pointer [transition:background_0.15s,_color_0.15s,_transform_0.1s] hover:[background:#fee2e2] hover:[color:#dc2626] hover:[transform:scale(1.08)]'
      }
      onClick={() => signOut()}
      title="Sair"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}

export function AdminLayout({
  children,
  actionLabel,
  onAction,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: '/home-content',
      label: 'Home',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
      ),
    },
    {
      path: '/cases',
      label: 'Cases',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      path: '/',
      label: 'Dashboard',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      path: '/blog-posts',
      label: 'Blog',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="3" width="13" height="13" rx="2" />
          <path d="M5 7H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
        </svg>
      ),
    },
    {
      path: '/about',
      label: 'Sobre',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={'flex min-h-screen [background:#f8f7fc]'}>
      <aside
        className={
          '[width:72px] shrink-0 [background:#ffffff] [border-right:1px_solid_#C5EDF8] flex flex-col items-center [padding:20px_0_24px] fixed [top:0] [left:0] h-screen [z-index:100] [box-shadow:2px_0_16px_rgba(84,_200,_232,_0.05)]'
        }
      >
        <div className={'[margin-bottom:28px]'}>
          <div
            className={
              '[width:44px] [height:44px] [background:linear-gradient(135deg,_#3783D1,_#6BA3E3)] [border-radius:14px] flex items-center justify-center [color:#ffffff] [box-shadow:0_4px_12px_rgba(84,_200,_232,_0.3)]'
            }
          >
            <span className="text-lg font-extrabold">S</span>
          </div>
        </div>

        <nav
          className={
            'flex flex-col [gap:4px] flex-1 [padding:0_12px] w-full items-center'
          }
        >
          {navItems.map(({ path, icon, label }) => (
            <button
              key={path}
              className={`${'[width:46px] [height:46px] [border-radius:14px] border-0 [background:transparent] [color:#9ca3af] flex items-center justify-center cursor-pointer [transition:background_0.15s,_color_0.15s,_transform_0.1s] relative hover:[background:#EBF9FD] hover:[color:#3783D1] hover:[transform:scale(1.05)]'} ${location.pathname === path ? '[background:#3783D1] [color:#ffffff] [box-shadow:0_4px_10px_rgba(84,_200,_232,_0.3)]' : ''}`}
              onClick={() => navigate(path)}
              title={label}
            >
              {icon}
            </button>
          ))}
        </nav>

        <div
          className={
            '[padding:0_12px] w-full flex flex-col items-center [gap:10px]'
          }
        >
          <div
            className={
              '[width:38px] [height:38px] [border-radius:50%] [background:linear-gradient(135deg,_#3783D1,_#A0BEE8)] [color:#ffffff] flex items-center justify-center [font-size:14px] font-bold cursor-pointer [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.25)] [transition:transform_0.15s] hover:[transform:scale(1.08)]'
            }
          >
            D
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className={'flex-1 [margin-left:72px] flex flex-col min-h-screen'}>
        <header
          className={
            '[height:64px] [background:#ffffff] [border-bottom:1px_solid_#C5EDF8] flex items-center [padding:0_32px] sticky [top:0] [z-index:50] [box-shadow:0_1px_8px_rgba(84,_200,_232,_0.04)]'
          }
        >
          <div className={'flex-1'} />
          <div className={'flex-1 justify-center sm:flex'}>
            <span
              className={
                'hidden whitespace-nowrap text-sm font-medium tracking-wide text-slate-500 sm:inline'
              }
            >
              {getFormattedDate()}
            </span>
          </div>
          <div className={'flex-1 flex justify-end'}>
            {actionLabel && onAction && (
              <button
                className={
                  '[background:#3783D1] [color:#ffffff] border-0 [border-radius:999px] [padding:9px_22px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_transform_0.1s,_box-shadow_0.15s] [letter-spacing:0.01em] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.3)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)] hover:[box-shadow:0_4px_14px_rgba(84,_200,_232,_0.4)] active:[transform:translateY(0)] active:[box-shadow:0_2px_8px_rgba(84,_200,_232,_0.25)]'
                }
                onClick={onAction}
              >
                + {actionLabel}
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
