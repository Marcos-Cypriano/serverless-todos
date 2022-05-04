import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'serverless-todo',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', "serverless-dynamodb-local", "serverless-offline"],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: "us-east-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["dynamodb:*"],
            Resource: ["*"]
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: {
    createTodo: {
      handler: "src/functions/createTodo.handler",
      events: [
        {
          http: {
            path: "todos/{user_id}",
            method: "post",
            cors: true
          }
        }
      ]
    },
    getTodos: {
      handler: "src/functions/getTodos.handler",
      events: [
        {
          http: {
            path: "todos/{user_id}",
            method: "get",
            cors: true
          }
        }
      ]
    },
    doneTodo: {
      handler: "src/functions/doneTodo.handler",
      events: [
        {
          http: {
            path: "todos/done/{user_id}",
            method: "patch",
            cors: true
          }
        }
      ]
    },
    deleteTodo: {
      handler: "src/functions/deleteTodo.handler",
      events: [
        {
          http: {
            path: "todos/delete/{user_id}",
            method: "delete",
            cors: true
          }
        }
      ]
    }
  },
  package: { individually: false },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true
      }
    },
  },
  resources: {
    Resources: {
      dbTodos: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "todos",
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          },
          AttributeDefinitions: [
            {
              AttributeName: "user_id",
              AttributeType: "S"
            },
            {
              AttributeName: "id",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "user_id",
              KeyType: "HASH"
            },
            {
              AttributeName: "id",
              KeyType: "RANGE"
            }
          ]
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
