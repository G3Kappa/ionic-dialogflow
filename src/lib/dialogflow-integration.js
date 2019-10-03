const df = require('dialogflow');
const uuid = require('uuid');

const apiData = {
    projectName: 'notespese-nsxqke',
    languageCode: 'it-IT'
};

async function streamingDetectIntent(
    projectId = apiData.projectName,
    sessionId,
    filename = './resources/audio.raw',
    encoding = 'AUDIO_ENCODING_LINEAR_16',
    sampleRateHertz = '16000',
    languageCode = apiData.languageCode
  ) {
    // Instantiates a session client
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  
    const initialStreamRequest = {
      session: sessionPath,
      queryInput: {
        audioConfig: {
          audioEncoding: encoding,
          sampleRateHertz: sampleRateHertz,
          languageCode: languageCode,
        },
        singleUtterance: true,
      },
    };
  
    // Create a stream for the streaming request.
    const detectStream = sessionClient
      .streamingDetectIntent()
      .on('error', console.error)
      .on('data', data => {
        if (data.recognitionResult) {
          console.log(
            `Intermediate transcript: ${data.recognitionResult.transcript}`
          );
        } else {
          console.log(`Detected intent:`);
          logQueryResult(sessionClient, data.queryResult);
        }
      });
  
    // Write the initial stream request to config for audio input.
    detectStream.write(initialStreamRequest);
  
    // Stream an audio file from disk to the Conversation API, e.g.
    // "./resources/audio.raw"
    await pump(
      fs.createReadStream(filename),
      // Format the audio stream into the request format.
      new Transform({
        objectMode: true,
        transform: (obj, _, next) => {
          next(null, {inputAudio: obj});
        },
      }),
      detectStream
    );
    // [END dialogflow_detect_intent_streaming]
  }