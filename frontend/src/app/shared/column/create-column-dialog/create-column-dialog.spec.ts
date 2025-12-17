import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateColumnDialog } from './create-column-dialog';

describe('CreateColumnDialog', () => {
  let component: CreateColumnDialog;
  let fixture: ComponentFixture<CreateColumnDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateColumnDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateColumnDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
