import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export async function fetchTableData(tableId: string) {
  const { data } = await api.get(`/db/table?id=${tableId}`);
  return data;
}

export async function updateTableData(tableId: string, tableData: any) {
  await api.put(`/db/table?id=${tableId}`, { data: tableData });
}

export async function uploadFile(fileData: any) {
  const { data } = await api.post('/db/upload', fileData);
  return data;
}
