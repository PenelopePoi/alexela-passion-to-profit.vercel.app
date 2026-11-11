import React,{useEffect,useRef,useState} from 'react';
/** Reserve space and fetch optional sections before they scroll into view. */
export default function DeferredSection({children,id}:{children:React.ReactNode;id?:string}) {
 const ref=useRef<HTMLDivElement>(null),[ready,setReady]=useState(false);
 useEffect(()=>{if(!('IntersectionObserver' in window)){setReady(true);return;}const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setReady(true);observer.disconnect();}},{rootMargin:'700px'});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[]);
 return <div ref={ref} id={ready?undefined:id} style={ready?undefined:{minHeight:640}}>{ready?children:<p className="studio-eyebrow" style={{padding:'40px 5vw'}}>Explore more below</p>}</div>;
}
