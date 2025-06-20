import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosFinancieros } from './productos-financieros';

describe('ProductosFinancieros', () => {
  let component: ProductosFinancieros;
  let fixture: ComponentFixture<ProductosFinancieros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosFinancieros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosFinancieros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
