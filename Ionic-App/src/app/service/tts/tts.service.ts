import { Injectable } from '@angular/core';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { from, Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  constructor(private textToSpeech: TextToSpeech) {
  }

  speak(msg: string): void {
    this.textToSpeech.speak({
      text: msg,
      locale: 'it-IT'
    });
    // TODO Errors
  }
}
