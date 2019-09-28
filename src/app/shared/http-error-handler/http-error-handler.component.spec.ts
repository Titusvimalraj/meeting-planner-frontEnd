import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpErrorHandlerComponent } from './http-error-handler.component';

describe('HttpErrorHandlerComponent', () => {
  let component: HttpErrorHandlerComponent;
  let fixture: ComponentFixture<HttpErrorHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HttpErrorHandlerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpErrorHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
