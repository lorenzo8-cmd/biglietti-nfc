const byId=id=>document.getElementById(id);
export function fileFor(value){if(!value||! /^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(value))throw Error('Il link della scheda non è valido.');return value.toLowerCase().endsWith('.vcf')?value:value+'.vcf'}
function unescapeValue(value){return value.replace(/\\([nN,;\\])/g,(_,c)=>c.toLowerCase()==='n'?'\n':c)}
function parts(value){const fields=[''];for(let i=0;i<value.length;i++){if(value[i]==='\\'&&i+1<value.length){fields[fields.length-1]+=value[i]+value[++i]}else if(value[i]===';')fields.push('');else fields[fields.length-1]+=value[i]}return fields.map(unescapeValue)}
export function parseVCard(text){
 if(!/^BEGIN:VCARD\s*$/mi.test(text)||!/^END:VCARD\s*$/mi.test(text))throw Error('Il file non contiene un contatto valido.');
 const data={phones:[],emails:[],websites:[],addresses:[]};
 for(const line of text.replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'').split('\n')){
  const sep=line.indexOf(':');if(sep<0)continue;const head=line.slice(0,sep),raw=line.slice(sep+1),value=unescapeValue(raw),key=head.split(';')[0].split('.').pop().toUpperCase();
  if(key==='FN')data.name=value;if(key==='N')data.names=parts(raw);if(key==='ORG')data.company=parts(raw).filter(Boolean).join(' · ');if(key==='TITLE')data.role=value;
  if(key==='TEL')data.phones.push({value,mobile:/CELL/i.test(head)});if(key==='EMAIL')data.emails.push(value);if(key==='URL')data.websites.push(value);if(key==='ADR')data.addresses.push(parts(raw));
 }
 data.name=data.name||[data.names?.[1],data.names?.[0]].filter(Boolean).join(' ');if(!data.name)throw Error('Questo contatto non contiene un nome.');return data;
}
function safeWebsite(value){try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.href:null}catch{return null}}
const icons={call:'<path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a15 15 0 0 1-7-7l2-2Z"/>',email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18"/>'};
function quick(label,href,icon){const a=document.createElement('a');a.href=href;a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[icon]+'</svg><span></span>';a.lastChild.textContent=label;if(icon==='web'){a.target='_blank';a.rel='noopener noreferrer'}byId('quick').append(a)}
function detail(label,value,href){const row=document.createElement(href?'a':'div');row.className='detail';if(href)row.href=href;const small=document.createElement('small'),span=document.createElement('span');small.textContent=label;span.textContent=value;row.append(small,span);byId('details').append(row)}
export function androidIntent(data,fallback){const encode=v=>encodeURIComponent(v||'');const extras={name:data.name,phone:data.phones[0]?.value,email:data.emails[0],company:data.company,job_title:data.role,secondary_phone:data.phones[1]?.value,tertiary_phone:data.phones[2]?.value,secondary_email:data.emails[1],tertiary_email:data.emails[2],postal:data.addresses[0]?.slice(2).filter(Boolean).join(', ')};return 'intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/contact;'+Object.entries(extras).filter(([,v])=>v).map(([k,v])=>'S.'+k+'='+encode(v)+';').join('')+'S.browser_fallback_url='+encode(fallback)+';end'}
async function start(){
 const params=new URLSearchParams(location.search);let file,url;
 try{
  file=fileFor(params.get('c'));url=new URL(file,location.href);const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error(response.status===404?'Questa scheda non è disponibile. Chiedi al proprietario di controllare il link.':'Non riesco a caricare il contatto. Riprova tra poco.');const text=await response.text();if(text.length>100000)throw Error('Il file del contatto è troppo grande.');const data=parseVCard(text);
  byId('name').textContent=data.name;document.title=data.name+' · Scheda contatto';byId('avatar').textContent=data.name.trim().split(/\s+/).slice(0,2).map(x=>Array.from(x)[0]).join('').toUpperCase();for(const key of ['role','company']){byId(key).textContent=data[key]||'';byId(key).hidden=!data[key]}
  const phones=data.phones.filter(p=>/^\+?[\d\s()./\-]{6,40}$/.test(p.value));const emails=data.emails.filter(v=>/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v));const site=data.websites.map(safeWebsite).find(Boolean);const tel=p=>'tel:'+p.value.replace(/[^+\d]/g,'');
  if(phones[0])quick('Chiama',tel(phones[0]),'call');if(emails[0])quick('Email','mailto:'+encodeURIComponent(emails[0]),'email');if(site)quick('Sito web',site,'web');
  phones.forEach(p=>detail(p.mobile?'Cellulare':'Telefono',p.value,tel(p)));emails.forEach(v=>detail('Email',v,'mailto:'+encodeURIComponent(v)));if(site)detail('Sito web',new URL(site).hostname,site);
  data.addresses.forEach(a=>{const address=[a[2],[a[5],a[3],a[4]].filter(Boolean).join(' '),a[6]].filter(Boolean).join('\n');if(address)detail('Indirizzo',address)});
  const android=/Android/i.test(navigator.userAgent),ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const nativeFieldsSupported=!data.websites.length&&data.phones.length<=3&&data.emails.length<=3&&data.addresses.length<=1;byId('save').href=android&&nativeFieldsSupported?androidIntent(data,url.href):url.href;byId('download').href=url.href;byId('android-help').hidden=!android;byId('save-hint').textContent=android?'Conferma il salvataggio sul tuo telefono.':'Aggiungi i recapiti alla tua rubrica.';
  byId('status').hidden=true;byId('profile').hidden=false;
  byId('share').onclick=async()=>{try{const shareUrl=new URL('card.html',location.href);shareUrl.searchParams.set('c',file.replace(/\.vcf$/i,''));if(navigator.share)await navigator.share({title:data.name,url:shareUrl.href});else{await navigator.clipboard.writeText(shareUrl.href);byId('feedback').textContent='Link della scheda copiato.'}}catch(e){if(e.name!=='AbortError')byId('feedback').textContent='Puoi copiare il link dalla barra degli indirizzi.'}};
  // iOS keeps its usual native vCard flow; view=1 provides an explicit web preview.
  if(ios&&params.get('view')!=='1'){
   let seen=false;try{seen=sessionStorage.getItem('opened:'+file)==='1';sessionStorage.setItem('opened:'+file,'1')}catch{}
   if(!seen){byId('save-hint').textContent='Apro il contatto. Se non compare, tocca Salva contatto.';location.assign(url.href)}
  }
 }catch(e){byId('status').textContent=e instanceof TypeError?'Connessione non disponibile. Controlla Internet e ricarica la pagina.':e.message;byId('avatar').textContent='?'}
}
if(document.getElementById('profile'))start();
