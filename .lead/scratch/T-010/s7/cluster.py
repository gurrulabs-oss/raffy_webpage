import re
common=[
('<li><a href="../index.html">Home</a></li><li><a href="index.html">Tools</a></li>','<li><a href="../index.html">Início</a></li><li><a href="index.html">Ferramentas</a></li>'),
('Prefer automatic tracking? Get Raffy on Google Play','Prefere acompanhar automaticamente? Baixe o Raffy no Google Play'),
('<h2>Your baby</h2>','<h2>Seu bebê</h2>'),
('<h3>Your plan appears here</h3>','<h3>Seu plano aparece aqui</h3>'),
('>Generate plan</button>','>Gerar plano</button>'),('>Reset</button>','>Redefinir</button>'),
('Read guide</a>','Ler guia</a>'),
('Open tool: Weekly meal planner','Abrir ferramenta: Planejador de cardápio semanal'),
('href="weekly-meal-planner-12-23-months.html"','href="planejador-cardapio-semanal-12-23-meses.html"'),
('Need a complete <em>baby tracking app?</em>','Precisa de um <em>app completo de acompanhamento do bebê?</em>'),
('Raffy connects growth charts, feeding, sleep and medical notes in one place.','O Raffy reúne curvas de crescimento, alimentação, sono e anotações médicas em um só lugar.'),
('Raffy baby tracker<small>Free · Android</small>','Raffy para o bebê<small>Grátis · Android</small>'),
('>Get the app<','>Baixar o app<'),('aria-label="Dismiss"','aria-label="Fechar"'),
('data-locale="en"','data-locale="pt"'),
]
age=lambda lo,hi:[(f'From {lo} to {hi} months.',f'De {lo} a {hi} meses.'),(f'Enter a whole number of months from {lo} to {hi}.',f'Informe um número inteiro de meses de {lo} a {hi}.'),('>Age (months)<','>Idade (meses)<')]
errfix=[('<h3>Fix the highlighted field, then tap Generate plan again.','')]
def one(en,pt,pairs):
    e=open(f'en/tools/{en}.html').read(); p=open(f'pt/ferramentas/{pt}.html').read()
    blk=re.search(r'  <main.*?</main>\n\s*<div class="sticky-cta">.*?</button>\n  </div>\n',e,flags=re.S).group(0)
    for a,b in common+pairs:
        assert a in blk,(en,a)
        blk=blk.replace(a,b)
    blk=blk.replace('aria-label="Get it on Google Play"','aria-label="Baixar no Google Play"').replace('alt="Get it on Google Play"','alt="Disponível no Google Play"')
    left=re.findall(r'>[^<>]*\b(?:the|your|Get|and|Enter|Fix|Log|Check|tool)\b[^<>]*<',blk)
    assert not left,left
    q=re.sub(r'  <main.*?</main>\n',lambda _:blk,p,count=1,flags=re.S)
    open(f'pt/ferramentas/{pt}.html','w').write(q)
