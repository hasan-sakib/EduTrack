namespace EduTrack.Application.DTOs;

public record ClassDto(Guid Id, string Name, string? Section, string? Description, bool IsActive, int StudentCount, DateTimeOffset CreatedAt);

public record CreateClassRequest(string Name, string? Section, string? Description);

public record UpdateClassRequest(string Name, string? Section, string? Description, bool IsActive);

public record StudentSummaryDto(Guid Id, string Username);
