import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardGiria } from './card-giria';

describe('CardGiria', () => {
  let component: CardGiria;
  let fixture: ComponentFixture<CardGiria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGiria],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGiria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
