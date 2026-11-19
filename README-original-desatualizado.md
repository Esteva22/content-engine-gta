# GTA 6 Content Engine

Central full-stack local em português: React + Vite, Express, SQLite persistente e FFmpeg. Requer Node 24+ e FFmpeg com libx264 no PATH. Não utiliza Google Flow.

## Executar

```sh
npm install
cp .env.example .env
# Edite .env e defina ADMIN_PASSWORD com pelo menos 12 caracteres.
npm run build
npm start
```

Acesse **http://localhost:3000**. A senha vem de ADMIN_PASSWORD na primeira inicialização. Se omitida, o servidor gera e mostra uma senha no terminal uma única vez. A senha fica armazenada como scrypt + salt no SQLite, nunca em texto puro. Alterar ADMIN_PASSWORD depois não altera o usuário existente. Não perca a senha. Para desenvolvimento: `npm run dev` e, em outro terminal, `npm run dev:ui` (http://localhost:5173).

## Operação

1. Planejar 10 vídeos cria dez pautas para o dia em São Paulo, sem duplicá-las ao clicar novamente. Planejamento é manual; não existe cron automático.
2. Na produção, abrir uma pauta, enviar um vídeo principal e opcionalmente outro para a metade inferior. Usar apenas material autorizado. Referências são links, não downloads automáticos.
3. Salvar início, duração de 1 a 180 segundos, título, legenda e horário editorial. Renderizar gera MP4 H.264/AAC 1080×1920, 30 fps, tela dividida. Sem secundário, a metade inferior usa a arte gerada de Vice City. O render inclui transcrição local e legendas sincronizadas; a seleção editorial e a conferência do texto continuam necessárias.
4. Assistir à prévia, enviar capa personalizada se desejado, renderizar novamente e aprovar explicitamente a versão. Alterações de arquivos e metadados revogam a aprovação. Aprovar não publica.
5. Enviar manualmente por plataforma após confirmação. Nenhum calendário, job ou rotina publica sozinho. Horário é organizacional e não dispara upload.

SQLite e mídias ficam em `data/`. Faça backup dos dois juntos. Sessões expiram em 12h, tokens são armazenados no banco como SHA-256. Login limitado a 10 tentativas por 15 minutos. Uploads de até 500 MB. Mídias privadas exigem sessão; somente o arquivo aprovado em envio ao Instagram fica temporariamente público para o provedor. Não coloque `.env` ou `data` no Git.

## Conectores reais

Credenciais são lidas exclusivamente pelo servidor de `.env`. A interface mostra presença de configuração, não validação de acesso. Configure e reinicie o servidor. Não houve upload externo nos testes.

- **Radar YouTube:** `YOUTUBE_API_KEY`, YouTube Data API habilitada e IDs oficiais `UC...` dos canais na tela Radar. Sincronizar lê `channels.list` e os cinco itens mais recentes da playlist de uploads e salva links na biblioteca. Não inventa métricas, não verifica automaticamente a relevância para GTA e não monitora Twitch/X. Os sete criadores solicitados estão cadastrados; handles são sugestões de busca, IDs devem ser verificados pelo operador.
- **YouTube:** `YOUTUBE_ACCESS_TOKEN`, OAuth com escopo `https://www.googleapis.com/auth/youtube.upload`. Upload resumível real via `videos.insert`, sempre privado. A capa é gerenciada localmente; não há envio de thumbnail ao provedor.
- **Instagram:** `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`, `META_API_VERSION` compatível com o app Meta e `PUBLIC_BASE_URL` HTTPS acessível pela Meta. Fluxo Facebook Login/Graph API para conta profissional, com permissões de publicação aprovadas. Cria container REELS, aguarda processamento e publica somente no clique explícito de envio após aprovação. **O Reel fica público conforme a conta.** A URL pública deve servir a aplicação via proxy HTTPS; nunca exponha a porta sem HTTPS.
- **TikTok:** `TIKTOK_ACCESS_TOKEN` com `video.publish` e acesso à Content Posting API. Inicialização Direct Post e upload binário real, visibilidade `SELF_ONLY`, até 64 MB. App e usuário precisam ser elegíveis. O retorno é aceitação do upload, não confirmação final de processamento/publicação. Preferências públicas e polling de status ainda não implementados.

A aquisição/renovação de tokens OAuth ainda é manual, no servidor; não há assistente de conexão OAuth nem refresh automático. Não compartilhe tokens no navegador ou chat. Se o token expirar, substitua no `.env` e reinicie. Apps podem exigir revisão/auditoria dos provedores. Envios recebem registro único por vídeo/plataforma. Em falha ou resultado incerto, tentativas automáticas são bloqueadas: consulte o provedor antes de qualquer intervenção no banco para evitar duplicação. O MVP não oferece recuperação de uploads interrompidos.

