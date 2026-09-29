import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import {
  listCases,
  createCase,
  updateCase,
  deleteCase,
  addCaseImages,
  toggleCase,
  publishCase,
  unpublishCase,
  caseImageUrl,
  CaseContentDTO,
} from '../../../services/cases.service';
import { uploadImage } from '../../../services/images.service';
import { RichTextEditor } from '../../../components/RichTextEditor/RichTextEditor';

interface Props {
  openFormTrigger: number;
  onSuccess: (msg: string) => void;
  onCountChange: (count: number) => void;
}

export function CasesTab({ openFormTrigger, onSuccess, onCountChange }: Props) {
  const [cases, setCases] = useState<CaseContentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingCase, setEditingCase] = useState<CaseContentDTO | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [content, setContent] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [tag, setTag] = useState('');
  const [language, setLanguage] = useState<'PORTUGUESE' | 'ENGLISH'>(
    'PORTUGUESE',
  );
  const [caseImages, setCaseImages] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);
  const [caseImagePreviews, setCaseImagePreviews] = useState<(string | null)[]>(
    [null, null, null],
  );
  const [pendingDelete, setPendingDelete] = useState<{
    label: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const caseImgRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (openFormTrigger > 0) openCaseForm();
  }, [openFormTrigger]);

  async function load() {
    setLoading(true);
    try {
      const data = await listCases();
      setCases(data);
      onCountChange(data.length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function openCaseForm(c?: CaseContentDTO) {
    if (c) {
      setEditingCase(c);
      setTitle(c.title ?? '');
      setSubtitle(c.subtitle ?? '');
      setShortTitle(c.shortTitle ?? '');
      setContent(c.content ?? '');
      setIndustry(c.industry ?? '');
      setCountry(c.country ?? '');
      setTag(c.tag ?? '');
      setLanguage(c.language ?? 'PORTUGUESE');
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setTitle('');
    setSubtitle('');
    setShortTitle('');
    setContent('');
    setIndustry('');
    setCountry('');
    setTag('');
    setLanguage('PORTUGUESE');
    caseImagePreviews.forEach((p) => {
      if (p) URL.revokeObjectURL(p);
    });
    setCaseImages([null, null, null]);
    setCaseImagePreviews([null, null, null]);
    setEditingCase(null);
    setError('');
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  function onCaseImageChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const prev = caseImagePreviews[index];
    if (prev) URL.revokeObjectURL(prev);
    const preview = URL.createObjectURL(file);
    setCaseImages((imgs) => imgs.map((f, i) => (i === index ? file : f)));
    setCaseImagePreviews((ps) => ps.map((p, i) => (i === index ? preview : p)));
  }

  function removeCaseImage(index: number) {
    const prev = caseImagePreviews[index];
    if (prev) URL.revokeObjectURL(prev);
    setCaseImages((imgs) => imgs.map((f, i) => (i === index ? null : f)));
    setCaseImagePreviews((ps) => ps.map((p, i) => (i === index ? null : p)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingCase) {
        await updateCase(editingCase.id, {
          title: title || undefined,
          subtitle: subtitle || undefined,
          shortTitle: shortTitle || undefined,
          content: content || undefined,
          industry: industry || undefined,
          country: country || undefined,
          tag: tag || undefined,
        });
        onSuccess('Caso atualizado com sucesso!');
      } else {
        const caseId = await createCase({
          title,
          subtitle: subtitle || undefined,
          shortTitle: shortTitle || undefined,
          content: content || undefined,
          industry: industry || undefined,
          country: country || undefined,
          tag: tag || undefined,
          language,
        });
        const filesToUpload = caseImages.filter((f): f is File => f !== null);
        if (filesToUpload.length > 0 && caseId) {
          const uploaded = await Promise.all(
            filesToUpload.map((file) =>
              uploadImage(file, file.name.replace(/\.[^.]+$/, ''), ['case']),
            ),
          );
          await addCaseImages(
            caseId,
            uploaded.map((u) => u.id),
          );
        }
        onSuccess('Caso criado com sucesso!');
      }
      closeForm();
      const data = await listCases();
      setCases(data);
      onCountChange(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar caso.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(c: CaseContentDTO) {
    try {
      await toggleCase(c.id);
      const data = await listCases();
      setCases(data);
      onCountChange(data.length);
    } catch {
      /* ignore */
    }
  }

  async function handleTogglePublish(c: CaseContentDTO) {
    try {
      if (c.isPublished) await unpublishCase(c.id);
      else await publishCase(c.id);
      const data = await listCases();
      setCases(data);
      onCountChange(data.length);
    } catch {
      /* ignore */
    }
  }

  function handleDelete(c: CaseContentDTO) {
    setPendingDelete({
      label: c.title,
      onConfirm: async () => {
        await deleteCase(c.id);
        const data = await listCases();
        setCases(data);
        onCountChange(data.length);
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
                {editingCase ? 'Editar Caso' : 'Novo Caso'}
              </h2>
              <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                {editingCase
                  ? 'Atualize os campos do caso'
                  : 'Preencha os campos para criar um novo caso de sucesso'}
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
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
            <div
              className={
                'grid [grid-template-columns:repeat(auto-fit,_minmax(200px,_1fr))] [gap:16px]'
              }
            >
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="caseTitle"
                >
                  Título *
                </label>
                <input
                  id="caseTitle"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="Título principal do caso"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="caseShortTitle"
                >
                  Título curto
                </label>
                <input
                  id="caseShortTitle"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="Versão resumida"
                  value={shortTitle}
                  onChange={(e) => setShortTitle(e.target.value)}
                />
              </div>
            </div>
            <div className={'flex flex-col [gap:6px]'}>
              <label
                className={
                  '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                }
                htmlFor="caseSubtitle"
              >
                Subtítulo
              </label>
              <input
                id="caseSubtitle"
                type="text"
                className={
                  'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                }
                placeholder="Subtítulo descritivo"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
            <div
              className={
                'grid [grid-template-columns:repeat(auto-fit,_minmax(200px,_1fr))] [gap:16px]'
              }
            >
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="caseIndustry"
                >
                  Setor / Indústria
                </label>
                <input
                  id="caseIndustry"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="Ex: Fintech, Saúde, Varejo"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="caseCountry"
                >
                  País
                </label>
                <input
                  id="caseCountry"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="Ex: Brasil"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="caseTag"
                >
                  Tag
                </label>
                <input
                  id="caseTag"
                  type="text"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  placeholder="Ex: Transformação Digital"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                />
              </div>
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                  htmlFor="caseLang"
                >
                  Idioma
                </label>
                <select
                  id="caseLang"
                  className={
                    'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                  }
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as 'PORTUGUESE' | 'ENGLISH')
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
              >
                Conteúdo
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Descreva o caso de sucesso em detalhes..."
                minHeight={200}
              />
            </div>
            {!editingCase && (
              <div className={'flex flex-col [gap:6px]'}>
                <label
                  className={
                    '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                  }
                >
                  Imagens do case{' '}
                  <span
                    className={'font-normal [color:#9ca3af] [font-size:14px]'}
                  >
                    (até 3)
                  </span>
                </label>
                <div className={'flex [gap:12px]'}>
                  {([0, 1, 2] as const).map((idx) => (
                    <div
                      key={idx}
                      className={'[width:110px] [height:110px] shrink-0'}
                    >
                      <input
                        ref={caseImgRefs[idx]}
                        type="file"
                        accept="image/*"
                        className={'hidden'}
                        onChange={(e) => onCaseImageChange(idx, e)}
                      />
                      {caseImagePreviews[idx] ? (
                        <div
                          className={
                            'relative w-full h-full [border-radius:12px] overflow-hidden [border:1px_solid_#C5EDF8]'
                          }
                        >
                          <img
                            src={caseImagePreviews[idx]!}
                            alt={`Imagem ${idx + 1}`}
                            className={'w-full h-full object-cover'}
                          />
                          <button
                            type="button"
                            className={
                              'absolute [top:5px] [right:5px] [width:22px] [height:22px] [border-radius:6px] border-0 [background:rgba(0,_0,_0,_0.55)] [color:#fff] flex items-center justify-center cursor-pointer [transition:background_0.15s] hover:[background:rgba(220,_38,_38,_0.85)]'
                            }
                            onClick={() => removeCaseImage(idx)}
                            title="Remover"
                          >
                            <svg
                              width="12"
                              height="12"
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
                      ) : (
                        <button
                          type="button"
                          className={
                            'w-full h-full [border:2px_dashed_#A0BEE8] [border-radius:12px] [background:#f0fcff] flex flex-col items-center justify-center [gap:6px] cursor-pointer [color:#6BA3E3] [font-size:14px] font-semibold [font-family:inherit] [transition:border-color_0.2s,_background_0.2s,_color_0.2s] hover:[border-color:#3783D1] hover:[background:#EBF9FD] hover:[color:#3783D1]'
                          }
                          onClick={() => caseImgRefs[idx].current?.click()}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>{idx + 1}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  : editingCase
                    ? 'Atualizar caso'
                    : 'Salvar caso'}
              </button>
            </div>
          </form>
        </div>
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
