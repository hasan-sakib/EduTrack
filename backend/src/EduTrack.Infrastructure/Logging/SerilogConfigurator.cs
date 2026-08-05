using Microsoft.Extensions.Configuration;
using Serilog;

namespace EduTrack.Infrastructure.Logging;

public static class SerilogConfigurator
{
    public static ILogger Configure(IConfiguration configuration)
    {
        return new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("logs/edutrack-.log", rollingInterval: RollingInterval.Day)
            .CreateLogger();
    }
}
