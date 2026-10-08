import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listImages,
  uploadImage,
  deleteImage,
  UploadedImage,
} from '../../../services/images.service';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmptyTabState } from '../EmptyTabState';

interface Props {
  openFormTrigger: number;
  onSuccess: (msg: string) => void;
  onCountChange: (count: number) => void;
}

export function LogosTab({ openFormTrigger, onSuccess, onCountChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{
    label: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const logosQuery = useQuery({
    queryKey: ['home-logos'],
    queryFn: ({ signal }) =>
      listImages(undefined, undefined, ['logo', 'home'], signal),
    select: (items) => items.map(({ id, url, name }) => ({ id, url, name })),
  });
  const logos = logosQuery.data ?? [];
  const loading = logosQuery.isPending;
  useEffect(() => onCountChange(logos.length), [logos.length, onCountChange]);

  useEffect(() => {
    if (openFormTrigger > 0) fileInputRef.current?.click();
  }, [openFormTrigger]);

  async function handleUpload(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of fileArray) {
        const name = file.name.replace(/\.[^.]+$/, '');
        await uploadImage(file, name, ['logo', 'home']);
      }
      const results = await listImages(undefined, undefined, ['logo', 'home']);
      const mapped = results.map((r) => ({
        id: r.id,
        url: r.url,
        name: r.name,
      }));
      queryClient.setQueryData(['home-logos'], mapped);
      onCountChange(mapped.length);
      onSuccess(
        `${fileArray.length > 1 ? fileArray.length + ' logos adicionadas' : 'Logo adicionada'} com sucesso!`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload.');
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(logo: UploadedImage) {
    setPendingDelete({
      label: logo.name,
      onConfirm: async () => {
        await deleteImage(logo.id);
        queryClient.setQueryData<UploadedImage[]>(
          ['home-logos'],
          (prev = []) => {
            const next = prev.filter((l) => l.id !== logo.id);
            onCountChange(next.length);
            return next;
          },
        );
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={'hidden'}
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />
      {error && (
        <div
          className={`${'flex items-center [gap:8px] [border-radius:10px] [padding:12px_16px] [font-size:14px] font-medium [margin-bottom:20px]'} ${'[background:#fef2f2] [border:1px_solid_#fecaca] [color:#dc2626]'}`}
        >
          {error}
        </div>
      )}
      <div
        className={`${'[border:2px_dashed_#A0BEE8] [border-radius:14px] [background:#f0fcff] flex items-center justify-center [gap:10px] [padding:20px_32px] cursor-pointer [transition:border-color_0.2s,_background_0.2s,_color_0.2s] [margin-bottom:24px] [color:#6BA3E3] [font-size:14px] font-medium hover:[border-color:#3783D1] hover:[background:#EBF9FD] hover:[color:#3783D1]'} ${isDragging ? '[border-color:#3783D1] [background:#EBF9FD] [color:#3783D1]' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <>
            <span
              className={
                '[width:14px] [height:14px] [border:2px_solid_rgba(255,_255,_255,_0.3)] [border-top-color:#fff] [border-radius:50%] animate-spin shrink-0'
              }
            />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>
              {isDragging
                ? 'Solte as imagens aqui'
                : 'Arraste imagens ou clique para adicionar'}
            </span>
          </>
        )}
      </div>
      {logos.length > 0 ? (
        <div
          className={
            'grid [grid-template-columns:repeat(auto-fill,_minmax(250px,_1fr))] [gap:14px]'
          }
        >
          {logos.map((logo) => (
            <div
              key={logo.id}
              className={
                '[background:#ffffff] [border-radius:18px] [border:1px_solid_#C5EDF8] [padding:22px] flex flex-col [gap:12px] [box-shadow:0_2px_8px_rgba(84,_200,_232,_0.05)] [transition:box-shadow_0.2s,_transform_0.15s] hover:[box-shadow:0_6px_20px_rgba(84,_200,_232,_0.12)] hover:[transform:translateY(-2px)]'
              }
            >
              <div
                className={
                  '[height:88px] flex items-center justify-center [background:#f0fcff] [padding:12px]'
                }
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className={
                    '[max-width:100%] [max-height:60px] object-contain'
                  }
                />
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
                  {logo.name}
                </p>
                <button
                  className={`${'border-0 [background:none] [font-size:14px] font-semibold cursor-pointer [font-family:inherit] [padding:5px_12px] [border-radius:8px] [transition:background_0.15s]'} ${'[color:#dc2626] [background:#fef2f2] hover:[background:#fee2e2]'}`}
                  onClick={() => handleDelete(logo)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !uploading && (
          <EmptyTabState
            label="Nenhuma logo cadastrada"
            sub="Adicione logos de parceiros exibidas na página inicial"
            onAdd={() => fileInputRef.current?.click()}
            btnLabel="+ Adicionar Logo"
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
