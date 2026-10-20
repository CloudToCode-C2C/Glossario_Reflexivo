# Glossario_Reflexivo
Glossário Reflexivo: gírias e expressões preconceituosas na escola.

## Atividades Gerais

1. Inicialização do Angular
2. Configuração Base do PWA
    - Criar e configurar o arquivo `manifest.json`.
    - "Arquivo responsável por garantir o mecanismo do 'Adicionar à Tela Inicial' no celular".
3. Extração dos textos do PDF.
    - Textos sobre variação linguística não vão ficar salvos no DB. Vão ficar hardcoded no programa.
4. Criar (ou projetar) o formulário de inserção e o mural de novas expressões, que será utilizado por alunos, utilizando dados estáticos temporários.

## Atividades - Arthur

- [ ] Criação (e aprendizado) do BaaS: Acessar a plataforma **Supabase** e criar o projeto em nuvem.
- [ ] Modelagem do Banco de Dados: Estruturar a coleção necessária para a construção colaborativa, que chamaremos de `Verbetes_Colaborativos`. O esquema deve ser minimalista e direto: 
    - `id` (identificador único)
    - `expressao` (string)
    - `significado` (string)
    - `contexto` (string)
    - `data_criacao` (timestamp)
    - `status_aprovado` (boolean, iniciado como `false` para evitar exibição imediata de vandalismo no mural público).
- [ ] Distribuição de Chaves: Gerar as credenciais e chaves de API do banco. Criar um arquivo `.env.example` no repositório apenas com os nomes das variáveis e entregar as chaves reais diretamente para o Front-End para configuração do ambiente local.
- [ ] 4. Hospedagem e CI/CD: Conectar o repositório do GitHub a um serviço de hospedagem contínua (Vercel). Configure a pipeline para que qualquer push gere um deploy automático. 