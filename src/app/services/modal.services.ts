import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ModalData {
  titulo?: string;
  mensaje: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
  soloConfirmar?: boolean;
  callbackConfirmar?: () => void;
  callbackCancelar?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalDataSubject = new BehaviorSubject<ModalData | null>(null);
  modalData = this.modalDataSubject.asObservable();

  abrirModal(data: ModalData) {
    this.modalDataSubject.next(data);
  }

  cerrarModal() {
    this.modalDataSubject.next(null);
  }
}
