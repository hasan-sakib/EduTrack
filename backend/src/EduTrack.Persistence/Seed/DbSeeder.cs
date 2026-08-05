using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;
using EduTrack.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.Persistence.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        var adminRole = await SeedRolesAsync(context);
        await SeedAdminUserAsync(context, passwordHasher, adminRole);
        await SeedDemoDataAsync(context, passwordHasher);
        await SeedApplicationSettingsAsync(context);
    }

    private static async Task SeedApplicationSettingsAsync(AppDbContext context)
    {
        if (await context.ApplicationSettings.AnyAsync())
        {
            return;
        }

        context.ApplicationSettings.AddRange(
            new ApplicationSetting { Key = "SystemName", Value = "EduTrack", Description = "Display name shown in the frontend header." },
            new ApplicationSetting { Key = "MaxUploadSizeMB", Value = "10", Description = "Maximum submission/assignment attachment size, in megabytes." },
            new ApplicationSetting { Key = "AllowedFileExtensions", Value = ".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.txt", Description = "Comma-separated list of accepted file attachment extensions." });

        await context.SaveChangesAsync();
    }

    private static async Task<Role> SeedRolesAsync(AppDbContext context)
    {
        if (!await context.Roles.AnyAsync())
        {
            context.Roles.AddRange(
                new Role { Name = RoleName.Admin },
                new Role { Name = RoleName.Teacher },
                new Role { Name = RoleName.Student });

            await context.SaveChangesAsync();
        }

        return await context.Roles.SingleAsync(x => x.Name == RoleName.Admin);
    }

    private static async Task SeedAdminUserAsync(AppDbContext context, IPasswordHasher passwordHasher, Role adminRole)
    {
        const string adminEmail = "admin@edutrack.local";

        if (await context.Users.AnyAsync(x => x.Email == adminEmail))
        {
            return;
        }

        context.Users.Add(new User
        {
            FullName = "System Administrator",
            Email = adminEmail,
            PasswordHash = passwordHasher.Hash("Admin@123"),
            RoleId = adminRole.Id,
            IsActive = true
        });

        await context.SaveChangesAsync();
    }

    private static async Task SeedDemoDataAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Classes.AnyAsync())
        {
            return;
        }

        var teacherRole = await context.Roles.SingleAsync(x => x.Name == RoleName.Teacher);
        var studentRole = await context.Roles.SingleAsync(x => x.Name == RoleName.Student);

        var classA = new Class { Name = "Grade 10 - A", Description = "Grade 10, Section A", IsActive = true };
        var classB = new Class { Name = "Grade 10 - B", Description = "Grade 10, Section B", IsActive = true };
        context.Classes.AddRange(classA, classB);

        var mathSubject = new Subject { Name = "Mathematics", Code = "MATH101", IsActive = true };
        var englishSubject = new Subject { Name = "English", Code = "ENG101", IsActive = true };
        context.Subjects.AddRange(mathSubject, englishSubject);

        var demoTeacher = new User
        {
            FullName = "Demo Teacher",
            Email = "teacher@edutrack.local",
            PasswordHash = passwordHasher.Hash("Teacher@123"),
            RoleId = teacherRole.Id,
            IsActive = true
        };
        context.Users.Add(demoTeacher);

        var demoStudent1 = new User
        {
            FullName = "Demo Student One",
            Email = "student1@edutrack.local",
            PasswordHash = passwordHasher.Hash("Student@123"),
            RoleId = studentRole.Id,
            Class = classA,
            IsActive = true
        };
        var demoStudent2 = new User
        {
            FullName = "Demo Student Two",
            Email = "student2@edutrack.local",
            PasswordHash = passwordHasher.Hash("Student@123"),
            RoleId = studentRole.Id,
            Class = classA,
            IsActive = true
        };
        context.Users.AddRange(demoStudent1, demoStudent2);

        context.TeacherAssignments.Add(new TeacherAssignment
        {
            Teacher = demoTeacher,
            Class = classA,
            Subject = mathSubject
        });

        await context.SaveChangesAsync();
    }
}
