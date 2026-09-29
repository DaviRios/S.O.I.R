import { useState, useEffect, FormEvent } from 'react';
import {
  listPopups,
  createPopup,
  updatePopup,
  deletePopup,
  publishPopup,
  unpublishPopup,
  PopupDTO,
  PopupStyle,
  POPUP_STYLE_LABELS,
  POPUP_STYLE_COLORS,
} from '../../../services/popups.service';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmptyTabState } from '../EmptyTabState';

const LANG_LABEL: Record<string, string> = { PORTUGUESE: 'PT', ENGLISH: 'EN' };

interface Props {
  openFormTrigger: number;
  onSuccess: (msg: string) => void;
  onCountChange: (count: number) => void;
}

export function PopupsTab({
  openFormTrigger,
  onSuccess,
  onCountChange,
}: Props) {
  const [popups, setPopups] = useState<PopupDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingPopup, setEditingPopup] = useState<PopupDTO | null>(null);
  const [ppTitle, setPpTitle] = useState('');
  const [ppDesc, setPpDesc] = useState('');
  const [ppBtnText, setPpBtnText] = useState('');
  const [ppRedirectUrl, setPpRedirectUrl] = useState('');
  const [ppBtnText2, setPpBtnText2] = useState('');
  const [ppRedirectUrl2, setPpRedirectUrl2] = useState('');
  const [ppLang, setPpLang] = useState<'PORTUGUESE' | 'ENGLISH'>('PORTUGUESE');
  const [ppStyle, setPpStyle] = useState<PopupStyle>('ORANGE_WHITE');
  const [pendingDelete, setPendingDelete] = useState<{
    label: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (openFormTrigger > 0) openPopupForm();
  }, [openFormTrigger]);

  async function load() {
    setLoading(true);
    try {
      const data = await listPopups();
      setPopups(data);
      onCountChange(data.length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function openPopupForm(popup?: PopupDTO) {
    if (popup) {
      setEditingPopup(popup);
      setPpTitle(popup.title ?? '');
      setPpDesc(popup.description ?? '');
      setPpBtnText(popup.buttonText ?? '');
      setPpRedirectUrl(popup.redirectUrl ?? '');
      setPpBtnText2(popup.buttonText2 ?? '');
      setPpRedirectUrl2(popup.redirectUrl2 ?? '');
      setPpLang((popup.language as 'PORTUGUESE' | 'ENGLISH') ?? 'PORTUGUESE');
      setPpStyle(popup.style ?? 'ORANGE_WHITE');
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setPpTitle('');
    setPpDesc('');
    setPpBtnText('');
    setPpRedirectUrl('');
    setPpBtnText2('');
    setPpRedirectUrl2('');
    setPpLang('PORTUGUESE');
    setPpStyle('ORANGE_WHITE');
    setEditingPopup(null);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingPopup) {
        await updatePopup(editingPopup.id, {
          title: ppTitle || undefined,
          description: ppDesc || undefined,
          buttonText: ppBtnText || undefined,
          redirectUrl: ppRedirectUrl || undefined,
          buttonText2: ppBtnText2 || undefined,
          redirectUrl2: ppRedirectUrl2 || undefined,
          style: ppStyle,
          language: ppLang,
        });
        onSuccess('Popup atualizado com sucesso!');
      } else {
        await createPopup({
          title: ppTitle,
          description: ppDesc || undefined,
          buttonText: ppBtnText || undefined,
          redirectUrl: ppRedirectUrl || undefined,
          buttonText2: ppBtnText2 || undefined,
          redirectUrl2: ppRedirectUrl2 || undefined,
          style: ppStyle,
          language: ppLang,
        });
        onSuccess('Popup criado com sucesso!');
      }
      setShowForm(false);
      resetForm();
      const data = await listPopups();
      setPopups(data);
      onCountChange(data.length);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingPopup
            ? 'Erro ao atualizar popup.'
            : 'Erro ao criar popup.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(popup: PopupDTO) {
    try {
      if (popup.isPublished) await unpublishPopup(popup.id);
      else await publishPopup(popup.id);
      const data = await listPopups();
      setPopups(data);
      onCountChange(data.length);
    } catch {
      /* ignore */
    }
  }

  function handleDelete(popup: PopupDTO) {
    setPendingDelete({
      label: popup.title,
      onConfirm: async () => {
        await deletePopup(popup.id);
        const data = await listPopups();
        setPopups(data);
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
                {editingPopup ? 'Editar Popup' : 'Novo Popup'}
              </h2>
              <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                {editingPopup
                  ? 'Atualize os campos do popup'
                  : 'Configure um popup para exibir no site'}
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
            <div className={'grid [grid-template-columns:1fr_1fr] [gap:14px]'}>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="ppTitle"
                >
                  Título *
                </label>
                <input
                  id="ppTitle"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="Título do popup"
                  value={ppTitle}
                  onChange={(e) => setPpTitle(e.target.value)}
                  required
                />
              </div>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="ppLang"
                >
                  Idioma
                </label>
                <select
                  id="ppLang"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  value={ppLang}
                  onChange={(e) =>
                    setPpLang(e.target.value as 'PORTUGUESE' | 'ENGLISH')
                  }
                >
                  <option value="PORTUGUESE">Português</option>
                  <option value="ENGLISH">English</option>
                </select>
              </div>
            </div>
            <div className={'flex flex-col [gap:6px]'}>
              <label
                className={
                  '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                }
                htmlFor="ppDesc"
              >
                Descrição
              </label>
              <textarea
                id="ppDesc"
                className={`${'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'} ${'[resize:vertical] [min-height:88px] [line-height:1.6]'}`}
                placeholder="Mensagem exibida no popup..."
                value={ppDesc}
                onChange={(e) => setPpDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className={'grid [grid-template-columns:1fr_1fr] [gap:14px]'}>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="ppBtnText"
                >
                  Texto do botão
                </label>
                <input
                  id="ppBtnText"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="Ex: Saiba mais"
                  value={ppBtnText}
                  onChange={(e) => setPpBtnText(e.target.value)}
                />
              </div>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="ppRedirectUrl"
                >
                  URL de redirecionamento
                </label>
                <input
                  id="ppRedirectUrl"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="https://..."
                  value={ppRedirectUrl}
                  onChange={(e) => setPpRedirectUrl(e.target.value)}
                />
              </div>
            </div>
            <div className={'grid [grid-template-columns:1fr_1fr] [gap:14px]'}>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="ppBtnText2"
                >
                  Texto do botão 2{' '}
                  <span
                    className={'[font-size:12px] font-normal [color:#9ca3af]'}
                  >
                    (opcional)
                  </span>
                </label>
                <input
                  id="ppBtnText2"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="Ex: Fechar"
                  value={ppBtnText2}
                  onChange={(e) => setPpBtnText2(e.target.value)}
                />
              </div>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="ppRedirectUrl2"
                >
                  URL do botão 2
                </label>
                <input
                  id="ppRedirectUrl2"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="https://..."
                  value={ppRedirectUrl2}
                  onChange={(e) => setPpRedirectUrl2(e.target.value)}
                />
              </div>
            </div>
            <div className={'flex flex-col [gap:6px]'}>
              <label
                className={
                  '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                }
                htmlFor="ppStyle"
              >
                Estilo visual
              </label>
              <div className={'flex items-center [gap:10px]'}>
                <div
                  className={
                    '[width:36px] [height:36px] [border-radius:8px] [border:1px_solid_#C5EDF8] shrink-0'
                  }
                  style={{
                    background: `linear-gradient(90deg, ${POPUP_STYLE_COLORS[ppStyle][0]} 50%, ${POPUP_STYLE_COLORS[ppStyle][1]} 50%)`,
                  }}
                />
                <select
                  id="ppStyle"
                  className={`${'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'} ${'flex-1'}`}
                  value={ppStyle}
                  onChange={(e) => setPpStyle(e.target.value as PopupStyle)}
                >
                  {(Object.keys(POPUP_STYLE_LABELS) as PopupStyle[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {POPUP_STYLE_LABELS[key]}
                      </option>
                    ),
                  )}
                </select>
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
                  : editingPopup
                    ? 'Atualizar popup'
                    : 'Salvar popup'}
              </button>
            </div>
          </form>
        </div>
      )}

      {popups.length > 0 ? (
        <div
          className={
            'grid [grid-template-columns:repeat(auto-fill,_minmax(300px,_1fr))] [gap:18px]'
          }
        >
          {popups.map((popup) => (
            <div
              key={popup.id}
              className={
                '[background:#ffffff] [border-radius:18px] [border:1px_solid_#C5EDF8] [padding:22px] flex flex-col [gap:10px] [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.05)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_8px_24px_rgba(84,_200,_232,_0.1)] hover:[transform:translateY(-2px)]'
              }
            >
              <div className={'flex items-center justify-between'}>
                <span
                  className={
                    '[font-size:14px] font-bold [color:#3783D1] [background:#EBF9FD] [border:1px_solid_#BAE8F6] [padding:3px_9px] [border-radius:6px] [letter-spacing:0.05em]'
                  }
                >
                  {LANG_LABEL[popup.language] ?? popup.language}
                </span>
                <span
                  className={`${'[font-size:14px] font-semibold [padding:3px_10px] [border-radius:999px]'} ${popup.isPublished ? '[background:#f0fdf4] [color:#16a34a] [border:1px_solid_#bbf7d0]' : '[background:#f0fcff] [color:#7c6fa0] [border:1px_solid_#BAE8F6]'}`}
                >
                  {popup.isPublished ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
              <h3
                className={
                  '[font-size:15px] font-bold [color:#1e1b2e] [margin:0]'
                }
              >
                {popup.title}
              </h3>
              {popup.style && (
                <div className={'flex items-center [gap:7px]'}>
                  <span
                    className={
                      '[width:22px] [height:14px] [border-radius:4px] [border:1px_solid_rgba(0,_0,_0,_0.08)] shrink-0 [display:inline-block]'
                    }
                    style={{
                      background: `linear-gradient(90deg, ${POPUP_STYLE_COLORS[popup.style]?.[0] ?? '#ccc'} 50%, ${POPUP_STYLE_COLORS[popup.style]?.[1] ?? '#fff'} 50%)`,
                    }}
                  />
                  <span
                    className={'[font-size:14px] font-semibold [color:#6b7280]'}
                  >
                    {POPUP_STYLE_LABELS[popup.style]}
                  </span>
                </div>
              )}
              {popup.description && (
                <p
                  className={
                    '[font-size:14px] [color:#6b7280] [margin:0] [line-height:1.6] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden flex-1'
                  }
                >
                  {popup.description}
                </p>
              )}
              {popup.buttonText && (
                <div
                  className={
                    'flex flex-col [gap:2px] [background:#f0fcff] [border:1px_solid_#C5EDF8] [border-radius:10px] [padding:8px_12px] [font-size:14px] font-semibold [color:#3783D1]'
                  }
                >
                  <span>{popup.buttonText}</span>
                  {popup.redirectUrl && (
                    <span
                      className={
                        '[font-size:14px] [color:#9ca3af] whitespace-nowrap overflow-hidden [text-overflow:ellipsis]'
                      }
                    >
                      {popup.redirectUrl}
                    </span>
                  )}
                </div>
              )}
              {popup.buttonText2 && (
                <div
                  className={
                    'flex flex-col [gap:2px] [background:#f0fcff] [border:1px_solid_#C5EDF8] [border-radius:10px] [padding:8px_12px] [font-size:14px] font-semibold [color:#3783D1]'
                  }
                >
                  <span>{popup.buttonText2}</span>
                  {popup.redirectUrl2 && (
                    <span
                      className={
                        '[font-size:14px] [color:#9ca3af] whitespace-nowrap overflow-hidden [text-overflow:ellipsis]'
                      }
                    >
                      {popup.redirectUrl2}
                    </span>
                  )}
                </div>
              )}
              <div
                className={
                  'flex justify-end [padding-top:10px] [border-top:1px_solid_#EBF9FD]'
                }
              >
                <div className={'flex items-center [gap:6px]'}>
                  {!popup.isPublished && (
                    <button
                      className={
                        '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#64748b] cursor-pointer flex items-center justify-center [font-family:inherit] [padding:0] hover:[background:#eff6ff] hover:[color:#2563eb] hover:[border-color:#bfdbfe]'
                      }
                      onClick={() => openPopupForm(popup)}
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
                    className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${popup.isPublished ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                    onClick={() => handleTogglePublish(popup)}
                  >
                    {popup.isPublished ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    className={
                      '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#64748b] cursor-pointer flex items-center justify-center [font-family:inherit] [padding:0] hover:[background:#fef2f2] hover:[color:#dc2626] hover:[border-color:#fecaca]'
                    }
                    onClick={() => handleDelete(popup)}
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
            label="Nenhum popup cadastrado"
            sub="Adicione popups para exibir no site"
            onAdd={() => setShowForm(true)}
            btnLabel="+ Novo Popup"
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
