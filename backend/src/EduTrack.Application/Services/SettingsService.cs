using AutoMapper;
using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.Application.Services;

public class SettingsService : ISettingsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogger _auditLogger;

    public SettingsService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUser, IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
        _auditLogger = auditLogger;
    }

    public async Task<IReadOnlyList<ApplicationSettingDto>> GetAllAsync(CancellationToken ct = default)
    {
        var settings = await _unitOfWork.ApplicationSettings.Query().OrderBy(s => s.Key).ToListAsync(ct);
        return _mapper.Map<List<ApplicationSettingDto>>(settings);
    }

    public async Task<ApplicationSettingDto> UpdateAsync(string key, UpdateApplicationSettingRequest request, CancellationToken ct = default)
    {
        var setting = await _unitOfWork.ApplicationSettings.Query().FirstOrDefaultAsync(s => s.Key == key, ct);

        if (setting is null)
        {
            setting = new ApplicationSetting { Key = key, Value = request.Value, UpdatedByUserId = _currentUser.UserId };
            await _unitOfWork.ApplicationSettings.AddAsync(setting, ct);
        }
        else
        {
            var tracked = await _unitOfWork.ApplicationSettings.GetByIdAsync(setting.Id, ct);
            tracked!.Value = request.Value;
            tracked.UpdatedByUserId = _currentUser.UserId;
            _unitOfWork.ApplicationSettings.Update(tracked);
            setting = tracked;
        }

        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Update", nameof(ApplicationSetting), setting.Id, key, ct);

        return _mapper.Map<ApplicationSettingDto>(setting);
    }
}
