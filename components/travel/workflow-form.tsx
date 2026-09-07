'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { saveTravelWorkflow, type WorkflowKind } from '@/app/actions/travel-workflow';
import { Button } from '@/components/ui/button';
import { CmsImageField } from '@/components/uploads/cms-image-field';

export type EditorField = {
  name: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  value?: string | number;
  min?: number;
  max?: number;
};
export function WorkflowForm({
  kind,
  fields,
  back,
}: {
  kind: WorkflowKind;
  fields: EditorField[];
  back: string;
}) {
  const t = useTranslations('workflow');
  const [state, action, pending] = useActionState(saveTravelWorkflow.bind(null, kind), {
    ok: false,
    message: '',
  });
  const [review, setReview] = useState(false);
  const [uploading, setUploading] = useState(false);
  return (
    <form action={action} className="space-y-6 max-w-4xl">
      {kind === 'package' && <CmsImageField name="thumbnailKey" initialValue={String(fields.find(f=>f.name==='thumbnailKey')?.value ?? '')} onBusy={setUploading} />}
      <p className="rounded-xl bg-accent px-5 py-4 leading-7">{t(`${kind}Help`)}</p>
      {state.message && (
        <div role={state.ok ? 'status' : 'alert'} className="rounded-xl border p-5">
          <p>{state.message}</p>
          {state.href && (
            <Link
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline"
              href={state.href}
            >
              {t('continue')}
            </Link>
          )}
        </div>
      )}
      <fieldset
        disabled={pending || state.ok}
        className="grid gap-5 rounded-xl border bg-card p-6 sm:grid-cols-2"
      >
      {fields.filter(field=>field.name !== 'thumbnailKey').map((field) =>
          field.type === 'hidden' ? (
            <input key={field.name} type="hidden" name={field.name} value={field.value ?? ''} />
          ) : (
            <label
              key={field.name}
              className={`grid content-start gap-2 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}
            >
              <span className="font-semibold">
                {t(field.name as 'name')}
                {field.required ? ' *' : ''}
              </span>
              {field.options ? (
                <select
                  name={field.name}
                  defaultValue={field.value ?? ''}
                  required={field.required}
                  className="min-h-12 rounded-lg border bg-white px-3 text-slate-900"
                >
                  {field.required && <option value="">{t('choose')}</option>}
                  {field.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="min-h-32 rounded-lg border bg-white p-3 text-slate-900"
                  name={field.name}
                  defaultValue={field.value}
                  required={field.required}
                />
              ) : (
                <input
                  className="min-h-12 rounded-lg border bg-white px-3 text-slate-900"
                  name={field.name}
                  type={field.type ?? 'text'}
                  min={field.min}
                  max={field.max}
                  defaultValue={field.value}
                  required={field.required}
                />
              )}
              {state.errors?.includes(field.name) && (
                <small className="text-red-700">{t('checkField')}</small>
              )}
            </label>
          )
        )}
      </fieldset>
      {kind === 'payment' && !state.ok && (
        <label className="flex items-start gap-3 rounded-xl border p-5">
          <input
            type="checkbox"
            checked={review}
            onChange={(e) => setReview(e.target.checked)}
            className="mt-1 size-5"
            required
          />
          <span>{t('paymentConfirm')}</span>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending || uploading || state.ok || (kind === 'payment' && !review)}>
          {pending && <LoaderCircle className="animate-spin" />}
          {t(pending ? 'saving' : 'save')}
        </Button>
        <Link className="inline-flex min-h-12 items-center underline" href={back}>
          {t('back')}
        </Link>
      </div>
    </form>
  );
}
