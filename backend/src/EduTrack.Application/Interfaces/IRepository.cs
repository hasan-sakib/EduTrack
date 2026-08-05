using EduTrack.Domain.Common;

namespace EduTrack.Application.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    /// <summary>Untracked, composable queryable for reads (filtering/paging/sorting).</summary>
    IQueryable<T> Query();

    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
}
