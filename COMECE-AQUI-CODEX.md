# Prompt para colar no Codex do destinatário

Quero executar e evoluir o GTA 6 Content Engine contido nesta pasta, mantendo o padrão editorial e operacional documentado. Use o código fornecido como base; não substitua por um protótipo superficial nem anuncie integrações que não estão funcionando.

Abra `projeto/` como workspace. Leia `AGENTS.md`, `README.md` e `.agents/skills/gta-content-engine/SKILL.md`. Siga os manuais relevantes da skill. Respeite as minhas instruções atuais acima das preferências históricas.

Primeiro inspecione sistema, arquitetura da CPU, Node, Python, FFmpeg com libass/libx264, fontes e espaço disponível. Instale dependências pelo lockfile JS. Para transcrição, use MLX/Whisper em Apple Silicon conforme o guia. Em outro sistema, explique a adaptação necessária e implemente/teste um backend compatível antes de prometer legendagem. Nunca desative TLS para resolver erros de rede. Não peça senhas nem tokens pelo chat.

Configure um `.env` local com autenticação própria, no servidor. O banco demonstrativo tem exemplos e referências, mas não contém autenticação nem aprovações. Não tente reutilizar as contas, aprovações, datas, caminhos absolutos, IDs de automação ou permissões do autor original. Não execute scripts históricos como se fossem rotinas genéricas. Eles estão em `../historico/scripts/` como texto justamente por terem IDs e autorizações de outro contexto.

Execute `npm test`, `npm run build` e `npm start`. Mostre o endereço de acesso e confirme a reprodução das prévias. Não encerre só com um plano. Entregue a central funcionando no meu computador e diga claramente o que ficou dependente de configuração externa.

Preserve dashboard escuro, biblioteca de referências, radar dos sete criadores, fila diária de dez pautas, persistência SQLite, editor de enquadramento/transcrição, thumbnails, prévia, aprovação manual, calendário e conectores. O radar real usa YouTube com chave/IDs oficiais; não finja monitoramento completo de lives ou previsão de viralização. O calendário local organiza horários; sozinho não envia posts.

O render é FFmpeg, sem Google Flow na edição normal. Use como padrão novo: 1080×1920, 30 fps, reserva superior de 144 px, câmera de 576 px, gameplay de 1200 px, legenda em torno de x=500/y=728. Arial Black 80, contorno preto 5, sombra 1, branco e amarelo, até três palavras/18 caracteres por grupo. Faça ajuste visual por tomada e fonte; os valores não substituem inspeção.

Mantenha legenda forte, um pouco mais bold. Nunca reinicie fade por palavra. Use um evento contínuo por bloco de frase, mudando somente a cor da palavra ativa, sem animação de opacidade. Teste o vídeo renderizado, não só o texto ASS. Os cinco vídeos em `data/exports/validacao-v3/` têm um título extra antigo: não remova os arquivos de referência, mas não reproduza esse título nos próximos cortes. O gancho novo deve vir da fala ou ação já no início.

Escolha momentos pelo conteúdo: assista imagem e áudio, leia a transcrição, confira começo/contexto/desfecho e compare com o que já foi usado. Priorize gameplay com ação, falha, susto, surpresa ou reação forte. Não escolha apenas timestamps regulares, volume do áudio ou número de views. Não garanta viralização. Corte esperas e trechos mortos; preserve áudio de tiros, perseguição e efeitos relevantes mesmo sem fala. Se não houver gameplay, use apoio visual bonito e claramente ilustrativo de GTA VI, mantendo o criador acima.

Preserve as referências, inclusive https://x.com/everestchris6/status/2122741990018494669 e a imagem local de legendas. Não diga que consultou o link ao vivo se só examinou a referência salva.

Antes de publicar, peça minha aprovação dos vídeos e confirme plataforma, perfil, quantidade e cadência quando ainda não definidos. Aprovar uma versão não autoriza novos vídeos ou outras contas. Posso autorizar um lote inteiro explicitamente. Qualquer mudança posterior exige nova revisão. Não publique todos ao mesmo tempo: primeiro um em cada rede; depois pares com intervalo de 30 minutos, nos horários que eu autorizar.

Prefira agendamento nativo confirmado. No TikTok Studio, use Programar, data, hora, fuso e visibilidade Todos quando eu quiser publicação pública. Confira o item na lista depois de salvar. Se o Instagram não oferecer agendamento web, confira a elegibilidade da agenda Meta sem mudar minha conta ou aceitar termos em meu nome. Uma automação local do Codex é alternativa, mas precisa ser criada pela ferramenta de automações e depende do computador ligado, internet e Codex aberto. Uma linha no calendário ou um JSON não é prova de agendamento real.

Use conectores disponíveis quando suficientes; caso contrário use o navegador oficial via ferramentas de computador disponíveis. Não suponha que este computador tenha os mesmos plugins. Não exporte cookies ou credenciais. Registre envio por vídeo e plataforma, confirme sucesso e salve comprovante. Nunca repita automaticamente uma tentativa incerta.

Documente novas decisões e o que eu gostar ou não gostar em `EDITORIAL_PREFERENCES.md` e `editorial-preferences.json`. Antes de novos lotes, leia essas preferências. Para aprender, registre decisões específicas, sem transformar todos os exemplos antigos em regras permanentes.
