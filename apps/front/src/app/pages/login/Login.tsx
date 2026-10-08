import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginInput } from '@soir/contracts';
import { login } from '../../services/auth.service';
import { zodResolver } from '../../lib/zod-resolver';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';

export function Login() {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await login({ email: values.email ?? '', password: values.password });
      window.location.reload();
    } catch (reason) {
      setServerError(
        reason instanceof Error ? reason.message : 'Não foi possível entrar.',
      );
    }
  });

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form
        className="flex w-full max-w-md flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-10 shadow-xl"
        onSubmit={submit}
      >
        <div className="text-lg font-extrabold tracking-[0.16em] text-blue-600">
          SOIR
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Acesso ao CMS</h1>
          <p className="mt-2 text-slate-500">
            Entre para gerenciar o conteúdo do site.
          </p>
        </div>
        <label className="flex flex-col gap-2 font-semibold text-slate-800">
          E-mail
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            type="email"
            autoComplete="username"
            {...register('email')}
          />
          {errors.email && (
            <span className="text-xs text-red-600">{errors.email.message}</span>
          )}
        </label>
        <label className="flex flex-col gap-2 font-semibold text-slate-800">
          Senha
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && (
            <span className="text-xs text-red-600">
              {errors.password.message}
            </span>
          )}
        </label>
        {serverError && <Alert>{serverError}</Alert>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </main>
  );
}

export default Login;
