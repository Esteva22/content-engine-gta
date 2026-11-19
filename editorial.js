import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
export const DEFAULT_ART='data/assets/vice-city-sunset-v1.png';
export function runProcess(bin,args,{timeout=30*60*1000}={}){return new Promise((resolve,reject)=>{const p=spawn(bin,args,{stdio:['ignore','pipe','pipe'],env:{...process.env,HF_HOME:path.resolve('data/models')}});let stdout='',stderr='';let timer=setTimeout(()=>{p.kill('SIGTERM');reject(Error('Processamento excedeu o limite de tempo'));},timeout);p.stdout.on('data',d=>stdout=(stdout+d).slice(-10000000));p.stderr.on('data',d=>stderr=(stderr+d).slice(-6000));p.on('error',e=>{clearTimeout(timer);reject(e)});p.on('close',c=>{clearTimeout(timer);c===0?resolve(stdout):reject(Error(stderr||`Processo terminou com código ${c}`))});});}
export function cleanWords(words,duration){if(!Array.isArray(words)||words.length>5000)throw Error('Transcrição inválida');let last=-1;return words.map(w=>{const start=Number(w.start),end=Number(w.end),word=String(w.word||'').trim();if(!word||word.length>100||!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>duration+1||start<last)throw Error('Timestamps ou texto inválidos');last=start;return{start,end,word};});}
const assTime=s=>{const c=Math.max(0,Math.round(s*100));return`${Math.floor(c/360000)}:${String(Math.floor(c/6000)%60).padStart(2,'0')}:${String(Math.floor(c/100)%60).padStart(2,'0')}.${String(c%100).padStart(2,'0')}`;};
const escapeAss=s=>s.replace(/[{}\\]/g,'').replace(/[\r\n]/g,' ').toLocaleUpperCase('pt-BR');
export const editorialPreferences=JSON.parse(fs.readFileSync(path.resolve('editorial-preferences.json'),'utf8'));
export function captionCues(words,duration){
 const ws=cleanWords(words,duration),groups=[];let group=[];
 for(const word of ws){const length=group.reduce((n,w)=>n+w.word.length+1,0);if(group.length&&(group.length>=3||length+word.word.length>18||word.start-group.at(-1).end>.6)){groups.push(group);group=[];}group.push(word);if(/[.!?]$/.test(word.word)){groups.push(group);group=[];}}
 if(group.length)groups.push(group);
 return groups.map((g,i)=>{const start=i===0&&g[0].start<.2?0:Math.max(0,g[0].start-.02);const next=groups[i+1];const nextStart=next?Math.max(0,next[0].start-.02):duration;const gap=next?next[0].start-g.at(-1).end:Infinity;const end=Math.min(duration,nextStart,gap<=.6?nextStart:Math.max(g.at(-1).end+.18,start+.42));return{start,end,words:g};}).filter(c=>c.end>c.start);
}
export function makeAss(words,duration,options={}){
 const cues=captionCues(words,duration);const x=500,y=728;
 let result=`[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Caption,Arial Black,80,&H00FFFFFF,&H0000EFFF,&H00000000,&H80000000,-1,0,0,0,102,100,0,0,1,5,1,5,80,120,0,1\nStyle: Hook,Arial Black,62,&H0000EFFF,&H0000EFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,5,1,5,90,130,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
 for(const cue of cues){
  const text=cue.words.map(w=>{const a=Math.max(0,Math.round((w.start-cue.start)*1000)),b=Math.max(a+1,Math.round((w.end-cue.start)*1000));return`{\\rCaption\\c&H00FFFFFF&\\t(${a},${a+1},\\c&H0000EFFF&)\\t(${b},${b+1},\\c&H00FFFFFF&)}${escapeAss(w.word)}`;}).join(' ');
  result+=`Dialogue: 0,${assTime(cue.start)},${assTime(cue.end)},Caption,,0,0,0,,{\\an5\\pos(${x},${y})\\b900}${text}\n`;
 }
 if(options.hook&&(options.showOpeningTitle??editorialPreferences.openingTitle??false)){const clean=escapeAss(String(options.hook).slice(0,90));const chunks=[];let line='';for(const word of clean.split(/\s+/)){if(line&&line.length+word.length+1>25){chunks.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)chunks.push(line);result+=`Dialogue: 1,0:00:00.00,${assTime(Math.min(6,Math.max(.5,Number(options.hookDuration)||2.1),duration))},Hook,,0,0,0,,{\\an5\\pos(500,855)}${chunks.slice(0,2).join('\\N')}\n`;}
 return result;
}
export function validateCrop(crop){if(crop==null)return null;if(!['x','y','w','h'].every(k=>Number.isFinite(crop[k]))||crop.x<0||crop.y<0||crop.w<=0||crop.h<=0||crop.x+crop.w>1.001||crop.y+crop.h>1.001)throw Error('Enquadramento deve estar dentro da imagem (valores de 0 a 1)');return crop;}
export async function renderEditorial(v,config={},providedWords){
 const prefix=`data/media/${crypto.randomUUID()}`;const output=prefix+'.mp4',thumbnail=prefix+'.jpg',subtitles=prefix+'.ass',transcript=prefix+'.json';
 const start=Number(v.start||0),duration=Number(v.duration);const info=JSON.parse(await runProcess('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height','-of','json',v.source]));const hasAudio=info.streams.some(s=>s.codec_type==='audio');
 let words=providedWords;
 if(words===undefined&&hasAudio){if(!fs.existsSync('.venv/bin/python'))throw Error('Instale o transcritor local: consulte o README');const raw=await runProcess(path.resolve('.venv/bin/python'),['scripts/transcribe-clip.py',v.source,String(start),String(duration),transcript]);words=JSON.parse(fs.readFileSync(transcript,'utf8')).words;}
 words=cleanWords(words||[],duration);fs.writeFileSync(transcript,JSON.stringify({language:'pt',words},null,2));fs.writeFileSync(subtitles,makeAss(words,duration,config));
 const crop=validateCrop(config.speakerCrop);const cropFilter=crop?`crop=w='trunc(iw*${crop.w}/2)*2':h='trunc(ih*${crop.h}/2)*2':x='trunc(iw*${crop.x}/2)*2':y='trunc(ih*${crop.y}/2)*2',`:'';
 const gameplay=config.visualMode==='gameplay'&&v.secondary;
 if(!gameplay&&!fs.existsSync(DEFAULT_ART))throw Error('Arte de apoio ainda não foi configurada');
 const inputs=['-ss',String(start),'-i',v.source,...(gameplay?['-stream_loop','-1','-ss',String(v.secondary===v.source?start:0),'-i',v.secondary]:['-loop','1','-framerate','30','-i',DEFAULT_ART])];
 const filters=`[0:v]${cropFilter}scale=1080:576:force_original_aspect_ratio=increase,crop=1080:576,setsar=1,fps=30,setpts=PTS-STARTPTS,pad=1080:720:0:144:color=0x0e1015[top];[1:v]scale=1080:1200:force_original_aspect_ratio=increase,crop=1080:1200,setsar=1,fps=30,setpts=PTS-STARTPTS[bottom];[top][bottom]vstack=inputs=2:shortest=1,subtitles=${subtitles}:fontsdir=/System/Library/Fonts/Supplemental${!gameplay?",drawtext=fontfile='/System/Library/Fonts/Supplemental/Arial.ttf':text='ARTE ILUSTRATIVA - IA':fontsize=18:fontcolor=white@0.7:box=1:boxcolor=black@0.35:boxborderw=6:x=36:y=h-58":''}[out]`;
 await runProcess(process.env.FFMPEG_PATH||'ffmpeg',['-v','error','-y',...inputs,'-filter_complex',filters,'-map','[out]','-map','0:a?','-t',String(duration),'-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-movflags','+faststart',output]);
 await runProcess(process.env.FFMPEG_PATH||'ffmpeg',['-v','error','-y','-ss',String(Math.min(2,duration/2)),'-i',output,'-frames:v','1',thumbnail]);
 return{output,thumbnail,subtitles,transcript,words,visualMode:gameplay?'gameplay':'art',...(!hasAudio?{warning:'Fonte sem faixa de áudio; não há legendas de fala.'}:!words.length?{warning:'Nenhuma fala reconhecida. Verifique o áudio antes de aprovar.'}:{})};
}
