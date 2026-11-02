import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { GlossarioComponent } from './glossario';
import { SupabaseService } from '../supabase.service';
import { FormularioComponent } from '../formulario/formulario';
import { MuralComponent } from '../mural/mural';

// Verifica as duas visões do glossário e o repasse da categoria aos widgets.
describe('GlossarioComponent', () => {
  let component: GlossarioComponent;
  let fixture: ComponentFixture<GlossarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlossarioComponent],
      providers: [
        provideRouter([]),
        {
          provide: SupabaseService,
          useValue: {
            obterUsuarioAtual: vi.fn().mockResolvedValue({ email: 'aluno@example.com' }),
            buscarVerbetes: vi.fn().mockResolvedValue([]),
            inserirVerbete: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlossarioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all eight categories in the default view', () => {
    fixture.detectChanges();

    const categoryCards = fixture.nativeElement.querySelectorAll('.categoria-card');

    expect(categoryCards).toHaveLength(8);
    expect(fixture.nativeElement.textContent).toContain('Preconceito Linguístico');
    expect(fixture.nativeElement.textContent).toContain('Capacitismo');
  });

  it('should render the selected category theory and pass its id to interactive components', () => {
    component.categoria = 'Capacitismo';
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    const formulario = fixture.debugElement.query(By.directive(FormularioComponent))
      .componentInstance as FormularioComponent;
    const mural = fixture.debugElement.query(By.directive(MuralComponent))
      .componentInstance as MuralComponent;

    expect(fixture.nativeElement.querySelectorAll('.categoria-card')).toHaveLength(0);
    expect(text).toContain('Definição');
    expect(text).toContain('Exemplos');
    expect(text).toContain('Contexto');
    expect(text).toContain('Efeitos');
    expect(text).toContain('Reformulação');
    expect(text).toContain('Retardado');
    expect(formulario.categoriaAtual).toBe('Capacitismo');
    expect(mural.categoriaFiltro()).toBe('Capacitismo');
  });

  it('should return to the category grid when the route category is cleared', () => {
    component.categoria = 'Etarismo';
    fixture.detectChanges();
    component.categoria = '';
    fixture.detectChanges();

    expect(component.categoriaSelecionada).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.categoria-card')).toHaveLength(8);
    expect(fixture.nativeElement.textContent).not.toContain('Voltar para categorias');
  });

  it('should keep the grid for an unknown category id', () => {
    component.categoria = 'categoria-inexistente';
    fixture.detectChanges();

    expect(component.categoriaSelecionada).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.categoria-card')).toHaveLength(8);
  });
});
