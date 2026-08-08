namespace EduTrack.Application.Interfaces;

public interface IFileStorageService
{
    /// <summary>Persists the stream and returns a relative path/key that can be stored on the entity.</summary>
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default);

    Task DeleteAsync(string relativePath, CancellationToken ct = default);

    /// <summary>Opens a readable stream for a relative path/key returned by SaveAsync, or null if it doesn't exist.</summary>
    Task<Stream?> OpenReadAsync(string relativePath, CancellationToken ct = default);
}
