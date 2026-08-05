using EduTrack.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace EduTrack.Infrastructure.Files;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadsPath;

    public LocalFileStorageService(IConfiguration configuration)
    {
        _uploadsPath = configuration["UploadsPath"] ?? "/app/uploads";

        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
        }
    }

    public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default)
    {
        var safeName = $"{Guid.NewGuid()}{Path.GetExtension(Path.GetFileName(fileName))}";
        var fullPath = Path.Combine(_uploadsPath, safeName);

        await using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await content.CopyToAsync(fileStream, ct);
        }

        return $"/uploads/{safeName}";
    }

    public void Delete(string relativePath)
    {
        var fullPath = GetPhysicalPath(relativePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    public string GetPhysicalPath(string relativePath) =>
        Path.Combine(_uploadsPath, Path.GetFileName(relativePath));
}
