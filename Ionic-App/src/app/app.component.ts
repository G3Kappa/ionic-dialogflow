import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SpeechToTextService } from './service/stt/stt.service';
import { AlertService } from './service/alert/alert.service';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Subject, from, Observable, of, forkJoin, merge, zip } from 'rxjs';
import { map, catchError, switchMap, mergeAll, concatAll } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private speechToText: SpeechToTextService,
    private alertSvc: AlertService,
    private diagnostic: Diagnostic
  ) {
    this.initializeApp();
  }

  requestPermissions(): Observable<boolean> {
    const diagNoStorage = this.alertSvc.create('e-no_storage', 'Permission error', 'Cannot access local storage.', ['Ok']);
    const diagNoStt = this.alertSvc.create('e-no_tts', 'Permission error', 'Cannot access Speech-to-Text services.', ['Ok']);

    const storage = () => from(this.diagnostic.requestExternalStorageAuthorization()).pipe(
      switchMap((x: string) => {
        return 'GRANTED' === x ? of(true) : diagNoStorage.present().closed$.pipe(map(evt => false));
      }),
      catchError((_, __) => {
        return diagNoStorage.present().closed$.pipe(map(evt => false));
      })
    );

    const stt = () => this.speechToText.requestPermissions().pipe(
      switchMap((hasPerm: boolean) => {
        if (hasPerm) {
          return of(true);
        }
        return diagNoStt.present().closed$.pipe(map(evt => false));
      })
    );

    return storage()
      .pipe(
        switchMap(data => {
          return stt().pipe(map(t => [t, data]));
        })
      )
      .pipe(
        map(perms => {
          return perms.every(x => x);
        })
      );
  }
  initializeApp(): void {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.requestPermissions().subscribe((hasNecessaryPerms: boolean) => {
        if (hasNecessaryPerms) {
          return;
        }
        this.alertSvc
          .create('e-no_core_perms', 'Permission error', 'The app needs Speech-To-Text and storage permissions.', ['Ok'])
          // tslint:disable-next-line: no-string-literal
          .closed(_ => navigator['app'].exitApp())
          .present();
      });
    });
  }
}
