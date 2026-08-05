using EduTrack.Application.DTOs;
using EduTrack.Application.Services;
using EduTrack.Domain.Entities;
using EduTrack.Domain.Enums;
using EduTrack.Domain.Exceptions;
using EduTrack.Persistence;
using EduTrack.UnitTests.Fakes;
using EduTrack.UnitTests.TestSupport;
using FluentAssertions;
using Xunit;

namespace EduTrack.UnitTests.Services;

public class SubmissionServiceTests
{
    private readonly string _dbName = Guid.NewGuid().ToString();
    private readonly AppDbContext _context;
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly FakeDateTimeProvider _dateTime = new();
    private readonly Class _class;
    private readonly User _teacher;
    private readonly User _student;
    private readonly Assignment _assignment;

    public SubmissionServiceTests()
    {
        _context = TestFactory.CreateContext(_dbName);

        var teacherRole = new Role { Name = RoleName.Teacher };
        var studentRole = new Role { Name = RoleName.Student };
        _class = new Class { Name = "Grade 10 - A" };
        var subject = new Subject { Name = "Mathematics", Code = "MATH101" };
        _teacher = new User { FullName = "Teacher", Email = "t@x.com", PasswordHash = "x", Role = teacherRole };
        _student = new User { FullName = "Student", Email = "s@x.com", PasswordHash = "x", Role = studentRole, Class = _class };
        var teacherAssignment = new TeacherAssignment { Teacher = _teacher, Class = _class, Subject = subject };
        _assignment = new Assignment
        {
            TeacherAssignment = teacherAssignment,
            Title = "HW1",
            Description = "desc",
            MaxMarks = 100,
            DueDate = DateTimeOffset.UtcNow.AddDays(1),
            Status = AssignmentStatus.Published,
            AllowResubmission = false
        };

        _context.AddRange(teacherRole, studentRole, _class, subject, _teacher, _student, teacherAssignment, _assignment);
        _context.SaveChanges();

        _dateTime.UtcNow = DateTimeOffset.UtcNow;
        _currentUser.Role = RoleName.Student;
        _currentUser.UserId = _student.Id;
        _currentUser.ClassId = _class.Id;
    }

    /// <summary>Fresh DbContext per call — mirrors the scoped-per-request DbContext lifetime in production,
    /// so successive calls in a test (e.g. submit then grade) don't share a stale change tracker.</summary>
    private SubmissionService CreateService() =>
        new(TestFactory.CreateUnitOfWork(TestFactory.CreateContext(_dbName)), TestFactory.CreateMapper(), _currentUser, _dateTime, new NoOpAuditLogger());

    [Fact]
    public async Task SubmitAsync_Throws_WhenDeadlineHasPassed()
    {
        _assignment.DueDate = _dateTime.UtcNow.AddMinutes(-1);
        await _context.SaveChangesAsync();

        var service = CreateService();
        var act = () => service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("my answer", null));

        await act.Should().ThrowAsync<BusinessRuleException>();
    }

    [Fact]
    public async Task SubmitAsync_Throws_WhenAssignmentIsDraft()
    {
        _assignment.Status = AssignmentStatus.Draft;
        await _context.SaveChangesAsync();

        var service = CreateService();
        var act = () => service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("my answer", null));

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task SubmitAsync_Throws_WhenStudentNotInAssignmentClass()
    {
        _currentUser.ClassId = Guid.NewGuid();

        var service = CreateService();
        var act = () => service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("my answer", null));

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task SubmitAsync_Succeeds_WhenPublishedAndBeforeDeadline()
    {
        var service = CreateService();
        var result = await service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("my answer", null));

        result.Content.Should().Be("my answer");
        result.Status.Should().Be(SubmissionStatus.Submitted);
    }

    [Fact]
    public async Task SubmitAsync_Throws_OnResubmit_WhenNotAllowed()
    {
        var service = CreateService();
        await service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("first try", null));

        var act = () => service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("second try", null));

        await act.Should().ThrowAsync<BusinessRuleException>();
    }

    [Fact]
    public async Task SubmitAsync_Succeeds_OnResubmit_WhenAllowed()
    {
        _assignment.AllowResubmission = true;
        await _context.SaveChangesAsync();

        var service = CreateService();
        await service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("first try", null));
        var result = await service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("second try", null));

        result.Content.Should().Be("second try");
    }

    [Fact]
    public async Task SubmitAsync_Throws_WhenAlreadyGraded()
    {
        _assignment.AllowResubmission = true;
        await _context.SaveChangesAsync();

        var service = CreateService();
        var submission = await service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("first try", null));

        _currentUser.Role = RoleName.Teacher;
        _currentUser.UserId = _teacher.Id;
        await service.GradeAsync(submission.Id, new GradeSubmissionRequest(90, "good", SubmissionStatus.Graded));

        _currentUser.Role = RoleName.Student;
        _currentUser.UserId = _student.Id;
        var act = () => service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("second try", null));

        await act.Should().ThrowAsync<BusinessRuleException>();
    }

    [Fact]
    public async Task GradeAsync_Throws_WhenMarksExceedMaxMarks()
    {
        var service = CreateService();
        var submission = await service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("answer", null));

        _currentUser.Role = RoleName.Teacher;
        _currentUser.UserId = _teacher.Id;
        var act = () => service.GradeAsync(submission.Id, new GradeSubmissionRequest(150, "too high", SubmissionStatus.Graded));

        await act.Should().ThrowAsync<BusinessRuleException>();
    }

    [Fact]
    public async Task GradeAsync_Throws_WhenCallerIsNotTheOwningTeacher()
    {
        var service = CreateService();
        var submission = await service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("answer", null));

        _currentUser.Role = RoleName.Teacher;
        _currentUser.UserId = Guid.NewGuid();
        var act = () => service.GradeAsync(submission.Id, new GradeSubmissionRequest(50, "ok", SubmissionStatus.Graded));

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task GradeAsync_Succeeds_WhenValid()
    {
        var service = CreateService();
        var submission = await service.SubmitAsync(_assignment.Id, new CreateSubmissionRequest("answer", null));

        _currentUser.Role = RoleName.Teacher;
        _currentUser.UserId = _teacher.Id;
        var result = await service.GradeAsync(submission.Id, new GradeSubmissionRequest(88, "well done", SubmissionStatus.Graded));

        result.Marks.Should().Be(88);
        result.Feedback.Should().Be("well done");
        result.Status.Should().Be(SubmissionStatus.Graded);
    }
}
