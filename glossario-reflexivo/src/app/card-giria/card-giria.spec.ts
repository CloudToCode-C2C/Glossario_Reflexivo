import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardGiriaComponent } from './card-giria';

// Confirma que o componente visual de verbete pode ser instanciado isoladamente.
describe('CardGiriaComponent', () => {
  let component: CardGiriaComponent;
  let fixture: ComponentFixture<CardGiriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGiriaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGiriaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dadosGiria', {
      expressao: 'Expressão de teste',
      significado: 'Significado de teste',
      contexto: 'Etarismo',
      data_criacao: new Date('2024-01-01'),
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
