import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ProductosFinancieros } from './productos-financieros';
import { ProductosServices } from '../../services/productos.services';
import { ModalService } from '../../services/modal.services';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

describe('ProductosFinancieros', () => {
  let component: ProductosFinancieros;
  let fixture: ComponentFixture<ProductosFinancieros>;
  let mockProductosService: any;
  let mockModalService: any;
  let mockRouter: any;

  const productoMock = {
    id: 'uno',
    name: 'Tarjeta Titanium',
    logo: 'banco.png',
    description: 'Tarjeta de crédito',
    date_release: '2026-06-21',
    date_revision: '2025-06-21',
  };

  beforeEach(async () => {
    mockProductosService = {
      servicioGet: jest.fn().mockReturnValue(of({ data: [productoMock] })),
      servicioDelete: jest.fn().mockReturnValue(of({ success: true })),
    };

    mockModalService = {
      abrirModal: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductosFinancieros],
      providers: [
        { provide: ProductosServices, useValue: mockProductosService },
        { provide: ModalService, useValue: mockModalService },
        { provide: Router, useValue: mockRouter },
        { provide: ChangeDetectorRef, useValue: { detectChanges: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosFinancieros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener el método mostrarProductos()', () => {
    expect(typeof component.mostrarProductos).toBe('function');
  });

  it('debe cargar productos correctamente', fakeAsync(() => {
    component.mostrarProductos();
    tick();
    expect(mockProductosService.servicioGet).toHaveBeenCalledWith(
      'bp/products',
    );
    expect(component.productos.length).toBe(1);
    expect(component.productos[0].name).toBe('Tarjeta Titanium');
  }));

  it('debe manejar error al cargar productos', fakeAsync(() => {
    mockProductosService.servicioGet.mockReturnValueOnce(
      throwError(() => new Error('error')),
    );
    component.mostrarProductos();
    tick();
    expect(component.productos).toEqual([]);
  }));

  it('debe filtrar productos correctamente', () => {
    component.productosTodos = [productoMock];
    const event = { target: { value: 'titanium' } };
    component.filtrarLotes(event);
    expect(component.productos.length).toBe(1);
    expect(component.productos[0].name).toBe('Tarjeta Titanium');
  });

  it('debe abrir formulario con producto seleccionado', () => {
    component.productos = [productoMock];
    component.abrirFormulario(0);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/formulario'], {
      state: {
        productos: [productoMock],
        productoSeleccionado: productoMock,
      },
    });
  });

  it('debe cerrar el dropdown al hacer click fuera', () => {
    component.dropdownAbierto = 1;
    component.cerrarDropdown();
    expect(component.dropdownAbierto).toBeNull();
  });

  it('debe editar un producto', () => {
    component.productos = [productoMock];
    const spy = jest.spyOn(component, 'abrirFormulario');

    component.editarElemento(0);

    expect(component.dropdownAbierto).toBeNull();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('debe restaurar productos si el filtro está vacío', () => {
    component.productosTodos = [productoMock];
    component.productos = [];

    const event = { target: { value: '' } };
    component.filtrarLotes(event);

    expect(component.productos.length).toBe(1);
  });

  it('debe mostrar todos los productos cuando es TODOS', () => {
    component.productos = [productoMock];
    component.cantidadSeleccionada = 'TODOS';

    component.actualizarProductosFiltrados();

    expect(component.productosFiltrados.length).toBe(1);
  });

  it('debe manejar respuesta vacía del servicio', fakeAsync(() => {
    mockProductosService.servicioGet.mockReturnValueOnce(of({ data: [] }));

    component.mostrarProductos();
    tick();

    expect(component.productos).toEqual([]);
  }));
});
