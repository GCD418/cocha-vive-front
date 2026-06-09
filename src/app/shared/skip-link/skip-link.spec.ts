import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkipLinkComponent } from './skip-link';
import { provideTranslateService } from '@ngx-translate/core';

describe('SkipLinkComponent', () => {
  let fixture: ComponentFixture<SkipLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkipLinkComponent],
      providers: [provideTranslateService()],
    }).compileComponents();
    fixture = TestBed.createComponent(SkipLinkComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
