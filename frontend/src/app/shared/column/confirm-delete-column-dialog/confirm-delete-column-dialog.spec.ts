import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteColumnDialog } from './confirm-delete-column-dialog';

describe('ConfirmDeleteColumnDialog', () => {
  let component: ConfirmDeleteColumnDialog;
  let fixture: ComponentFixture<ConfirmDeleteColumnDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteColumnDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteColumnDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
