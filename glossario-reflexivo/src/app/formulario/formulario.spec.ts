import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { FormularioComponent } from './formulario';

describe('FormularioComponent', () => {
  let component: FormularioComponent;
  let fixture: ComponentFixture<FormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the success message after 3.5 seconds', () => {
    vi.useFakeTimers();

    component.verbeteForm.setValue({
      expressao: 'Expressão de teste',
      significado: 'Significado de teste',
    });

    component.onSubmit();

    expect(component.mensagemSucesso()).toBe(true);

    vi.advanceTimersByTime(3499);
    expect(component.mensagemSucesso()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(component.mensagemSucesso()).toBe(false);

    vi.useRealTimers();
  });
});
