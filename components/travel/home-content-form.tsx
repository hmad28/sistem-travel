'use client';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveHomeContent } from '@/app/actions/home-content';
import { homeSections, type HomeKey } from '@/lib/validation/home-content';
import { Button } from '@/components/ui/button';
export function HomeContentForm({ values, revision }: { values: Record<HomeKey, string>; revision: number }) {
  const t = useTranslations('homeEditor');
  const [state, action, pending] = useActionState(saveHomeContent, { ok: false, message: '', revision });
  return <form action={action} className="max-w-4xl space-y-6">
    <input type="hidden" name="revision" value={state.revision} />
    {state.message && <p role={state.ok ? 'status' : 'alert'} className="rounded-lg border bg-white p-4">{state.message}</p>}
    <fieldset disabled={pending} className="space-y-5">
      {Object.entries(homeSections).map(([section, keys]) => <details key={section} open={section === 'hero'} className="rounded-xl border bg-white p-6">
        <summary className="min-h-11 cursor-pointer text-lg font-bold">{t(section as 'hero')}</summary>
        <div className="mt-5 grid gap-5">{keys.map(key => <label key={key} className="grid gap-2"><span className="font-semibold">{t(`fields.${key}`)}</span><textarea name={key} defaultValue={values[key]} maxLength={2000} required className="min-h-24 rounded-lg border bg-white p-3 text-slate-900" /></label>)}</div>
      </details>)}
    </fieldset>
    <div className="sticky bottom-0 flex flex-wrap gap-3 border-t bg-white p-4"><Button type="submit" name="intent" value="draft" variant="outline" disabled={pending}>{t('saveDraft')}</Button><Button type="submit" name="intent" value="publish" disabled={pending}>{t(pending ? 'saving' : 'publish')}</Button></div>
  </form>;
}
