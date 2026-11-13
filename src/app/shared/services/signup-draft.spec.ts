import { TestBed } from '@angular/core/testing';
import { SignupDraft } from './signup-draft';

describe('SignupDraft', () => {
  let service: SignupDraft;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignupDraft);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
