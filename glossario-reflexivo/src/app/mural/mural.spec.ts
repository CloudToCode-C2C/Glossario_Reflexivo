import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MuralComponent } from './mural';

// Confere a criação do mural que carrega e filtra os verbetes.
describe('MuralComponent', () => {
  let component: MuralComponent;
  let fixture: ComponentFixture<MuralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MuralComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
