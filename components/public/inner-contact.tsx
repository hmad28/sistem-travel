'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import s from './inner.module.css';
export function InquiryForm({
  whatsapp,
  packages,
  selected = '',
}: {
  whatsapp: string;
  packages: string[];
  selected?: string;
}) {
  const t = useTranslations('publicInner');
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const number = whatsapp.replace(/\D/g, '').replace(/^0/, '62');
  const valid = /^62\d{8,13}$/.test(number);
  return (
    <form
      className={s.form}
      onSubmit={(event) => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const name = String(fields.get('name') ?? '').trim();
        const phone = String(fields.get('phone') ?? '').trim();
        if (!name || !/^\+?[\d\s()-]{9,20}$/.test(phone)) {
          setStatus(t('invalid'));
          return;
        }
        const message = [
          t('inquiryGreeting'),
          `${t('name')}: ${name}`,
          `${t('phone')}: ${phone}`,
          `${t('package')}: ${fields.get('package') || t('notChosen')}`,
          `${t('message')}: ${fields.get('message') || '-'}`,
        ].join('\n');
        setDraft(message);
        setStatus(valid ? t('draftReady') : t('contactUnavailable'));
      }}
    >
      <fieldset disabled={!ready} className={s.form}>
        <label>
          {t('name')} *<input name="name" autoComplete="name" required maxLength={100} />
        </label>
        <label>
          {t('phone')} *
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="08xxxxxxxxxx"
            maxLength={20}
          />
        </label>
        <label>
          {t('package')}
          <select name="package" defaultValue={packages.includes(selected) ? selected : ''}>
            <option value="">{t('notChosen')}</option>
            {packages.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          {t('message')}
          <textarea name="message" maxLength={2000} />
        </label>
        <small>{t('formNote')}</small>
        <button type="submit" className={s.button}>
          {ready ? t('prepare') : t('preparing')}
        </button>
      </fieldset>
      {status && (
        <div className={s.status} role="status">
          {status}
        </div>
      )}
      {draft && (
        <>
          <label>
            {t('draft')}
            <textarea readOnly value={draft} />
          </label>
          {valid ? (
            <a
              className={s.button}
              href={`https://wa.me/${number}?text=${encodeURIComponent(draft)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('openWhatsapp')}
            </a>
          ) : (
            <button
              type="button"
              className={s.button}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(draft);
                  setStatus(t('copied'));
                } catch {
                  setStatus(t('copyManual'));
                }
              }}
            >
              {t('copy')}
            </button>
          )}
        </>
      )}
    </form>
  );
}
