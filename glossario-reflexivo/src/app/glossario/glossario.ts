import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormularioComponent } from '../formulario/formulario';
import { MuralComponent } from '../mural/mural';

export interface CategoriaGlossario {
  id: string;
  titulo: string;
  definicao: string;
  exemplos: string[];
  contexto: string;
  efeitos: string;
  reformulacao: string;
}

@Component({
  selector: 'app-glossario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormularioComponent, MuralComponent],
  templateUrl: './glossario.html',
  styleUrl: './glossario.scss'
})
export class GlossarioComponent {
  private categoriaDaRota = '';

  @Input()
  set categoria(value: string | undefined) {
    this.categoriaDaRota = value ?? '';
    this.categoriaSelecionada = this.categorias.find(
      categoria => categoria.id === this.categoriaDaRota
    ) ?? null;
  }

  get categoria(): string {
    return this.categoriaDaRota;
  }

  categoriaSelecionada: CategoriaGlossario | null = null;

  readonly categorias: CategoriaGlossario[] = [
    {
      id: 'Etarismo',
      titulo: 'Etarismo',
      definicao: 'Preconceito, discriminação, desvalorização, inferiorização e desqualificação de uma pessoa com base em sua idade. No ambiente escolar, pode atingir estudantes, professores, funcionários e demais profissionais, tanto pessoas mais velhas quanto mais jovens.',
      exemplos: [
        'Você é velho demais para isso!',
        'Isso é coisa de velho!',
        'Não tem idade para opinar!',
        'Jovem não sabe de nada!',
        'Caduco!',
        'Cringe!',
        'Novato/moleque!'
      ],
      contexto: 'Em situações de interação no ambiente escolar, por meio de piadas, comentários depreciativos e atitudes discriminatórias relacionadas à idade.',
      efeitos: 'Isolamento e impacto na saúde emocional.',
      reformulacao: 'Idade não determina inteligência, competência, capacidade de aprendizagem ou valor da opinião de alguém.'
    },
    {
      id: 'Capacitismo',
      titulo: 'Capacitismo',
      definicao: 'Preconceito ou a discriminação contra pessoas com deficiência, baseado na ideia de que elas seriam menos capazes, inferiores, dependentes ou inadequadas por causa de sua deficiência.',
      exemplos: [
        'Retardado',
        'Autista',
        'Aleijado',
        'Manco',
        'Isso é coisa de deficiente!',
        'Finge que é cego!',
        'Incapaz'
      ],
      contexto: 'Por meio de piadas, imitação de pessoas com deficiência e discussões.',
      efeitos: 'Desvalorização das capacidades e das potencialidades individuais, constrangimento, humilhação e exclusão social, além da gravidade do uso de neurodivergências como xingamento.',
      reformulacao: 'Podemos expressar irritação, surpresa ou discordância sem transformar uma deficiência em insulto.'
    },
    {
      id: 'Transfobia',
      titulo: 'Transfobia',
      definicao: 'Preconceito, discriminação ou violência direcionada a pessoas em razão de sua identidade ou expressão de gênero, atingindo especialmente pessoas transgênero, transexuais e não binárias.',
      exemplos: [
        'Viado!',
        'Bicha!',
        'Sapatão!',
        'Isso é coisa de gay!',
        'Parece gay!',
        'Vira homem!',
        'Tá de viadagem!',
        'Parece homem!',
        'Traveco!'
      ],
      contexto: 'Por meio de xingamentos, apelidos, piadas, comentários, exclusão ou associação da orientação sexual ou da escolha de gênero a algo negativo.',
      efeitos: 'Normalização da discriminação, bullying, constrangimento e humilhação. Desrespeito ao nome social ou negação do gênero da pessoa.',
      reformulacao: 'Criticar uma atitude sem atacar a identidade de gênero ou a orientação sexual da pessoa.'
    },
    {
      id: 'Preconceito Linguistico',
      titulo: 'Preconceito Linguístico',
      definicao: "A discriminação exercida contra determinados falares e modos de expressão que fogem à norma-padrão urbanizada, camuflando o preconceito social, regional ou de classe sob o pretexto de uma suposta 'incapacidade gramatical'.",
      exemplos: [
        'Fala direito!',
        'Fala igual caipira/roceiro!',
        'Você fala tudo errado!',
        'Isso é português errado!',
        'Você não sabe falar, aprende português primeiro!',
        'Você fala muito pobre!',
        'Fala bonito, não fala igual pobre!'
      ],
      contexto: 'Quadras de esportes, brincadeiras de mau gosto, conflitos no pátio ou na sala de aula.',
      efeitos: 'Desvalorização da identidade e exclusão social.',
      reformulacao: 'Respeitar as variedades linguísticas, entendendo que cada forma de falar possui seu contexto e que nenhuma delas torna seu falante inferior.'
    },
    {
      id: 'Raciais',
      titulo: 'Raciais',
      definicao: 'Expressões que inferiorizam pessoas negras (pretas e pardas) ou associam suas características a algo negativo.',
      exemplos: [
        'Inveja branca',
        'Serviço de preto',
        'Cabelo ruim/duro ou bombril',
        'A coisa tá preta!',
        'Não sou tua nega!',
        'Lista negra',
        'Macaco'
      ],
      contexto: 'Quadras de esportes, brincadeiras de mau gosto, conflitos no pátio e comentários sobre estética/aparência.',
      efeitos: 'Destruição da autoimagem e naturalização do racismo.',
      reformulacao: 'Não apenas substitua a palavra, mas descreva a situação, característica ou o comportamento sem associá-los aos fenótipos.'
    },
    {
      id: 'Regionais',
      titulo: 'Regionais',
      definicao: 'Discriminação contra alguém por causa da sua região de origem, do seu sotaque ou da sua cultura.',
      exemplos: [
        'Coisa de caipira/roceiro',
        'Baianada (usado para classificar algo desorganizado)',
        'Imitação pejorativa de sotaques (por exemplo, do nordestino)'
      ],
      contexto: 'Por meio de xingamentos, apelidos, piadas, comentários e leituras em sala.',
      efeitos: 'Complexo de inferioridade e de exclusão social.',
      reformulacao: 'Respeitar os sotaques e falares regionais como identidades culturais legítimas, sem atribuir um comportamento negativo a um povo ou a uma região.'
    },
    {
      id: 'Sexistas',
      titulo: 'Sexistas',
      definicao: 'Preconceito ou discriminação baseada no sexo ou no gênero, manifestado por meio de estereótipos, comportamentos e expectativas sobre como homens e mulheres devem agir.',
      exemplos: [
        'Isso é coisa de mulher!',
        'Mulher não entende de futebol!',
        'Menino não brinca de boneca!',
        'Lugar de mulher é na cozinha!',
        'Mulher tem que ser delicada!',
        'Homem tem que ser forte!',
        'Homem não chora!',
        'Ela está de TPM!',
        'Você corre como menina!'
      ],
      contexto: "Por meio de piadas, apelidos, comentários, estereótipos e frases que determinam como homens e mulheres 'devem' agir.",
      efeitos: 'Desvalorização da identidade, bullying e exclusão social.',
      reformulacao: 'Retirar o gênero como critério para definir capacidade, comportamento ou valor, evitando desqualificar a fala feminina com base em fatores biológicos.'
    },
    {
      id: 'Sociais',
      titulo: 'Sociais',
      definicao: 'É o julgamento ou tratamento desigual de uma pessoa por causa de sua condição econômica, classe social, profissão, local onde mora, escolaridade ou modo de vida.',
      exemplos: [
        'Isso é coisa de pobre!',
        'Maloqueiro!',
        'Pé-rapado!',
        'Você tem jeito de pobre!',
        'Pobre não sabe falar!',
        'Isso é coisa de gente sem estudo!',
        'Só podia ser favelado!',
        'Roupa de pobre!',
        'Você não tem classe!'
      ],
      contexto: 'Quadras de esportes, brincadeiras de mau gosto, conflitos no pátio ou na sala de aula.',
      efeitos: 'Desigualdade, bullying e reprodução de estereótipos.',
      reformulacao: 'Diferentes grupos sociais possuem diferentes maneiras de usar a língua, deve-se isentar a pessoa de julgamentos, focando a atenção especificamente na atitude ou na situação.'
    }
  ];

  readonly icones: Record<string, string> = {
    Etarismo: 'elderly',
    Capacitismo: 'accessible',
    Transfobia: 'diversity_1',
    'Preconceito Linguistico': 'record_voice_over',
    Raciais: 'groups',
    Regionais: 'public',
    Sexistas: 'female',
    Sociais: 'people'
  };

  readonly coresCategorias: Record<string, string> = {
    Etarismo: 'var(--cat-etarismo)',
    Capacitismo: 'var(--cat-capacitismo)',
    Transfobia: 'var(--cat-transfobia)',
    'Preconceito Linguistico': 'var(--cat-linguistico)',
    Raciais: 'var(--cat-raciais)',
    Regionais: 'var(--cat-regionais)',
    Sexistas: 'var(--cat-sexistas)',
    Sociais: 'var(--cat-sociais)'
  };
}
