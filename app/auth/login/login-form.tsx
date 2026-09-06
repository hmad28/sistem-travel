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
      <FormField<LoginFormValues> name="email" label={t('emailLabel')} className="gap-2">
        {(field) => (
          <InputGroup className="h-14 rounded-xl border-[#d9ddd9] bg-[#fbfcfb] px-1 shadow-[0_1px_0_rgba(18,63,56,.03)] focus-within:bg-white">
            <InputGroupAddon className="pl-3 text-[#61716c]">
              <MailIcon className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type="email"
              autoComplete="email"
              placeholder="nama@travelanda.id"
              className="h-full px-3 text-base placeholder:text-[#9ba5a1]"
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      <FormField<LoginFormValues> name="password" label={t('passwordLabel')} className="gap-2">
        {(field) => (
          <InputGroup className="h-14 rounded-xl border-[#d9ddd9] bg-[#fbfcfb] px-1 shadow-[0_1px_0_rgba(18,63,56,.03)] focus-within:bg-white">
            <InputGroupAddon className="pl-3 text-[#61716c]">
              <LockIcon className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={(field.value as string | undefined) ?? ''}
              placeholder="Masukkan kata sandi"
              className="h-full px-3 text-base placeholder:text-[#9ba5a1]"
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
            <InputGroupButton
              size="icon-sm"
              className="mr-2 size-10 rounded-lg text-[#61716c] hover:bg-[#edf3f0]"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </InputGroupButton>
          </InputGroup>
        )}
      </FormField>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-[#7b8984]">Akses khusus staf</span>
        <Link
          href="/auth/forgot-password"
          className="font-semibold text-[#0b594c] underline-offset-4 hover:underline"
        >
          {t('forgotPassword')}
        </Link>
      </div>
      <SubmitButton className="mt-1 h-14 w-full rounded-xl bg-[#0b594c] px-5 text-base font-bold shadow-[0_8px_22px_rgba(11,89,76,.18)] transition hover:bg-[#08493f] active:translate-y-px">
        {t('submitLogin')} <ArrowRightIcon className="ml-auto size-5" />
      </SubmitButton>
    </Form>
  );
}
