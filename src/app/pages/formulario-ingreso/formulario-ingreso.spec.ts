import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormularioIngreso } from './formulario-ingreso';
import { ProductosServices } from '../../services/productos.services';
import { ModalService } from '../../services/modal.services';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('FormularioIngreso', () => {
  let component: FormularioIngreso;
  let fixture: ComponentFixture<FormularioIngreso>;
  let mockProductosService: any;
  let mockModalService: any;
  let mockRouter: any;

  const productoMock = {
    id: 'uno',
    name: 'Tarjeta Titanium',
    logo: 'banco.png',
    description: 'Tarjeta de crédito',
    date_release: '2026-01-20',
    date_revision: '2027-01-20',
  };

  beforeEach(async () => {
    mockProductosService = {
      servicioGet: jest.fn().mockReturnValue(of({ data: [] })),
      servicioPost: jest.fn().mockReturnValue(of({ success: true })),
      servicioPut: jest.fn().mockReturnValue(of({ success: true })),
    };

    mockModalService = {
      abrirModal: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
      getCurrentNavigation: jest.fn().mockReturnValue({
        extras: {
          state: {
            productos: [productoMock],
            productoSeleccionado: null,
          },
        },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [FormularioIngreso, ReactiveFormsModule],
      providers: [
        { provide: ProductosServices, useValue: mockProductosService },
        { provide: ModalService, useValue: mockModalService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioIngreso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario', () => {
    expect(component.formulario).toBeDefined();
    expect(component.formulario.controls['id']).toBeDefined();
    expect(component.formulario.controls['nombre']).toBeDefined();
    expect(component.formulario.controls['descripcion']).toBeDefined();
    expect(component.formulario.controls['logo']).toBeDefined();
    expect(component.formulario.controls['fechaLiberacion']).toBeDefined();
    expect(component.formulario.controls['fechaRevision']).toBeDefined();
  });

  it('debe cargar datos cuando se edita un producto', () => {
    // Simulamos que estamos editando un producto
    mockRouter.getCurrentNavigation.mockReturnValueOnce({
      extras: {
        state: {
          productos: [productoMock],
          productoSeleccionado: productoMock,
        },
      },
    });

    fixture = TestBed.createComponent(FormularioIngreso);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.idState).toBe(true);
    expect(component.formulario.get('id')?.disabled).toBe(true);
    expect(component.formulario.get('nombre')?.value).toBe(productoMock.name);
    expect(component.formulario.get('descripcion')?.value).toBe(
      productoMock.description,
    );
    expect(component.formulario.get('logo')?.value).toBe(productoMock.logo);
    expect(component.formulario.get('fechaLiberacion')?.value).toBe(
      productoMock.date_release,
    );
    expect(component.formulario.get('fechaRevision')?.value).toBe(
      productoMock.date_revision,
    );
  });

  it('debe validar el formulario correctamente', fakeAsync(() => {
    // Configura el mock para la validación async del ID
    mockProductosService.servicioGet.mockReturnValue(of(null)); // Simula que el ID no existe

    component.formulario.patchValue({
      id: 'test123',
      nombre: 'Nombre de prueba válido',
      descripcion: 'Descripción de prueba válida con más de 10 caracteres',
      logo: 'logo.png',
      fechaLiberacion: new Date(Date.now() + 86400000)
        .toISOString()
        .split('T')[0], // Mañana
      fechaRevision: new Date(Date.now() + 86400000 * 366)
        .toISOString()
        .split('T')[0], // 1 año + 1 día después
    });

    // Espera a que se completen las validaciones async
    tick();
    fixture.detectChanges();

    expect(component.formulario.valid).toBeTruthy();
  }));

  it('debe marcar como inválido un formulario vacío', () => {
    expect(component.formulario.valid).toBeFalsy();
  });

  it('debe reiniciar el formulario correctamente', () => {
    component.formulario.patchValue({
      id: 'abc123',
      nombre: 'Producto Test',
      descripcion: 'Descripción',
      logo: 'logo.png',
      fechaLiberacion: '2026-01-20',
      fechaRevision: '2027-01-20',
    });

    component.reiniciar();
    expect(component.formulario.value).toEqual({
      id: null,
      nombre: null,
      descripcion: null,
      logo: null,
      fechaLiberacion: null,
      fechaRevision: null,
    });
  });

  it('debe navegar a la tabla principal al llamar regresarTabla', () => {
    component.regresarTabla();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  it('debe cargar los productos correctamente desde el servicio', () => {
    const productosMock = [productoMock];
    mockProductosService.servicioGet.mockReturnValue(
      of({ data: productosMock }),
    );

    component.verificarProductos();
    expect(component.productos).toEqual(productosMock);
  });

  it('debe guardar un nuevo producto correctamente', fakeAsync(() => {
    // Crear fechas válidas reales
    const hoy = new Date();
    const fechaLiberacion = new Date(hoy);
    fechaLiberacion.setDate(fechaLiberacion.getDate() + 1);

    const fechaRevision = new Date(fechaLiberacion);
    fechaRevision.setFullYear(fechaRevision.getFullYear() + 1);

    const productoNuevo = {
      id: 'cinco',
      nombre: 'Tarjeta Visa',
      descripcion: 'Tarjeta de crédito',
      logo: 'banco.png',
      fechaLiberacion: fechaLiberacion.toISOString().split('T')[0],
      fechaRevision: fechaRevision.toISOString().split('T')[0],
    };

    // Mock de validación async: simula que el ID no existe
    mockProductosService.servicioGet.mockImplementation((url: string) => {
      if (url === 'bp/products/cinco') {
        return of(null); // El ID no existe => válido
      }
      // Para la carga de productos luego del guardado
      return of({ data: [productoNuevo] });
    });

    // Mock del POST
    mockProductosService.servicioPost.mockReturnValue(
      of({
        message: 'Product added successfully',
        data: productoNuevo,
      }),
    );

    // Rellenamos el formulario
    component.formulario.patchValue({ ...productoNuevo });

    tick(); // Espera a validaciones async
    fixture.detectChanges();

    // Ejecutamos el guardado
    component.guardarNuevo();

    tick(); // Espera al subscribe
    fixture.detectChanges();

    // Validaciones
    expect(mockProductosService.servicioPost).toHaveBeenCalledWith(
      'bp/products',
      {
        id: 'cinco',
        name: 'Tarjeta Visa',
        description: 'Tarjeta de crédito',
        logo: 'banco.png',
        date_release: productoNuevo.fechaLiberacion,
        date_revision: productoNuevo.fechaRevision,
      },
    );

    expect(mockModalService.abrirModal).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Producto ingresado',
      }),
    );
  }));
});