A referência `https://x.com/everestchris6/status/2122741990018494669` está preservada. O navegador permitiu consultar parte do guia, incluindo o quadro sobre seleção e edição; a referência visual de legendas enviada pelo usuário foi salva localmente. Outras referências anteriores não estavam disponíveis no contexto/pasta; podem ser adicionadas pela biblioteca.

## Testar

```sh
npm test
npm run build
```

O teste integra autenticação, persistência após reinício, planejamento idempotente, bloqueio de publicação sem aprovação, renderização real por FFmpeg, aprovação e revogação após alteração de metadados ou palavras da legenda. Testes adicionais verificam comandos ASS, limites de crop e ausência de sobreposição entre legendas. Sem chamadas de publicação externas.

## Limites de implantação

Projeto para uso local de um administrador. Para internet: proxy HTTPS, `COOKIE_SECURE=true`, controle de acesso à rede, backups e política de retenção. Configure HOST somente se precisar de acesso remoto. Não há múltiplos usuários, RBAC, fila distribuída, refresh OAuth ou recuperação automática de render. As renderizações rodam no processo local; aguarde uma terminar antes de iniciar várias para não sobrecarregar a máquina. Não se apresenta como produto oficial Rockstar.

Documentação: https://developers.google.com/youtube/v3/docs/videos/insert ; https://developers.tiktok.com/docs/content-posting-api-get-started ; https://developers.facebook.com/docs/instagram-platform/content-publishing/

Auditoria npm nesta entrega: cinco alertas de severidade alta na cadeia de desenvolvimento picomatch → tinyglobby → Vite/plugin-react. `npm audit fix` não resolve sem downgrade incompatível. Esses pacotes não são usados pelo servidor Express em produção; reavaliar antes de expor o ambiente de desenvolvimento.

## Formato editorial com legendas (atualização)

O render padrão agora usa criador na parte superior (780 px), gameplay ou arte na parte inferior (1140 px) e legendas grandes na divisão. A arte ilustrativa gerada está em `data/assets/vice-city-sunset-v1.png`; não é apresentada como gameplay. O painel do estúdio permite ajustar o enquadramento por porcentagem e corrigir palavras preservando timestamps. Salvar qualquer ajuste revoga a aprovação. A transcrição é automática e deve ser conferida.

Preparação local no Mac Apple Silicon:

```sh
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python mlx-whisper pillow
HF_HUB_DISABLE_XET=1 HF_HOME=data/models .venv/bin/python scripts/download-caption-model.py
```

O modelo compacto vem de `mlx-community/whisper-large-v3-turbo-4bit`, fica no próprio projeto e não exige API key. A primeira instalação exige internet. Depois a fala é processada localmente. O render exige FFmpeg com libass e utiliza Arial Black instalado no macOS. Os arquivos ASS e JSON de palavras ficam em `data/media/` junto às saídas. Esta implementação de transcrição foi preparada para Apple Silicon; outros sistemas exigem outro backend de transcrição.

`server/editorial.js` é o render compartilhado pelo servidor e pelos scripts editoriais. `scripts/transcribe-editorial.py` transcreve a gravação inteira em blocos e preserva timestamps absolutos; não escolhe cortes sozinho. Seleção editorial deve registrar razão, contexto, fonte e riscos. A rotina antiga `prepare-kick-candidates.mjs` produzia amostras por intervalo e não deve ser usada como seleção de melhores momentos. Ela foi mantida somente para histórico técnico.

Critérios editoriais: gancho nos primeiros segundos, clareza sem depender de longo contexto, reação ou opinião específica, informação/pergunta que gere conversa, conclusão completa e relevância para GTA. Evitar trechos vazios, frases interrompidas, duplicatas e afirmações retiradas de contexto. Potencial editorial não é previsão ou garantia de viralização; sem dados de alcance não há pontuação estatística real.

O lote revisto está em `data/editorial/curated-plan.json` e o resultado em `data/editorial/curated-report.json`. Foram avaliadas falas de amostras da gravação e seis clipes públicos, com transcrição mais precisa dos intervalos escolhidos; isto não representa uma revisão integral das 2h55 da transmissão. Os intervalos descartados e as fontes continuam preservados. Sinais públicos de visualizações são apenas os valores coletados, e visualizações/idade do clipe é uma média acumulada, não uma medição de alcance na última hora. O modelo não prevê viralização. A transcrição é revisável no estúdio e ainda precisa da aprovação humana.
