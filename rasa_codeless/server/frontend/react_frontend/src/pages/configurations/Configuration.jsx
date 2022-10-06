// material
import { Box, Grid, Container, Typography, Card, Stack } from "@mui/material";

// for the tokenizer radio
import * as React from "react";
import { useEffect } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { LoadingButton } from "@mui/lab";

// for the featurizer checkboxes
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";

import axios from "axios";

import "./Configuration.css";
import AppTile from "../../components/pageBanner/AppTile";
import { Cancel, ModelTraining, RestartAlt } from "@mui/icons-material";
import { configs, docLinks } from "../../configs";
import { v4 as uuidv4 } from "uuid";
import ConfigurationsPageTitle from "../../components/pageTitle/ConfigurationsPageTitle";

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

// const fs = require('fs');
// const YAML = require('json-to-pretty-yaml');

const yaml = require("js-yaml");

// ----------------------------------------------------------------------

export default function Configurations({
  appConfigs,
  showAppNotification,
  hideAppNotification,
  scrollToTop,
  setActiveLink,
  appSinhala,
}) {
  // PIPELINE
  // used to check whether to display a component or not
  // const [languageModelValue, setLanguageModelValue] = React.useState("MitieNLP");
  const [languageModelValues, setLanguageModelValues] = React.useState({
    mitieLM: false,
    spacyLM: false,
  });
  const [tokenizerValue, setTokenizerValue] = React.useState(
    "WhitespaceTokenizer"
  );
  const [tokenMappingValue, setTokenMappingValue] = React.useState(false);
  const [featurizerValues, setFeaturizerValues] = React.useState({
    mitieF: false,
    spacyF: false,
    convertF: false,
    languageModelF: false,
    regexF: false,
    countVectorsF: false,
    lexicalSyntacticF: false,
    gensimF: false,
  });
  const [classifierValues, setClassifierValues] = React.useState({
    mitieC: false,
    logisticC: false,
    skLearnC: false,
    keywordC: false,
    dietC: false,
    fallbackC: false,
  });
  const [extractorValues, setExtractorValues] = React.useState({
    mitieE: false,
    spacyE: false,
    crfE: false,
    ducklingE: false,
    regexE: false,
    entityE: false,
  });

  const regexFeaturizerMinNumOfPatterns = 10;

  const countVectorsFeaturizerMinNGramValue = 1;
  const countVectorsFeaturizerMaxNGramValue = 1;

  const countVectorsFeaturizerMinTextSize = 1000;
  const countVectorsFeaturizerMinResponseSize = 1000;
  const countVectorsFeaturizerMinActionTextSize = 1000;

  const gensimFeaturizerCacheDirDefaultValue = "path/to/cache";
  const gensimFeaturizerFileDefaultValue = "wordvectors.kv";

  const logisticRegressionClassifierMaxIterValue = 1;
  const logisticRegressionClassifierMinTol = 0;
  const logisticRegressionClassifierMinRandomState = 1;

  const sklearnIntentClassifierMinC = 1;
  const sklearnIntentClassifierMinMaxFolds = 1;

  const DIETClassifierMinEpochs = 1;

  const fallbackClassifierMinThreshold = 0.1;
  const fallbackClassifierMaxThreshold = 1.0;

  const CRFEntityExtractorMinMaxIterations = 1;
  const CRFEntityExtractorMinL1 = 0.0;
  const CRFEntityExtractorMaxL1 = 1.0;
  const CRFEntityExtractorMinL2 = 0.0;
  const CRFEntityExtractorMaxL2 = 1.0;

  const ducklingEntityExtractorURL = "http://localhost:";

  const ducklingEntityExtractorMinPortNo = 1024;
  const ducklingEntityExtractorMaxPortNo = 65535;

  const ducklingEntityExtractorMinTimeout = 1;

  let JSObjectPipeline;
  let JSObjectPolicies;

  const [formError, setFormError] = React.useState(false);

  // LANGUAGE MODELS - State
  // select options state for MitieNLP
  const [mitieNLPModelPath, setMitieNLPModelPath] = React.useState("");

  // select options state for MitieNLP
  const [spacyNLPModelLang, setSpacyNLPModelLang] =
    React.useState("en_core_web_sm");
  const [spacyNLPCaseSensitive, setSpacyNLPCaseSensitive] =
    React.useState(false);

  // TOKENIZERS - State
  // select options state for WhitespaceTokenizer
  const [whitespaceTokenizerFlag, setWhitespaceTokenizerFlag] =
    React.useState(false);
  const [whitespaceTokenizerSplitSymbol, setWhitespaceTokenizerSplitSymbol] =
    React.useState("_");
  const [whitespaceTokenizerTokenPattern, setWhitespaceTokenizerTokenPattern] =
    React.useState(" ");

  // select options state for JiebaTokenizer
  // need to initialise dictionary path state
  const [jiebaTokenizerFlag, setJiebaTokenizerFlag] = React.useState(false);
  const [jiebaTokenizerSplitSymbol, setJiebaTokenizerSplitSymbol] =
    React.useState("_");
  const [jiebaTokenizerTokenPattern, setJiebaTokenizerTokenPattern] =
    React.useState(" ");

  // select options state for MitieTokenizer
  const [mitieTokenizerFlag, setMitieTokenizerFlag] = React.useState(false);
  const [mitieTokenizerSplitSymbol, setMitieTokenizerSplitSymbol] =
    React.useState("_");
  const [mitieTokenizerTokenPattern, setMitieTokenizerTokenPattern] =
    React.useState(" ");

  // select options state for SpacyTokenizer
  const [spacyTokenizerFlag, setSpacyTokenizerFlag] = React.useState(false);
  const [spacyTokenizerSplitSymbol, setSpacyTokenizerSplitSymbol] =
    React.useState("_");
  const [spacyTokenizerTokenPattern, setSpacyTokenizerTokenPattern] =
    React.useState(" ");

  // select options state for SEETMTokenizer
  // NEED TO BE IMPLEMENTED

  // FEATURIZERS - State
  // select options state for MitieFeaturizer
  const [mitieFeaturizerPooling, setMitieFeaturizerPooling] =
    React.useState("mean");

  // select options state for SpacyFeaturizer
  const [spacyFeaturizerPooling, setSpacyFeaturizerPooling] =
    React.useState("mean");

  // select options state for ConveRTFeaturizer
  const [conveRTFeaturizerModelUrl, setConveRTFeaturizerModelUrl] =
    React.useState("");

  // select options state for LanguageModelFeaturizer
  const [
    languageModelFeaturizerModelName,
    setLanguageModelFeaturizerModelName,
  ] = React.useState("bert");
  const [
    languageModelFeaturizerModelWeight,
    setLanguageModelFeaturizerModelWeight,
  ] = React.useState("rasa/LaBSE");
  // THIS NEEDS TO BE NULL NOT A STRING
  const [languageModelFeaturizerCacheDir, setLanguageModelFeaturizerCacheDir] =
    React.useState("null");

  // select options state for RegexFeaturizer
  const [regexFeaturizerCaseSensitive, setRegexFeaturizerCaseSensitive] =
    React.useState(true);
  const [regexFeaturizerWordBoundaries, setRegexFeaturizerWordBoundaries] =
    React.useState(true);
  const [regexFeaturizerNumOfPatterns, setRegexFeaturizerNumOfPatterns] =
    React.useState(10);
  const [
    regexFeaturizerHidePatternsTextField,
    setRegexFeaturizerHidePatternsTextField,
  ] = React.useState(false);
  const [
    regexFeaturizerNumOfPatternsError,
    setRegexFeaturizerNumOfPatternsError,
  ] = React.useState(false);

  // select options state for CountVectorsFeaturizer
  const [countVectorsFeaturizerAnalyzer, setCountVectorsFeaturizerAnalyzer] =
    React.useState("word");
  const [countVectorsFeaturizerMinNGram, setCountVectorsFeaturizerMinNGram] =
    React.useState(1);
  const [
    countVectorsFeaturizerMinNGramError,
    setCountVectorsFeaturizerMinNGramError,
  ] = React.useState(false);
  const [countVectorsFeaturizerMaxNGram, setCountVectorsFeaturizerMaxNGram] =
    React.useState(1);
  const [
    countVectorsFeaturizerMaxNGramError,
    setCountVectorsFeaturizerMaxNGramError,
  ] = React.useState(false);
  const [countVectorsFeaturizerOOVToken, setCountVectorsFeaturizerOOVToken] =
    React.useState("None");
  const [
    countVectorsFeaturizerSharedVocab,
    setCountVectorsFeaturizerSharedVocab,
  ] = React.useState(false);
  const [countVectorsFeaturizerTextSize, setCountVectorsFeaturizerTextSize] =
    React.useState(1000);
  const [
    countVectorsFeaturizerTextSizeError,
    setCountVectorsFeaturizerTextSizeError,
  ] = React.useState(false);
  const [
    countVectorsFeaturizerResponseSize,
    setCountVectorsFeaturizerResponseSize,
  ] = React.useState(1000);
  const [
    countVectorsFeaturizerResponseSizeError,
    setCountVectorsFeaturizerResponseSizeError,
  ] = React.useState(false);
  const [
    countVectorsFeaturizerActionTextSize,
    setCountVectorsFeaturizerActionTextSize,
  ] = React.useState(1000);
  const [
    countVectorsFeaturizerActionTextSizeError,
    setCountVectorsFeaturizerActionTextSizeError,
  ] = React.useState(false);

  // select options state for LexicalSyntacticFeaturizer
  const [
    lexicalSyntacticFeaturizerBefore,
    setLexicalSyntacticFeaturizerBefore,
  ] = React.useState({
    beforeBOS: false,
    beforeEOS: false,
    beforeLow: true,
    beforeUpper: true,
    beforeTitle: true,
    beforeDigit: false,
    beforePrefix5: false,
    beforePrefix2: false,
    beforeSuffix5: false,
    beforeSuffix3: false,
    beforeSuffix2: false,
    beforeSuffix1: false,
    // using below 2 requires SpacyTokenizer
    beforePos: false,
    beforePos2: false,
  });

  const [
    lexicalSyntacticFeaturizerBeforeCheckedValues,
    setLexicalSyntacticFeaturizerBeforeCheckedValues,
  ] = React.useState(["low", "upper", "title"]);

  const [lexicalSyntacticFeaturizerToken, setLexicalSyntacticFeaturizerToken] =
    React.useState({
      tokenBOS: true,
      tokenEOS: true,
      tokenLow: true,
      tokenUpper: true,
      tokenTitle: true,
      tokenDigit: true,
      tokenPrefix5: false,
      tokenPrefix2: false,
      tokenSuffix5: false,
      tokenSuffix3: false,
      tokenSuffix2: false,
      tokenSuffix1: false,
      // using below 2 requires SpacyTokenizer
      tokenPos: false,
      tokenPos2: false,
    });

  const [
    lexicalSyntacticFeaturizerTokenCheckedValues,
    setLexicalSyntacticFeaturizerTokenCheckedValues,
  ] = React.useState(["BOS", "EOS", "low", "upper", "title", "digit"]);

  const [lexicalSyntacticFeaturizerAfter, setLexicalSyntacticFeaturizerAfter] =
    React.useState({
      afterBOS: false,
      afterEOS: false,
      afterLow: true,
      afterUpper: true,
      afterTitle: true,
      afterDigit: false,
      afterPrefix5: false,
      afterPrefix2: false,
      afterSuffix5: false,
      afterSuffix3: false,
      afterSuffix2: false,
      afterSuffix1: false,
      // using below 2 requires SpacyTokenizer
      afterPos: false,
      afterPos2: false,
    });

  const [
    lexicalSyntacticFeaturizerAfterCheckedValues,
    setLexicalSyntacticFeaturizerAfterCheckedValues,
  ] = React.useState(["low", "upper", "title"]);

  // select options state for GensimFeaturizer
  const [gensimFeaturizerCacheDir, setGensimFeaturizerCacheDir] =
    React.useState("path/to/cache");
  const [gensimFeaturizerHideCacheDir, setGensimFeaturizerHideCacheDir] =
    React.useState(false);
  const [gensimFeaturizerCacheDirError, setGensimFeaturizerCacheDirError] =
    React.useState(false);
  const [gensimFeaturizerFile, setGensimFeaturizerFile] =
    React.useState("filename");
  const [gensimFeaturizerHideFile, setGensimFeaturizerHideFile] =
    React.useState(false);
  const [gensimFeaturizerFileError, setGensimFeaturizerFileError] =
    React.useState(false);

  // select options state for LogisticRegressionClassifier
  const [
    logisticRegressionClassifierMaxIter,
    setLogisticRegressionClassifierMaxIter,
  ] = React.useState(1);
  const [
    logisticRegressionClassifierMaxIterError,
    setLogisticRegressionClassifierMaxIterError,
  ] = React.useState(false);
  const [
    logisticRegressionClassifierSolver,
    setLogisticRegressionClassifierSolver,
  ] = React.useState("lbfgs");
  const [logisticRegressionClassifierTol, setLogisticRegressionClassifierTol] =
    React.useState(0.0001);
  const [
    logisticRegressionClassifierTolError,
    setLogisticRegressionClassifierTolError,
  ] = React.useState(false);
  const [
    logisticRegressionClassifierRandomState,
    setLogisticRegressionClassifierRandomState,
  ] = React.useState(1);
  const [
    logisticRegressionClassifierRandomStateError,
    setLogisticRegressionClassifierRandomStateError,
  ] = React.useState(false);
  const [
    logisticRegressionClassifierHideTextField,
    setLogisticRegressionClassifierHideTextField,
  ] = React.useState(false);

  // select options state for SklearnIntentClassifier
  const [sklearnIntentClassifierC1, setSklearnIntentClassifierC1] =
    React.useState(1);
  const [sklearnIntentClassifierC1Error, setSklearnIntentClassifierC1Error] =
    React.useState(false);
  const [sklearnIntentClassifierC2, setSklearnIntentClassifierC2] =
    React.useState(2);
  const [sklearnIntentClassifierC2Error, setSklearnIntentClassifierC2Error] =
    React.useState(false);
  const [sklearnIntentClassifierC3, setSklearnIntentClassifierC3] =
    React.useState(5);
  const [sklearnIntentClassifierC3Error, setSklearnIntentClassifierC3Error] =
    React.useState(false);
  const [sklearnIntentClassifierC4, setSklearnIntentClassifierC4] =
    React.useState(10);
  const [sklearnIntentClassifierC4Error, setSklearnIntentClassifierC4Error] =
    React.useState(false);
  const [sklearnIntentClassifierC5, setSklearnIntentClassifierC5] =
    React.useState(20);
  const [sklearnIntentClassifierC5Error, setSklearnIntentClassifierC5Error] =
    React.useState(false);
  const [sklearnIntentClassifierC6, setSklearnIntentClassifierC6] =
    React.useState(100);
  const [sklearnIntentClassifierC6Error, setSklearnIntentClassifierC6Error] =
    React.useState(false);
  const [sklearnIntentClassifierKernels, setSklearnIntentClassifierKernels] =
    React.useState("linear");
  const [sklearnIntentClassifierGamma, setSklearnIntentClassifierGamma] =
    React.useState(0.1);
  const [
    sklearnIntentClassifierGammaError,
    setSklearnIntentClassifierGammaError,
  ] = React.useState(false);
  const [sklearnIntentClassifierMaxFolds, setSklearnIntentClassifierMaxFolds] =
    React.useState(5);
  const [
    sklearnIntentClassifierMaxFoldsError,
    setSklearnIntentClassifierMaxFoldsError,
  ] = React.useState(false);
  const [
    sklearnIntentClassifierScoringFunc,
    setSklearnIntentClassifierScoringFunc,
  ] = React.useState("f1_weighted");

  // select options state for KeywordIntentClassifier
  const [
    keywordIntentClassifierCaseSensitive,
    setKeywordIntentClassifierCaseSensitive,
  ] = React.useState(true);

  // select options state for DIETClassifier
  const [DIETClassifierEpochs, setDIETClassifierEpochs] = React.useState(300);
  const [DIETClassifierEpochsError, setDIETClassifierEpochsError] =
    React.useState(false);
  const [DIETClassifierEntityRecognition, setDIETClassifierEntityRecognition] =
    React.useState(true);
  const [
    DIETClassifierIntentClassification,
    setDIETClassifierIntentClassification,
  ] = React.useState(true);

  // select options state for FallbackClassifier
  const [fallbackClassifierThreshold, setFallbackClassifierThreshold] =
    React.useState(0.7);
  const [
    fallbackClassifierThresholdError,
    setFallbackClassifierThresholdError,
  ] = React.useState(false);

  // select options state for SpacyEntityExtractor
  const [spacyEntityExtractorDimensions, setSpacyEntityExtractorDimensions] =
    React.useState({
      person: false,
      loc: true,
      org: false,
      product: false,
    });

  const [
    spacyEntityExtractorDimensionsCheckedValues,
    setSpacyEntityExtractorDimensionsCheckedValues,
  ] = React.useState(["LOC"]);

  // select options state for CRFEntityExtractor
  const [CRFEntityExtractorFlag, setCRFEntityExtractorFlag] =
    React.useState(true);

  const [CRFEntityExtractorBefore, setCRFEntityExtractorBefore] =
    React.useState({
      CRFEntityExtractorBeforeLow: true,
      CRFEntityExtractorBeforeUpper: true,
      CRFEntityExtractorBeforeTitle: true,
      CRFEntityExtractorBeforeDigit: false,
      CRFEntityExtractorBeforePrefix5: false,
      CRFEntityExtractorBeforePrefix2: false,
      CRFEntityExtractorBeforeSuffix5: false,
      CRFEntityExtractorBeforeSuffix3: false,
      CRFEntityExtractorBeforeSuffix2: false,
      CRFEntityExtractorBeforeSuffix1: false,
      // using below 2 requires SpacyTokenizer
      CRFEntityExtractorBeforePos: false,
      CRFEntityExtractorBeforePos2: false,
      // using below feature requires RegexFeaturizer
      CRFEntityExtractorBeforePattern: false,
      // using below feature requires LanguageModelFeaturizer
      CRFEntityExtractorBeforeBias: false,
      CRFEntityExtractorBeforeTextDenseFeatures: false,
    });

  const [
    CRFEntityExtractorBeforeCheckedValues,
    setCRFEntityExtractorBeforeCheckedValues,
  ] = React.useState(["low", "upper", "title"]);

  const [CRFEntityExtractorToken, setCRFEntityExtractorToken] = React.useState({
    CRFEntityExtractorTokenLow: true,
    CRFEntityExtractorTokenUpper: true,
    CRFEntityExtractorTokenTitle: true,
    CRFEntityExtractorTokenDigit: false,
    CRFEntityExtractorTokenPrefix5: false,
    CRFEntityExtractorTokenPrefix2: false,
    CRFEntityExtractorTokenSuffix5: false,
    CRFEntityExtractorTokenSuffix3: false,
    CRFEntityExtractorTokenSuffix2: false,
    CRFEntityExtractorTokenSuffix1: false,
    // using below 2 requires SpacyTokenizer
    CRFEntityExtractorTokenPos: false,
    CRFEntityExtractorTokenPos2: false,
    // using below feature requires RegexFeaturizer
    CRFEntityExtractorTokenPattern: false,
    // using below feature requires LanguageModelFeaturizer
    CRFEntityExtractorTokenBias: false,
    CRFEntityExtractorTokenTextDenseFeatures: false,
  });

  const [
    CRFEntityExtractorTokenCheckedValues,
    setCRFEntityExtractorTokenCheckedValues,
  ] = React.useState(["low", "upper", "title"]);

  const [CRFEntityExtractorAfter, setCRFEntityExtractorAfter] = React.useState({
    CRFEntityExtractorAfterLow: true,
    CRFEntityExtractorAfterUpper: true,
    CRFEntityExtractorAfterTitle: true,
    CRFEntityExtractorAfterDigit: false,
    CRFEntityExtractorAfterPrefix5: false,
    CRFEntityExtractorAfterPrefix2: false,
    CRFEntityExtractorAfterSuffix5: false,
    CRFEntityExtractorAfterSuffix3: false,
    CRFEntityExtractorAfterSuffix2: false,
    CRFEntityExtractorAfterSuffix1: false,
    // using below 2 requires SpacyTokenizer
    CRFEntityExtractorAfterPos: false,
    CRFEntityExtractorAfterPos2: false,
    // using below feature requires RegexFeaturizer
    CRFEntityExtractorAfterPattern: false,
    // using below feature requires LanguageModelFeaturizer
    CRFEntityExtractorAfterBias: false,
    CRFEntityExtractorAfterTextDenseFeatures: false,
  });

  const [
    CRFEntityExtractorAfterCheckedValues,
    setCRFEntityExtractorAfterCheckedValues,
  ] = React.useState(["low", "upper", "title"]);

  const [CRFEntityExtractorMaxIterations, setCRFEntityExtractorMaxIterations] =
    React.useState(50);
  const [
    CRFEntityExtractorMaxIterationsError,
    setCRFEntityExtractorMaxIterationsError,
  ] = React.useState(false);
  const [CRFEntityExtractorL1, setCRFEntityExtractorL1] = React.useState(0.1);
  const [CRFEntityExtractorL1Error, setCRFEntityExtractorL1Error] =
    React.useState(false);
  const [CRFEntityExtractorL2, setCRFEntityExtractorL2] = React.useState(0.1);
  const [CRFEntityExtractorL2Error, setCRFEntityExtractorL2Error] =
    React.useState(false);
  const [CRFEntityExtractorSplitAddress, setCRFEntityExtractorSplitAddress] =
    React.useState(false);
  const [CRFEntityExtractorSplitEmail, setCRFEntityExtractorSplitEmail] =
    React.useState(true);

  // select options state for DucklingEntityExtractor
  const [ducklingEntityExtractorPortNo, setDucklingEntityExtractorPortNo] =
    React.useState(8080);

  const [
    ducklingEntityExtractorDimensions,
    setDucklingEntityExtractorDimensions,
  ] = React.useState({
    ducklingEntityExtractorTime: true,
    ducklingEntityExtractorNumber: true,
    ducklingEntityExtractorMoney: true,
    ducklingEntityExtractorDistance: true,
  });

  const [
    ducklingEntityExtractorDimensionsCheckedValues,
    setDucklingEntityExtractorDimensionsCheckedValues,
  ] = React.useState(["time", "number", "amount-of-money", "distance"]);

  const [ducklingEntityExtractorTimeout, setDucklingEntityExtractorTimeout] =
    React.useState(3);

  // select options state for RegexEntityExtractor
  const [
    regexEntityExtractorCaseSensitive,
    setRegexEntityExtractorCaseSensitive,
  ] = React.useState(false);
  const [
    regexEntityExtractorLookupTables,
    setRegexEntityExtractorLookupTables,
  ] = React.useState(true);
  const [regexEntityExtractorRegexes, setRegexEntityExtractorRegexes] =
    React.useState(true);
  const [
    regexEntityExtractorWordBoundaries,
    setRegexEntityExtractorWordBoundaries,
  ] = React.useState(true);

  // POLICIES
  // used to check whether to display a component or not
  const [policyValues, setPolicyValues] = React.useState({
    tedP: false,
    unexpectedP: false,
    memoizationP: false,
    augmentedMP: false,
    ruleP: false,
  });

  // POLICIES - State
  // select options state for TEDPolicy
  const [TEDPolicyEpochs, setTEDPolicyEpochs] = React.useState(300);
  const [TEDPolicyEpochsError, setTEDPolicyEpochsError] = React.useState(false);
  const [TEDPolicyMaxHistory, setTEDPolicyMaxHistory] = React.useState(8);
  const [TEDPolicyMaxHistoryError, setTEDPolicyMaxHistoryError] =
    React.useState(false);
  const [TEDPolicySplitByComma, setTEDPolicySplitByComma] =
    React.useState(true);
  const [TEDPolicyConstrainSimilarities, setTEDPolicyConstrainSimilarities] =
    React.useState(true);

  // select options state for UnexpecTEDIntentPolicy
  const [unexpecTEDIntentPolicyEpochs, setUnexpecTEDIntentPolicyEpochs] =
    React.useState(200);
  const [
    unexpecTEDIntentPolicyEpochsError,
    setUnexpecTEDIntentPolicyEpochsError,
  ] = React.useState(false);
  const [
    unexpecTEDIntentPolicyMaxHistory,
    setUnexpecTEDIntentPolicyMaxHistory,
  ] = React.useState(8);
  const [
    unexpecTEDIntentPolicyMaxHistoryError,
    setUnexpecTEDIntentPolicyMaxHistoryError,
  ] = React.useState(false);

  // select options state for MemoizationPolicy
  const [memoizationPolicyMaxHistory, setMemoizationPolicyMaxHistory] =
    React.useState(3);
  const [
    memoizationPolicyMaxHistoryError,
    setMemoizationPolicyMaxHistoryError,
  ] = React.useState(false);

  // select options state for AugmentedMemoizationPolicy
  const [
    augmentedMemoizationPolicyMaxHistory,
    setAugmentedMemoizationPolicyMaxHistory,
  ] = React.useState(3);
  const [
    augmentedMemoizationPolicyMaxHistoryError,
    setAugmentedMemoizationPolicyMaxHistoryError,
  ] = React.useState(false);

  // select options state for RulePolicy
  const [rulePolicyThreshold, setRulePolicyThreshold] = React.useState(0.3);
  const [rulePolicyThresholdError, setRulePolicyThresholdError] =
    React.useState(false);
  const [rulePolicyEnablePrediction, setRulePolicyEnablePrediction] =
    React.useState(true);
  const [rulePolicyRestrictRules, setRulePolicyRestrictRules] =
    React.useState(true);
  const [rulePolicyCheckContradictions, setRulePolicyCheckContradictions] =
    React.useState(true);

  // array to save trained models
  const [trainModels, setTrainModels] = React.useState([]);

  // PIPELINE - Change
  // used to handle change on whether to display a component or not

  // const handleLanguageModelChange = (event) => {
  //   setLanguageModelValue(event.target.value);
  // };

  // for loading icon when training
  const [modelTrainLoading, setModelTrainLoading] = React.useState(false);
  const [cancelTraining, setCancelTraining] = React.useState(false);
  const [openTraingModelSuccessAlert, setOpenTraingModelSuccessAlert] =
    React.useState(false);
  const [openTraingModelFailAlert, setOpenTraingModelFailAlert] =
    React.useState(false);
  const [
    openCancelTraingModelSuccessAlert,
    setOpenCancelTraingModelSuccessAlert,
  ] = React.useState(false);
  const [openCancelTraingModelFailAlert, setOpenCancelTraingModelFailAlert] =
    React.useState(false);
  const [openSpacyTokenizerAlert, setOpenSpacyTokenizerAlert] =
    React.useState(false);
  const [openSpacyFeaturizerAlert, setOpenSpacyFeaturizerAlert] =
    React.useState(false);
  const [openSpacyEntityExtractorAlert, setOpenSpacyEntityExtractorAlert] =
    React.useState(false);
  const [
    openSpacyFeaturizerTokenizerAlert,
    setOpenSpacyFeaturizerTokenizerAlert,
  ] = React.useState(false);
  const [openFormNotSubmittedAlert, setOpenFormNotSubmittedAlert] =
    React.useState(false);
  const [openModelConfigFailAlert, setOpenModelConfigFailAlert] =
    React.useState(false);
  const [openUnknownModelFailAlert, setOpenUnknownModelFailAlert] =
    React.useState(false);
  const [openSetConfigFailAlert, setOpenSetConfigFailAlert] =
    React.useState(false);

  const [modelNamesConfig, setModelNamesConfig] = React.useState([]);
  const [chosenModel, setChosenModel] = React.useState("custom_settings");

  const [requestId, setRequestId] = React.useState("");

  const [loadingSetConfig, setLoadingSetConfig] = React.useState(false);

  // handle chnage for chosenModel
  const handleChosenModelChange = async (event) => {
    setLoadingSetConfig(true);

    if (event.target.value === "custom_settings") {
      await setPipelineValuesToFalse();
      await setPolicyValuesToFalse();
    } else {
      await setConfigs(event.target.value);
    }
    await setChosenModel(event.target.value);

    setLoadingSetConfig(false);
  };

  const handleLanguageModelChange = (event) => {
    setLanguageModelValues({
      ...languageModelValues,
      [event.target.name]: event.target.checked,
    });
  };

  const handleTokenizerChange = (event) => {
    setTokenizerValue(event.target.value);
  };

  const handleTokenMappingChange = (event) => {
    setTokenMappingValue(event.target.checked);
    setTokenizerValue(
      event.target.checked ? "SEETMTokenizer" : "WhitespaceTokenizer"
    );
  };

  const handleFeaturizerChange = (event) => {
    setFeaturizerValues({
      ...featurizerValues,
      [event.target.name]: event.target.checked,
    });
  };

  const handleClassifierChange = (event) => {
    setClassifierValues({
      ...classifierValues,
      [event.target.name]: event.target.checked,
    });
  };

  const handleExtractorChange = (event) => {
    setExtractorValues({
      ...extractorValues,
      [event.target.name]: event.target.checked,
    });
  };

  // LANGUAGE MODEL - handleChange
  // handle chnage for MitieNLPModel
  const handleMitieNLPModelPathChange = (event) => {
    setMitieNLPModelPath(event.target.value);
  };

  // handle chnage for MitieNLPModel
  const handleSpacyNLPModelLangChange = (event) => {
    setSpacyNLPModelLang(event.target.value);
  };

  const handleSpacyNLPCaseSensitiveChange = (event) => {
    setSpacyNLPCaseSensitive(event.target.value);
  };

  // TOKENIZERS - handleChange
  // handle chnage for WhitespaceTokenizers
  const handleWhitespaceTokenizerFlagChange = (event) => {
    setWhitespaceTokenizerFlag(event.target.value);
  };

  const handleWhitespaceTokenizerSplitSymbolChange = (event) => {
    setWhitespaceTokenizerSplitSymbol(event.target.value);
  };

  const handleWhitespaceTokenizerTokenPatternChange = (event) => {
    setWhitespaceTokenizerTokenPattern(event.target.value);
  };

  // handle chnage for JiebaTokenizers
  // need to implement handleChange for dictionary path
  const handleJiebaTokenizerFlagChange = (event) => {
    setJiebaTokenizerFlag(event.target.value);
  };

  const handleJiebaTokenizerSplitSymbolChange = (event) => {
    setJiebaTokenizerSplitSymbol(event.target.value);
  };

  const handleJiebaTokenizerTokenPatternChange = (event) => {
    setJiebaTokenizerTokenPattern(event.target.value);
  };

  // handle chnage for MitieTokenizers
  const handleMitieTokenizerFlagChange = (event) => {
    setMitieTokenizerFlag(event.target.value);
  };

  const handleMitieTokenizerSplitSymbolChange = (event) => {
    setMitieTokenizerSplitSymbol(event.target.value);
  };

  const handleMitieTokenizerTokenPatternChange = (event) => {
    setMitieTokenizerTokenPattern(event.target.value);
  };

  // handle chnage for SpacyTokenizers
  const handleSpacyTokenizerFlagChange = (event) => {
    setSpacyTokenizerFlag(event.target.value);
  };

  const handleSpacyTokenizerSplitSymbolChange = (event) => {
    setSpacyTokenizerSplitSymbol(event.target.value);
  };

  const handleSpacyTokenizerTokenPatternChange = (event) => {
    setSpacyTokenizerTokenPattern(event.target.value);
  };

  // handle chnage for SEETMTokenizers
  // NEED TO BE IMPLEMENTED

  // FEATURIZERS - handleChange
  // handle chnage for MitieFeaturizer
  const handleMitieFeaturizerPoolingChange = (event) => {
    setMitieFeaturizerPooling(event.target.value);
  };

  // handle chnage for SpacyFeaturizer
  const handleSpacyFeaturizerPoolingChange = (event) => {
    setSpacyFeaturizerPooling(event.target.value);
  };

  // handle chnage for ConveRTFeaturizer
  const handleConveRTFeaturizerModelUrlChange = (event) => {
    setConveRTFeaturizerModelUrl(event.target.value);
  };

  // handle chnage for languageModelFeaturizer
  const handleLanguageModelFeaturizerModelNameChange = (event) => {
    setLanguageModelFeaturizerModelName(event.target.value);
  };

  const handleLanguageModelFeaturizerModelWeightChange = (event) => {
    setLanguageModelFeaturizerModelWeight(event.target.value);
  };

  const handleLanguageModelFeaturizerCacheDirChange = (event) => {
    setLanguageModelFeaturizerCacheDir(event.target.value);
  };

  // handle chnage for RegexFeaturizer
  const handleRegexFeaturizerCaseSensitiveChange = (event) => {
    setRegexFeaturizerCaseSensitive(event.target.value);
  };

  const handleRegexFeaturizerWordBoundariesChange = (event) => {
    setRegexFeaturizerWordBoundaries(event.target.value);
  };

  const handleRegexFeaturizerNumOfPatternsChange = (event) => {
    setRegexFeaturizerNumOfPatterns(parseInt(event.target.value, 10) || "");

    if (
      featurizerValues.regexF === true &&
      regexFeaturizerHidePatternsTextField === true &&
      event.target.value < 1
    ) {
      setRegexFeaturizerNumOfPatternsError(true);
    } else if (
      featurizerValues.regexF === true &&
      regexFeaturizerHidePatternsTextField === true &&
      event.target.value > 0
    ) {
      setRegexFeaturizerNumOfPatternsError(false);
    } else {
      setRegexFeaturizerNumOfPatternsError(false);
    }
  };

  const handleRegexFeaturizerHidePatternsTextFieldChange = (event) => {
    setRegexFeaturizerHidePatternsTextField(event.target.checked);

    if (event.target.checked === false) {
      setRegexFeaturizerNumOfPatternsError(false);
    }
  };

  // handle chnage for CountVectorsFeaturizer
  const handleCountVectorsFeaturizerAnalyzerChange = (event) => {
    setCountVectorsFeaturizerAnalyzer(event.target.value);
  };

  const handleCountVectorsFeaturizerMinNGramChange = (event) => {
    setCountVectorsFeaturizerMinNGram(parseInt(event.target.value, 10) || "");

    if (
      featurizerValues.countVectorsF === true &&
      event.target.value < countVectorsFeaturizerMinNGramValue
    ) {
      setCountVectorsFeaturizerMinNGramError(true);
    } else {
      setCountVectorsFeaturizerMinNGramError(false);
    }
  };

  const handleCountVectorsFeaturizerMaxNGramChange = (event) => {
    setCountVectorsFeaturizerMaxNGram(parseInt(event.target.value, 10) || "");

    if (
      featurizerValues.countVectorsF === true &&
      event.target.value < countVectorsFeaturizerMaxNGramValue
    ) {
      setCountVectorsFeaturizerMaxNGramError(true);
    } else {
      setCountVectorsFeaturizerMaxNGramError(false);
    }
  };

  const handleCountVectorsFeaturizerOOVTokenChange = (event) => {
    setCountVectorsFeaturizerOOVToken(event.target.value);
  };

  const handleCountVectorsFeaturizerSharedVocabChange = (event) => {
    setCountVectorsFeaturizerSharedVocab(event.target.value);
  };

  const handleCountVectorsFeaturizerTextSizeChange = (event) => {
    setCountVectorsFeaturizerTextSize(parseInt(event.target.value, 10) || "");

    if (
      featurizerValues.countVectorsF === true &&
      event.target.value < countVectorsFeaturizerMinTextSize
    ) {
      setCountVectorsFeaturizerTextSizeError(true);
    } else {
      setCountVectorsFeaturizerTextSizeError(false);
    }
  };

  const handleCountVectorsFeaturizerResponseSizeChange = (event) => {
    setCountVectorsFeaturizerResponseSize(
      parseInt(event.target.value, 10) || ""
    );

    if (
      featurizerValues.countVectorsF === true &&
      event.target.value < countVectorsFeaturizerMinResponseSize
    ) {
      setCountVectorsFeaturizerResponseSizeError(true);
    } else {
      setCountVectorsFeaturizerResponseSizeError(false);
    }
  };

  const handleCountVectorsFeaturizerActionTextSizeChange = (event) => {
    setCountVectorsFeaturizerActionTextSize(
      parseInt(event.target.value, 10) || ""
    );

    if (
      featurizerValues.countVectorsF === true &&
      event.target.value < countVectorsFeaturizerMinActionTextSize
    ) {
      setCountVectorsFeaturizerActionTextSizeError(true);
    } else {
      setCountVectorsFeaturizerActionTextSizeError(false);
    }
  };

  // handle chnage for LexicalSyntacticFeaturizer
  const handleLexicalSyntacticFeaturizerBeforeChange = (event) => {
    setLexicalSyntacticFeaturizerBefore({
      ...lexicalSyntacticFeaturizerBefore,
      [event.target.name]: event.target.checked,
    });

    let newArray = [
      ...lexicalSyntacticFeaturizerBeforeCheckedValues,
      event.target.value,
    ];
    if (
      lexicalSyntacticFeaturizerBeforeCheckedValues.includes(event.target.value)
    ) {
      newArray = newArray.filter((val) => val !== event.target.value);
    }

    setLexicalSyntacticFeaturizerBeforeCheckedValues(newArray);
  };

  const handleLexicalSyntacticFeaturizerTokenChange = (event) => {
    setLexicalSyntacticFeaturizerToken({
      ...lexicalSyntacticFeaturizerToken,
      [event.target.name]: event.target.checked,
    });

    let newArray = [
      ...lexicalSyntacticFeaturizerTokenCheckedValues,
      event.target.value,
    ];
    if (
      lexicalSyntacticFeaturizerTokenCheckedValues.includes(event.target.value)
    ) {
      newArray = newArray.filter((val) => val !== event.target.value);
    }

    setLexicalSyntacticFeaturizerTokenCheckedValues(newArray);
  };

  const handleLexicalSyntacticFeaturizerAfterChange = (event) => {
    setLexicalSyntacticFeaturizerAfter({
      ...lexicalSyntacticFeaturizerAfter,
      [event.target.name]: event.target.checked,
    });

    let newArray = [
      ...lexicalSyntacticFeaturizerAfterCheckedValues,
      event.target.value,
    ];
    if (
      lexicalSyntacticFeaturizerAfterCheckedValues.includes(event.target.value)
    ) {
      newArray = newArray.filter((val) => val !== event.target.value);
    }

    setLexicalSyntacticFeaturizerAfterCheckedValues(newArray);
  };

  // handle chnage for GensimFeaturizer
  const handleGensimFeaturizerCacheDirChange = (event) => {
    setGensimFeaturizerCacheDir(event.target.value);

    if (
      featurizerValues.gensimF === true &&
      gensimFeaturizerHideCacheDir === true &&
      (event.target.value === "" || event.target.value === null)
    ) {
      setGensimFeaturizerCacheDirError(true);
    } else if (
      featurizerValues.gensimF === true &&
      gensimFeaturizerHideCacheDir === true &&
      (event.target.value !== "" || event.target.value !== null)
    ) {
      setGensimFeaturizerCacheDirError(false);
    } else {
      setGensimFeaturizerCacheDirError(false);
    }
  };

  const handleGensimFeaturizerHideCacheDirChange = (event) => {
    setGensimFeaturizerHideCacheDir(event.target.checked);

    if (event.target.checked === false) {
      setGensimFeaturizerCacheDirError(false);
    }
  };

  const handleGensimFeaturizerFileChange = (event) => {
    setGensimFeaturizerFile(event.target.value);

    if (
      featurizerValues.gensimF === true &&
      gensimFeaturizerHideFile === true &&
      (event.target.value === "" || event.target.value === null)
    ) {
      setGensimFeaturizerFileError(true);
    } else if (
      featurizerValues.gensimF === true &&
      gensimFeaturizerHideFile === true &&
      (event.target.value !== "" || event.target.value !== null)
    ) {
      setGensimFeaturizerFileError(false);
    } else {
      setGensimFeaturizerFileError(false);
    }
  };

  const handleGensimFeaturizerHideFileChange = (event) => {
    setGensimFeaturizerHideFile(event.target.checked);

    if (event.target.checked === false) {
      setGensimFeaturizerFileError(false);
    }
  };

  // handle chnage for LogisticRegressionClassifier
  const handleLogisticRegressionClassifierMaxIterChange = (event) => {
    setLogisticRegressionClassifierMaxIter(
      parseInt(event.target.value, 10 || "")
    );

    if (
      classifierValues.logisticC === true &&
      event.target.value < logisticRegressionClassifierMaxIterValue
    ) {
      setLogisticRegressionClassifierMaxIterError(true);
    } else {
      setLogisticRegressionClassifierMaxIterError(false);
    }
  };

  const handleLogisticRegressionClassifierSolverChange = (event) => {
    setLogisticRegressionClassifierSolver(event.target.value);
  };

  const handleLogisticRegressionClassifierTolChange = (event) => {
    setLogisticRegressionClassifierTol(parseFloat(event.target.value));

    if (
      classifierValues.logisticC === true &&
      event.target.value > logisticRegressionClassifierMinTol &&
      event.target.value < 1
    ) {
      setLogisticRegressionClassifierTolError(false);
    } else {
      setLogisticRegressionClassifierTolError(true);
    }
  };

  const handleLogisticRegressionClassifierRandomStateChange = (event) => {
    setLogisticRegressionClassifierRandomState(
      parseInt(event.target.value, 10) || ""
    );

    if (
      classifierValues.logisticC === true &&
      logisticRegressionClassifierHideTextField === true &&
      event.target.value < 1
    ) {
      setLogisticRegressionClassifierRandomStateError(true);
    } else if (
      classifierValues.logisticC === true &&
      logisticRegressionClassifierHideTextField === true &&
      event.target.value > 0
    ) {
      setLogisticRegressionClassifierRandomStateError(false);
    } else {
      setLogisticRegressionClassifierRandomStateError(false);
    }
  };

  const handleLogisticRegressionClassifierHideTextFieldChange = (event) => {
    setLogisticRegressionClassifierHideTextField(event.target.checked);

    if (event.target.checked === false) {
      setLogisticRegressionClassifierRandomStateError(false);
    }
  };

  // handle chnage for SklearnIntentClassifier
  const handleSklearnIntentClassifierC1Change = (event) => {
    setSklearnIntentClassifierC1(parseInt(event.target.value, 10) || "");

    if (
      classifierValues.skLearnC === true &&
      event.target.value < sklearnIntentClassifierMinC
    ) {
      setSklearnIntentClassifierC1Error(true);
    } else {
      setSklearnIntentClassifierC1Error(false);
    }
  };

  const handleSklearnIntentClassifierC2Change = (event) => {
    setSklearnIntentClassifierC2(parseInt(event.target.value, 10) || "");

    if (
      classifierValues.skLearnC === true &&
      event.target.value < sklearnIntentClassifierMinC
    ) {
      setSklearnIntentClassifierC2Error(true);
    } else {
      setSklearnIntentClassifierC2Error(false);
    }
  };

  const handleSklearnIntentClassifierC3Change = (event) => {
    setSklearnIntentClassifierC3(parseInt(event.target.value, 10) || "");

    if (
      classifierValues.skLearnC === true &&
      event.target.value < sklearnIntentClassifierMinC
    ) {
      setSklearnIntentClassifierC3Error(true);
    } else {
      setSklearnIntentClassifierC3Error(false);
    }
  };

  const handleSklearnIntentClassifierC4Change = (event) => {
    setSklearnIntentClassifierC4(parseInt(event.target.value, 10) || "");

    if (
      classifierValues.skLearnC === true &&
      event.target.value < sklearnIntentClassifierMinC
    ) {
      setSklearnIntentClassifierC4Error(true);
    } else {
      setSklearnIntentClassifierC4Error(false);
    }
  };

  const handleSklearnIntentClassifierC5Change = (event) => {
    setSklearnIntentClassifierC5(parseInt(event.target.value, 10) || "");

    if (
      classifierValues.skLearnC === true &&
      event.target.value < sklearnIntentClassifierMinC
    ) {
      setSklearnIntentClassifierC5Error(true);
    } else {
      setSklearnIntentClassifierC5Error(false);
    }
  };

  const handleSklearnIntentClassifierC6Change = (event) => {
    setSklearnIntentClassifierC6(parseInt(event.target.value, 10) || "");

    if (
      classifierValues.skLearnC === true &&
      event.target.value < sklearnIntentClassifierMinC
    ) {
      setSklearnIntentClassifierC6Error(true);
    } else {
      setSklearnIntentClassifierC6Error(false);
    }
  };

  const handleSklearnIntentClassifierKernelsChange = (event) => {
    setSklearnIntentClassifierKernels(event.target.value);
  };

  const handleSklearnIntentClassifierGammaChange = (event) => {
    setSklearnIntentClassifierGamma(parseFloat(event.target.value));

    if (
      classifierValues.skLearnC === true &&
      event.target.value > 0 &&
      event.target.value < 1
    ) {
      setSklearnIntentClassifierGammaError(false);
    } else {
      setSklearnIntentClassifierGammaError(true);
    }
  };

  const handleSklearnIntentClassifierMaxFoldsChange = (event) => {
    setSklearnIntentClassifierMaxFolds(parseInt(event.target.value, 10) || "");

    if (
      classifierValues.skLearnC === true &&
      event.target.value < sklearnIntentClassifierMinMaxFolds
    ) {
      setSklearnIntentClassifierMaxFoldsError(true);
    } else {
      setSklearnIntentClassifierMaxFoldsError(false);
    }
  };

  const handleSklearnIntentClassifierScoringFuncChange = (event) => {
    setSklearnIntentClassifierScoringFunc(event.target.value);
  };

  // handle chnage for KeywordIntentClassifier
  const handleKeywordIntentClassifierCaseSensitiveChange = (event) => {
    setKeywordIntentClassifierCaseSensitive(event.target.value);
  };

  // handle chnage for DIETClassifier
  const handleDIETClassifierEpochsChange = (event) => {
    setDIETClassifierEpochs(parseInt(event.target.value, 10) || "");

    if (
      classifierValues.dietC === true &&
      event.target.value < DIETClassifierMinEpochs
    ) {
      setDIETClassifierEpochsError(true);
    } else {
      setDIETClassifierEpochsError(false);
    }
  };

  const handleDIETClassifierEntityRecognitionChange = (event) => {
    setDIETClassifierEntityRecognition(event.target.value);
  };

  const handleDIETClassifierIntentClassificationChange = (event) => {
    setDIETClassifierIntentClassification(event.target.value);
  };

  // handle chnage for FallbackClassifier
  const handleFallbackClassifierThresholdChange = (event) => {
    setFallbackClassifierThreshold(parseFloat(event.target.value));

    if (
      classifierValues.fallbackC === true &&
      event.target.value > 0 &&
      event.target.value < 1
    ) {
      setFallbackClassifierThresholdError(false);
    } else {
      setFallbackClassifierThresholdError(true);
    }
  };

  // handle chnage for SpacyEntityExtractor
  const handleSpacyEntityExtractorDimensionsChange = (event) => {
    setSpacyEntityExtractorDimensions({
      ...spacyEntityExtractorDimensions,
      [event.target.name]: event.target.checked,
    });

    let newArray = [
      ...spacyEntityExtractorDimensionsCheckedValues,
      event.target.value,
    ];
    if (
      spacyEntityExtractorDimensionsCheckedValues.includes(event.target.value)
    ) {
      newArray = newArray.filter((val) => val !== event.target.value);
    }

    setSpacyEntityExtractorDimensionsCheckedValues(newArray);
  };

  // handle chnage for CRFEntityExtractor
  const handleCRFEntityExtractorFlagChange = (event) => {
    setCRFEntityExtractorFlag(event.target.value);
  };

  const handleCRFEntityExtractorBeforeChange = (event) => {
    setCRFEntityExtractorBefore({
      ...CRFEntityExtractorBefore,
      [event.target.name]: event.target.checked,
    });

    let newArray = [
      ...CRFEntityExtractorBeforeCheckedValues,
      event.target.value,
    ];
    if (CRFEntityExtractorBeforeCheckedValues.includes(event.target.value)) {
      newArray = newArray.filter((val) => val !== event.target.value);
    }

    setCRFEntityExtractorBeforeCheckedValues(newArray);
  };

  const handleCRFEntityExtractorTokenChange = (event) => {
    setCRFEntityExtractorToken({
      ...CRFEntityExtractorToken,
      [event.target.name]: event.target.checked,
    });

    let newArray = [
      ...CRFEntityExtractorTokenCheckedValues,
      event.target.value,
    ];
    if (CRFEntityExtractorTokenCheckedValues.includes(event.target.value)) {
      newArray = newArray.filter((val) => val !== event.target.value);
    }

    setCRFEntityExtractorTokenCheckedValues(newArray);
  };

  const handleCRFEntityExtractorAfterChange = (event) => {
    setCRFEntityExtractorAfter({
      ...CRFEntityExtractorAfter,
      [event.target.name]: event.target.checked,
    });

    let newArray = [
      ...CRFEntityExtractorAfterCheckedValues,
      event.target.value,
    ];
    if (CRFEntityExtractorAfterCheckedValues.includes(event.target.value)) {
      newArray = newArray.filter((val) => val !== event.target.value);
    }

    setCRFEntityExtractorAfterCheckedValues(newArray);
  };

  const handleCRFEntityExtractorMaxIterationsChange = (event) => {
    setCRFEntityExtractorMaxIterations(parseInt(event.target.value, 10) || "");

    if (
      extractorValues.crfE === true &&
      event.target.value < CRFEntityExtractorMinMaxIterations
    ) {
      setCRFEntityExtractorMaxIterationsError(true);
    } else {
      setCRFEntityExtractorMaxIterationsError(false);
    }
  };

  const handleCRFEntityExtractorL1Change = (event) => {
    setCRFEntityExtractorL1(parseFloat(event.target.value));

    if (
      extractorValues.crfE === true &&
      event.target.value > 0 &&
      event.target.value < 1
    ) {
      setCRFEntityExtractorL1Error(false);
    } else {
      setCRFEntityExtractorL1Error(true);
    }
  };

  const handleCRFEntityExtractorL2Change = (event) => {
    setCRFEntityExtractorL2(parseFloat(event.target.value));

    if (
      extractorValues.crfE === true &&
      event.target.value > 0 &&
      event.target.value < 1
    ) {
      setCRFEntityExtractorL2Error(false);
    } else {
      setCRFEntityExtractorL2Error(true);
    }
  };

  const handleCRFEntityExtractorSplitAddressChange = (event) => {
    setCRFEntityExtractorSplitAddress(event.target.value);
  };

  const handleCRFEntityExtractorSplitEmailChange = (event) => {
    setCRFEntityExtractorSplitEmail(event.target.value);
  };

  // handle chnage for DucklingEntityExtractor
  const handleDucklingEntityExtractorPortNoChange = (event) => {
    let value = parseInt(event.target.value, 10) || "";

    if (value > ducklingEntityExtractorMaxPortNo)
      value = ducklingEntityExtractorMaxPortNo;
    if (value < ducklingEntityExtractorMinPortNo)
      value = ducklingEntityExtractorMinPortNo;

    setDucklingEntityExtractorPortNo(value);
  };

  const handleDucklingEntityExtractorDimensionsChange = (event) => {
    setDucklingEntityExtractorDimensions({
      ...ducklingEntityExtractorDimensions,
      [event.target.name]: event.target.checked,
    });

    let newArray = [
      ...ducklingEntityExtractorDimensionsCheckedValues,
      event.target.value,
    ];
    if (
      ducklingEntityExtractorDimensionsCheckedValues.includes(
        event.target.value
      )
    ) {
      newArray = newArray.filter((val) => val !== event.target.value);
    }

    setDucklingEntityExtractorDimensionsCheckedValues(newArray);
  };

  const handleDucklingEntityExtractorTimeoutChange = (event) => {
    let value = parseInt(event.target.value, 10) || "";

    if (value < ducklingEntityExtractorMinTimeout)
      value = ducklingEntityExtractorMinTimeout;

    setDucklingEntityExtractorTimeout(value);
  };

  // handle chnage for RegexEntityExtractor
  const handleRegexEntityExtractorCaseSensitiveChange = (event) => {
    setRegexEntityExtractorCaseSensitive(event.target.value);
  };

  const handleRegexEntityExtractorLookupTablesChange = (event) => {
    setRegexEntityExtractorLookupTables(event.target.value);
  };

  const handleRegexEntityExtractorRegexesChange = (event) => {
    setRegexEntityExtractorRegexes(event.target.value);
  };

  const handleRegexEntityExtractorWordBoundariesChange = (event) => {
    setRegexEntityExtractorWordBoundaries(event.target.value);
  };

  // POLICIES
  // used to handle change on whether to display a component or not
  const handlePolicyChange = (event) => {
    setPolicyValues({
      ...policyValues,
      [event.target.name]: event.target.checked,
    });
  };

  // POLICIES - handleChange
  // handle chnage for TEDPolicy
  const handleTEDPolicyEpochsChange = (event) => {
    setTEDPolicyEpochs(parseInt(event.target.value, 10) || "");

    if (policyValues.tedP === true && event.target.value < 1) {
      setTEDPolicyEpochsError(true);
    } else {
      setTEDPolicyEpochsError(false);
    }
  };

  const handleTEDPolicyMaxHistoryChange = (event) => {
    setTEDPolicyMaxHistory(parseInt(event.target.value, 10) || "");

    if (policyValues.tedP === true && event.target.value < 1) {
      setTEDPolicyMaxHistoryError(true);
    } else {
      setTEDPolicyMaxHistoryError(false);
    }
  };

  const handleTEDPolicySplitByCommaChange = (event) => {
    setTEDPolicySplitByComma(event.target.value);
  };

  const handleTEDPolicyConstrainSimilaritiesChange = (event) => {
    setTEDPolicyConstrainSimilarities(event.target.value);
  };

  // handle chnage for UnexpecTEDIntentPolicy
  const handleUnexpecTEDIntentPolicyEpochsChange = (event) => {
    setUnexpecTEDIntentPolicyEpochs(parseInt(event.target.value, 10) || "");

    if (policyValues.unexpectedP === true && event.target.value < 1) {
      setUnexpecTEDIntentPolicyEpochsError(true);
    } else {
      setUnexpecTEDIntentPolicyEpochsError(false);
    }
  };

  const handleUnexpecTEDIntentPolicyMaxHistoryChange = (event) => {
    setUnexpecTEDIntentPolicyMaxHistory(parseInt(event.target.value, 10) || "");

    if (policyValues.unexpectedP === true && event.target.value < 1) {
      setUnexpecTEDIntentPolicyMaxHistoryError(true);
    } else {
      setUnexpecTEDIntentPolicyMaxHistoryError(false);
    }
  };

  // handle chnage for MemoizationPolicy
  const handleMemoizationPolicyMaxHistoryChange = (event) => {
    setMemoizationPolicyMaxHistory(parseInt(event.target.value, 10) || "");

    if (policyValues.memoizationP === true && event.target.value < 1) {
      setMemoizationPolicyMaxHistoryError(true);
    } else {
      setMemoizationPolicyMaxHistoryError(false);
    }
  };

  // handle chnage for AugmentedMemoizationPolicy
  const handleAugmentedMemoizationPolicyMaxHistoryChange = (event) => {
    setAugmentedMemoizationPolicyMaxHistory(
      parseInt(event.target.value, 10) || ""
    );

    if (policyValues.augmentedMP === true && event.target.value < 1) {
      setAugmentedMemoizationPolicyMaxHistoryError(true);
    } else {
      setAugmentedMemoizationPolicyMaxHistoryError(false);
    }
  };

  // handle chnage for RulePolicy
  const handleRulePolicyThresholdChange = (event) => {
    setRulePolicyThreshold(parseFloat(event.target.value));

    if (
      (policyValues.ruleP === true && event.target.value < 0.1) ||
      (policyValues.ruleP === true && event.target.value > 1.0)
    ) {
      setRulePolicyThresholdError(true);
    } else {
      setRulePolicyThresholdError(false);
    }
  };

  const handleRulePolicyEnablePredictionChange = (event) => {
    setRulePolicyEnablePrediction(event.target.value);
  };

  const handleRulePolicyRestrictRulesChange = (event) => {
    setRulePolicyRestrictRules(event.target.value);
  };

  const handleRulePolicyCheckContradictionsChange = (event) => {
    setRulePolicyCheckContradictions(event.target.value);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenTraingModelSuccessAlert(false);
    setOpenTraingModelFailAlert(false);
    setOpenCancelTraingModelSuccessAlert(false);
    setOpenCancelTraingModelFailAlert(false);
    setOpenSpacyTokenizerAlert(false);
    setOpenSpacyFeaturizerAlert(false);
    setOpenSpacyEntityExtractorAlert(false);
    setOpenSpacyFeaturizerTokenizerAlert(false);
    setOpenFormNotSubmittedAlert(false);
    setOpenModelConfigFailAlert(false);
    setOpenUnknownModelFailAlert(false);
    setOpenSetConfigFailAlert(false);
  };

  // PIPELINE
  const { mitieLM, spacyLM } = languageModelValues;

  const {
    mitieF,
    spacyF,
    convertF,
    languageModelF,
    regexF,
    countVectorsF,
    lexicalSyntacticF,
    gensimF,
  } = featurizerValues;
  const featurizerError =
    [
      mitieF,
      spacyF,
      convertF,
      languageModelF,
      regexF,
      countVectorsF,
      lexicalSyntacticF,
      gensimF,
    ].filter((v) => v).length === 0;

  const { mitieC, logisticC, skLearnC, keywordC, dietC, fallbackC } =
    classifierValues;
  const classifierError =
    [mitieC, logisticC, skLearnC, keywordC, dietC, fallbackC].filter((v) => v)
      .length === 0;

  const { mitieE, spacyE, crfE, ducklingE, regexE, entityE } = extractorValues;
  const extractorError =
    [mitieE, spacyE, crfE, ducklingE, regexE, entityE].filter((v) => v)
      .length === 0;

  // for LexicalSyntacticFeaturizer
  const {
    beforeBOS,
    beforeEOS,
    beforeLow,
    beforeUpper,
    beforeTitle,
    beforeDigit,
    beforePrefix5,
    beforePrefix2,
    beforeSuffix5,
    beforeSuffix3,
    beforeSuffix2,
    beforeSuffix1,
    beforePos,
    beforePos2,
  } = lexicalSyntacticFeaturizerBefore;
  const lexicalSyntacticFeaturizerBeforeValuesError =
    [
      beforeBOS,
      beforeEOS,
      beforeLow,
      beforeUpper,
      beforeTitle,
      beforeDigit,
      beforePrefix5,
      beforePrefix2,
      beforeSuffix5,
      beforeSuffix3,
      beforeSuffix2,
      beforeSuffix1,
      beforePos,
      beforePos2,
    ].filter((v) => v).length === 0;

  const {
    tokenBOS,
    tokenEOS,
    tokenLow,
    tokenUpper,
    tokenTitle,
    tokenDigit,
    tokenPrefix5,
    tokenPrefix2,
    tokenSuffix5,
    tokenSuffix3,
    tokenSuffix2,
    tokenSuffix1,
    tokenPos,
    tokenPos2,
  } = lexicalSyntacticFeaturizerToken;
  const lexicalSyntacticFeaturizerTokenValuesError =
    [
      tokenBOS,
      tokenEOS,
      tokenLow,
      tokenUpper,
      tokenTitle,
      tokenDigit,
      tokenPrefix5,
      tokenPrefix2,
      tokenSuffix5,
      tokenSuffix3,
      tokenSuffix2,
      tokenSuffix1,
      tokenPos,
      tokenPos2,
    ].filter((v) => v).length === 0;

  const {
    afterBOS,
    afterEOS,
    afterLow,
    afterUpper,
    afterTitle,
    afterDigit,
    afterPrefix5,
    afterPrefix2,
    afterSuffix5,
    afterSuffix3,
    afterSuffix2,
    afterSuffix1,
    afterPos,
    afterPos2,
  } = lexicalSyntacticFeaturizerAfter;
  const lexicalSyntacticFeaturizerAfterValuesError =
    [
      afterBOS,
      afterEOS,
      afterLow,
      afterUpper,
      afterTitle,
      afterDigit,
      afterPrefix5,
      afterPrefix2,
      afterSuffix5,
      afterSuffix3,
      afterSuffix2,
      afterSuffix1,
      afterPos,
      afterPos2,
    ].filter((v) => v).length === 0;

  // for SpacyEntityExtractor
  const { person, loc, org, product } = spacyEntityExtractorDimensions;

  // for CRFEntityExtractor
  const {
    CRFEntityExtractorBeforeLow,
    CRFEntityExtractorBeforeUpper,
    CRFEntityExtractorBeforeTitle,
    CRFEntityExtractorBeforeDigit,
    CRFEntityExtractorBeforePrefix5,
    CRFEntityExtractorBeforePrefix2,
    CRFEntityExtractorBeforeSuffix5,
    CRFEntityExtractorBeforeSuffix3,
    CRFEntityExtractorBeforeSuffix2,
    CRFEntityExtractorBeforeSuffix1,
    CRFEntityExtractorBeforePos,
    CRFEntityExtractorBeforePos2,
    CRFEntityExtractorBeforePattern,
    CRFEntityExtractorBeforeBias,
    CRFEntityExtractorBeforeTextDenseFeatures,
  } = CRFEntityExtractorBefore;
  const CRFEntityExtractorBeforeValuesError =
    [
      CRFEntityExtractorBeforeLow,
      CRFEntityExtractorBeforeUpper,
      CRFEntityExtractorBeforeTitle,
      CRFEntityExtractorBeforeDigit,
      CRFEntityExtractorBeforePrefix5,
      CRFEntityExtractorBeforePrefix2,
      CRFEntityExtractorBeforeSuffix5,
      CRFEntityExtractorBeforeSuffix3,
      CRFEntityExtractorBeforeSuffix2,
      CRFEntityExtractorBeforeSuffix1,
      CRFEntityExtractorBeforePos,
      CRFEntityExtractorBeforePos2,
      CRFEntityExtractorBeforePattern,
      CRFEntityExtractorBeforeBias,
      CRFEntityExtractorBeforeTextDenseFeatures,
    ].filter((v) => v).length === 0;

  const {
    CRFEntityExtractorTokenLow,
    CRFEntityExtractorTokenUpper,
    CRFEntityExtractorTokenTitle,
    CRFEntityExtractorTokenDigit,
    CRFEntityExtractorTokenPrefix5,
    CRFEntityExtractorTokenPrefix2,
    CRFEntityExtractorTokenSuffix5,
    CRFEntityExtractorTokenSuffix3,
    CRFEntityExtractorTokenSuffix2,
    CRFEntityExtractorTokenSuffix1,
    CRFEntityExtractorTokenPos,
    CRFEntityExtractorTokenPos2,
    CRFEntityExtractorTokenPattern,
    CRFEntityExtractorTokenBias,
    CRFEntityExtractorTokenTextDenseFeatures,
  } = CRFEntityExtractorToken;
  const CRFEntityExtractorTokenValuesError =
    [
      CRFEntityExtractorTokenLow,
      CRFEntityExtractorTokenUpper,
      CRFEntityExtractorTokenTitle,
      CRFEntityExtractorTokenDigit,
      CRFEntityExtractorTokenPrefix5,
      CRFEntityExtractorTokenPrefix2,
      CRFEntityExtractorTokenSuffix5,
      CRFEntityExtractorTokenSuffix3,
      CRFEntityExtractorTokenSuffix2,
      CRFEntityExtractorTokenSuffix1,
      CRFEntityExtractorTokenPos,
      CRFEntityExtractorTokenPos2,
      CRFEntityExtractorTokenPattern,
      CRFEntityExtractorTokenBias,
      CRFEntityExtractorTokenTextDenseFeatures,
    ].filter((v) => v).length === 0;

  const {
    CRFEntityExtractorAfterLow,
    CRFEntityExtractorAfterUpper,
    CRFEntityExtractorAfterTitle,
    CRFEntityExtractorAfterDigit,
    CRFEntityExtractorAfterPrefix5,
    CRFEntityExtractorAfterPrefix2,
    CRFEntityExtractorAfterSuffix5,
    CRFEntityExtractorAfterSuffix3,
    CRFEntityExtractorAfterSuffix2,
    CRFEntityExtractorAfterSuffix1,
    CRFEntityExtractorAfterPos,
    CRFEntityExtractorAfterPos2,
    CRFEntityExtractorAfterPattern,
    CRFEntityExtractorAfterBias,
    CRFEntityExtractorAfterTextDenseFeatures,
  } = CRFEntityExtractorAfter;
  const CRFEntityExtractorAfterValuesError =
    [
      CRFEntityExtractorAfterLow,
      CRFEntityExtractorAfterUpper,
      CRFEntityExtractorAfterTitle,
      CRFEntityExtractorAfterDigit,
      CRFEntityExtractorAfterPrefix5,
      CRFEntityExtractorAfterPrefix2,
      CRFEntityExtractorAfterSuffix5,
      CRFEntityExtractorAfterSuffix3,
      CRFEntityExtractorAfterSuffix2,
      CRFEntityExtractorAfterSuffix1,
      CRFEntityExtractorAfterPos,
      CRFEntityExtractorAfterPos2,
      CRFEntityExtractorAfterPattern,
      CRFEntityExtractorAfterBias,
      CRFEntityExtractorAfterTextDenseFeatures,
    ].filter((v) => v).length === 0;

  // for DucklingEntityExtractor
  const {
    ducklingEntityExtractorTime,
    ducklingEntityExtractorNumber,
    ducklingEntityExtractorMoney,
    ducklingEntityExtractorDistance,
  } = ducklingEntityExtractorDimensions;
  const ducklingEntityExtractorDimensionsValuesError =
    [
      ducklingEntityExtractorTime,
      ducklingEntityExtractorNumber,
      ducklingEntityExtractorMoney,
      ducklingEntityExtractorDistance,
    ].filter((v) => v).length === 0;

  // POLICIES
  const { tedP, unexpectedP, memoizationP, augmentedMP, ruleP } = policyValues;
  const policyError =
    [tedP, unexpectedP, memoizationP, augmentedMP, ruleP].filter((v) => v)
      .length === 0;

  // arrays for languageModelFeaturizer models
  // const modelName = ["bert", "gpt", "gpt2", "xlnet", "distilbert", "roberta"];
  const bertModelWeight = ["rasa/LaBSE"];
  const gptModelWeight = ["openai-gpt"];
  const gpt2ModelWeight = ["gpt2"];
  const xlnetModelWeight = ["xlnet-base-cased"];
  const distilbertModelWeight = ["distilbert-base-uncased"];
  const robertaModelWeight = ["roberta-base"];

  let languageModelFeaturizerModelNameType = bertModelWeight;
  let languageModelFeaturizerModelWeightOptions = bertModelWeight.map((val) => (
    <MenuItem value={val}>{val}</MenuItem>
  ));

  if (languageModelFeaturizerModelName === "bert") {
    languageModelFeaturizerModelNameType = bertModelWeight;
  } else if (languageModelFeaturizerModelName === "gpt") {
    languageModelFeaturizerModelNameType = gptModelWeight;
  } else if (languageModelFeaturizerModelName === "gpt2") {
    languageModelFeaturizerModelNameType = gpt2ModelWeight;
  } else if (languageModelFeaturizerModelName === "xlnet") {
    languageModelFeaturizerModelNameType = xlnetModelWeight;
  } else if (languageModelFeaturizerModelName === "distilbert") {
    languageModelFeaturizerModelNameType = distilbertModelWeight;
  } else if (languageModelFeaturizerModelName === "roberta") {
    languageModelFeaturizerModelNameType = robertaModelWeight;
  }

  if (languageModelFeaturizerModelNameType) {
    languageModelFeaturizerModelWeightOptions =
      languageModelFeaturizerModelNameType.map((val) => (
        <MenuItem value={val}>{val}</MenuItem>
      ));
  }

  // method to convert the variables into a js object
  const generateJSObjectPipeline = () => {
    JSObjectPipeline = {
      pipeline: [
        // rendering the language model components
        // (languageModelValue === "MitieNLP" ? {
        //   "name": "MitieNLP",
        //   "model": mitieNLPModelPath
        // } : null),
        // (languageModelValue === "SpacyNLP" ? {
        //   "name": "SpacyNLP",
        //   "model": spacyNLPModelLang,
        //   "case_sensitive": spacyNLPCaseSensitive
        // } : null),

        languageModelValues.mitieLM === true
          ? {
              name: "MitieNLP",
              model: mitieNLPModelPath,
            }
          : null,
        languageModelValues.spacyLM === true
          ? {
              name: "SpacyNLP",
              model: spacyNLPModelLang,
              case_sensitive: spacyNLPCaseSensitive,
            }
          : null,
        // rendering the tokenizer components
        tokenizerValue === "WhitespaceTokenizer"
          ? {
              name: "WhitespaceTokenizer",
              intent_tokenization_flag: whitespaceTokenizerFlag,
              intent_split_symbol: whitespaceTokenizerSplitSymbol,
              token_pattern: whitespaceTokenizerTokenPattern,
            }
          : null,
        tokenizerValue === "JiebaTokenizer"
          ? {
              name: "JiebaTokenizer",
              intent_tokenization_flag: jiebaTokenizerFlag,
              intent_split_symbol: jiebaTokenizerSplitSymbol,
              token_pattern: jiebaTokenizerTokenPattern,
            }
          : null,
        tokenizerValue === "JiebaTokenizer"
          ? {
              name: "JiebaTokenizer",
              intent_tokenization_flag: jiebaTokenizerFlag,
              intent_split_symbol: jiebaTokenizerSplitSymbol,
              token_pattern: jiebaTokenizerTokenPattern,
            }
          : null,
        tokenizerValue === "MitieTokenizer"
          ? {
              name: "MitieTokenizer",
              intent_tokenization_flag: mitieTokenizerFlag,
              intent_split_symbol: mitieTokenizerSplitSymbol,
              token_pattern: mitieTokenizerTokenPattern,
            }
          : null,
        tokenizerValue === "SpacyTokenizer"
          ? {
              name: "SpacyTokenizer",
              intent_tokenization_flag: spacyTokenizerFlag,
              intent_split_symbol: spacyTokenizerSplitSymbol,
              token_pattern: spacyTokenizerTokenPattern,
            }
          : null,
        tokenizerValue === "SEETMTokenizer"
          ? {
              name: "custom.tokenizers.seetm_tokenizer.SEETMTokenizer",
            }
          : null,
        // rendering the featurizer components
        featurizerValues.mitieF === true
          ? {
              name: "MitieFeaturizer",
              pooling: mitieFeaturizerPooling,
            }
          : null,
        featurizerValues.spacyF === true
          ? {
              name: "SpacyFeaturizer",
              pooling: spacyFeaturizerPooling,
            }
          : null,
        featurizerValues.convertF === true
          ? {
              name: "ConveRTFeaturizer",
              model_url: conveRTFeaturizerModelUrl,
            }
          : null,
        featurizerValues.languageModelF === true
          ? {
              name: "LanguageModelFeaturizer",
              model_name: languageModelFeaturizerModelName,
              model_weights: languageModelFeaturizerModelWeight,
              cache_dir: languageModelFeaturizerCacheDir,
            }
          : null,
        featurizerValues.regexF === true &&
        regexFeaturizerHidePatternsTextField === true
          ? {
              name: "RegexFeaturizer",
              case_sensitive: regexFeaturizerCaseSensitive,
              use_word_boundaries: regexFeaturizerWordBoundaries,
              number_additional_patterns: regexFeaturizerNumOfPatterns,
            }
          : null,
        featurizerValues.regexF === true &&
        regexFeaturizerHidePatternsTextField === false
          ? {
              name: "RegexFeaturizer",
              case_sensitive: regexFeaturizerCaseSensitive,
              use_word_boundaries: regexFeaturizerWordBoundaries,
            }
          : null,
        featurizerValues.countVectorsF === true
          ? {
              name: "CountVectorsFeaturizer",
              analyzer: countVectorsFeaturizerAnalyzer,
              min_ngram: countVectorsFeaturizerMinNGram,
              max_ngram: countVectorsFeaturizerMaxNGram,
              OOV_token: countVectorsFeaturizerOOVToken,
              use_shared_vocab: countVectorsFeaturizerSharedVocab,
              additional_vocabulary_size: {
                text: countVectorsFeaturizerTextSize,
                response: countVectorsFeaturizerResponseSize,
                action_text: countVectorsFeaturizerActionTextSize,
              },
            }
          : null,
        featurizerValues.lexicalSyntacticF === true
          ? {
              name: "LexicalSyntacticFeaturizer",
              features: [
                lexicalSyntacticFeaturizerBeforeCheckedValues,
                lexicalSyntacticFeaturizerTokenCheckedValues,
                lexicalSyntacticFeaturizerAfterCheckedValues,
              ],
            }
          : null,
        featurizerValues.gensimF === true &&
        gensimFeaturizerHideCacheDir === true &&
        gensimFeaturizerHideFile === true
          ? {
              name: "rasa_nlu_examples.featurizers.dense.GensimFeaturizer",
              cache_dir: gensimFeaturizerCacheDir,
              file: gensimFeaturizerFile,
            }
          : null,
        featurizerValues.gensimF === true &&
        gensimFeaturizerHideCacheDir === true &&
        gensimFeaturizerHideFile === false
          ? {
              name: "rasa_nlu_examples.featurizers.dense.GensimFeaturizer",
              cache_dir: gensimFeaturizerCacheDir,
              file: gensimFeaturizerFileDefaultValue,
            }
          : null,
        featurizerValues.gensimF === true &&
        gensimFeaturizerHideCacheDir === false &&
        gensimFeaturizerHideFile === true
          ? {
              name: "rasa_nlu_examples.featurizers.dense.GensimFeaturizer",
              cache_dir: gensimFeaturizerCacheDirDefaultValue,
              file: gensimFeaturizerFile,
            }
          : null,
        featurizerValues.gensimF === true &&
        gensimFeaturizerHideCacheDir === false &&
        gensimFeaturizerHideFile === false
          ? {
              name: "rasa_nlu_examples.featurizers.dense.GensimFeaturizer",
              cache_dir: gensimFeaturizerCacheDirDefaultValue,
              file: gensimFeaturizerFileDefaultValue,
            }
          : null,
        classifierValues.mitieC === true
          ? {
              name: "MitieIntentClassifier",
            }
          : null,
        classifierValues.logisticC === true &&
        regexFeaturizerHidePatternsTextField === true
          ? {
              name: "LogisticRegressionClassifier",
              max_iter: logisticRegressionClassifierMaxIter,
              solver: logisticRegressionClassifierSolver,
              tol: logisticRegressionClassifierTol,
              random_state: logisticRegressionClassifierRandomState,
            }
          : null,
        classifierValues.logisticC === true &&
        regexFeaturizerHidePatternsTextField === false
          ? {
              name: "LogisticRegressionClassifier",
              max_iter: logisticRegressionClassifierMaxIter,
              solver: logisticRegressionClassifierSolver,
              tol: logisticRegressionClassifierTol,
            }
          : null,
        classifierValues.skLearnC === true
          ? {
              name: "SklearnIntentClassifier",
              C: [
                sklearnIntentClassifierC1,
                sklearnIntentClassifierC2,
                sklearnIntentClassifierC3,
                sklearnIntentClassifierC4,
                sklearnIntentClassifierC5,
                sklearnIntentClassifierC6,
              ],
              kernels: [sklearnIntentClassifierKernels],
              gamma: [sklearnIntentClassifierGamma],
              max_cross_validation_folds: sklearnIntentClassifierMaxFolds,
              scoring_function: sklearnIntentClassifierScoringFunc,
            }
          : null,
        classifierValues.keywordC === true
          ? {
              name: "KeywordIntentClassifier",
              case_sensitive: keywordIntentClassifierCaseSensitive,
            }
          : null,
        classifierValues.dietC === true
          ? {
              name: "DIETClassifier",
              epochs: DIETClassifierEpochs,
              entity_recognition: DIETClassifierEntityRecognition,
              intent_classification: DIETClassifierIntentClassification,
              evaluate_on_number_of_examples: 150,
              evaluate_every_number_of_epochs: 1,
              tensorboard_log_directory: "./tensorboard",
              tensorboard_log_level: "epoch",
              checkpoint_model: true,
            }
          : null,
        classifierValues.fallbackC === true
          ? {
              name: "FallbackClassifier",
              threshold: fallbackClassifierThreshold,
            }
          : null,
        extractorValues.mitieE === true
          ? {
              name: "MitieEntityExtractor",
            }
          : null,
        extractorValues.spacyE === true
          ? {
              name: "SpacyEntityExtractor",
              dimensions: spacyEntityExtractorDimensionsCheckedValues,
            }
          : null,
        extractorValues.crfE === true
          ? {
              name: "CRFEntityExtractor",
              BILOU_flag: CRFEntityExtractorFlag,
              features: [
                CRFEntityExtractorBeforeCheckedValues,
                CRFEntityExtractorTokenCheckedValues,
                CRFEntityExtractorAfterCheckedValues,
              ],
              max_iterations: CRFEntityExtractorMaxIterations,
              L1_c: CRFEntityExtractorL1,
              L2_c: CRFEntityExtractorL2,
              split_entities_by_comma: {
                address: CRFEntityExtractorSplitAddress,
                email: CRFEntityExtractorSplitEmail,
              },
            }
          : null,
        extractorValues.ducklingE === true
          ? {
              name: "DucklingEntityExtractor",
              url: ducklingEntityExtractorURL + ducklingEntityExtractorPortNo,
              dimensions: ducklingEntityExtractorDimensionsCheckedValues,
              timeout: ducklingEntityExtractorTimeout,
            }
          : null,
        extractorValues.regexE === true
          ? {
              name: "RegexEntityExtractor",
              case_sensitive: regexEntityExtractorCaseSensitive,
              use_lookup_tables: regexEntityExtractorLookupTables,
              use_regexes: regexEntityExtractorRegexes,
              use_word_boundaries: regexEntityExtractorWordBoundaries,
            }
          : null,
        extractorValues.entityE === true
          ? {
              name: "EntitySynonymMapper",
            }
          : null,
      ],
    };
  };

  const generateJSObjectPolicies = () => {
    JSObjectPolicies = {
      policies: [
        policyValues.tedP === true
          ? {
              name: "TEDPolicy",
              epochs: TEDPolicyEpochs,
              max_history: TEDPolicyMaxHistory,
              split_entities_by_comma: TEDPolicySplitByComma,
              constrain_similarities: TEDPolicyConstrainSimilarities,
            }
          : null,
        policyValues.unexpectedP === true
          ? {
              name: "UnexpecTEDIntentPolicy",
              epochs: unexpecTEDIntentPolicyEpochs,
              max_history: unexpecTEDIntentPolicyMaxHistory,
            }
          : null,
        policyValues.memoizationP === true
          ? {
              name: "MemoizationPolicy",
              max_history: memoizationPolicyMaxHistory,
            }
          : null,
        policyValues.augmentedMP === true
          ? {
              name: "AugmentedMemoizationPolicy",
              max_history: augmentedMemoizationPolicyMaxHistory,
            }
          : null,
        policyValues.ruleP === true
          ? {
              name: "RulePolicy",
              core_fallback_threshold: rulePolicyThreshold,
              enable_fallback_prediction: rulePolicyEnablePrediction,
              restrict_rules: rulePolicyRestrictRules,
              check_for_contradictions: rulePolicyCheckContradictions,
            }
          : null,
      ],
    };
  };

  let combinedJSON;

  const trainModel = async (e) => {
    e.preventDefault();

    if (tokenizerValue === "SpacyTokenizer" && spacyLM === false) {
      setOpenSpacyTokenizerAlert(true);
      return;
    }

    if (spacyF === true && spacyLM === false) {
      setOpenSpacyFeaturizerAlert(true);
      return;
    }

    if (spacyE === true && spacyLM === false) {
      setOpenSpacyEntityExtractorAlert(true);
      return;
    }

    if (spacyF === true && tokenizerValue !== "SpacyTokenizer") {
      setOpenSpacyFeaturizerTokenizerAlert(true);
      return;
    }

    if (
      regexFeaturizerNumOfPatternsError === false &&
      countVectorsFeaturizerMinNGramError === false &&
      countVectorsFeaturizerMaxNGramError === false &&
      countVectorsFeaturizerTextSizeError === false &&
      countVectorsFeaturizerResponseSizeError === false &&
      countVectorsFeaturizerActionTextSizeError === false &&
      gensimFeaturizerCacheDirError === false &&
      gensimFeaturizerFileError === false &&
      logisticRegressionClassifierMaxIterError === false &&
      logisticRegressionClassifierTolError === false &&
      logisticRegressionClassifierRandomStateError === false &&
      sklearnIntentClassifierC1Error === false &&
      sklearnIntentClassifierC2Error === false &&
      sklearnIntentClassifierC3Error === false &&
      sklearnIntentClassifierC4Error === false &&
      sklearnIntentClassifierC5Error === false &&
      sklearnIntentClassifierC6Error === false &&
      sklearnIntentClassifierGammaError === false &&
      sklearnIntentClassifierMaxFoldsError === false &&
      DIETClassifierEpochsError === false &&
      fallbackClassifierThresholdError === false &&
      CRFEntityExtractorMaxIterationsError === false &&
      CRFEntityExtractorL1Error === false &&
      CRFEntityExtractorL2Error === false &&
      TEDPolicyEpochsError === false &&
      TEDPolicyMaxHistoryError === false &&
      unexpecTEDIntentPolicyEpochsError === false &&
      unexpecTEDIntentPolicyMaxHistoryError === false &&
      memoizationPolicyMaxHistoryError === false &&
      augmentedMemoizationPolicyMaxHistoryError === false &&
      rulePolicyThresholdError === false
    ) {
      await generateJSObjectPipeline();
      const JSObjectPipelineNullRemoved = JSObjectPipeline.pipeline.filter(
        (x) => x !== null
      );

      await generateJSObjectPolicies();
      const JSObjectPoliciesNullRemoved = JSObjectPolicies.policies.filter(
        (x) => x !== null
      );

      combinedJSON = {
        language: "en",
        pipeline: JSObjectPipelineNullRemoved,
        policies: JSObjectPoliciesNullRemoved,
      };

      setModelTrainLoading(true);
      setCancelTraining(false);

      let request_id = uuidv4();
      let data = {
        request_id: request_id,
        configs: combinedJSON,
      };

      setRequestId(request_id);

      axios
        .post(`${configs.trainModelEndpoint}`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          const data = res.data;

          if (Object.hasOwn(data, "status")) {
            // error has occcured
            setModelTrainLoading(false);
            if (data["reponse"] === "model") {
              openTraingModelFailAlert(true);
            } else if (data["reponse"] === "config") {
              openModelConfigFailAlert(true);
            } else if (data["reponse"] === "unknown") {
              openUnknownModelFailAlert(true);
            }
          } else {
            // no error
            setModelTrainLoading(false);
            setOpenTraingModelSuccessAlert(true);
            // TODO :update the model list in the models page (must share a global state)
          }
        })
        .catch((err) => {
          setModelTrainLoading(false);
          if (cancelTraining === false) {
            setOpenTraingModelFailAlert(true);
          }
        });
    } else {
      // form not submitted
      setOpenFormNotSubmittedAlert(true);
    }
  };

  let [configData, setConfigData] = React.useState([]);

  const setConfigs = async (model) => {
    var configData1;

    await axios
      .post(`${configs.getModelConfigEndpoint + model}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (res) => {
        // const cData = await res.data["model_config"];
        // configData1 = JSON.parse(cData);

        const data = res.data;

        if (Object.hasOwn(data, "status")) {
          // error has occcured
          setOpenSetConfigFailAlert(true);
        } else {
          // no error
          if (data["model_config"] === null) {
            setOpenSetConfigFailAlert(true);
          } else {
            const cData = await data["model_config"];
            configData = cData;

            await setComponentsToFalse();

            console.log(configData);

            var pipelineConfigs = await configData["config"]["pipeline"];
            var policyConfigs = await configData["config"]["policies"];

            setIndividualPipelineComponent(pipelineConfigs);
            setIndividualPolicyComponent(policyConfigs);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setOpenSetConfigFailAlert(true);
      });

    // await setPipelineValuesToFalse();
    // await setPolicyValuesToFalse();

    // var pipelineConfigs = await configData1[0]["config"]["pipeline"];
    // var policyConfigs = await configData1[0]["config"]["policies"];

    // setIndividualPipelineComponent(pipelineConfigs);
    // setIndividualPolicyComponent(policyConfigs);
  };

  const setComponentsToFalse = async () => {
    try {
      await setPipelineValuesToFalse();
      await setPolicyValuesToFalse();
    } catch (e) {
      console.log(e);
    }
  };

  const abortTrain = async (e) => {
    e.preventDefault();

    setCancelTraining(true);

    let request_id = "";
    let data = {
      request_id: requestId,
    };

    axios
      .post(`${configs.abortTrainEndpoint}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        // setCancelTraining(false);
        // setOpenCancelTraingModelSuccessAlert(true);

        const data = res.data;

        if (Object.hasOwn(data, "status")) {
          // error has occcured
          setCancelTraining(false);
          setOpenCancelTraingModelFailAlert(true);
        } else {
          // no error
          setCancelTraining(false);
          setOpenCancelTraingModelSuccessAlert(true);
          // TODO :update the model list in the models page (must share a global state)
        }
      })
      .catch((err) => {
        setCancelTraining(false);
        setOpenCancelTraingModelFailAlert(true);
      });
  };

  const setPipelineValuesToFalse = async () => {
    await setLanguageModelValues({
      mitieLM: false,
      spacyLM: false,
    });
    await setFeaturizerValues({
      mitieF: false,
      spacyF: false,
    });
    await setClassifierValues({
      mitieC: false,
      logisticC: false,
      skLearnC: false,
      keywordC: false,
      dietC: false,
      fallbackC: false,
    });
    await setExtractorValues({
      mitieE: false,
      spacyE: false,
      crfE: false,
      ducklingE: false,
      regexE: false,
      entityE: false,
    });
  };

  const setPolicyValuesToFalse = async () => {
    await setPolicyValues({
      tedP: false,
      unexpectedP: false,
      memoizationP: false,
      augmentedMP: false,
      ruleP: false,
    });
  };

  const setIndividualPipelineComponent = (obj) => {
    // PIPELINE COMPONENTS
    // language model values
    var mitieLM = false;
    var spacyLM = false;

    // featurizer values
    var mitieF = false;
    var spacyF = false;
    var convertF = false;
    var languageModelF = false;
    var regexF = false;
    var countVectorsF = false;
    var lexicalSyntacticF = false;
    var gensimF = false;

    // classifier values
    var mitieC = false;
    var logisticC = false;
    var skLearnC = false;
    var keywordC = false;
    var dietC = false;
    var fallbackC = false;

    // extractor values
    var mitieE = false;
    var spacyE = false;
    var crfE = false;
    var ducklingE = false;
    var regexE = false;
    var entityE = false;

    const setting = obj.map((val) => {
      if (val["name"] === "MitieNLP") {
        mitieLM = true;
        setMitieNLPModelPath(val["model"]);
      } else if (val["name"] === "SpacyNLP") {
        spacyLM = true;
        setSpacyNLPModelLang(val["model"]);
        setSpacyNLPCaseSensitive(val["case_sensitive"]);
      } else if (val["name"] === "WhitespaceTokenizer") {
        setTokenizerValue(val["name"]);
        setWhitespaceTokenizerFlag(val["intent_tokenization_flag"]);
        setWhitespaceTokenizerSplitSymbol(val["intent_split_symbol"]);
        setWhitespaceTokenizerTokenPattern(val["token_pattern"]);
      } else if (val["name"] === "JiebaTokenizer") {
        setTokenizerValue(val["name"]);
        setJiebaTokenizerFlag(val["intent_tokenization_flag"]);
        setJiebaTokenizerSplitSymbol(val["intent_split_symbol"]);
        setJiebaTokenizerTokenPattern(val["token_pattern"]);
      } else if (val["name"] === "MitieTokenizer") {
        setTokenizerValue(val["name"]);
        setMitieTokenizerFlag(val["intent_tokenization_flag"]);
        setMitieTokenizerSplitSymbol(val["intent_split_symbol"]);
        setMitieTokenizerTokenPattern(val["token_pattern"]);
      } else if (val["name"] === "SpacyTokenizer") {
        setTokenizerValue(val["name"]);
        setSpacyTokenizerFlag(val["intent_tokenization_flag"]);
        setSpacyTokenizerSplitSymbol(val["intent_split_symbol"]);
        setSpacyTokenizerTokenPattern(val["token_pattern"]);
      } else if (val["name"] === "SEETMTokenizer") {
        setTokenizerValue(val["name"]);
      } else if (val["name"] === "MitieFeaturizer") {
        mitieF = true;
        setMitieFeaturizerPooling(val["pooling"]);
      } else if (val["name"] === "SpacyFeaturizer") {
        spacyF = true;
        setSpacyFeaturizerPooling(val["pooling"]);
      } else if (val["name"] === "ConveRTFeaturizer") {
        convertF = true;
        setConveRTFeaturizerModelUrl(val["model_url"]);
      } else if (val["name"] === "LanguageModelFeaturizer") {
        languageModelF = true;
        setLanguageModelFeaturizerModelName(val["model_name"]);
        setLanguageModelFeaturizerModelWeight(val["model_weights"]);
        setLanguageModelFeaturizerCacheDir(val["cache_dir"]);
      } else if (val["name"] === "RegexFeaturizer") {
        regexF = true;
        setRegexFeaturizerCaseSensitive(val["case_sensitive"]);
        setRegexFeaturizerWordBoundaries(val["use_word_boundaries"]);
        if (Object.hasOwn(val, "number_additional_patterns")) {
          setRegexFeaturizerHidePatternsTextField(true);
          setRegexFeaturizerNumOfPatterns(val["number_additional_patterns"]);
        } else {
          setRegexFeaturizerHidePatternsTextField(false);
        }
      } else if (val["name"] === "CountVectorsFeaturizer") {
        countVectorsF = true;
        setCountVectorsFeaturizerAnalyzer(val["analyzer"]);
        setCountVectorsFeaturizerMinNGram(val["min_ngram"]);
        setCountVectorsFeaturizerMaxNGram(val["max_ngram"]);
        setCountVectorsFeaturizerOOVToken(val["OOV_token"]);
        setCountVectorsFeaturizerSharedVocab(val["use_shared_vocab"]);
        setCountVectorsFeaturizerTextSize(
          val["additional_vocabulary_size"]["text"]
        );
        setCountVectorsFeaturizerResponseSize(
          val["additional_vocabulary_size"]["response"]
        );
        setCountVectorsFeaturizerActionTextSize(
          val["additional_vocabulary_size"]["action_text"]
        );
      } else if (val["name"] === "LexicalSyntacticFeaturizer") {
        lexicalSyntacticF = true;
        setLexicalSyntacticFeaturizerBeforeCheckedValues(val["features"][0]);
        setLexicalSyntacticFeaturizerTokenCheckedValues(val["features"][1]);
        setLexicalSyntacticFeaturizerAfterCheckedValues(val["features"][2]);
      } else if (
        val["name"] === "rasa_nlu_examples.featurizers.dense.GensimFeaturizer"
      ) {
        gensimF = true;
        // not implemented since not currently in use
      } else if (val["name"] === "MitieIntentClassifier") {
        mitieC = true;
      } else if (val["name"] === "LogisticRegressionClassifier") {
        logisticC = true;
        // not implemented since not currently in use
      } else if (val["name"] === "SklearnIntentClassifier") {
        skLearnC = true;
        setSklearnIntentClassifierC1(val["C"][0]);
        setSklearnIntentClassifierC2(val["C"][1]);
        setSklearnIntentClassifierC3(val["C"][2]);
        setSklearnIntentClassifierC4(val["C"][3]);
        setSklearnIntentClassifierC5(val["C"][4]);
        setSklearnIntentClassifierC6(val["C"][5]);
        setSklearnIntentClassifierKernels(val["kernels"]);
        setSklearnIntentClassifierGamma(val["gamma"]);
        setSklearnIntentClassifierMaxFolds(val["max_cross_validation_folds"]);
        setSklearnIntentClassifierScoringFunc(val["scoring_function"]);
      } else if (val["name"] === "KeywordIntentClassifier") {
        keywordC = true;
        setKeywordIntentClassifierCaseSensitive(val["case_sensitive"]);
      } else if (val["name"] === "DIETClassifier") {
        dietC = true;
        setDIETClassifierEpochs(val["epochs"]);
        setDIETClassifierEntityRecognition(val["entity_recognition"]);
        setDIETClassifierIntentClassification(val["intent_classification"]);
      } else if (val["name"] === "FallbackClassifier") {
        fallbackC = true;
        setFallbackClassifierThreshold(val["threshold"]);
      } else if (val["name"] === "MitieEntityExtractor") {
        mitieE = true;
      } else if (val["name"] === "SpacyEntityExtractor") {
        spacyE = true;
        setSpacyEntityExtractorDimensionsCheckedValues(val["dimensions"]);
      } else if (val["name"] === "CRFEntityExtractor") {
        crfE = true;
        setCRFEntityExtractorFlag(val["BILOU_flag"]);
        setCRFEntityExtractorBeforeCheckedValues(val["features"][0]);
        setCRFEntityExtractorTokenCheckedValues(val["features"][1]);
        setCRFEntityExtractorAfterCheckedValues(val["features"][2]);
        setCRFEntityExtractorMaxIterations(val["max_iterations"]);
        setCRFEntityExtractorL1(val["L1_c"]);
        setCRFEntityExtractorL2(val["L2_c"]);
        setCRFEntityExtractorSplitAddress(
          val["split_entities_by_comma"]["address"]
        );
        setCRFEntityExtractorSplitEmail(
          val["split_entities_by_comma"]["email"]
        );
      } else if (val["name"] === "DucklingEntityExtractor") {
        ducklingE = true;
        // not implemented since not currently in use
      } else if (val["name"] === "RegexEntityExtractor") {
        regexE = true;
        setRegexEntityExtractorCaseSensitive(val["case_sensitive"]);
        setRegexEntityExtractorLookupTables(val["use_lookup_tables"]);
        setRegexEntityExtractorRegexes(val["use_regexes"]);
        setRegexEntityExtractorWordBoundaries(val["use_word_boundaries"]);
      } else if (val["name"] === "EntitySynonymMapper") {
        entityE = true;
      }
    });

    Promise.all(setting).then(() => {
      setLanguageModelValues({
        mitieLM: mitieLM,
        spacyLM: spacyLM,
      });
      setFeaturizerValues({
        mitieF: mitieF,
        spacyF: spacyF,
        convertF: convertF,
        languageModelF: languageModelF,
        regexF: regexF,
        countVectorsF: countVectorsF,
        lexicalSyntacticF: lexicalSyntacticF,
        gensimF: gensimF,
      });
      setClassifierValues({
        mitieC: mitieC,
        logisticC: logisticC,
        skLearnC: skLearnC,
        keywordC: keywordC,
        dietC: dietC,
        fallbackC: fallbackC,
      });
      setExtractorValues({
        mitieE: mitieE,
        spacyE: spacyE,
        crfE: crfE,
        ducklingE: ducklingE,
        regexE: regexE,
        entityE: entityE,
      });
    });
  };

  const setIndividualPolicyComponent = (obj) => {
    // POLICY COMPONENTS
    // policy values
    var tedP = false;
    var unexpectedP = false;
    var memoizationP = false;
    var augmentedMP = false;
    var ruleP = false;

    const setting = obj.map((val) => {
      if (val["name"] === "TEDPolicy") {
        tedP = true;
        setTEDPolicyEpochs(val["epochs"]);
        setTEDPolicyMaxHistory(val["max_history"]);
        setTEDPolicySplitByComma(val["split_entities_by_comma"]);
        setTEDPolicyConstrainSimilarities(val["constrain_similarities"]);
      } else if (val["name"] === "UnexpecTEDIntentPolicy") {
        unexpectedP = true;
        setUnexpecTEDIntentPolicyEpochs(val["epochs"]);
        setUnexpecTEDIntentPolicyMaxHistory(val["max_history"]);
      } else if (val["name"] === "MemoizationPolicy") {
        memoizationP = true;
        setMemoizationPolicyMaxHistory(val["max_history"]);
      } else if (val["name"] === "AugmentedMemoizationPolicy") {
        augmentedMP = true;
        setAugmentedMemoizationPolicyMaxHistory(val["max_history"]);
      } else if (val["name"] === "RulePolicy") {
        ruleP = true;
        setRulePolicyThreshold(val["core_fallback_threshold"]);
        setRulePolicyEnablePrediction(val["enable_fallback_prediction"]);
        setRulePolicyRestrictRules(val["restrict_rules"]);
        setRulePolicyCheckContradictions(val["check_for_contradictions"]);
      }
    });

    Promise.all(setting).then(() => {
      setPolicyValues({
        tedP: tedP,
        unexpectedP: unexpectedP,
        memoizationP: memoizationP,
        augmentedMP: augmentedMP,
        ruleP: ruleP,
      });
    });
  };

  useEffect(() => {
    setActiveLink("", "configs");

    axios
      .get(`${configs.getModelListEnpoint}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setTrainModels(res.data["model_list"]);
      });
  }, []);

  useEffect(() => {
    var tempArray = [];
    axios
      .get(`${configs.getModelListEnpoint}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        console.log(res.data);
        for (var i = 0; i < res.data["model_list"].length; i++) {
          tempArray.push(res.data["model_list"][i]["model_id"]);
          // tempArray.push(String(res.data["model_list"][i]["model_id"]).replace(".tar.gz", "")); // if needed to remove the ext
        }
      })
      .finally(() => {
        setModelNamesConfig(tempArray);
      });
  }, []);

  return (
    <>
      <div className="app-main app-main-configs">
        <Box className="main-section m-0 p-0" id="main-section-configs">
          <ConfigurationsPageTitle />
          <div className="row row-cols-1 row-cols-lg-1 mt-3">
            <AppTile
              bgcolor=""
              align="justify-content-start"
              margin="me-0 me-lg-0"
              icon="tune"
              iconColor="material-green-f"
              count=""
              title="Pipeline and Policy Configurations"
              content="Configure your own pipeline and policies right here!"
              button={{
                button: false,
              }}
              customButton=""
            />
          </div>
        </Box>

        <Box className="row align-items-md-stretch p-0 container-middle container-bg overflow-hidden mt-4">
          <Box
            className="shadow-sm p-4"
            sx={{ width: "100%" }}>
            <Stack direction="row">
              <Box className="col col-8" sx={{ marginY: "auto" }}>
                <Stack direction="column" spacing={0.3}>
                  <Typography
                    variant="h6"
                    className="float-start h-100 mt-1 dime-page-title">
                    Choose Configuration from existing models
                  </Typography>
                  <p>
                    Instead of configuring models from scratch, choose
                    configurations of previous models
                  </p>
                </Stack>
              </Box>
              <Box
                className="col col-4"
                sx={{ marginY: "auto", marginX: "auto", display: "flex" }}
                alignContent="center">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "60px",
                  }}>
                  {loadingSetConfig && (
                    <CircularProgress
                      color="inherit"
                      style={{ float: "right" }}
                    />
                  )}
                </div>
                <TextField
                  fullWidth={true}
                  value={chosenModel}
                  onChange={handleChosenModelChange}
                  select // tell TextField to render select
                  label="Existing Models"
                  className="TokenizerDropDowns float-end"
                  style={{ float: "right" }}>
                  <MenuItem value="custom_settings">Custom Settings</MenuItem>
                  {modelNamesConfig?.map((val) => {
                    return (
                      <MenuItem key={val} value={val}>
                        {val}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Box>
            </Stack>
          </Box>
        </Box>

        <form onSubmit={trainModel}>
          <Box className="row align-items-md-stretch p-3 container-middle container-bg overflow-hidden mt-4">
            <Box sx={{ width: "100%" }}>
              <Stack direction="column" spacing={0.3}>
                <Typography
                  variant="h6"
                  className="float-start h-100 mt-1 dime-page-title"
                >
                  Pipeline Components
                </Typography>
                <p>
                  You can configure your pipeline components from scratch. For
                  further details regarding the components refer{" "}
                  <a
                    href={docLinks.pipelineConfig}
                    target="_blank"
                    rel="noreferrer"
                    className="material-green-f"
                    style={{ textDecoration: "none" }}
                  >
                    <kbd className="material-green">kolloqe docs</kbd>
                  </a>
                </p>
              </Stack>
            </Box>
            <Box
              className=""
              sx={{ width: "100%" }}>
              <Stack direction="row">
                <Box className="col col-4" sx={{ marginTop: 4 }}>
                  <Stack direction="column">
                    {/* <Box className="mb-4">
                      <FormControl component="fieldset" variant="standard">
                        <FormLabel
                          className="white-to-black-ease"
                          component="legend"
                        >
                          Language Models
                        </FormLabel>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={spacyLM}
                                onChange={handleLanguageModelChange}
                                name="spacyLM"
                              />
                            }
                            label="SpacyNLP"
                          />
                        </FormGroup>
                      </FormControl>
                    </Box> */}
                    <Box className="mb-4">
                      <FormControl>
                        <FormLabel
                          className="white-to-black-ease"
                          id="demo-controlled-radio-buttons-group"
                        >
                          Tokenizers
                        </FormLabel>
                        <RadioGroup
                          aria-labelledby="demo-controlled-radio-buttons-group"
                          name="controlled-radio-buttons-group"
                          value={tokenizerValue}
                          onChange={handleTokenizerChange}
                        >
                          {appSinhala === true ? (
                            <>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={tokenMappingValue}
                                    onChange={handleTokenMappingChange}
                                    name="tokenMapping"
                                  />
                                }
                                label="Token Mapping"
                              />
                              {tokenMappingValue ? (
                                <FormControlLabel
                                  value="SEETMTokenizer"
                                  control={<Radio />}
                                  label="SEETMTokenizer"
                                />
                              ) : (
                                <FormControlLabel
                                  value="WhitespaceTokenizer"
                                  control={<Radio />}
                                  label="WhitespaceTokenizer"
                                />
                              )}
                            </>
                          ) : (
                            <FormControlLabel
                              value="WhitespaceTokenizer"
                              control={<Radio />}
                              label="WhitespaceTokenizer"
                            />
                          )}
                          {/* <FormControlLabel
                            value="SpacyTokenizer"
                            control={<Radio />}
                            label="SpacyTokenizer"
                          /> */}
                        </RadioGroup>
                      </FormControl>
                    </Box>
                    <Box className="mb-4">
                      <FormControl component="fieldset" variant="standard">
                        <FormLabel
                          className="white-to-black-ease"
                          component="legend"
                        >
                          Featurizers
                        </FormLabel>
                        <FormGroup>
                          {/* <FormControlLabel
                            control={
                              <Checkbox
                                checked={spacyF}
                                onChange={handleFeaturizerChange}
                                name="spacyF"
                              />
                            }
                            label="SpacyFeaturizer"
                          /> */}
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={regexF}
                                onChange={handleFeaturizerChange}
                                name="regexF"
                              />
                            }
                            label="RegexFeaturizer"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={countVectorsF}
                                onChange={handleFeaturizerChange}
                                name="countVectorsF"
                              />
                            }
                            label="CountVectorsFeaturizer"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={lexicalSyntacticF}
                                onChange={handleFeaturizerChange}
                                name="lexicalSyntacticF"
                              />
                            }
                            label="LexicalSyntacticFeaturizer"
                          />
                        </FormGroup>
                      </FormControl>
                    </Box>
                    <Box className="mb-4">
                      <FormControl component="fieldset" variant="standard">
                        <FormLabel
                          className="white-to-black-ease"
                          component="legend"
                        >
                          Classifiers
                        </FormLabel>
                        <FormGroup>
                          {/* <FormControlLabel
                            control={
                              <Checkbox
                                checked={keywordC}
                                onChange={handleClassifierChange}
                                name="keywordC"
                              />
                            }
                            label="KeywordIntentClassifier"
                          /> */}
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={dietC}
                                onChange={handleClassifierChange}
                                name="dietC"
                              />
                            }
                            label="DIETClassifier"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={fallbackC}
                                onChange={handleClassifierChange}
                                name="fallbackC"
                              />
                            }
                            label="FallbackClassifier"
                          />
                        </FormGroup>
                      </FormControl>
                    </Box>
                    <Box className="mb-4">
                      <FormControl component="fieldset" variant="standard">
                        <FormLabel
                          className="white-to-black-ease"
                          component="legend"
                        >
                          Extractors
                        </FormLabel>
                        <FormGroup>
                          {/* <FormControlLabel
                            control={
                              <Checkbox
                                checked={spacyE}
                                onChange={handleExtractorChange}
                                name="spacyE"
                              />
                            }
                            label="SpacyEntityExtractor"
                          /> */}
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={crfE}
                                onChange={handleExtractorChange}
                                name="crfE"
                              />
                            }
                            label="CRFEntityExtractor"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={regexE}
                                onChange={handleExtractorChange}
                                name="regexE"
                              />
                            }
                            label="RegexEntityExtractor"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={entityE}
                                onChange={handleExtractorChange}
                                name="entityE"
                              />
                            }
                            label="EntitySynonymMapper"
                          />
                        </FormGroup>
                      </FormControl>
                    </Box>
                  </Stack>
                </Box>
                <Box className="col col-8 mt-5">
                  <Stack direction="column">
                    {/* <Box className="mb-4"> */}
                    <Box>
                      {mitieLM && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",
                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            MitieNLP
                            <br />
                            <br />
                            <TextField
                              value={mitieNLPModelPath}
                              onChange={handleMitieNLPModelPathChange}
                              variant="outlined"
                              label="Path to Model"
                              className="TokenizerDropDowns"
                            />
                          </Card>
                        </Container>
                      )}

                      {spacyLM && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx material-onyx"
                            sx={{
                              height: "fit-content",
                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            SpacyNLP
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={spacyNLPModelLang}
                                  onChange={handleSpacyNLPModelLangChange}
                                  select // tell TextField to render select
                                  label="Language"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="ca_core_news_sm">
                                    Catalan
                                  </MenuItem>
                                  <MenuItem value="zh_core_web_sm">
                                    Chinese
                                  </MenuItem>
                                  <MenuItem value="da_core_news_sm">
                                    Danish
                                  </MenuItem>
                                  <MenuItem value="nl_core_news_sm">
                                    Dutch
                                  </MenuItem>
                                  <MenuItem value="en_core_web_sm">
                                    English
                                  </MenuItem>
                                  <MenuItem value="fr_core_news_sm">
                                    French
                                  </MenuItem>
                                  <MenuItem value="de_core_news_sm">
                                    German
                                  </MenuItem>
                                  <MenuItem value="el_core_news_sm">
                                    Greek
                                  </MenuItem>
                                  <MenuItem value="it_core_news_sm">
                                    Italian
                                  </MenuItem>
                                  <MenuItem value="ja_core_news_sm">
                                    Japanese
                                  </MenuItem>
                                  <MenuItem value="lt_core_news_sm">
                                    Lithuanian
                                  </MenuItem>
                                  <MenuItem value="mk_core_news_sm">
                                    Macedonian
                                  </MenuItem>
                                  <MenuItem value="xx_ent_wiki_sm">
                                    Multi-language
                                  </MenuItem>
                                  <MenuItem value="nb_core_news_sm">
                                    Norwegian Bokmål
                                  </MenuItem>
                                  <MenuItem value="pl_core_news_sm">
                                    Polish
                                  </MenuItem>
                                  <MenuItem value="pt_core_news_sm">
                                    Portuguese
                                  </MenuItem>
                                  <MenuItem value="ro_core_news_sm">
                                    Romanian
                                  </MenuItem>
                                  <MenuItem value="ru_core_news_sm">
                                    Russia
                                  </MenuItem>
                                  <MenuItem value="es_core_news_sm">
                                    Spanish
                                  </MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 ps-1">
                                <TextField
                                  fullWidth={true}
                                  value={spacyNLPCaseSensitive}
                                  onChange={handleSpacyNLPCaseSensitiveChange}
                                  select // tell TextField to render select
                                  label="Case Sensitive"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value={false}>False</MenuItem>
                                  <MenuItem value>True</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}
                    </Box>
                    <Box className="mb-4">
                      {tokenizerValue === "WhitespaceTokenizer" && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            WhitespaceTokenizer
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={whitespaceTokenizerFlag}
                                  onChange={handleWhitespaceTokenizerFlagChange}
                                  select // tell TextField to render select
                                  label="Intent Tokenization Flag"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value={false}>False</MenuItem>
                                  <MenuItem value>True</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 ps-1">
                                <TextField
                                  fullWidth={true}
                                  value={whitespaceTokenizerSplitSymbol}
                                  onChange={
                                    handleWhitespaceTokenizerSplitSymbolChange
                                  }
                                  select // tell TextField to render select
                                  label="Intent Split Symbol"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="_">_</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 px-1">
                                <TextField
                                  fullWidth={true}
                                  value={whitespaceTokenizerTokenPattern}
                                  onChange={
                                    handleWhitespaceTokenizerTokenPatternChange
                                  }
                                  select // tell TextField to render select
                                  label="Token Pattern"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value=" ">None</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {tokenizerValue === "JiebaTokenizer" && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            JiebaTokenizer
                            <br />
                            <br />
                            **implement dictionary path here
                            <br />
                            <br />
                            <TextField
                              value={jiebaTokenizerFlag}
                              onChange={handleJiebaTokenizerFlagChange}
                              select // tell TextField to render select
                              label="Intent Tokenization Flag"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value={false}>False</MenuItem>
                              <MenuItem value>True</MenuItem>
                            </TextField>
                            <TextField
                              value={jiebaTokenizerSplitSymbol}
                              onChange={handleJiebaTokenizerSplitSymbolChange}
                              select // tell TextField to render select
                              label="Intent Split Symbol"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value="_">_</MenuItem>
                            </TextField>
                            <TextField
                              value={jiebaTokenizerTokenPattern}
                              onChange={handleJiebaTokenizerTokenPatternChange}
                              select // tell TextField to render select
                              label="Token Pattern"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value=" ">None</MenuItem>
                            </TextField>
                          </Card>
                        </Container>
                      )}

                      {tokenizerValue === "MitieTokenizer" && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            MitieTokenizer
                            <br />
                            <br />
                            <TextField
                              value={mitieTokenizerFlag}
                              onChange={handleMitieTokenizerFlagChange}
                              select // tell TextField to render select
                              label="Intent Tokenization Flag"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value={false}>False</MenuItem>
                              <MenuItem value>True</MenuItem>
                            </TextField>
                            <TextField
                              value={mitieTokenizerSplitSymbol}
                              onChange={handleMitieTokenizerSplitSymbolChange}
                              select // tell TextField to render select
                              label="Intent Split Symbol"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value="_">_</MenuItem>
                            </TextField>
                            <TextField
                              value={mitieTokenizerTokenPattern}
                              onChange={handleMitieTokenizerTokenPatternChange}
                              select // tell TextField to render select
                              label="Token Pattern"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value=" ">None</MenuItem>
                            </TextField>
                          </Card>
                        </Container>
                      )}

                      {tokenizerValue === "SpacyTokenizer" && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            SpacyTokenizers
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={spacyTokenizerFlag}
                                  onChange={handleSpacyTokenizerFlagChange}
                                  select // tell TextField to render select
                                  label="Intent Tokenization Flag"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value={false}>False</MenuItem>
                                  <MenuItem value>True</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 px-1">
                                <TextField
                                  fullWidth={true}
                                  value={spacyTokenizerSplitSymbol}
                                  onChange={
                                    handleSpacyTokenizerSplitSymbolChange
                                  }
                                  select // tell TextField to render select
                                  label="Intent Split Symbol"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="_">_</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 ps-1">
                                <TextField
                                  fullWidth={true}
                                  value={spacyTokenizerTokenPattern}
                                  onChange={
                                    handleSpacyTokenizerTokenPatternChange
                                  }
                                  select // tell TextField to render select
                                  label="Token Pattern"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value=" ">None</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {tokenizerValue === "SEETMTokenizer" && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            SEETMTokenizer
                            <br />
                            <br />
                            <p className="material-smoke-f">
                              No configurations needed
                            </p>
                          </Card>
                        </Container>
                      )}
                    </Box>
                    <Box className="mb-4">
                      {mitieF && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            MitieFeaturizer
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={mitieFeaturizerPooling}
                                  onChange={handleMitieFeaturizerPoolingChange}
                                  select // tell TextField to render select
                                  label="Pooling"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="mean">Mean</MenuItem>
                                  <MenuItem value="max">Max</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {spacyF && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            SpacyFeaturizer
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={spacyFeaturizerPooling}
                                  onChange={handleSpacyFeaturizerPoolingChange}
                                  select // tell TextField to render select
                                  label="Pooling"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="mean">Mean</MenuItem>
                                  <MenuItem value="max">Max</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {convertF && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            ConveRTFeaturizer
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={conveRTFeaturizerModelUrl}
                                  onChange={
                                    handleConveRTFeaturizerModelUrlChange
                                  }
                                  variant="outlined"
                                  label="Model URL"
                                  className="TokenizerDropDowns"
                                />
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {languageModelF && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            LanguageModelFeaturizer
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={languageModelFeaturizerModelName}
                                  onChange={
                                    handleLanguageModelFeaturizerModelNameChange
                                  }
                                  select // tell TextField to render select
                                  label="Language Model"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="bert">BERT</MenuItem>
                                  <MenuItem value="gpt">GPT</MenuItem>
                                  <MenuItem value="gpt2">GPT2</MenuItem>
                                  <MenuItem value="xlnet">XLNet</MenuItem>
                                  <MenuItem value="distilbert">
                                    DistilBERT
                                  </MenuItem>
                                  <MenuItem value="roberta">RoBERTa</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 px-1">
                                <TextField
                                  fullWidth={true}
                                  value={languageModelFeaturizerModelWeight}
                                  onChange={
                                    handleLanguageModelFeaturizerModelWeightChange
                                  }
                                  select // tell TextField to render select
                                  label="Language Model Weight"
                                  className="TokenizerDropDowns"
                                >
                                  {languageModelFeaturizerModelWeightOptions}
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 ps-1">
                                <TextField
                                  fullWidth={true}
                                  value={languageModelFeaturizerCacheDir}
                                  onChange={
                                    handleLanguageModelFeaturizerCacheDirChange
                                  }
                                  select // tell TextField to render select
                                  label="Cache Directory"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="null">NULL</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {regexF && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            RegexFeaturizer
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={regexFeaturizerCaseSensitive}
                                  onChange={
                                    handleRegexFeaturizerCaseSensitiveChange
                                  }
                                  select // tell TextField to render select
                                  label="Case Sensitive"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value={false}>False</MenuItem>
                                  <MenuItem value>True</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={regexFeaturizerWordBoundaries}
                                  onChange={
                                    handleRegexFeaturizerWordBoundariesChange
                                  }
                                  select // tell TextField to render select
                                  label="Use Word Boundaries"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value={false}>False</MenuItem>
                                  <MenuItem value>True</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                            {/* <Stack direction="row">
                              <Box className="w-100 py-3 pe-1">
                                <Checkbox
                                  checked={regexFeaturizerHidePatternsTextField}
                                  onChange={
                                    handleRegexFeaturizerHidePatternsTextFieldChange
                                  }
                                  name="regexFeaturizerHidePatternsTextField"
                                />
                                <TextField
                                  fullWidth={true}
                                  style={{ width: "390px" }}
                                  type="number"
                                  value={regexFeaturizerNumOfPatterns}
                                  onChange={
                                    handleRegexFeaturizerNumOfPatternsChange
                                  }
                                  variant="outlined"
                                  label="Number of Additional Patterns"
                                  disabled={
                                    !regexFeaturizerHidePatternsTextField
                                  }
                                  error={regexFeaturizerNumOfPatternsError}
                                  helperText={
                                    regexFeaturizerNumOfPatternsError
                                      ? "Number of Additional Patterns should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack> */}
                          </Card>
                        </Container>
                      )}

                      {countVectorsF && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            CountVectorsFeaturizer
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={countVectorsFeaturizerAnalyzer}
                                  onChange={
                                    handleCountVectorsFeaturizerAnalyzerChange
                                  }
                                  select // tell TextField to render select
                                  label="Analyzer"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="word">word</MenuItem>
                                  <MenuItem value="char">char</MenuItem>
                                  <MenuItem value="char_wb">char_wb</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={countVectorsFeaturizerMinNGram}
                                  onChange={
                                    handleCountVectorsFeaturizerMinNGramChange
                                  }
                                  variant="outlined"
                                  label="Min N-gram"
                                  className="TokenizerDropDowns"
                                  error={countVectorsFeaturizerMinNGramError}
                                  helperText={
                                    countVectorsFeaturizerMinNGramError
                                      ? "Min N-gram value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={countVectorsFeaturizerMaxNGram}
                                  onChange={
                                    handleCountVectorsFeaturizerMaxNGramChange
                                  }
                                  variant="outlined"
                                  label="Max N-gram"
                                  className="TokenizerDropDowns"
                                  error={countVectorsFeaturizerMaxNGramError}
                                  helperText={
                                    countVectorsFeaturizerMaxNGramError
                                      ? "Max N-gram value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={countVectorsFeaturizerOOVToken}
                                  onChange={
                                    handleCountVectorsFeaturizerOOVTokenChange
                                  }
                                  select // tell TextField to render select
                                  label="OOV Token"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value="None">None</MenuItem>
                                  <MenuItem value="_oov_">_oov_</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={countVectorsFeaturizerSharedVocab}
                                  onChange={
                                    handleCountVectorsFeaturizerSharedVocabChange
                                  }
                                  select // tell TextField to render select
                                  label="Use Shared Vocab"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value={false}>False</MenuItem>
                                  <MenuItem value>True</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={countVectorsFeaturizerTextSize}
                                  onChange={
                                    handleCountVectorsFeaturizerTextSizeChange
                                  }
                                  variant="outlined"
                                  label="Additional Vocabulary Text Size"
                                  className="TokenizerDropDowns"
                                  error={countVectorsFeaturizerTextSizeError}
                                  helperText={
                                    countVectorsFeaturizerTextSizeError
                                      ? "Additional Vocabulary Text Size value should be greater than 999"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={countVectorsFeaturizerResponseSize}
                                  onChange={
                                    handleCountVectorsFeaturizerResponseSizeChange
                                  }
                                  variant="outlined"
                                  label="Additional Vocabulary Response Text Size"
                                  className="TokenizerDropDowns"
                                  error={
                                    countVectorsFeaturizerResponseSizeError
                                  }
                                  helperText={
                                    countVectorsFeaturizerResponseSizeError
                                      ? "Additional Vocabulary Response Text Size value should be greater than 999"
                                      : null
                                  }
                                />
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={countVectorsFeaturizerActionTextSize}
                                  onChange={
                                    handleCountVectorsFeaturizerActionTextSizeChange
                                  }
                                  variant="outlined"
                                  label="Additional Vocabulary Action Text Size"
                                  className="TokenizerDropDowns"
                                  error={
                                    countVectorsFeaturizerActionTextSizeError
                                  }
                                  helperText={
                                    countVectorsFeaturizerActionTextSizeError
                                      ? "Additional Vocabulary Action Text Size value should be greater than 999"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {lexicalSyntacticF && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            LexicalSyntacticFeaturizer
                            <br />
                            <br />
                            <p className="material-smoke-f">
                              No configurations needed
                            </p>
                            {/* <Stack direction="row">
                              <Box className="w-100 py-3 pe-1">
                                <FormControl
                                  required
                                  error={
                                    lexicalSyntacticFeaturizerBeforeValuesError
                                  }
                                  component="fieldset"
                                  variant="standard"
                                >
                                  <FormLabel component="legend">
                                    Features for Before Token
                                  </FormLabel>
                                  <FormGroup>
                                    <Stack direction="row">
                                      <Box className="w-50 py-3 pe-1">
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              // className="lexicalSyntacticFeaturizerCheckBox"
                                              checked={beforeBOS}
                                              onChange={
                                                handleLexicalSyntacticFeaturizerBeforeChange
                                              }
                                              name="beforeBOS"
                                              value="BOS"
                                            />
                                          }
                                          label="BOS"
                                        />
                                      </Box>
                                      <Box className="w-50 py-3 pe-1">
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              // className="lexicalSyntacticFeaturizerCheckBox"
                                              checked={beforeEOS}
                                              onChange={
                                                handleLexicalSyntacticFeaturizerBeforeChange
                                              }
                                              name="beforeEOS"
                                              value="EOS"
                                            />
                                          }
                                          label="EOS"
                                        />
                                      </Box>
                                      <Box className="w-50 py-3 pe-1">
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              className="lexicalSyntacticFeaturizerCheckBox"
                                              checked={beforeLow}
                                              onChange={
                                                handleLexicalSyntacticFeaturizerBeforeChange
                                              }
                                              name="beforeLow"
                                              value="low"
                                            />
                                          }
                                          label="low"
                                        />
                                      </Box>
                                      <Box className="w-50 py-3 pe-1">
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              className="lexicalSyntacticFeaturizerCheckBox"
                                              checked={beforeUpper}
                                              onChange={
                                                handleLexicalSyntacticFeaturizerBeforeChange
                                              }
                                              name="beforeUpper"
                                              value="upper"
                                            />
                                          }
                                          label="upper"
                                        />
                                      </Box>
                                      <Box className="w-50 py-3 pe-1">
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              className="lexicalSyntacticFeaturizerCheckBox"
                                              checked={beforeTitle}
                                              onChange={
                                                handleLexicalSyntacticFeaturizerBeforeChange
                                              }
                                              name="beforeTitle"
                                              value="title"
                                            />
                                          }
                                          label="title"
                                        />
                                      </Box>
                                      <Box className="w-50 py-3 pe-1">
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              className="lexicalSyntacticFeaturizerCheckBox"
                                              checked={beforeDigit}
                                              onChange={
                                                handleLexicalSyntacticFeaturizerBeforeChange
                                              }
                                              name="beforeDigit"
                                              value="digit"
                                            />
                                          }
                                          label="digit"
                                        />
                                      </Box>
                                    </Stack>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          className="lexicalSyntacticFeaturizerCheckBox"
                                          checked={beforePrefix5}
                                          onChange={
                                            handleLexicalSyntacticFeaturizerBeforeChange
                                          }
                                          name="beforePrefix5"
                                          value="prefix5"
                                        />
                                      }
                                      label="prefix5"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          className="lexicalSyntacticFeaturizerCheckBox"
                                          checked={beforePrefix2}
                                          onChange={
                                            handleLexicalSyntacticFeaturizerBeforeChange
                                          }
                                          name="beforePrefix2"
                                          value="prefix2"
                                        />
                                      }
                                      label="prefix2"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          className="lexicalSyntacticFeaturizerCheckBox"
                                          checked={beforeSuffix5}
                                          onChange={
                                            handleLexicalSyntacticFeaturizerBeforeChange
                                          }
                                          name="beforeSuffix5"
                                          value="suffix5"
                                        />
                                      }
                                      label="suffix5"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          className="lexicalSyntacticFeaturizerCheckBox"
                                          checked={beforeSuffix3}
                                          onChange={
                                            handleLexicalSyntacticFeaturizerBeforeChange
                                          }
                                          name="beforeSuffix3"
                                          value="suffix3"
                                        />
                                      }
                                      label="suffix3"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          className="lexicalSyntacticFeaturizerCheckBox"
                                          checked={beforeSuffix2}
                                          onChange={
                                            handleLexicalSyntacticFeaturizerBeforeChange
                                          }
                                          name="beforeSuffix2"
                                          value="suffix2"
                                        />
                                      }
                                      label="suffix2"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          className="lexicalSyntacticFeaturizerCheckBox"
                                          checked={beforeSuffix1}
                                          onChange={
                                            handleLexicalSyntacticFeaturizerBeforeChange
                                          }
                                          name="beforeSuffix1"
                                          value="suffix1"
                                        />
                                      }
                                      label="suffix1"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          className="lexicalSyntacticFeaturizerCheckBox"
                                          checked={beforePos}
                                          onChange={
                                            handleLexicalSyntacticFeaturizerBeforeChange
                                          }
                                          name="beforePos"
                                          value="pos"
                                        />
                                      }
                                      label="pos"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          className="lexicalSyntacticFeaturizerCheckBox"
                                          checked={beforePos2}
                                          onChange={
                                            handleLexicalSyntacticFeaturizerBeforeChange
                                          }
                                          name="beforePos2"
                                          value="pos2"
                                        />
                                      }
                                      label="pos2"
                                    />
                                  </FormGroup>
                                  <FormHelperText>
                                    Choose atleast one Before Token Feature
                                  </FormHelperText>
                                </FormControl>
                              </Box>
                            </Stack> */}
                            {/* <FormControl
                              required
                              error={lexicalSyntacticFeaturizerTokenValuesError}
                              component="fieldset"
                              variant="standard"
                            >
                              <FormLabel component="legend">
                                Features for Current Token
                              </FormLabel>
                              <FormGroup className="lexicalSyntacticFeaturizerFormGroup">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenBOS}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenBOS"
                                      value="BOS"
                                    />
                                  }
                                  label="BOS"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenEOS}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenEOS"
                                      value="EOS"
                                    />
                                  }
                                  label="EOS"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenLow}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenLow"
                                      value="low"
                                    />
                                  }
                                  label="low"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenUpper}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenUpper"
                                      value="upper"
                                    />
                                  }
                                  label="upper"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenTitle}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenTitle"
                                      value="title"
                                    />
                                  }
                                  label="title"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenDigit}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenDigit"
                                      value="digit"
                                    />
                                  }
                                  label="digit"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenPrefix5}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenPrefix5"
                                      value="prefix5"
                                    />
                                  }
                                  label="prefix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenPrefix2}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenPrefix2"
                                      value="prefix2"
                                    />
                                  }
                                  label="prefix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenSuffix5}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenSuffix5"
                                      value="suffix5"
                                    />
                                  }
                                  label="suffix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenSuffix3}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenSuffix3"
                                      value="suffix3"
                                    />
                                  }
                                  label="suffix3"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenSuffix2}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenSuffix2"
                                      value="suffix2"
                                    />
                                  }
                                  label="suffix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenSuffix1}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenSuffix1"
                                      value="suffix1"
                                    />
                                  }
                                  label="suffix1"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenPos}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenPos"
                                      value="pos"
                                    />
                                  }
                                  label="pos"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={tokenPos2}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerTokenChange
                                      }
                                      name="tokenPos2"
                                      value="pos2"
                                    />
                                  }
                                  label="pos2"
                                />
                              </FormGroup>
                              <FormHelperText>
                                Choose atleast one Current Token Feature
                              </FormHelperText>
                            </FormControl>
                            <br />
                            <br />
                            <FormControl
                              required
                              error={lexicalSyntacticFeaturizerAfterValuesError}
                              component="fieldset"
                              variant="standard"
                            >
                              <FormLabel component="legend">
                                Features for After Token
                              </FormLabel>
                              <FormGroup className="lexicalSyntacticFeaturizerFormGroup">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterBOS}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterBOS"
                                      value="BOS"
                                    />
                                  }
                                  label="BOS"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterEOS}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterEOS"
                                      value="EOS"
                                    />
                                  }
                                  label="EOS"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterLow}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterLow"
                                      value="low"
                                    />
                                  }
                                  label="low"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterUpper}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterUpper"
                                      value="upper"
                                    />
                                  }
                                  label="upper"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterTitle}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterTitle"
                                      value="title"
                                    />
                                  }
                                  label="title"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterDigit}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterDigit"
                                      value="digit"
                                    />
                                  }
                                  label="digit"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterPrefix5}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterPrefix5"
                                      value="prefix5"
                                    />
                                  }
                                  label="prefix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterPrefix2}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterPrefix2"
                                      value="prefix2"
                                    />
                                  }
                                  label="prefix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterSuffix5}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterSuffix5"
                                      value="suffix5"
                                    />
                                  }
                                  label="suffix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterSuffix3}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterSuffix3"
                                      value="suffix3"
                                    />
                                  }
                                  label="suffix3"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterSuffix2}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterSuffix2"
                                      value="suffix2"
                                    />
                                  }
                                  label="suffix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterSuffix1}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterSuffix1"
                                      value="suffix1"
                                    />
                                  }
                                  label="suffix1"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterPos}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterPos"
                                      value="pos"
                                    />
                                  }
                                  label="pos"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={afterPos2}
                                      onChange={
                                        handleLexicalSyntacticFeaturizerAfterChange
                                      }
                                      name="afterPos2"
                                      value="pos2"
                                    />
                                  }
                                  label="pos2"
                                />
                              </FormGroup>
                              <FormHelperText>
                                Choose atleast one After Token Feature
                              </FormHelperText>
                            </FormControl> */}
                          </Card>
                        </Container>
                      )}

                      {gensimF && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            GensimFeaturizer
                            <br />
                            <br />
                            <Checkbox
                              checked={gensimFeaturizerHideCacheDir}
                              onChange={
                                handleGensimFeaturizerHideCacheDirChange
                              }
                              name="gensimFeaturizerHideCacheDir"
                            />
                            <TextField
                              value={gensimFeaturizerCacheDir}
                              onChange={handleGensimFeaturizerCacheDirChange}
                              variant="outlined"
                              label="Cache Directory"
                              className="TokenizerDropDowns"
                              disabled={!gensimFeaturizerHideCacheDir}
                              error={gensimFeaturizerCacheDirError}
                              helperText={
                                gensimFeaturizerCacheDirError
                                  ? "A proper path needs to be provided for Cache Directory"
                                  : null
                              }
                            />
                            <br />
                            <br />
                            <Checkbox
                              checked={gensimFeaturizerHideFile}
                              onChange={handleGensimFeaturizerHideFileChange}
                              name="gensimFeaturizerHideFile"
                            />
                            <TextField
                              value={gensimFeaturizerFile}
                              onChange={handleGensimFeaturizerFileChange}
                              variant="outlined"
                              label="File"
                              className="TokenizerDropDowns"
                              disabled={!gensimFeaturizerHideFile}
                              error={gensimFeaturizerFileError}
                              helperText={
                                gensimFeaturizerFileError
                                  ? "A proper File name needs to be provided"
                                  : null
                              }
                            />
                          </Card>
                        </Container>
                      )}
                    </Box>
                    <Box className="mb-4">
                      {mitieC && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            MitieIntentClassifier
                          </Card>
                        </Container>
                      )}

                      {logisticC && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            LogisticRegressionClassifier
                            <TextField
                              type="number"
                              value={logisticRegressionClassifierMaxIter}
                              onChange={
                                handleLogisticRegressionClassifierMaxIterChange
                              }
                              variant="outlined"
                              label="Max Iterations"
                              className="TokenizerDropDowns"
                              error={logisticRegressionClassifierMaxIterError}
                              helperText={
                                logisticRegressionClassifierMaxIterError
                                  ? "Max Iterations value should be a positive number"
                                  : null
                              }
                            />
                            <br />
                            <br />
                            <TextField
                              value={logisticRegressionClassifierSolver}
                              onChange={
                                handleLogisticRegressionClassifierSolverChange
                              }
                              select // tell TextField to render select
                              label="Solver"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value="lbfgs">lbfgs</MenuItem>
                              <MenuItem value="newton-cg">newton-cg</MenuItem>
                              <MenuItem value="liblinear">liblinear</MenuItem>
                              <MenuItem value="sag">sag</MenuItem>
                              <MenuItem value="saga">saga</MenuItem>
                            </TextField>
                            <br />
                            <br />
                            <TextField
                              type="number"
                              inputProps={{ step: ".0001" }}
                              value={logisticRegressionClassifierTol}
                              onChange={
                                handleLogisticRegressionClassifierTolChange
                              }
                              variant="outlined"
                              label="Tolerance"
                              className="TokenizerDropDowns"
                              error={logisticRegressionClassifierTolError}
                              helperText={
                                logisticRegressionClassifierTolError
                                  ? "Tolerance value should be a number between 0 and 1"
                                  : null
                              }
                            />
                            <br />
                            <br />
                            <Checkbox
                              checked={
                                logisticRegressionClassifierHideTextField
                              }
                              onChange={
                                handleLogisticRegressionClassifierHideTextFieldChange
                              }
                              name="logisticRegressionClassifierHideTextField"
                            />
                            <TextField
                              style={{ width: "390px" }}
                              type="number"
                              value={logisticRegressionClassifierRandomState}
                              onChange={
                                handleLogisticRegressionClassifierRandomStateChange
                              }
                              variant="outlined"
                              label="Random State"
                              disabled={
                                !logisticRegressionClassifierHideTextField
                              }
                              error={
                                logisticRegressionClassifierRandomStateError
                              }
                              helperText={
                                logisticRegressionClassifierRandomStateError
                                  ? "Random State value should be a positive number"
                                  : null
                              }
                            />
                          </Card>
                        </Container>
                      )}

                      {skLearnC && (
                        <Container className="m-0 p-0">
                          <Card
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            SklearnIntentClassifier
                            <br />
                            <br />
                            <TextField
                              type="number"
                              value={sklearnIntentClassifierC1}
                              onChange={handleSklearnIntentClassifierC1Change}
                              variant="outlined"
                              label="First C Value"
                              className="TokenizerDropDowns"
                              error={sklearnIntentClassifierC1Error}
                              helperText={
                                sklearnIntentClassifierC1Error
                                  ? "C1 value should be a positive number"
                                  : null
                              }
                            />
                            <TextField
                              type="number"
                              value={sklearnIntentClassifierC2}
                              onChange={handleSklearnIntentClassifierC2Change}
                              variant="outlined"
                              label="Second C Value"
                              className="TokenizerDropDowns"
                              error={sklearnIntentClassifierC2Error}
                              helperText={
                                sklearnIntentClassifierC2Error
                                  ? "C2 value should be a positive number"
                                  : null
                              }
                            />
                            <TextField
                              type="number"
                              value={sklearnIntentClassifierC3}
                              onChange={handleSklearnIntentClassifierC3Change}
                              variant="outlined"
                              label="Third C Value"
                              className="TokenizerDropDowns"
                              error={sklearnIntentClassifierC3Error}
                              helperText={
                                sklearnIntentClassifierC3Error
                                  ? "C3 value should be a positive number"
                                  : null
                              }
                            />
                            <TextField
                              type="number"
                              value={sklearnIntentClassifierC4}
                              onChange={handleSklearnIntentClassifierC4Change}
                              variant="outlined"
                              label="Fourth C Value"
                              className="TokenizerDropDowns"
                              error={sklearnIntentClassifierC4Error}
                              helperText={
                                sklearnIntentClassifierC4Error
                                  ? "C4 value should be a positive number"
                                  : null
                              }
                            />
                            <TextField
                              type="number"
                              value={sklearnIntentClassifierC5}
                              onChange={handleSklearnIntentClassifierC5Change}
                              variant="outlined"
                              label="Fifth C Value"
                              className="TokenizerDropDowns"
                              error={sklearnIntentClassifierC5Error}
                              helperText={
                                sklearnIntentClassifierC5Error
                                  ? "C5 value should be a positive number"
                                  : null
                              }
                            />
                            <TextField
                              type="number"
                              value={sklearnIntentClassifierC6}
                              onChange={handleSklearnIntentClassifierC6Change}
                              variant="outlined"
                              label="Sixth C Value"
                              className="TokenizerDropDowns"
                              error={sklearnIntentClassifierC6Error}
                              helperText={
                                sklearnIntentClassifierC6Error
                                  ? "C6 value should be a positive number"
                                  : null
                              }
                            />
                            <br />
                            <br />
                            <TextField
                              value={sklearnIntentClassifierKernels}
                              onChange={
                                handleSklearnIntentClassifierKernelsChange
                              }
                              select // tell TextField to render select
                              label="Kernel"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value="linear">linear</MenuItem>
                              <MenuItem value="poly">poly</MenuItem>
                              <MenuItem value="rbf">rbf</MenuItem>
                              <MenuItem value="sigmoid">sigmoid</MenuItem>
                              <MenuItem value="precomputed">
                                precomputed
                              </MenuItem>
                            </TextField>
                            <br />
                            <br />
                            <TextField
                              type="number"
                              inputProps={{ step: ".1" }}
                              value={sklearnIntentClassifierGamma}
                              onChange={
                                handleSklearnIntentClassifierGammaChange
                              }
                              variant="outlined"
                              label="Gamma Value"
                              className="TokenizerDropDowns"
                              error={sklearnIntentClassifierGammaError}
                              helperText={
                                sklearnIntentClassifierGammaError
                                  ? "Gamma value should be a number between 0 and 1"
                                  : null
                              }
                            />
                            <br />
                            <br />
                            <TextField
                              type="number"
                              value={sklearnIntentClassifierMaxFolds}
                              onChange={
                                handleSklearnIntentClassifierMaxFoldsChange
                              }
                              variant="outlined"
                              label="Max Cross Validation Folds"
                              className="TokenizerDropDowns"
                              error={sklearnIntentClassifierMaxFoldsError}
                              helperText={
                                sklearnIntentClassifierMaxFoldsError
                                  ? "Max Cross Validation Folds value should be a positive number"
                                  : null
                              }
                            />
                            <br />
                            <br />
                            <TextField
                              value={sklearnIntentClassifierScoringFunc}
                              onChange={
                                handleSklearnIntentClassifierScoringFuncChange
                              }
                              select // tell TextField to render select
                              label="Scoring Function"
                              className="TokenizerDropDowns"
                            >
                              <MenuItem value="f1_weighted">
                                f1_weighted
                              </MenuItem>
                              <MenuItem value="accuracy">accuracy</MenuItem>
                              <MenuItem value="balanced_accuracy">
                                balanced_accuracy
                              </MenuItem>
                              <MenuItem value="top_k_accuracy">
                                top_k_accuracy
                              </MenuItem>
                              <MenuItem value="average_precision">
                                average_precision
                              </MenuItem>
                              <MenuItem value="neg_brier_score">
                                neg_brier_score
                              </MenuItem>
                              <MenuItem value="f1">f1</MenuItem>
                              <MenuItem value="f1_micro">f1_micro</MenuItem>
                              <MenuItem value="f1_macro">f1_macro</MenuItem>
                              <MenuItem value="f1_samples">f1_samples</MenuItem>
                              <MenuItem value="neg_log_loss">
                                neg_log_loss
                              </MenuItem>
                              <MenuItem value="precision">precision</MenuItem>
                              <MenuItem value="recall">recall</MenuItem>
                              <MenuItem value="jaccard">jaccard</MenuItem>
                              <MenuItem value="roc_auc">roc_auc</MenuItem>
                              <MenuItem value="roc_auc_ovr">
                                roc_auc_ovr
                              </MenuItem>
                              <MenuItem value="roc_auc_ovo">
                                roc_auc_ovo
                              </MenuItem>
                              <MenuItem value="roc_auc_ovr_weighted">
                                roc_auc_ovr_weighted
                              </MenuItem>
                              <MenuItem value="roc_auc_ovo_weighted">
                                roc_auc_ovo_weighted
                              </MenuItem>
                            </TextField>
                          </Card>
                        </Container>
                      )}

                      {keywordC && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            KeywordIntentClassifier
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={keywordIntentClassifierCaseSensitive}
                                  onChange={
                                    handleKeywordIntentClassifierCaseSensitiveChange
                                  }
                                  select // tell TextField to render select
                                  label="Case Sensitive"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {dietC && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            DIETClassifier
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={DIETClassifierEpochs}
                                  onChange={handleDIETClassifierEpochsChange}
                                  variant="outlined"
                                  label="Epochs"
                                  className="TokenizerDropDowns"
                                  error={DIETClassifierEpochsError}
                                  helperText={
                                    DIETClassifierEpochsError
                                      ? "Epochs value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                              <Box className="w-50 py-3 ps-1">
                                <TextField
                                  fullWidth={true}
                                  value={DIETClassifierEntityRecognition}
                                  onChange={
                                    handleDIETClassifierEntityRecognitionChange
                                  }
                                  select // tell TextField to render select
                                  label="Entity Recognition"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 px-1">
                                <TextField
                                  fullWidth={true}
                                  value={DIETClassifierIntentClassification}
                                  onChange={
                                    handleDIETClassifierIntentClassificationChange
                                  }
                                  select // tell TextField to render select
                                  label="Intent Classification"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {fallbackC && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            FallbackClassifier
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  inputProps={{ step: ".1" }}
                                  value={fallbackClassifierThreshold}
                                  onChange={
                                    handleFallbackClassifierThresholdChange
                                  }
                                  variant="outlined"
                                  label="Threshold"
                                  className="TokenizerDropDowns"
                                  error={fallbackClassifierThresholdError}
                                  helperText={
                                    fallbackClassifierThresholdError
                                      ? "Threshold value should be a number between 0 and 1"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}
                    </Box>
                    <Box className="mb-2">
                      {mitieE && (
                        <Container className="m-0 p-0">
                          <Card
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            MitieEntityExtractor
                          </Card>
                        </Container>
                      )}

                      {spacyE && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            SpacyEntityExtractor
                            <FormControl
                              component="fieldset"
                              variant="standard"
                            >
                              <FormLabel component="legend">
                                Dimensions to Extract
                              </FormLabel>
                              <FormGroup sx={{ height: "50px", width: "35vw" }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={person}
                                      onChange={
                                        handleSpacyEntityExtractorDimensionsChange
                                      }
                                      name="person"
                                      value="PERSON"
                                    />
                                  }
                                  label="PERSON"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={loc}
                                      onChange={
                                        handleSpacyEntityExtractorDimensionsChange
                                      }
                                      name="loc"
                                      value="LOC"
                                    />
                                  }
                                  label="LOC"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={org}
                                      onChange={
                                        handleSpacyEntityExtractorDimensionsChange
                                      }
                                      name="org"
                                      value="ORG"
                                    />
                                  }
                                  label="ORG"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={product}
                                      onChange={
                                        handleSpacyEntityExtractorDimensionsChange
                                      }
                                      name="product"
                                      value="PRODUCT"
                                    />
                                  }
                                  label="PRODUCT"
                                />
                              </FormGroup>
                            </FormControl>
                          </Card>
                        </Container>
                      )}

                      {crfE && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            CRFEntityExtractor
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={CRFEntityExtractorFlag}
                                  onChange={handleCRFEntityExtractorFlagChange}
                                  select // tell TextField to render select
                                  label="BILOU Flag"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                              {/* </Stack> */}
                              {/* <FormControl
                              required
                              error={CRFEntityExtractorBeforeValuesError}
                              component="fieldset"
                              variant="standard"
                            >
                              <FormLabel component="legend">
                                Before Features
                              </FormLabel>
                              <FormGroup className="lexicalSyntacticFeaturizerFormGroup">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeLow}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeLow"
                                      value="low"
                                    />
                                  }
                                  label="low"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeUpper}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeUpper"
                                      value="upper"
                                    />
                                  }
                                  label="upper"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeTitle}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeTitle"
                                      value="title"
                                    />
                                  }
                                  label="title"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeDigit}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeDigit"
                                      value="digit"
                                    />
                                  }
                                  label="digit"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforePrefix5}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforePrefix5"
                                      value="prefix5"
                                    />
                                  }
                                  label="prefix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforePrefix2}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforePrefix2"
                                      value="prefix2"
                                    />
                                  }
                                  label="prefix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeSuffix5}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeSuffix5"
                                      value="suffix5"
                                    />
                                  }
                                  label="suffix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeSuffix3}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeSuffix3"
                                      value="suffix3"
                                    />
                                  }
                                  label="suffix3"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeSuffix2}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeSuffix2"
                                      value="suffix2"
                                    />
                                  }
                                  label="suffix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeSuffix1}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeSuffix1"
                                      value="suffix1"
                                    />
                                  }
                                  label="suffix1"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforePos}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforePos"
                                      value="pos"
                                    />
                                  }
                                  label="pos"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforePos2}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforePos2"
                                      value="pos2"
                                    />
                                  }
                                  label="pos2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforePattern}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforePattern"
                                      value="pattern"
                                    />
                                  }
                                  label="pattern"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorBeforeBias}
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeBias"
                                      value="bias"
                                    />
                                  }
                                  label="bias"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        CRFEntityExtractorBeforeTextDenseFeatures
                                      }
                                      onChange={
                                        handleCRFEntityExtractorBeforeChange
                                      }
                                      name="CRFEntityExtractorBeforeTextDenseFeatures"
                                      value="text_dense_features"
                                    />
                                  }
                                  label="text_dense_features"
                                />
                              </FormGroup>
                              <FormHelperText>
                                Choose atleast one Before Feature
                              </FormHelperText>
                            </FormControl>
                            <br />
                            <br /> */}
                              {/* <FormControl
                              required
                              error={CRFEntityExtractorTokenValuesError}
                              component="fieldset"
                              variant="standard"
                            >
                              <FormLabel component="legend">
                                Token Features
                              </FormLabel>
                              <FormGroup className="lexicalSyntacticFeaturizerFormGroup">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenLow}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenLow"
                                      value="low"
                                    />
                                  }
                                  label="low"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenUpper}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenUpper"
                                      value="upper"
                                    />
                                  }
                                  label="upper"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenTitle}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenTitle"
                                      value="title"
                                    />
                                  }
                                  label="title"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenDigit}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenDigit"
                                      value="digit"
                                    />
                                  }
                                  label="digit"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenPrefix5}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenPrefix5"
                                      value="prefix5"
                                    />
                                  }
                                  label="prefix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenPrefix2}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenPrefix2"
                                      value="prefix2"
                                    />
                                  }
                                  label="prefix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenSuffix5}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenSuffix5"
                                      value="suffix5"
                                    />
                                  }
                                  label="suffix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenSuffix3}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenSuffix3"
                                      value="suffix3"
                                    />
                                  }
                                  label="suffix3"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenSuffix2}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenSuffix2"
                                      value="suffix2"
                                    />
                                  }
                                  label="suffix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenSuffix1}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenSuffix1"
                                      value="suffix1"
                                    />
                                  }
                                  label="suffix1"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenPos}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenPos"
                                      value="pos"
                                    />
                                  }
                                  label="pos"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenPos2}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenPos2"
                                      value="pos2"
                                    />
                                  }
                                  label="pos2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenPattern}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenPattern"
                                      value="pattern"
                                    />
                                  }
                                  label="pattern"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorTokenBias}
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenBias"
                                      value="bias"
                                    />
                                  }
                                  label="bias"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        CRFEntityExtractorTokenTextDenseFeatures
                                      }
                                      onChange={
                                        handleCRFEntityExtractorTokenChange
                                      }
                                      name="CRFEntityExtractorTokenTextDenseFeatures"
                                      value="text_dense_features"
                                    />
                                  }
                                  label="text_dense_features"
                                />
                              </FormGroup>
                              <FormHelperText>
                                Choose atleast one Token Feature
                              </FormHelperText>
                            </FormControl>
                            <br />
                            <br /> */}
                              {/* <FormControl
                              required
                              error={CRFEntityExtractorAfterValuesError}
                              component="fieldset"
                              variant="standard"
                            >
                              <FormLabel component="legend">
                                After Features
                              </FormLabel>
                              <FormGroup className="lexicalSyntacticFeaturizerFormGroup">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterLow}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterLow"
                                      value="low"
                                    />
                                  }
                                  label="low"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterUpper}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterUpper"
                                      value="upper"
                                    />
                                  }
                                  label="upper"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterTitle}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterTitle"
                                      value="title"
                                    />
                                  }
                                  label="title"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterDigit}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterDigit"
                                      value="digit"
                                    />
                                  }
                                  label="digit"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterPrefix5}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterPrefix5"
                                      value="prefix5"
                                    />
                                  }
                                  label="prefix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterPrefix2}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterPrefix2"
                                      value="prefix2"
                                    />
                                  }
                                  label="prefix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterSuffix5}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterSuffix5"
                                      value="suffix5"
                                    />
                                  }
                                  label="suffix5"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterSuffix3}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterSuffix3"
                                      value="suffix3"
                                    />
                                  }
                                  label="suffix3"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterSuffix2}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterSuffix2"
                                      value="suffix2"
                                    />
                                  }
                                  label="suffix2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterSuffix1}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterSuffix1"
                                      value="suffix1"
                                    />
                                  }
                                  label="suffix1"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterPos}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterPos"
                                      value="pos"
                                    />
                                  }
                                  label="pos"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterPos2}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterPos2"
                                      value="pos2"
                                    />
                                  }
                                  label="pos2"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterPattern}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterPattern"
                                      value="pattern"
                                    />
                                  }
                                  label="pattern"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={CRFEntityExtractorAfterBias}
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterBias"
                                      value="bias"
                                    />
                                  }
                                  label="bias"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        CRFEntityExtractorAfterTextDenseFeatures
                                      }
                                      onChange={
                                        handleCRFEntityExtractorAfterChange
                                      }
                                      name="CRFEntityExtractorAfterTextDenseFeatures"
                                      value="text_dense_features"
                                    />
                                  }
                                  label="text_dense_features"
                                />
                              </FormGroup>
                              <FormHelperText>
                                Choose atleast one After Feature
                              </FormHelperText>
                            </FormControl> */}
                              {/* <Stack direction="row"> */}
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={CRFEntityExtractorMaxIterations}
                                  onChange={
                                    handleCRFEntityExtractorMaxIterationsChange
                                  }
                                  variant="outlined"
                                  label="Max Iterations"
                                  className="TokenizerDropDowns"
                                />
                              </Box>
                            </Stack>
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  inputProps={{ step: ".1" }}
                                  value={CRFEntityExtractorL1}
                                  onChange={handleCRFEntityExtractorL1Change}
                                  variant="outlined"
                                  label="L1 Regularization Weight"
                                  className="TokenizerDropDowns"
                                />
                              </Box>
                              <Box className="w-50 py-3 ps-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  inputProps={{ step: ".1" }}
                                  value={CRFEntityExtractorL2}
                                  onChange={handleCRFEntityExtractorL2Change}
                                  variant="outlined"
                                  label="L2 Regularization Weight"
                                  className="TokenizerDropDowns"
                                />
                              </Box>
                            </Stack>
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={CRFEntityExtractorSplitAddress}
                                  onChange={
                                    handleCRFEntityExtractorSplitAddressChange
                                  }
                                  select // tell TextField to render select
                                  label="Split Entities by Comma : Address"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value={false}>False</MenuItem>
                                  <MenuItem value>True</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 px-1">
                                <TextField
                                  fullWidth={true}
                                  value={CRFEntityExtractorSplitEmail}
                                  onChange={
                                    handleCRFEntityExtractorSplitEmailChange
                                  }
                                  select // tell TextField to render select
                                  label="Split Entities by Comma : Email"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {ducklingE && (
                        <Container className="m-0 p-0">
                          <Card
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            DucklingEntityExtractor
                            <br />
                            <br />
                            <TextField
                              type="number"
                              value={ducklingEntityExtractorPortNo}
                              onChange={
                                handleDucklingEntityExtractorPortNoChange
                              }
                              variant="outlined"
                              label="Port Number"
                              className="TokenizerDropDowns"
                            />
                            <br />
                            <br />
                            <FormControl
                              required
                              error={
                                ducklingEntityExtractorDimensionsValuesError
                              }
                              component="fieldset"
                              variant="standard"
                            >
                              <FormLabel component="legend">
                                Dimensions
                              </FormLabel>
                              <FormGroup className="spacyEntityExtractorFormGroup">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={ducklingEntityExtractorTime}
                                      onChange={
                                        handleDucklingEntityExtractorDimensionsChange
                                      }
                                      name="ducklingEntityExtractorTime"
                                      value="time"
                                    />
                                  }
                                  label="time"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={ducklingEntityExtractorNumber}
                                      onChange={
                                        handleDucklingEntityExtractorDimensionsChange
                                      }
                                      name="ducklingEntityExtractorNumber"
                                      value="upper"
                                    />
                                  }
                                  label="upper"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={ducklingEntityExtractorMoney}
                                      onChange={
                                        handleDucklingEntityExtractorDimensionsChange
                                      }
                                      name="ducklingEntityExtractorMoney"
                                      value="title"
                                    />
                                  }
                                  label="title"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={ducklingEntityExtractorDistance}
                                      onChange={
                                        handleDucklingEntityExtractorDimensionsChange
                                      }
                                      name="ducklingEntityExtractorDistance"
                                      value="digit"
                                    />
                                  }
                                  label="digit"
                                />
                              </FormGroup>
                              <FormHelperText>
                                Choose atleast one Dimension
                              </FormHelperText>
                            </FormControl>
                            <br />
                            <br />
                            <TextField
                              type="number"
                              value={ducklingEntityExtractorTimeout}
                              onChange={
                                handleDucklingEntityExtractorTimeoutChange
                              }
                              variant="outlined"
                              label="Timeout"
                              className="TokenizerDropDowns"
                            />
                          </Card>
                        </Container>
                      )}

                      {regexE && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            RegexEntityExtractor
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={regexEntityExtractorCaseSensitive}
                                  onChange={
                                    handleRegexEntityExtractorCaseSensitiveChange
                                  }
                                  select // tell TextField to render select
                                  label="Case Sensitive"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value={false}>False</MenuItem>
                                  <MenuItem value>True</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 px-1">
                                <TextField
                                  fullWidth={true}
                                  value={regexEntityExtractorLookupTables}
                                  onChange={
                                    handleRegexEntityExtractorLookupTablesChange
                                  }
                                  select // tell TextField to render select
                                  label="Use Lookup Tables"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={regexEntityExtractorRegexes}
                                  onChange={
                                    handleRegexEntityExtractorRegexesChange
                                  }
                                  select // tell TextField to render select
                                  label="Use Regexes"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 px-1">
                                <TextField
                                  fullWidth={true}
                                  value={regexEntityExtractorWordBoundaries}
                                  onChange={
                                    handleRegexEntityExtractorWordBoundariesChange
                                  }
                                  select // tell TextField to render select
                                  label="Use Word Boundaries"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {entityE && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            EntitySynonymMapper
                            <br />
                            <br />
                            <p className="material-smoke-f">
                              No configurations needed
                            </p>
                          </Card>
                        </Container>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box className="row align-items-md-stretch p-3 container-middle container-bg overflow-hidden mt-4">
            <Box sx={{ width: "100%" }}>
              <Stack direction="column" spacing={0.3}>
                <Typography
                  variant="h6"
                  className="float-start h-100 mt-1 dime-page-title">
                  Policy Components
                </Typography>
                <p>
                  You can configure your policy components from scratch. For
                  further details regarding the components refer{" "}
                  <a
                    href={docLinks.policyConfig}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <kbd className="material-green">kolloqe docs</kbd>
                  </a>
                </p>
              </Stack>
            </Box>
            <Box
              className=""
              sx={{ width: "100%" }}>
              <Stack direction="row">
                <Box className="col col-4 mb-2" sx={{ marginTop: 4 }}>
                  <Stack direction="column">
                    <Box className="m-0">
                      <FormControl component="fieldset" variant="standard">
                        <FormLabel
                          className="white-to-black-ease"
                          component="legend">
                          Policies
                        </FormLabel>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={tedP}
                                onChange={handlePolicyChange}
                                name="tedP"
                                value="TEDPolicy"
                              />
                            }
                            label="TEDPolicy"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={unexpectedP}
                                onChange={handlePolicyChange}
                                name="unexpectedP"
                                value="UnexpecTEDIntentPolicy"
                              />
                            }
                            label="UnexpecTEDIntentPolicy"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={memoizationP}
                                onChange={handlePolicyChange}
                                name="memoizationP"
                                value="MemoizationPolicy"
                              />
                            }
                            label="MemoizationPolicy"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={augmentedMP}
                                onChange={handlePolicyChange}
                                name="augmentedMP"
                                value="AugmentedMemoizationPolicy"
                              />
                            }
                            label="AugmentedMemoizationPolicy"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={ruleP}
                                onChange={handlePolicyChange}
                                name="ruleP"
                                value="RulePolicy"
                              />
                            }
                            label="RulePolicy"
                          />
                        </FormGroup>
                      </FormControl>
                    </Box>
                  </Stack>
                </Box>
                <Box className="col col-8 mt-5">
                  <Stack direction="column">
                    <Box className="mb-2">
                      {tedP && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            TEDPolicy
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={TEDPolicyEpochs}
                                  onChange={handleTEDPolicyEpochsChange}
                                  variant="outlined"
                                  label="Epochs"
                                  className="TokenizerDropDowns"
                                  error={TEDPolicyEpochsError}
                                  helperText={
                                    TEDPolicyEpochsError
                                      ? "Epoch value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={TEDPolicyMaxHistory}
                                  onChange={handleTEDPolicyMaxHistoryChange}
                                  variant="outlined"
                                  label="Max History"
                                  className="TokenizerDropDowns"
                                  error={TEDPolicyMaxHistoryError}
                                  helperText={
                                    TEDPolicyMaxHistoryError
                                      ? "Max History value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={TEDPolicySplitByComma}
                                  onChange={handleTEDPolicySplitByCommaChange}
                                  select // tell TextField to render select
                                  label="Split Entities By Comma"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={TEDPolicyConstrainSimilarities}
                                  onChange={
                                    handleTEDPolicyConstrainSimilaritiesChange
                                  }
                                  select // tell TextField to render select
                                  label="Constrain Similarities"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {unexpectedP && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            UnexpecTEDIntentPolicy
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={unexpecTEDIntentPolicyEpochs}
                                  onChange={
                                    handleUnexpecTEDIntentPolicyEpochsChange
                                  }
                                  variant="outlined"
                                  label="Epochs"
                                  className="TokenizerDropDowns"
                                  error={unexpecTEDIntentPolicyEpochsError}
                                  helperText={
                                    unexpecTEDIntentPolicyEpochsError
                                      ? "Epoch value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={unexpecTEDIntentPolicyMaxHistory}
                                  onChange={
                                    handleUnexpecTEDIntentPolicyMaxHistoryChange
                                  }
                                  variant="outlined"
                                  label="Max History"
                                  className="TokenizerDropDowns"
                                  error={unexpecTEDIntentPolicyMaxHistoryError}
                                  helperText={
                                    unexpecTEDIntentPolicyMaxHistoryError
                                      ? "Max History value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {memoizationP && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            MemoizationPolicy
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  value={memoizationPolicyMaxHistory}
                                  onChange={
                                    handleMemoizationPolicyMaxHistoryChange
                                  }
                                  variant="outlined"
                                  label="Max History"
                                  className="TokenizerDropDowns"
                                  error={memoizationPolicyMaxHistoryError}
                                  helperText={
                                    memoizationPolicyMaxHistoryError
                                      ? "Max History value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {augmentedMP && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            AugmentedMemoizationPolicy
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  type="number"
                                  value={augmentedMemoizationPolicyMaxHistory}
                                  onChange={
                                    handleAugmentedMemoizationPolicyMaxHistoryChange
                                  }
                                  variant="outlined"
                                  label="Max History"
                                  className="TokenizerDropDowns"
                                  error={
                                    augmentedMemoizationPolicyMaxHistoryError
                                  }
                                  helperText={
                                    augmentedMemoizationPolicyMaxHistoryError
                                      ? "Max History value should be a positive number"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}

                      {ruleP && (
                        <Container className="m-0 p-0">
                          <Card
                            className="container-bg  material-onyx"
                            sx={{
                              height: "fit-content",

                              borderRadius: "16px",
                              borderColor: "#d7d7d7",
                              padding: "20px 30px 20px 30px",
                              marginBottom: "10px",
                            }}
                          >
                            RulePolicy
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  type="number"
                                  inputProps={{ step: ".1" }}
                                  value={rulePolicyThreshold}
                                  onChange={handleRulePolicyThresholdChange}
                                  variant="outlined"
                                  label="Core Fallback Threshold"
                                  className="TokenizerDropDowns"
                                  error={rulePolicyThresholdError}
                                  helperText={
                                    rulePolicyThresholdError
                                      ? "Threshold value should be a value between 0.1 and 1.0"
                                      : null
                                  }
                                />
                              </Box>
                            </Stack>
                            <Stack direction="row">
                              <Box className="w-50 py-3 pe-1">
                                <TextField
                                  fullWidth={true}
                                  value={rulePolicyEnablePrediction}
                                  onChange={
                                    handleRulePolicyEnablePredictionChange
                                  }
                                  select // tell TextField to render select
                                  label="Enable Fallback Prediction"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 ps-1">
                                <TextField
                                  fullWidth={true}
                                  value={rulePolicyRestrictRules}
                                  onChange={handleRulePolicyRestrictRulesChange}
                                  select // tell TextField to render select
                                  label="Restrict Rules"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                              <Box className="w-50 py-3 px-1">
                                <TextField
                                  fullWidth={true}
                                  value={rulePolicyCheckContradictions}
                                  onChange={
                                    handleRulePolicyCheckContradictionsChange
                                  }
                                  select // tell TextField to render select
                                  label="Check for Contradictions"
                                  className="TokenizerDropDowns"
                                >
                                  <MenuItem value>True</MenuItem>
                                  <MenuItem value={false}>False</MenuItem>
                                </TextField>
                              </Box>
                            </Stack>
                          </Card>
                        </Container>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box>
            {modelTrainLoading ? (
              <Stack direction="row" spacing={1} className={"float-end"}>
                <LoadingButton
                  loading
                  loadingPosition="start"
                  startIcon={<ModelTraining />}
                  variant="outlined"
                  className="float-end explanation-loading-button"
                  size="1.5rem"
                  sx={{ height: "2.4rem" }}
                  disabled
                >
                  Train Model
                </LoadingButton>
                <Button
                  variant="outlined"
                  className="float-end app-button app-button-red ms-2"
                  sx={{ border: "none", "&:hover": { border: "none" } }}
                  startIcon={<Cancel />}
                  onClick={abortTrain}
                >
                  Abort
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} className={"float-end"}>
                <Button
                  variant="outlined"
                  className="float-end app-button app-button-steel"
                  sx={{ border: "none", "&:hover": { border: "none" } }}
                  startIcon={<ModelTraining />}
                  onClick={trainModel}
                >
                  Train Model
                </Button>
                <Button
                  variant="outlined"
                  className="float-end app-button app-button-red"
                  sx={{ border: "none", "&:hover": { border: "none" } }}
                  startIcon={<RestartAlt />}
                  onClick={setComponentsToFalse}
                >
                  Reset
                </Button>
              </Stack>
            )}

            {/* {modelTrainLoading ? (
              <div
                style={{
                  // float: "right",
                  // paddingTop: "2vh",
                  // marginRight: "2vw",
                  float: "right",
                  height: "9vh",
                  width: "15vw",
                  paddingTop: "2vh",
                }}
              >
                <Stack
                  direction="row-reverse"
                  spacing={2}
                  justifyContent="end"
                  alignItems="center"
                >
                  <Button
                    // style={{ margin: "0px 5px 0px 0px" }}
                    variant="outlined"
                    className="float-end app-button app-button-red explanation-list-button ml-5"
                    sx={{
                      border: "none",
                      "&:hover": { border: "none" },
                    }}
                    startIcon={<Cancel />}
                    onClick={abortTrain}
                  >
                    Cancel
                  </Button>
                  <CircularProgress size="4vh" className="float-end" />
                </Stack>
              </div>
            ) : (
              <div
                style={{
                  float: "right",
                  height: "9vh",
                  width: "15vw",
                  paddingTop: "2vh",
                }}
              >
                <Button
                  variant="outlined"
                  className="float-end app-button app-button-steel explanation-list-button"
                  sx={{
                    border: "none",
                    "&:hover": { border: "none" },
                  }}
                  startIcon={<ModelTraining />}
                  onClick={trainModel}
                >
                  Train Model
                </Button>
              </div>
            )} */}
          </Box>

          <div style={{ clear: "both" }} />
        </form>

        <Snackbar
          open={openTraingModelSuccessAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Model persisted
          </Alert>
        </Snackbar>
        <Snackbar
          open={openTraingModelFailAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Training failed
          </Alert>
        </Snackbar>
        <Snackbar
          open={openCancelTraingModelSuccessAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Model training aborted
          </Alert>
        </Snackbar>
        <Snackbar
          open={openCancelTraingModelFailAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
           Failed to abort training
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSpacyTokenizerAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Using SpacyTokenizer requires SpacyNLP
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSpacyFeaturizerAlert}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Using SpacyFeaturizer requires SpacyNLP
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSpacyEntityExtractorAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Using SpacyEntityExtractor requires SpacyNLP
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSpacyFeaturizerTokenizerAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Using SpacyFeaturizer requires SpacyTokenizer
          </Alert>
        </Snackbar>
        <Snackbar
          open={openFormNotSubmittedAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Error: Unable to submit form
          </Alert>
        </Snackbar>
        <Snackbar
          open={openModelConfigFailAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Error: Unable to save model configuration
          </Alert>
        </Snackbar>
        <Snackbar
          open={openUnknownModelFailAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Error: An unknown error occured
          </Alert>
        </Snackbar>
        <Snackbar
          open={openSetConfigFailAlert}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: `${configs.snackbarVerticalPosition}`,
            horizontal: `${configs.snackbarHorizontalPostion}`,
          }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Error: Unable to set configurations
          </Alert>
        </Snackbar>
      </div>
    </>
  );
}
