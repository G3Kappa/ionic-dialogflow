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

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WebhookController : Controller
    {
        private static readonly JsonParser jsonParser = new JsonParser(JsonParser.Settings.Default.WithIgnoreUnknownFields(true));

        private readonly ILogger<WebhookController> _logger;

        public WebhookController(ILogger<WebhookController> logger)
        {
            _logger = logger;
        }

        private static (bool, Google.Protobuf.WellKnownTypes.Value) ExtractField(Google.Protobuf.WellKnownTypes.Struct s, string key)
        {
            return s.Fields.TryGetValue(key, out var val) ? (true, val) : (false, null);
        }

        private static bool AddField<T>(Google.Protobuf.WellKnownTypes.Struct s, string key, T val)
        {
            return s.Fields.TryAdd(key, new Google.Protobuf.WellKnownTypes.Value()
            {
                StringValue = val.ToString()
            });
        }

        [HttpPost("fulfillment")]
        public async Task<JsonResult> Fulfillment()
        {
            WebhookRequest request;
            using (var reader = new StreamReader(Request.Body))
            {
                request = jsonParser.Parse<WebhookRequest>(reader);
            }
            var response = new WebhookResponse();

            var @params = request.QueryResult.Parameters;
            switch (request.QueryResult.Intent.DisplayName)
            {
                case "Fill-Nota-Spese":
                    var evt = new EventInput()
                    {
                        Name = "nota-spese",
                        LanguageCode = "it_IT",
                        Parameters = new Google.Protobuf.WellKnownTypes.Struct()
                    };

                    var (hasPlace, _) = ExtractField(@params, "place");
                    var (hasMoney, _) = ExtractField(@params, "money");
                    var (hasDate , _) = ExtractField(@params, "date" );

                    if (!hasPlace)
                    {
                        AddField(evt.Parameters, "place", "");
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
