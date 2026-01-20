/**
 * Interfaz que define la estructura de un Producto Financiero
 */
export interface Producto {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

/**
 * Interfaz para el formulario de entrada de datos
 * Mapea los campos del formulario a los nombres esperados
 */
export interface ProductoFormulario {
  id: string;
  nombre: string;
  descripcion: string;
  logo: string;
  fechaLiberacion: string;
  fechaRevision: string;
}

/**
 * Respuesta del API al obtener productos
 */
export interface RespuestaProductos {
  data: Producto[];
}

/**
 * Respuesta del API al crear o actualizar un producto
 */
export interface RespuestaProducto {
  data: Producto;
}
