import { useEffect, useRef, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { CipherChallenge } from './pages/CipherChallenge';
import { RobotChallenge } from './pages/RobotChallenge';
type View='home'|'cipher'|'robot';
export default function App(){
  const [view,setView]=useState<View>('home');
  const shell=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const heading=shell.current?.querySelector('h1');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
    window.scrollTo(0,0);
  },[view]);
  return <div ref={shell} className="app-shell">{view==='home'?<HomePage onSelect={setView}/>:view==='cipher'?<CipherChallenge onBack={()=>setView('home')}/>:<RobotChallenge onBack={()=>setView('home')}/>}</div>;
}
