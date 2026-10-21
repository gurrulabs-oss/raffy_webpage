import re
en=open('en/tools/baby-growth-percentile-calculator-who.html').read()
pt=open('pt/ferramentas/calculadora-percentis-bebe-oms.html').read()
m=re.search(r'  <main.*?</main>\n\n  <div class="sticky-cta">.*?</button>\n  </div>\n',en,flags=re.S)
blk=m.group(0)
pairs=[
('<li><a href="../index.html">Home</a></li><li><a href="index.html">Tools</a></li><li>WHO baby growth percentile calculator</li>','<li><a href="../index.html">Início</a></li><li><a href="index.html">Ferramentas</a></li><li>Calculadora OMS de percentis do bebe</li>'),
('>WHO Growth Standards<','>Padroes OMS<'),
('<h1>WHO baby growth <em>percentile</em> calculator</h1>','<h1>Calculadora OMS de <em>percentis</em> do bebe</h1>'),
('Calculate WHO percentiles with one or more measurements: weight, length/height, and head circumference.','Calcule percentis OMS com uma ou mais medidas: peso, altura/comprimento e perimetro cefalico.'),
('</span>WHO Child Growth Standards<','</span>Padrões de crescimento infantil da OMS<'),
('</span>Free</li>','</span>Grátis</li>'),
('</span>No sign-up<','</span>Sem cadastro<'),
('Prefer automatic tracking? Get Raffy on Google Play','Prefere acompanhar automaticamente? Baixe o Raffy no Google Play'),
('<h2>Your baby</h2>','<h2>Seu bebê</h2>'),
('<legend>Sex</legend>','<legend>Sexo</legend>'),
('<span>Girl</span>','<span>Menina</span>'),('<span>Boy</span>','<span>Menino</span>'),
('>Date of birth<','>Data de nascimento<'),('>Date of measurement<','>Data da medicao<'),
('Use corrected age (prematurity)','Usar idade corrigida (prematuridade)'),
('Gestational age at birth (weeks)','Idade gestacional ao nascer (semanas)'),
('<legend>Measurement (fill one or more)</legend>','<legend>Medicao (preencha uma ou mais)</legend>'),
('<span data-label-name>Weight</span>','<span data-label-name>Peso</span>'),
('<span data-label-name>Length/Height</span>','<span data-label-name>Comprimento/Altura</span>'),
('<span data-label-name>Head circumference</span>','<span data-label-name>Perimetro cefalico</span>'),
('You can enter one, two, or all three measurements.','Voce pode informar uma, duas ou as tres medidas.'),
('>Calculate percentile</button>','>Calcular percentil</button>'),
('>Clear</button>','>Limpar</button>'),
('<h2>Result</h2>','<h2>Resultado</h2>'),
('<h3>Your result appears here</h3>','<h3>Seu resultado aparece aqui</h3>'),
("Enter your baby's details and at least one measurement, then tap Calculate percentile to see where they sit on the WHO curve.",'Informe os dados do seu bebê e pelo menos uma medida, depois toque em Calcular percentil para ver onde ele está na curva da OMS.'),
('<h3>Check the highlighted field</h3>','<h3>Confira o campo destacado</h3>'),
('Fix the highlighted field, then tap Calculate percentile again.','Corrija o campo destacado e toque em Calcular percentil de novo.'),
("Educational only. One measurement isn't a diagnosis; the trend over time matters more. Talk to your pediatrician if you're worried.",'Apenas informativo. Uma única medição não é um diagnóstico; a tendência ao longo do tempo importa mais. Converse com o pediatra se algo preocupar você.'),
('Track this over time in Raffy','Acompanhe isso ao longo do tempo no Raffy'),
('Save every measurement and see the curve grow.','Salve cada medição e veja a curva crescer.'),
('Need a complete <em>baby tracking app?</em>','Precisa de um app completo <em>para acompanhar o bebe?</em>'),
('Raffy connects growth charts, feeding, sleep and medical notes in one place.','Raffy conecta curvas de crescimento, alimentacao, sono e notas medicas em um so lugar.'),
('aria-label="Download Raffy in Google Play"','aria-label="Baixar Raffy no Google Play"'),
('Raffy growth chart screen','Tela de gráfico de crescimento do Raffy'),
('Raffy baby tracker<small>Growth, feeding &amp; sleep in one app</small>','Raffy para o bebê<small>Crescimento, alimentação e sono em um só app</small>'),
('>Get the app<','>Baixar o app<'),
('aria-label="Dismiss"','aria-label="Fechar"'),
('aria-label="Growth percentile calculator"','aria-label="Calculadora de percentis de crescimento"'),
]
for a,b in pairs:
    assert a in blk,a
    blk=blk.replace(a,b)
# badges: generic then footer-cta alt existing
blk=blk.replace('aria-label="Get it on Google Play"','aria-label="Baixar no Google Play"').replace('alt="Get it on Google Play"','alt="Disponível no Google Play"')
blk=re.sub(r'(footer-cta" aria-label="Baixar Raffy no Google Play"><img[^>]*alt=)"Disponível no Google Play"',r'\1"Disponivel no Google Play"',blk)
assert not re.search(r'>[^<>]*\b(the|your|Get|and)\b[^<>]*<',blk), re.findall(r'>[^<>]*\b(?:the|your|Get|and)\b[^<>]*<',blk)
pt2=re.sub(r'  <main.*?</main>\n',lambda _:blk,pt,count=1,flags=re.S)
open('pt/ferramentas/calculadora-percentis-bebe-oms.html','w').write(pt2)
