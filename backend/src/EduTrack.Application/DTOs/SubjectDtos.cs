namespace EduTrack.Application.DTOs;

public record SubjectDto(Guid Id, string Name, string Code, bool IsActive, DateTimeOffset CreatedAt);

public record CreateSubjectRequest(string Name, string Code);

public record UpdateSubjectRequest(string Name, string Code, bool IsActive);
