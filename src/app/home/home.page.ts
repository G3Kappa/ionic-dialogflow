import { Component, EventEmitter, NgZone } from '@angular/core';
import { AlertService } from '../service/alert/alert.service';
import { Message } from '../message';
import { TextToSpeechService } from '../service/tts/tts.service';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  {
  message: string = '';
  sentences: Array<Message>;

  constructor(
    private tts: TextToSpeechService,
    alertSvc: AlertService,
    private ngZone: NgZone
  ) {
    this.sentences = [
      { sender: 'human', body: 'Richiesta 1', date: new Date() },
      { sender: 'assistant', body: 'Risposta 1', date: new Date() },
      { sender: 'human', body: 'Richiesta 2', date: new Date() },
      { sender: 'assistant', body: 'Risposta 2', date: new Date() },
      { sender: 'human', body: 'Richiesta 3', date: new Date() },
      { sender: 'assistant', body: 'Risposta 3', date: new Date()},
      { sender: 'human', body: 'Richiesta 4', date: new Date() },
      { sender: 'assistant', body: 'Risposta 4', date: new Date() },
      { sender: 'human', body: 'Richiesta 5', date: new Date() },
      { sender: 'assistant', body: 'Risposta 5', date: new Date() },
    ];
  }

  onStartRecording() {
    this.tts.startTranscribing()
      .subscribe((data: string[]) => {
        this.ngZone.run(() => {
          this.message = data[0];
        });
      });
  }

  onSendMessage(user: string, message: string) {
    if (message.trim().length === 0) {
      return;
    }
    this.sentences.push({sender: user, body: message, date: new Date()});
    this.message = '';
  }
}
