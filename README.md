# GTA 6 Content Engine

Aplicação local em português: React/Vite, Express, SQLite persistente, edição FFmpeg e legendagem local. Esta distribuição contém exemplos editoriais com aprovações, autenticação e agendamentos zerados.

## Rodar

Requer Node 24+ e FFmpeg com libx264/libass no PATH. O ambiente validado é macOS Apple Silicon com Python 3.12 e Arial Black instalada.

```sh
npm ci
cp .env.example .env
# Defina ADMIN_PASSWORD no .env com uma senha própria de ao menos 12 caracteres.
npm run build
npm start
```

Acesse **http://localhost:3000**. Se não definir senha, a primeira inicialização gera uma no terminal. A senha é persistida como scrypt+salt; mudar ADMIN_PASSWORD depois não redefine o banco existente. Não apague o banco de uma operação real para trocar senha.

Para transcrever novos arquivos no ambiente macOS ARM64:

```sh
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements-macos-arm64.txt
HF_HOME=data/models HF_HUB_DISABLE_XET=1 .venv/bin/python scripts/download-caption-model.py
```

O download inicial requer internet. Após instalar os pesos, as falas são transcritas localmente. O render pode reutilizar palavras já conferidas, sem transcrever de novo. Não há suporte MLX pronto em Windows/Linux/Intel; veja o guia.

```sh
npm test
npm run build
node scripts/verify-caption-stability.mjs
```

Os testes não publicam externamente. `tests/browser-check.mjs` é um teste histórico de navegação que cria pautas; adapte ao ambiente isolado antes de executá-lo. Para validar UI pelo Codex, use as ferramentas de navegador disponíveis e confirme a reprodução real da prévia.

## Manual e skill

A documentação principal está em [.agents/skills/gta-content-engine/SKILL.md](.agents/skills/gta-content-engine/SKILL.md), com referências de instalação, arquitetura, edição, publicação, agendamento e problemas conhecidos. O README antigo foi arquivado fora da aplicação porque descreve proporções e estado anteriores.

`data/engine.sqlite` contém biblioteca, criadores e exemplos; settings, sessions, publications e audit estão vazias. Vídeos com saída estão em revisão, sem aprovação e sem data de postagem. Os exemplos podem ter títulos antigos; próximos renders não adicionam título extra por padrão. `data/exports/publication-scope.json` começa sem perfil, sem IDs e com limite zero.

## Operação e limites reais

Planejar cria até dez pautas para o dia em São Paulo; não escolhe momentos virais. Faça a seleção por vídeo, áudio e contexto. Envie fonte e secundário, ajuste crop, início, duração e transcrição; renderize e assista; aprove explicitamente; só então envie ao destino autorizado.

O calendário é editorial, não despacha posts sozinho. API OAuth e browser são fluxos distintos: o código fornece chamadas reais de upload, mas configuração, elegibilidade e renovação dos tokens são manuais. YouTube/TikTok via API usam visibilidade privada; Instagram via API pode publicar um Reel público. Configurado significa variáveis presentes, não acesso verificado. Browser e agendamento nativo não são APIs implementadas no servidor.

É uma central local de um administrador, sem RBAC, fila distribuída, refresh OAuth, monitoramento geral de lives ou pontuação comprovada de viralização. Não expor como produção pública sem preparar implantação e acesso. Nenhum aplicativo deve publicar sem aprovação da versão atual.
