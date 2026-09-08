'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
export function PrintDocument(){const t=useTranslations('internalUx');return <Button className="print:hidden" onClick={()=>window.print()}>{t('print')}</Button>;}
