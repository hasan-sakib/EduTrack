using EduTrack.Application.Interfaces;
using EduTrack.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EduTrack.Persistence.Extensions;

public static class PersistenceServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                // Retries transient connection failures — Postgres and the API start concurrently in
                // Docker Compose, so the API may otherwise try to connect before Postgres is ready.
                npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(5)));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}
