using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Google.Cloud.Dialogflow.V2;
using Google.Apis.Auth.OAuth2;
using Grpc.Auth;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DialogflowController : ControllerBase
    {
        private readonly ILogger<DialogflowController> _logger;

        public DialogflowController(ILogger<DialogflowController> logger)
        {
            _logger = logger;
        }

        [HttpPost("query/{sessionId}/{langCode}")]
        public ActionResult<Models.DataflowResponse> Query(string sessionId, string langCode, [FromBody] Models.DialogflowRequest req)
        {
            const string agent = "notespese-nsxqke";
            const string credFile = "Credentials/google.json";

            if (!System.IO.File.Exists(credFile))
            {
                return BadRequest("No Google credentials provided.");
            }

            var credJson = System.IO.File.ReadAllText(credFile);
            var creds = GoogleCredential.FromJson(credJson);
            var channel = new Grpc.Core.Channel(SessionsClient.DefaultEndpoint.Host,
                          creds.ToChannelCredentials());
            var client = SessionsClient.Create(channel);

            var query = new QueryInput()
            {
                Text = new TextInput()
                {
                    Text = req.Query,
                    LanguageCode = langCode
                }
            };

            var dialogFlow = client.DetectIntent(
                new SessionName(agent, sessionId),
                query
            );

            channel.ShutdownAsync();

            return new ActionResult<Models.DataflowResponse>(new Models.DataflowResponse()
            {
                ResponseText = dialogFlow.QueryResult.FulfillmentMessages.First().Text.ToString()
            });
        }
    }
}
