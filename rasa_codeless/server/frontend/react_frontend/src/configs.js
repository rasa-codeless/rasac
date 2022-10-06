let api = "http://localhost:6069"; //"http://localhost:6069";

let rasacDocsHost = "https://rasa-codeless.github.io";

export const configs = {
  api: api,  

  rasacDocsHost: `${rasacDocsHost}/`,
  rasacGitHub: `https://www.github.com/rasa-codeless/rasac`,

  trainModelEndpoint: `${api}/api/rasac/bot/train`,
  abortTrainEndpoint: `${api}/api/rasac/bot/abort`,
  getModelListEnpoint: `${api}/api/rasac/botstore/models`,
  getModelCurveDatapointsEndpoint: `${api}/api/rasac/botstore/curve/`,
  getModelConfigEndpoint: `${api}/api/rasac/botstore/config/`,
  downloadModelEndpoint: `${api}/api/rasac/botstore/models/`,
  deleteModelEndpoint: `${api}/api/rasac/botstore/models/`,
  nluDataEndpoint: `${api}/api/rasac/botstore/nlu/`,
  
  snackbarVerticalPosition: "bottom",
  snackbarHorizontalPostion: "left",
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
