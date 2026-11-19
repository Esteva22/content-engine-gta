import fs from 'node:fs';
export async function remote(url,options={}){const r=await fetch(url,{...options,signal:AbortSignal.timeout(60000)});const j=await r.json();if(!r.ok||(j.error&&j.error.code!=='ok'))throw Error(j.error?.message||j.error?.code||`HTTP ${r.status}`);return j;}
export function connectors(){return [{id:'youtube',name:'YouTube',configured:!!process.env.YOUTUBE_ACCESS_TOKEN,description:'Upload real via OAuth • visibilidade privada'},{id:'instagram',name:'Instagram',configured:!!(process.env.INSTAGRAM_ACCESS_TOKEN&&process.env.INSTAGRAM_USER_ID&&process.env.PUBLIC_BASE_URL),description:'Reels • conta profissional e URL pública HTTPS'},{id:'tiktok',name:'TikTok',configured:!!process.env.TIKTOK_ACCESS_TOKEN,description:'Content Posting API • envio privado'}];}
export async function publish(v,platform){
if(platform==='youtube'){
const r=await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',{method:'POST',headers:{Authorization:`Bearer ${process.env.YOUTUBE_ACCESS_TOKEN}`,'Content-Type':'application/json','X-Upload-Content-Type':'video/mp4'},body:JSON.stringify({snippet:{title:v.title,description:v.caption},status:{privacyStatus:'private',selfDeclaredMadeForKids:false}})});
if(!r.ok)throw Error(`YouTube: HTTP ${r.status}`);const location=r.headers.get('location');if(!location)throw Error('YouTube não retornou URL de upload');return (await remote(location,{method:'PUT',headers:{'Content-Type':'video/mp4'},body:fs.readFileSync(v.output)})).id;
}
if(platform==='instagram'){
const base=`https://graph.facebook.com/${process.env.META_API_VERSION||'v25.0'}`;
const token=process.env.INSTAGRAM_ACCESS_TOKEN;const account=process.env.INSTAGRAM_USER_ID;
const created=await remote(`${base}/${account}/media`,{method:'POST',body:new URLSearchParams({access_token:token,media_type:'REELS',video_url:`${process.env.PUBLIC_BASE_URL}/media/${v.output.split('/').pop()}`,caption:v.caption||v.title})});
for(let n=0;n<30;n++){const s=await remote(`${base}/${created.id}?fields=status_code&access_token=${encodeURIComponent(token)}`);if(s.status_code==='FINISHED')return (await remote(`${base}/${account}/media_publish`,{method:'POST',body:new URLSearchParams({access_token:token,creation_id:created.id})})).id;if(['ERROR','EXPIRED'].includes(s.status_code))throw Error('Instagram não processou o vídeo');await new Promise(r=>setTimeout(r,2000));}throw Error('Instagram: tempo de processamento excedido; verifique o container antes de tentar novamente');
}
const bytes=fs.readFileSync(v.output);if(bytes.length>64000000)throw Error('TikTok: limite local de upload 64 MB');
const j=await remote('https://open.tiktokapis.com/v2/post/publish/video/init/',{method:'POST',headers:{Authorization:`Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({post_info:{title:v.caption||v.title,privacy_level:'SELF_ONLY',disable_duet:true,disable_stitch:true,disable_comment:true},source_info:{source:'FILE_UPLOAD',video_size:bytes.length,chunk_size:bytes.length,total_chunk_count:1}})});
if(!j.data?.upload_url)throw Error('TikTok recusou a inicialização');const r=await fetch(j.data.upload_url,{method:'PUT',headers:{'Content-Type':'video/mp4','Content-Range':`bytes 0-${bytes.length-1}/${bytes.length}`},body:bytes});if(!r.ok)throw Error(`TikTok upload HTTP ${r.status}`);return j.data.publish_id;
}
