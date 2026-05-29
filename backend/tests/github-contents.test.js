const {
  getGitHubFileContent,
  listGitHubDirectory,
  GitHubApiError,
} = require('../src/services/github-issues-service');

describe('GitHub contents helpers', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('getGitHubFileContent decodes a text file and defaults to main', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        type: 'file',
        content: Buffer.from('# CLAUDE\npure text', 'utf8').toString('base64'),
        encoding: 'base64',
        sha: 'abc123',
        size: 18,
        html_url: 'https://github.com/nkhippo/ThinkGrindAi/blob/main/docs/CLAUDE.md',
      }),
    });

    const result = await getGitHubFileContent({
      accessToken: 'token',
      path: 'docs/CLAUDE.md',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/nkhippo/ThinkGrindAi/contents/docs/CLAUDE.md?ref=main',
      expect.any(Object)
    );
    expect(result).toMatchObject({
      content: '# CLAUDE\npure text',
      sha: 'abc123',
      size: 18,
    });
  });

  test('getGitHubFileContent passes the requested ref', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        type: 'file',
        content: Buffer.from('develop content', 'utf8').toString('base64'),
        encoding: 'base64',
        sha: 'def456',
        size: 15,
        html_url: 'https://github.com/nkhippo/ThinkGrindAi/blob/develop/docs/CLAUDE.md',
      }),
    });

    await getGitHubFileContent({
      accessToken: 'token',
      path: 'docs/CLAUDE.md',
      ref: 'feature/test',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/nkhippo/ThinkGrindAi/contents/docs/CLAUDE.md?ref=feature%2Ftest',
      expect.any(Object)
    );
  });

  test('listGitHubDirectory returns file and directory entries with paths', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        { name: 'logic', path: 'docs/requirements/logic', type: 'dir' },
        { name: 'README.md', path: 'docs/requirements/README.md', type: 'file', size: 42 },
      ]),
    });

    const result = await listGitHubDirectory({
      accessToken: 'token',
      path: 'docs/requirements',
      ref: 'develop',
    });

    expect(result.entries).toEqual([
      { name: 'logic', path: 'docs/requirements/logic', type: 'dir', size: 0 },
      { name: 'README.md', path: 'docs/requirements/README.md', type: 'file', size: 42 },
    ]);
    expect(result.total).toBe(2);
  });

  test('getGitHubFileContent reports missing paths without crashing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ message: 'Not Found' }),
    });

    await expect(
      getGitHubFileContent({
        accessToken: 'token',
        path: 'docs/nonexistent.md',
      })
    ).rejects.toEqual(expect.objectContaining({
      name: 'GitHubApiError',
      message: 'Not Found',
      status: 404,
    }));
  });

  test('getGitHubFileContent rejects files larger than 1MB', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        type: 'file',
        content: Buffer.from('too large', 'utf8').toString('base64'),
        encoding: 'base64',
        sha: 'large',
        size: 1024 * 1024 + 1,
      }),
    });

    await expect(
      getGitHubFileContent({
        accessToken: 'token',
        path: 'large.txt',
      })
    ).rejects.toBeInstanceOf(GitHubApiError);
  });
});
