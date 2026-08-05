using AutoMapper;
using AutoMapper.QueryableExtensions;
using EduTrack.Application.Common;
using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;
using EduTrack.Domain.Enums;
using EduTrack.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAuditLogger _auditLogger;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper, IPasswordHasher passwordHasher, IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _auditLogger = auditLogger;
    }

    public async Task<PagedResult<UserDto>> GetAllAsync(UserQuery query, CancellationToken ct = default)
    {
        var q = _unitOfWork.Users.Query();

        if (!string.IsNullOrWhiteSpace(query.Role))
        {
            q = q.Where(u => u.Role.Name == query.Role);
        }

        if (query.ClassId is not null)
        {
            q = q.Where(u => u.ClassId == query.ClassId);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(u => u.FullName.ToLower().Contains(term) || u.Email.ToLower().Contains(term));
        }

        q = query.SortBy?.ToLower() switch
        {
            "email" => query.SortDir == "desc" ? q.OrderByDescending(u => u.Email) : q.OrderBy(u => u.Email),
            "fullname" => query.SortDir == "desc" ? q.OrderByDescending(u => u.FullName) : q.OrderBy(u => u.FullName),
            _ => query.SortDir == "asc" ? q.OrderBy(u => u.CreatedAt) : q.OrderByDescending(u => u.CreatedAt)
        };

        return await q.ProjectTo<UserDto>(_mapper.ConfigurationProvider).ToPagedResultAsync(query.Page, query.PageSize, ct);
    }

    public async Task<UserDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.Query().Include(u => u.Role).Include(u => u.Class)
            .FirstOrDefaultAsync(u => u.Id == id, ct) ?? throw new NotFoundException(nameof(User), id);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        var emailExists = await _unitOfWork.Users.Query().AnyAsync(u => u.Email == request.Email, ct);
        if (emailExists)
        {
            throw new BusinessRuleException($"A user with email '{request.Email}' already exists.");
        }

        var role = await _unitOfWork.Roles.Query().FirstOrDefaultAsync(r => r.Name == request.Role, ct)
            ?? throw new NotFoundException(nameof(Role), request.Role);

        Class? studentClass = null;
        if (request.ClassId is not null)
        {
            studentClass = await _unitOfWork.Classes.GetByIdAsync(request.ClassId.Value, ct)
                ?? throw new NotFoundException(nameof(Class), request.ClassId.Value);
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            RoleId = role.Id,
            ClassId = studentClass?.Id,
            IsActive = true
        };

        await _unitOfWork.Users.AddAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Create", nameof(User), user.Id, ct: ct);

        return new UserDto(user.Id, user.FullName, user.Email, role.Name, studentClass?.Id, studentClass?.Name, user.IsActive, user.CreatedAt);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(User), id);

        var role = await _unitOfWork.Roles.Query().FirstOrDefaultAsync(r => r.Name == request.Role, ct)
            ?? throw new NotFoundException(nameof(Role), request.Role);

        Class? studentClass = null;
        if (request.ClassId is not null)
        {
            studentClass = await _unitOfWork.Classes.GetByIdAsync(request.ClassId.Value, ct)
                ?? throw new NotFoundException(nameof(Class), request.ClassId.Value);
        }

        user.FullName = request.FullName;
        user.RoleId = role.Id;
        user.ClassId = studentClass?.Id;
        user.IsActive = request.IsActive;
        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        }

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Update", nameof(User), user.Id, ct: ct);

        return new UserDto(user.Id, user.FullName, user.Email, role.Name, studentClass?.Id, studentClass?.Name, user.IsActive, user.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(User), id);

        user.IsActive = false;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Delete", nameof(User), user.Id, ct: ct);
    }
}