fixf='Corrija o campo destacado e toque em Gerar plano de novo.'; fixs='Corrija os campos destacados e toque em Gerar plano de novo.'
one('wake-window-planner','planejador-janelas-vigilia',age(0,36)+[
('Wake window planner</li>','Planejador de janelas de vigília por idade</li>'),
('Sleep tool','Ferramenta de sono'),
('<h1><em>Wake Window</em> Planner by Age</h1>','<h1>Planejador de <em>janelas de vigília</em> por idade</h1>'),
('Estimate wake windows and nap structure by age to build calmer daily sleep rhythms.','Estime janelas de vigília e estrutura de sonecas por idade para rotinas mais previsíveis.'),
('aria-label="Wake window planner"','aria-label="Planejador de janelas de vigília"'),
('<h3>Check the age</h3>','<h3>Confira a idade</h3>'),
('Fix the highlighted field, then tap Generate plan again.',fixf),
("Enter your baby's age and tap Generate plan to see wake windows and nap count.",'Informe a idade do bebê e toque em Gerar plano para ver as janelas de vigília e o número de sonecas.'),
('Log naps in Raffy and see if the plan works over the week.','Registre as sonecas no Raffy e veja se o plano funciona ao longo da semana.'),
('Raffy sleep screen','Tela de sono no Raffy'),
])
one('nap-transition-helper','ajudante-transicao-sonecas',age(0,36)+[
('Nap transition helper</li>','Ajudante de transição de sonecas</li>'),
('Sleep tool','Ferramenta de sono'),
('<h1><em>Nap Transition</em> Helper</h1>','<h1>Ajudante de <em>transição de sonecas</em></h1>'),
('Check if your baby is approaching a nap transition and get step-by-step adjustment tips.','Verifique se uma transição de sonecas está chegando e receba ajustes práticos.'),
('aria-label="Nap transition helper"','aria-label="Ajudante de transição de sonecas"'),
('>Current naps/day<','>Sonecas atuais/dia<'),
('From 1 to 5 naps a day.','De 1 a 5 sonecas por dia.'),
('Enter a whole number of naps from 1 to 5.','Informe um número inteiro de sonecas de 1 a 5.'),
('<h3>Check the values</h3>','<h3>Confira os valores</h3>'),
('Fix the highlighted fields, then tap Generate plan again.',fixs),
("Enter your baby's age and current naps, then tap Generate plan to see if a nap transition is near.",'Informe a idade do bebê e as sonecas atuais, depois toque em Gerar plano para ver se uma transição está chegando.'),
('Log naps in Raffy and see how the transition is going.','Registre as sonecas no Raffy e acompanhe como a transição está indo.'),
('Raffy sleep screen','Tela de sono no Raffy'),
])
one('diaper-output-tracker','calculadora-fraldas-eliminacao',age(0,36)+[
('Diaper output tracker</li>','Calculadora de fraldas e eliminações por idade</li>'),
('Health tool','Ferramenta de saúde'),
('<h1><em>Diaper Output</em> Tracker by Age</h1>','<h1>Calculadora de <em>fraldas e eliminações</em> por idade</h1>'),
('Track wet diapers and stools to monitor hydration and know when to escalate care.','Registre fraldas molhadas e evacuações para monitorar hidratação e sinais de alerta.'),
('aria-label="Diaper output tracker"','aria-label="Calculadora de fraldas e eliminações"'),
('>Wet diapers/day<','>Fraldas molhadas/dia<'),('>Stools/day<','>Evacuações/dia<'),
('From 0 to 14 a day.','De 0 a 14 por dia.'),('Enter a whole number from 0 to 14.','Informe um número inteiro de 0 a 14.'),
('From 0 to 8 a day.','De 0 a 8 por dia.'),('Enter a whole number from 0 to 8.','Informe um número inteiro de 0 a 8.'),
('<span>Warning signs present</span>','<span>Há sinais de alerta</span>'),
('<h3>Check the values</h3>','<h3>Confira os valores</h3>'),
('Fix the highlighted fields, then tap Generate plan again.',fixs),
('Enter age and diaper counts, then tap Generate plan to see a hydration and output check.','Informe a idade e o número de fraldas, depois toque em Gerar plano para ver a verificação de hidratação e eliminações.'),
('Log diapers in Raffy and spot changes in output over the week.','Registre as fraldas no Raffy e perceba mudanças nas eliminações ao longo da semana.'),
('Raffy feeding screen','Tela de alimentação no Raffy'),
])
one('feeding-quantity-estimator','estimador-quantidade-alimentacao',age(4,36)+[
('Feeding quantity estimator</li>','Estimador de quantidade alimentar por idade</li>'),
('Feeding tool','Ferramenta de alimentação'),
('<h1><em>Feeding Quantity</em> Estimator by Age</h1>','<h1>Estimador de <em>quantidade alimentar</em> por idade</h1>'),
('Estimate daily intake targets by age, weight, and number of meals for practical planning.','Estime metas de ingestão diária por idade, peso e número de refeições.'),
('aria-label="Feeding quantity estimator"','aria-label="Estimador de quantidade alimentar"'),
('>Weight (kg)<','>Peso (kg)<'),('>Meals/day<','>Refeições/dia<'),
('From 3 to 20 kg.','De 3 a 20 kg.'),('Enter a weight from 3 to 20 kg.','Informe um peso de 3 a 20 kg.'),
('From 3 to 7 meals a day.','De 3 a 7 refeições por dia.'),('Enter a whole number of meals from 3 to 7.','Informe um número inteiro de refeições de 3 a 7.'),
('<h3>Check the values</h3>','<h3>Confira os valores</h3>'),
('Fix the highlighted fields, then tap Generate plan again.',fixs),
('Enter age, weight and meals per day, then tap Generate plan to see daily intake targets.','Informe idade, peso e refeições por dia, depois toque em Gerar plano para ver as metas de ingestão diária.'),
("Log feeds in Raffy and see how your baby's intake adds up over the week.",'Registre as mamadas e refeições no Raffy e veja quanto o bebê ingere ao longo da semana.'),
('Raffy feeding screen','Tela de alimentação no Raffy'),
])
one('solids-progression-planner','planejador-progresso-alimentacao',age(4,24)+[
('Solids progression planner</li>','Planejador de progressão alimentar por idade</li>'),
('Feeding tool','Ferramenta de alimentação'),
('<h1><em>Solids Progression</em> Planner by Age</h1>','<h1>Planejador de <em>progressão alimentar</em> por idade</h1>'),
('Plan texture progression and food variety week by week for complementary feeding.','Planeje progressão de texturas e variedade alimentar semanal na introdução alimentar.'),
('aria-label="Solids progression planner"','aria-label="Planejador de progressão alimentar"'),
('>Current texture stage<','>Estágio atual de textura<'),
('>Puree<','>Purê<'),('>Mashed<','>Amassado<'),('>Finger food<','>Alimentos em pedaços<'),
('<h3>Check the age</h3>','<h3>Confira a idade</h3>'),
('Fix the highlighted field, then tap Generate plan again.',fixf),
('Enter age and texture stage, then tap Generate plan to see your next steps.','Informe a idade e o estágio de textura, depois toque em Gerar plano para ver os próximos passos.'),
('Log solids in Raffy and track new foods and textures week by week.','Registre a introdução alimentar no Raffy e acompanhe novos alimentos e texturas semana a semana.'),
('Raffy feeding screen','Tela de alimentação no Raffy'),
])
