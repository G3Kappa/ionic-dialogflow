namespace API.Models
{
    public readonly struct GeoCoordinates
    {
        public readonly double Latitude;
        public readonly double Longitude;
        public readonly double Altitude;

        public GeoCoordinates(double lat, double lon, double alt)
        {
            Latitude = lat;
            Longitude = lon;
            Altitude = alt;
        }
    }

    public class DialogflowRequest
    {
        public string Query { get; set; }
        public GeoCoordinates? DeviceLocation { get; set; }
    }
}
