using EduTrack.Application.Interfaces;
using EduTrack.Application.Mappings;
using EduTrack.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EduTrack.Application.Extensions;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => { }, typeof(MappingProfile).Assembly);
        services.AddValidatorsFromAssembly(typeof(MappingProfile).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IClassService, ClassService>();
        services.AddScoped<ISubjectService, SubjectService>();
        services.AddScoped<ITeacherAssignmentService, TeacherAssignmentService>();
        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<ISubmissionService, SubmissionService>();
        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IAuditLogger, AuditLogger>();

        return services;
    }
}
