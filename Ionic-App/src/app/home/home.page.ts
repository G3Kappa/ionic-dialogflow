import { Component, EventEmitter, NgZone } from '@angular/core';
import { AlertService } from '../service/alert/alert.service';
import { Message } from '../message';
import { SpeechToTextService } from '../service/stt/stt.service';
import { TextToSpeechService } from '../service/tts/tts.service';
import { AssistantService } from '../service/assistant/assistant.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  {
  message: string;
  sentences: Array<Message>;
  messageReceived$: Subject<string>;

  constructor(
    private speechToText: SpeechToTextService,
    private textToSpeech: TextToSpeechService,
    private assistant: AssistantService,
    private alertSvc: AlertService,
    private ngZone: NgZone
  ) {
    this.sentences = [];
    this.messageReceived$.subscribe(msg => {
      this.sentences.push({sender: 'Assistant', body: msg, date: new Date()});
    });
  }

  onStartRecording() {
    this.speechToText.startTranscribing()
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
    this.textToSpeech.speak(`${user} dice: ${message}`);
    this.assistant.getReply(message)
      .subscribe(reply => this.messageReceived$.next(reply));
    this.sentences.push({sender: user, body: message, date: new Date()});
    this.message = '';
  }
}
