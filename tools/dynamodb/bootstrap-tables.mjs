import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
} from '@aws-sdk/client-dynamodb';
import { resolve } from 'node:path';
import {
  ensureDir,
  reportsRoot,
  wait,
  writeJson,
} from '../validate/lib.mjs';

const endpoint = process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000';
const region = process.env.AWS_REGION ?? 'us-east-1';

const tables = ['users', 'boards', 'lists', 'tasks'];

const client = new DynamoDBClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'DUMMYIDEXAMPLE',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'DUMMYEXAMPLEKEY',
  },
});

const waitForActive = async (tableName) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await client.send(new DescribeTableCommand({ TableName: tableName }));
    if (response.Table?.TableStatus === 'ACTIVE') {
      return;
    }
    await wait(1000);
  }

  throw new Error(`Timed out waiting for DynamoDB table ${tableName} to become ACTIVE`);
};

const ensureTable = async (tableName) => {
  try {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      })
    );
  } catch (error) {
    if (!(error instanceof ResourceInUseException)) {
      throw error;
    }
  }

  await waitForActive(tableName);
};

const main = async () => {
  ensureDir(reportsRoot);
  await Promise.all(tables.map((tableName) => ensureTable(tableName)));
  writeJson(resolve(reportsRoot, 'dynamodb-bootstrap.json'), {
    endpoint,
    tables,
    status: 'success',
  });
  console.log(`DynamoDB tables ready at ${endpoint}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
