import {useEffect,useState} from 'react';
import {localQr} from '../services/productionExport';
export function useLocalQr(target:string) {
 const [url,setUrl]=useState('');
 useEffect(()=>{let active=true;setUrl('');if(target.trim())void localQr(target).then(value=>{if(active)setUrl(value);}).catch(()=>{if(active)setUrl('');});return()=>{active=false;};},[target]);
 return url;
}
