using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Core.DTOs;
using TaskManager.Core.Models;
using TaskManager.Data.Repositories;

namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IValidator<CreateTagDto> _validator;

        public TagsController(IUnitOfWork unitOfWork, IValidator<CreateTagDto> validator)
        {
            _unitOfWork = unitOfWork;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TagDto>>> GetAllTags()
        {
            var tags = await _unitOfWork.Tags.GetAllAsync();
            var tagDtos = tags.Select(t => new TagDto
            {
                Id = t.Id,
                Name = t.Name
            });
            return Ok(tagDtos);
        }

        [HttpPost]
        public async Task<ActionResult<TagDto>> CreateTag(CreateTagDto createTagDto)
        {
            var validationResult = await _validator.ValidateAsync(createTagDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            // Check if tag already exists
            var existingTag = await _unitOfWork.Tags.GetByNameAsync(createTagDto.Name);
            if (existingTag != null)
            {
                return Conflict(new { message = "A tag with this name already exists" });
            }

            var tag = new Tag
            {
                Name = createTagDto.Name
            };

            await _unitOfWork.Tags.AddAsync(tag);
            await _unitOfWork.CompleteAsync();

            var tagDto = new TagDto
            {
                Id = tag.Id,
                Name = tag.Name
            };

            return CreatedAtAction(nameof(GetAllTags), new { id = tag.Id }, tagDto);
        }
    }
}
