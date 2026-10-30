import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowTaskDetails } from './show-task-details';

describe('ShowTaskDetails', () => {
  let component: ShowTaskDetails;
  let fixture: ComponentFixture<ShowTaskDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowTaskDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowTaskDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
