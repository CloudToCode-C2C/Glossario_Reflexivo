# 📚 Glossário Reflexivo - App de Letramento Social

Um Web App Educacional desenvolvido para promover o letramento social e o combate a preconceitos no ambiente escolar, voltado especialmente para alunos do 7º ano.

## 🎯 Motivo da Criação
Este projeto nasceu da necessidade de transformar um material pedagógico denso (focado em letramento social e variação linguística) em uma experiência digital interativa e engajadora para adolescentes. O objetivo é ajudar os estudantes a reconhecerem e desconstruírem violências simbólicas e preconceitos enraizados na linguagem do dia a dia (no recreio, na sala de aula, nas quadras), demonstrando que a forma como falamos afeta diretamente a inclusão e o respeito ao próximo.

## 🚀 Funcionalidades

O aplicativo está estruturado em 4 pilares principais, com foco na usabilidade e engajamento do público adolescente:

-   **📖 Glossário Interativo:** Um catálogo exploratório de 8 categorias de preconceito (Etarismo, Capacitismo, Transfobia, Preconceito Linguístico, Raciais, Regionais, Sexistas e Sociais). Apresenta definições claras, contextos históricos de uso, dicas de reformulação de falas e **integração dinâmica com vídeos do YouTube** para aprofundamento. A tela inicial também conta com um carrossel de "Momentos de Reflexão".
-   **🗣️ Fórum (Espaço de Escuta):** Um ambiente seguro e comunitário onde os alunos podem compartilhar experiências pessoais e vivências escolares. Possui envio de relatos com feedback visual e um feed de leitura moderno estilo rede social.
-   **💭 Salas de Reflexão:** Ambientes de debate acessados diretamente pelas questões geradoras do glossário. Permitem que a turma interaja e participe de discussões direcionadas de forma fluida.
-   **🎓 Fundamentação Teórica (Sobre):** Uma seção dinâmica que introduz conceitos-chave (como Variação e Preconceito Linguístico) através de cards interativos, além de apresentar o embasamento teórico e listar as referências bibliográficas (como Marcos Bagno e Luiz Antônio Marcuschi) que sustentam as escolhas pedagógicas do projeto.

## 🛠️ Arquitetura e Tecnologias

O projeto foi construído com foco em escalabilidade, responsividade e, acima de tudo, **segurança de dados para menores**.

*   **Front-end:** Angular 17+ (Standalone Components).
*   **Estilização:** SCSS com Design System próprio, utilizando variáveis CSS nativas para tematização das categorias, feedback semântico e tipografia amigável.
*   **Back-end & Banco de Dados:** Supabase (PostgreSQL).
*   **Autenticação:** Login social via Google (Supabase Auth).
*   **Segurança (RLS):** Implementação rigorosa de *Row Level Security* (Políticas de Segurança em Nível de Linha). Estudantes (usuários autenticados) só podem visualizar dados previamente aprovados pela moderação (`status_aprovado = true`) e só podem inserir dados novos vinculados ao próprio token JWT.
*   **Deploy:** Vercel.

## 🔒 Moderação de Conteúdo
Para garantir um ambiente escolar digital seguro, o sistema conta com um fluxo de aprovação "invisível" no banco de dados. Qualquer contribuição (nova gíria, relato ou reflexão) nasce com o status `false` e só é exibida na interface após a aprovação manual de um educador/administrador através do painel do Supabase.

---

<div align="center">
  <p>Desenvolvido por <strong>CloudToCode</strong></p>
</div>