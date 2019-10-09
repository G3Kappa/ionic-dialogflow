import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export class DialogflowResponse {
  responseText: string;
}

/// Any parameter specified here is fully optional.
/// Dialogflow will personally ask the user to fill in any missing parameters.
export interface DialogflowQueryOptions {
  /// The city that the user is sending this request from (ex. Genoa).
  userGeoCity?: string;
}

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private apiBaseUrl = 'https://siglatechdialogflow.azurewebsites.net';

  constructor(private httpClient: HttpClient) {}

  getReply(query: string, queryOptions?: DialogflowQueryOptions): Observable<DialogflowResponse> {
    const postOptions = { headers: new HttpHeaders().set('Content-Type', 'application/json').set('Accept', 'application/json') };
    const endpoint = `${this.apiBaseUrl}/dialogflow/query/testSession/it_IT/`;

    const opts: any = {};
    opts.query = query;
    if (queryOptions) {
      opts.userGeoCity = queryOptions.userGeoCity;
    }

    const post = this.httpClient.post<DialogflowResponse>(endpoint, JSON.stringify(opts), postOptions);
    return post.pipe();
  }
}
