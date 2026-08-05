using EduTrack.Domain.Common;

namespace EduTrack.Domain.Entities;

public class ApplicationSetting : BaseEntity
{
    public string Key { get; set; } = default!;
    public string Value { get; set; } = default!;
    public string? Description { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public User? UpdatedByUser { get; set; }
}
