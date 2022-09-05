let api = ""; //"http://localhost:6069";

let rasacDocsHost = "https://rasa-codeless.github.io";

export const configs = {
  api: api,  
  rasacDocsHost: `${rasacDocsHost}/`,
  rasacVersion: `1.0.0`,
  rasacGitHub: `https://www.github.com/rasa-codeless/rasac`,

  snackbarVerticalPosition: "bottom",
  snackbarHorizontalPostion: "left",
  getModelListEnpoint: `${api}/api/rasac/config/update`,
  getLatestModelEndpoint: `${api}/api/rasac/model/latest`,
  getModelCurveDatapointsEndpoint: `${api}/api/rasac/model/curve/`,
  getIntentsEndpoint: `${api}/api/rasac/intent`,
  deleteModelEndpoint: `${api}/api/rasac/model/`,
  downloadModelEndpoint: `${api}/api/rasac/download/`,
  trainModelEndpoint: `${api}/api/rasac/config/update`,
  getModelConfigEndpoint: `${api}/api/rasac/model/config/`,
  abortTrainEndpoint: `${api}/api/rasac/config/abort`,
  getModelNamesEndpoint: `${api}/api/rasac/model/all`,
  getIntentStats: `${api}/api/rasac/intent/stats`,
};

export const docLinks = {
  pipelineConfig: `${rasacDocsHost}/dev-console/building/pipeline-config`,
  policyConfig: `${rasacDocsHost}/dev-console/building/policy-config`
}

export const rasac_ascii = `
█▀█ ▄▀█ █▀ ▄▀█ █▀▀
█▀▄ █▀█ ▄█ █▀█ █▄▄
`;


// https://dev.to/rajeshroyal/reactjs-disable-consolelog-in-production-and-staging-3l38
export const GlobalDebug = (function () {
  var savedConsole = console;
  /**
  * @param {boolean} debugOn
  * @param {boolean} suppressAll
  */
  return function (debugOn, suppressAll) {
    var suppress = suppressAll || false;
    if (debugOn === false) {
      // supress the default console functionality
      // eslint-disable-next-line
      console = {};
      console.log = function () { };
      // supress all type of consoles
      if (suppress) {
        console.info = function () { };
        console.warn = function () { };
        console.error = function () { };
      } else {
        console.info = savedConsole.info;
        console.warn = savedConsole.warn;
        console.error = savedConsole.error;
      }
    } else {
      // eslint-disable-next-line
      console = savedConsole;
    }
  };
})();
