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

public class AssignmentServiceTests
{
    private readonly string _dbName = Guid.NewGuid().ToString();
    private readonly AppDbContext _context;
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly Class _classA;
    private readonly Class _classB;
    private readonly User _teacher;
    private readonly User _otherTeacher;
    private readonly TeacherAssignment _teacherAssignment;
    private readonly Assignment _draftAssignment;
    private readonly Assignment _publishedAssignment;

    public AssignmentServiceTests()
    {
        _context = TestFactory.CreateContext(_dbName);

        var teacherRole = new Role { Name = RoleName.Teacher };
        var studentRole = new Role { Name = RoleName.Student };
        _classA = new Class { Name = "Grade 10 - A" };
        _classB = new Class { Name = "Grade 10 - B" };
        var subject = new Subject { Name = "Mathematics", Code = "MATH101" };
        _teacher = new User { FullName = "Teacher", Email = "t@x.com", PasswordHash = "x", Role = teacherRole };
        _otherTeacher = new User { FullName = "Other Teacher", Email = "t2@x.com", PasswordHash = "x", Role = teacherRole };
        _teacherAssignment = new TeacherAssignment { Teacher = _teacher, Class = _classA, Subject = subject };

        _draftAssignment = new Assignment
        {
            TeacherAssignment = _teacherAssignment, Title = "Draft HW", Description = "d", MaxMarks = 100,
            DueDate = DateTimeOffset.UtcNow.AddDays(1), Status = AssignmentStatus.Draft
        };
        _publishedAssignment = new Assignment
        {
            TeacherAssignment = _teacherAssignment, Title = "Published HW", Description = "d", MaxMarks = 50,
            DueDate = DateTimeOffset.UtcNow.AddDays(1), Status = AssignmentStatus.Published
        };

        _context.AddRange(teacherRole, studentRole, _classA, _classB, subject, _teacher, _otherTeacher, _teacherAssignment, _draftAssignment, _publishedAssignment);
        _context.SaveChanges();
    }

    private AssignmentService CreateService() =>
        new(TestFactory.CreateUnitOfWork(TestFactory.CreateContext(_dbName)), TestFactory.CreateMapper(), _currentUser, new NoOpAuditLogger());

    [Fact]
    public async Task GetAllAsync_Student_OnlySeesPublishedAssignmentsForOwnClass()
    {
        _currentUser.Role = RoleName.Student;
        _currentUser.ClassId = _classA.Id;

        var result = await (CreateService()).GetAllAsync(new AssignmentQuery());

        result.Items.Should().ContainSingle(a => a.Id == _publishedAssignment.Id);
        result.Items.Should().NotContain(a => a.Id == _draftAssignment.Id);
    }

    [Fact]
    public async Task GetAllAsync_Student_SeesNothing_WhenInADifferentClass()
    {
        _currentUser.Role = RoleName.Student;
        _currentUser.ClassId = _classB.Id;

        var result = await CreateService().GetAllAsync(new AssignmentQuery());

        result.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_Teacher_OnlySeesOwnAssignments()
    {
        _currentUser.Role = RoleName.Teacher;
        _currentUser.UserId = _otherTeacher.Id;

        var result = await CreateService().GetAllAsync(new AssignmentQuery());

        result.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_Admin_SeesEverything()
    {
        _currentUser.Role = RoleName.Admin;

        var result = await CreateService().GetAllAsync(new AssignmentQuery());

        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task CreateAsync_Throws_WhenTeacherDoesNotOwnTheTeacherAssignment()
    {
        _currentUser.Role = RoleName.Teacher;
        _currentUser.UserId = _otherTeacher.Id;

        var service = CreateService();
        var act = () => service.CreateAsync(new CreateAssignmentRequest(
            _teacherAssignment.Id, "New HW", "desc", 100, DateTimeOffset.UtcNow.AddDays(3), false));

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task CreateAsync_Succeeds_AsDraft_WhenOwnedByCaller()
    {
        _currentUser.Role = RoleName.Teacher;
        _currentUser.UserId = _teacher.Id;

        var service = CreateService();
        var result = await service.CreateAsync(new CreateAssignmentRequest(
            _teacherAssignment.Id, "New HW", "desc", 100, DateTimeOffset.UtcNow.AddDays(3), false));

        result.Status.Should().Be(AssignmentStatus.Draft);
    }

    [Fact]
    public async Task DeleteAsync_Throws_WhenSubmissionsAlreadyExist()
    {
        var student = new User { FullName = "S", Email = "s@x.com", PasswordHash = "x", RoleId = Guid.NewGuid(), Class = _classA };
        _context.Submissions.Add(new Submission
        {
            Assignment = _publishedAssignment, Student = student, SubmittedAt = DateTimeOffset.UtcNow
        });
        await _context.SaveChangesAsync();

        _currentUser.Role = RoleName.Teacher;
        _currentUser.UserId = _teacher.Id;

        var act = () => CreateService().DeleteAsync(_publishedAssignment.Id);

        await act.Should().ThrowAsync<BusinessRuleException>();
    }
}
