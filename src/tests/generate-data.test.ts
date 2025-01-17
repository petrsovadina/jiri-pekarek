import handler from '@/pages/api/generate-data';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: { anthropic_api_key: 'test-api-key' } }),
        })),
      })),
    })),
  },
}));

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    completions: {
      create: jest.fn().mockResolvedValue({ completion: 'test-completion' }),
    },
  }));
});

describe('generateData', () => {
  it('should return generated data', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        table: [['test-row-1'], ['test-row-2']],
        prompt: 'test-prompt',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Data generation endpoint',
      apiKey: 'test-api-key',
      table: [['test-row-1'], ['test-row-2']],
      prompt: 'test-prompt',
      generatedData: ['test-completion', 'test-completion'],
    });
  });

  it('should return 405 if method is not POST', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Method Not Allowed' });
  });

  it('should return 401 if user is not authenticated', async () => {
    jest.mock('@/integrations/supabase/client', () => ({
      supabase: {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
    }));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        table: [['test-row-1'], ['test-row-2']],
        prompt: 'test-prompt',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Unauthorized' });
  });

  it('should return 400 if API key is not found', async () => {
    jest.mock('@/integrations/supabase/client', () => ({
      supabase: {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: null }),
            })),
          })),
        })),
      },
    }));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        table: [['test-row-1'], ['test-row-2']],
        prompt: 'test-prompt',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'API key not found' });
  });

  it('should return 400 if table or prompt is missing', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Table and prompt are required' });
  });
});
