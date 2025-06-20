import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  modalService = inject(ModalService);
}
