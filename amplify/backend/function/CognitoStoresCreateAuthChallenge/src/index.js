/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var functionRetrieveSecretName = process.env.FUNCTION_RETRIEVESECRET_NAME

Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')

exports.handler = (event, context) => {
  if (event.request.challengeName === 'CUSTOM_CHALLENGE') {
    const lambdaClient = new AWS.Lambda()
    const lambdaParams = {
      FunctionName: process.env.FUNCTION_RETRIEVESECRET_NAME,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({})
    }

    lambdaClient.invoke(lambdaParams, (err, data) => {
      if (err) {
        console.log(err)
        context.done(new Error('Error creating challenge', null))
      }
      else {
        let client_secret = data.Payload
        // Secret is returned wrapped in double quotes
        client_secret = client_secret.substring(1, client_secret.length - 1)
        event.response.privateChallengeParameters = {}
        event.response.privateChallengeParameters.answer = client_secret
        context.done(null, event);
      }
    })
  }
}