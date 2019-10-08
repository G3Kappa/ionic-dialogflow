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

        private static bool AddField<T>(Google.Protobuf.WellKnownTypes.Struct s, string key, T val)
        {
            return s.Fields.TryAdd(key, new Google.Protobuf.WellKnownTypes.Value()
            {
                StringValue = val.ToString()
            });
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
                },
                Event = new EventInput()
                {
                    
                    LanguageCode = langCode,
                    Name = "_backendInputs",
                    Parameters = new Google.Protobuf.WellKnownTypes.Struct()
                }
            };

            if(req.DeviceLocation.HasValue)
            {
                var p = new Google.Protobuf.WellKnownTypes.Struct();
                AddField(p, "latitude", req.DeviceLocation.Value.Latitude);
                AddField(p, "longitude", req.DeviceLocation.Value.Longitude);
                AddField(p, "altitude", req.DeviceLocation.Value.Altitude);
                AddField(query.Event.Parameters, "place", p);
            }

            var dialogFlow = client.DetectIntent(
                new SessionName(agent, sessionId),
                query
            );

            channel.ShutdownAsync();

            return new ActionResult<Models.DataflowResponse>(new Models.DataflowResponse()
            {
                ResponseText = dialogFlow.QueryResult.FulfillmentMessages.First().Text.Text_.First()
            });
        }
    }
}
