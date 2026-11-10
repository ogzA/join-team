import { TestBed } from '@angular/core/testing';
import { Intro } from './intro';

describe('Intro', () => {
  let service: Intro;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Intro);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
