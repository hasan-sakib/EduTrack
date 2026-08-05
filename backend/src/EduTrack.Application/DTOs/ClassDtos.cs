namespace EduTrack.Application.DTOs;

public record ClassDto(Guid Id, string Name, string? Description, bool IsActive, int StudentCount, DateTimeOffset CreatedAt);

public record CreateClassRequest(string Name, string? Description);

public record UpdateClassRequest(string Name, string? Description, bool IsActive);
