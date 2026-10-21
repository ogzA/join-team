import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignedToDropdown } from './assigned-to-dropdown';

describe('AssignedToDropdown', () => {
  let component: AssignedToDropdown;
  let fixture: ComponentFixture<AssignedToDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedToDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedToDropdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
