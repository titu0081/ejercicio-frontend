import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Modal } from './components/modal/modal';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Modal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'ejercicio-frontend';
}
