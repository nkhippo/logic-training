const { updateGitHubIssue, GitHubApiError } = require('../src/services/github-issues-service');

describe('GitHub issue update helper', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('updateGitHubIssue patches title and body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        number: 263,
        title: 'updated title',
        html_url: 'https://github.com/nkhippo/ThinkGrindAi/issues/263',
        updated_at: '2026-05-30T00:00:00Z',
      }),
    });

    const result = await updateGitHubIssue({
      accessToken: 'token',
      issueNumber: 263,
      title: 'updated title',
      body: 'updated body',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/nkhippo/ThinkGrindAi/issues/263',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: 'updated title', body: 'updated body' }),
      })
    );
    expect(result).toEqual({
      number: 263,
      title: 'updated title',
      url: 'https://github.com/nkhippo/ThinkGrindAi/issues/263',
      updated_at: '2026-05-30T00:00:00Z',
    });
  });

  test('updateGitHubIssue requires title or body', async () => {
    await expect(
      updateGitHubIssue({
        accessToken: 'token',
        issueNumber: 263,
      })
    ).rejects.toBeInstanceOf(GitHubApiError);
  });
});
