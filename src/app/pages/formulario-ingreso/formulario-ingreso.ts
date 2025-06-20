import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductosServices } from '../../services/productos.services';
import { ModalService } from '../../services/modal.services';

@Component({
  selector: 'app-formulario-ingreso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-ingreso.html',
  styleUrls: ['./formulario-ingreso.scss'],
})
export class FormularioIngreso {
  formulario: FormGroup;
  productos: any[] = [];
  productoSeleccionado: any = null;
  submitted: boolean = false;
  idState: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private servicioProductos: ProductosServices,
    private modal: ModalService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as {
      productos: any[];
      productoSeleccionado: any;
    };
    this.idState = false;
    this.productos = state?.productos || [];
    this.productoSeleccionado = state?.productoSeleccionado || null;

    this.formulario = this.fb.group({
      id: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
          this.idNoExisteEnProductosValidator(),
        ],
      }),
      nombre: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      }),
      descripcion: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      }),
      logo: this.fb.control('', {
        validators: [Validators.required],
      }),
      fechaLiberacion: this.fb.control('', {
        validators: [Validators.required, this.fechaHoyOPosteriorValidator()],
      }),
      fechaRevision: this.fb.control('', {
        validators: [
          Validators.required,
          this.fechaAnioDespuesValidator('fechaLiberacion'),
        ],
      }),
    });

    if (this.productoSeleccionado) {
      this.idState = true;
      this.formulario.controls['id'].disable();
    }
  }

  ngOnInit() {
    this.verificarProductos();
    this.esEditar();
  }

  idNoExisteEnProductosValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !this.productos) return null;
      const existe = this.productos.some((p) => p.id === control.value);
      return existe ? { idDuplicado: true } : null;
    };
  }

  // Validación: fecha >= hoy
  fechaHoyOPosteriorValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const fechaIngresada = this.obtenerFechaLocal(control.value);

      const hoy = new Date();
      const hoySinHora = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
      );

      return fechaIngresada >= hoySinHora ? null : { fechaMenorAHoy: true };
    };
  }

  obtenerFechaLocal(fechaStr: string): Date {
    const [anio, mes, dia] = fechaStr.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  // Validación: fecha revisión = 1 año después de fechaLiberacion
  fechaAnioDespuesValidator(fechaReferenciaControlName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const fechaRevision = new Date(control.value);
      const grupo = control.parent;
      if (!grupo) return null;

      const fechaRef = new Date(grupo.get(fechaReferenciaControlName)?.value);
      const fechaEsperada = new Date(fechaRef);
      fechaEsperada.setFullYear(fechaEsperada.getFullYear() + 1);

      return fechaRevision.toDateString() === fechaEsperada.toDateString()
        ? null
        : { fechaNoEsUnAnioDespues: true };
    };
  }

  get id() {
    return this.formulario.get('id');
  }
  get nombre() {
    return this.formulario.get('nombre');
  }
  get descripcion() {
    return this.formulario.get('descripcion');
  }
  get logo() {
    return this.formulario.get('logo');
  }
  get fechaLiberacion() {
    return this.formulario.get('fechaLiberacion');
  }
  get fechaRevision() {
    return this.formulario.get('fechaRevision');
  }

  guardarNuevo() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const nuevoProducto = this.formulario.getRawValue();

    const datosProducto: any = {
      name: nuevoProducto.nombre,
      logo: nuevoProducto.logo,
      description: nuevoProducto.descripcion,
      date_release: nuevoProducto.fechaRevision,
      date_revision: nuevoProducto.fechaLiberacion,
    };

    if (!this.idState) {
      datosProducto.id = nuevoProducto.id;
    }

    const peticion$ = this.idState
      ? this.servicioProductos.servicioPut(
          `bp/products/${nuevoProducto.id}`,
          datosProducto
        )
      : this.servicioProductos.servicioPost('bp/products', datosProducto);

    peticion$.subscribe({
      next: (respuestaProductos) => {
        if (respuestaProductos?.data) {
          console.log('Productos Respuesta', respuestaProductos);
          this.verificarProductos();
          this.reiniciar();
          if (!this.idState) {
            this.modal.abrirModal({
              titulo: 'Producto ingresado',
              mensaje: 'El producto se guardó correctamente.',
              confirmarTexto: 'Consultar productos',
              cancelarTexto: 'Ingresar nuevo',
              callbackConfirmar: () => this.regresarTabla(),
              callbackCancelar: () => {},
            });
          } else {
            this.modal.abrirModal({
              titulo: 'Producto actualizado',
              mensaje: 'El producto se actualizó correctamente.',
              confirmarTexto: 'Consultar productos',
              soloConfirmar: true,
              callbackConfirmar: () => this.regresarTabla(),
            });
          }
        }
      },
      error: (error) => {
        console.error('Error guardando producto', error);
      },
    });
  }

  verificarProductos() {
    this.productos = [];
    this.servicioProductos.servicioGet('bp/products').subscribe({
      next: (respuestaProductos) => {
        if (respuestaProductos.data.length > 0) {
          this.productos = [...respuestaProductos.data];
        } else {
          this.productos = [];
        }
      },
      error: () => {
        this.productos = [];
      },
    });
  }

  reiniciar() {
    this.formulario.reset();
  }

  regresarTabla() {
    this.router.navigate(['']);
  }

  esEditar() {
    if (this.productoSeleccionado) {
      this.formulario.patchValue({
        id: this.productoSeleccionado.id,
        nombre: this.productoSeleccionado.name,
        descripcion: this.productoSeleccionado.description,
        logo: this.productoSeleccionado.logo,
        fechaLiberacion: this.productoSeleccionado.date_revision,
        fechaRevision: this.productoSeleccionado.date_release,
      });
    }
  }
}
