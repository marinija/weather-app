import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, pluck, switchMap, tap, toArray } from 'rxjs/operators';
import { CityReponse, ForecastService } from 'src/app/services/forecast.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { WeatherFieldsUse } from './../../services/forecast.service';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit {

  forecastData: WeatherFieldsUse[] = [];
  public readonly imgUrl = 'http://openweathermap.org/img/wn/';
  cityToSearch: FormControl;
  city: CityReponse = { country: '', name: '' };

  constructor(private forecastService: ForecastService, private notificationService: NotificationsService) { }

  ngOnInit() {
    this.cityToSearch = new FormControl('');
    this.forecastService.cityInfo$.subscribe(res => {
      this.city = res;
    });
    this.forecastService.getForecast().subscribe(weatherResponse => {
      console.log(weatherResponse);
      this.forecastData = weatherResponse;
    });
  }

  searchTown() {
    this.forecastService.getForecastByCity(this.cityToSearch.value)
      .pipe(tap(value => this.city = value.city),
        this.forecastService.getListItems()
      ).subscribe(res => {
        console.log(res);
        this.forecastData = res;
        this.notificationService.addSuccess(`Got town location: ${this.city.name}`);
      }, err => {
        this.notificationService.addError('Searched town not found');
        this.cityToSearch.reset();
      });
  }

}
