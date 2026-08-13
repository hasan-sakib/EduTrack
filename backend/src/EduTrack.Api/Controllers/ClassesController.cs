using EduTrack.Application.Common;
using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.Api.Controllers;

[ApiController]
[Route("api/v1/classes")]
[Authorize]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;
    private readonly IValidator<CreateClassRequest> _createValidator;
    private readonly IValidator<UpdateClassRequest> _updateValidator;

    public ClassesController(IClassService classService, IValidator<CreateClassRequest> createValidator, IValidator<UpdateClassRequest> updateValidator)
    {
        _classService = classService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query, CancellationToken ct) =>
        Ok(await _classService.GetAllAsync(query, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await _classService.GetByIdAsync(id, ct));

    [HttpGet("{id:guid}/students")]
    public async Task<IActionResult> GetStudents(Guid id, CancellationToken ct) =>
        Ok(await _classService.GetStudentsAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Create(CreateClassRequest request, CancellationToken ct)
    {
        await _createValidator.ValidateAndThrowAsync(request, ct);
        var result = await _classService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Update(Guid id, UpdateClassRequest request, CancellationToken ct)
    {
        await _updateValidator.ValidateAndThrowAsync(request, ct);
        return Ok(await _classService.UpdateAsync(id, request, ct));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _classService.DeleteAsync(id, ct);
        return NoContent();
    }
}
