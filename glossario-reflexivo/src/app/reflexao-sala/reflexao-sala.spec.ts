import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ReflexaoSalaComponent } from './reflexao-sala';
import { SupabaseService } from '../supabase.service';

// Confere os estados de carregamento e erro e a exibição das respostas da sala.
describe('ReflexaoSalaComponent', () => {
  let component: ReflexaoSalaComponent;
  let fixture: ComponentFixture<ReflexaoSalaComponent>;
  let supabaseService: {
    buscarRespostasReflexao: ReturnType<typeof vi.fn>;
    obterUsuarioAtual: ReturnType<typeof vi.fn>;
    inserirRespostaReflexao: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    supabaseService = {
      buscarRespostasReflexao: vi.fn().mockResolvedValue([
        {
          id: 1,
          pergunta_id: 1,
          texto: 'Uma resposta da turma.',
          created_at: '2026-11-02T12:00:00.000Z',
        },
      ]),
      obterUsuarioAtual: vi.fn(),
      inserirRespostaReflexao: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReflexaoSalaComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
        {
          provide: SupabaseService,
          useValue: supabaseService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReflexaoSalaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render responses after loading them', () => {
    expect(supabaseService.buscarRespostasReflexao).toHaveBeenCalledWith(1);
    expect(component.carregando).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Uma resposta da turma.');
  });

  it('should expose an error state when loading fails', async () => {
    supabaseService.buscarRespostasReflexao.mockRejectedValueOnce(new Error('Falha'));

    await component['selecionarPergunta'](1);
    fixture.detectChanges();

    expect(component.carregando).toBe(false);
    expect(component.erroAoCarregar).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar');
  });
});
