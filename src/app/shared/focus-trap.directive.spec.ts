import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FocusTrapDirective } from './focus-trap.directive';

@Component({
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div appFocusTrap>
      <button id="first">First</button>
      <input id="middle" />
      <button id="last">Last</button>
    </div>
  `,
})
class TestComponent {}

describe('FocusTrapDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, FocusTrapDirective],
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const el = fixture.debugElement.query(By.directive(FocusTrapDirective));
    expect(el).toBeTruthy();
  });
});
