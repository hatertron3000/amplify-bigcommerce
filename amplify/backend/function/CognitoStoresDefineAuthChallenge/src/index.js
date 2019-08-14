/*
  this file will loop through all js modules which are uploaded to the lambda resource,
  provided that the file names (without extension) are included in the "MODULES" env variable.
  "MODULES" is a comma-delimmited string.
*/

exports.handler = (event, context, callback) => {
  if (event.request.session.length == 0) {
    event.response.issueTokens = false
    event.response.failAuthentication = false
    event.response.challengeName = 'CUSTOM_CHALLENGE'
  } else if (event.request.session.length == 1 && event.request.session[0].challengeName == 'CUSTOM_CHALLENGE' && event.request.session[0].challengeResult == true) {
    event.response.issueTokens = true
    event.response.failAuthentication = false
  } else {
    event.response.issueTokens = false
    event.response.failAuthentication = true
  }
  callback(null, event)
}
