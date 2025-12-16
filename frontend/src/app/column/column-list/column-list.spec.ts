import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnList } from './column-list';

describe('ColumnList', () => {
  let component: ColumnList;
  let fixture: ComponentFixture<ColumnList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
