using AutoMapper;
using EduTrack.Application.DTOs;
using EduTrack.Domain.Entities;

namespace EduTrack.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForCtorParam(nameof(UserDto.Role), o => o.MapFrom(s => s.Role.Name))
            .ForCtorParam(nameof(UserDto.ClassName), o => o.MapFrom(s => s.Class != null
                ? (s.Class.Section == null || s.Class.Section == "" ? s.Class.Name : s.Class.Name + " - " + s.Class.Section)
                : null));

        CreateMap<User, CurrentUserDto>()
            .ForCtorParam(nameof(CurrentUserDto.Role), o => o.MapFrom(s => s.Role.Name));

        CreateMap<Class, ClassDto>()
            .ForCtorParam(nameof(ClassDto.StudentCount), o => o.MapFrom(s => s.Students.Count));

        CreateMap<Subject, SubjectDto>();

        CreateMap<TeacherAssignment, TeacherAssignmentDto>()
            .ForCtorParam(nameof(TeacherAssignmentDto.TeacherName), o => o.MapFrom(s => s.Teacher.FullName))
            .ForCtorParam(nameof(TeacherAssignmentDto.ClassName), o => o.MapFrom(s =>
                s.Class.Section == null || s.Class.Section == "" ? s.Class.Name : s.Class.Name + " - " + s.Class.Section))
            .ForCtorParam(nameof(TeacherAssignmentDto.SubjectName), o => o.MapFrom(s => s.Subject.Name));

        CreateMap<AssignmentAttachment, AssignmentAttachmentDto>();

        CreateMap<Assignment, AssignmentDto>()
            .ForCtorParam(nameof(AssignmentDto.ClassId), o => o.MapFrom(s => s.TeacherAssignment.ClassId))
            .ForCtorParam(nameof(AssignmentDto.ClassName), o => o.MapFrom(s =>
                s.TeacherAssignment.Class.Section == null || s.TeacherAssignment.Class.Section == ""
                    ? s.TeacherAssignment.Class.Name
                    : s.TeacherAssignment.Class.Name + " - " + s.TeacherAssignment.Class.Section))
            .ForCtorParam(nameof(AssignmentDto.SubjectId), o => o.MapFrom(s => s.TeacherAssignment.SubjectId))
            .ForCtorParam(nameof(AssignmentDto.SubjectName), o => o.MapFrom(s => s.TeacherAssignment.Subject.Name))
            .ForCtorParam(nameof(AssignmentDto.TeacherId), o => o.MapFrom(s => s.TeacherAssignment.TeacherId))
            .ForCtorParam(nameof(AssignmentDto.TeacherName), o => o.MapFrom(s => s.TeacherAssignment.Teacher.FullName));

        CreateMap<Submission, SubmissionDto>()
            .ForCtorParam(nameof(SubmissionDto.AssignmentTitle), o => o.MapFrom(s => s.Assignment.Title))
            .ForCtorParam(nameof(SubmissionDto.MaxMarks), o => o.MapFrom(s => s.Assignment.MaxMarks))
            .ForCtorParam(nameof(SubmissionDto.StudentName), o => o.MapFrom(s => s.Student.FullName))
            .ForCtorParam(nameof(SubmissionDto.GradedByName), o => o.MapFrom(s => s.GradedByUser != null ? s.GradedByUser.FullName : null));

        CreateMap<ApplicationSetting, ApplicationSettingDto>();

        CreateMap<AuditLog, AuditLogDto>()
            .ForCtorParam(nameof(AuditLogDto.UserName), o => o.MapFrom(s => s.User != null ? s.User.FullName : null));
    }
}
