using EduTrack.Application.Interfaces;

namespace EduTrack.Infrastructure;

public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
