# 📚 Glossário Reflexivo - App de Letramento Social

Um Web App Educacional desenvolvido para promover o letramento social e o combate a preconceitos no ambiente escolar, voltado especialmente para alunos do 7º ano.

## 🎯 Motivo da Criação
Este projeto nasceu da necessidade de transformar um material pedagógico denso (focado em letramento social e variação linguística) em uma experiência digital interativa e engajadora para adolescentes. O objetivo é ajudar os estudantes a reconhecerem e desconstruírem violências simbólicas e preconceitos enraizados na linguagem do dia a dia (no recreio, na sala de aula, nas quadras), demonstrando que a forma como falamos afeta diretamente a inclusão e o respeito ao próximo.

## 🚀 Funcionalidades

O aplicativo está estruturado em 4 pilares principais:

*   **📖 Glossário Interativo:** Um catálogo de 8 categorias de preconceito (Etarismo, Capacitismo, Transfobia, Preconceito Linguístico, Raciais, Regionais, Sexistas e Sociais). Apresenta definições claras e simula diálogos estilo "Chat" contrastando falas inadequadas com reformulações educativas.
*   **🗣️ Mural de Relatos:** Um espaço seguro onde os alunos podem compartilhar suas experiências e vivências escolares relacionadas ao tema. Todas as submissões passam por moderação prévia.
*   **💭 Salas de Reflexão:** Fóruns temáticos baseados em 5 questões geradoras. Com uma interface familiar semelhante a um chat de mensagens, os alunos podem debater e ver as opiniões da turma de forma fluida.
*   **🎓 Fundamentação Teórica (Sobre):** Uma seção dedicada a explicar o embasamento teórico e listar as referências bibliográficas (como Marcos Bagno e Luiz Antônio Marcuschi) que guiam o projeto.

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