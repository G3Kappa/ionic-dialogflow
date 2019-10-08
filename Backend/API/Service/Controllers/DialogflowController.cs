using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Google.Cloud.Dialogflow.V2;
using Google.Apis.Auth.OAuth2;
using Grpc.Auth;
using Google.Protobuf.WellKnownTypes;
using System;

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

        private static void AddField<T>(Struct s, string key, Value.KindOneofCase kind, T val)
        {
            switch (kind)
            {
                case Value.KindOneofCase.StringValue when (val is string str):
                    s.Fields.Add(key, new Value() { StringValue = str });
                    break;
                case Value.KindOneofCase.StringValue:
                    s.Fields.Add(key, new Value() { StringValue = val.ToString() });
                    break;
                case Value.KindOneofCase.NullValue:
                    s.Fields.Add(key, new Value() { NullValue = NullValue.NullValue });
                    break;
                case Value.KindOneofCase.BoolValue when (val is bool b):
                    s.Fields.Add(key, new Value() { BoolValue = b });
                    break;
                case Value.KindOneofCase.StructValue when (val is Struct t):
                    s.Fields.Add(key, new Value() { StructValue = t });
                    break;
                case Value.KindOneofCase.NumberValue when (val is byte || val is short || val is int || val is float || val is double || val is decimal):
                    s.Fields.Add(key, new Value() { NumberValue =  Convert.ToDouble(val) });
                    break;
                default:
                    s.Fields.Add(key, new Value() { StringValue = val.ToString() });
                    break;
            }
        }

        private static void AddDefaultFields(Struct s, Models.DialogflowRequest req)
        {
            AddField(s, "place", Value.KindOneofCase.StructValue, "Genova");
        }

        [HttpPost("query/{sessionId}/{langCode}")]
        public ActionResult<Models.DialogflowResponse> Query(string sessionId, string langCode, [FromBody] Models.DialogflowRequest req)
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
                    Name = "BACKEND_INPUTS",
                    Parameters = new Struct()
                }
            };

            AddDefaultFields(query.Event.Parameters, req);

            var dialogFlow = client.DetectIntent(
                new SessionName(agent, sessionId),
                query
            );

            channel.ShutdownAsync();

            return new ActionResult<Models.DialogflowResponse>(new Models.DialogflowResponse()
            {
                ResponseText = dialogFlow.QueryResult.FulfillmentMessages.First().Text.Text_.First()
            });
        }
    }
}
