'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isPublicPath, jakartaDay } from '@/lib/validation/website-traffic';

const storageKey='hammad-website-visitor';
function visitorId() {
  try {
    const old=JSON.parse(localStorage.getItem(storageKey)??'null');
    if(old && typeof old.id==='string' && old.expires>Date.now())return old.id as string;
    const id=crypto.randomUUID();
    localStorage.setItem(storageKey,JSON.stringify({id,expires:Date.now()+30*86400000}));
    return id;
  }catch{return null;}
}
export function VisitorTracker() {
  const path=usePathname();
  const visit=useRef<{path:string;day:string;id:string}|null>(null);
  useEffect(()=>{
    if(!isPublicPath(path) || navigator.doNotTrack==='1' || (navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return;
    const id=visitorId(); if(!id)return;
    let referrer='';
    try {const host=new URL(document.referrer).hostname; if(host!==location.hostname)referrer=host;}catch{}
    let sent=false;
    const send=()=>{
      if(document.visibilityState!=='visible')return;
      const day=jakartaDay();
      if(!visit.current || visit.current.path!==path || visit.current.day!==day){visit.current={path,day,id:crypto.randomUUID()};sent=false;}
      const eventId=visit.current.id;
      void fetch('/api/traffic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:sent?'heartbeat':'pageview',visitorId:id,eventId,path,referrer}),keepalive:true}).then(r=>{if(r.ok)sent=true;}).catch(()=>{});
    };
    send(); const timer=window.setInterval(send,60000);
    document.addEventListener('visibilitychange',send);
    return ()=>{clearInterval(timer);document.removeEventListener('visibilitychange',send);};
  },[path]);
  return null;
}
