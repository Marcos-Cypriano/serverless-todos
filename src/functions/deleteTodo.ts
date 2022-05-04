import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "src/utils/dynamodbClient"

export const handler: APIGatewayProxyHandler = async (event) => {
    const { user_id } = event.pathParameters
    const { id } = JSON.parse(event.body)

    // Verifying TODO
    const todo = await document.query({
        TableName: "todos",
        KeyConditionExpression: "user_id = :user_id AND id = :id",
        ExpressionAttributeValues: {
            ":user_id": user_id,
            ":id": id
        }
    }).promise()

    if (!todo.Items[0]) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: "TODO not found"
            })
        }
    }

    // Deleting TODO
    try {
        await document.delete({
            TableName: "todos",
            Key: {
                "user_id": user_id,
                "id": id
            }
        }).promise()

        return {
            statusCode: 202,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: "TODO deleted!"
            })
        }
    } catch (err) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(err)
        }
    }
}