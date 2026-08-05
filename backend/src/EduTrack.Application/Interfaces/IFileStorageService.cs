namespace EduTrack.Application.Interfaces;

public interface IFileStorageService
{
    /// <summary>Persists the stream and returns a relative path/URL that can be stored on the entity.</summary>
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default);

    void Delete(string relativePath);

    /// <summary>Resolves a relative path returned by SaveAsync back to an absolute path on disk, for serving downloads.</summary>
    string GetPhysicalPath(string relativePath);
}
