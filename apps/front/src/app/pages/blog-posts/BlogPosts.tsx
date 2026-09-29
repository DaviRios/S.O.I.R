import {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
  useRef,
  lazy,
  Suspense,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listBlogPosts,
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  deleteBlogPost,
  BlogPostDTO,
} from '../../services/blog-posts.service';
import {
  listAuthorsDropdown,
  createAuthor,
  listAuthors,
  AuthorDTO,
} from '../../services/authors.service';
import { uploadImage } from '../../services/images.service';

const RichTextEditor = lazy(() =>
  import('../../components/RichTextEditor/RichTextEditor').then((m) => ({
    default: m.RichTextEditor,
  })),
);

const LANG_LABEL: Record<string, string> = { PORTUGUESE: 'PT', ENGLISH: 'EN' };

export function BlogPosts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<BlogPostDTO[]>([]);
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [allAuthors, setAllAuthors] = useState<AuthorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [language, setLanguage] = useState<'PORTUGUESE' | 'ENGLISH'>(
    'PORTUGUESE',
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [savingAuthor, setSavingAuthor] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [postsData, authorsData] = await Promise.all([
        listBlogPosts(),
        listAuthors(),
      ]);
      console.log(
        '[BlogPosts] posts recebidos:',
        postsData.map((p) => ({
          id: p.id,
          title: p.title,
          imageUrl: p.imageUrl,
        })),
      );
      setPosts(postsData);
      setAllAuthors(authorsData);
    } catch {
      // keep empty on failure
    } finally {
      setLoading(false);
    }
  }

  async function loadAuthorsDropdown() {
    try {
      const data = await listAuthorsDropdown();
      setAuthors(data);
    } catch {
      // ignore
    }
  }

  function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  }

  function resetForm() {
    if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview('');
    setTitle('');
    setUrl('');
    setDescription('');
    setAuthorId('');
    setLanguage('PORTUGUESE');
    setError('');
    setEditingPost(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function openForm(post?: BlogPostDTO) {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setUrl(post.url);
      setDescription(post.description ?? '');
      setAuthorId(post.authorId ?? '');
      setLanguage(post.language);
      setImagePreview(post.imageUrl ?? '');
      setImageFile(null);
    }
    setShowForm(true);
    loadAuthorsDropdown();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!authorId) {
      setError('Selecione um autor para o post.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const imageName = imageFile.name.replace(/\.[^.]+$/, '');
        const uploaded = await uploadImage(imageFile, imageName, ['blog']);
        imageUrl = uploaded.url;
      } else if (imagePreview) {
        imageUrl = imagePreview;
      }
      const payload = { title, url, description, imageUrl, authorId, language };
      if (editingPost) {
        await updateBlogPost(editingPost.id, payload);
        setSuccess('Post atualizado com sucesso!');
      } else {
        await createBlogPost(payload);
        setSuccess('Post criado com sucesso!');
      }
      setTimeout(() => setSuccess(''), 3500);
      closeForm();
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar post.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle(post: BlogPostDTO) {
    try {
      if (post.isPublished) {
        await unpublishBlogPost(post.id);
      } else {
        await publishBlogPost(post.id);
      }
      loadAll();
    } catch {
      // silently fail
    }
  }

  async function handleDelete(post: BlogPostDTO) {
    if (confirmingId !== post.id) {
      setConfirmingId(post.id);
      return;
    }
    setConfirmingId(null);
    try {
      await deleteBlogPost(post.id);
      loadAll();
    } catch {
      // silently fail
    }
  }

  async function handleCreateAuthor(e: FormEvent) {
    e.preventDefault();
    if (!authorName.trim()) return;
    setSavingAuthor(true);
    try {
      await createAuthor({ name: authorName, bio: authorBio || undefined });
      setAuthorName('');
      setAuthorBio('');
      setShowAuthorForm(false);
      loadAll();
      loadAuthorsDropdown();
    } catch {
      // ignore
    } finally {
      setSavingAuthor(false);
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
          onClick={() => openForm()}
        >
          + Novo Post
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
              Blog e Notícias
            </h1>
            <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
              Gerencie os posts publicados no blog do site
            </p>
          </div>
          {posts.length > 0 && (
            <span
              className={
                '[background:#C5EDF8] [color:#3783D1] [font-size:14px] font-semibold [padding:4px_12px] [border-radius:999px] whitespace-nowrap'
              }
            >
              {posts.length} post{posts.length > 1 ? 's' : ''}
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
                  {editingPost ? 'Editar Rascunho' : 'Novo Post'}
                </h2>
                <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                  {editingPost
                    ? 'Atualize os campos do rascunho'
                    : 'Preencha os campos para criar um novo post'}
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
                  'grid [grid-template-columns:210px_1fr] [gap:28px] [margin-bottom:24px] max-[680px]:[grid-template-columns:1fr]'
                }
              >
                <div className={'flex flex-col [gap:8px]'}>
                  <label
                    className={
                      '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                    }
                  >
                    Imagem (opcional)
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
                            '[width:44px] [height:44px] [border-radius:12px] [background:#C5EDF8] flex items-center justify-center [color:#3783D1]'
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

                <div className={'flex flex-col [gap:16px]'}>
                  <div className={'flex flex-col [gap:6px]'}>
                    <label
                      className={
                        '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                      }
                      htmlFor="postTitle"
                    >
                      Título
                    </label>
                    <input
                      id="postTitle"
                      type="text"
                      className={
                        'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                      }
                      placeholder="Título do post"
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
                      htmlFor="postUrl"
                    >
                      URL (slug)
                    </label>
                    <input
                      id="postUrl"
                      type="text"
                      className={
                        'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                      }
                      placeholder="Ex: como-melhorar-seu-site"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div
                    className={
                      'grid [grid-template-columns:1fr_1fr] [gap:14px]'
                    }
                  >
                    <div className={'flex flex-col [gap:6px]'}>
                      <label
                        className={
                          '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                        }
                        htmlFor="postAuthor"
                      >
                        Autor
                      </label>
                      <select
                        id="postAuthor"
                        className={
                          'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                        }
                        value={authorId}
                        onChange={(e) => setAuthorId(e.target.value)}
                        required
                      >
                        <option value="">Selecione...</option>
                        {authors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={'flex flex-col [gap:6px]'}>
                      <label
                        className={
                          '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                        }
                        htmlFor="postLang"
                      >
                        Idioma
                      </label>
                      <select
                        id="postLang"
                        className={
                          'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                        }
                        value={language}
                        onChange={(e) =>
                          setLanguage(
                            e.target.value as 'PORTUGUESE' | 'ENGLISH',
                          )
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
                      Descrição
                    </label>
                    <Suspense fallback={null}>
                      <RichTextEditor
                        value={description}
                        onChange={setDescription}
                        placeholder="Resumo do post..."
                        minHeight={140}
                      />
                    </Suspense>
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
                  {saving
                    ? 'Salvando...'
                    : editingPost
                      ? 'Atualizar post'
                      : 'Salvar post'}
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
              Carregando posts...
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div
            className={
              'grid [grid-template-columns:repeat(auto-fill,_minmax(300px,_1fr))] [gap:20px] [margin-bottom:48px]'
            }
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className={
                  '[background:#ffffff] [border-radius:18px] [border:1px_solid_#C5EDF8] overflow-hidden [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.05)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_8px_28px_rgba(84,_200,_232,_0.12)] hover:[transform:translateY(-2px)]'
                }
              >
                <div
                  className={
                    '[height:160px] overflow-hidden [background:#EBF9FD] relative'
                  }
                >
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className={'w-full h-full object-cover'}
                      onError={(e) =>
                        console.error('[BlogPosts] falhou ao carregar imagem', {
                          id: post.id,
                          imageUrl: post.imageUrl,
                          error: e.type,
                        })
                      }
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
                  <span
                    className={
                      'absolute [top:10px] [right:10px] [background:rgba(84,_200,_232,_0.85)] [color:#ffffff] [font-size:14px] font-bold [padding:3px_8px] [border-radius:6px] [letter-spacing:0.05em]'
                    }
                  >
                    {LANG_LABEL[post.language] ?? post.language}
                  </span>
                </div>
                <div className={'[padding:16px_18px] flex flex-col [gap:6px]'}>
                  <h3
                    className={
                      '[font-size:15px] font-bold [color:#1e1b2e] [margin:0] [line-height:1.35]'
                    }
                  >
                    {post.title}
                  </h3>
                  {post.description && (
                    <p
                      className={
                        '[font-size:14px] [color:#6b7280] [margin:0] [line-height:1.6] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden'
                      }
                    >
                      {post.description.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                  {post.authorName && (
                    <p
                      className={
                        'flex items-center [gap:5px] [font-size:14px] [color:#9ca3af] [margin:0]'
                      }
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {post.authorName}
                    </p>
                  )}
                  <div
                    className={
                      'flex items-center justify-between [margin-top:8px] [padding-top:12px] [border-top:1px_solid_#EBF9FD]'
                    }
                  >
                    <span
                      className={`${'[font-size:14px] font-semibold [padding:3px_10px] [border-radius:999px]'} ${post.isPublished ? '[background:#f0fdf4] [color:#16a34a] [border:1px_solid_#bbf7d0]' : '[background:#f0fcff] [color:#7c6fa0] [border:1px_solid_#BAE8F6]'}`}
                    >
                      {post.isPublished ? 'Publicado' : 'Rascunho'}
                    </span>
                    <div className={'flex items-center [gap:6px]'}>
                      {!post.isPublished && (
                        <button
                          className={
                            '[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#C5EDF8] [background:#f0fcff] [color:#9ca3af] flex items-center justify-center cursor-pointer [transition:background_0.15s,_color_0.15s] [padding:0] hover:[background:#eff6ff] hover:[color:#2563eb] hover:[border-color:#bfdbfe]'
                          }
                          onClick={() => openForm(post)}
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
                        className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${post.isPublished ? '[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]' : '[color:#3783D1] [background:#EBF9FD] hover:[background:#C5EDF8]'}`}
                        onClick={() => handlePublishToggle(post)}
                      >
                        {post.isPublished ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button
                        className={`${'[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_#C5EDF8] [background:#f0fcff] [color:#9ca3af] flex items-center justify-center cursor-pointer [transition:background_0.15s,_color_0.15s] [padding:0] hover:[background:#fef2f2] hover:[color:#dc2626] hover:[border-color:#fecaca]'} ${confirmingId === post.id ? '[width:auto] [padding:0_10px] [font-size:14px] font-semibold [background:#fef2f2] [color:#dc2626] [border-color:#fecaca] hover:[background:#fee2e2]' : ''}`}
                        onClick={() => handleDelete(post)}
                        title={
                          confirmingId === post.id
                            ? 'Clique para confirmar'
                            : 'Remover'
                        }
                      >
                        {confirmingId === post.id ? (
                          'Confirmar?'
                        ) : (
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
                        )}
                      </button>
                    </div>
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
                </svg>
              </div>
              <p
                className={
                  '[font-size:15.5px] font-semibold [color:#1e1b2e] [margin:0]'
                }
              >
                Nenhum post cadastrado
              </p>
              <p
                className={
                  '[font-size:14px] [color:#7c6fa0] [margin:0] [max-width:300px] [line-height:1.6]'
                }
              >
                Crie o primeiro post para publicar no blog
              </p>
              <button
                className={
                  '[margin-top:8px] [background:#3783D1] [color:#ffffff] border-0 [border-radius:10px] [padding:10px_24px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_transform_0.1s] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.3)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)]'
                }
                onClick={() => openForm()}
              >
                + Novo Post
              </button>
            </div>
          )
        )}

        {/* Authors section */}
        <div
          className={
            '[margin-top:12px] [background:#ffffff] [border-radius:20px] [border:1px_solid_#C5EDF8] [box-shadow:0_2px_12px_rgba(84,_200,_232,_0.06)] [padding:24px_28px]'
          }
        >
          <div
            className={'flex items-start justify-between [margin-bottom:20px]'}
          >
            <div>
              <h2
                className={
                  '[font-size:16px] font-bold [color:#1e1b2e] [margin:0_0_3px]'
                }
              >
                Autores
              </h2>
              <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                Gerencie os autores dos posts
              </p>
            </div>
            <button
              className={
                '[border:1px_solid_#BAE8F6] [background:#f0fcff] [color:#3783D1] [border-radius:10px] [padding:8px_18px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_border-color_0.15s] hover:[background:#EBF9FD] hover:[border-color:#A0BEE8]'
              }
              onClick={() => setShowAuthorForm(!showAuthorForm)}
            >
              {showAuthorForm ? 'Cancelar' : '+ Novo Autor'}
            </button>
          </div>

          {showAuthorForm && (
            <form
              className={
                '[background:#f0fcff] [border:1px_solid_#C5EDF8] [border-radius:14px] [padding:20px] [margin-bottom:20px]'
              }
              onSubmit={handleCreateAuthor}
            >
              <div
                className={
                  'grid [grid-template-columns:1fr_1fr] [gap:14px] [margin-bottom:16px] max-[600px]:[grid-template-columns:1fr]'
                }
              >
                <div className={'flex flex-col [gap:6px]'}>
                  <label
                    className={
                      '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                    }
                    htmlFor="authorName"
                  >
                    Nome
                  </label>
                  <input
                    id="authorName"
                    type="text"
                    className={
                      'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                    }
                    placeholder="Nome do autor"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                  />
                </div>
                <div className={'flex flex-col [gap:6px]'}>
                  <label
                    className={
                      '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                    }
                    htmlFor="authorBio"
                  >
                    Bio (opcional)
                  </label>
                  <input
                    id="authorBio"
                    type="text"
                    className={
                      'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                    }
                    placeholder="Breve descrição do autor"
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                  />
                </div>
              </div>
              <div className={'flex justify-end'}>
                <button
                  type="submit"
                  className={
                    '[background:#3783D1] [color:#ffffff] border-0 [border-radius:10px] [padding:10px_24px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] flex items-center [gap:8px] [transition:background_0.15s,_transform_0.1s] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.3)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)] disabled:[opacity:0.7] disabled:cursor-not-allowed'
                  }
                  disabled={savingAuthor}
                >
                  {savingAuthor && (
                    <span
                      className={
                        '[width:14px] [height:14px] [border:2px_solid_rgba(255,_255,_255,_0.3)] [border-top-color:#fff] [border-radius:50%] animate-spin shrink-0'
                      }
                    />
                  )}
                  {savingAuthor ? 'Salvando...' : 'Criar autor'}
                </button>
              </div>
            </form>
          )}

          {allAuthors.length > 0 ? (
            <div className={'flex [flex-wrap:wrap] [gap:10px]'}>
              {allAuthors.map((author) => (
                <div
                  key={author.id}
                  className={
                    'flex items-center [gap:10px] [background:#f0fcff] [border:1px_solid_#C5EDF8] [border-radius:12px] [padding:10px_14px] [min-width:160px]'
                  }
                >
                  <div
                    className={
                      '[width:34px] [height:34px] [border-radius:50%] [background:linear-gradient(135deg,_#3783D1,_#6BA3E3)] [color:#ffffff] [font-size:14px] font-bold flex items-center justify-center shrink-0'
                    }
                  >
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={'flex flex-col [gap:2px] [min-width:0]'}>
                    <span
                      className={
                        '[font-size:14px] font-semibold [color:#1e1b2e] whitespace-nowrap overflow-hidden [text-overflow:ellipsis]'
                      }
                    >
                      {author.name}
                    </span>
                    {author.bio && (
                      <span
                        className={
                          '[font-size:14px] [color:#9ca3af] whitespace-nowrap overflow-hidden [text-overflow:ellipsis]'
                        }
                      >
                        {author.bio}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              className={
                '[font-size:14px] [color:#9ca3af] [margin:0] [padding:8px_0]'
              }
            >
              Nenhum autor cadastrado ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogPosts;
