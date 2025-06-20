import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioIngreso } from './formulario-ingreso';

describe('FormularioIngreso', () => {
  let component: FormularioIngreso;
  let fixture: ComponentFixture<FormularioIngreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioIngreso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioIngreso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
