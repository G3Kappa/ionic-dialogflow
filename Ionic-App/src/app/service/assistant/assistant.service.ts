import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

export class DialogflowResponse {
  responseText: string;
}

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private apiBaseUrl = 'https://siglatechdialogflow.azurewebsites.net';

  constructor(
    private alertController: AlertController,
    private httpClient: HttpClient
    ) {}

  getReply(query: string): Observable<DialogflowResponse> {
    const options = { headers: new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
    };
    const post = this.httpClient.post<DialogflowResponse>(
      `${this.apiBaseUrl}/dialogflow/query/testSession/it_IT/`,
      JSON.stringify({ query }),
      options
    );
    return post.pipe();
  }
}
