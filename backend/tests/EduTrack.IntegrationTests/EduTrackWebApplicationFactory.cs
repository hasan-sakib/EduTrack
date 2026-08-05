using EduTrack.Application.Interfaces;
using EduTrack.Persistence;
using EduTrack.Persistence.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EduTrack.IntegrationTests;

/// <summary>
/// Boots the real API pipeline (auth, middleware, controllers) against an isolated in-memory
/// database instead of Postgres. Program.cs skips its own AddPersistence(...) call when the
/// environment is "Testing" (set below) and lets this factory register AppDbContext/IUnitOfWork
/// itself — removing/replacing the Npgsql DbContextOptions descriptor after the fact isn't enough,
/// since EF Core throws once both the Npgsql and InMemory providers appear in the same collection.
/// </summary>
public class EduTrackWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(_databaseName));
            services.AddScoped<IUnitOfWork, UnitOfWork>();
        });
    }
}
