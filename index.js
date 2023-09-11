const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}

//
//
// ////////////////////////////////////////////////////////////////////////////////////////////////////
// // In this section, we set the user authentication, user and app ID, model details, and the URL
// // of the text we want as an input. Change these strings to run your own example.
// ///////////////////////////////////////////////////////////////////////////////////////////////////
//
// // Your PAT (Personal Access Token) can be found in the portal under Authentification
// const PAT = 'YOUR_PAT_HERE';
// // Specify the correct user_id/app_id pairings
// // Since you're making inferences outside your app's scope
// const USER_ID = 'meta';
// const APP_ID = 'Llama-2';
// // Change these to whatever model and text URL you want to use
// const MODEL_ID = 'llama2-70b-chat';
// const MODEL_VERSION_ID = '6c27e86364ba461d98de95cddc559cb3';
// const RAW_TEXT = 'I love your product very much';
// // To use a hosted text file, assign the url variable
// // const TEXT_FILE_URL = 'https://samples.clarifai.com/negative_sentence_12.txt';
// // Or, to use a local text file, assign the url variable
// // const TEXT_FILE_BYTES = 'YOUR_TEXT_FILE_BYTES_HERE';
//
// ///////////////////////////////////////////////////////////////////////////////////
// // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
// ///////////////////////////////////////////////////////////////////////////////////
//
// const raw = JSON.stringify({
//     "user_app_id": {
//         "user_id": USER_ID,
//         "app_id": APP_ID
//     },
//     "inputs": [
//         {
//             "data": {
//                 "text": {
//                     "raw": RAW_TEXT
//                     // url: TEXT_URL, allow_duplicate_url: true
//                     // raw: fileBytes
//                 }
//             }
//         }
//     ]
// });
//
// const requestOptions = {
//     method: 'POST',
//     headers: {
//         'Accept': 'application/json',
//         'Authorization': 'Key ' + PAT
//     },
//     body: raw
// };
//
// // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
// // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
// // this will default to the latest version_id
//
// fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
//     .then((response) => {
//         return response.json();
//     })
//     .then((data) => {
//         if(data.status.code != 10000) console.log(data.status);
//         else console.log(data['outputs'][0]['data']['text']['raw']);
//     }).catch(error => console.log('error', error));
