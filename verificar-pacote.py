"""Execute antes de inicializar/editar: python3 tools/verificar-pacote.py."""
from pathlib import Path
import hashlib,json,sqlite3,sys
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'MANIFESTO-SHA256.json').read_text())
errors=[]
for item in manifest['files']:
 p=root/item['path']
 if not p.is_file():errors.append('Ausente: '+item['path']);continue
 h=hashlib.sha256()
 with p.open('rb') as f:
  while chunk:=f.read(4*1024*1024):h.update(chunk)
 if h.hexdigest()!=item['sha256']:errors.append('Alterado: '+item['path'])
if errors:
 print('\n'.join(errors));sys.exit(1)
with sqlite3.connect('file:'+str(root/'projeto/data/engine.sqlite')+'?mode=ro',uri=True) as db:
 assert db.execute('pragma integrity_check').fetchone()[0]=='ok'
 for table in ['settings','sessions','publications','audit']:assert db.execute('select count(*) from '+table).fetchone()[0]==0,'Banco já utilizado ou conteúdo inesperado: '+table
 assert db.execute('select count(*) from videos where approved_at is not null or scheduled is not null').fetchone()[0]==0
print(f"OK: {len(manifest['files'])} arquivos íntegros e banco demonstrativo sem autenticação/aprovações. Instale dependências e configure sua própria conta.")
