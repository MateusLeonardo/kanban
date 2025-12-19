import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCardDialog } from './update-card-dialog';

describe('UpdateCardDialog', () => {
  let component: UpdateCardDialog;
  let fixture: ComponentFixture<UpdateCardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCardDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCardDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
