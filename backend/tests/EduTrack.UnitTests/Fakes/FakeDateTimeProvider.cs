using EduTrack.Application.Interfaces;

namespace EduTrack.UnitTests.Fakes;

public class FakeDateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset UtcNow { get; set; } = DateTimeOffset.UtcNow;
}
