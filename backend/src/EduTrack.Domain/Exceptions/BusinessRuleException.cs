namespace EduTrack.Domain.Exceptions;

/// <summary>Thrown when an action would violate a domain business rule
/// (e.g. deadline passed, marks exceed max marks, duplicate submission).</summary>
public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message)
    {
    }
}
