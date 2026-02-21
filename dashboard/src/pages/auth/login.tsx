import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  async function onSubmit(values: LoginForm) {
    clearError();
    try {
      await login(values.email, values.password);
      navigate('/', { replace: true });
    } catch {
      // error handled in store
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-sm bg-accent-acid/10 border border-accent-acid/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-accent-acid" />
          </div>
          <h1 className="text-xl font-bold text-text-primary font-display tracking-tight">
            OnlyQuat Admin
          </h1>
          <p className="text-sm text-text-dim mt-1 font-body">
            Chỉ dành cho quản trị viên
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-border-subtle rounded-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-dim uppercase tracking-wider">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="admin@onlyquat.com"
                className={cn(
                  'w-full px-3 py-2 rounded-sm text-sm font-body',
                  'bg-bg-elevated border text-text-primary placeholder:text-text-dim',
                  'focus:outline-none focus:ring-1 focus:ring-accent-acid/50 focus:border-accent-acid/50',
                  'transition-colors',
                  errors.email
                    ? 'border-danger'
                    : 'border-border-subtle',
                )}
              />
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-dim uppercase tracking-wider">
                Mật khẩu
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  'w-full px-3 py-2 rounded-sm text-sm font-body',
                  'bg-bg-elevated border text-text-primary placeholder:text-text-dim',
                  'focus:outline-none focus:ring-1 focus:ring-accent-acid/50 focus:border-accent-acid/50',
                  'transition-colors',
                  errors.password
                    ? 'border-danger'
                    : 'border-border-subtle',
                )}
              />
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* API error */}
            {error && (
              <div className="px-3 py-2 rounded-sm bg-danger/10 border border-danger/30">
                <p className="text-xs text-danger">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'px-4 py-2.5 rounded-sm text-sm font-medium',
                'bg-accent-acid text-bg-base',
                'hover:bg-accent-acid/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
