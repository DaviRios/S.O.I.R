import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  uploadImagesBatch,
  listImages,
  deleteImage,
  UploadedImage,
} from '../../services/images.service';

export function HomeLogos() {
  const navigate = useNavigate();
  const [logos, setLogos] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listImages(undefined, undefined, ['logo', 'home'])
      .then((results) =>
        setLogos(results.map((r) => ({ id: r.id, url: r.url, name: r.name }))),
      )
      .catch(() => setError('Erro ao carregar logos.'));
  }, []);

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith('image/'),
    );

    if (fileArray.length === 0) {
      setError('Selecione apenas arquivos de imagem (PNG, JPG, SVG, WebP).');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const names = fileArray.map((f) => f.name.replace(/\.[^.]+$/, ''));
      const uploaded = await uploadImagesBatch(fileArray, names, [
        'logo',
        'home',
      ]);
      setLogos((prev) => [...uploaded, ...prev]);
      setSuccess(
        `${uploaded.length} logo${uploaded.length > 1 ? 's' : ''} enviada${uploaded.length > 1 ? 's' : ''} com sucesso!`,
      );
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagens.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
  }

  async function confirmDelete() {
    if (!confirmingId) return;
    try {
      await deleteImage(confirmingId);
      setLogos((prev) => prev.filter((l) => l.id !== confirmingId));
    } catch {
      setError('Erro ao excluir logo.');
    } finally {
      setConfirmingId(null);
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
            '[background:#3783D1] [color:#ffffff] border-0 [border-radius:999px] [padding:9px_22px] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [transition:background_0.15s,_transform_0.1s,_box-shadow_0.15s] [box-shadow:0_2px_10px_rgba(84,_200,_232,_0.28)] hover:[background:#2B6BB5] hover:[transform:translateY(-1px)] hover:[box-shadow:0_4px_14px_rgba(84,_200,_232,_0.38)] disabled:[opacity:0.6] disabled:cursor-not-allowed'
          }
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          + Upload de Logos
        </button>
      </div>

      <div
        className={
          'flex-1 [padding:36px_40px] [max-width:1000px] w-full [margin:0_auto] [box-sizing:border-box]'
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
              Logos da Home
            </h1>
            <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
              Gerencie as logos de parceiros exibidas na página inicial
            </p>
          </div>
          {logos.length > 0 && (
            <span
              className={
                '[background:#C5EDF8] [color:#3783D1] [font-size:14px] font-semibold [padding:4px_12px] [border-radius:999px] whitespace-nowrap'
              }
            >
              {logos.length} logo{logos.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

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

        <div
          className={`${'[border:2px_dashed_#A0BEE8] [border-radius:20px] [background:#f0fcff] [padding:52px_40px] flex flex-col items-center justify-center text-center [gap:10px] cursor-pointer [transition:border-color_0.2s,_background_0.2s,_transform_0.15s] [margin-bottom:36px] hover:[border-color:#3783D1] hover:[background:#EBF9FD]'} ${isDragging ? '[border-color:#3783D1] [background:#EBF9FD] [transform:scale(1.01)] [box-shadow:0_0_0_4px_rgba(84,_200,_232,_0.1)]' : ''} ${uploading ? '[cursor:default] pointer-events-none' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className={'hidden'}
            onChange={onFileChange}
          />

          {uploading ? (
            <>
              <div
                className={
                  '[width:38px] [height:38px] [border:3px_solid_#C5EDF8] [border-top-color:#3783D1] [border-radius:50%] animate-spin [margin-bottom:8px]'
                }
              />
              <p
                className={
                  '[font-size:15px] font-semibold [color:#1e1b2e] [margin:0]'
                }
              >
                Enviando logos...
              </p>
              <p className={'[font-size:14px] [color:#6BA3E3] [margin:0]'}>
                Aguarde um momento
              </p>
            </>
          ) : (
            <>
              <div
                className={
                  '[width:60px] [height:60px] [border-radius:16px] [background:#C5EDF8] flex items-center justify-center [color:#3783D1] [margin-bottom:4px]'
                }
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p
                className={
                  '[font-size:15px] font-semibold [color:#1e1b2e] [margin:0]'
                }
              >
                {isDragging ? 'Solte as logos aqui' : 'Arraste logos aqui'}
              </p>
              <p className={'[font-size:14px] [color:#7c6fa0] [margin:0]'}>
                ou{' '}
                <span className={'[color:#3783D1] font-semibold'}>
                  clique para selecionar
                </span>
              </p>
              <p className={'[font-size:14px] [color:#6BA3E3] [margin:0]'}>
                PNG, JPG, SVG, WebP · Múltiplos arquivos
              </p>
            </>
          )}
        </div>

        {logos.length > 0 && (
          <section className={'mt-8'}>
            <h2
              className={
                '[font-size:14px] font-semibold [color:#9ca3af] uppercase [letter-spacing:0.07em] [margin:0_0_16px] flex items-center [gap:10px]'
              }
            >
              Logos enviadas
              <span
                className={
                  '[background:#C5EDF8] [color:#3783D1] [font-size:14px] font-bold [padding:2px_9px] [border-radius:999px] [text-transform:none] [letter-spacing:0]'
                }
              >
                {logos.length}
              </span>
            </h2>
            <div
              className={
                'grid [grid-template-columns:repeat(auto-fill,_minmax(140px,_1fr))] [gap:14px]'
              }
            >
              {logos.map((logo, idx) => (
                <div
                  key={logo.id || idx}
                  className={
                    '[background:#ffffff] [border-radius:16px] [border:1px_solid_#C5EDF8] overflow-hidden [box-shadow:0_1px_4px_rgba(84,_200,_232,_0.06)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_6px_20px_rgba(84,_200,_232,_0.12)] hover:[transform:translateY(-2px)]'
                  }
                >
                  <div
                    className={
                      '[height:96px] flex items-center justify-center [background:#f0fcff] [padding:14px]'
                    }
                  >
                    <img
                      src={logo.url}
                      alt={logo.name}
                      className={
                        '[max-width:100%] [max-height:64px] object-contain'
                      }
                    />
                  </div>
                  <div
                    className={
                      '[padding:8px_12px] flex items-center justify-between [gap:6px] [border-top:1px_solid_#EBF9FD]'
                    }
                  >
                    <p
                      className={
                        '[font-size:14px] font-medium [color:#4b5563] [margin:0] whitespace-nowrap overflow-hidden [text-overflow:ellipsis] flex-1'
                      }
                      title={logo.name}
                    >
                      {logo.name}
                    </p>
                    <button
                      className={
                        '[width:22px] [height:22px] [border-radius:7px] border-0 [background:transparent] [color:#9ca3af] flex items-center justify-center cursor-pointer shrink-0 [transition:background_0.15s,_color_0.15s] [padding:0] hover:[background:#fef2f2] hover:[color:#dc2626]'
                      }
                      onClick={() => setConfirmingId(logo.id)}
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
              ))}
            </div>
          </section>
        )}

        {logos.length === 0 && !uploading && (
          <div
            className={
              'flex flex-col items-center [gap:10px] [padding:60px_40px] text-center'
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p
              className={
                '[font-size:15.5px] font-semibold [color:#1e1b2e] [margin:0]'
              }
            >
              Nenhuma logo cadastrada
            </p>
            <p
              className={
                '[font-size:14px] [color:#7c6fa0] [margin:0] [max-width:300px] [line-height:1.6]'
              }
            >
              Faça upload das logos de parceiros para exibição na página inicial
            </p>
          </div>
        )}
      </div>

      {confirmingId && (
        <div
          className={
            'fixed [inset:0] [background:rgba(0,_0,_0,_0.45)] flex items-center justify-center [z-index:1000]'
          }
        >
          <div
            className={
              '[background:#fff] [border-radius:12px] [padding:28px_32px] [max-width:360px] [width:90%] [box-shadow:0_8px_32px_rgba(0,0,0,0.18)] flex flex-col [gap:20px]'
            }
          >
            <p
              className={
                '[font-size:1rem] [color:#1e293b] text-center [margin:0]'
              }
            >
              Excluir esta logo permanentemente?
            </p>
            <div className={'flex [gap:10px] justify-center'}>
              <button
                className={
                  '[padding:8px_20px] [border-radius:8px] [border:1px_solid_#e2e8f0] [background:#f8fafc] [color:#475569] [font-size:1rem] cursor-pointer [transition:background_0.15s] hover:[background:#f1f5f9]'
                }
                onClick={() => setConfirmingId(null)}
              >
                Cancelar
              </button>
              <button
                className={
                  '[padding:8px_20px] [border-radius:8px] border-0 [background:#dc2626] [color:#fff] [font-size:1rem] font-semibold cursor-pointer [transition:background_0.15s] hover:[background:#b91c1c]'
                }
                onClick={confirmDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeLogos;
