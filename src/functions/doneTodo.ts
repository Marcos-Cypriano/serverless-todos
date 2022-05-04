import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient"

export const handler: APIGatewayProxyHandler = async (event) => {
    const { user_id } = event.pathParameters
    const { id } = JSON.parse(event.body)

    // Validating TODO
    const todo = await document.query({
        TableName: "todos",
        KeyConditionExpression: " user_id = :user_id AND id = :id", // como pesquisar esse dois valores
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
                message: `No TODO was found!`
            })
        }
    }

    if (todo.Items[0].done) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: `TODO '${todo.Items[0].title}' is already marked as done!`
            })
        }
    }

    // Updating TODO
    try {
        await document.update({
            TableName: "todos",
            Key: {
                "user_id": user_id,
                "id": id
            },
            UpdateExpression: "set done = :done",
            ExpressionAttributeValues: {
                ":done": true
            }
        }).promise()
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