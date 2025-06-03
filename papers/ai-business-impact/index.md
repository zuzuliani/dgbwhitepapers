---
title_main: AI Business Impact
title_accent: Assessment
year: 2025
author: Mateus Zuliani
role: Sócio na DGB|Consultores
author_photo: /images/author.jpg
contact: mateus@dgbconsultores.com.br
website: www.dgbconsultores.com.br
toc: true
---

## INTRODUÇÃO

"A sociedade está andando sonâmbula em direção a uma disrupção maciça no mercado de trabalho." A frase é de Dario Amodei, CEO da Anthropic, uma das empresas líderes em inteligência artificial no mundo. Em recente entrevista, ele alertou que estamos prestes a testemunhar um verdadeiro "banho de sangue" nos empregos de colarinho branco — com até metade dessas funções potencialmente impactadas pelas novas tecnologias nos próximos anos.

Foi esse alerta que serviu como fagulha para a realização deste estudo. A inteligência artificial (IA) está avançando em uma velocidade sem precedentes. Em poucos anos, deixou de ser uma promessa distante para se tornar uma força concreta de transformação nos negócios.

> "AI could wipe out half of all entry-level white-collar jobs — and spike unemployment to 10-20% in the next one to five years"
> <footer>Dario Amodei — CEO of Anthropic</footer>

Este estudo teve como objetivo entender como a IA impacta a cadeia de valor dos negócios. Para isso, realizamos uma análise detalhada de mais de 1.300 atividades distintas, agrupadas em 13 grandes categorias organizacionais. O foco foi mensurar, no nível da atividade, tanto o impacto potencial nos negócios quanto o grau de automatização viável com as tecnologias atuais.

A própria análise foi conduzida com o suporte de IA, o que nos permitiu concluir um trabalho que, antes, exigiria dias de esforço manual, em apenas algumas horas.

O futuro do trabalho já começou. Este estudo oferece uma bússola para quem quer liderar — e não apenas reagir — a essa transformação.

[PAGEBREAK]

## METODOLOGIA
### Algoritmo

Para este estudo, foi utilizado como base a última versão do "Process Classification Framework - Cross-Industry", da APQC. O framework fornece uma base de 1300 atividades, divididas em Categorias, Grupos de Processos e Processos.

Para analisar as 1300 atividades presentes no documento, um algoritmo utilizando Python e ChatGPT 4o da OpenAI foi criado. Para garantir resultados mais sólidos, cada atividade foi analisada por 3 agentes (chatGPT) separadamente e, posteriormente, consolidados.

