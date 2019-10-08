using Google.Protobuf.WellKnownTypes;
using Microsoft.AspNetCore.Mvc;
using System;

namespace API.Controllers
{
    public abstract class ApiController : Controller
    {
        protected static (bool, Value) ExtractField(Struct s, string key)
        {
            return s.Fields.TryGetValue(key, out var val) ? (true, val) : (false, null);
        }

        protected static void AddField<T>(Struct s, string key, Value.KindOneofCase kind, T val)
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
                    s.Fields.Add(key, new Value() { NumberValue = Convert.ToDouble(val) });
                    break;
                default:
                    s.Fields.Add(key, new Value() { StringValue = val.ToString() });
                    break;
            }
        }

        protected static void AddDefaultFields(Struct s, Models.DialogflowRequest req)
        {
            AddField(s, "place", Value.KindOneofCase.StringValue, "Genova");
        }
    }
}
