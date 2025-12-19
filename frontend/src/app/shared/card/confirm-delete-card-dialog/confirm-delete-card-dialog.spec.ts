import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteCardDialog } from './confirm-delete-card-dialog';

describe('ConfirmDeleteCardDialog', () => {
  let component: ConfirmDeleteCardDialog;
  let fixture: ComponentFixture<ConfirmDeleteCardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteCardDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteCardDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
