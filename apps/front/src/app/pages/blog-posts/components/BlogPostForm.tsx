import { lazy, Suspense, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { createBlogPostSchema } from '@soir/contracts';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import {
  createBlogPost,
  type BlogPostDTO,
  updateBlogPost,
} from '../../../services/blog-posts.service';
import { listAuthorsDropdown } from '../../../services/authors.service';
import { uploadImage } from '../../../services/images.service';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { zodResolver } from '../../../lib/zod-resolver';

const RichTextEditor = lazy(() =>
  import('../../../components/RichTextEditor/RichTextEditor').then(
    (module) => ({ default: module.RichTextEditor }),
  ),
);

type BlogPostFormValues = z.infer<typeof createBlogPostSchema>;

interface BlogPostFormProps {
  item: BlogPostDTO | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}

const inputClass =
  'w-full rounded-xl border border-sky-200 bg-sky-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-blue-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';
const labelClass = 'flex flex-col gap-1.5 text-sm font-semibold text-slate-700';

export function BlogPostForm({ item, onClose, onSaved }: BlogPostFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(item?.imageUrl ?? '');
  const [error, setError] = useState('');
  const authorsQuery = useQuery({
    queryKey: ['authors', 'dropdown'],
    queryFn: ({ signal }) => listAuthorsDropdown(signal),
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(createBlogPostSchema),
    defaultValues: {
      title: item?.title ?? '',
      url: item?.url ?? '',
      description: item?.description ?? '',
      authorId: item?.authorId ?? '',
      imageUrl: item?.imageUrl ?? '',
      language: item?.language ?? 'PORTUGUESE',
    },
  });

  function changeImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function submit(values: BlogPostFormValues) {
    setError('');
    try {
      let imageUrl = values.imageUrl;
      if (imageFile) {
        const uploaded = await uploadImage(
          imageFile,
          imageFile.name.replace(/\.[^.]+$/, ''),
          ['blog'],
        );
        imageUrl = uploaded.url;
      }
      const payload = { ...values, imageUrl };
      if (item) {
        await updateBlogPost(item.id, payload);
        await onSaved('Post atualizado com sucesso!');
      } else {
        await createBlogPost(payload);
        await onSaved('Post criado com sucesso!');
      }
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Erro ao salvar post.',
      );
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-sky-100 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="m-0 text-lg font-bold text-slate-900">
            {item ? 'Editar Post' : 'Novo Post'}
          </h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            {item
              ? 'Atualize os dados do post'
              : 'Preencha os campos para criar um novo post'}
          </p>
        </div>
        <Button variant="secondary" className="px-3" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(submit)}>
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Título *
            <input
              className={inputClass}
              placeholder="Título do post"
              {...register('title')}
            />
            {errors.title?.message && (
              <span className="text-xs font-normal text-red-600">
                {errors.title.message}
              </span>
            )}
          </label>
          <label className={labelClass}>
            URL *
            <input
              className={inputClass}
              placeholder="slug-do-post"
              {...register('url')}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Autor *
            <select className={inputClass} {...register('authorId')}>
              <option value="">Selecione um autor</option>
              {(authorsQuery.data ?? []).map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            {errors.authorId?.message && (
              <span className="text-xs font-normal text-red-600">
                Selecione um autor.
              </span>
            )}
          </label>
          <label className={labelClass}>
            Idioma
            <select className={inputClass} {...register('language')}>
              <option value="PORTUGUESE">Português</option>
              <option value="ENGLISH">English</option>
            </select>
          </label>
        </div>
        <label className={labelClass}>
          Imagem de capa
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={changeImage}
          />
          <button
            type="button"
            className="flex min-h-32 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-blue-200 bg-sky-50 text-sm font-semibold text-blue-500 hover:border-blue-500"
            onClick={() => fileRef.current?.click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Prévia da capa"
                className="max-h-56 w-full object-cover"
              />
            ) : (
              'Selecionar imagem'
            )}
          </button>
        </label>
        <label className={labelClass}>
          Conteúdo
          <Suspense
            fallback={<div className="min-h-52 rounded-xl bg-slate-100" />}
          >
            <RichTextEditor
              value={watch('description') ?? ''}
              onChange={(value) => setValue('description', value)}
              placeholder="Escreva o conteúdo do post..."
              minHeight={240}
            />
          </Suspense>
        </label>

        <div className="flex justify-end gap-3 border-t border-sky-50 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || authorsQuery.isPending}
          >
            {isSubmitting
              ? 'Salvando...'
              : item
                ? 'Atualizar post'
                : 'Salvar post'}
          </Button>
        </div>
      </form>
    </section>
  );
}
