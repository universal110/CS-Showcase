import { useRef } from 'react';
export function CodeEditor({value,onChange,activeLine,disabled}:{value:string;onChange:(v:string)=>void;activeLine?:number;disabled:boolean}) {
  const gutter=useRef<HTMLDivElement>(null);
  const lines=Math.max(value.split('\n').length,12);
  return <div className="editor-shell"><div className="editor-bar"><span><i/><i/><i/></span><b>mission.robot</b><em>ROBOT OS</em></div><div className="editor-body"><div ref={gutter} className="line-numbers" aria-hidden="true">{Array.from({length:lines},(_,i)=><span className={activeLine===i+1?'active':''} key={i}>{i+1}</span>)}</div><label className="sr-only" htmlFor="robot-code">Robot OS program</label><textarea id="robot-code" spellCheck={false} value={value} disabled={disabled} onChange={e=>onChange(e.target.value)} onScroll={e=>{if(gutter.current)gutter.current.scrollTop=e.currentTarget.scrollTop}} aria-describedby="editor-note"/></div><p id="editor-note">Use spaces to indent. Tab moves to controls.</p></div>;
}
