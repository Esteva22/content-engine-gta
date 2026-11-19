# Diagnóstico do lote anterior

No arquivo ASS do vídeo publicado #12 foram encontrados 21 eventos e 21 aplicações de `\\fad(35,0)`. O fade reiniciava em cada palavra: 35 ms correspondem a 1,05 quadro em 30 fps. Esta é uma causa direta de variação de opacidade percebida como piscada.

Correção: um evento contínuo por bloco de legenda, sem fade nem transformação de opacidade. O amarelo muda por palavra dentro do mesmo evento. As bordas entre blocos compartilham o mesmo timestamp; pausas curtas não apagam o texto.

O criador ocupava y=0 a y=780. A interface superior das redes podia cobrir cabelo/rosto. O teste novo reserva os 144 px superiores, reduz a faixa da câmera para 576 px e mantém o rosto abaixo da navegação. Gameplay ganha 1200 px. Máscaras de interface serão usadas para QA; são margens conservadoras de teste, não medidas universais das plataformas.

Feedback mais recente: manter a legenda grande e marcante, um pouco mais bold; não deixá-la discreta. Cortes novos somente para validação, sem publicação.
