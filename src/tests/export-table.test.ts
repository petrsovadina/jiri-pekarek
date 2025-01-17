import handler from '@/pages/api/export-table';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';

describe('exportTable', () => {
  it('should return a csv file', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        table: [['test-row-1', 'test-row-2'], ['test-row-3', 'test-row-4']],
        format: 'csv',
      },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.getHeader('Content-Type')).toBe('text/csv');
    expect(res.getHeader('Content-Disposition')).toBe('attachment; filename="table.csv"');
    expect(res._getData()).toBe('test-row-1,test-row-2\ntest-row-3,test-row-4');
  });

  it('should return an excel file', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        table: [['test-row-1', 'test-row-2'], ['test-row-3', 'test-row-4']],
        format: 'excel',
      },
    });

    await handler(req, res);

     expect(res.statusCode).toBe(200);
    expect(res.getHeader('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(res.getHeader('Content-Disposition')).toBe('attachment; filename="table.xlsx"');
    expect(res._getData()).toBeDefined();
  });

  it('should return 405 if method is not POST', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Method Not Allowed' });
  });

  it('should return 400 if table is missing', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Table is required' });
  });
});
