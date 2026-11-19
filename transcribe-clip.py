import json,sys,tempfile,subprocess,os
import mlx_whisper
source,start,duration,target=sys.argv[1:]
with tempfile.TemporaryDirectory(prefix='gta-captions-') as folder:
 audio=os.path.join(folder,'audio.wav')
 subprocess.run(['ffmpeg','-v','error','-y','-ss',start,'-i',source,'-t',duration,'-vn','-ar','16000','-ac','1',audio],check=True)
 r=mlx_whisper.transcribe(audio,path_or_hf_repo=os.environ.get('WHISPER_MODEL','data/models/whisper-turbo-4bit'),language='pt',word_timestamps=True,verbose=None,condition_on_previous_text=False,hallucination_silence_threshold=2)
 words=[{'start':max(0,w['start']),'end':min(float(duration),w['end']),'word':w['word'].strip()} for s in r['segments'] for w in s.get('words',[]) if w['end']>w['start'] and w['start']<float(duration)]
 with open(target,'w') as f:json.dump({'language':'pt','text':r['text'],'words':words},f,ensure_ascii=False,indent=2)
 print('Transcrição local concluída.')
