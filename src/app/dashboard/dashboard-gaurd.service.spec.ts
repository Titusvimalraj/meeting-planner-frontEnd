import { TestBed } from '@angular/core/testing';

import { DashboardGaurdService } from './dashboard-gaurd.service';

describe('DashboardGaurdService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardGaurdService = TestBed.get(DashboardGaurdService);
    expect(service).toBeTruthy();
  });
});
