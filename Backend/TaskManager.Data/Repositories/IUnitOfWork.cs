using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManager.Data.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        ITaskRepository Tasks { get; }
        ITagRepository Tags { get; }
        Task<int> CompleteAsync();
    }
}
