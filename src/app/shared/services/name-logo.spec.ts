import { TestBed } from '@angular/core/testing';
import { NameLogo } from './name-logo';

describe('NameLogo', () => {
  let service: NameLogo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NameLogo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
