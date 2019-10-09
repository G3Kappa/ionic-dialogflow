import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { from, Observable } from 'rxjs';

// A service that merges geolocation and geocoding/reverse geocoding functionalities
@Injectable({ providedIn: 'root' })
export class GeoService {
  constructor(private geolocation: Geolocation, private geocoder: NativeGeocoder) {}

  getCurrentPosition(highAccuracy: boolean = true, maximumAge: number = 15 * 60 * 60, timeout: number = 5000): Observable<Geoposition> {
    return from(
      this.geolocation.getCurrentPosition({
        enableHighAccuracy: highAccuracy,
        maximumAge,
        timeout
      })
    );
  }

  watchCurrentPosition(highAccuracy: boolean = true, maximumAge: number = 15 * 60 * 60, timeout: number = 5000): Observable<Geoposition> {
    return this.geolocation.watchPosition({
      enableHighAccuracy: highAccuracy,
      maximumAge,
      timeout
    });
  }

  forwardGeocode(address: string, locale: string = 'it', maxResults: number = 1): Observable<NativeGeocoderResult[]> {
    return from(this.geocoder.forwardGeocode(address, {
      defaultLocale: locale,
      useLocale: !!locale,
      maxResults
    }));
  }
  reverseGeocode(position: Geoposition, locale: string = 'it', maxResults: number = 1): Observable<NativeGeocoderResult[]> {
    return from(this.geocoder.reverseGeocode(position.coords.latitude, position.coords.longitude, {
      defaultLocale: locale,
      useLocale: !!locale,
      maxResults
    }));
  }
}
