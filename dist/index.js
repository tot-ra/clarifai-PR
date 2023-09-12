/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 377:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 833:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(377);
const github = __nccwpck_require__(833);

async function reviewPR() {
    try {
        const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
        const {data: pullRequest} = await octokit.rest.pulls.get({
            owner: process.env.PR_OWNER,
            repo: process.env.PR_REPO,
            pull_number: process.env.PR_NUMBER,
            mediaType: {
                format: 'diff'
            }
        });

        console.log({pullRequest});

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
})();

module.exports = __webpack_exports__;
/******/ })()
;