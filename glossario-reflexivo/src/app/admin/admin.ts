import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService, VideoCategoria } from '../supabase.service';

type AbaAdmin = 'verbetes_colaborativos' | 'relatos' | 'respostas_reflexao' | 'videos_categoria';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  abaAtiva: AbaAdmin = 'verbetes_colaborativos';
  registros: any[] = [];
  videos: VideoCategoria[] = [];

  carregando = true;
  erroMensagem = '';
  emailProfessorLogado = '';

  // Categorias disponíveis para organizar os vídeos cadastrados na videoteca.
  readonly categoriasGlossario = [
    { id: 'Etarismo', titulo: 'Etarismo', icone: 'elderly' },
    { id: 'Capacitismo', titulo: 'Capacitismo', icone: 'accessible' },
    { id: 'Transfobia', titulo: 'Transfobia', icone: 'diversity_1' },
    { id: 'Preconceito Linguistico', titulo: 'Preconceito Linguístico', icone: 'record_voice_over' },
    { id: 'Raciais', titulo: 'Raciais', icone: 'groups' },
    { id: 'Regionais', titulo: 'Regionais', icone: 'public' },
    { id: 'Sexistas', titulo: 'Sexistas', icone: 'female' },
    { id: 'Sociais', titulo: 'Sociais', icone: 'people' }
  ];

  categoriaVideoFiltro = '';
  apenasMeusVideos = false;
  salvandoVideo = false;
  feedbackVideo: { tipo: 'sucesso' | 'erro'; texto: string } | null = null;
  videoForm: FormGroup;

  private filtroSub?: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.videoForm = this.fb.group({
      categoria: ['Etarismo', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(140)]],
      url: ['', [Validators.required]]
    });
  }

  async ngOnInit(): Promise<void> {
    const user = await this.supabaseService.obterUsuarioAtual();
    this.emailProfessorLogado = user?.email?.toLowerCase() ?? '';

    this.filtroSub = this.supabaseService.filtroProfessor$.subscribe(() => {
      void this.carregarDadosAbaAtual();
    });
  }

  ngOnDestroy(): void {
    this.filtroSub?.unsubscribe();
  }

  selecionarAba(aba: AbaAdmin): void {
    this.abaAtiva = aba;
    this.feedbackVideo = null;
    void this.carregarDadosAbaAtual();
  }

  async carregarDadosAbaAtual(): Promise<void> {
    this.carregando = true;
    this.erroMensagem = '';
    this.cdr.detectChanges();

    try {
      if (this.abaAtiva === 'videos_categoria') {
        this.videos = await this.supabaseService.buscarVideosPorCategoria();
      } else {
        this.registros = await this.supabaseService.listarRegistrosAdmin(this.abaAtiva);
      }
    } catch (error) {
      console.error('Erro ao carregar dados no painel Admin:', error);
      this.erroMensagem = 'Não foi possível carregar os dados desta aba.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  // Lista e ações da videoteca.

  get videosFiltrados(): VideoCategoria[] {
    return this.videos.filter(v => {
      const bateCategoria = !this.categoriaVideoFiltro || v.categoria === this.categoriaVideoFiltro;
      const bateAutor =
        !this.apenasMeusVideos ||
        (v.autor_email && v.autor_email.toLowerCase() === this.emailProfessorLogado);
      return bateCategoria && bateAutor;
    });
  }

  filtrarVideoPorBolha(idCategoria: string): void {
    this.categoriaVideoFiltro = idCategoria;
    if (idCategoria) {
      this.videoForm.patchValue({ categoria: idCategoria });
    }
    this.cdr.detectChanges();
  }

  alternarApenasMeusVideos(event: Event): void {
    this.apenasMeusVideos = (event.target as HTMLInputElement).checked;
    this.cdr.detectChanges();
  }

  podeExcluirVideo(video: VideoCategoria): boolean {
    if (video.fixo_sistema) return false;
    return !!video.autor_email && video.autor_email.toLowerCase() === this.emailProfessorLogado;
  }

  obterThumb(youtubeId: string): string {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  async adicionarVideo(): Promise<void> {
    this.feedbackVideo = null;
    if (this.videoForm.invalid) {
      this.videoForm.markAllAsTouched();
      this.feedbackVideo = {
        tipo: 'erro',
        texto: 'Preencha o título descritivo e cole um link válido do YouTube.'
      };
      this.cdr.detectChanges();
      return;
    }

    const { categoria, titulo, url } = this.videoForm.value;
    if (!this.supabaseService.extrairYoutubeId(url)) {
      this.feedbackVideo = {
        tipo: 'erro',
        texto: 'Link inválido. Cole um link do YouTube (ex: https://youtu.be/... ou youtube.com/watch?v=...).'
      };
      this.cdr.detectChanges();
      return;
    }

    this.salvandoVideo = true;
    this.cdr.detectChanges();

    try {
      const escolaFiltro = this.supabaseService.obterFiltroProfessorAtual().escola;
      await this.supabaseService.inserirVideoCategoria({
        categoria,
        titulo,
        url,
        escola: escolaFiltro
      });

      this.videoForm.patchValue({ titulo: '', url: '' });
      this.feedbackVideo = {
        tipo: 'sucesso',
        texto: 'Vídeo adicionado à playlist da categoria com sucesso!'
      };
      await this.carregarDadosAbaAtual();
    } catch (error: any) {
      const duplicado = error?.code === '23505';
      this.feedbackVideo = {
        tipo: 'erro',
        texto: duplicado
          ? 'Este vídeo já está cadastrado nesta categoria.'
          : 'Não foi possível salvar o vídeo. Tente novamente.'
      };
    } finally {
      this.salvandoVideo = false;
      this.cdr.detectChanges();
    }
  }

  async removerVideo(video: VideoCategoria): Promise<void> {
    if (!this.podeExcluirVideo(video)) return;
    if (!confirm(`Deseja remover o vídeo "${video.titulo}" da playlist?`)) return;

    try {
      await this.supabaseService.excluirVideoCategoria(video.id);
      this.videos = this.videos.filter(v => v.id !== video.id);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error);
      alert('Não foi possível excluir o vídeo.');
    }
  }

  // As outras abas permitem aprovar ou remover contribuições enviadas pelas turmas.

  async alternarStatus(item: any): Promise<void> {
    if (this.abaAtiva === 'videos_categoria') return;
    const novoStatus = !item.status_aprovado;
    try {
      await this.supabaseService.atualizarStatusAprovacao(this.abaAtiva, item.id, novoStatus);
      item.status_aprovado = novoStatus;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Falha ao atualizar o status da contribuição.');
    }
  }

  async excluir(id: string | number): Promise<void> {
    if (this.abaAtiva === 'videos_categoria') return;
    if (!confirm('Deseja eliminar permanentemente esta contribuição?')) return;

    try {
      await this.supabaseService.excluirRegistroAdmin(this.abaAtiva, id);
      this.registros = this.registros.filter(r => r.id !== id);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao eliminar registo:', error);
      alert('Falha ao eliminar o registo.');
    }
  }
}