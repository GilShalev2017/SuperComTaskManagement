using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManager.Data.Repositories
{
    public interface ITaskRepository : IRepository<Core.Models.Task>
    {
        Task<IEnumerable<Core.Models.Task>> GetTasksWithTagsAsync();
        Task<Core.Models.Task?> GetTaskWithTagsByIdAsync(int id);
        Task<IEnumerable<Core.Models.Task>> GetOverdueTasksAsync();
    }
}
