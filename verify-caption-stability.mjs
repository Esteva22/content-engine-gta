// Regression check on rendered frames, not only subtitle markup.
import fs from 'node:fs';import{spawnSync}from'node:child_process';import assert from'node:assert/strict';import{makeAss}from'../server/editorial.js';
const dir='data/editorial/validation-v3';fs.mkdirSync(dir,{recursive:true});
const words=[{word:'FOI',start:0,end:.4},{word:'MUITO',start:.4,end:.8},{word:'RÁPIDO',start:.8,end:1.3}];
fs.writeFileSync(`${dir}/caption-stability.ass`,makeAss(words,1.5));
const r=spawnSync('ffmpeg',['-v','error','-f','lavfi','-i','color=c=black:s=1080x1920:r=30:d=1.3','-vf',`subtitles=${dir}/caption-stability.ass:fontsdir=/System/Library/Fonts/Supplemental,crop=980:160:0:648,format=gray`,'-f','rawvideo','pipe:1'],{maxBuffer:20e6});assert.equal(r.status,0,r.stderr?.toString());
const frameSize=980*160,areas=[];for(let off=0;off+frameSize<=r.stdout.length;off+=frameSize){let count=0;for(let p=off;p<off+frameSize;p++)if(r.stdout[p]>120)count++;areas.push(count);}
assert.equal(areas.length,39);assert.ok(Math.min(...areas)>1000);const ratio=Math.min(...areas)/Math.max(...areas);assert.ok(ratio>.97,`Glyph area dipped: ${ratio}`);
const report={frames:areas.length,minVisiblePixels:Math.min(...areas),maxVisiblePixels:Math.max(...areas),minToMaxRatio:ratio,blankFrames:areas.filter(n=>!n).length,result:'pass',method:'Same phrase continuously rendered through three word highlights; white/yellow glyph area must remain within 3%.'};fs.writeFileSync(`${dir}/caption-stability-report.json`,JSON.stringify(report,null,2));console.log(report);
