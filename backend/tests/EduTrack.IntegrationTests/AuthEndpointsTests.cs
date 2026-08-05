using System.Net;
using System.Net.Http.Json;
using EduTrack.Application.DTOs;
using FluentAssertions;
using Xunit;

namespace EduTrack.IntegrationTests;

public class AuthEndpointsTests : IClassFixture<EduTrackWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthEndpointsTests(EduTrackWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_Returns401()
    {
        var response = await _client.GetAsync("/api/v1/users");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithSeededAdminCredentials_ReturnsTokens()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin@edutrack.local", "Admin@123"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        body!.AccessToken.Should().NotBeNullOrWhiteSpace();
        body.User.Role.Should().Be("Admin");
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin@edutrack.local", "wrong-password"));

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_WithValidToken_ReturnsCurrentUser()
    {
        var login = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("teacher@edutrack.local", "Teacher@123"));
        var tokens = await login.Content.ReadFromJsonAsync<AuthResponse>();

        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var me = await response.Content.ReadFromJsonAsync<CurrentUserDto>();
        me!.Email.Should().Be("teacher@edutrack.local");
        me.Role.Should().Be("Teacher");
    }

    [Fact]
    public async Task StudentToken_CannotAccessAdminOnlyEndpoint()
    {
        var login = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("student1@edutrack.local", "Student@123"));
        var tokens = await login.Content.ReadFromJsonAsync<AuthResponse>();

        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/users");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
