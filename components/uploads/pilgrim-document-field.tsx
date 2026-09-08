'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FileDropzone } from './file-dropzone';
import { uploadFiles } from '@/lib/uploadthing';

export function PilgrimDocumentField({pilgrimId,documentTypeId}:{pilgrimId:string;documentTypeId:string}) {
  const t=useTranslations('internalUx'), router=useRouter();
  const [busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
  return <div className="space-y-3"><FileDropzone accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy} hint={t('uploadHint')} onFiles={async files=>{
    const file=files[0]; if(!file)return;
    if(file.size>8*1024*1024||!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)){setFailed(true);setMessage(t('invalidFile'));return;}
    setBusy(true);setProgress(0);setMessage('');setFailed(false);
    try { const [result]=await uploadFiles('pilgrimDocument',{files:[file],input:{pilgrimId,documentTypeId},onUploadProgress:({progress})=>setProgress(progress)});
      if(!result?.serverData?.id)throw new Error('Missing document');
      setMessage(t('uploaded'));router.refresh();
    }catch{setFailed(true);setMessage(t('uploadFailed'));}finally{setBusy(false);}
  }}/>{busy&&<p role="status">{progress<100?t('uploading',{progress}):t('saving')}</p>}{message&&<p role={failed?'alert':'status'}>{message}</p>}</div>;
}
