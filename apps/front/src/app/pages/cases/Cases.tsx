import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CasesTab = lazy(() =>
  import('./cases/CasesTab').then((module) => ({ default: module.CasesTab })),
);
const HistoriasDeClientesTab = lazy(() =>
  import('./historias-de-clientes/HistoriasDeClientesTab').then((module) => ({
    default: module.HistoriasDeClientesTab,
  })),
);

type Tab = 'cases' | 'client-stories';

export function Cases() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('cases');
  const [openFormTrigger, setOpenFormTrigger] = useState(0);
  const [casesCount, setCasesCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);
  const [success, setSuccess] = useState('');

  function handleSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  }

  const currentCount = activeTab === 'cases' ? casesCount : storiesCount;
  const addLabel = activeTab === 'cases' ? '+ Novo Caso' : '+ Nova História';

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
          onClick={() => setOpenFormTrigger((n) => n + 1)}
        >
          {addLabel}
        </button>
      </div>

      <div
        className={
          'flex-1 [padding:36px_40px] [max-width:1100px] w-full [margin:0_auto] [box-sizing:border-box]'
        }
      >
        <div
          className={'flex items-start justify-between [margin-bottom:28px]'}
        >
          <div>
            <h1
              className={
                '[font-size:22px] font-bold [color:#1e1b2e] [margin:0_0_4px] [letter-spacing:-0.01em]'
              }
            >
              Cases
            </h1>
            <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
              Gerencie os Cases e Histórias de Clientes exibidos no site
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
          <button
            className={`${'[padding:9px_22px] [border-radius:10px] border-0 [background:transparent] [font-size:14px] font-semibold [color:#7c6fa0] cursor-pointer [font-family:inherit] [transition:background_0.15s,_color_0.15s] hover:[color:#3783D1] hover:[background:rgba(255,_255,_255,_0.5)]'} ${activeTab === 'cases' ? '[background:#ffffff] [color:#3783D1] [box-shadow:0_1px_6px_rgba(84,_200,_232,_0.12)]' : ''}`}
            onClick={() => setActiveTab('cases')}
          >
            Cases
          </button>
          <button
            className={`${'[padding:9px_22px] [border-radius:10px] border-0 [background:transparent] [font-size:14px] font-semibold [color:#7c6fa0] cursor-pointer [font-family:inherit] [transition:background_0.15s,_color_0.15s] hover:[color:#3783D1] hover:[background:rgba(255,_255,_255,_0.5)]'} ${activeTab === 'client-stories' ? '[background:#ffffff] [color:#3783D1] [box-shadow:0_1px_6px_rgba(84,_200,_232,_0.12)]' : ''}`}
            onClick={() => setActiveTab('client-stories')}
          >
            Histórias de Clientes
          </button>
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
          {activeTab === 'cases' && (
            <CasesTab
              openFormTrigger={openFormTrigger}
              onSuccess={handleSuccess}
              onCountChange={setCasesCount}
            />
          )}
          {activeTab === 'client-stories' && (
            <HistoriasDeClientesTab
              openFormTrigger={openFormTrigger}
              onSuccess={handleSuccess}
              onCountChange={setStoriesCount}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default Cases;
