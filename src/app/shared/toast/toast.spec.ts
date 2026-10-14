import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastClass } from './toast';

describe('Toast', () => {
  let component: ToastClass;
  let fixture: ComponentFixture<ToastClass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastClass],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastClass);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
