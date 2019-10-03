import { Injectable } from '@angular/core';
import { File as FileService } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
import * as uuid from 'uuid';
/**
 * Fornisce i valori default da passare all'API di DF.
 */
const apiDefaults = {
  projectId: 'notespese-nsxqke',
  languageCode: 'it-IT',
  samplingRate: 16000,
  encoding: 'AUDIO_ENCODING_LINEAR_16',
  filename: './recording.raw'
};

@Injectable({
  providedIn: 'root'
})
export class DialogflowService {
  constructor(
    private fileService: FileService,
    private httpClient: HttpClient
  ) { }

  async getIntentFromAudioFile(
    sessionId = uuid(),
    projectId = apiDefaults.projectId,
    filename = apiDefaults.filename,
    encoding = apiDefaults.encoding,
    samplingRate = apiDefaults.samplingRate,
    langCode = apiDefaults.languageCode
  ): Promise<any> {
    const blob = this.fileService.readAsDataURL(this.fileService.dataDirectory, filename);

    const req = {
      queryInput: {
        audioConfig: {
          audioEncoding: encoding,
          sampleRateHertz: samplingRate,
          languageCode: langCode
        },
        inputAudio: blob
      }
    };

    const baseUrl = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`;
    const resp = await this.httpClient.post(baseUrl, req)
      .toPromise();
    console.log(resp);
  }
}
