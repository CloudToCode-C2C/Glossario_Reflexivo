import { Component } from '@angular/core';

// Conteúdo da fundamentação exibida na página.
export interface FundamentacaoTeorica {
  introducao: string;
  citacaoMinayo: string;
  citacaoMarcuschi: string;
  mensagemFinal: string;
}

@Component({
  selector: 'app-sobre',
  standalone: true,
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss',
})
export class SobreComponent {
  readonly fundamentacaoTeorica: FundamentacaoTeorica = {
    introducao: 'O material coloca em diálogo os estudos de Bortoni-Ricardo (2004) e Bagno (2007) para mostrar que a língua vai muito além de regras e estruturas. O recurso também convida à reflexão sobre como discursos naturalizados no ambiente escolar podem esconder e até legitimar violências simbólicas muitas vezes presentes em julgamentos sobre as diferentes formas de falar.',
    citacaoMinayo: 'Para Minayo (2001), a subjetividade no discurso social reflete a vivência, as representações e as emoções dos sujeitos, demonstrando que a fala nunca é neutra. No ambiente escolar, a linguagem atua diretamente na mediação de conflitos, na construção da autoimagem dos estudantes e no fortalecimento do sentimento de pertencimento.',
    citacaoMarcuschi: 'Nessa perspectiva, Marcuschi (2008) compreende a variação linguística como parte constitutiva da linguagem, valorizando a diversidade dos usos linguísticos e contribuindo para o combate ao preconceito linguístico.',
    mensagemFinal: 'Assim, este glossário busca promover a reflexão sobre as diferentes formas de expressão, incentivando o respeito às variedades linguísticas e o reconhecimento da língua como uma prática social dinâmica. Afinal, falar diferente não significa falar errado!'
  };

  // Referências usadas no conteúdo.
  referencias = [
    "BAGNO, Marcos. Nada na língua é por acaso: por uma pedagogia da variação linguística. São Paulo: Parábola Editorial, 2007.",
    "BAGNO, Marcos. Preconceito linguístico: o que é, como se faz. São Paulo: Parábola Editorial, 1999.",
    "BORTONI-RICARDO, Stella Maris. Educação em língua materna: a sociolinguística na sala de aula. São Paulo: Parábola Editorial, 2004.",
    "BRASIL. Ministério da Educação. Base Nacional Comum Curricular. Brasília, DF: MEC, 2018.",
    "BRASIL. Ministério da Educação. Parâmetros Curriculares Nacionais: introdução aos parâmetros curriculares nacionais. Brasília: MEC/SEF, 1997.",
    "MARCUSCHI, Luiz Antônio. Produção textual: análise de gêneros e compreensão. São Paulo: Parábola Editorial, 2008.",
    "MINAYO, Maria Cecília de Souza (org.). Pesquisa social: teoria, método e criatividade. 18. ed. Petrópolis: Vozes, 2001."
  ]
}
