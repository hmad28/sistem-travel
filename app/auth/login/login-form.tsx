'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import { z } from 'zod';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Form, FormField, SubmitButton } from '@/components/forms';
import { Link } from '@/i18n/navigation';
import { useNotification } from '@/contexts/NotificationContext';

const loginSchema = z.object({
  email: z.string().email('Masukkan alamat email yang benar.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin';
  const { showNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (values: LoginFormValues) => {
    const result = await signIn('credentials', {
      email: values.email.toLowerCase(),
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      showNotification('error', t('invalidCredentials'));
      return;
    }

    showNotification('success', t('loginSuccess'));
    router.push(callbackUrl);
  };

  return (
    <Form<LoginFormValues>
      schema={loginSchema}
      defaultValues={{ email: '', password: '' }}
      onSubmit={submit}
      className="gap-5"
    >
      <FormField<LoginFormValues> name="email" label={t('emailLabel')} className="gap-2 text-white data-[invalid=true]:text-[#f3a99a] [&_[data-slot=field-error]]:text-[#f3a99a]">
        {(field) => (
          <InputGroup className="h-14 rounded-xl border-white/20 bg-white/[.07] px-1 shadow-none focus-within:border-[#dbc16e] focus-within:bg-white/[.1] focus-within:ring-[#dbc16e]/20 has-[[aria-invalid=true]]:border-[#f3a99a] has-[[aria-invalid=true]]:ring-[#f3a99a]/15">
            <InputGroupAddon className="pl-3 text-white/50">
              <MailIcon className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type="email"
              autoComplete="email"
              placeholder="nama@travelanda.id"
              className="h-full px-3 text-base text-white placeholder:text-white/35"
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      <FormField<LoginFormValues> name="password" label={t('passwordLabel')} className="gap-2 text-white data-[invalid=true]:text-[#f3a99a] [&_[data-slot=field-error]]:text-[#f3a99a]">
        {(field) => (
          <InputGroup className="h-14 rounded-xl border-white/20 bg-white/[.07] px-1 shadow-none focus-within:border-[#dbc16e] focus-within:bg-white/[.1] focus-within:ring-[#dbc16e]/20 has-[[aria-invalid=true]]:border-[#f3a99a] has-[[aria-invalid=true]]:ring-[#f3a99a]/15">
            <InputGroupAddon className="pl-3 text-white/50">
              <LockIcon className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={(field.value as string | undefined) ?? ''}
              placeholder="Masukkan kata sandi"
              className="h-full px-3 text-base text-white placeholder:text-white/35"
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
            <InputGroupButton
              size="icon-sm"
              className="mr-2 size-10 rounded-lg text-white/55 hover:bg-white/10 hover:text-white"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </InputGroupButton>
          </InputGroup>
        )}
      </FormField>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-white/40">Akses khusus staf</span>
        <Link
          href="/auth/forgot-password"
          className="font-semibold text-[#dbc16e] underline-offset-4 hover:text-[#ead98f] hover:underline"
        >
          {t('forgotPassword')}
        </Link>
      </div>
      <SubmitButton className="mt-1 h-14 w-full rounded-xl bg-[#dbc16e] px-5 text-base font-bold text-[#142b59] shadow-[0_10px_28px_rgba(219,193,110,.14)] transition hover:bg-[#ead98f] active:translate-y-px">
        {t('submitLogin')} <ArrowRightIcon className="ml-auto size-5" />
      </SubmitButton>
    </Form>
  );
}
