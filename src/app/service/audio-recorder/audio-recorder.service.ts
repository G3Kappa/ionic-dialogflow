import { Injectable } from '@angular/core';
import { AlertService } from '../alert/alert.service';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Subject } from 'rxjs';

/**
 * Rappresenta una registrazione che è già iniziata, e che può essere chiusa.
 */
export class Recording {
  public filename: string;
  public isStopped: boolean;
  public stopped$: Subject<void>;

  private mediaObject: MediaObject;
  constructor(filename: string, obj: MediaObject) {
    this.filename = filename;
    this.mediaObject = obj;
  }

  stop(): void {
    if (!this.isStopped) {
      this.mediaObject.stopRecord();
      this.isStopped = true;
      this.stopped$.next();
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {
  public startedRecording$: Subject<string>;
  public stoppedRecording$: Subject<string>;

  constructor(private media: Media) {
    this.startedRecording$ = new Subject<string>();
    this.stoppedRecording$ = new Subject<string>();
  }

  /**
   * Comincia a registrare un file audio.
   * @returns Un oggetto `rec` di tipo Recording che può essere fermato (`rec.stop()`).
   * @event `startedRecording$`
   * @event `stoppedRecording$` (chiamato automaticamente da `rec.stop()`).
   */
  startRecording(filename: string): Recording {
    const file = this.media.create(filename);
    try {
      file.startRecord();
      this.startedRecording$.next(filename);
      const ret = new Recording(filename, file);
      ret.stopped$.subscribe(() => {
        this.stoppedRecording$.next(ret.filename);
      });
      return ret;
    } catch (e) {
      return null;
    }
  }
}
