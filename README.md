# Relatorio de Demandas

Sistema web simples para montar relatorios de demandas da equipe, com suporte a importacao de dados do Jira (HTML, TXT e PDF com texto selecionavel), anexos de imagens e impressao em PDF.

## Visao geral

O projeto foi feito com HTML, CSS e JavaScript puro, sem backend.
Tudo roda no navegador.

## Funcionalidades

- Cadastro de informacoes gerais do relatorio:
  - Mes do relatorio
  - Responsavel pela revisao
- Logo customizavel por upload de imagem
- Criacao de multiplas demandas
- Campos por demanda:
  - Titulo da demanda
  - Data de inicio
  - Data de termino
  - Descricao (limite de 500 caracteres)
  - Imagens opcionais
  - Equipe que realizou a demanda (multiplas pessoas)
- Importacao de demanda a partir de arquivo do Jira
- Impressao otimizada para PDF:
  - Primeira pagina com cabecalho e dados gerais
  - Uma pagina por demanda
  - Imagens maiores para melhor leitura

## Estrutura do projeto

- index.html: estrutura da pagina e botoes principais
- styles.css: estilos da interface e regras de impressao
- script.js: logica de demandas, importacao e preenchimento automatico

## Como executar

1. Baixe ou clone o repositorio.
2. Abra a pasta do projeto.
3. Execute o arquivo index.html no navegador.

Opcao recomendada no VS Code:

1. Instale a extensao Live Server.
2. Clique com o botao direito em index.html.
3. Selecione Open with Live Server.

## Como usar

1. Preencha Mes do Relatorio e Responsavel pela Revisao.
2. Clique em + Adicionar Demanda para inserir novos cards.
3. Em cada demanda, preencha os campos necessarios.
4. Clique em Gerar / Imprimir Relatorio para exportar em PDF.

## Importacao do Jira

Use o botao Importar Jira para preencher automaticamente uma nova demanda.

Formatos aceitos:

- .html
- .htm
- .txt
- .pdf

Campos que o importador tenta extrair:

- Titulo
- Descricao
- Responsavel / Relator
- Data de criacao (inicio)
- Data de atualizacao (termino)

Observacoes importantes:

- PDF precisa ter texto selecionavel para extracao funcionar.
- PDF escaneado como imagem pode nao ser lido sem OCR.
- Quando algum campo nao for encontrado, o sistema aplica fallback com dados disponiveis.

## Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+)
- PDF.js (via CDN) para leitura de PDF no navegador

## Melhorias futuras sugeridas

- Persistencia local com localStorage
- Exportacao para DOCX
- OCR para PDFs/imagens escaneadas
- Validacoes adicionais de campos obrigatorios
- Cabecalho e numeracao de pagina no PDF

## Licenca

Defina a licenca conforme a necessidade do projeto (exemplo: MIT).
