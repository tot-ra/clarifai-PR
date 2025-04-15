# 🌀 clarifai-PR

Adds automated AI pull request review using LLM models available via clarifai.com platform (such as llama-2, gpt-4 etc)
Easily installable in your github repo as an external workflow action

## Example usage

```yaml
on: [pull_request]

jobs:
  clarifai-pr:
    runs-on: ubuntu-latest
    name: Clarifai review
    permissions:
      pull-requests: write
    steps:
      - name: Review pull request code with clarifai.com
        uses: tot-ra/clarifai-PR@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CLARIFAI_PAT: ${{ secrets.CLARIFAI_PAT }}
          CLARIFAI_USER_ID: ${{ secrets.CLARIFAI_USER_ID }}
          CLARIFAI_APP_ID: ${{ secrets.CLARIFAI_APP_ID }}
          CLARIFAI_MODEL_ID: 'GPT-4'
```

You need to set `CLARIFAI_` - prefixed secrets from https://clarifai.com in your repository or org settings ( https://github.com/org/repo/settings/secrets/actions )


## Example of comment you may receive:

| Importance | File Path | Line Number(s) | Comment |
| --- | --- | --- | --- |
| 🔴 | src/workers/darknet.ts | 177-179 |Removed the newly added lines, causing a division by zero error.|
| 🔵 | src/workers/darknet.ts | Various | Refactor to use `Promise.all()` or a similar method to allow for concurrent processing of multiple files. This will lead to a significant performance improvement, especially so when dealing with larger numbers of files. |
| 🔵 | src/workers/darknet.ts | Various | It is recommended to use try-catch with async-await in order to improve error handling. |
| 🔵 | src/workers/darknet.ts | Various | It can be improved to use JSDoc comments for better code readability and tooling. This would include to functions with comments briefly explaining what they're doing and their parameters. |
| 🟠 | src/workers/darknet.ts | 152 | Each time we read a file using `fs.readFileSync()`, this operation blocks the entire thread until it finishes. This could be mitigated by considering using `fs.promises.readFile()`, which is asynchronous and returns a promise. |

## Privacy
Note that this github action code accesses your code once you install it on specific events and passes your code to clarifai.com and LLM models for analysis
