using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace DMR_API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
            //.ConfigureWebHost(config =>
            //{
            //   config.UseUrls("http://*:5002/");
            //})
            //.UseWindowsService();
    }
}
