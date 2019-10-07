import { Component, EventEmitter, NgZone } from '@angular/core';
import { AlertService } from '../service/alert/alert.service';
import { Message } from '../message';
import { TextToSpeechService } from '../service/tts/tts.service';
import { ControlValueAccessor } from '@angular/forms';
import { SpeechToTextService } from '../service/stt/stt.service';
import { AssistantService } from '../service/assistant/assistant.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  {
  message = '';
  sentences: Array<Message>;

  constructor(
    private tts: TextToSpeechService,
    private stt: SpeechToTextService,
    private assistant: AssistantService,
    private alertSvc: AlertService,
    private ngZone: NgZone
  ) {
    this.sentences = [];
  }

  onStartRecording() {
    this.stt.startTranscribing()
      .subscribe((data: string[]) => {
        this.ngZone.run(() => {
          this.message = data[0];
        });
      });
  }

  sendMessage(user: string, message: string) {
    this.tts.speak(`${user} dice: ${message}`);
    this.sentences.push({sender: user, body: message, date: new Date()});
  }

  onSendMessage(user: string, message: string) {
    if (message.trim().length === 0) {
      return;
    }
    this.sendMessage(user, message);
    this.assistant.getReply(message)
      .subscribe(reply => this.sendMessage('Assistant', reply));
    this.message = '';
  }
}
