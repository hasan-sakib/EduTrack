using EduTrack.Application.DTOs;
using FluentValidation;

namespace EduTrack.Application.Validators;

public class UpdateApplicationSettingRequestValidator : AbstractValidator<UpdateApplicationSettingRequest>
{
    public UpdateApplicationSettingRequestValidator()
    {
        RuleFor(x => x.Value).NotNull();
    }
}
