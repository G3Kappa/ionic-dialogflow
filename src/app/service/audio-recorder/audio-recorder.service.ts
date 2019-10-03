import { Injectable } from '@angular/core';
import { AlertService } from '../alert/alert.service';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class Recording {
  public filename: string;
  public isClosed: boolean;
  private mediaObject: MediaObject;
  constructor(filename: string, obj: MediaObject) {
    this.filename = filename;
    this.mediaObject = obj;
  }

  close(): void {
    if (!this.isClosed) {
      this.mediaObject.stopRecord();
      this.isClosed = true;
    }
  }
}

export class AudioRecordingService {
  public startedRecording$: Subject<string>;
  public stoppedRecording$: Subject<string>;

  constructor(private alertSvc: AlertService, private media: Media) {
    this.startedRecording$ = new Subject<string>();
    this.stoppedRecording$ = new Subject<string>();
  }

  startRecording(filename: string): Recording {
    const file = this.media.create(filename);
    try {
      file.startRecord();
      this.startedRecording$.next(filename);
      return new Recording(filename, file);
    } catch (e) {
      this.alertSvc.create('AudioRecordingService', 'Error', 'Cannot start recording', ['Ok'])
        .then(binder => {
          binder.present();
        });
    }
  }

  stopRecording(rec: Recording): void {
    rec.close();
    this.stoppedRecording$.next(rec.filename);
  }
}
