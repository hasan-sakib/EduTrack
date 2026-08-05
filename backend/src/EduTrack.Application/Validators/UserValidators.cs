using EduTrack.Application.DTOs;
using EduTrack.Domain.Enums;
using FluentValidation;

namespace EduTrack.Application.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Role).NotEmpty().Must(BeAValidRole).WithMessage("Role must be Admin, Teacher, or Student.");
        RuleFor(x => x.ClassId).NotNull().When(x => x.Role == RoleName.Student)
            .WithMessage("A Class must be selected for Student users.");
    }

    private static bool BeAValidRole(string role) =>
        role is RoleName.Admin or RoleName.Teacher or RoleName.Student;
}

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Role).NotEmpty().Must(BeAValidRole).WithMessage("Role must be Admin, Teacher, or Student.");
        RuleFor(x => x.ClassId).NotNull().When(x => x.Role == RoleName.Student)
            .WithMessage("A Class must be selected for Student users.");
        RuleFor(x => x.NewPassword).MinimumLength(8).When(x => !string.IsNullOrEmpty(x.NewPassword));
    }

    private static bool BeAValidRole(string role) =>
        role is RoleName.Admin or RoleName.Teacher or RoleName.Student;
}
