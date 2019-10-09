import { Component, EventEmitter, NgZone } from '@angular/core';
import { AlertService } from '../service/alert/alert.service';
import { Message } from '../message';
import { TextToSpeechService } from '../service/tts/tts.service';
import { ControlValueAccessor } from '@angular/forms';
import { SpeechToTextService } from '../service/stt/stt.service';
import { AssistantService, DialogflowQueryOptions } from '../service/assistant/assistant.service';
import { Subject, forkJoin, of } from 'rxjs';
import { GeoService } from '../geo/geo.service';
import { map, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  message = '';
  sentences: Array<Message>;

  constructor(
    private tts: TextToSpeechService,
    private stt: SpeechToTextService,
    private geo: GeoService,
    private assistant: AssistantService,
    private alertSvc: AlertService,
    private ngZone: NgZone
  ) {
    this.sentences = [];
  }

  onStartRecording() {
    this.stt.startTranscribing().subscribe((data: string[]) => {
      this.ngZone.run(() => {
        this.message = data[0];
      });
    });
  }

  sendMessage(user: string, message: string) {
    this.sentences.push({ sender: user, body: message, date: new Date() });
  }

  onSendMessage(user: string, message: string) {
    if (message.trim().length === 0) {
      return;
    }
    this.sendMessage(user, message);

    const options: DialogflowQueryOptions = {};

    const pos$ = this.geo.getCurrentPosition().pipe(
      switchMap(pos =>
        this.geo.reverseGeocode(pos).pipe(
          map(r => r[0]),
          catchError(e => of(undefined))
        )
      )
    );

    forkJoin([pos$]).subscribe(res => {
      options.userGeoCity = res[0];

      this.assistant.getReply(message).subscribe(reply => {
        this.tts.speak(reply.responseText);
        this.sendMessage('Assistant', reply.responseText);
      });
      this.message = '';
    });
  }
}
