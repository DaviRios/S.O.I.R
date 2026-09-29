import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import {
  listEcosystemItems,
  createEcosystemItem,
  updateEcosystemItem,
  deleteEcosystemItem,
  toggleEcosystemItem,
  publishEcosystemItem,
  unpublishEcosystemItem,
  EcosystemDTO,
} from '../../../services/ecosystem.service';
import { uploadImage } from '../../../services/images.service';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmptyTabState } from '../EmptyTabState';

interface Props {
  openFormTrigger: number;
  onSuccess: (msg: string) => void;
  onCountChange: (count: number) => void;
}

export function EcosystemTab({
  openFormTrigger,
  onSuccess,
  onCountChange,
}: Props) {
  const [ecoItems, setEcoItems] = useState<EcosystemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<EcosystemDTO | null>(null);
  const [ecoName, setEcoName] = useState('');
  const [ecoImageFile, setEcoImageFile] = useState<File | null>(null);
  const [ecoImagePreview, setEcoImagePreview] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{
    label: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const ecoImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (openFormTrigger > 0) openItemForm();
  }, [openFormTrigger]);

  async function load() {
    setLoading(true);
    try {
      const data = await listEcosystemItems();
      setEcoItems(data);
      onCountChange(data.length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function openItemForm(item?: EcosystemDTO) {
    if (item) {
      setEditingItem(item);
      setEcoName(item.name ?? '');
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEcoName('');
    if (ecoImagePreview && ecoImageFile) URL.revokeObjectURL(ecoImagePreview);
    setEcoImageFile(null);
    setEcoImagePreview('');
    setEditingItem(null);
    setError('');
  }

  function onEcoImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEcoImageFile(file);
    if (ecoImagePreview) URL.revokeObjectURL(ecoImagePreview);
    setEcoImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingItem) {
        let imageId: string | undefined;
        if (ecoImageFile) {
          const name = ecoImageFile.name.replace(/\.[^.]+$/, '');
          const uploaded = await uploadImage(ecoImageFile, name, ['ecosystem']);
          imageId = uploaded.id;
        }
        await updateEcosystemItem(editingItem.id, {
          name: ecoName || undefined,
          imageId,
        });
        onSuccess('Item atualizado com sucesso!');
      } else {
        let imageId: string | undefined;
        if (ecoImageFile) {
          const name = ecoImageFile.name.replace(/\.[^.]+$/, '');
          const uploaded = await uploadImage(ecoImageFile, name, ['ecosystem']);
          imageId = uploaded.id;
        }
        await createEcosystemItem({ name: ecoName, imageId });
        onSuccess('Item criado com sucesso!');
      }
      setShowForm(false);
      resetForm();
      const data = await listEcosystemItems();
      setEcoItems(data);
      onCountChange(data.length);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingItem
            ? 'Erro ao atualizar item.'
            : 'Erro ao criar item.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(item: EcosystemDTO) {
    try {
      if (item.isPublished) await unpublishEcosystemItem(item.id);
      else await publishEcosystemItem(item.id);
      const data = await listEcosystemItems();
      setEcoItems(data);
      onCountChange(data.length);
    } catch {
      /* ignore */
    }
  }

  async function handleToggleActive(item: EcosystemDTO) {
    try {
      await toggleEcosystemItem(item.id);
      const data = await listEcosystemItems();
      setEcoItems(data);
      onCountChange(data.length);
    } catch {
      /* ignore */
    }
  }

  function handleDelete(item: EcosystemDTO) {
    setPendingDelete({
      label: item.name,
      onConfirm: async () => {
        await deleteEcosystemItem(item.id);
        const data = await listEcosystemItems();
        setEcoItems(data);
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
            className={'flex items-start justify-between [margin-bottom:22px]'}
          >
            <div>
              <h2
                className={
                  '[font-size:17px] font-bold [color:#1e1b2e] [margin:0_0_4px]'
                }
              >
                {editingItem ? 'Editar Item' : 'Novo Item do Ecossistema'}
              </h2>
              <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                {editingItem
                  ? 'Atualize os campos do item'
                  : 'Adicione uma empresa ao ecossistema exibido na home'}
              </p>
            </div>
            <button
              className={
                '[width:32px] [height:32px] [border-radius:9px] [border:1px_solid_#C5EDF8] [background:#f0fcff] [color:#7c6fa0] flex items-center justify-center cursor-pointer shrink-0 [transition:background_0.15s,_color_0.15s] hover:[background:#fef2f2] hover:[color:#dc2626] hover:[border-color:#fecaca]'
              }
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
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
          <form className={'flex flex-col [gap:16px]'} onSubmit={handleSubmit}>
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
                  Imagem
                </label>
                <div
                  className={`${'[aspect-ratio:1] [border:2px_dashed_#A0BEE8] [border-radius:14px] [background:#f0fcff] flex items-center justify-center cursor-pointer overflow-hidden [transition:border-color_0.2s,_background_0.2s] hover:[border-color:#3783D1] hover:[background:#EBF9FD]'} ${ecoImagePreview ? '[border-style:solid] [border-color:#A0BEE8]' : ''}`}
                  onClick={() => ecoImageRef.current?.click()}
                >
                  <input
                    ref={ecoImageRef}
                    type="file"
                    accept="image/*"
                    className={'hidden'}
                    onChange={onEcoImageChange}
                  />
                  {ecoImagePreview ? (
                    <img
                      src={ecoImagePreview}
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
                      <span className={'[font-size:14px] [color:#6BA3E3]'}>
                        PNG, SVG, WebP
                      </span>
                    </div>
                  )}
                </div>
                {ecoImagePreview && (
                  <button
                    type="button"
                    className={
                      'border-0 [background:none] [font-size:14px] font-semibold [color:#3783D1] cursor-pointer [padding:0] [font-family:inherit]'
                    }
                    onClick={() => ecoImageRef.current?.click()}
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
                    htmlFor="ecoName"
                  >
                    Nome *
                  </label>
                  <input
                    id="ecoName"
                    type="text"
                    className={
                      'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                    }
                    placeholder="Nome da empresa ou tecnologia"
                    value={ecoName}
                    onChange={(e) => setEcoName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div
              className={
                'flex justify-end [gap:12px] [padding-top:14px] [border-top:1px_solid_#EBF9FD]'
              }
            >
              <button
                type="button"
                className={
                  '[border:1px_solid_#BAE8F6] [background:#f0fcff] [color:#7c6fa0] [border-radius:10px] [padding:10px_22px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s] hover:[background:#EBF9FD] hover:[border-color:#A0BEE8] hover:[color:#3783D1]'
                }
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
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
                  : editingItem
                    ? 'Atualizar item'
                    : 'Salvar item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {ecoItems.length > 0 ? (
        <div
          className={
            'grid [grid-template-columns:repeat(auto-fill,_minmax(250px,_1fr))] [gap:14px]'
          }
        >
          {ecoItems.map((item) => (
            <div
              key={item.id}
              className={
                '[background:#ffffff] [border-radius:18px] [border:1px_solid_#C5EDF8] [padding:22px] flex flex-col [gap:12px] [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.05)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_6px_20px_rgba(84,_200,_232,_0.12)] hover:[transform:translateY(-2px)]'
              }
            >
              <div
                className={
                  '[height:88px] flex items-center justify-center [background:#f0fcff] [padding:12px]'
                }
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={
                      '[max-width:100%] [max-height:60px] object-contain'
                    }
                  />
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ color: '#A0BEE8' }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <div
                className={
                  '[padding:8px_12px] flex items-center justify-between [border-top:1px_solid_#EBF9FD]'
                }
              >
                <p
                  className={
                    '[font-size:14px] font-medium [color:#4b5563] [margin:0] whitespace-nowrap overflow-hidden [text-overflow:ellipsis] flex-1'
                  }
                >
                  {item.name}
                </p>
                <span
                  className={`${'[font-size:14px] font-semibold [padding:3px_10px] [border-radius:999px]'} ${item.isPublished ? '[background:#f0fdf4] [color:#16a34a] [border:1px_solid_#bbf7d0]' : '[background:#f0fcff] [color:#7c6fa0] [border:1px_solid_#BAE8F6]'}`}
                >
                  {item.isPublished ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
              <div
                className={
                  'flex justify-end [padding-top:10px] [border-top:1px_solid_#EBF9FD]'
                }
              >
                <div className={'flex items-center [gap:6px]'}>
                  {!item.isPublished && (
                    <button
                      className={
                        '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#64748b] cursor-pointer flex items-center justify-center [font-family:inherit] [padding:0] hover:[background:#eff6ff] hover:[color:#2563eb] hover:[border-color:#bfdbfe]'
                      }
                      onClick={() => openItemForm(item)}
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
                    className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${item.isActive ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                    onClick={() => handleToggleActive(item)}
                  >
                    {item.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${item.isPublished ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                    onClick={() => handleTogglePublish(item)}
                  >
                    {item.isPublished ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    className={
                      '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#64748b] cursor-pointer flex items-center justify-center [font-family:inherit] [padding:0] hover:[background:#fef2f2] hover:[color:#dc2626] hover:[border-color:#fecaca]'
                    }
                    onClick={() => handleDelete(item)}
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
          <EmptyTabState
            label="Nenhum item cadastrado"
            sub="Adicione empresas e tecnologias ao ecossistema"
            onAdd={() => setShowForm(true)}
            btnLabel="+ Novo Item"
          />
        )
      )}

      {pendingDelete && (
        <ConfirmDialog
          label={pendingDelete.label}
          onConfirm={pendingDelete.onConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
