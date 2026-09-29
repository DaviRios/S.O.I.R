import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import {
  listClientStories,
  createClientStory,
  updateClientStory,
  deleteClientStory,
  toggleClientStory,
  publishClientStory,
  unpublishClientStory,
  ClientStoryDTO,
} from '../../../services/client-stories.service';
import { uploadImage } from '../../../services/images.service';

interface Props {
  openFormTrigger: number;
  onSuccess: (msg: string) => void;
  onCountChange: (count: number) => void;
}

export function HistoriasDeClientesTab({
  openFormTrigger,
  onSuccess,
  onCountChange,
}: Props) {
  const [clientStories, setClientStories] = useState<ClientStoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingStory, setEditingStory] = useState<ClientStoryDTO | null>(null);
  const [csShortTitle, setCsShortTitle] = useState('');
  const [csLongTitle, setCsLongTitle] = useState('');
  const [csDescription, setCsDescription] = useState('');
  const [csLanguage, setCsLanguage] = useState<'PORTUGUESE' | 'ENGLISH'>(
    'PORTUGUESE',
  );
  const [csImageFile, setCsImageFile] = useState<File | null>(null);
  const [csImagePreview, setCsImagePreview] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{
    label: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const csImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (openFormTrigger > 0) openStoryForm();
  }, [openFormTrigger]);

  async function load() {
    setLoading(true);
    try {
      const data = await listClientStories();
      setClientStories(data);
      onCountChange(data.length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function openStoryForm(s?: ClientStoryDTO) {
    if (s) {
      setEditingStory(s);
      setCsShortTitle(s.shortTitle ?? '');
      setCsLongTitle(s.longTitle ?? '');
      setCsDescription(s.description ?? '');
      setCsImagePreview(s.imageUrl ?? '');
      setCsLanguage(s.language ?? 'PORTUGUESE');
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setCsShortTitle('');
    setCsLongTitle('');
    setCsDescription('');
    setCsLanguage('PORTUGUESE');
    if (csImagePreview && csImageFile) URL.revokeObjectURL(csImagePreview);
    setCsImageFile(null);
    setCsImagePreview('');
    setEditingStory(null);
    setError('');
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  function onCsImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsImageFile(file);
    if (csImagePreview && csImageFile) URL.revokeObjectURL(csImagePreview);
    setCsImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingStory) {
        let imageId: string | undefined;
        if (csImageFile) {
          const name = csImageFile.name.replace(/\.[^.]+$/, '');
          const uploaded = await uploadImage(csImageFile, name, [
            'client-story',
          ]);
          imageId = uploaded.id;
        }
        await updateClientStory(editingStory.id, {
          imageId,
          shortTitle: csShortTitle,
          longTitle: csLongTitle,
          description: csDescription,
        });
        onSuccess('História atualizada com sucesso!');
      } else {
        if (!csImageFile) {
          setError('Selecione uma imagem para a história.');
          setSaving(false);
          return;
        }
        const name = csImageFile.name.replace(/\.[^.]+$/, '');
        const uploaded = await uploadImage(csImageFile, name, ['client-story']);
        await createClientStory({
          imageId: uploaded.id,
          shortTitle: csShortTitle,
          longTitle: csLongTitle,
          description: csDescription,
          language: csLanguage,
        });
        onSuccess('História criada com sucesso!');
      }
      closeForm();
      const data = await listClientStories();
      setClientStories(data);
      onCountChange(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar história.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(s: ClientStoryDTO) {
    try {
      await toggleClientStory(s.id);
      const data = await listClientStories();
      setClientStories(data);
      onCountChange(data.length);
    } catch {
      /* ignore */
    }
  }

  async function handleTogglePublish(s: ClientStoryDTO) {
    try {
      if (s.isPublished) await unpublishClientStory(s.id);
      else await publishClientStory(s.id);
      const data = await listClientStories();
      setClientStories(data);
      onCountChange(data.length);
    } catch {
      /* ignore */
    }
  }

  function handleDelete(s: ClientStoryDTO) {
    setPendingDelete({
      label: s.longTitle || s.shortTitle,
      onConfirm: async () => {
        await deleteClientStory(s.id);
        const data = await listClientStories();
        setClientStories(data);
        onCountChange(data.length);
      },
    });
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
      {showForm && (
        <div
          className={
            '[background:#ffffff] [border-radius:20px] [border:1px_solid_#C5EDF8] [box-shadow:0_4px_24px_rgba(84,_200,_232,_0.08)] [padding:28px_32px] [margin-bottom:32px]'
          }
        >
          <div
            className={'flex items-start justify-between [margin-bottom:24px]'}
          >
            <div>
              <h2
                className={
                  '[font-size:17px] font-bold [color:#1e1b2e] [margin:0_0_4px]'
                }
              >
                {editingStory ? 'Editar História' : 'Nova História de Cliente'}
              </h2>
              <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                {editingStory
                  ? 'Atualize os campos da história'
                  : 'Adicione uma história de sucesso de cliente'}
              </p>
            </div>
            <button
              className={
                '[width:32px] [height:32px] [border-radius:9px] [border:1px_solid_#C5EDF8] [background:#f0fcff] [color:#7c6fa0] flex items-center justify-center cursor-pointer shrink-0 [transition:background_0.15s,_color_0.15s] hover:[background:#fef2f2] hover:[color:#dc2626] hover:[border-color:#fecaca]'
              }
              onClick={closeForm}
              title="Fechar"
            >
              <svg
                width="17"
                height="17"
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
          <form className={'flex flex-col [gap:18px]'} onSubmit={handleSubmit}>
            {error && (
              <div
                className={`${'flex items-center [gap:8px] [border-radius:10px] [padding:12px_16px] [font-size:14px] font-medium [margin-bottom:20px]'} ${'[background:#fef2f2] [border:1px_solid_#fecaca] [color:#dc2626]'}`}
              >
                {error}
              </div>
            )}
            <div
              className={
                'grid [grid-template-columns:180px_1fr] [gap:24px] max-[640px]:[grid-template-columns:1fr]'
              }
            >
              <div className={'flex flex-col [gap:8px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                >
                  Imagem {editingStory ? '(opcional)' : '*'}
                </label>
                <div
                  className={`${'[aspect-ratio:1] [border:2px_dashed_#A0BEE8] [border-radius:14px] [background:#f0fcff] flex items-center justify-center cursor-pointer overflow-hidden [transition:border-color_0.2s,_background_0.2s] hover:[border-color:#3783D1] hover:[background:#EBF9FD]'} ${csImagePreview ? '[border-style:solid] [border-color:#A0BEE8]' : ''}`}
                  onClick={() => csImageRef.current?.click()}
                >
                  <input
                    ref={csImageRef}
                    type="file"
                    accept="image/*"
                    className={'hidden'}
                    onChange={onCsImageChange}
                  />
                  {csImagePreview ? (
                    <img
                      src={csImagePreview}
                      alt="Preview"
                      className={
                        'w-full h-full object-contain [padding:10px] [box-sizing:border-box]'
                      }
                    />
                  ) : (
                    <div
                      className={
                        'flex flex-col items-center [gap:6px] [padding:14px] text-center'
                      }
                    >
                      <div
                        className={
                          '[width:40px] [height:40px] [border-radius:11px] [background:#C5EDF8] flex items-center justify-center [color:#3783D1]'
                        }
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <span
                        className={
                          '[font-size:14px] font-medium [color:#4b5563]'
                        }
                      >
                        Clique para adicionar
                      </span>
                    </div>
                  )}
                </div>
                {csImagePreview && (
                  <button
                    type="button"
                    className={
                      'border-0 [background:none] [font-size:14px] font-semibold [color:#3783D1] cursor-pointer [padding:0] [font-family:inherit]'
                    }
                    onClick={() => csImageRef.current?.click()}
                  >
                    Trocar imagem
                  </button>
                )}
              </div>
              <div className={'flex flex-col [gap:14px]'}>
                <div className={'flex flex-col [gap:6px]'}>
                  <label
                    className={
                      '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                    }
                    htmlFor="csShortTitle"
                  >
                    Título curto *
                  </label>
                  <input
                    id="csShortTitle"
                    type="text"
                    className={
                      'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                    }
                    placeholder="Ex: Soir + Cliente X"
                    value={csShortTitle}
                    onChange={(e) => setCsShortTitle(e.target.value)}
                    required
                  />
                </div>
                <div className={'flex flex-col [gap:6px]'}>
                  <label
                    className={
                      '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                    }
                    htmlFor="csLongTitle"
                  >
                    Título completo *
                  </label>
                  <input
                    id="csLongTitle"
                    type="text"
                    className={
                      'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                    }
                    placeholder="Título completo da história"
                    value={csLongTitle}
                    onChange={(e) => setCsLongTitle(e.target.value)}
                    required
                  />
                </div>
                <div className={'flex flex-col [gap:6px]'}>
                  <label
                    className={
                      '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                    }
                    htmlFor="csDescription"
                  >
                    Descrição *
                  </label>
                  <textarea
                    id="csDescription"
                    className={`${'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'} ${'[resize:vertical] [min-height:120px] [line-height:1.6]'}`}
                    placeholder="Descreva a história de sucesso..."
                    value={csDescription}
                    onChange={(e) => setCsDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className={'flex flex-col [gap:6px]'}>
                  <label
                    className={
                      '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                    }
                    htmlFor="csLanguage"
                  >
                    Idioma
                  </label>
                  <select
                    id="csLanguage"
                    className={
                      'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                    }
                    value={csLanguage}
                    onChange={(e) =>
                      setCsLanguage(e.target.value as 'PORTUGUESE' | 'ENGLISH')
                    }
                  >
                    <option value="PORTUGUESE">Português</option>
                    <option value="ENGLISH">English</option>
                  </select>
                </div>
              </div>
            </div>
            <div
              className={
                'flex justify-end [gap:12px] [padding-top:16px] [border-top:1px_solid_#EBF9FD]'
              }
            >
              <button
                type="button"
                className={
                  '[border:1px_solid_#BAE8F6] [background:#f0fcff] [color:#7c6fa0] [border-radius:10px] [padding:10px_22px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s] hover:[background:#EBF9FD] hover:[border-color:#A0BEE8] hover:[color:#3783D1]'
                }
                onClick={closeForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={
                  '[background:#3783D1] [color:#ffffff] border-0 [border-radius:10px] [padding:10px_24px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] flex items-center [gap:8px] [transition:background_0.15s,_transform_0.1s] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.3)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)] disabled:[opacity:0.7] disabled:cursor-not-allowed'
                }
                disabled={saving}
              >
                {saving && (
                  <span
                    className={
                      '[width:14px] [height:14px] [border:2px_solid_rgba(255,_255,_255,_0.3)] [border-top-color:#fff] [border-radius:50%] animate-spin shrink-0'
                    }
                  />
                )}
                {saving
                  ? 'Salvando...'
                  : editingStory
                    ? 'Atualizar história'
                    : 'Salvar história'}
              </button>
            </div>
          </form>
        </div>
      )}

      {clientStories.length > 0 ? (
        <div
          className={
            'grid [grid-template-columns:repeat(auto-fill,_minmax(350px,_1fr))] [gap:18px]'
          }
        >
          {clientStories.map((s) => (
            <div
              key={s.id}
              className={
                '[background:#ffffff] [border-radius:20px] [border:1px_solid_#C5EDF8] overflow-hidden flex [padding:24px] flex-col [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.05)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_10px_30px_rgba(84,_200,_232,_0.12)] hover:[transform:translateY(-2px)]'
              }
            >
              {s.imageUrl && (
                <div
                  className={
                    '[height:160px] overflow-hidden [background:#f0fcff]'
                  }
                >
                  <img
                    src={s.imageUrl}
                    alt={s.shortTitle}
                    className={'w-full h-full object-cover'}
                  />
                </div>
              )}
              <div
                className={
                  '[padding:18px_20px_12px] flex flex-col [gap:6px] flex-1'
                }
              >
                <span
                  className={
                    '[font-size:14px] font-bold [color:#3783D1] uppercase [letter-spacing:0.07em] [background:#EBF9FD] [padding:2px_9px] [border-radius:6px] [width:fit-content]'
                  }
                >
                  {s.shortTitle}
                </span>
                <h3
                  className={
                    '[font-size:15px] font-bold [color:#1e1b2e] [margin:0] [line-height:1.35]'
                  }
                >
                  {s.longTitle}
                </h3>
                <p
                  className={
                    '[font-size:14px] [color:#6b7280] [margin:0] [line-height:1.6] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden flex-1'
                  }
                >
                  {s.description}
                </p>
              </div>
              <div
                className={
                  'flex items-center justify-between [padding-top:14px] [border-top:1px_solid_#EBF9FD] [margin-top:auto]'
                }
              >
                <span
                  className={`${'[font-size:14px] font-semibold [padding:3px_10px] [border-radius:999px]'} ${s.isPublished ? '[background:#f0fdf4] [color:#16a34a] [border:1px_solid_#bbf7d0]' : '[background:#f0fcff] [color:#7c6fa0] [border:1px_solid_#BAE8F6]'}`}
                >
                  {s.isPublished ? 'Publicado' : 'Rascunho'}
                </span>
                <div className={'flex items-center [gap:6px]'}>
                  {!s.isPublished && (
                    <button
                      className={
                        '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#64748b] cursor-pointer flex items-center justify-center [font-family:inherit] [padding:0] hover:[background:#eff6ff] hover:[color:#2563eb] hover:[border-color:#bfdbfe]'
                      }
                      onClick={() => openStoryForm(s)}
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
                    className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${s.isActive ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                    onClick={() => handleToggleActive(s)}
                  >
                    {s.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${s.isPublished ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                    onClick={() => handleTogglePublish(s)}
                  >
                    {s.isPublished ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    className={
                      '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#64748b] cursor-pointer flex items-center justify-center [font-family:inherit] [padding:0] hover:[background:#fef2f2] hover:[color:#dc2626] hover:[border-color:#fecaca]'
                    }
                    onClick={() => handleDelete(s)}
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
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <p
              className={
                '[font-size:15.5px] font-semibold [color:#1e1b2e] [margin:0]'
              }
            >
              Nenhuma história cadastrada
            </p>
            <p
              className={
                '[font-size:14px] [color:#7c6fa0] [margin:0] [max-width:300px] [line-height:1.6]'
              }
            >
              Adicione histórias de sucesso de clientes para exibir no site
            </p>
            <button
              className={
                '[margin-top:8px] [background:#3783D1] [color:#ffffff] border-0 [border-radius:10px] [padding:10px_24px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_transform_0.1s] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.3)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)]'
              }
              onClick={() => openStoryForm()}
            >
              + Nova História
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
                  } catch {
                    /* ignore */
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
