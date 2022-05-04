import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { v4 as uuidv4 } from "uuid"


export const handler: APIGatewayProxyHandler = async (event) => {
    const { user_id } = event.pathParameters
    const { title, deadline } = JSON.parse(event.body)

    // Validating inputs
    if (!title || !deadline) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: "Please fill a title and a deadline (DD/MM/YYYY) for your TODO."
            })
        }
    }

    dayjs.extend(customParseFormat)
    const verify = dayjs(deadline, "DD/MM/YYYY", true).isValid()

    if (!verify) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: "Please write the deadline in the following format: DD/MM/YYYY"
            })
        }
    }
    
    //Creating Date type deadline & Todo ID
    const dateDeadline = dayjs(deadline, "DD/MM/YYYY").format('DD/MM/YYYY')

    const id = uuidv4()

    // Registering the Todo on the DynamoDB
    await document.put({
        TableName: "todos",
        Item: {
            id,
            user_id,
            title,
            done: false,
            deadline: dateDeadline
        }
    }).promise()

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            message: "TODO created with success!"
        })
    }
}