using EduTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduTrack.Persistence.Configurations;

public class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("Submissions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Content)
            .HasColumnType("text");

        builder.Property(x => x.FileUrl)
            .HasMaxLength(1024);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.Feedback)
            .HasColumnType("text");

        builder.HasIndex(x => new { x.AssignmentId, x.StudentId })
            .IsUnique();

        builder.HasIndex(x => x.StudentId);

        // Every FK on this entity is explicitly Restrict to avoid EF Core's
        // multiple-cascade-paths error, since Submissions has two relationships
        // to Users (Student, GradedByUser) as well as a relationship to Assignments
        // which itself chains back to Users via TeacherAssignment -> Teacher.
        builder.HasOne(x => x.Assignment)
            .WithMany(x => x.Submissions)
            .HasForeignKey(x => x.AssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Student)
            .WithMany(x => x.Submissions)
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.GradedByUser)
            .WithMany()
            .HasForeignKey(x => x.GradedByUserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
