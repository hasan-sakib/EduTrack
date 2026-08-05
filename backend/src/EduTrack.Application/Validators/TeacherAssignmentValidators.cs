using EduTrack.Application.DTOs;
using FluentValidation;

namespace EduTrack.Application.Validators;

public class CreateTeacherAssignmentRequestValidator : AbstractValidator<CreateTeacherAssignmentRequest>
{
    public CreateTeacherAssignmentRequestValidator()
    {
        RuleFor(x => x.TeacherId).NotEmpty();
        RuleFor(x => x.ClassId).NotEmpty();
        RuleFor(x => x.SubjectId).NotEmpty();
    }
}
