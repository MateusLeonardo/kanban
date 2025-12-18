import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateColumnDialog } from './update-column-dialog';

describe('UpdateColumnDialog', () => {
  let component: UpdateColumnDialog;
  let fixture: ComponentFixture<UpdateColumnDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateColumnDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateColumnDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
