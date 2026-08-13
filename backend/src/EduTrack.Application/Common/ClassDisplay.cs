namespace EduTrack.Application.Common;

public static class ClassDisplay
{
    public static string Compose(string name, string? section) =>
        string.IsNullOrWhiteSpace(section) ? name : $"{name} - {section}";
}
