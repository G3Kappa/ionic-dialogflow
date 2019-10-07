import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AssistantService {
  constructor(private alertController: AlertController) {}

  getReply(query: string): Observable<string> {
    return of(`You said: ${query}`);
  }
}
