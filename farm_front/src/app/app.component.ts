import { Component, ViewChild } from '@angular/core';
import { BasemapComponent } from './basemap/basemap.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Agrosatelite farm project'
  @ViewChild('map') map!: BasemapComponent
}
