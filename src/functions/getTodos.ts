import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient"

export const handler: APIGatewayProxyHandler = async (event) => {
    const { user_id } = event.pathParameters

    // Getting TODOs
    try {
        const response = await document.query({
            TableName: "todos",
            KeyConditionExpression: "user_id = :user_id",
            ExpressionAttributeValues: {
                ":user_id": user_id
            }
        }).promise()
    
        // Handling no response error
        if (!response.Items[0]) {
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
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(response.Items)
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