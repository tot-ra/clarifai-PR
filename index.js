import core from '@actions/core';
import github from '@actions/github';
import fetch from 'node-fetch';

async function reviewPR() {
    try {
        const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

        const ctx = {
            owner: process.env.PR_OWNER,
            repo: process.env.PR_REPO,
            pull_number: process.env.PR_NUMBER,
        }
        console.log("Using this data for PR check", ctx)

        if(!process.env.PR_NUMBER){
            core.setFailed("No PR number detected. Wrong event type?");
            return
        }

        const {data: pullRequest} = await octokit.rest.pulls.get({
            ...ctx,
            mediaType: {
                format: 'diff'
            }
        });

        console.log("Received this PR data:", pullRequest);

    } catch (error) {
        console.error("Failed at getting PR data")
        core.setFailed(error.message);
        return
    }

    try{
        // `who-to-greet` input defined in action metadata file
        // const nameToGreet = core.getInput('who-to-greet');
        // console.log(`Hello ${nameToGreet}!`);
        // const time = (new Date()).toTimeString();
        // core.setOutput("time", time);
        // // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2)
        // console.log(`The event payload: ${payload}`);


        const PAT = process.env.CLARIFAI_PAT;
        const USER_ID = process.env.CLARIFAI_USER_ID;
        const APP_ID = process.env.CLARIFAI_APP_ID;
        const MODEL_ID = process.env.CLARIFAI_MODEL_ID;
        const RAW_TEXT = 'What is the capital of Estonia?';

        const raw = JSON.stringify({
            "user_app_id": {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            "inputs": [
                {
                    "data": {
                        "text": {
                            "raw": RAW_TEXT
                            // url: TEXT_URL, allow_duplicate_url: true
                            // raw: fileBytes
                        }
                    }
                }
            ]
        });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Key ' + PAT
            },
            body: raw
        };

        const response = await fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/outputs", requestOptions)
        const data = await response.json()

        if (data?.status?.code != 10000) {
            console.error("Unexpected response code", data.status);
            return
        }

        const clarifaiResponse = data['outputs'][0]['data']['text']['raw']
        console.log({
            clarifaiResponse
        })

    } catch (error) {
        core.setFailed(error.message);
    }
}

reviewPR()