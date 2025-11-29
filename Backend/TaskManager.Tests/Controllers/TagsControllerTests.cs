using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Text.Json;
using TaskManager.API.Controllers;
using TaskManager.Core.DTOs;
using TaskManager.Core.Models;
using TaskManager.Data.UnitOfWork;

namespace TaskManager.Tests.Controllers
{
    public class TagsControllerTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IValidator<CreateTagDto>> _mockValidator;
        private readonly TagsController _controller;

        public TagsControllerTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockValidator = new Mock<IValidator<CreateTagDto>>();
            _controller = new TagsController(_mockUnitOfWork.Object, _mockValidator.Object);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetAllTags_ReturnsOkResult_WithListOfTags()
        {
            // Arrange
            var tags = new List<Tag>
            {
                new Tag { Id = 1, Name = "Important" },
                new Tag { Id = 2, Name = "Urgent" }
            };

            _mockUnitOfWork.Setup(u => u.Tags.GetAllAsync())
                .ReturnsAsync(tags);

            // Act
            var result = await _controller.GetAllTags();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TagDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public async System.Threading.Tasks.Task CreateTag_WithValidData_ReturnsCreatedTag()
        {
            // Arrange
            var createDto = new CreateTagDto { Name = "NewTag" };
            var validationResult = new ValidationResult();

            _mockValidator.Setup(v => v.ValidateAsync(createDto, default))
                .ReturnsAsync(validationResult);

            _mockUnitOfWork.Setup(u => u.Tags.GetByNameAsync(createDto.Name))
                .ReturnsAsync((Tag?)null);

            _mockUnitOfWork.Setup(u => u.Tags.AddAsync(It.IsAny<Tag>()))
                .ReturnsAsync((Tag t) =>
                {
                    t.Id = 1; // simulate database assigning ID
                    return t;
                });

            // Act
            var result = await _controller.CreateTag(createDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnValue = Assert.IsType<TagDto>(createdResult.Value);
            Assert.Equal("NewTag", returnValue.Name);
            Assert.Equal(1, returnValue.Id); // now passes
        }


        [Fact]
        public async System.Threading.Tasks.Task CreateTag_WithValidationErrors_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateTagDto { Name = "" };
            var validationResult = new ValidationResult();
            validationResult.Errors.Add(new ValidationFailure("Name", "Name is required"));

            _mockValidator.Setup(v => v.ValidateAsync(createDto, default))
                .ReturnsAsync(validationResult);

            // Act
            var result = await _controller.CreateTag(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);

            // Serialize and deserialize
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            var doc = JsonSerializer.Deserialize<JsonElement>(json);

            // Extract errors array
            var errors = doc.GetProperty("errors").EnumerateArray().Select(e => e.GetString()).ToList();

            Assert.Contains("Name is required", errors);
        }

        [Fact]
        public async System.Threading.Tasks.Task CreateTag_WhenTagAlreadyExists_ReturnsConflict()
        {
            // Arrange
            var createDto = new CreateTagDto { Name = "ExistingTag" };
            var validationResult = new ValidationResult();

            _mockValidator.Setup(v => v.ValidateAsync(createDto, default))
                .ReturnsAsync(validationResult);

            _mockUnitOfWork.Setup(u => u.Tags.GetByNameAsync(createDto.Name))
                .ReturnsAsync(new Tag { Id = 1, Name = "ExistingTag" });

            // Act
            var result = await _controller.CreateTag(createDto);

            // Assert
            var conflictResult = Assert.IsType<ConflictObjectResult>(result.Result);

            // Serialize and deserialize to JsonElement
            var json = JsonSerializer.Serialize(conflictResult.Value);
            var doc = JsonSerializer.Deserialize<JsonElement>(json);

            var message = doc.GetProperty("message").GetString();
            Assert.Equal("A tag with this name already exists", message);
        }
    }
}
