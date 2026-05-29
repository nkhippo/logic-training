const {
  createGitHubPullRequest,
  getGitHubPullRequest,
  mergeGitHubPullRequest,
  GitHubApiError,
} = require('../src/services/github-issues-service');

describe('GitHub pull request helpers', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('createGitHubPullRequest creates a PR and applies labels', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          number: 190,
          title: 'feat: add PR tools',
          html_url: 'https://github.com/nkhippo/ThinkGrindAi/pull/190',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

    const result = await createGitHubPullRequest({
      accessToken: 'token',
      title: 'feat: add PR tools',
      body: 'Closes #189',
      head: 'develop',
      base: 'main',
      labels: ['feature'],
      draft: true,
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.github.com/repos/nkhippo/ThinkGrindAi/pulls',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'feat: add PR tools',
          body: 'Closes #189',
          head: 'develop',
          base: 'main',
          draft: true,
        }),
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.github.com/repos/nkhippo/ThinkGrindAi/issues/190/labels',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ labels: ['feature'] }),
      })
    );
    expect(result).toEqual({
      number: 190,
      url: 'https://github.com/nkhippo/ThinkGrindAi/pull/190',
      title: 'feat: add PR tools',
    });
  });

  test('getGitHubPullRequest returns normalized PR fields', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        number: 190,
        title: 'feat: add PR tools',
        state: 'open',
        mergeable: true,
        labels: [{ name: 'feature' }],
        head: { ref: 'develop' },
        base: { ref: 'main' },
      }),
    });

    const result = await getGitHubPullRequest({
      accessToken: 'token',
      pullNumber: 190,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/nkhippo/ThinkGrindAi/pulls/190',
      expect.any(Object)
    );
    expect(result).toEqual({
      number: 190,
      title: 'feat: add PR tools',
      state: 'open',
      mergeable: true,
      labels: ['feature'],
      head: 'develop',
      base: 'main',
    });
  });

  test('mergeGitHubPullRequest defaults to squash merge', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        merged: true,
        message: 'Pull Request successfully merged',
      }),
    });

    const result = await mergeGitHubPullRequest({
      accessToken: 'token',
      pullNumber: 190,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/nkhippo/ThinkGrindAi/pulls/190/merge',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ merge_method: 'squash' }),
      })
    );
    expect(result).toEqual({
      merged: true,
      message: 'Pull Request successfully merged',
    });
  });

  test('mergeGitHubPullRequest reports GitHub API errors with status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 405,
      json: jest.fn().mockResolvedValue({ message: 'Pull Request is not mergeable' }),
    });

    await expect(
      mergeGitHubPullRequest({
        accessToken: 'token',
        pullNumber: 190,
      })
    ).rejects.toEqual(expect.objectContaining({
      name: 'GitHubApiError',
      message: 'Pull Request is not mergeable',
      status: 405,
    }));
  });
});
