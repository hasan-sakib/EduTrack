namespace EduTrack.Application.DTOs;

public record ApplicationSettingDto(Guid Id, string Key, string Value, string? Description, DateTimeOffset UpdatedAt);

public record UpdateApplicationSettingRequest(string Value);

public record AuditLogDto(Guid Id, Guid? UserId, string? UserName, string Action, string EntityName, Guid? EntityId, string? Details, string? IpAddress, DateTimeOffset CreatedAt);

public class AuditLogQuery : Common.PagedQuery
{
    public string? EntityName { get; set; }
}
