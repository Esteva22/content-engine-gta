from huggingface_hub import snapshot_download
from pathlib import Path
folder=Path('data/models/whisper-turbo-4bit')
snapshot_download('mlx-community/whisper-large-v3-turbo-4bit',local_dir=folder)
weights=folder/'weights.safetensors'
if not weights.exists():weights.symlink_to('model.safetensors')
print('Modelo local de legendagem pronto.',flush=True)
