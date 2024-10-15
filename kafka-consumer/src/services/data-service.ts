import { DebeziumData } from '../types';

const convertData = (data: string): DebeziumData | undefined => {
  let response = undefined;
  const jsonData = JSON.parse(data).payload;
  if (jsonData.after) {
    response = { ...jsonData.after, tx_id: jsonData.source.txId, op: jsonData.op } as DebeziumData;
  }
  return response;
};

export { convertData };
