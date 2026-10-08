import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listBlogPosts,
  publishBlogPost,
  unpublishBlogPost,
  deleteBlogPost,
  BlogPostDTO,
} from '../../services/blog-posts.service';
import { AuthorsPanel } from './components/AuthorsPanel';
import { BlogPostForm } from './components/BlogPostForm';
import { Alert } from '../../components/ui/Alert';

const LANG_LABEL: Record<string, string> = { PORTUGUESE: 'PT', ENGLISH: 'EN' };

export function BlogPosts() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostDTO | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const postsQuery = useQuery({
    queryKey: ['blog-posts'],
    queryFn: ({ signal }) => listBlogPosts(undefined, signal),
  });
  const posts = postsQuery.data ?? [];
  const loading = postsQuery.isPending;

  async function refreshEditorial() {
    await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
  }

  function openForm(post?: BlogPostDTO) {
    setEditingPost(post ?? null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setShowForm(false);
    setError('');
    setEditingPost(null);
  }

  async function handlePublishToggle(post: BlogPostDTO) {
    try {
      if (post.isPublished) {
        await unpublishBlogPost(post.id);
      } else {
        await publishBlogPost(post.id);
      }
      await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Erro ao alterar publicação.',
      );
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
      await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Erro ao remover post.',
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

        {error && (
          <div className="mb-5">
            <Alert>{error}</Alert>
          </div>
        )}

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
          <BlogPostForm
            key={editingPost?.id ?? 'new-post'}
            item={editingPost}
            onClose={closeForm}
            onSaved={async (message) => {
              setSuccess(message);
              setTimeout(() => setSuccess(''), 3500);
              closeForm();
              await refreshEditorial();
            }}
          />
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
                      onError={(e) => undefined}
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

        <AuthorsPanel />
      </div>
    </div>
  );
}

export default BlogPosts;
