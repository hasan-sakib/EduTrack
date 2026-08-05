namespace EduTrack.Domain.Exceptions;

/// <summary>Thrown for invalid credentials or invalid/expired/revoked refresh tokens.</summary>
public class AuthenticationException : Exception
{
    public AuthenticationException(string message) : base(message)
    {
    }
}
