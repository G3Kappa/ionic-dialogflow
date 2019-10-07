import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private apiBaseUrl = 'http://siglatechdialogflow.azurewebsites.net/dialogflow/it_IT/';

  constructor(
    private alertController: AlertController,
    private httpClient: HttpClient
    ) {}

  getReply(query: string): Observable<string> {
    const post = this.httpClient.post(this.apiBaseUrl, query);
    return post.pipe(map(obj => (obj as any).responseText.text[0]));
  }
}
