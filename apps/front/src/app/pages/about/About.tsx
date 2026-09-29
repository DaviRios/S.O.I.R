import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Tab = 'services' | 'partners' | 'careers' | 'media';

const TAB_LABELS: Record<Tab, string> = {
  services: 'Serviços',
  partners: 'Parceiros',
  careers: 'Carreiras',
  media: 'Mídia',
};

export function About() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('services');

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
              Página Sobre
            </h1>
            <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
              Gerencie o conteúdo da página Sobre do site
            </p>
          </div>
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
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <ComingSoon />
      </div>
    </div>
  );
}

function ComingSoon() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '80px 40px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          background: '#EBF9FD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6BA3E3',
          marginBottom: '8px',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <p
        style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#1e1b2e',
          margin: '0',
        }}
      >
        Em breve
      </p>
      <p
        style={{
          fontSize: '14px',
          color: '#7c6fa0',
          margin: '0',
          maxWidth: '300px',
          lineHeight: '1.6',
        }}
      >
        Esta seção está em desenvolvimento e estará disponível em breve.
      </p>
    </div>
  );
}

export default About;
