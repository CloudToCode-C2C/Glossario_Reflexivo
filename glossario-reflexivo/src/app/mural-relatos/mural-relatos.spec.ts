import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MuralRelatosComponent } from './mural-relatos';

// Testa a criação do fórum.
describe('MuralRelatosComponent', () => {
  let component: MuralRelatosComponent;
  let fixture: ComponentFixture<MuralRelatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuralRelatosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MuralRelatosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
