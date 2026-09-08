'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Search, X, ChevronRight, LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function SimpleRecords({
  headers,
  rows,
  title,
  detailLinks,
  detailKeyIndex = 0,
}: {
  headers: string[];
  rows: string[][];
  title: string;
  detailLinks?: Record<string, string>;
  detailKeyIndex?: number;
}) {
  const t = useTranslations('travelSimple');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[] | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(false);
  const filtered = rows.filter((row) =>
    row.some((cell) => cell.toLowerCase().includes(query.toLowerCase()))
  );
  async function download() {
    setExporting(true);
    setError(false);
    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...filtered]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.xlsx`);
    } catch {
      setError(true);
    } finally {
      setExporting(false);
    }
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg border bg-white px-4">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <span className="sr-only">{t('search')}</span>
          <input
            className="min-w-0 flex-1 bg-transparent py-3 outline-none"
            placeholder={t('search')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={t('clear')}>
              <X className="size-4" />
            </button>
          )}
        </label>
        <Button variant="outline" onClick={download} disabled={exporting || !filtered.length}>
          {exporting ? <LoaderCircle className="animate-spin" /> : <Download />}
          {t('download')}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {t('exportError')}
        </p>
      )}
      <p className="text-sm text-muted-foreground">{t('rowCount', { count: filtered.length })}</p>
      {filtered.length ? (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {headers.map((header) => (
                  <th className="px-5 py-4 font-semibold" key={header}>
                    {header}
                  </th>
                ))}
                <th className="px-5 py-4">
                  <span className="sr-only">{t('details')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((row, rowIndex) => (
                <tr key={`${row[0]}-${rowIndex}`} className="hover:bg-slate-50">
                  {row.map((cell, index) => (
                    <td key={index} className="px-5 py-5">
                      {index === 0 ? detailLinks?.[row[detailKeyIndex]] ? <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4" href={detailLinks[row[detailKeyIndex]]}>{cell}</Link> : <strong className="font-semibold">{cell}</strong> : cell}
                    </td>
                  ))}
                  <td className="px-4">
                    {detailLinks?.[row[detailKeyIndex]] ? <Link href={detailLinks[row[detailKeyIndex]]} className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap font-semibold text-primary">{t('details')}<ChevronRight className="size-4" /></Link> : <button
                      className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap font-semibold text-primary"
                      onClick={() => setSelected(row)}
                    >
                      {t('details')}
                      <ChevronRight className="size-4" />
                    </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-lg font-semibold">{t('empty')}</h2>
          <p className="mt-2 text-muted-foreground">{t('emptyHint')}</p>
        </div>
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.[0] ?? title}</DialogTitle>
          </DialogHeader>
          <dl className="divide-y">
            {headers.map((header, index) => (
              <div key={header} className="py-3">
                <dt className="text-sm text-muted-foreground">{header}</dt>
                <dd className="mt-1 break-words text-base">{selected?.[index]}</dd>
              </div>
            ))}
          </dl>
        </DialogContent>
      </Dialog>
    </section>
  );
}
