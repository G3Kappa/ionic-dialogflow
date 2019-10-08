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
        public JsonResult Fulfillment()
        {
            WebhookRequest request;
            using (var reader = new StreamReader(Request.Body))
            {
                request = jsonParser.Parse<WebhookRequest>(reader);
            }
            var response = new WebhookResponse();

            var @params = request.QueryResult.Parameters;
            response.FulfillmentText = request.QueryResult.Intent.DisplayName;
            switch (request.QueryResult.Intent.DisplayName)
            {
                case "Test01":
                    var evt = new EventInput()
                    {
                        Name = "TEST_EVENT",
                        LanguageCode = "it-IT",
                        Parameters = new Struct()
                    };

                    var (hasPlace, _) = ExtractField(@params, "place");
                    var (hasMoney, _) = ExtractField(@params, "money");
                    var (hasDate , _) = ExtractField(@params, "date" );

                    if (!hasPlace)
                    {
                        AddField(evt.Parameters, "place", Value.KindOneofCase.StringValue, "Genova");
                    }
                    response.FollowupEventInput = evt;
                    break;
                default:
                    break;
            }
            return Json(response);
        }
    }
}
