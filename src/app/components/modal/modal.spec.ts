import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from './modal';
import { ModalService } from '../../services/modal.services';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;
  let modalService: ModalService;
  let modalDataSubject: BehaviorSubject<any>;

  const mockModalData = {
    titulo: 'Test Title',
    mensaje: 'Test Message',
    confirmarTexto: 'Confirm',
    cancelarTexto: 'Cancel',
    soloConfirmar: false,
    callbackConfirmar: jest.fn(),
    callbackCancelar: jest.fn(),
  };

  beforeEach(async () => {
    modalDataSubject = new BehaviorSubject(null);

    await TestBed.configureTestingModule({
      imports: [Modal, CommonModule],
      providers: [
        {
          provide: ModalService,
          useValue: {
            modalData: modalDataSubject.asObservable(),
            cerrarModal: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el overlay y modal cuando hay datos', () => {
    modalDataSubject.next(mockModalData);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.overlay');
    const modal = fixture.nativeElement.querySelector('.modal');

    expect(overlay).toBeTruthy();
    expect(modal).toBeTruthy();
  });

  it('debe ocultar el overlay y modal cuando no hay datos', () => {
    modalDataSubject.next(null);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.overlay');
    expect(overlay).toBeFalsy();
  });

  it('debe mostrar el título cuando está presente', () => {
    modalDataSubject.next(mockModalData);
    fixture.detectChanges();

    const titulo = fixture.nativeElement.querySelector('.titulo');
    expect(titulo.textContent).toContain(mockModalData.titulo);
  });

  it('debe mostrar el mensaje correctamente', () => {
    modalDataSubject.next(mockModalData);
    fixture.detectChanges();

    const mensaje = fixture.nativeElement.querySelector('p');
    expect(mensaje.textContent).toContain(mockModalData.mensaje);
  });

  it('debe mostrar ambos botones cuando soloConfirmar es false', () => {
    modalDataSubject.next(mockModalData);
    fixture.detectChanges();

    const botones = fixture.nativeElement.querySelectorAll('.acciones button');
    expect(botones.length).toBe(2);
    expect(botones[0].textContent).toContain(mockModalData.cancelarTexto);
    expect(botones[1].textContent).toContain(mockModalData.confirmarTexto);
  });

  it('debe mostrar solo el botón de confirmar cuando soloConfirmar es true', () => {
    modalDataSubject.next({ ...mockModalData, soloConfirmar: true });
    fixture.detectChanges();

    const botones = fixture.nativeElement.querySelectorAll('.acciones button');
    expect(botones.length).toBe(1);
    expect(botones[0].textContent).toContain(mockModalData.confirmarTexto);
  });

  it('debe llamar a callbackConfirmar y cerrarModal al hacer clic en confirmar', () => {
    modalDataSubject.next(mockModalData);
    fixture.detectChanges();

    const botonConfirmar = fixture.nativeElement.querySelector('.btnConfirmar');
    botonConfirmar.click();

    expect(mockModalData.callbackConfirmar).toHaveBeenCalled();
    expect(modalService.cerrarModal).toHaveBeenCalled();
  });

  it('debe llamar a callbackCancelar y cerrarModal al hacer clic en cancelar', () => {
    modalDataSubject.next(mockModalData);
    fixture.detectChanges();

    const botonCancelar = fixture.nativeElement.querySelector('.btnCancelar');
    botonCancelar.click();

    expect(mockModalData.callbackCancelar).toHaveBeenCalled();
    expect(modalService.cerrarModal).toHaveBeenCalled();
  });

  it('debe mostrar textos por defecto cuando no se proporcionan', () => {
    modalDataSubject.next({
      mensaje: 'Test Message',
      callbackConfirmar: jest.fn(),
      callbackCancelar: jest.fn(),
    });
    fixture.detectChanges();

    const botones = fixture.nativeElement.querySelectorAll('.acciones button');
    expect(botones[0].textContent).toContain('Cancelar');
    expect(botones[1].textContent).toContain('Confirmar');
  });

  it('debe mostrar solo el botón con texto "Aceptar" cuando soloConfirmar es true y no hay confirmarTexto', () => {
    modalDataSubject.next({
      mensaje: 'Test Message',
      soloConfirmar: true,
      callbackConfirmar: jest.fn(),
    });
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector('.btnConfirmar');
    expect(boton.textContent).toContain('Aceptar');
  });
});
