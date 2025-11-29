using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using TaskManager.Core.Models;
using TaskManager.Data;
using TaskManager.Data.Repositories;
using Xunit;

namespace TaskManager.Tests.Repositories
{
    public class TaskRepositoryTests
    {
        /*
        private readonly Mock<ApplicationDbContext> _mockContext;
        private readonly Mock<DbSet<Core.Models.Task>> _mockTasksDbSet;
        private readonly TaskRepository _repository;

        public TaskRepositoryTests()
        {
            _mockContext = new Mock<ApplicationDbContext>();
            _mockTasksDbSet = new Mock<DbSet<Core.Models.Task>>();
            _mockContext.Setup(c => c.Tasks).Returns(_mockTasksDbSet.Object);

            _repository = new TaskRepository(_mockContext.Object);
        }

        private static Mock<DbSet<T>> CreateDbSetMock<T>(IQueryable<T> data) where T : class
        {
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());
            return mockSet;
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTasksWithTagsAsync_ReturnsAllTasksWithTags()
        {
            // Arrange
            var tasks = new List<Core.Models.Task>
            {
                new Core.Models.Task
                {
                    Id = 1,
                    Title = "Task1",
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    TaskTags = new List<TaskTag>
                    {
                        new TaskTag { Tag = new Tag { Id = 1, Name = "Tag1" } }
                    }
                },
                new Core.Models.Task
                {
                    Id = 2,
                    Title = "Task2",
                    CreatedAt = DateTime.UtcNow,
                    TaskTags = new List<TaskTag>()
                }
            }.AsQueryable();

            var mockSet = CreateDbSetMock(tasks);
            _mockContext.Setup(c => c.Tasks).Returns(mockSet.Object);

            // Act
            var result = await _repository.GetTasksWithTagsAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Equal("Task2", result.First().Title); // ordered by CreatedAt descending
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskWithTagsByIdAsync_ReturnsCorrectTask()
        {
            // Arrange
            var tasks = new List<Core.Models.Task>
            {
                new Core.Models.Task { Id = 1, Title = "Task1", TaskTags = new List<TaskTag>() },
                new Core.Models.Task { Id = 2, Title = "Task2", TaskTags = new List<TaskTag>() }
            }.AsQueryable();

            var mockSet = CreateDbSetMock(tasks);
            _mockContext.Setup(c => c.Tasks).Returns(mockSet.Object);

            // Act
            var result = await _repository.GetTaskWithTagsByIdAsync(2);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result!.Id);
            Assert.Equal("Task2", result.Title);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskWithTagsByIdAsync_WhenNotFound_ReturnsNull()
        {
            // Arrange
            var tasks = new List<Core.Models.Task>().AsQueryable();
            var mockSet = CreateDbSetMock(tasks);
            _mockContext.Setup(c => c.Tasks).Returns(mockSet.Object);

            // Act
            var result = await _repository.GetTaskWithTagsByIdAsync(1);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetOverdueTasksAsync_ReturnsOnlyOverdueTasks()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var tasks = new List<Core.Models.Task>
            {
                new Core.Models.Task { Id = 1, Title = "Overdue1", DueDate = now.AddDays(-1), TaskTags = new List<TaskTag>() },
                new Core.Models.Task { Id = 2, Title = "NotOverdue", DueDate = now.AddDays(1), TaskTags = new List<TaskTag>() },
                new Core.Models.Task { Id = 3, Title = "Overdue2", DueDate = now.AddHours(-1), TaskTags = new List<TaskTag>() }
            }.AsQueryable();

            var mockSet = CreateDbSetMock(tasks);
            _mockContext.Setup(c => c.Tasks).Returns(mockSet.Object);

            // Act
            var result = await _repository.GetOverdueTasksAsync();

            // Assert
            var list = result.ToList();
            Assert.Equal(2, list.Count);
            Assert.Contains(list, t => t.Title == "Overdue1");
            Assert.Contains(list, t => t.Title == "Overdue2");
            Assert.DoesNotContain(list, t => t.Title == "NotOverdue");
        }*/
    }
       
}
