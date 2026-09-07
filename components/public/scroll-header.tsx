'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import s from './public.module.css';
export function ScrollHeader({children}:{children:React.ReactNode}) {
  const path=usePathname();
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const update=()=>setScrolled(window.scrollY>32);update();window.addEventListener('scroll',update,{passive:true});return ()=>window.removeEventListener('scroll',update);},[]);
  return <header className={`${s.header} ${path==='/'?s.homeHeader:''}`} data-transparent={path==='/'&&!scrolled}>{children}</header>;
}
