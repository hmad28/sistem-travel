'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { saveTravelContent } from '@/app/actions/travel-content';
import type { ContentKind, ContentEntry } from '@/lib/travel/content';
import { CmsImageField } from '@/components/uploads/cms-image-field';
import { Button } from '@/components/ui/button';
export function ContentForm({ kind, entry }: { kind: ContentKind; entry?: ContentEntry }) {
  const t = useTranslations('contentEditor');
  const [state, action, pending] = useActionState(saveTravelContent.bind(null, kind), {
    ok: false,
    message: '',
  });
  const [uploading, setUploading] = useState(false);
  const control = 'min-h-12 w-full rounded-lg border bg-white p-3 text-slate-900';
  return (
    <form action={action} className="max-w-3xl space-y-5 rounded-xl border bg-white p-6">
      <input type="hidden" name="id" value={entry?.id ?? ''} />
      <input type="hidden" name="revision" value={entry?.revision ?? 0} />
      {state.message && (
        <p role="status">
          {state.message}{' '}
          {state.href && (
            <Link className="underline" href={state.href}>
              {t('back')}
            </Link>
          )}
        </p>
      )}
      <fieldset disabled={pending || uploading || state.ok} className="grid gap-5">
        <label className="grid gap-2">
          <span>{t('title')}</span>
          <input
            name="title"
            defaultValue={entry?.title}
            required
            minLength={2}
            maxLength={200}
            className={control}
          />
        </label>
        {kind === 'testimonial' && (
          <label className="grid gap-2">
            <span>{t('videoUrl')}</span>
            <input
              name="videoUrl"
              type="url"
              defaultValue={entry?.videoUrl}
              maxLength={1000}
              className={control}
            />
            <small>{t('videoHelp')}</small>
          </label>
        )}
        <label className="grid gap-2">
          <span>{t('sortOrder')}</span>
          <input
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            step={1}
            defaultValue={entry?.sortOrder ?? 0}
            required
            className={control}
          />
          <small>{t('orderHelp')}</small>
        </label>
        <label className="grid gap-2">
          <span>{t(kind === 'faq' ? 'answer' : 'body')}</span>
          <textarea
            name="body"
            defaultValue={entry?.body}
            maxLength={30000}
            className={`${control} min-h-48`}
          />
        </label>
        <label className="grid gap-2">
          <span>{t('link')}</span>
          <input name="link" defaultValue={entry?.link} placeholder="/umroh" className={control} />
          <small>{t('linkHelp')}</small>
        </label>
        <label className="grid gap-2">
          <span>{t('publication')}</span>
          <select name="published" defaultValue={entry?.published ? '1' : '0'} className={control}>
            <option value="0">{t('draft')}</option>
            <option value="1">{t('published')}</option>
          </select>
        </label>
        {kind !== 'faq' && (
          <CmsImageField name="image" initialValue={entry?.image} onBusy={setUploading} />
        )}
        {kind === 'banner' && (
          <CmsImageField
            name="mobileImage"
            initialValue={entry?.mobileImage}
            onBusy={setUploading}
            label={t('mobileImage')}
          />
        )}
      </fieldset>
      <div className="flex flex-wrap items-center gap-5">
        <Button type="submit" disabled={pending || uploading || state.ok}>
          {t(pending || uploading ? 'saving' : 'save')}
        </Button>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href={`/admin/cms/konten/${kind}`}
        >
          {t('back')}
        </Link>
      </div>
    </form>
  );
}
