import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestModule } from './../../test.module';

import { FullScreenReaderComponent } from './full-screen-reader.component';

describe('FullScreenReaderComponent', () => {
  let component: FullScreenReaderComponent;
  let fixture: ComponentFixture<FullScreenReaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(TestModule).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullScreenReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
