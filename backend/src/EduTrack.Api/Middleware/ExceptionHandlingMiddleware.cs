using System.Net;
using EduTrack.Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception ex)
    {
        var (status, title) = ex switch
        {
            ValidationException => (HttpStatusCode.BadRequest, "Validation failed"),
            NotFoundException => (HttpStatusCode.NotFound, "Resource not found"),
            ForbiddenException => (HttpStatusCode.Forbidden, "Access denied"),
            AuthenticationException => (HttpStatusCode.Unauthorized, "Authentication failed"),
            BusinessRuleException => (HttpStatusCode.BadRequest, "Business rule violation"),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };

        if (status == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
        }
        else
        {
            _logger.LogWarning(ex, "{Title} for {Method} {Path}", title, context.Request.Method, context.Request.Path);
        }

        var problemDetails = new ProblemDetails
        {
            Status = (int)status,
            Title = title,
            Detail = ex is ValidationException validationEx
                ? string.Join(" ", validationEx.Errors.Select(e => e.ErrorMessage))
                : ex.Message,
            Instance = context.Request.Path
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)status;
        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}
