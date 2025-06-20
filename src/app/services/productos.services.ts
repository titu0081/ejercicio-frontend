import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductosServices {
  constructor(private httpClient: HttpClient) {}

  ruta: string = environment.urlProductos;

  servicioGet(complemento: any): Observable<any> {
    return this.httpClient.get(this.ruta + complemento);
  }

  servicioPost(complemento: any, body: any): Observable<any> {
    return this.httpClient.post(this.ruta + complemento, body);
  }
  servicioPut(complemento: any, body: any): Observable<any> {
    return this.httpClient.put(this.ruta + complemento, body);
  }

  servicioDelete(complemento: any): Observable<any> {
    return this.httpClient.delete(this.ruta + complemento);
  }
}
