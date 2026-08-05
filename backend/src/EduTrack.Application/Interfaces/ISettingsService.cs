using EduTrack.Application.DTOs;

namespace EduTrack.Application.Interfaces;

public interface ISettingsService
{
    Task<IReadOnlyList<ApplicationSettingDto>> GetAllAsync(CancellationToken ct = default);
    Task<ApplicationSettingDto> UpdateAsync(string key, UpdateApplicationSettingRequest request, CancellationToken ct = default);
}
