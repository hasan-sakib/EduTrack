using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduTrack.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddClassSection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Classes_Name",
                table: "Classes");

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "Classes",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "Classes"
                SET "Section" = split_part("Name", ' - ', 2),
                    "Name" = split_part("Name", ' - ', 1)
                WHERE "Name" LIKE '% - %';
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Classes_Name_Section",
                table: "Classes",
                columns: new[] { "Name", "Section" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Classes_Name_Section",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "Classes");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_Name",
                table: "Classes",
                column: "Name",
                unique: true);
        }
    }
}
