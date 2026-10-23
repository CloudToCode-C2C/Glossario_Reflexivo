import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Glossario } from './glossario';

describe('Glossario', () => {
  let component: Glossario;
  let fixture: ComponentFixture<Glossario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Glossario],
    }).compileComponents();

    fixture = TestBed.createComponent(Glossario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
