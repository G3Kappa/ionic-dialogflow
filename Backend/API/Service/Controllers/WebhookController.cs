using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Google.Cloud.Dialogflow.V2;
using Google.Apis.Auth.OAuth2;
using Grpc.Auth;
using System.IO;
using Google.Protobuf;
using System;
using Google.Protobuf.WellKnownTypes;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WebhookController : ApiController
    {
        private static readonly JsonParser jsonParser = new JsonParser(JsonParser.Settings.Default.WithIgnoreUnknownFields(true));

        private readonly ILogger<WebhookController> _logger;

        public WebhookController(ILogger<WebhookController> logger)
        {
            _logger = logger;
        }

        [HttpPost("fulfillment")]
        public ContentResult Fulfillment()
        {
            WebhookRequest request;
            using (var reader = new StreamReader(Request.Body))
            {
                request = jsonParser.Parse<WebhookRequest>(reader);
            }
            var response = new WebhookResponse()
            {
                Source = "Siglatech"
            };

            var @params = request.QueryResult.Parameters;
            switch (request.QueryResult.Intent.DisplayName)
            {
                case "Test01":
                    var evt = new EventInput()
                    {
                        Name = "WEBHOOK_INPUTS",
                        LanguageCode = "it",
                        Parameters = new Struct()
                    };

                    var (hasPlace, place) = ExtractField(@params, "place");
                    var (hasMoney, _) = ExtractField(@params, "money");
                    var (hasDate , _) = ExtractField(@params, "date" );


                    AddField(evt.Parameters, "place", Value.KindOneofCase.StringValue, "Milano");
                    response.FollowupEventInput = evt;
                    break;
                default:
                    break;
            }


            return Content(response.ToString(), "application/json");
        }
    }
}
