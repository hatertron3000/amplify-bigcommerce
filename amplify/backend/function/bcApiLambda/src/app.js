/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var storageDynamoStoresName = process.env.STORAGE_DYNAMOSTORES_NAME
var storageDynamoStoresArn = process.env.STORAGE_DYNAMOSTORES_ARN
var functionBcApiClientName = process.env.FUNCTION_BCAPICLIENT_NAME
var authCognitoStoresUserPoolId = process.env.AUTH_COGNITOSTORES_USERPOOLID

Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const dynamoDbClient = new AWS.DynamoDB.DocumentClient()
const cognitoClient = new AWS.CognitoIdentityServiceProvider()
const lambdaClient = new AWS.Lambda()

// Helpers

async function getUserFromEvent(event) {
  const userSub = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1]
  const params = {
    UserPoolId: process.env.AUTH_COGNITOSTORES_USERPOOLID,
    Filter: `sub = "${userSub}"`,
    Limit: 1
  }
  try {
    let users = await cognitoClient.listUsers(params).promise()
    if (!users.Users.length) {
      return new Error('No user retrieved')
    }
    let user = users.Users[0]
    return user
  }
  catch (err) {
    console.log(err)
    return err
  }
}

async function getBcToken(hash) {
  try {
    const table = process.env.STORAGE_DYNAMOSTORES_NAME
    const params = {
      TableName: table,
      Limit: 1,
      ExpressionAttributeValues: {
        ':h': hash
      },
      ExpressionAttributeNames: {
        '#Hash': 'Hash',
        '#Token': 'Token',
      },
      KeyConditionExpression: '#Hash = :h',
      ProjectionExpression: '#Token'
    }

    const results = await dynamoDbClient.query(params).promise()
    console.log(JSON.stringify(results))
    if (results.Items.length === 0) return null
    // Token is base64 encoded in the DB. Depending on the
    // security requirements, consider implementing encryption
    // and decryption with a library like the DynamoDB
    // Encryption Client
    else return new Buffer.from(results.Items[0].Token, 'base64').toString()
  }
  catch (err) {
    console.log(err)
    return null
  }
}

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

/**********************
 * Store  Information *
 **********************/

app.get('/store-information', async function (req, res) {
  const event = req.apiGateway.event
  const user = await getUserFromEvent(event)
  const access_token = await getBcToken(user.Username)

  const lambdaParams = {
    FunctionName: process.env.FUNCTION_BCAPICLIENT_NAME,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      store_hash: user.Username,
      access_token,
      method: "GET_STORE",
    })
  }
  console.log(JSON.stringify({
    message: `Invoking BC client for ${user.Username}.`
  }))
  lambdaClient.invoke(lambdaParams, (err, data) => {
    if (err) {
      console.log(err)
      res.json({ status: 500, error: new Error('Error creating the webhook') })
    }
    else {
      const payload = JSON.parse(data.Payload)
      console.log(JSON.stringify({
        message: `Successfully called BC client for ${user.Username}`
      }))
      res.json(payload)
    }
  })
})


/**********************
 ****** Webhooks ******
 **********************/

app.get('/webhooks', async function (req, res) {
  const event = req.apiGateway.event
  const user = await getUserFromEvent(event)
  const access_token = await getBcToken(user.Username)

  const lambdaParams = {
    FunctionName: process.env.FUNCTION_BCAPICLIENT_NAME,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      store_hash: user.Username,
      access_token,
      method: "GET_HOOKS",
    })
  }
  console.log(JSON.stringify({
    message: `Invoking BC client for ${user.Username}.`
  }))
  lambdaClient.invoke(lambdaParams, (err, data) => {
    if (err) {
      console.log(err)
      res.json({ status: 500, error: new Error('Error creating the webhook') })
    }
    else {
      const payload = JSON.parse(data.Payload)
      console.log(JSON.stringify({
        message: `Successfully called BC client for ${user.Username}`
      }))
      res.json(payload)
    }
  })
})

