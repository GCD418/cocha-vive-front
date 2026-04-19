import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { Navbar } from './layout/navbar/navbar';

@Component({
  selector: 'app-navbar',
  template: '<nav data-testid="navbar-stub"></nav>'
})
class NavbarStubComponent {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    TestBed.overrideComponent(App, {
      remove: { imports: [Navbar] },
      add: { imports: [NavbarStubComponent] },
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should expose title signal with app name', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as App & { title: () => string };

    expect(app.title()).toBe('CochaVive');
  });

  it('should render app shell with navbar and router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-navbar')).not.toBeNull();
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
