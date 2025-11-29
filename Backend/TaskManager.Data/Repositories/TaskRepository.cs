using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManager.Data.Repositories
{
    public class TaskRepository : Repository<Core.Models.Task>, ITaskRepository
    {
        public TaskRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Core.Models.Task>> GetTasksWithTagsAsync()
        {
            return await _context.Tasks
                .Include(t => t.TaskTags)
                .ThenInclude(tt => tt.Tag)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<Core.Models.Task?> GetTaskWithTagsByIdAsync(int id)
        {
            return await _context.Tasks
                .Include(t => t.TaskTags)
                .ThenInclude(tt => tt.Tag)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Core.Models.Task>> GetOverdueTasksAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Tasks
                .Include(t => t.TaskTags)
                .ThenInclude(tt => tt.Tag)
                .Where(t => t.DueDate < now)
                .ToListAsync();
        }
    }
}
