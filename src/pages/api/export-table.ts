import { NextApiRequest, NextApiResponse } from 'next';
import { Workbook } from 'exceljs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { table, format } = req.body;

    if (!table) {
      return res.status(400).json({ message: 'Table is required' });
    }

    if (format === 'excel') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      worksheet.addRows(table);

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="table.xlsx"');
      res.status(200).send(buffer);
    } else {
      const csv = table.map((row: string[]) => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="table.csv"');
      res.status(200).send(csv);
    }
  } catch (error) {
    console.error('Error exporting table:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
