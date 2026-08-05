namespace EduTrack.Application.DTOs;

public record UserDto(Guid Id, string FullName, string Email, string Role, Guid? ClassId, string? ClassName, bool IsActive, DateTimeOffset CreatedAt);

public record CreateUserRequest(string FullName, string Email, string Password, string Role, Guid? ClassId);

public record UpdateUserRequest(string FullName, string Role, Guid? ClassId, bool IsActive, string? NewPassword);

public class UserQuery : Common.PagedQuery
{
    public string? Role { get; set; }
    public Guid? ClassId { get; set; }
}
