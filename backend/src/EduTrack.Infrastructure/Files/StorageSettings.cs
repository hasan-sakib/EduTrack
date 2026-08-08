namespace EduTrack.Infrastructure.Files;

/// <summary>Binds to the "Storage" configuration section — RustFS/S3-compatible object storage.</summary>
public class StorageSettings
{
    public string ServiceUrl { get; set; } = default!;
    public string AccessKey { get; set; } = default!;
    public string SecretKey { get; set; } = default!;
    public string BucketName { get; set; } = "edutrack-uploads";
}
