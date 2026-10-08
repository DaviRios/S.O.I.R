import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAuthorSchema } from '@soir/contracts';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { createAuthor, listAuthors } from '../../../services/authors.service';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { zodResolver } from '../../../lib/zod-resolver';

type AuthorFormValues = z.infer<typeof createAuthorSchema>;

export function AuthorsPanel() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const authorsQuery = useQuery({
    queryKey: ['authors'],
    queryFn: ({ signal }) => listAuthors(signal),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthorFormValues>({
    resolver: zodResolver(createAuthorSchema),
    defaultValues: { name: '', bio: '' },
  });
  const createMutation = useMutation({
    mutationFn: createAuthor,
    onSuccess: async () => {
      reset();
      setShowForm(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['authors'] }),
        queryClient.invalidateQueries({ queryKey: ['authors', 'dropdown'] }),
      ]);
    },
  });

  const authors = authorsQuery.data ?? [];
  const error = createMutation.error ?? authorsQuery.error;

  return (
    <section className="mt-3 rounded-2xl border border-sky-100 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="m-0 text-base font-bold text-slate-900">Autores</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Gerencie os autores dos posts
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowForm((value) => !value)}
        >
          {showForm ? 'Cancelar' : '+ Novo Autor'}
        </Button>
      </div>

      {showForm && (
        <form
          className="mb-5 rounded-xl border border-sky-100 bg-sky-50/50 p-5"
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
        >
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
              Nome
              <input
                className="rounded-xl border border-sky-200 bg-white px-3.5 py-2.5 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Nome do autor"
                {...register('name')}
              />
              {errors.name?.message && (
                <span className="text-xs font-normal text-red-600">
                  {errors.name.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
              Bio (opcional)
              <input
                className="rounded-xl border border-sky-200 bg-white px-3.5 py-2.5 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Breve descrição do autor"
                {...register('bio')}
              />
            </label>
          </div>
          {error && (
            <div className="mb-4">
              <Alert>
                {error instanceof Error
                  ? error.message
                  : 'Não foi possível salvar o autor.'}
              </Alert>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Criar autor'}
            </Button>
          </div>
        </form>
      )}

      {authorsQuery.isPending ? (
        <p className="m-0 py-2 text-sm text-slate-400">Carregando autores…</p>
      ) : authors.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {authors.map((author) => (
            <div
              key={author.id}
              className="flex min-w-40 items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50/50 px-3.5 py-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-sm font-bold text-white">
                {author.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-slate-900">
                  {author.name}
                </span>
                {author.bio && (
                  <span className="truncate text-sm text-slate-400">
                    {author.bio}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 py-2 text-sm text-slate-400">
          Nenhum autor cadastrado ainda.
        </p>
      )}
    </section>
  );
}
