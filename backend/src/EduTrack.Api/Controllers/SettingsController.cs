using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.Api.Controllers;

[ApiController]
[Route("api/v1/settings")]
[Authorize(Roles = RoleName.Admin)]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;
    private readonly IValidator<UpdateApplicationSettingRequest> _updateValidator;

    public SettingsController(ISettingsService settingsService, IValidator<UpdateApplicationSettingRequest> updateValidator)
    {
        _settingsService = settingsService;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) => Ok(await _settingsService.GetAllAsync(ct));

    [HttpPut("{key}")]
    public async Task<IActionResult> Update(string key, UpdateApplicationSettingRequest request, CancellationToken ct)
    {
        await _updateValidator.ValidateAndThrowAsync(request, ct);
        return Ok(await _settingsService.UpdateAsync(key, request, ct));
    }
}
