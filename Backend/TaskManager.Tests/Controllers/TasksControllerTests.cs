using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManager.API.Controllers;
using TaskManager.Core.DTOs;
using FluentValidation.Results;
using TaskManager.Data.UnitOfWork;

namespace TaskManager.Tests.Controllers
{
    public class TasksControllerTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IValidator<CreateTaskDto>> _mockCreateValidator;
        private readonly Mock<IValidator<UpdateTaskDto>> _mockUpdateValidator;
        private readonly TasksController _controller;

        public TasksControllerTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockCreateValidator = new Mock<IValidator<CreateTaskDto>>();
            _mockUpdateValidator = new Mock<IValidator<UpdateTaskDto>>();
            _controller = new TasksController(
                _mockUnitOfWork.Object,
                _mockCreateValidator.Object,
                _mockUpdateValidator.Object
            );
        }

        [Fact]
        public async Task GetAllTasks_ReturnsOkResult_WithListOfTasks()
        {
            // Arrange
            var tasks = new List<Core.Models.Task>
            {
                new Core.Models.Task
                {
                    Id = 1,
                    Title = "Test Task",
                    DueDate = DateTime.UtcNow.AddDays(1),
                    Priority = 2,
                    FullName = "John Doe",
                    Email = "john@example.com",
                    Telephone = "1234567890",
                    TaskTags = new List<Core.Models.TaskTag>()
                }
            };

            _mockUnitOfWork.Setup(u => u.Tasks.GetTasksWithTagsAsync())
                .ReturnsAsync(tasks);

            // Act
            var result = await _controller.GetAllTasks();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TaskDto>>(okResult.Value);
            Assert.Single(returnValue);
        }

        [Fact]
        public async Task GetTask_WithValidId_ReturnsTask()
        {
            // Arrange
            var task = new Core.Models.Task
            {
                Id = 1,
                Title = "Test Task",
                DueDate = DateTime.UtcNow.AddDays(1),
                Priority = 2,
                FullName = "John Doe",
                Email = "john@example.com",
                Telephone = "1234567890",
                TaskTags = new List<Core.Models.TaskTag>()
            };

            _mockUnitOfWork.Setup(u => u.Tasks.GetTaskWithTagsByIdAsync(1))
                .ReturnsAsync(task);

            // Act
            var result = await _controller.GetTask(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<TaskDto>(okResult.Value);
            Assert.Equal("Test Task", returnValue.Title);
        }

        [Fact]
        public async Task GetTask_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _mockUnitOfWork.Setup(u => u.Tasks.GetTaskWithTagsByIdAsync(999))
                .ReturnsAsync((Core.Models.Task?)null);

            // Act
            var result = await _controller.GetTask(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateTask_WithValidData_ReturnsCreatedTask()
        {
            // Arrange
            var createDto = new CreateTaskDto
            {
                Title = "New Task",
                DueDate = DateTime.UtcNow.AddDays(1),
                Priority = 2,
                FullName = "John Doe",
                Email = "john@example.com",
                Telephone = "1234567890",
                TagIds = new List<int> { 1 }
            };

            var validationResult = new ValidationResult();
            _mockCreateValidator.Setup(v => v.ValidateAsync(createDto, default))
                .ReturnsAsync(validationResult);

            _mockUnitOfWork.Setup(u => u.Tags.ExistsAsync(It.IsAny<int>()))
                .ReturnsAsync(true);

            var createdTask = new Core.Models.Task
            {
                Id = 1,
                Title = createDto.Title,
                DueDate = createDto.DueDate,
                Priority = createDto.Priority,
                FullName = createDto.FullName,
                Email = createDto.Email,
                Telephone = createDto.Telephone,
                TaskTags = new List<Core.Models.TaskTag>()
            };

            _mockUnitOfWork.Setup(u => u.Tasks.AddAsync(It.IsAny<Core.Models.Task>()))
                .ReturnsAsync(createdTask);

            _mockUnitOfWork.Setup(u => u.Tasks.GetTaskWithTagsByIdAsync(1))
                .ReturnsAsync(createdTask);

            // Act
            var result = await _controller.CreateTask(createDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnValue = Assert.IsType<TaskDto>(createdResult.Value);
            Assert.Equal("New Task", returnValue.Title);
        }

        [Fact]
        public async Task UpdateTask_WithValidData_ReturnsUpdatedTask()
        {
            // Arrange
            var updateDto = new UpdateTaskDto
            {
                Title = "Updated Task",
                DueDate = DateTime.UtcNow.AddDays(1),
                Priority = 3,
                FullName = "Jane Doe",
                Email = "jane@example.com",
                Telephone = "0987654321",
                TagIds = new List<int> { 1 }
            };

            var existingTask = new Core.Models.Task
            {
                Id = 1,
                Title = "Old Task",
                DueDate = DateTime.UtcNow.AddDays(1),
                Priority = 2,
                FullName = "John Doe",
                Email = "john@example.com",
                Telephone = "1234567890",
                TaskTags = new List<Core.Models.TaskTag>()
            };

            var validationResult = new ValidationResult();
            _mockUpdateValidator.Setup(v => v.ValidateAsync(updateDto, default))
                .ReturnsAsync(validationResult);

            _mockUnitOfWork.Setup(u => u.Tasks.GetTaskWithTagsByIdAsync(1))
                .ReturnsAsync(existingTask);

            _mockUnitOfWork.Setup(u => u.Tags.ExistsAsync(It.IsAny<int>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateTask(1, updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<TaskDto>(okResult.Value);
            Assert.Equal("Updated Task", returnValue.Title);
        }

        [Fact]
        public async Task DeleteTask_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var task = new Core.Models.Task { Id = 1, Title = "Test" };
            _mockUnitOfWork.Setup(u => u.Tasks.GetByIdAsync(1))
                .ReturnsAsync(task);

            // Act
            var result = await _controller.DeleteTask(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteTask_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _mockUnitOfWork.Setup(u => u.Tasks.GetByIdAsync(999))
                .ReturnsAsync((Core.Models.Task?)null);

            // Act
            var result = await _controller.DeleteTask(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}
