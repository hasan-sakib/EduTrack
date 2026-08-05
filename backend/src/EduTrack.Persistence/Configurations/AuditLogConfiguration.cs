using EduTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduTrack.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Action)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(x => x.EntityName)
            .IsRequired()
            .HasMaxLength(128);

        // Free-text description of the change (e.g. "Published"), not structured JSON — plain text column.
        builder.Property(x => x.Details)
            .HasColumnType("text");

        builder.Property(x => x.IpAddress)
            .HasMaxLength(64);

        builder.HasIndex(x => x.CreatedAt);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
