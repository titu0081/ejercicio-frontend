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
import { Producto } from '../../models/producto.model';

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
    private modal: ModalService,
  ) {}

  productos: Producto[] = [];
  productosTodos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  cargando: boolean = true;
  cantidadRegistros = ['TODOS', 5, 10, 20];
  cantidadSeleccionada: string | number = 5;
  dropdownAbierto: number | null = null;

  mostrarDropDown(event: MouseEvent, index: number) {
    event.stopPropagation();

    this.dropdownAbierto = this.dropdownAbierto === index ? null : index;

    if (this.dropdownAbierto === index) {
      // Busca el dropdown más cercano dentro del contenedor del botón
      const button = event.currentTarget as HTMLElement;
      const dropdownContainer = button.closest('.dropdown') as HTMLElement;
      const dropdown = dropdownContainer?.querySelector(
        '.dropdown-content',
      ) as HTMLElement;

      if (dropdown) {
        const rect = button.getBoundingClientRect(); //Obtener la posicion del botón

        dropdown.style.position = 'fixed';
        dropdown.style.top = rect.bottom - 15 + 'px';
        dropdown.style.left = rect.right - 180 + 'px';
      }
    }
  }

  cerrarDropdownAlHacerClick() {
    (window as any).onclick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (let i = 0; i < dropdowns.length; i++) {
          const openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    };
  }

  ngOnInit() {
    this.mostrarProductos();
    this.cerrarDropdownAlHacerClick();
  }

  ngAfterViewInit() {
    const container = document.querySelector('.table-container');
    container?.addEventListener('scroll', () => {
      this.dropdownAbierto = null;
    });
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
          String(val).toLowerCase().includes(search),
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

  editarElemento(indexProducto: number) {
    this.dropdownAbierto = null;
    this.abrirFormulario(indexProducto);
  }

  eliminarElemento(producto: Producto) {
    this.cerrarDropdownAlHacerClick();
    this.modal.abrirModal({
      mensaje: '¿Está seguro de eliminar el producto ' + producto.name + '?',
      confirmarTexto: 'Confirmar',
      cancelarTexto: 'Cancelar',
      callbackConfirmar: () => {
        this.eliminarProducto(producto);
      },
    });
  }

  eliminarProducto(productoEliminar: Producto) {
    const urlEliminar = 'bp/products/' + productoEliminar.id;
    this.servicioProductos.servicioDelete(urlEliminar).subscribe({
      next: () => {
        // Elimina de la lista sin recargar desde el backend
        this.productos = this.productos.filter(
          (producto) => producto.id !== productoEliminar.id,
        );
        this.productosTodos = [...this.productos];
        this.actualizarProductosFiltrados();
        this.cdr.detectChanges(); // Actualizar la vista
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
