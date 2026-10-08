import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SlidesTab = lazy(() =>
  import('./slides/SlidesTab').then((module) => ({
    default: module.SlidesTab,
  })),
);
const EcosystemTab = lazy(() =>
  import('./ecosystem/EcosystemTab').then((module) => ({
    default: module.EcosystemTab,
  })),
);
const LogosTab = lazy(() =>
  import('./logos/LogosTab').then((module) => ({ default: module.LogosTab })),
);
const PopupsTab = lazy(() =>
  import('./popups/PopupsTab').then((module) => ({
    default: module.PopupsTab,
  })),
);
const BlogLinksTab = lazy(() =>
  import('./blog-links/BlogLinksTab').then((module) => ({
    default: module.BlogLinksTab,
  })),
);

type Tab = 'slides' | 'ecosystem' | 'logos' | 'popups' | 'blog-links';

const TAB_LABELS: Record<Tab, string> = {
  slides: 'Slides',
  ecosystem: 'Ecossistema',
  logos: 'Logos da Home',
  popups: 'Popups',
  'blog-links': 'Links do Blog',
};

const TAB_ADD_LABELS: Record<Tab, string> = {
  slides: '+ Novo Slide',
  ecosystem: '+ Novo Item',
  logos: '+ Adicionar Logo',
  popups: '+ Novo Popup',
  'blog-links': '+ Novo Link',
};

export function HomeContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('slides');
  const [success, setSuccess] = useState('');
  const [currentCount, setCurrentCount] = useState(0);
  const [openFormTrigger, setOpenFormTrigger] = useState(0);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3500);
    return () => clearTimeout(t);
  }, [success]);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setOpenFormTrigger(0);
    setCurrentCount(0);
  }

  const handleSuccess = useCallback((msg: string) => setSuccess(msg), []);
  const handleCountChange = useCallback(
    (count: number) => setCurrentCount(count),
    [],
  );

  const tabProps = {
    openFormTrigger,
    onSuccess: handleSuccess,
    onCountChange: handleCountChange,
  };

  return (
    <div className={'min-h-screen [background:#f8f7fc] flex flex-col'}>
      <div
        className={
          'flex items-center justify-between [padding:18px_40px] [background:#ffffff] [border-bottom:1px_solid_#C5EDF8] [box-shadow:0_1px_6px_rgba(84,_200,_232,_0.04)]'
        }
      >
        <button
          className={
            'flex items-center [gap:7px] border-0 [background:none] [font-size:14px] font-semibold [color:#7c6fa0] cursor-pointer [font-family:inherit] [padding:6px_10px] [border-radius:8px] [transition:background_0.15s,_color_0.15s] hover:[background:#EBF9FD] hover:[color:#3783D1]'
          }
          onClick={() => navigate('/')}
        >
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Voltar
        </button>
        <button
          className={
            '[background:#3783D1] [color:#ffffff] border-0 [border-radius:999px] [padding:9px_22px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_transform_0.1s,_box-shadow_0.15s] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.28)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)] hover:[box-shadow:0_4px_14px_rgba(84,_200,_232,_0.38)]'
          }
          onClick={() => setOpenFormTrigger((t) => t + 1)}
        >
          {TAB_ADD_LABELS[activeTab]}
        </button>
      </div>

      <div
        className={
          'flex-1 [padding:36px_40px] [max-width:1100px] w-full [margin:0_auto] [box-sizing:border-box]'
        }
      >
        <div
          className={'flex items-start justify-between [margin-bottom:24px]'}
        >
          <div>
            <h1
              className={
                '[font-size:22px] font-bold [color:#1e1b2e] [margin:0_0_4px] [letter-spacing:-0.01em]'
              }
            >
              Conteúdo da Home
            </h1>
            <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
              Gerencie os slides, ecossistema, popups e links do blog da página
              inicial
            </p>
          </div>
          {currentCount > 0 && (
            <span
              className={
                '[background:#C5EDF8] [color:#3783D1] [font-size:14px] font-semibold [padding:4px_12px] [border-radius:999px] whitespace-nowrap'
              }
            >
              {currentCount} item{currentCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div
          className={
            'flex [gap:4px] [background:#E8F7FC] [border-radius:14px] [padding:5px] [margin-bottom:28px] [width:fit-content]'
          }
        >
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`${'[padding:9px_22px] [border-radius:10px] border-0 [background:transparent] [font-size:14px] font-semibold [color:#7c6fa0] cursor-pointer [font-family:inherit] [transition:background_0.15s,_color_0.15s] hover:[color:#3783D1] hover:[background:rgba(255,_255,_255,_0.5)]'} ${activeTab === tab ? '[background:#ffffff] [color:#3783D1] [box-shadow:0_1px_6px_rgba(84,_200,_232,_0.12)]' : ''}`}
              onClick={() => switchTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {success && (
          <div
            className={`${'flex items-center [gap:8px] [border-radius:10px] [padding:12px_16px] [font-size:14px] font-medium [margin-bottom:20px]'} ${'[background:#f0fdf4] [border:1px_solid_#bbf7d0] [color:#16a34a]'}`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {success}
          </div>
        )}

        <Suspense
          fallback={
            <div className="py-16 text-center text-slate-500">
              Carregando seção…
            </div>
          }
        >
          {activeTab === 'slides' && <SlidesTab {...tabProps} />}
          {activeTab === 'ecosystem' && <EcosystemTab {...tabProps} />}
          {activeTab === 'logos' && <LogosTab {...tabProps} />}
          {activeTab === 'popups' && <PopupsTab {...tabProps} />}
          {activeTab === 'blog-links' && <BlogLinksTab {...tabProps} />}
        </Suspense>
      </div>
    </div>
  );
}

export default HomeContent;
