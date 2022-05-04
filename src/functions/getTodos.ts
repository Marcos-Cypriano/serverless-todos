import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient"

// interface ITodos {
//     id: string
//     user_id: string
//     title: string
//     done: boolean
//     deadline: string
// }

export const handler: APIGatewayProxyHandler = async (event) => {
    const { user_id } = event.pathParameters

    const response = await document.query({
        TableName: "todos",
        KeyConditionExpression: "user_id = :user_id",
        ExpressionAttributeValues: {
            ":user_id": user_id
        }
    }).promise()
    
    const userTodos = response.Items

    if (userTodos) {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(userTodos)
        }
    }
    
    return {
        statusCode: 404,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            message: "No TODOs were found for this user!"
        })
    }
}