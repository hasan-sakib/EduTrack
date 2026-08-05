namespace EduTrack.Domain.Exceptions;

/// <summary>Thrown when a user is authenticated but not authorized for the requested resource/action.</summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message)
    {
    }
}