app.get('/webhooks/*', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url })
})

app.post('/webhooks', async function (req, res) {
  try {
    console.log(JSON.stringify({
      message: `Request received: . ${req}`
    }))
    const event = req.apiGateway.event
    const user = await getUserFromEvent(event)
    const access_token = await getBcToken(user.Username)

    const lambdaParams = {
      FunctionName: process.env.FUNCTION_BCAPICLIENT_NAME,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        store_hash: user.Username,
        access_token,
        method: "POST_HOOK",
        body: req.body
      })
    }

    console.log(JSON.stringify({
      message: `Invoking BC client for ${user.Username}.`
    }))
    lambdaClient.invoke(lambdaParams, (err, data) => {
      if (err) {
        console.log(err)
        res.json({ status: 500, error: new Error(`Error creating the webhook for ${user.Username}`) })
      }
      else {
        const payload = JSON.parse(data.Payload)
        console.log(JSON.stringify({
          message: `Successfully called BC client for ${user.Username}`
        }))
        res.json(payload)
      }
    })
  }
  catch (err) {
    console.log(err)
    res.json({ status: 500, error: new Error(`Error creating the webhook for ${user.Username}`) })
  }
})

app.put('/webhooks', function (req, res) {
  // Add your code here
  res.status(405).json({ message: unsupported })
})

app.put('/webhooks/:id', async function (req, res) {
  try {
    console.log(JSON.stringify({
      message: `Request received`,
      event: req.apiGateway.event,
      params: req.params
    }))
    const event = req.apiGateway.event
    const user = await getUserFromEvent(event)
    const access_token = await getBcToken(user.Username)

    const lambdaParams = {
      FunctionName: process.env.FUNCTION_BCAPICLIENT_NAME,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        store_hash: user.Username,
        access_token,
        method: "PUT_HOOK",
        body: req.body,
        params: req.params
      })
    }

    console.log(JSON.stringify({
      message: `Invoking BC client for ${user.Username}.`
    }))
    lambdaClient.invoke(lambdaParams, (err, data) => {
      if (err) {
        console.log(err)
        res.json({ status: 500, error: new Error(`Error updating the webhook for ${user.Username}`) })
      }
      else {
        const payload = JSON.parse(data.Payload)
        console.log(JSON.stringify({
          message: `Successfully called BC client for ${user.Username}`
        }))
        res.json(payload)
      }
    })

  }
  catch (err) {
    console.log(err)
    res.json({ status: 500, error: new Error(`Error updating the webhook for ${user.Username}`) })
  }
})


app.delete('/webhooks', function (req, res) {
  // Add your code here
  res.status(405).json({ message: unsupported })
})

app.delete('/webhooks/:id', async function (req, res) {
  try {
    console.log(JSON.stringify({
      message: `Request received`,
      event: req.apiGateway.event,
      params: req.params
    }))
    const event = req.apiGateway.event
    const user = await getUserFromEvent(event)
    const access_token = await getBcToken(user.Username)

    const lambdaParams = {
      FunctionName: process.env.FUNCTION_BCAPICLIENT_NAME,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        store_hash: user.Username,
        access_token,
        method: "DELETE_HOOK",
        params: req.params
      })
    }

    console.log(JSON.stringify({
      message: `Invoking BC client for ${user.Username}.`
    }))
    lambdaClient.invoke(lambdaParams, (err, data) => {
      if (err) {
        console.log(err)
        res.json({ status: 500, error: new Error(`Error updating the webhook for ${user.Username}`) })
      }
      else {
        const payload = JSON.parse(data.Payload)
        console.log(JSON.stringify({
          message: `Successfully called BC client for ${user.Username}`
        }))
        res.json(payload)
      }
    })

  }
  catch (err) {
    console.log(err)
    res.json({ status: 500, error: new Error(`Error updating the webhook for ${user.Username}`) })
  }
})

app.listen(3000, function () {
  console.log("App started")
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
