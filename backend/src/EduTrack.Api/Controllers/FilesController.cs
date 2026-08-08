using EduTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace EduTrack.Api.Controllers;

[ApiController]
[Route("api/v1/files")]
[Authorize]
public class FilesController : ControllerBase
{
    private static readonly FileExtensionContentTypeProvider ContentTypeProvider = new();

    private readonly IFileStorageService _fileStorageService;
    private readonly ISettingsService _settingsService;

    public FilesController(IFileStorageService fileStorageService, ISettingsService settingsService)
    {
        _fileStorageService = fileStorageService;
        _settingsService = settingsService;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { message = "No file was provided." });
        }

        var settings = await _settingsService.GetAllAsync(ct);
        var maxSizeMb = int.TryParse(settings.FirstOrDefault(s => s.Key == "MaxUploadSizeMB")?.Value, out var mb) ? mb : 10;
        var allowedExtensions = (settings.FirstOrDefault(s => s.Key == "AllowedFileExtensions")?.Value
            ?? ".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.txt")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (file.Length > maxSizeMb * 1024 * 1024)
        {
            return BadRequest(new { message = $"File exceeds the maximum allowed size of {maxSizeMb} MB." });
        }

        var extension = Path.GetExtension(file.FileName);
        if (!allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = $"File type '{extension}' is not allowed." });
        }

        await using var stream = file.OpenReadStream();
        var url = await _fileStorageService.SaveAsync(stream, file.FileName, ct);
        return Ok(new { url });
    }

    [HttpGet("{fileName}")]
    public async Task<IActionResult> Download(string fileName, CancellationToken ct)
    {
        var stream = await _fileStorageService.OpenReadAsync(fileName, ct);
        if (stream is null)
        {
            return NotFound();
        }

        if (!ContentTypeProvider.TryGetContentType(fileName, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return File(stream, contentType, fileName);
    }
}
