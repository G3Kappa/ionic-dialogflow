import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AudioRecordingService as AudioRecorderService } from './service/audio-recorder/audio-recorder.service';
import { DialogflowService } from './service/dialogflow/dialogflow.service';
import { AlertService } from './service/alert/alert.service';

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
    private audioRecorder: AudioRecorderService,
    private dialogflow: DialogflowService,
    private alertSvc: AlertService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      const fn = 'test.wav';
      const rec = this.audioRecorder.startRecording(fn);
      if (rec) {
        setTimeout(() => {
          rec.stop();
        }, 5000);
      } else {
        this.alertSvc.create('AudioRecordingService', 'Error', 'Cannot start recording', ['Ok'])
          .present();
      }
    });
  }
}
