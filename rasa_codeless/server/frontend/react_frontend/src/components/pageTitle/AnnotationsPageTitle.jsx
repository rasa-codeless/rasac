import { DataObject, Save, Upload } from '@mui/icons-material';
import { Button, Snackbar, Tooltip, Typography } from '@mui/material';
import React, { Component } from 'react';
import axios from "axios";
import MuiAlert from "@mui/material/Alert";
import { LoadingButton } from '@mui/lab';
import { configs } from '../../configs';

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

export default class AnnotationsPageTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingInProgress: false,
      importingKBInProgress: false,
      exportingKBInProgress: false,
      snackbarIsOpen: false,
      snackbarMessage: "",
      snackbarType: "success",
    };

    this.handleSaveTaggedEntities = this.handleSaveTaggedEntities.bind(this);
    this.handleExportKB = this.handleExportKB.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleSnackbarClose(event) {
    this.setState({ snackbarIsOpen: false });
  }

  handleSaveTaggedEntities(event) {
    this.props.hideAppNotification();

    this.setState({
      loadingInProgress: true,
      snackbarIsOpen: false,
    });

    let payload = {
      responseType: 'json',
    };

    axios.get(configs.saveAnnotatedNLUFilesEndpoint, payload)
      .then(function (response) {
        console.log(response);
        if (response.data.status !== undefined) {
          if (response.data.status === "success") {
            this.setState({
              loadingInProgress: false,
              snackbarMessage: "NLU files were saved successfully!",
              snackbarType: "success",
              snackbarIsOpen: true,
            });

          } else {
            throw new Error("Unexpected error");
          }

        } else {
          throw new Error("Unexpected response");
        }

      }.bind(this))
      .catch(function (error) {
        console.log(error);
        let notifyTitle = "NLU Data Error";
        let notifyBody =
          "An unknown error occurred while saving NLU data. Please try again a bit later.";
        let snackbarMessage =
          "An unknown error occurred while saving NLU data";
        let snackbarType = "error";

        if (error.response) {
          notifyBody = "Failed to save NLU files";
          snackbarMessage = notifyBody;
        } else if (error.request) {
          console.log(error.request);
          notifyBody = "Server did not respond";
          snackbarMessage = notifyBody;
        } else {
          console.log("Error:", error.message);
          notifyBody = "Request failed";
          snackbarMessage = notifyBody;
        }
        console.log(error.config);

        this.setState({
          snackbarMessage: snackbarMessage,
          snackbarType: snackbarType,
          snackbarIsOpen: true,
          loadingInProgress: false
        });

        this.props.scrollToTop();
        this.props.showAppNotification(notifyTitle, notifyBody);
      }.bind(this));
  }

  handleExportKB(event) {
    this.props.hideAppNotification();

    this.setState({
      exportingKBInProgress: true,
    });

    let config = {
      responseType: "blob"
    };
    axios
      .get(configs.exportKBEndpoint, config)
      .then(
        function (response) {
          console.log(response);
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "knowledge-base.csv");
          document.body.appendChild(link);
          link.click();

          this.setState({
            snackbarMessage: "Knowledge-base exported successfully!",
            snackbarType: "success",
            snackbarIsOpen: true,
            exportingKBInProgress: false
          });
        }.bind(this)
      )
      .catch(
        function (error) {
          console.log(error);
          let notifyTitle = "Knowledge-base Export Error";
          let notifyBody = `An unknown error occurred while attempting to export the knowledge-base. Please try again a bit later.`;
          let snackbarMessage =
            "An unknown error occurred while exporting the knowledge-base";
          let snackbarType = "error";

          if (error.response) {
            notifyBody = "Failed to obtain a valid response";
            snackbarMessage = notifyBody;
          } else if (error.request) {
            console.log(error.request);
            notifyBody = "Server did not respond";
            snackbarMessage = notifyBody;
          } else {
            console.log("Error:", error.message);
            notifyBody = "Knowledge-base export request failed";
            snackbarMessage = notifyBody;
          }
          console.log(error.config);

          this.setState({
            snackbarMessage: snackbarMessage,
            snackbarType: snackbarType,
            snackbarIsOpen: true,
            exportingKBInProgress: false
          });

          this.props.scrollToTop();
          this.props.showAppNotification(notifyTitle, notifyBody);
        }.bind(this)
      );
  }

  handleUpload(event) {
    this.props.hideAppNotification();

    this.setState({
      importingKBInProgress: true,
    });

    const file = event.target.files[0];

    if (file !== undefined) {
      if (file.type === "text/csv") {
        let KBData = new FormData();
        KBData.append('file', file);

        let config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }

        axios
          .post(configs.importKBEndpoint, KBData, config)
          .then(
            function (response) {
              console.log(response);
              if (response.data.status !== undefined) {
                if (response.data.status === "success") {
                  this.setState({
                    snackbarMessage: "Knowledge-base Improted successfully!",
                    snackbarType: "success",
                    snackbarIsOpen: true,
                    importingKBInProgress: false,
                  }, () => {
                    this.props.reloadIFrame();
                  });
                } else {
                  throw new Error("Unexpected error");
                }
              } else {
                throw new Error("Unexpected response");
              }
            }.bind(this)
          )
          .catch(
            function (error) {
              console.log(error);
              let notifyTitle = "Knowledge-base Import Error";
              let notifyBody =
                "An unknown error occurred while importing the knowledge-base. Please try again a bit later.";
              let snackbarMessage =
                "An unknown error occurred while importing the knowledge-base";
              let snackbarType = "error";

              if (error.response) {
                notifyBody = "Failed to obtain a valid response";
                snackbarMessage = notifyBody;
              } else if (error.request) {
                console.log(error.request);
                notifyBody = "Server did not respond";
                snackbarMessage = notifyBody;
              } else {
                console.log("Error:", error.message);
                notifyBody = "Knowledge-base import request failed";
                snackbarMessage = notifyBody;
              }
              console.log(error.config);

              this.setState({
                snackbarMessage: snackbarMessage,
                snackbarType: snackbarType,
                snackbarIsOpen: true,
                importingKBInProgress: false,
              });

              this.props.scrollToTop();
              this.props.showAppNotification(notifyTitle, notifyBody);
            }.bind(this)
          );
      } else {
        this.setState({
          snackbarMessage: "Only CSV files are allowed!",
          snackbarType: "error",
          snackbarIsOpen: true,
          importingKBInProgress: false
        });
      }
    } else {
      this.setState({
        importingKBInProgress: false
      });
    }
    event.target.value = "";
  }

  render() {
    return (
      <>
        <div className="row mb-1">
          <div className="col w-100 mx-0 px-0 justify-content-between d-inline-block">
            <Typography variant='h6' className="float-start h-100 mt-1 dime-page-title">
              <strong>Annotations</strong>
            </Typography>
            {this.state.exportingKBInProgress === false ?
              <Tooltip title="Export Knowledge-Base" placement="bottom-end">
                <Button 
                  variant="outlined" 
                  startIcon={<DataObject />}
                  size='small'
                  sx={{ border: "none", '&:hover': { border: "none" } }}
                  className="float-end app-button app-button-steel mb-md-0 mb-sm-0 mx-2"
                  onClick={this.handleExportKB}>
                  Export KB
                </Button>
              </Tooltip>
              :
              <LoadingButton
                loading
                loadingPosition="start"
                startIcon={<Save />}
                variant="outlined"
                className="float-end mb-md-0 mb-sm-0 mx-2"
                size="1.8rem"
                sx={{ height: "2.4rem" }}
                disabled>
                Export KB
              </LoadingButton>
            }
            {this.state.importingKBInProgress === false ?
              <Tooltip title="Import Knowledge-Base" placement="bottom-end">
                <Button 
                  variant="outlined" 
                  size='small'
                  startIcon={<DataObject />}
                  sx={{ border: "none", '&:hover': { border: "none" } }}
                  component="label"
                  className="float-end app-button app-button-steel mb-md-0 mb-sm-0 mx-2">
                  Import KB
                  <input
                    type="file"
                    hidden
                    accept="text/csv"
                    onChange={(e) => {
                      this.handleUpload(e);
                    }} />
                </Button>
              </Tooltip>
              :
              <LoadingButton
                loading
                loadingPosition="start"
                startIcon={<Save />}
                variant="outlined"
                className="float-end mb-md-0 mb-sm-0 mx-2"
                size="1.8rem"
                sx={{ height: "2.4rem" }}
                disabled>
                Import KB
              </LoadingButton>
            }
            {this.state.loadingInProgress === false ?
              <Button
                variant="outlined"
                size='small'
                startIcon={<Upload />}
                sx={{ border: "none", "&:hover": { border: "none" } }}
                className="float-end app-button app-button-green mb-md-0 mb-sm-0 mx-2"
                onClick={this.handleSaveTaggedEntities}>
                Save NLU Data
              </Button>
              :
              <LoadingButton
                loading
                loadingPosition="start"
                startIcon={<Save />}
                variant="outlined"
                className="float-end mb-md-0 mb-sm-0 mx-2"
                size="1.8rem"
                sx={{ height: "2.4rem" }}
                disabled>
                Save NLU Data
              </LoadingButton>
            }
          </div>
        </div>
        <Snackbar
          open={this.state.snackbarIsOpen}
          autoHideDuration={3000}
          onClose={this.handleSnackbarClose}
          anchorOrigin={{ vertical: `${configs.snackbarVerticalPosition}`, horizontal: `${configs.snackbarHorizontalPostion}` }}>
          <Alert
            onClose={this.handleSnackbarClose}
            severity={this.state.snackbarType}
            sx={{ width: "100%" }}>
            {this.state.snackbarMessage.toString()}
          </Alert>
        </Snackbar>
      </>
    );
  }
}
