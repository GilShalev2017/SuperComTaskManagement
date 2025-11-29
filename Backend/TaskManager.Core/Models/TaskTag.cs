using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManager.Core.Models
{
    public class TaskTag
    {
        public int TaskId { get; set; }
        public int TagId { get; set; }

        // Navigation properties
        public virtual Task Task { get; set; } = null!;
        public virtual Tag Tag { get; set; } = null!;
    }
}
