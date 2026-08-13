using EduTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduTrack.Persistence.Configurations;

public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.ToTable("Assignments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.Topic)
            .HasMaxLength(100);

        builder.HasIndex(x => new { x.TeacherAssignmentId, x.Status, x.DueDate });

        builder.HasOne(x => x.TeacherAssignment)
            .WithMany(x => x.Assignments)
            .HasForeignKey(x => x.TeacherAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
