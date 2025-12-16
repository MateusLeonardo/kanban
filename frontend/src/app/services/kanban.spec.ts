import { TestBed } from '@angular/core/testing';

import { Kanban } from './kanban.service';

describe('Kanban', () => {
  let service: Kanban;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Kanban);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
