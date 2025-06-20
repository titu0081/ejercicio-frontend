import {
  Component,
  OnInit,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { ProductosServices } from '../../services/productos.services';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productos-financieros',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './productos-financieros.html',
  styleUrl: './productos-financieros.scss',
})
export class ProductosFinancieros implements OnInit {
  constructor(
    private servicioProductos: ProductosServices,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modal: ModalService
  ) {}

  productos: any[] = [];
  productosTodos: any[] = [];
  productosFiltrados: any[] = [];
  cargando: boolean = true;
  cantidadRegistros = ['TODOS', 5, 10, 20];
  cantidadSeleccionada: string | number = 5;
  menuActivo: number | null = null;

  ngOnInit() {
    this.mostrarProductos();
  }

  mostrarProductos() {
    this.productos = [];
    this.productosTodos = [];
    this.cargando = true;

    this.servicioProductos.servicioGet('bp/products').subscribe({
      next: (respuestaProductos) => {
        if (respuestaProductos.data.length > 0) {
          this.productos = [...respuestaProductos.data];
          this.productosTodos = [...respuestaProductos.data];
        } else {
          this.productos = [];
        }
        this.cargando = false;
        this.actualizarProductosFiltrados();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.productos = [];
        this.cdr.detectChanges();
      },
    });
  }

  filtrarLotes(event: any) {
    const search = event.target.value.toLowerCase();

    if (search === '') {
      this.productos = [...this.productosTodos];
    } else {
      this.productos = this.productosTodos.filter((item) => {
        return Object.values(item).some((val) =>
          String(val).toLowerCase().includes(search)
        );
      });
    }

    this.actualizarProductosFiltrados();
  }

  abrirFormulario(productoSeleccionado?: number) {
    const producto =
      typeof productoSeleccionado === 'number'
        ? this.productos[productoSeleccionado]
        : null;

    this.router.navigate(['/formulario'], {
      state: {
        productos: this.productos,
        productoSeleccionado: producto,
      },
    });
  }

  toggleMenu(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.menuActivo = this.menuActivo === index ? null : index;
  }

  @HostListener('document:click', ['$event'])
  cerrarMenu(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.opciones')) {
      this.menuActivo = null;
    }
  }

  editarElemento(indexProducto: number) {
    this.menuActivo = null;
    this.abrirFormulario(indexProducto);
  }

  eliminarElemento(producto: any) {
    this.menuActivo = null;
    this.modal.abrirModal({
      mensaje: '¿Está seguro de eliminar el producto ' + producto.name + '?',
      confirmarTexto: 'Confirmar',
      cancelarTexto: 'Cancelar',
      callbackConfirmar: () => {
        this.eliminarProducto(producto);
      },
    });
  }

  eliminarProducto(productoEliminar: any) {
    const urlEliminar = 'bp/products/' + productoEliminar.id;
    this.servicioProductos.servicioDelete(urlEliminar).subscribe({
      next: () => {
        // Elimina de la lista sin recargar desde el backend
        this.productos = this.productos.filter(
          (producto) => producto.id !== productoEliminar.id
        );
        this.productosTodos = [...this.productos];
        this.actualizarProductosFiltrados();
        this.cdr.detectChanges(); // 👈 Fuerza la actualización de la vista
      },
      error: () => {
        this.cargando = false;
        this.productos = [];
        this.cdr.detectChanges();
      },
    });
  }

  actualizarProductosFiltrados() {
    if (this.cantidadSeleccionada === 'TODOS') {
      this.productosFiltrados = this.productos;
    } else {
      const cantidad = Number(this.cantidadSeleccionada);
      this.productosFiltrados = this.productos.slice(0, cantidad);
    }
  }
}
