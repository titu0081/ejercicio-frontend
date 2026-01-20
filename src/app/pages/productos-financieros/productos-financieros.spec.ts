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
    expect(component.cargando).toBe(false);
  }));

  it('debe manejar error al cargar productos', fakeAsync(() => {
    mockProductosService.servicioGet.mockReturnValueOnce(
      throwError(() => new Error('error')),
    );
    component.mostrarProductos();
    tick();
    expect(component.productos).toEqual([]);
    expect(component.cargando).toBe(false);
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

  it('debe abrir el modal de confirmación al eliminar un producto', () => {
    component.eliminarElemento(productoMock);
    expect(mockModalService.abrirModal).toHaveBeenCalledWith(
      expect.objectContaining({
        mensaje: expect.stringContaining('Tarjeta Titanium'),
        callbackConfirmar: expect.any(Function),
      }),
    );
  });

  it('debe llamar a eliminarProducto al confirmar en el modal', () => {
    const spy = jest.spyOn(component, 'eliminarProducto');
    mockModalService.abrirModal.mockImplementation((config: any) => {
      config.callbackConfirmar();
    });
    component.eliminarElemento(productoMock);
    expect(spy).toHaveBeenCalledWith(productoMock);
  });

  it('debe eliminar el producto correctamente', fakeAsync(() => {
    mockProductosService.servicioGet.mockReturnValue(
      of({ data: [productoMock] }),
    );
    component.eliminarProducto(productoMock);
    tick();
    expect(mockProductosService.servicioDelete).toHaveBeenCalledWith(
      'bp/products/uno',
    );
  }));

  it('debe cerrar el menú al hacer clic fuera', () => {
    component.menuActivo = 0;

    // Crea un elemento que no tenga la clase 'opciones'
    const div = document.createElement('div');
    document.body.appendChild(div);

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    // Simula el click
    div.dispatchEvent(event);

    expect(component.menuActivo).toBeNull();
    document.body.removeChild(div);
  });

  it('debe alternar el menú activo', () => {
    const event = new MouseEvent('click');
    component.toggleMenu(event, 1);
    expect(component.menuActivo).toBe(1);
    component.toggleMenu(event, 1);
    expect(component.menuActivo).toBeNull();
  });
});
