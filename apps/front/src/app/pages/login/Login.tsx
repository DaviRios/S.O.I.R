import { FormEvent, useState } from 'react';
import { AuthService } from '../../auth/auth';
import { login } from '../../services/auth.service';

export function Login() {
  const [email, setEmail] = useState('admin@soir.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login({ email, password });
      AuthService.saveToken(result.accessToken);
      window.location.reload();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Não foi possível entrar.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={
        'min-h-screen flex [background-color:#e5ecf8] max-[768px]:flex-col'
      }
    >
      <form
        className={
          'w-full [max-width:420px] [margin:auto] [padding:40px] [background:#fff] [border-radius:18px] [box-shadow:0_20px_60px_rgba(26,_35,_64,_0.12)] flex flex-col [gap:18px] [&_h1]:[color:#1a2340] [&_h1]:[font-size:28px] [&_p]:[color:#7b8bab] [&_small]:[color:#7b8bab] [&_label]:flex [&_label]:flex-col [&_label]:[gap:7px] [&_label]:[color:#1a2340] [&_label]:font-semibold [&_input]:[padding:12px_14px] [&_input]:[border:1px_solid_#dde5f3] [&_input]:[border-radius:9px] [&_input]:outline-none focus:[&_input]:[border-color:#ff6100] focus:[&_input]:[box-shadow:0_0_0_3px_rgba(255,97,0,.12)] [&_button]:[padding:13px] [&_button]:[border:0] [&_button]:[border-radius:9px] [&_button]:[background:#ff6100] [&_button]:[color:#fff] [&_button]:font-bold [&_button]:cursor-pointer'
        }
        onSubmit={submit}
      >
        <div
          className={
            '[color:#ff6100] [font-size:20px] font-extrabold [letter-spacing:.16em]'
          }
        >
          Soir
        </div>
        <h1>Acesso ao CMS</h1>
        <p>Entre para gerenciar o conteúdo do site.</p>
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && (
          <span
            className={
              '[color:#c53030] [background:#fff0f0] [border-radius:8px] [padding:10px_12px]'
            }
          >
            {error}
          </span>
        )}
        <button disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
        <small>Ambiente local: admin@soir.local / admin123</small>
      </form>
    </main>
  );
}

export default Login;
