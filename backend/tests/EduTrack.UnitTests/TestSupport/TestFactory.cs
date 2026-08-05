using AutoMapper;
using EduTrack.Application.Mappings;
using EduTrack.Persistence;
using EduTrack.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.UnitTests.TestSupport;

public static class TestFactory
{
    /// <summary>
    /// Creates a context against a fresh, uniquely-named in-memory database (pass no name),
    /// or a NEW context instance pointed at an EXISTING named database (pass the same name again).
    /// Tests should use the latter between steps that represent separate HTTP requests in production
    /// (each of which gets its own scoped DbContext) — reusing one context instance across such steps
    /// hides the same "double-tracked entity" bugs that a fresh-context-per-request setup would avoid.
    /// </summary>
    public static AppDbContext CreateContext(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    public static UnitOfWork CreateUnitOfWork(AppDbContext context) => new(context);

    public static IMapper CreateMapper()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        return config.CreateMapper();
    }
}
