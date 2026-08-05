using EduTrack.Application.Common;
using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.Api.Controllers;

[ApiController]
[Route("api/v1/subjects")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;
    private readonly IValidator<CreateSubjectRequest> _createValidator;
    private readonly IValidator<UpdateSubjectRequest> _updateValidator;

    public SubjectsController(ISubjectService subjectService, IValidator<CreateSubjectRequest> createValidator, IValidator<UpdateSubjectRequest> updateValidator)
    {
        _subjectService = subjectService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query, CancellationToken ct) =>
        Ok(await _subjectService.GetAllAsync(query, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await _subjectService.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Create(CreateSubjectRequest request, CancellationToken ct)
    {
        await _createValidator.ValidateAndThrowAsync(request, ct);
        var result = await _subjectService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Update(Guid id, UpdateSubjectRequest request, CancellationToken ct)
    {
        await _updateValidator.ValidateAndThrowAsync(request, ct);
        return Ok(await _subjectService.UpdateAsync(id, request, ct));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _subjectService.DeleteAsync(id, ct);
        return NoContent();
    }
}
