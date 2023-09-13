# clarifai-PR

Adds automated AI pull request review using LLM models available via clarifai.com platform (such as llama-2, gpt-4 etc)
Easily installable in your github repo as an external workflow action

## Example usage

```yaml
on: [pull_request]

jobs:
  hello_world_job:
    runs-on: ubuntu-latest
    name: clarifai-pr
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
