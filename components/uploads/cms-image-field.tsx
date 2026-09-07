'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FileDropzone } from './file-dropzone';
import { uploadFiles } from '@/lib/uploadthing';
export function CmsImageField({
  name,
  initialValue = '',
  onBusy,
  label,
}: {
  name: string;
  initialValue?: string;
  onBusy: (busy: boolean) => void;
  label?: string;
}) {
  const t = useTranslations('contentEditor');
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="space-y-3">
      <p className="font-semibold">{label ?? t('image')}</p>
      <input type="hidden" name={name} value={value} />
      <FileDropzone
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onFiles={async (files) => {
          if (!files.length) return;
          setBusy(true);
          onBusy(true);
          setError(false);
          try {
            const [result] = await uploadFiles('cmsImage', { files: [files[0]] });
            if (!result?.serverData?.url) throw new Error('No image URL');
            setValue(result.serverData.url);
          } catch {
            setError(true);
          } finally {
            setBusy(false);
            onBusy(false);
          }
        }}
      />
      {value && (
        <>
          <Image
            src={value}
            alt={label ?? t('image')}
            width={480}
            height={270}
            className="max-h-64 w-full rounded-lg border object-contain"
          />
          <p>{t('imageReady')}</p>
          <button
            type="button"
            disabled={busy}
            className="min-h-11 underline"
            onClick={() => setValue('')}
          >
            {t('removeImage')}
          </button>
        </>
      )}
      {error && <p role="alert">{t('uploadFailed')}</p>}
    </div>
  );
}
