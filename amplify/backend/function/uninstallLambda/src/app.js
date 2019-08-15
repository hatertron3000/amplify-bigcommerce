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
var functionRetrieveSecretName = process.env.FUNCTION_RETRIEVESECRET_NAME
var authCognitoStoresUserPoolId = process.env.AUTH_COGNITOSTORES_USERPOOLID

Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

AWS.config.update({ region: process.env.TABLE_REGION })

let tableName = process.env.STORAGE_DYNAMOSTORES_NAME

const path = "/uninstall"

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

/********************************
 * Uninstall Request Handler *
 ********************************/

app.get(path, function (req, res) {
  const crypto = require('crypto')
  const lambdaClient = new AWS.Lambda()
  const dynamoDbClient = new AWS.DynamoDB()
  const cognitoClient = new AWS.CognitoIdentityServiceProvider()

  const lambdaParams = {
    FunctionName: process.env.FUNCTION_RETRIEVESECRET_NAME,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({})
  }

  lambdaClient.invoke(lambdaParams, (err, data) => {
    if (err) {
      console.log(err)
      reject(new Error('Error during installation'))
    }
    else {
      try {
        if (err) {
          console.log(err)
          res.json({ status: 500, message: 'Internal server error' })
        }
        else {
          let client_secret = data.Payload
          // Secret is returned wrapped in double quotes
          client_secret = client_secret.substring(1, client_secret.length - 1)

          const encodedStrings = req.query.signed_payload.split('.')
          // verify signed payload is the correct format
          if (encodedStrings.length !== 2) {
            res.statusCode = 403
            res.json({ status: 403, message: 'Signed payload is not the correct format' })
          }
          else {
            // Verify Signature
            const signature = new Buffer.from(encodedStrings[1], 'base64').toString('utf8')
            const data = new Buffer.from(encodedStrings[0], 'base64').toString('utf8')
            const expectedSignature = crypto.createHmac('sha256', client_secret).update(data).digest('hex')
            if (expectedSignature === signature) {
              const jsonData = JSON.parse(data)
              // Delete user in Cognito
              const userParams = {
                UserPoolId: process.env.AUTH_COGNITOSTORES_USERPOOLID,
                Username: jsonData.store_hash,
              }
              cognitoClient.adminDeleteUser(userParams, (err, data) => {
                if (err) {
                  console.log(({ status: 500, message: "Error removing user from user pool", error: err }))
                  res.statusCode = 500
                  res.json({ status: 500, message: "Error removing user from user pool" })
                }
                else {
                  console.log({ message: `Finished removing user ${jsonData.store_hash}. Cleaning up table.` })
                  // Remove from DynamoDB
                  const keyParams = {
                    "Hash": {
                      "S": jsonData.store_hash
                    }
                  }

                  let removeItemParams = {
                    TableName: tableName,
                    Key: keyParams
                  }
                  dynamoDbClient.deleteItem(removeItemParams, (err, data) => {
                    if (err) {
                      console.log(err)
                      res.statusCode = 500
                      res.json({ status: 500, message: `Error during uninstall`, store: jsonData.store_hash })
                    } else {
                      console.log({ message: `Successfully uninstalled`, store: jsonData.store_hash })
                      res.json({ status: 200, message: `Successfully uninstalled`, store: jsonData.store_hash })
                    }
                  })
                }
              })
            }
            else {
              console.log({ status: 403, message: 'Signed payload is invalid' })
              res.statusCode = 403
              res.json({ status: 403, message: 'Signed payload is invalid' })
            }
          }
        }
      }
      catch (err) {
        console.log(err)
        res.statusCode = 500
        res.json({ status: 500, message: 'Internal server error' })
      }

    }
  })
})

app.listen(3000, function () {
  console.log("App started")
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
