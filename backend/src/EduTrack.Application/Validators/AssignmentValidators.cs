using EduTrack.Application.DTOs;
using FluentValidation;

namespace EduTrack.Application.Validators;

public class CreateAssignmentRequestValidator : AbstractValidator<CreateAssignmentRequest>
{
    public CreateAssignmentRequestValidator()
    {
        RuleFor(x => x.TeacherAssignmentId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.MaxMarks).GreaterThan(0);
        RuleFor(x => x.DueDate).GreaterThan(DateTimeOffset.UtcNow).WithMessage("Due date must be in the future.");
    }
}

public class UpdateAssignmentRequestValidator : AbstractValidator<UpdateAssignmentRequest>
{
    public UpdateAssignmentRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.MaxMarks).GreaterThan(0);
        RuleFor(x => x.DueDate).NotEmpty();
    }
}

public class UpdateAssignmentStatusRequestValidator : AbstractValidator<UpdateAssignmentStatusRequest>
{
    public UpdateAssignmentStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}
