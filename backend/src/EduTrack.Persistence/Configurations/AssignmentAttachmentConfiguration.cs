using EduTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduTrack.Persistence.Configurations;

public class AssignmentAttachmentConfiguration : IEntityTypeConfiguration<AssignmentAttachment>
{
    public void Configure(EntityTypeBuilder<AssignmentAttachment> builder)
    {
        builder.ToTable("AssignmentAttachments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FileUrl)
            .IsRequired()
            .HasMaxLength(1024);

        builder.Property(x => x.FileName)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasOne(x => x.Assignment)
            .WithMany(x => x.Attachments)
            .HasForeignKey(x => x.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
