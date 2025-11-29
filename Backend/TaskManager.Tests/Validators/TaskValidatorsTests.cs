using FluentValidation.TestHelper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManager.API.Validators;
using TaskManager.Core.DTOs;

namespace TaskManager.Tests.Validators
{
    public class TaskValidatorTests
    {
        private readonly CreateTaskDtoValidator _validator;

        public TaskValidatorTests()
        {
            _validator = new CreateTaskDtoValidator();
        }

        [Fact]
        public void Should_Have_Error_When_Title_Is_Empty()
        {
            var model = new CreateTaskDto { Title = "" };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Title);
        }

        [Fact]
        public void Should_Have_Error_When_Title_Exceeds_MaxLength()
        {
            var model = new CreateTaskDto { Title = new string('a', 201) };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Title);
        }

        [Fact]
        public void Should_Have_Error_When_DueDate_Is_Past()
        {
            var model = new CreateTaskDto
            {
                Title = "Test",
                DueDate = DateTime.UtcNow.AddDays(-1)
            };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.DueDate);
        }

        [Fact]
        public void Should_Have_Error_When_Priority_Is_Invalid()
        {
            var model = new CreateTaskDto
            {
                Title = "Test",
                Priority = 5
            };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Priority);
        }

        [Fact]
        public void Should_Have_Error_When_Email_Is_Invalid()
        {
            var model = new CreateTaskDto
            {
                Title = "Test",
                Email = "invalid-email"
            };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Fact]
        public void Should_Have_Error_When_TagIds_Is_Empty()
        {
            var model = new CreateTaskDto
            {
                Title = "Test",
                TagIds = new List<int>()
            };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.TagIds);
        }

        [Fact]
        public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
        {
            var model = new CreateTaskDto
            {
                Title = "Valid Task",
                Description = "Description",
                DueDate = DateTime.UtcNow.AddDays(1),
                Priority = 2,
                FullName = "John Doe",
                Telephone = "1234567890",
                Email = "john@example.com",
                TagIds = new List<int> { 1 }
            };
            var result = _validator.TestValidate(model);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
