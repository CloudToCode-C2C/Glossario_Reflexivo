import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, Input, HostListener, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SupabaseService, VideoCategoria } from '../supabase.service';
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

interface QuestaoReflexiva {
  numero: number;
  texto: string;
}

@Component({
  selector: 'app-glossario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormularioComponent, MuralComponent],
  templateUrl: './glossario.html',
  styleUrl: './glossario.scss'
})
export class GlossarioComponent implements OnInit, OnDestroy {
  videosDaCategoria: VideoCategoria[] = [];
  carregandoVideos = false;
  playlistAberta = false;
  videoAtivo: VideoCategoria | null = null;
  urlEmbedSegura: SafeResourceUrl | null = null;
  private categoriaDaRota = '';

  constructor(
    private supabaseService: SupabaseService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  @Input()
  set categoria(value: string | undefined) {
    this.categoriaDaRota = value ?? '';
    this.categoriaSelecionada = this.categorias.find(
      categoria => categoria.id === this.categoriaDaRota
    ) ?? null;
    this.resetarEBuscarPlaylist();
  }

  get categoria(): string {
    return this.categoriaDaRota;
  }

  categoriaSelecionada: CategoriaGlossario | null = null;
  mostrarFeedback: boolean = false;

  readonly categorias: CategoriaGlossario[] = [
    {
      id: 'Etarismo',
      titulo: 'Etarismo',
      definicao: 'Preconceito, discriminação, desvalorização, inferiorização e desqualificação de uma pessoa com base em sua idade.',
      exemplos: ['Você é velho demais para isso!', 'Isso é coisa de velho!', 'Cringe!'],
      contexto: 'Em situações de interação no ambiente escolar, por meio de piadas, comentários depreciativos e atitudes discriminatórias.',
      efeitos: 'Isolamento e impacto na saúde emocional.',
      reformulacao: 'Idade não determina inteligência, competência, capacidade de aprendizagem ou valor da opinião de alguém.'
    },
    {
      id: 'Capacitismo',
      titulo: 'Capacitismo',
      definicao: 'Preconceito ou a discriminação contra pessoas com deficiência, baseado na ideia de que elas seriam menos capazes.',
      exemplos: ['Retardado', 'Autista', 'Aleijado', 'Manco'],
      contexto: 'Por meio de piadas, imitação de pessoas com deficiência e discussões.',
      efeitos: 'Desvalorização das capacidades e constrangimento.',
      reformulacao: 'Podemos expressar irritação ou discordância sem transformar uma deficiência em insulto.'
    },
    {
      id: 'Transfobia',
      titulo: 'Transfobia',
      definicao: 'Preconceito, discriminação ou violência direcionada a pessoas em razão de sua identidade ou expressão de gênero, atingindo especialmente pessoas transgênero, transexuais e não binárias.',
      exemplos: ['Viado!', 'Bicha!', 'Traveco!'],
      contexto: 'Por meio de xingamentos, apelidos, piadas, comentários, exclusão ou associação da identidade ou expressão de gênero a algo negativo.',
      efeitos: 'Normalização da discriminação, bullying, constrangimento e humilhação. Desrespeito ao nome social ou ngação do gênero da pessoa.',
      reformulacao: 'Criticar uma atitude sem atacar a identidade de gênero ou a orientação sexual da pessoa. Respeitar a identidade de alguém não é uma scolha de opinião, é um compromisso com a dignidade humana. Na escola, a diversidade merece respeito, nunca preconceito.'
    },
    {
      id: 'Preconceito Linguistico',
      titulo: 'Preconceito Linguístico',
      definicao: "Discriminação exercida contra modos de expressão que fogem à norma-padrão urbanizada.",
      exemplos: ['Fala direito!', 'Você fala tudo errado!'],
      contexto: 'Quadras de esportes, brincadeiras de mau gosto, conflitos no pátio.',
      efeitos: 'Desvalorização da identidade e exclusão social.',
      reformulacao: 'Respeitar as variedades linguísticas, entendendo que cada forma de falar possui seu contexto.'
    },
    {
      id: 'Raciais',
      titulo: 'Raciais',
      definicao: 'Expressões que inferiorizam pessoas negras (pretas e pardas) ou associam suas características a algo negativo.',
      exemplos: ['Inveja branca', 'Serviço de preto', 'Macaco'],
      contexto: 'Quadras de esportes, brincadeiras de mau gosto e comentários.',
      efeitos: 'Destruição da autoimagem e naturalização do racismo.',
      reformulacao: 'Não apenas substitua a palavra, mas descreva a situação sem associá-los aos fenótipos.'
    },
    {
      id: 'Regionais',
      titulo: 'Regionais',
      definicao: 'Discriminação contra alguém por causa da sua região de origem, do seu sotaque ou da sua cultura.',
      exemplos: ['Coisa de caipira', 'Baianada'],
      contexto: 'Por meio de xingamentos, apelidos e piadas.',
      efeitos: 'Complexo de inferioridade e exclusão social.',
      reformulacao: 'Respeitar os sotaques e falares regionais como identidades culturais legítimas.'
    },
    {
      id: 'Sexistas',
      titulo: 'Sexistas',
      definicao: 'Preconceito ou discriminação baseada no sexo ou no gênero, manifestado por meio de estereótipos.',
      exemplos: ['Isso é coisa de mulher!', 'Homem não chora!'],
      contexto: 'Por meio de piadas, estereótipos e frases determinantes.',
      efeitos: 'Desvalorização da identidade.',
      reformulacao: 'Retirar o gênero como critério para definir capacidade, comportamento ou valor.'
    },
    {
      id: 'Sociais',
      titulo: 'Sociais',
      definicao: 'Julgamento ou tratamento desigual de uma pessoa por causa de sua condição econômica ou local onde mora.',
      exemplos: ['Isso é coisa de pobre!', 'Maloqueiro!'],
      contexto: 'Brincadeiras de mau gosto ou comentários elitistas.',
      efeitos: 'Desigualdade e reprodução de estereótipos.',
      reformulacao: 'Diferentes grupos sociais possuem diferentes maneiras de usar a língua; deve-se focar na atitude.'
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

  listaFiltrada: CategoriaGlossario[] = [];
  categoriaFiltro: string = ''; 

  ngOnInit(): void {
    this.listaFiltrada = [...this.categorias];
    this.iniciarCarrossel();
  }

  filtrarPorBolha(idCategoria: string) {
    this.categoriaFiltro = idCategoria;
    if (idCategoria === '') {
      this.listaFiltrada = [...this.categorias];
    } else {
      this.listaFiltrada = this.categorias.filter(cat => cat.id === idCategoria);
    }
  }

  filtrarCategorias(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const busca = elemento.value.toLowerCase();
    this.categoriaFiltro = ''; 

    if (!busca) {
      this.listaFiltrada = [...this.categorias];
      return;
    }

    this.listaFiltrada = this.categorias.filter(cat => 
      cat.titulo.toLowerCase().includes(busca) || 
      cat.definicao.toLowerCase().includes(busca)
    );
  }

  selecionarCategoriaNaGrade(id: string) {
    this.categoriaSelecionada = this.categorias.find(c => c.id === id) ?? null;
    this.resetarEBuscarPlaylist();
  }

  limparSelecao() {
    this.categoriaSelecionada = null;
    this.playlistAberta = false;
    this.videoAtivo = null;
    this.urlEmbedSegura = null;
  }

  dispararFeedbackSucesso() {
    this.mostrarFeedback = true;
    setTimeout(() => {
      this.mostrarFeedback = false;
    }, 5000); 
  }

  readonly questoesReflexivas: QuestaoReflexiva[] = [
    {
      numero: 1,
      texto: 'Como o uso da língua pode contribuir para a construção ou para a desconstrução de preconceitos?',
    },
    {
      numero: 2,
      texto: 'Você acha que uma pessoa pode reproduzir uma expressão preconceituosa sem perceber seu significado?',
    },
    {
      numero: 3,
      texto: 'Quais consequências o uso frequente de expressões preconceituosas pode trazer para quem é alvo delas?',
    },
    {
      numero: 4,
      texto: 'Existe diferença entre liberdade de expressão e um discurso que desrespeita ou discrimina alguém?',
    },
    {
      numero: 5,
      texto: 'Depois de conhecer as expressões deste glossário, você mudaria alguma forma de falar? Qual? Por quê?',
    },
  ];

  indiceQuestaoAtiva = 0;
  carrosselEmExecucao = true;
  private intervaloCarrossel?: ReturnType<typeof setInterval>;
  private inicioToque = 0;

  ngOnDestroy(): void {
    this.pararIntervalo();
  }

  selecionarQuestao(indice: number): void {
    this.indiceQuestaoAtiva = indice;
    this.pararCarrossel();
  }

  proximaQuestao(): void {
    this.indiceQuestaoAtiva = (this.indiceQuestaoAtiva + 1) % this.questoesReflexivas.length;
  }

  questaoAnterior(): void {
    this.indiceQuestaoAtiva = (this.indiceQuestaoAtiva - 1 + this.questoesReflexivas.length) % this.questoesReflexivas.length;
  }

  iniciarToque(event: TouchEvent): void {
    this.inicioToque = event.changedTouches[0]?.clientX ?? 0;
  }

  finalizarToque(event: TouchEvent): void {
    const fimToque = event.changedTouches[0]?.clientX ?? this.inicioToque;
    const distancia = fimToque - this.inicioToque;

    if (Math.abs(distancia) < 50) return;

    if (distancia < 0) {
      this.proximaQuestao();
    } else {
      this.questaoAnterior();
    }
    this.pararCarrossel();
  }

  alternarPlaylist() {
    this.playlistAberta = !this.playlistAberta;
    if (this.playlistAberta && !this.videoAtivo && this.videosDaCategoria.length > 0) {
      this.selecionarVideoNaPlaylist(this.videosDaCategoria[0]);
    }
    this.cdr.detectChanges();
  }

  selecionarVideoNaPlaylist(video: VideoCategoria) {
    this.videoAtivo = video;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0`;
    this.urlEmbedSegura = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.cdr.detectChanges();
  }

  obterThumbYoutube(youtubeId: string): string {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  @HostListener('window:keydown', ['$event'])
  controlarComTeclado(event: KeyboardEvent): void {
    if (this.categoriaSelecionada !== null) return;
    
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (event.key === 'ArrowRight') {
      this.proximaQuestao();
    } else {
      this.questaoAnterior();
    }
    this.pararCarrossel();
  }

  private iniciarCarrossel(): void {
    this.intervaloCarrossel = setInterval(() => {
      this.proximaQuestao();
    }, 5000);
  }

  private pararCarrossel(): void {
    this.carrosselEmExecucao = false;
    this.pararIntervalo();
  }

  private pararIntervalo(): void {
    if (!this.intervaloCarrossel) return;
    clearInterval(this.intervaloCarrossel);
    this.intervaloCarrossel = undefined;
  }

  private resetarEBuscarPlaylist(): void {
    this.playlistAberta = false;
    this.videoAtivo = null;
    this.urlEmbedSegura = null;
    if (this.categoriaSelecionada) {
      void this.carregarVideosDaCategoria(this.categoriaSelecionada.id);
    }
  }

  async carregarVideosDaCategoria(idCategoria: string) {
    this.carregandoVideos = true;
    this.cdr.detectChanges();
    try {
      this.videosDaCategoria = await this.supabaseService.buscarVideosPorCategoria(idCategoria);
      if (this.videosDaCategoria.length > 0) {
        this.selecionarVideoNaPlaylist(this.videosDaCategoria[0]);
      }
    } catch (e) {
      console.error('Erro ao carregar vídeos da categoria:', e);
    } finally {
      this.carregandoVideos = false;
      this.cdr.detectChanges();
    }
  }
}