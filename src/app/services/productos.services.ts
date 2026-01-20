import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Producto,
  RespuestaProductos,
  RespuestaProducto,
} from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosServices {
  constructor(private httpClient: HttpClient) {}

  private ruta: string = environment.urlProductos;

  /**
   * Obtiene una lista de productos
   */
  servicioGet(complemento: string): Observable<RespuestaProductos> {
    return this.httpClient.get<RespuestaProductos>(this.ruta + complemento);
  }

  /**
   * Crea un nuevo producto
   */
  servicioPost(
    complemento: string,
    body: Partial<Producto>,
  ): Observable<RespuestaProducto> {
    return this.httpClient.post<RespuestaProducto>(
      this.ruta + complemento,
      body,
    );
  }

  /**
   * Actualiza un producto existente
   */
  servicioPut(
    complemento: string,
    body: Partial<Producto>,
  ): Observable<RespuestaProducto> {
    return this.httpClient.put<RespuestaProducto>(
      this.ruta + complemento,
      body,
    );
  }

  /**
   * Elimina un producto
   */
  servicioDelete(complemento: string): Observable<RespuestaProducto> {
    return this.httpClient.delete<RespuestaProducto>(this.ruta + complemento);
  }
}
