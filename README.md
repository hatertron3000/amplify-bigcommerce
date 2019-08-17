# Summary

This is an example BigCommerce app build with AWS Amplify. Deploy and configure this app so that you can launch it from the BigCommerce control panel and retrieve data from the BigCommerce Store Information API.

  

This application manages the following AWS resources with Amplify CLI:

- IAM Roles
- CloudFormation Stack
- Lambda Functions
- Cognito User and Identity Pools
- DynamoDB
- S3
- CloudFront

  

**A note about security**

  

If you intend to use this application as a starting point for a production serverless BigCommerce app, consider additional security measure, such as:

  

- Always use [AWS IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).
- Adding encryption in-transit with [DynamoDB Encryption Client](https://docs.aws.amazon.com/dynamodb-encryption-client/latest/devguide/what-is-ddb-encrypt.html), or an alternate API key storage service, for the API tokens this app stores in DynamoDB.
- Adding Logout links, and faster token expiration (default is 1 day).

  

# Installation

  

This application utilizes [AWS Amplify CLI](https://github.com/aws-amplify/amplify-cli) and [AWS Amplify JS](https://github.com/aws-amplify/amplify-js) to deploy a serverless backend to AWS, with a React front end that you can run locally, or later build and publish to an S3 bucket behind CloudFront.

  

This application stores the BigCommerce Client Secret in AWS Secrets Manager. Amplify CLI does not provision the Secrets Manager resource, some of the steps will be performed in the AWS Console. Environment variables to refer to the Secret, as well as the BigCommerce Client ID, will be manually added as parameters for CloudFormation templates.

  

## Prerequisites

### Environment

  

- [NodeJS](https://nodejs.org/en/download/) (recommended v10.16.0)
- [npm](https://www.npmjs.com/get-npm)

  

*For Windows users, [Amplify recommends](https://aws-amplify.github.io/docs/js/react#installation) the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10).*

  

### BigCommerce Store

If you do not already have one, you will need to create a BigCommerce store. If necessary navigate to [https://www.bigcommerce.com/essentials/](https://www.bigcommerce.com/essentials/) to sign up for a free trial store.

  

*Make sure your user account is the "store owner" account. Only the store owner can install draft apps like the one you're about to register. If you created the trial, your account is automatically the store owner.*

### BigCommerce App

This example will walk you through registering a [personal app](https://developer.bigcommerce.com/api-docs/getting-started/building-apps-bigcommerce/types-of-apps#types-of-personal_apps). To register a personal BigCommerce app, you will need:

  

- **App Name:** The name of your application.
- **Auth Callback URL:** The React app hosts the auth callback URL at /oauth
-- Example: https://example.com/install
- **Load Callback URL:** The React app hosts the load callback URL at /load
-- Example: https://example.com/oauth

  

You may use a URL such as https://localhost:3000/install to test against the local development server. You may update them later to instead use a permanent CloudFront URL, or a custom domain. You can use tools like [Amplify Console](https://console.aws.amazon.com/amplify) or [Route 53] https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-api-gateway.html to apply a domain to your app.

1. Navigate to [https://devtools.bigcommerce.com](https://devtools.bigcommerce.com/) and log into your BigCommerce account
2. If necessary, log in with your store owner account.
3. Click the Create an App button
4. Enter your App Name, then click Create
5. Navigate to the Technical tab then enter the Auth Callback URL and Load Callback URL
6. Take note of your Auth Callback URL to be used as the REDIRECTURI environment variable in a CloudFormation template.
7. Save the app
8. Click the View Client ID link to view your Client ID and Client Secret. Take note of those values for use in Lambda environment variables and storage in Secrets Manager respectively.

For more information on BigCommerce apps, check out the [BigCommerce documentation](https://developer.bigcommerce.com/api-docs/getting-started).

  

### AWS

#### Account

If you don't already have an AWS account, sign up for a free tier account here: [https://aws.amazon.com/free](https://aws.amazon.com/free)

  

*While this utility was developed and tested within the limits of an AWS Free Tier account, you are responsible for any charges incurred by using the resources created by Amplify*

  

Always follow [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#create-iam-users), such as operating from an IAM user rather than your root account.

#### Amplify CLI

Install and configure [Amplify CLI](https://github.com/aws-amplify/amplify-cli)

```
$ npm install -g @aws-amplify/cli
$ amplify configure
```

  

#### Secrets Manager

Store your BigCommerce client secret in AWS Secrets Manager.

  

1. Log in to [AWS console](http://console.aws.amazon.com)
2. Click *Services*, and locate *Secrets Manager*
3. Click the *Store a new secret* button
4. Select *Other type of secrets (e.g. API key)*
5. Enter a *Secret key/value pair* where the key is an arbitrary key name like "client_secret", and the value is the BigCommerce Client Secret.
>You can retrieve the client secret from [https://devtools.bigcommerce.com](https://devtools.bigcommerce.com/)
6. Take note of your key to use later as the SECRETKEY environment variable in CloudFormation
7. Choose an encryption key, or use the default key 
8. Click *Next*
9. Enter a *Secret name*, and optionally provide a description and/or tags
10. Take note of the secret name to use later as the SECRETNAME environment variable in CloudFormation templates for Lambda functions
11. Click *Next*
12. Select *Disable automatic rotation*
13. Click *Next*
14. Review the configuration, then click *Store*
15. In the Secrets Manager console, click the name of your secret to locate the Secret ARN
16. Take note of the Secret ARN to use later as the SECRETARN environment variable in CloudFormation templates for Lambda functions 

> example format: 
> arn:aws:secretsmanager*:{region}:{account}:*secret*:{secret-name}

  

For more information, see [Secrets Manager documentation](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html).

  

## Clone and configure the Example App

  

### Clone the repo

Clone this repo into your project folder.

  

### Install dependencies
```
npm install
```
  

### bcApiClient CloudFormation

Edit *amplify/backend/function/bcApiClient/parameters.json*, and make the following replacement:

  

|Key|Value|
|--|--|
|BCCLIENTID|Your BigCommerce Client ID|

  

### Presignup Lambda CloudFormation

Edit *amplify/backend/function/CognitoStoresPreSignup/parameters.json*, and make the following replacements:

  

|Key|Value|
|--|--|
|REDIRECTURL|Your app's Auth Callback URI (example: *https://localhost:3000/oauth*)|
|BCCLIENTID|Your BigCommerce Client ID|

  

### retrieveSecret CloudFormation

Edit *amplify/backend/function/retrieveSecret/parameters.json*, and make the following replacements:

  

|Key|Value|
|--|--|
|SECRETNAME|Your Secret's name in Secrets Manager (example: *bcSecret)*|
|SECRETKEY|They key from the key value pair in Secrets Manager (example: *client_secret)* |
|SECRETARN|They Amazon Resource Name of your Secret in Secrets Manager (example format: *arn:aws:secretsmanager*:{region}:{account}:*secret*:{secret-name}) |

  

## Initialize Amplify

In the project folder, run the following

  
```
amplify init
```
  

Follow the prompts to create a new environment, or use an existing one. Amplify CLI will create the AWS resources needed to deploy the application like a CloudFormation stack, and several IAM roles.

  

## Deploy Backend to Cloud

> *A note about security*
> To ensure the React client is only able to authenticate with the custom auth flow, be sure to enable Only allow Custom Authentication (CUSTOM_AUTH_FLOW_ONLY) for the app in the App Clients section of the Cognito User Pool console. See the Security Considerations section of the AWS blog post [Customizing Amazon Cognito User Pool Authentication Flows](https://aws.amazon.com/blogs/mobile/customizing-your-user-pool-authentication-flow/).

> Nevertheless, the [signUp()](https://aws-amplify.github.io/amplify-js/api/classes/authclass.html#signup) method requires both a username and password. To ensure the password is not something easily guessable, the React client randomly generates a password between 16 and 256 characters including both alphanumeric and special characters.


### Local Testing

The longest part of the deployment is the CloudFront distribution. If you want to start testing as quickly as possible, consider removing the hosting resource and using the local development server for your Auth and Load Callback URLs. To remove hosting, run the following command in the project folder:

  
```
amplify hosting remove
```
  

Choose *S3AndCloudFront* and follow the prompts to remove the hosting resources locally. Then, run the following command to deploy the remaining resources to the cloud, and start the local development server:

  
```
amplify serve
```
  

Answer *Y* when prompted to create resources in the cloud

  

To test the uninstall flow, you will need to also complete the [Uninstall Callback URL](#uninstall-callback-url) steps below.

  

### Publish to Cloud

  

If you previously used `amplify hosting remove` to remove the hosting resources locally, you will first need to run `amplify hosting add` to add S3 hosting with CloudFront.

  

In the project folder, run the following

  
```
amplify publish
```
  
  

Answer *Y* when prompted to create resources in the cloud

  

Amplify will create a CloudFront distribution with HTTPS URLs for your S3 bucket. Then, it runs the React client’s build command, and upload the artifact to an S3 Bucket. Finally, the CLI will provide you with a URL where you can access the React Client. The URL is also available in *src/aws-exports.js* as aws_content_delivery_url. Alternatively, you can retrieve it from AWS console.

  

#### Update the PreSignup environment variables

Edit *amplify/backend/function/CognitoStoresPreSignup/parameters.json*, and make the following replacements:

  

|Key|Value|
|--|--|
|REDIRECTURL|Your app's new Auth Callback URL (example: *https://abcdef123456.cloudfront.net/oauth)|

#### Update Auth and Load Callback URLs
Use the */oauth* and */load* endpoints on the CloudFront URL to update teh Auth and Load Callback URLs in BigCommerce:

1.  Navigate to [https://devtools.bigcommerce.com](https://devtools.bigcommerce.com/) and log into your BigCommerce account
2. If necessary, log in with your store owner account.
3. Click the Edit App button
4. Navigate to the Technical tab then update the Auth and Load Callback URLs
5. Click the Update and Close button

#### Uninstall Callback URL

1. Retrieve the uninstall callback URL. 
	* It can be found either [the AWS console](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-call-api.html#apigateway-how-to-call-rest-api)...
	* ...or from *src/aws-exports.js* where it is the endpoint value for an object in aws_cloud_logic_custom (Example: https://abcd1234.execute-api.region.amazonaws.com/environment). 

    

> If you retrieve the URL from the aws-exports.js file, you will need to
> append `/uninstall` to the URL.

2. Supply the Uninstall Callback URL to BigCommerce
	* Navigate to [https://devtools.bigcommerce.com](https://devtools.bigcommerce.com/) and log into your BigCommerce account
	* If necessary, log in with your store owner account.
	* Click the Edit App button
	* Navigate to the Technical tab then enter the Uninstall Callback URL
	* Click the Update and Close button

## Usage
### App Installation Flow
To authorize the app to access the BigCommerce API on behalf of a store, install the app in the BigCommerce store:
1.  Log in to your BigCommerce store. If you don’t have one yet, [sign up for a trial](https://www.bigcommerce.com/essentials/). Make sure to use the same email address that you used to register the app at [https://devtools.bigcommerce.com/](https://devtools.bigcommerce.com/). 
2.  Navigate to Apps > My Apps > My Draft Apps
3.  Click your app’s name
4.  Click the Install button, and confirm installation

At this point, BigCommerce creates an iframe in the control panel that sends the Auth request to the Auth Callback URL. The Install component at that route should present the signup form, then initiate signup with Cognito. If you encounter an error, try checking the following places for more information to help you debug:

-   the browser’s JS console
-   CloudWatch logs for the PreSignup Lambda function
-   Consider adding support to run the standalone shell for [react-dev-tools](https://www.npmjs.com/package/react-devtools)
    
The example app requires the user to close the app, then relaunch it. That’s because the successful signup request creates the user record in Cognito, but it does not grant the user the tokens it will need to access the app’s backend later. The app requires a Load request from BigCommerce to initiate the custom auth flow, and grant the tokens. The Load request is triggered when the user clicks the app’s icon in their BigCommerce control panel.

### Custom Auth Flow
1.  Log into the BigCommerce store
2.  Click Apps, then click the App’s icon  
	 * Note: If the app’s icon is not present in the Apps menu, check to ensure the app is installed.  
* At this point, the browser sends the Load Callback request to open the React client in an iframe. The React client should receive the request, and initiate the custom auth flow in Cognito.
* If you receive an error, check the CloudWatch logs for the Define Auth Challenge, Create Auth Challenge, and Verify Auth Challenge Response Lambda functions for more information.

3.  Confirm the UI is rendered
4.  Click the Get Store Information button
* At this point, the React client should use the API.get() method to invoke the app’s API with the identity and access tokens supplied by Cognito. If you receive an error from the API, check the CloudWatch logs for the bcApiClient and bcApiLambda functions.

5.  Confirm the React client receives the store’s information from the BigCommerce API


### Uninstall  Flow

1.  Log in to your store, and navigate to Apps > My Apps
2. Click the Uninstall link for your app
* At this point, BigCommerce will send an uninstall request to the URL you supplied. You can use AWS console to check the user pool in Cognito and the table in DynamoDB to ensure the store’s user and BigCommerce Access Token have been deleted. If they aren’t deleted after uninstalling the app, check the CloudWatch logs for uninstall Lambda. If there are no log streams for the uninstall Lambda, check that the uninstall API’s Invoke URL matches the Uninstall Callback URL provided to BigCommerce.
