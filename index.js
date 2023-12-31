import * as core from '@actions/core'
import fetch from 'node-fetch';
import {graphql} from "@octokit/graphql";
import fs from 'fs'

async function reviewPR() {
    try {
        let RAW_TEXT = `Act as an expert software engineer reviewing code. 
        You need to find errors and suggest a fix. Prefix errors with 🔴 as importance symbol. 
        Prefix performance issues with 🟠 importance symbol.
        Prefix naming and code inconsistencies with 🟡 importance symbol.
        Prefix improvements with 🟢 importance symbol.
        Format your output as github markdown table with columns: importance, file path, line number(s) and comment.`

        const gitDiff = fs.readFileSync('diff-file', { encoding: 'utf8', flag: 'r' });
        console.log('git diff:', gitDiff);

        RAW_TEXT += `Here is a git diff for changes: ${gitDiff}\n\n`

        const ctx = {
            owner: process.env.PR_OWNER,
            repo: process.env.PR_REPO,
            pull_number: process.env.PR_NUMBER,
        }
        console.log("Using this data for PR check", ctx)

        if (!process.env.PR_NUMBER) {
            core.setFailed("No PR number detected. Wrong event type?");
            return
        }


        let data = await graphql({
            query: `query ($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      id
      headRefName
      headRefOid
      mergeable
      reviewDecision
      state
      title
      body
      baseRefOid
      commits(last: 1) {
        edges {
          node {
            commit {
              message
              tree {
                entries {
                  path
                  object {
                    ... on Blob {
                      id
                      text
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`,
            owner: ctx.owner,
            repo: ctx.repo.replace(ctx.owner + '/', ''),
            pr: parseInt(ctx.pull_number, 10),
            headers: {
                authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        });

        console.log("Received this PR data:", data);

        const PAT = process.env.CLARIFAI_PAT;
        const USER_ID = process.env.CLARIFAI_USER_ID;
        const APP_ID = process.env.CLARIFAI_APP_ID;
        const MODEL_ID = process.env.CLARIFAI_MODEL_ID;

        const pr_title = data.repository.pullRequest.title
        const pr_descr = data.repository.pullRequest.body
        RAW_TEXT += `This pull request was titled "${pr_title} and had a description "${pr_descr}".\n`;

        const commit_msg = data.repository.pullRequest.commits.edges[0].node.commit.message
        RAW_TEXT += `Last commit message was "${commit_msg}".\n`

        // for (let msg of data.repository.pullRequest.commits.edges[0].node.commit.tree.entries) {
        //     if (msg.object?.text) {
        //         RAW_TEXT += `\nFile "${msg.path}" contents: \n\n ${msg.object.text.substring(0, 10000)}`
        //     }
        // }

        console.log("Sending:" + RAW_TEXT)

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
        let clarifaiData = await response.json()

        if (clarifaiData?.status?.code != 10000) {
            console.error("Unexpected response code", clarifaiData.status);
            return
        }

        console.log("clarifai response:", clarifaiData)
        const clarifaiResponse = clarifaiData['outputs'][0]['data']['text']['raw']

        const clientName = 'clarifai-pr-bot'

        await graphql(`
  mutation AddComment($pr: ID!, $body: String!, $client: String) {
    addComment(input: { subjectId: $pr, body: $body, clientMutationId: $client }) {
      clientMutationId
    }
  }
`, {
            body: clarifaiResponse,
            owner: ctx.owner,
            repo: ctx.repo.replace(ctx.owner + '/', ''),
            pr: data.repository.pullRequest.id,
            client: clientName,
            headers: {
                authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        })

    } catch (error) {
        console.error(error.message)
        console.error(error.stack)
        core.setFailed(error.message);
    }
}

reviewPR()