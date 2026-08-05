namespace EduTrack.Application.Interfaces;

/// <summary>Indirection over the system clock so deadline/expiry logic is unit-testable.</summary>
public interface IDateTimeProvider
{
    DateTimeOffset UtcNow { get; }
}
