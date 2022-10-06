# RASA Codeless Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/) starting with version 0.0.1a1

## [2.1.0] - 2022-10-07
### Improvements
- replaced `Curve Modal` with `MUI Drawer`
- refined the appearance of the learning curves
- added `learning curve insights`
- implemented `learning curve explainer` algorithm 

### Bugfixes
- fixed a bug where test accuracy was not being displayed


## [2.0.0] - 2022-09-26
### Deprecations and Removals
- `MongoDB Botstore`, the default model data storage is now deprecated and replaced with `Local Botstore` to reduce latency
- version text updating on frontend is removed and is fully handled from the backend
- `/model/all` API route is now deprecated. Use `/botstore/models` to retrieve model data
- `/model/<name>` and `/download/<name>` API routes are now deprecated. Use `/botstore/model/<model>` with `DELETE` and `GET` requests to delete and download botstore models
- `rasa init` will is deprecated as the CLI automatically creates the initial directories

### Improvements
- enabled `data_source_path` argument passing for `training queue` initialization
- `tensorboard` utilities can automatically handle missing scalars
- frontend UI improvements for `configurations` UI
- `version model` UI refinements
- added `botstore`, a local model data handling module
- replaced `/config/update` API route with `/bot/train`
- replaced `/config/abort` API route with `/bot/abort`
- replaced `/model/curve/<model>` API route with `/botstore/curve/<model>`
- replaced `/model/config/<model>` API route with `/botstore/config/<model>`
- replaced `/model/<name>` and `/download/<name>` API routes with `/botstore/models/<model>`
- added a new API route `/botstore/models` to get botstore model data
- added a new API route `/botstore/nlu` to get botstore nlu data
- moved `botsore` modules to `core` from `utils`
- moved `training queue` module to `core` from `utils`
- added support for automatically creating initial dirs without having to explicitly run `rasa init`

### Bugfixes
- fixed `version` inconsistency in the dev console by directly taking the version from the backend
- fixed `documentation url` inconsistencies in the dev console by directly defining the urls in the backend
- fixed `api url` inconsistencies in the dev console by directly defining the urls in the backend
- fixed `textfield` value bugs
- added missing requirements to `rasa codeless` python package
- removed `./` from default path constants to avoid path joining bugs


## [1.0.1] - 2022-09-07
### Bugfixes
- fixed `rasac init` dir structure
- removed `dime_xai` from `rasac` dependencies


## [1.0.0] - 2022-09-07
### Improvements
- added support for loss curve based evaluation

### Bugfixes
- refined training queue data source path


## [0.0.1a2] - 2022-09-05
### Improvements
- changed RASAC logos and favicons

### Bugfixes
- removed custom Rasa components
- updated `rasa init` dir structure to include `tensorboard` results
- updated init dir instructions and readmes


## [0.0.1a1] - 2022-09-03
### Features
- added the main `CLI`
- added the `RASAC server GUI`
- added `quiet mode` to `RASAC server`
- `GUI` fully supports building RASA NLU pipelines
- supports training models by configuring pipeline and policy components using the `GUI`
- supports training the models without having to use `CLI` commands
- provide model management to view and manage all trained models using the `GUI`
- all trained models can be evaluated using the auto generated learning curves for `DIET classifiers`
