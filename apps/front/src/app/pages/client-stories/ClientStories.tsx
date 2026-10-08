import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listClientStories,
  createClientStory,
  publishClientStory,
  unpublishClientStory,
  ClientStoryDTO,
} from '../../services/client-stories.service';
import { uploadImage } from '../../services/images.service';

export function ClientStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<ClientStoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [longTitle, setLongTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'PORTUGUESE' | 'ENGLISH'>(
    'PORTUGUESE',
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    setLoading(true);
    try {
      const data = await listClientStories();
      setStories(data);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Erro ao carregar histórias.',
      );
    } finally {
      setLoading(false);
    }
  }

  function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const prev = imagePreview;
    if (prev) URL.revokeObjectURL(prev);
    setImagePreview(URL.createObjectURL(file));
  }

  function resetForm() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview('');
    setShortTitle('');
    setLongTitle('');
    setDescription('');
    setLanguage('PORTUGUESE');
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      setError('Selecione uma imagem para a história.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      const imageName = imageFile.name.replace(/\.[^.]+$/, '');
      const uploaded = await uploadImage(imageFile, imageName, [
        'client-story',
      ]);
      await createClientStory({
        imageId: uploaded.id,
        shortTitle,
        longTitle,
        description,
        language,
      });
      setSuccess('História salva com sucesso!');
      setTimeout(() => setSuccess(''), 3500);
      closeForm();
      loadStories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar história.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle(story: ClientStoryDTO) {
    try {
      if (story.isPublished) {
        await unpublishClientStory(story.id);
      } else {
        await publishClientStory(story.id);
      }
      loadStories();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Erro ao alterar publicação.',
      );
    }
  }

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
          onClick={() => {
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          + Nova História
        </button>
      </div>

      <div
        className={
          'flex-1 [padding:36px_40px] [max-width:1060px] w-full [margin:0_auto] [box-sizing:border-box]'
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
              Histórias de Clientes
            </h1>
            <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
              Gerencie as histórias de sucesso exibidas no site
            </p>
          </div>
          {stories.length > 0 && (
            <span
              className={
                '[background:#C5EDF8] [color:#3783D1] [font-size:14px] font-semibold [padding:4px_12px] [border-radius:999px] whitespace-nowrap'
              }
            >
              {stories.length} história{stories.length > 1 ? 's' : ''}
            </span>
          )}
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

        {showForm && (
          <div
            className={
              '[background:#ffffff] [border-radius:20px] [border:1px_solid_#C5EDF8] [box-shadow:0_4px_24px_rgba(84,_200,_232,_0.08)] [padding:28px_32px] [margin-bottom:32px]'
            }
          >
            <div
              className={
                'flex items-start justify-between [margin-bottom:24px]'
              }
            >
              <div>
                <h2
                  className={
                    '[font-size:17px] font-bold [color:#1e1b2e] [margin:0_0_4px]'
                  }
                >
                  Nova História
                </h2>
                <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                  Preencha os campos para criar uma nova história
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

            <form className={'flex flex-col'} onSubmit={handleSubmit}>
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
                  'grid [grid-template-columns:230px_1fr] [gap:28px] [margin-bottom:24px] max-[680px]:[grid-template-columns:1fr]'
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
                    className={`${'[aspect-ratio:4_/_3] [border:2px_dashed_#A0BEE8] [border-radius:16px] [background:#f0fcff] flex items-center justify-center cursor-pointer overflow-hidden [transition:border-color_0.2s,_background_0.2s] hover:[border-color:#3783D1] hover:[background:#EBF9FD]'} ${imagePreview ? '[border-style:solid] [border-color:#A0BEE8]' : ''}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className={'hidden'}
                      onChange={onImageChange}
                    />
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className={'w-full h-full object-cover'}
                      />
                    ) : (
                      <div
                        className={
                          'flex flex-col items-center [gap:8px] [padding:20px] text-center'
                        }
                      >
                        <div
                          className={
                            '[width:48px] [height:48px] [border-radius:14px] [background:#C5EDF8] flex items-center justify-center [color:#3783D1]'
                          }
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
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
                          PNG, JPG, WebP
                        </span>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      className={
                        'border-0 [background:none] [font-size:14px] font-semibold [color:#3783D1] cursor-pointer [padding:0] [font-family:inherit] [transition:color_0.15s] hover:[color:#2B6BB5]'
                      }
                      onClick={() => fileRef.current?.click()}
                    >
                      Trocar imagem
                    </button>
                  )}
                </div>

                <div className={'flex flex-col [gap:18px]'}>
                  <div className={'flex flex-col [gap:6px]'}>
                    <label
                      className={
                        '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                      }
                      htmlFor="shortTitle"
                    >
                      Título menor
                    </label>
                    <input
                      id="shortTitle"
                      type="text"
                      className={
                        'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                      }
                      placeholder="Ex: Caso de sucesso"
                      value={shortTitle}
                      onChange={(e) => setShortTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className={'flex flex-col [gap:6px]'}>
                    <label
                      className={
                        '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                      }
                      htmlFor="longTitle"
                    >
                      Título maior
                    </label>
                    <input
                      id="longTitle"
                      type="text"
                      className={
                        'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                      }
                      placeholder="Ex: Como aumentamos o engajamento em 3x"
                      value={longTitle}
                      onChange={(e) => setLongTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className={'flex flex-col [gap:6px]'}>
                    <label
                      className={
                        '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                      }
                      htmlFor="description"
                    >
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      className={`${'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'} ${'[resize:vertical] [min-height:108px] [line-height:1.6]'}`}
                      placeholder="Descreva a história do cliente..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={5}
                    />
                  </div>

                  <div className={'flex flex-col [gap:6px]'}>
                    <label
                      className={
                        '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                      }
                      htmlFor="language"
                    >
                      Idioma
                    </label>
                    <select
                      id="language"
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
              </div>

              <div
                className={
                  'flex justify-end [gap:12px] [padding-top:16px] [border-top:1px_solid_#EBF9FD]'
                }
              >
                <button
                  type="button"
                  className={
                    '[border:1px_solid_#BAE8F6] [background:#f0fcff] [color:#7c6fa0] [border-radius:10px] [padding:10px_22px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_border-color_0.15s] hover:[background:#EBF9FD] hover:[border-color:#A0BEE8] hover:[color:#3783D1]'
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
                  {saving ? 'Salvando...' : 'Salvar história'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div
            className={
              'flex flex-col items-center [gap:14px] [padding:80px_40px]'
            }
          >
            <div
              className={
                '[width:38px] [height:38px] [border:3px_solid_#C5EDF8] [border-top-color:#3783D1] [border-radius:50%] animate-spin'
              }
            />
            <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
              Carregando histórias...
            </p>
          </div>
        ) : stories.length > 0 ? (
          <div
            className={
              'grid [grid-template-columns:repeat(auto-fill,_minmax(300px,_1fr))] [gap:20px]'
            }
          >
            {stories.map((story) => (
              <div
                key={story.id}
                className={
                  '[background:#ffffff] [border-radius:18px] [border:1px_solid_#C5EDF8] overflow-hidden [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.05)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_8px_28px_rgba(84,_200,_232,_0.12)] hover:[transform:translateY(-2px)]'
                }
              >
                <div
                  className={
                    '[height:176px] overflow-hidden [background:#EBF9FD]'
                  }
                >
                  {story.imageUrl ? (
                    <img
                      src={story.imageUrl}
                      alt={story.longTitle}
                      className={'w-full h-full object-cover'}
                    />
                  ) : (
                    <div
                      className={
                        'w-full h-full flex items-center justify-center [color:#A0BEE8]'
                      }
                    >
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className={'[padding:18px_20px] flex flex-col [gap:6px]'}>
                  <span
                    className={
                      '[font-size:14px] font-bold [color:#3783D1] uppercase [letter-spacing:0.08em]'
                    }
                  >
                    {story.shortTitle}
                  </span>
                  <h3
                    className={
                      '[font-size:15px] font-bold [color:#1e1b2e] [margin:0] [line-height:1.35]'
                    }
                  >
                    {story.longTitle}
                  </h3>
                  <p
                    className={
                      '[font-size:14px] [color:#6b7280] [margin:0] [line-height:1.6] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden'
                    }
                  >
                    {story.description}
                  </p>

                  <div
                    className={
                      'flex items-center justify-between [margin-top:10px] [padding-top:14px] [border-top:1px_solid_#EBF9FD]'
                    }
                  >
                    <span
                      className={`${'[font-size:14px] font-semibold [padding:3px_10px] [border-radius:999px]'} ${story.isPublished ? '[background:#f0fdf4] [color:#16a34a] [border:1px_solid_#bbf7d0]' : '[background:#f0fcff] [color:#7c6fa0] [border:1px_solid_#BAE8F6]'}`}
                    >
                      {story.isPublished ? 'Publicado' : 'Rascunho'}
                    </span>
                    <button
                      className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${story.isPublished ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                      onClick={() => handlePublishToggle(story)}
                    >
                      {story.isPublished ? 'Despublicar' : 'Publicar'}
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
                Crie a primeira história de cliente para exibir no site
              </p>
              <button
                className={
                  '[margin-top:8px] [background:#3783D1] [color:#ffffff] border-0 [border-radius:10px] [padding:10px_24px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_transform_0.1s] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.3)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)]'
                }
                onClick={() => setShowForm(true)}
              >
                + Nova História
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default ClientStories;
