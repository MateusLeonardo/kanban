import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCardDialog } from './create-card-dialog';

describe('CreateCardDialog', () => {
  let component: CreateCardDialog;
  let fixture: ComponentFixture<CreateCardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCardDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCardDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
