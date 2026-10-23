import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-card-giria',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './card-giria.html',
  styleUrls: ['./card-giria.scss']
})
export class CardGiriaComponent {
  @Input() dadosGiria!: any;
}