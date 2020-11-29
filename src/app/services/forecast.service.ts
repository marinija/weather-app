import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'
import { BehaviorSubject, Observable, of, OperatorFunction, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, pluck, retry, switchMap, tap, toArray } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class ForecastService {

  private readonly appId = '4f6cc4916dd9263ffc62e8b87604fc27';
  private readonly url = 'http://api.openweathermap.org/data/2.5/forecast';

  public cityInfo$: BehaviorSubject<CityReponse> = new BehaviorSubject<CityReponse>(null);

  constructor(private http: HttpClient, private notificationService: NotificationsService) { }

  getForecastByCity(searchTown: string): Observable<OpenWeatherReponse> {
    const params = new HttpParams()
      .set('q', searchTown)
      .set('units', 'metric')
      .set('appid', this.appId)
    return this.http.get<OpenWeatherReponse>(this.url, { params })
  }

  getForecast(): Observable<WeatherFieldsUse[]> {
    return this.getCurrentLocation().pipe(
      map(coords => {
        return new HttpParams()
          .set('lat', String(coords.latitude))
          .set('lon', String(coords.longitude))
          .set('units', 'metric')
          .set('appid', this.appId)
      }),
      switchMap(params => this.http.get<OpenWeatherReponse>(this.url, { params })),
      tap(res => this.cityInfo$.next(res.city)),
      tap(result => console.log(result)),
      this.getListItems()
    )
  }

  public getListItems(): OperatorFunction<OpenWeatherReponse, WeatherFieldsUse[]> {
    return function (items: Observable<OpenWeatherReponse>) {
      return items.pipe(
        pluck('list'),
        mergeMap(value => {
          return of(...value);
        }),
        filter((value, index) => index % 8 === 0),
        map(value => {
          return {
            dateString: value.dt_txt,
            temp: value.main.temp,
            temp_min: value.main.temp_min,
            temp_max: value.main.temp_max,
            description: value.weather[0].description,
            icon: value.weather[0].icon,
            main: value.weather[0].main
          }
        }),
        toArray());
    }
  }

  getCurrentLocation(): Observable<Coordinates> {
    return new Observable<Coordinates>(observer => {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position.coords);
          observer.complete();
        },
        err => observer.error(err)
      )
    }).pipe(
      retry(2),
      tap(() => {
        this.notificationService.addSuccess('Got your location');
      }),
      catchError(err => {
        // #1 - Handle the error
        this.notificationService.addError('Failed to get your location');

        // #2 - Return a new observable
        return throwError(err);
      })
    );
  }
}

export interface OpenWeatherReponse {
  city: CityReponse;
  list: {
    dt_txt: string;
    main: {
      temp: number,
      temp_min: number,
      temp_max: number
    }
    weather: {
      description: string,
      icon: string,
      main: string
    }[]
  }[]
}

export interface CityReponse {
  country: string;
  name: string;
}

export interface WeatherFieldsUse {
  dateString: string;
  temp: number;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  main: string;
}