namespace EduTrack.Application.Common;

public class PagedQuery
{
    private const int MaxPageSize = 100;
    private int _pageSize = 10;

    public int Page { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value <= 0 ? 10 : Math.Min(value, MaxPageSize);
    }

    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public string SortDir { get; set; } = "asc";
}
