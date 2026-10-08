import { useState, useEffect, FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listHomeBlogLinks,
  createHomeBlogLink,
  toggleHomeBlogLink,
  deleteHomeBlogLink,
  HomeBlogLinkDTO,
} from '../../../services/home-blog-links.service';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmptyTabState } from '../EmptyTabState';

interface Props {
  openFormTrigger: number;
  onSuccess: (msg: string) => void;
  onCountChange: (count: number) => void;
}

export function BlogLinksTab({
  openFormTrigger,
  onSuccess,
  onCountChange,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [blUrl, setBlUrl] = useState('');
  const [blLabel, setBlLabel] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{
    label: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const queryClient = useQueryClient();
  const linksQuery = useQuery({
    queryKey: ['home-blog-links'],
    queryFn: ({ signal }) => listHomeBlogLinks(signal),
  });
  const blogLinks = linksQuery.data ?? [];
  const loading = linksQuery.isPending;
  useEffect(
    () => onCountChange(blogLinks.length),
    [blogLinks.length, onCountChange],
  );

  useEffect(() => {
    if (openFormTrigger > 0) {
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [openFormTrigger]);

  function resetForm() {
    setBlUrl('');
    setBlLabel('');
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createHomeBlogLink({ url: blUrl, label: blLabel || undefined });
      onSuccess('Link adicionado com sucesso!');
      setShowForm(false);
      resetForm();
      const data = await listHomeBlogLinks();
      queryClient.setQueryData(['home-blog-links'], data);
      onCountChange(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar link.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(link: HomeBlogLinkDTO) {
    try {
      await toggleHomeBlogLink(link.id);
      const data = await listHomeBlogLinks();
      queryClient.setQueryData(['home-blog-links'], data);
      onCountChange(data.length);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Erro ao alterar o link.',
      );
    }
  }

  function handleDelete(link: HomeBlogLinkDTO) {
    setPendingDelete({
      label: link.label || link.url,
      onConfirm: async () => {
        await deleteHomeBlogLink(link.id);
        const data = await listHomeBlogLinks();
        queryClient.setQueryData(['home-blog-links'], data);
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
                Novo Link do Blog
              </h2>
              <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                Adicione uma URL externa para destaque na home
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
            <div className={'flex flex-col [gap:6px]'}>
              <label
                className={
                  '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                }
                htmlFor="blUrl"
              >
                URL do artigo *
              </label>
              <input
                id="blUrl"
                type="url"
                className={
                  'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                }
                placeholder="https://blog.soir.com/..."
                value={blUrl}
                onChange={(e) => setBlUrl(e.target.value)}
                required
              />
            </div>
            <div className={'flex flex-col [gap:6px]'}>
              <label
                className={
                  '[font-size:14px] font-semibold [color:#374151] [letter-spacing:0.01em]'
                }
                htmlFor="blLabel"
              >
                Título (opcional)
              </label>
              <input
                id="blLabel"
                type="text"
                className={
                  'w-full [background:#f0fcff] [border:1px_solid_#BAE8F6] [border-radius:10px] [padding:11px_14px] [font-size:14px] [color:#1e1b2e] outline-none [transition:border-color_0.2s,_box-shadow_0.2s] [box-sizing:border-box] [font-family:inherit] [appearance:none] placeholder:[color:#6BA3E3] placeholder:font-normal focus:[border-color:#3783D1] focus:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus:[background:#ffffff]'
                }
                placeholder="Ex: Como a IA está transformando o setor..."
                value={blLabel}
                onChange={(e) => setBlLabel(e.target.value)}
              />
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
                {saving ? 'Salvando...' : 'Salvar link'}
              </button>
            </div>
          </form>
        </div>
      )}

      {blogLinks.length > 0 ? (
        <div className={'flex flex-col [gap:12px]'}>
          {blogLinks.map((link) => (
            <div
              key={link.id}
              className={
                '[background:#ffffff] [border-radius:16px] [border:1px_solid_#C5EDF8] [padding:18px_22px] flex flex-col [gap:8px] [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.05)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_6px_20px_rgba(84,_200,_232,_0.1)] hover:[transform:translateY(-1px)]'
              }
            >
              <div className={'flex items-center [gap:7px]'}>
                <span
                  className={`${'[width:7px] [height:7px] [border-radius:50%] shrink-0'} ${link.isActive ? '[background:#16a34a]' : '[background:#d1d5db]'}`}
                />
                <span
                  className={'[font-size:14px] font-semibold [color:#6b7280]'}
                >
                  {link.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {link.label && (
                <p
                  className={
                    '[font-size:14px] font-semibold [color:#1e1b2e] [margin:0]'
                  }
                >
                  {link.label}
                </p>
              )}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  '[font-size:14px] [color:#3783D1] [text-decoration:none] [word-break:break-all] [line-height:1.5] hover:[text-decoration:underline]'
                }
              >
                {link.url}
              </a>
              <div
                className={
                  'flex justify-end [padding-top:10px] [border-top:1px_solid_#EBF9FD]'
                }
              >
                
                <button
                  className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${'[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]'}`}
                  onClick={() => handleDelete(link)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <EmptyTabState
            label="Nenhum link cadastrado"
            sub="Adicione URLs de artigos para destaque na home"
            onAdd={() => setShowForm(true)}
            btnLabel="+ Novo Link"
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
