using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Core.DTOs;
using TaskManager.Data.UnitOfWork;

namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IValidator<CreateTaskDto> _createValidator;
        private readonly IValidator<UpdateTaskDto> _updateValidator;

        public TasksController(
            IUnitOfWork unitOfWork,
            IValidator<CreateTaskDto> createValidator,
            IValidator<UpdateTaskDto> updateValidator)
        {
            _unitOfWork = unitOfWork;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetAllTasks()
        {
            var tasks = await _unitOfWork.Tasks.GetTasksWithTagsAsync();
            var taskDtos = tasks.Select(MapToDto);
            return Ok(taskDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTask(int id)
        {
            var task = await _unitOfWork.Tasks.GetTaskWithTagsByIdAsync(id);

            if (task == null)
                return NotFound(new { message = $"Task with ID {id} not found" });

            return Ok(MapToDto(task));
        }

        [HttpPost]
        public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto createTaskDto)
        {
            var validationResult = await _createValidator.ValidateAsync(createTaskDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            // Validate tags exist
            foreach (var tagId in createTaskDto.TagIds)
            {
                if (!await _unitOfWork.Tags.ExistsAsync(tagId))
                    return BadRequest(new { message = $"Tag with ID {tagId} does not exist" });
            }

            var task = new Core.Models.Task
            {
                Title = createTaskDto.Title,
                Description = createTaskDto.Description,
                DueDate = createTaskDto.DueDate,
                Priority = createTaskDto.Priority,
                FullName = createTaskDto.FullName,
                Telephone = createTaskDto.Telephone,
                Email = createTaskDto.Email,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Tasks.AddAsync(task);
            await _unitOfWork.CompleteAsync();

            // Add task tags
            foreach (var tagId in createTaskDto.TagIds)
            {
                task.TaskTags.Add(new Core.Models.TaskTag
                {
                    TaskId = task.Id,
                    TagId = tagId
                });
            }

            await _unitOfWork.CompleteAsync();

            var createdTask = await _unitOfWork.Tasks.GetTaskWithTagsByIdAsync(task.Id);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, MapToDto(createdTask!));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TaskDto>> UpdateTask(int id, UpdateTaskDto updateTaskDto)
        {
            var validationResult = await _updateValidator.ValidateAsync(updateTaskDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var task = await _unitOfWork.Tasks.GetTaskWithTagsByIdAsync(id);
            if (task == null)
                return NotFound(new { message = $"Task with ID {id} not found" });

            // Validate tags exist
            foreach (var tagId in updateTaskDto.TagIds)
            {
                if (!await _unitOfWork.Tags.ExistsAsync(tagId))
                    return BadRequest(new { message = $"Tag with ID {tagId} does not exist" });
            }

            // Update task properties
            task.Title = updateTaskDto.Title;
            task.Description = updateTaskDto.Description;
            task.DueDate = updateTaskDto.DueDate;
            task.Priority = updateTaskDto.Priority;
            task.FullName = updateTaskDto.FullName;
            task.Telephone = updateTaskDto.Telephone;
            task.Email = updateTaskDto.Email;
            task.UpdatedAt = DateTime.UtcNow;

            // Update tags
            task.TaskTags.Clear();
            foreach (var tagId in updateTaskDto.TagIds)
            {
                task.TaskTags.Add(new Core.Models.TaskTag
                {
                    TaskId = task.Id,
                    TagId = tagId
                });
            }

            await _unitOfWork.Tasks.UpdateAsync(task);
            await _unitOfWork.CompleteAsync();

            var updatedTask = await _unitOfWork.Tasks.GetTaskWithTagsByIdAsync(id);
            return Ok(MapToDto(updatedTask!));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null)
                return NotFound(new { message = $"Task with ID {id} not found" });

            await _unitOfWork.Tasks.DeleteAsync(task);
            await _unitOfWork.CompleteAsync();

            return NoContent();
        }

        private static TaskDto MapToDto(Core.Models.Task task)
        {
            return new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Priority = task.Priority,
                FullName = task.FullName,
                Telephone = task.Telephone,
                Email = task.Email,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                Tags = task.TaskTags.Select(tt => new TagDto
                {
                    Id = tt.Tag.Id,
                    Name = tt.Tag.Name
                }).ToList()
            };
        }
    }
}
