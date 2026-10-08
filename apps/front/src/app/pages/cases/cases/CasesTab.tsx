import { useState, useEffect } from 'react';
import { caseImageUrl, CaseContentDTO } from '../../../services/cases.service';
import { CaseForm } from './CaseForm';
import { useCases } from './useCases';
import { Alert } from '../../../components/ui/Alert';

interface Props {
  openFormTrigger: number;
  onSuccess: (msg: string) => void;
  onCountChange: (count: number) => void;
}

export function CasesTab({ openFormTrigger, onSuccess, onCountChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [editingCase, setEditingCase] = useState<CaseContentDTO | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    label: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const {
    cases,
    isPending: loading,
    invalidate,
    remove,
    toggleActive,
    togglePublication,
  } = useCases();
  useEffect(() => onCountChange(cases.length), [cases.length, onCountChange]);

  useEffect(() => {
    if (openFormTrigger > 0) openCaseForm();
  }, [openFormTrigger]);

  function openCaseForm(c?: CaseContentDTO) {
    setEditingCase(c ?? null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setShowForm(false);
    setEditingCase(null);
    setError('');
  }

  async function handleToggleActive(c: CaseContentDTO) {
    try {
      await toggleActive(c);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Erro ao alterar o caso.',
      );
    }
  }

  async function handleTogglePublish(c: CaseContentDTO) {
    try {
      await togglePublication(c);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Erro ao alterar a publicação.',
      );
    }
  }

  function handleDelete(c: CaseContentDTO) {
    setPendingDelete({
      label: c.title,
      onConfirm: async () => {
        await remove(c);
      },
    });
  }

  function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent ?? tmp.innerText ?? '';
  }

  if (loading) {
    return (
      <div
        className={'flex flex-col items-center [gap:14px] [padding:80px_40px]'}
      >
        <div
          className={
            '[width:38px] [height:38px] [border:3px_solid_#C5EDF8] [border-top-color:#3783D1] [border-radius:50%] animate-spin'
          }
        />
        <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {showForm && (
        <CaseForm
          key={editingCase?.id ?? `new-${openFormTrigger}`}
          item={editingCase}
          onClose={closeForm}
          onSaved={async (message) => {
            onSuccess(message);
            closeForm();
            await invalidate();
          }}
        />
      )}
      {cases.length > 0 ? (
        <div
          className={
            'grid [grid-template-columns:repeat(auto-fill,_minmax(350px,_1fr))] [gap:20px]'
          }
        >
          {cases.map((c) => (
            <div
              key={c.id}
              className={
                '[background:#ffffff] [border-radius:20px] [border:1px_solid_#C5EDF8] [padding:24px] flex flex-col [gap:10px] [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.05)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_10px_30px_rgba(84,_200,_232,_0.12)] hover:[transform:translateY(-2px)]'
              }
            >
              <div className={'flex items-start justify-between [gap:8px]'}>
                {c.tag && (
                  <span
                    className={
                      '[font-size:14px] font-bold [color:#3783D1] uppercase [letter-spacing:0.08em] [background:#EBF9FD] [padding:3px_10px] [border-radius:6px]'
                    }
                  >
                    {c.tag}
                  </span>
                )}
                <div className={'flex [gap:6px] [flex-wrap:wrap] justify-end'}>
                  {c.industry && (
                    <span
                      className={
                        '[font-size:14px] font-medium [color:#6b7280] [background:#f3f4f6] [border:1px_solid_#e5e7eb] [padding:2px_8px] [border-radius:6px]'
                      }
                    >
                      {c.industry}
                    </span>
                  )}
                  {c.country && (
                    <span
                      className={
                        '[font-size:14px] font-medium [color:#6b7280] [background:#f3f4f6] [border:1px_solid_#e5e7eb] [padding:2px_8px] [border-radius:6px]'
                      }
                    >
                      {c.country}
                    </span>
                  )}
                </div>
              </div>
              {c.shortTitle && (
                <span
                  className={
                    '[font-size:14px] font-semibold [color:#6BA3E3] [letter-spacing:0.04em]'
                  }
                >
                  {c.shortTitle}
                </span>
              )}
              <h3
                className={
                  '[font-size:16px] font-bold [color:#1e1b2e] [margin:0] [line-height:1.35]'
                }
              >
                {c.title}
              </h3>
              {c.subtitle && (
                <p
                  className={
                    '[font-size:14px] [color:#4b5563] [margin:0] [line-height:1.55] font-medium'
                  }
                >
                  {c.subtitle}
                </p>
              )}
              {c.content && (
                <p
                  className={
                    '[font-size:14px] [color:#6b7280] [margin:0] [line-height:1.6] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden flex-1'
                  }
                >
                  {stripHtml(c.content)}
                </p>
              )}
              {c.imageIds?.length > 0 && (
                <div className={'flex [gap:6px] [flex-wrap:nowrap]'}>
                  {c.imageIds.map((imgId) => (
                    <img
                      key={imgId}
                      src={caseImageUrl(imgId)}
                      alt=""
                      className={
                        '[width:56px] [height:56px] [border-radius:8px] object-cover [border:1px_solid_#C5EDF8] shrink-0'
                      }
                    />
                  ))}
                </div>
              )}
              <div
                className={
                  'flex items-center justify-between [padding-top:14px] [border-top:1px_solid_#EBF9FD] [margin-top:auto]'
                }
              >
                <span
                  className={`${'[font-size:14px] font-semibold [padding:3px_10px] [border-radius:999px]'} ${c.isPublished ? '[background:#f0fdf4] [color:#16a34a] [border:1px_solid_#bbf7d0]' : '[background:#f0fcff] [color:#7c6fa0] [border:1px_solid_#BAE8F6]'}`}
                >
                  {c.isPublished ? 'Publicado' : 'Rascunho'}
                </span>
                <div className={'flex items-center [gap:6px]'}>
                  {!c.isPublished && (
                    <button
                      className={
                        '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#64748b] cursor-pointer flex items-center justify-center [font-family:inherit] [padding:0] hover:[background:#eff6ff] hover:[color:#2563eb] hover:[border-color:#bfdbfe]'
                      }
                      onClick={() => openCaseForm(c)}
                      title="Editar rascunho"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                  <button
                    className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${c.isActive ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                    onClick={() => handleToggleActive(c)}
                  >
                    {c.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${c.isPublished ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                    onClick={() => handleTogglePublish(c)}
                  >
                    {c.isPublished ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    className={
                      '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#64748b] cursor-pointer flex items-center justify-center [font-family:inherit] [padding:0] hover:[background:#fef2f2] hover:[color:#dc2626] hover:[border-color:#fecaca]'
                    }
                    onClick={() => handleDelete(c)}
                    title="Remover"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div
            className={
              'flex flex-col items-center [gap:10px] [padding:72px_40px] text-center'
            }
          >
            <div
              className={
                '[width:68px] [height:68px] [border-radius:20px] [background:#EBF9FD] flex items-center justify-center [color:#6BA3E3] [margin-bottom:8px]'
              }
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <p
              className={
                '[font-size:15.5px] font-semibold [color:#1e1b2e] [margin:0]'
              }
            >
              Nenhum caso cadastrado
            </p>
            <p
              className={
                '[font-size:14px] [color:#7c6fa0] [margin:0] [max-width:300px] [line-height:1.6]'
              }
            >
              Crie o primeiro caso de sucesso para exibir no site
            </p>
            <button
              className={
                '[margin-top:8px] [background:#3783D1] [color:#ffffff] border-0 [border-radius:10px] [padding:10px_24px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_transform_0.1s] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.3)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)]'
              }
              onClick={() => openCaseForm()}
            >
              + Novo Caso
            </button>
          </div>
        )
      )}

      {pendingDelete && (
        <div
          className={
            'fixed [inset:0] [background:rgba(0,_0,_0,_0.4)] flex items-center justify-center [z-index:1000]'
          }
          onClick={() => setPendingDelete(null)}
        >
          <div
            className={
              '[background:#ffffff] [border-radius:18px] [padding:28px_32px] [max-width:420px] [width:calc(100%_-_48px)] [box-shadow:0_12px_40px_rgba(0,_0,_0,_0.18)]'
            }
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className={
                '[font-size:17px] font-bold [color:#1e1b2e] [margin:0_0_10px]'
              }
            >
              Confirmar exclusão
            </p>
            <p
              className={
                '[font-size:14px] [color:#4b5563] [line-height:1.6] [margin:0_0_24px]'
              }
            >
              Tem certeza que deseja excluir{' '}
              <strong>"{pendingDelete.label}"</strong>? Esta ação não pode ser
              desfeita.
            </p>
            <div className={'flex justify-end [gap:10px]'}>
              <button
                className={
                  '[border:1px_solid_#BAE8F6] [background:#f0fcff] [color:#7c6fa0] [border-radius:10px] [padding:10px_22px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s] hover:[background:#EBF9FD]'
                }
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              <button
                className={
                  '[background:#ef4444] [color:#ffffff] border-0 [border-radius:10px] [padding:10px_22px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s] hover:[background:#dc2626]'
                }
                onClick={async () => {
                  try {
                    await pendingDelete.onConfirm();
                  } catch (reason) {
                    setError(
                      reason instanceof Error
                        ? reason.message
                        : 'Erro ao excluir o caso.',
                    );
                  }
                  setPendingDelete(null);
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
