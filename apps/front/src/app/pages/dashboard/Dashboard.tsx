import { useNavigate } from 'react-router-dom';

const modules = [
  {
    path: 'home-content',
    title: 'Conteúdo da Home',
    description: 'Gerencie slides do hero, itens do ecossistema e popups',
    tag: 'Home',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: 'cases',
    title: 'Cases',
    description: 'Publique Cases com setor, país, tag e conteúdo',
    tag: 'Cases',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    path: 'blog-posts',
    title: 'Blog e Notícias',
    description: 'Crie e publique posts, gerencie autores e conteúdo editorial',
    tag: 'Blog',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    path: 'about',
    title: 'Página Sobre',
    description: 'Gerencie serviços da empresa, parceiros e vagas de emprego',
    tag: 'Institucional',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },

  {
    path: 'media',
    title: 'Repositório de Mídias',
    description:
      'Visualize, busque e faça upload de imagens e vídeos do sistema',
    tag: 'Mídias',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div
      className={
        'min-h-screen [background:#f8f7fc] flex items-center justify-center [padding:48px_24px]'
      }
    >
      <div
        className={
          'w-full [max-width:940px] flex flex-col items-center [gap:0]'
        }
      >
        <div className={'flex items-center [gap:10px] [margin-bottom:40px]'}>
          <div className={'flex items-center justify-center'}>
            <strong className="text-3xl font-extrabold tracking-[0.14em]">
              Soir
            </strong>
          </div>
        </div>

        <div className={'text-center [margin-bottom:36px]'}>
          <h1
            className={
              '[font-size:26px] font-extrabold [color:#1e1b2e] [margin:0_0_8px] [letter-spacing:-0.02em]'
            }
          >
            Selecione um módulo
          </h1>
          <p className={'[font-size:14.5px] [color:#7c6fa0] [margin:0]'}>
            Gerencie o conteúdo do seu site
          </p>
        </div>

        <div
          className={
            'grid [grid-template-columns:repeat(6,_1fr)] [gap:16px] w-full group max-[740px]:[grid-template-columns:1fr_1fr] max-[480px]:[grid-template-columns:1fr]'
          }
        >
          {modules.map((mod) => (
            <button
              key={mod.path}
              className={
                '[grid-column:span_2] [grid-column:2_/_span_2] max-[740px]:[grid-column:span_1] max-[480px]:[grid-column:span_1] [background:#ffffff] [border:1px_solid_#C5EDF8] [border-radius:20px] [padding:0] cursor-pointer [text-align:left] [font-family:inherit] [transition:box-shadow_0.2s,_transform_0.18s,_border-color_0.2s] [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.06)] overflow-hidden hover:[box-shadow:0_10px_32px_rgba(84,_200,_232,_0.14)] hover:[transform:translateY(-3px)] hover:[border-color:#A0BEE8] active:[transform:translateY(-1px)] active:[box-shadow:0_4px_14px_rgba(84,_200,_232,_0.1)] group'
              }
              onClick={() => navigate(mod.path)}
            >
              <div className={'[padding:24px] flex flex-col [gap:14px] h-full'}>
                <div className={'flex items-start justify-between'}>
                  <div
                    className={
                      '[width:56px] [height:56px] [border-radius:16px] [background:linear-gradient(135deg,_#C5EDF8,_#BAE8F6)] flex items-center justify-center [color:#3783D1] shrink-0'
                    }
                  >
                    {mod.icon}
                  </div>
                  <span
                    className={
                      '[font-size:14px] font-semibold [color:#6BA3E3] [background:#f0fcff] [border:1px_solid_#BAE8F6] [padding:3px_10px] [border-radius:999px] [letter-spacing:0.04em] uppercase'
                    }
                  >
                    {mod.tag}
                  </span>
                </div>
                <div className={'flex flex-col [gap:6px] flex-1'}>
                  <h2
                    className={
                      '[font-size:15.5px] font-bold [color:#1e1b2e] [margin:0] [line-height:1.3] [letter-spacing:-0.01em]'
                    }
                  >
                    {mod.title}
                  </h2>
                  <p
                    className={
                      '[font-size:14px] [color:#7c6fa0] [margin:0] [line-height:1.6]'
                    }
                  >
                    {mod.description}
                  </p>
                </div>
                <div
                  className={
                    'flex items-center [gap:6px] [padding-top:10px] [border-top:1px_solid_#EBF9FD] [&_svg]:[color:#6BA3E3] [&_svg]:[transition:transform_0.15s] group-hover:[transform:translateX(3px)] group-hover:[color:#3783D1]'
                  }
                >
                  <span
                    className={
                      '[font-size:14px] font-semibold [color:#3783D1] flex-1'
                    }
                  >
                    Acessar módulo
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
