import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Home } from './home';

// Verifica renderização, seleção, autoplay e gestos do carrossel reflexivo.
describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the five reflective questions', () => {
    expect(component.questoesReflexivas).toHaveLength(5);
    expect(fixture.nativeElement.querySelectorAll('.questao-slide')).toHaveLength(5);
  });

  it('should pause and highlight a question when it is selected', () => {
    vi.useFakeTimers();

    component.selecionarQuestao(2);

    expect(component.indiceQuestaoAtiva).toBe(2);
    expect(component.carrosselEmExecucao).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('.questao-slide.ativa')).toHaveLength(1);

    vi.useRealTimers();
  });

  it('should navigate with swipe direction', () => {
    component.indiceQuestaoAtiva = 2;

    component.iniciarToque({
      changedTouches: [{ clientX: 240 }],
    } as unknown as TouchEvent);
    component.finalizarToque({
      changedTouches: [{ clientX: 120 }],
    } as unknown as TouchEvent);

    expect(component.indiceQuestaoAtiva).toBe(3);
    expect(component.carrosselEmExecucao).toBe(false);
  });
});
