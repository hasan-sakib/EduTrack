using Amazon.S3;
using Amazon.S3.Model;
using EduTrack.Application.Interfaces;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;

namespace EduTrack.Infrastructure.Files;

/// <summary>
/// Stores files in RustFS, an S3-API-compatible object store, via the AWS S3 SDK pointed at
/// RustFS's endpoint. Path-style addressing is required since RustFS (like MinIO) isn't
/// resolvable via AWS's virtual-hosted-style bucket subdomains.
/// </summary>
public class RustFsFileStorageService : IFileStorageService
{
    private static readonly FileExtensionContentTypeProvider ContentTypeProvider = new();

    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;
    private readonly SemaphoreSlim _bucketCheckLock = new(1, 1);
    private bool _bucketEnsured;

    public RustFsFileStorageService(IOptions<StorageSettings> options)
    {
        var settings = options.Value;
        _bucketName = settings.BucketName;

        _s3 = new AmazonS3Client(
            settings.AccessKey,
            settings.SecretKey,
            new AmazonS3Config
            {
                ServiceURL = settings.ServiceUrl,
                ForcePathStyle = true,
            });
    }

    public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default)
    {
        await EnsureBucketExistsAsync(ct);

        var key = $"{Guid.NewGuid()}{Path.GetExtension(Path.GetFileName(fileName))}";
        if (!ContentTypeProvider.TryGetContentType(fileName, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            AutoCloseStream = false,
        }, ct);

        return key;
    }

    public async Task DeleteAsync(string relativePath, CancellationToken ct = default)
    {
        await _s3.DeleteObjectAsync(_bucketName, Path.GetFileName(relativePath), ct);
    }

    public async Task<Stream?> OpenReadAsync(string relativePath, CancellationToken ct = default)
    {
        try
        {
            var response = await _s3.GetObjectAsync(_bucketName, Path.GetFileName(relativePath), ct);
            return response.ResponseStream;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    private async Task EnsureBucketExistsAsync(CancellationToken ct)
    {
        if (_bucketEnsured) return;

        await _bucketCheckLock.WaitAsync(ct);
        try
        {
            if (_bucketEnsured) return;

            var exists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(_s3, _bucketName);
            if (!exists)
            {
                await _s3.PutBucketAsync(new PutBucketRequest { BucketName = _bucketName }, ct);
            }

            _bucketEnsured = true;
        }
        finally
        {
            _bucketCheckLock.Release();
        }
    }
}