**Ilustração do algoritmo**
[LEGEND]
[#dadada][Usuário], [#757575][Python], [#ff5500][Python + ChatGPT]
[/LEGEND]

[MERMAID]
---
config:
  theme: neo
  look: classic
  layout: dagre
---
flowchart TD
 subgraph s2["Análise automática"]
        n3["Avaliação inicial"]
        n4["Definição das <br>notas quantitativas"]
        n5["Última atividade<br>avaliada?"]
  end
 subgraph s3["Análise automática"]
        n6["Avaliação inicial"]
        n7["Definição das <br>notas quantitativas"]
        n8["Última atividade<br>avaliada?"]
  end
 subgraph s4["Análise automática"]
        n9["Avaliação inicial"]
        n10["Definição das <br>notas quantitativas"]
        n11["Última atividade<br>avaliada?"]
  end
    n3 --> n4
    n4 --> n5
    n5 --> n3 & n12["Consolidação das análises"]
    n6 --> n7
    n7 --> n8
    n8 --> n6 & n12
    n9 --> n10
    n10 --> n11
    n11 --> n9 & n12
    n13["Análises em Paralelo<br>"] --> s4 & s3 & s2
    n2["Preparação dos dados<br>"] --> n13
    n12 --> n17["Média das notas <br>quant. por atividade"] & n18["Resumo das análises <br>quali. por atividade"]
    n18 --> n16["Consolidação da base final<br>"]
    n17 --> n16
    n3@{ shape: rect}
    n5@{ shape: diam}
    n6@{ shape: rect}
    n7@{ shape: rect}
    n8@{ shape: diam}
    n9@{ shape: rect}
    n10@{ shape: rect}
    n11@{ shape: diam}
    n13@{ shape: text}
    n17@{ shape: rect}
    n18@{ shape: rect}
     n3:::Pine
     n3:::Rose
     n3:::Class_02
     n3:::Class_02
     n4:::Pine
     n4:::Class_02
     n5:::Class_01
     n6:::Pine
     n6:::Class_02
     n7:::Pine
     n7:::Class_02
     n8:::Class_01
     n9:::Pine
     n9:::Class_02
     n10:::Pine
     n10:::Class_02
     n11:::Class_01
     n12:::Class_01
     n2:::Peach
     n2:::Class_03
     n17:::Class_01
     n18:::Class_02
     n16:::Class_01
    classDef Pine stroke-width:1px, stroke-dasharray:none, stroke:#254336, fill:#27654A, color:#FFFFFF
    classDef Peach stroke-width:1px, stroke-dasharray:none, stroke:#FBB35A, fill:#FFEFDB, color:#8F632D
    classDef Rose stroke-width:1px, stroke-dasharray:none, stroke:#FF5978, fill:#FFDFE5, color:#8E2236
    classDef Class_01 stroke-width:2px, stroke-dasharray: 0, stroke:#757575, fill:#757575, color:#FFFFFF
    classDef Class_02 stroke:#ff5500, fill:#ff5500, color:#FFFFFF
    classDef Class_03 stroke:#dadada, fill:#dadada, color:#000000
    style s4 stroke:#757575,fill:#FFFFFF
    style s3 stroke:#757575,fill:#FFFFFF
    style s2 stroke:#757575,fill:#FFFFFF
    linkStyle 2 stroke:#D50000,fill:none
    linkStyle 3 stroke:#00C853,fill:none
    linkStyle 6 stroke:#D50000,fill:none
    linkStyle 7 stroke:#00C853,fill:none
    linkStyle 10 stroke:#D50000,fill:none
    linkStyle 11 stroke:#00C853,fill:none
[/MERMAID]

[PAGEBREAK]

No algoritmo, cada atividade passa por um agente inicial, que faz a avaliação qualitativa da aplicação de AI generativa no processo. Essa análise é, então, enviada para um segundo agente, que dá a nota de 1 a 10, baseado no potencial de automação e no potencial impacto para o negócio.

### Classificação das atividades

A base de atividades do framework da APQC é dividida em Categorias, Grupos de Processos e Processos.

[CASCADE][1][LEVEL 1][CATEGORY][Represents the highest level of process in the enterprise in general groupings such as manage customer service, supply chain, finance, and human capital.]
[CASCADE][2][LEVEL 2][PROCESS GROUP][Groups of processes that are part of executing a category. Examples include perform after sales repairs, procurement, accounts payable, recruit/source, and develop sales strategy.]
[CASCADE][3][LEVEL 3][PROCESS][A single process that may include elements related to variants and rework in addition to the core elements needed to accomplish the process. Examples include invoice customer and develop and manage IT security, privacy, and data protection.]
[CASCADE][4][LEVEL 4][ACTIVITY][A key step performed to execute a process. Examples include maintain chart of accounts and develop salary/compensation structure and plan.]

[GAP]

Após as avaliações das atividades, foram analisadas as Categorias e Grupos de Processos, para avaliar o impacto do uso de AI generativa.

### Dimensões analisadas

O agente (chatGPT) começa realizando uma análise qualitativa da atividade. Para cada atividade, 6 avaliações são realizadas. As descrições das dimensões abaixo tratam-se do prompt enviado para o agente:

1. **GenAI - Text (Yes/No):** Indicates whether generative AI can be used to read, generate, or summarize text-based content related to the activity.

2. **GenAI - Image/Form (Yes/No):** Indicates whether generative AI or computer vision can assist with interpreting images, forms, or visual inputs (e.g., OCR, photo-based form filling).

3. **GenAI - Text Example Use Case:** A specific example of how text-based generative AI could be applied to this activity. Use N/A if not applicable.

4. **GenAI - Image/Form Example Use Case:** A specific example of how image/form processing AI could be applied to this activity. Use N/A if not applicable.

5. **Use Case Summary:** A comprehensive overview of how GenAI technologies could be applied to this activity.

6. **Final Impact Description:** A concise narrative summarizing the overall impact of applying GenAI to this activity.

[PAGEBREAK]

Uma vez realizada a análise qualitativa, um segundo agente classifica, quantitativamente, duas dimensões. Para ambas, um prompt foi usado para que a análise fosse rigorosa e conservadora:

[TABLE]
[HEADERS][Score][Automation Potential (1-10)][Business Impact (1-10)]
[ROW][1][No GenAI automation possible. Requires full human judgment, creativity, or physical presence. GenAI offers no value.][No business impact from GenAI. Automating this activity with GenAI would not improve efficiency, cost, quality, or speed. No strategic relevance.]
[ROW][2][Negligible GenAI automation. Only trivial or administrative steps could be supported by GenAI, but the core activity is human-only.][Negligible impact. GenAI brings only trivial improvements, with no effect on business outcomes.]
[ROW][3][Very low GenAI automation. GenAI could assist with minor, repetitive text/image tasks, but the majority of the activity is human-driven.][Very minor impact. GenAI provides slight improvements in speed or accuracy, but no meaningful effect on business results.]
[ROW][4][Low GenAI automation. GenAI can automate some supporting tasks (e.g., summarization, basic extraction), but human input is required for most of the process.][Minor impact. GenAI brings some visible improvements, but limited contribution to business performance.]
[ROW][5][Moderate-low GenAI automation. GenAI can automate several steps (e.g., drafting, classification, simple Q&A), but human involvement is still needed for key decisions or actions.][Moderate-low impact. GenAI enables noticeable improvements in efficiency or quality, but not business-critical.]
[ROW][6][Moderate GenAI automation. About half of the activity can be automated by GenAI (e.g., content generation, structured extraction), but human oversight or intervention is required for the rest.][Moderate impact. GenAI provides clear improvements in cost, speed, or quality, with some relevance to business outcomes.]
[ROW][7][Moderate-high GenAI automation. Most steps can be automated by GenAI, with humans handling exceptions, complex cases, or final approvals.][Moderate-high impact. GenAI enables substantial improvements in key metrics, supporting important business areas.]
[ROW][8][High GenAI automation. The activity can be automated end-to-end by GenAI in most cases, with humans only for rare exceptions or supervision.][High impact. GenAI drives major gains in cost, speed, or quality, directly supporting business-critical functions.]
[ROW][9][Very high GenAI automation. Nearly all aspects can be automated with current or near-term GenAI, with minimal human oversight.][Very high impact. GenAI enables significant strategic advantage or transformation in business operations.]
[ROW][10][Full GenAI automation. The activity can be completely automated by GenAI, with no meaningful human role except monitoring.][Transformational impact. GenAI fundamentally changes the business, enabling new capabilities or market positions. Reserved for rare, game-changing cases.]
[/TABLE]

[PAGEBREAK]

### Análise da lista de atividades

A análise das 1300 atividades ocorreu em pouco menos de **40 minutos**, com um custo total de aproximadamente **US$30** (o custo é total e envolve: testes e análise final).

A mesmma atividade levaria, no formato tradicional, dias de trabalho.

As Categorias presentes na lista são essas:

[TABLE]
[HEADERS][#][Categoria][Descrição]
[ROW][1][Desenvolver Visão e Estratégia][Definir visão, missão, objetivos estratégicos e iniciativas para direcionar a organização.]
[ROW][2][Desenvolver e Gerenciar Produtos e Serviços][Desenvolver e gerenciar produtos e serviços, desde a ideia até a entrega.]
[ROW][3][Marketing e Vendas de Produtos e Serviços][Entender o mercado, criar estratégias de marketing e vendas, e gerenciar canais.]
[ROW][4][Gerenciar Cadeia de Suprimentos de Produtos Físicos][Planejar, adquirir e gerenciar logística e suprimentos.]
[ROW][5][Entregar Serviços][Executar a entrega de serviços ao cliente, gerenciando recursos e operações.]
[ROW][6][Gerenciar Atendimento ao Cliente][Gerenciar relacionamento com clientes no pós-venda, incluindo suporte e feedback.]
[ROW][7][Desenvolver e Gerenciar Capital Humano][Atrair, desenvolver, engajar e reter talentos na organização.]
[ROW][8][Gerenciar Tecnologia da Informação (TI)][Gerenciar estratégias, serviços, riscos e suporte relacionados à TI.]
[ROW][9][Gerenciar Recursos Financeiros][Executar processos financeiros como contabilidade, tesouraria e controle interno.]
[ROW][10][Adquirir, Construir e Gerenciar Ativos][Projetar, adquirir, construir e gerenciar ativos da organização.]
[ROW][11][Gerenciar Riscos, Conformidade e Resiliência][Gerenciar riscos empresariais, conformidade e recuperação organizacional.]
[ROW][12][Gerenciar Relacionamentos Externos][Fomentar relações com investidores, governo, diretoria e sociedade.]
[ROW][13][Desenvolver e Gerenciar Capacidades Empresariais][Executar práticas organizacionais como gestão da qualidade, mudanças e conhecimento.]
[/TABLE]


[PAGEBREAK]

## RESULTADOS

### Notas por categoria

[LEGEND]
[#FFAB80][Range de notas (MIN - MAX) considerando as 3 análises]
[/LEGEND]

[LEGEND]
[#162F56][Média das Notas considerando as 3 análises]
[/LEGEND]

[GAP]

**Média do potencial de automação por categoria**
[NOGAP]
[RANGE-STACKED-BAR]
[AXIS][5][7]
[HEIGHT][300]
[ENTRY][6 - Manage Customer Service][5.72][5.87][5.96]
[ENTRY][3 - Market and Sell Products and Services][5.44][5.66][5.87]
[ENTRY][4 - Manage Supply Chain for Physical Products][5.38][5.61][5.82]
[ENTRY][5 - Deliver Services][5.36][5.51][5.68]
[ENTRY][10 - Acquire, Construct, and Manage Assets][5.29][5.5][5.71]
[ENTRY][11 - Manage Enterprise Risk, Compliance, Remediation, and Resiliency][5.29][5.49][5.76]
[ENTRY][2 - Develop and Manage Products and Services][5.27][5.48][5.7]
[ENTRY][9 - Manage Financial Resources][5.26][5.46][5.68]
[ENTRY][7 - Develop and Manage Human Capital][5.22][5.38][5.54]
[ENTRY][8 - Manage Information Technology (IT)][5.17][5.37][5.59]
[ENTRY][13 - Develop and Manage Business Capabilities][5.15][5.31][5.5]
[ENTRY][1 - Develop Vision and Strategy][5.13][5.29][5.48]
[ENTRY][12 - Manage External Relationships][4.92][5.07][5.24]
[/RANGE-STACKED-BAR]

**Média do potencial de impacto por categoria**
[NOGAP]
[RANGE-STACKED-BAR]
[AXIS][5][7]
[HEIGHT][300]
[ENTRY][6 - Manage Customer Service][6.57][6.75][6.87]
[ENTRY][3 - Market and Sell Products and Services][6.38][6.61][6.86]
[ENTRY][4 - Manage Supply Chain for Physical Products][6.32][6.57][6.79]
[ENTRY][5 - Deliver Services][6.17][6.33][6.51]
[ENTRY][10 - Acquire, Construct, and Manage Assets][6.25][6.45][6.68]
[ENTRY][11 - Manage Enterprise Risk, Compliance, Remediation, and Resiliency][6.26][6.48][6.76]
[ENTRY][2 - Develop and Manage Products and Services][6.15][6.34][6.55]
[ENTRY][9 - Manage Financial Resources][6.07][6.27][6.52]
[ENTRY][7 - Develop and Manage Human Capital][6.06][6.19][6.37]
[ENTRY][8 - Manage Information Technology (IT)][6.08][6.24][6.44]
[ENTRY][13 - Develop and Manage Business Capabilities][6.07][6.2][6.34]
[ENTRY][1 - Develop Vision and Strategy][6.15][6.3][6.46]
[ENTRY][12 - Manage External Relationships][5.92][5.97][6.04]
[/RANGE-STACKED-BAR]

[PAGEBREAK]

As categorias "Gerenciar Cadeia de Suprimentos de Produtos Físicos", "Gerenciar Atendimento ao Cliente" e "Marketing e Vendas de Produtos e Serviços" foram as que obtiveram melhores resultados, com notas para ambas as dimensões 

**Distribuição Automation Potential vs Business Impact por Categoria**

[PLOTLY-SCATTER][csv=AI-automation-scatter.csv][name_col=Name][x_col=X][y_col=Y][xaxis_label=Automation Potential][yaxis_label=Business Impact][title=]

A média gerais foram:
- **Potencial de aplicação:** 5.46
- **Impacto potencial:** 6.36

[TABLE]
[HEADERS][Score][Automation Potential (1-10)][Business Impact (1-10)]
[ROW][5][Moderate-low GenAI automation. GenAI can automate several steps (e.g., drafting, classification, simple Q&A), but human involvement is still needed for key decisions or actions.][Moderate-low impact. GenAI enables noticeable improvements in efficiency or quality, but not business-critical.]
[ROW][6][Moderate GenAI automation. About half of the activity can be automated by GenAI (e.g., content generation, structured extraction), but human oversight or intervention is required for the rest.][Moderate impact. GenAI provides clear improvements in cost, speed, or quality, with some relevance to business outcomes.]
[ROW][7][Moderate-high GenAI automation. Most steps can be automated by GenAI, with humans handling exceptions, complex cases, or final approvals.][Moderate-high impact. GenAI enables substantial improvements in key metrics, supporting important business areas.]
[/TABLE]

[PAGEBREAK]

### Análise dos resltados

**Potencial**

Os resultados das análises por atividade demonstraram algo que já é de conhecimento relativamente comum: a aplicação da AI Generativa nos processos corporativos, com a tecnologia em seu estado atual, tem um potencial de automação mmoderado. Embora possa ajudar a tornar os processos mais ágeis, ainda requer supervisão humana ou intervenção para tomada de decisões.

Além disso, a partir da análose, também se concluiu que o impacto da aplicação da tecnologia, embora não sendo, no geral, absolutamente transoformador, tem o o potencial de trazer redução de custos, mais velocidade, qualidade e, em alguns casos, até impactos em indicadores financeiros relevantes.

**Aplicações**

Embora os resultados relacionados aos potenciais sejam de conhecimento relativamente comum (o que não é de todo ruim, pois mostra que o método traz uma análise condizente com a realidade), os resultados das análises qualitativas pode ajudar a definir uma estratégia de uso da AI em diversas partes do negócio.

Selecionamos alguns desses resultados para ilustração: 

**Processo: Assess the external environment**
[FONT_SIZE][10px]
Develop Vision and Strategy >> Define the business concept and long-term vision >> Assess the external environment
[/FONT_SIZE]

[LEGEND]
[#FFAB80][Business Impact],[#7CA5FF][Automation Potential]
[/LEGEND]

[PLOTLY-RADAR][csv=AI-automation-radar.csv][category_col=Trace][value_col=Value][name_col=Axis][title=][range_min=4][range_max=6][left_margin=0px][hide_legend=true][font_size=9]



[PAGEBREAK]

**Develop Vision and Strategy >> Define the business concept and long-term vision**
[TREE]
[Assess the external environment][Process][#ff5500][]
  [Identify competitors  (Automation: 6.0 | Impact: 6.0)][Activity][#ffa640][Generative AI can be used to automatically gather and analyze large volumes of text-based data from sources like industry reports, news articles, and social media to identify competitors and evaluate their products and strategies. It generates summaries highlighting competitors' strengths and weaknesses, aiding businesses in understanding the competitive landscape.]
  [Analyze and evaluate competition  (Automation: 6.0 | Impact: 6.0)][Activity][#ffa640][Generative AI can automatically generate comprehensive reports on competitors by analyzing large volumes of text data from sources like financial reports, news articles, press releases, and social media. It provides summaries of the competitive landscape, highlights key strategic moves, and suggests potential areas of competitive advantage.]
  [Identify potential product or service alternatives  (Automation: 5.0 | Impact: 5.67)][Activity][#ffa640][Generative AI can analyze extensive market research reports, competitor analyses, and customer reviews to identify existing product or service alternatives. It generates comprehensive summaries and insights, aiding in the development of a compelling business case for strategic decision-making.]
  [Identify economic trends  (Automation: 6.0 | Impact: 6.0)][Activity][#ffa640][Generative AI can analyze large volumes of economic reports, news articles, and financial data to summarize key macroeconomic trends. It synthesizes information on indicators like interest rates, taxation policies, and unemployment rates, providing insights relevant to strategic planning.]
  [Identify political and regulatory factors  (Automation: 5.0 | Impact: 5.33)][Activity][#ffa640][Generative AI can quickly summarize sources like government databases and news to identify political and regulatory factors affecting the organization, providing targeted reports on risks and opportunities.]
  [Identify environmental factors  (Automation: 5.0 | Impact: 5.67)][Activity][#ffa640][Generative AI can quickly summarize research and reports to highlight key ecological factors and trends for strategic planning. It can also analyze satellite images and photos to detect environmental changes like deforestation or pollution.]
  [Identify social and cultural changes  (Automation: 5.0 | Impact: 5.33)][Activity][#ffa640][Generative AI can analyze and summarize large volumes of text from publications, social media, and thought leaders to identify key themes and insights about societal and cultural changes. It can generate reports highlighting trends and shifts in societal values based on content from public intellectuals and opinion leaders.]
  [Assess new technologies  (Automation: 5.0 | Impact: 5.33)][Activity][#ffa640][Generative AI can analyze and summarize large volumes of industry reports, academic papers, and online content to identify emerging technologies and trends. This enables the generation of insights and suggestions for potential technology applications relevant to the business.]
  [Analyze demographics  (Automation: 6.0 | Impact: 6.0)][Activity][#ffa640][Generative AI can automatically summarize demographic reports, briefs, and articles, extracting key insights and trends to assist business strategists in analyzing the external environment and making strategic recommendations based on current demographic patterns. AI-powered OCR and computer vision technologies can automate the extraction of demographic data from scanned census forms and visual charts, converting them into structured data for further analysis.]
  [Evaluate intellectual property  (Automation: 6.0 | Impact: 6.0)][Activity][#ffa640][Generative AI can review legal and technical documents, like patents and research papers, to identify intellectual property risks and opportunities. It can summarize key issues such as potential infringements, and use computer vision and OCR to analyze diagrams and extract text for further assessment.]
[/TREE]

[PAGEBREAK]

Embora os resultados das análises exemplificadas pudessem ser mais detalhadas / aprofundadas, já é possível, a partir delas, estruturar um processo *ongoing* para trazer insights importantes para a definição e execução da estratégia corporativa:

**Ongoing assessment of the external environment for the corporate strategy definition and execution**
[LEGEND]
[#FFEFDB][Processos Internos], [#dadada][Dados Internos], [#ff5500][Python + ChatGPT]
[/LEGEND]

[MERMAID]
---
config:
  theme: neo
  look: classic
  layout: dagre
---
flowchart TD
 subgraph s1["Internal"]
        n47["Competitive landscape report"]
        n48["Competitive landscape report"]
        n35["Corporate Strategy Outline"]
        n36["Goals and OKRs"]
  end
 subgraph s2["Online Data"]
        n43@{ label: "📰 News Articles" }
        n44@{ label: "💬 Social Media" }
        n45@{ label: "💰 Financial Data" }
        n46@{ label: "🏛️ Government Databases" }
  end
 subgraph s3["Internal"]
        n54["Corporate Strategy Outline"]
        n55["Goals and OKRs"]
        n57["Competitive landscape report"]
        n58["Competitive landscape report"]
  end
    n35 --> n34["Ongoing Knowledge Base Assessment"]
    n36 --> n34
    n43 --> n25["Ongoing Online Assessment of Industry, Market and Competitors"]
    n44 --> n25
    n45 --> n25
    n46 --> n25
    n47 --> n34
    n48 --> n34
    n49["Ongoing (Anual / Trimestral) Strategic Planning"] --> n35 & n36
    n50["Monthly Goals / OKRs Review"] --> n36
    n34 --> n59["Insights / Update / Generate"]
    n25 --> n47 & n48
    n59 --> s3
    n47@{ shape: procs}
    n48@{ shape: procs}
    n35@{ shape: procs}
    n36@{ shape: procs}
    n43@{ shape: stadium}
    n44@{ shape: stadium}
    n45@{ shape: stadium}
    n46@{ shape: stadium}
    n54@{ shape: procs}
    n55@{ shape: procs}
    n57@{ shape: procs}
    n58@{ shape: procs}
    n34@{ shape: rect}
    n25@{ shape: rect}
    n49@{ shape: rect}
    n50@{ shape: rect}
    n59@{ shape: text}
     n47:::Class_01
     n47:::Ash
     n48:::Class_01
     n48:::Ash
     n35:::Class_01
     n35:::Ash
     n36:::Class_01
     n36:::Ash
     n43:::Class_04
     n44:::Class_04
     n45:::Class_04
     n46:::Class_04
     n54:::Class_01
     n54:::Ash
     n55:::Class_01
     n55:::Ash
     n57:::Class_01
     n57:::Ash
     n58:::Class_01
     n58:::Ash
     n34:::Pine
     n34:::Class_02
     n25:::Pine
     n25:::Class_02
     n49:::Pine
     n49:::Class_02
     n49:::Peach
     n50:::Pine
     n50:::Class_02
     n50:::Peach
    classDef Pine stroke-width:1px, stroke-dasharray:none, stroke:#254336, fill:#27654A, color:#FFFFFF
    classDef Rose stroke-width:1px, stroke-dasharray:none, stroke:#FF5978, fill:#FFDFE5, color:#8E2236
    classDef Class_02 stroke:#ff5500, fill:#ff5500, color:#FFFFFF
    classDef Class_03 stroke:#dadada, fill:#dadada, color:#000000
    classDef Class_01 stroke-width:2px, stroke-dasharray: 0, stroke:#757575, fill:#757575, color:#FFFFFF
    classDef Ash stroke-width:1px, stroke-dasharray:none, stroke:#999999, fill:#EEEEEE, color:#000000
    classDef Class_04 stroke:#2962FF, fill:#FFFFFF, color:#2962FF
    classDef Peach stroke-width:1px, stroke-dasharray:none, stroke:#FBB35A, fill:#FFEFDB, color:#8F632D
    style s3 stroke:#757575, fill:#FFFFFF
    style s2 stroke:#757575, fill:#FFFFFF
    style s1 stroke:#757575, fill:#FFFFFF
[/MERMAID]

[GAP]

Este processo capaz de trazer velocidade de resposta a mudanças de mercado e movimento de competidores; maior qualidade na criação e execução de planos de ação; e uma cultura organizacional mais orientada a dados - permitindo decisões estratégicas contínuas baseadas em evidências, em vez de apenas ciclos anuais ou percepções pontuais. Além disso, fortalece a capacidade de antecipação e adaptação da empresa, gerando vantagem competitiva sustentável.

---

A partir de uma avaliação geral dos resultados qualitativos, fica claro que, em sua maioria, a utilização de AI generativa está focada em:
1. **Leitura / Avaliação Cognitiva**: grandes bases de dados, documentos, notícias, reports, interações, reviews, redes sociais, etc;
2. **Geração de Reports, Insights**: consolidação das avaliações cognitivas em insights e reports estruturados e detalhados para tomada de decisões e ações;
3. **Ação automática**: Ação autommática em processos específicos, seguindo critérios pré-definidos, sem necessidade de interação humana..

A partir dos resultados gerados, é possível estruturar outros processos com avaliação / ação *ongoing* utilizando AI generativa. Em última instância, é possível integrar toda a cadeia de valor em um processo macro, unindo agentes autônomos com acesso a ferramentas específicas, capazes de auxiliar toda a organição ativamente.

[PAGEBREAK]

## CONCLUSÃO

### Avaliação do método e potencial de Melhorias

O método utilizado, embora careça de análises mais profundas e detalhadas, serve de *proof of concept*, podendo ser expandido para aplicações diversas para consultoria ou negócios tradicionais.

A criação dos *prompts* se mostrou especialmente relevante no resultado final. A utilização de dois agentes, um para a análise qualitativa, e outro para a análise quantitativa (utilizando como input também a resposta do agente anterior), permitiu que os resultados ficassem mais condizentes com as propostas de utilização da tecnologia.

Em uma segunda implementação, cada atividade poderia ser avaliada com um número maior de critérios, cada um com um peso, para dar um panorama mais detalhado e assertivo.

O método também pode ser expandido para aplicações diversas. A utilização de frameworks como **LangChain** e **LanGraph** para criação de agentes ainda mais inteligentes (com técnicas como *chain of though*, *tree of though* e/ou *few shot*, ao invés da metodologia *zero shot* utilizada), coma cessoa ferramentas específicas (como código em python ou busca na internt) poderia trazer resultados ainda melhores.

### Considerações finais

O uso de IA generativa em processos de negócios deixou de ser uma promessa futura — é uma realidade concreta, acessível e transformadora. Como demonstrado neste estudo, poucas linhas de código bem estruturadas, combinadas com uma arquitetura adequada e uma boa engenharia de prompts, já são capazes de gerar ganhos expressivos em velocidade, qualidade e capacidade analítica.

Mais do que automatizar tarefas, a IA generativa permite repensar como os processos são concebidos, executados e aprimorados. Trata-se de uma mudança de paradigma: da lógica sequencial e manual para uma lógica orientada a dados, evidências e ciclos contínuos de aprendizado.

A adoção estratégica dessas tecnologias não é uma questão de "se", mas de "quando e como". Organizações que souberem integrar a IA de forma inteligente à sua cadeia de valor — com clareza de objetivos, critérios bem definidos e governança sólida — estarão em posição privilegiada para liderar seus mercados. As demais correm o risco de ficar para trás.



[PAGEBREAK]

## SOBRE A DGB

### Quem somos

[QUEMSOMOS]

[PAGEBREAK]

### Commo estamos utilizando AI

Na DGB Consultores, estamos estruturando o uso de inteligência artificial de forma estratégica e com foco em impacto real. Internamente, iniciamos a adoção da tecnologia em frentes selecionadas, como apoio à análise de dados e aceleração de diagnósticos. Paralelamente, estamos desenvolvendo plataformas avançadas para nossos clientes, que integram IA a frameworks estratégicos, automação de insights e processos de decisão orientados por dados. Nossa atuação com IA não é pontual — faz parte de uma visão clara de futuro, em que a inteligência artificial será um dos pilares centrais para gerar vantagem competitiva e transformar a forma como as empresas operam.

Atualmente, oferecemos aos nossos clientes a **Risetool**, uma plataforma que apoia a criação e o acompanhamento da estratégia e metas, utilizada nos projetos de planejamento estratégico. Estamos evoluindo essa solução para um sistema completo de gestão orientado por IA — uma plataforma **AI-first**, construída para repensar como decisões são tomadas, acompanhadas e ajustadas ao longo do tempo.

[IMAGE][images/fridday.png][width=90%]

[END]
