import {
  Box,
  Modal,
  Pagination,
  ListItemIcon,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  List,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Drawer,
} from "@mui/material";
import * as React from "react";
import { useEffect } from "react";
import axios from "axios";

import Button from "@mui/material/Button";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {
  Cancel,
  DownloadForOffline,
  Psychology,
  StackedLineChart,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

import usePagination from "../../components/Pagination";
import "./Model.css";

import { Stack } from "@mui/material";
import AppTile from "../../components/pageBanner/AppTile";
import DeleteModal from "../../components/modal/DeleteModal";
import { configs } from "../../configs";
import RasaModelsPageTitle from "../../components/pageTitle/RasaModelsPageTitle";
import Curve from "../../components/curve/Curve";

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ----------------------------------------------------------------------

export default function RasaModel({
  appConfigs,
  showAppNotification,
  hideAppNotification,
  scrollToTop,
  setActiveLink,
}) {
  const [state, setState] = React.useState({});
  const [trainedModels, setTrainedModels] = React.useState([]);
  const [latestModel, setLatestModel] = React.useState([]);
  const [allModelsWithCurveData, setAllModelsWithCurveData] = React.useState(
    []
  );
  const [openDeleteModel, setOpenDeleteModel] = React.useState(false);
  const [openDeleteModelSuccessAlert, setOpenDeleteModelSuccessAlert] =
    React.useState(false);
  const [openDeleteModelFailAlert, setOpenDeleteModelFailAlert] =
    React.useState(false);
  const [selectedModelDelete, setselectedModelDelete] = React.useState("");
  // const [selectedModelDownload, setselectedModelDownload] = React.useState("");
  const [openDownloadModelFailAlert, setOpenDownloadModelFailAlert] =
    React.useState(false);
  const [openModelCurveFailAlert, setOpenModelCurveFailAlert] =
    React.useState(false);
  const [openGetModelFailAlert, setOpenGetModelFailAlert] =
    React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const PER_PAGE = 6;
  var count = Math.ceil(trainedModels.length / PER_PAGE);
  const _DATA = usePagination(trainedModels, PER_PAGE);

  const [selectedModelCurve, setselectedModelCurve] = React.useState("");

  const [openModal, setOpenModal] = React.useState(false);
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  const [curveDataPoints, setCurveDataPoints] = React.useState([]);
  const [data, setData] = React.useState({});
  const [labels, setLabels] = React.useState([]);

  const [curveLoading, setCurveLoading] = React.useState(false);
  const [activeModel, setActiveModel] = React.useState("");

  const [downloadLoading, setDownloadLoading] = React.useState(false);
  const [activeDownloadModel, setActiveDownloadModel] = React.useState("");

  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [activeDeleteModel, setActiveDeleteModel] = React.useState("");

  const [loadingModels, setLoadingModels] = React.useState(false);

  useEffect(() => {
    setActiveLink("", "models");
    getModels();

    // getIntents();

    return () => {
      setState({});
    };
  }, []);

  const handleClickOpenDeleteModel = () => {
    setOpenDeleteModel(true);
  };

  const handleCloseDeleteModel = () => {
    setOpenDeleteModel(false);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenDeleteModelSuccessAlert(false);
    setOpenDeleteModelFailAlert(false);
    setOpenDownloadModelFailAlert(false);
    setOpenModelCurveFailAlert(false);
    setOpenGetModelFailAlert(false);
  };

  const getModels = () => {
    setLoadingModels(true);

    axios
      .get(`${configs.getModelListEnpoint}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (res) => {
        const data = res.data;

        if (Object.hasOwn(data, "status")) {
          // error has occcured
          openGetModelFailAlert(true);
        } else {
          // no error
          if (data["model_list"] === null) {
            openGetModelFailAlert(true);
          } else {
            setTrainedModels(data["model_list"]);
            setLatestModel(data["latest_model"]);

            console.log(data);

            // trainedModels.map((val) => {
            //   let modelWithCurveData = {
            //     "model_name": val,
            //     "train_acc": allModelCurveData.find
            //   }

            //   setAllModelsWithCurveData({
            //     ...allModelsWithCurveData,

            //   })
            // })
          }
        }

        setLoadingModels(false);
      })
      .catch((err) => {
        console.log(err);
        openGetModelFailAlert(true);
        setLoadingModels(false);
      });
  };

  const getCurveDataPoints = (model) => {
    setCurveLoading(true);
    setActiveModel(model);

    axios
      .post(`${configs.getModelCurveDatapointsEndpoint + model}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (res) => {
        setCurveLoading(false);
        setActiveModel("");
        const data = res.data;


        if (Object.hasOwn(data, "status")) {
          // error has occcured
          setOpenModelCurveFailAlert(true);
        } else {
          // no error
          console.log(`curve: `,data);
          const cData = await data["curve_data"];
          await setCurveDataPoints(cData);

          if (cData === null) {
            setOpenModelCurveFailAlert(true);
          } else {
            handleOpenModal(true);
          }
        }
      })
      .catch((err) => {
        setCurveLoading(false);
        setActiveModel("");
        setOpenModelCurveFailAlert(true);
      });
  };

  const deleteModel = (e, name) => {
    e.preventDefault();

    setDeleteLoading(true);
    setActiveDeleteModel(name);

    handleCloseDeleteModel();

    axios
      .delete(`${configs.deleteModelEndpoint + name}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setDeleteLoading(false);
        setActiveDeleteModel("");

        const data = res.data;

        if (Object.hasOwn(data, "status")) {
          // error has occcured
          setOpenDeleteModelFailAlert(true);
        } else {
          // no error
          if (data["model_list"] === null) {
            setOpenDeleteModelFailAlert(true);
          } else {
            setOpenDeleteModelSuccessAlert(true);
            setTrainedModels(data["model_list"]);
            setLatestModel(data["latest_model"]);
          }
        }
      })
      .catch((err) => {
        setDeleteLoading(false);
        setActiveDeleteModel("");
        setOpenDeleteModelFailAlert(true);
      });
  };

  const downloadModel = (e, name) => {
    e.preventDefault();
    setDownloadLoading(true);
    setActiveDownloadModel(name);

    axios
      .get(`${configs.downloadModelEndpoint + name}`, {
        responseType: "blob",
      })
      .then((res) => {
        setDownloadLoading(false);
        setActiveDownloadModel("");

        const data = res.data;

        if (Object.hasOwn(data, "status")) {
          // error has occcured
          setOpenDownloadModelFailAlert(true);
        } else {
          // no error
          if (data === null) {
            setOpenDownloadModelFailAlert(true);
          } else {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${name}`);
            document.body.appendChild(link);
            link.click();
          }
        }
      })
      .catch((err) => {
        setDownloadLoading(false);
        setActiveDownloadModel("");
        setOpenDownloadModelFailAlert(true);
      });
  };

  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };

  const generateModelId = (value) => {
    try {
      value = value.toString();
      value = value.replace(".tar.gz", "");
      value = value.replace(/[#_~`@$%^&*()\-+=/\\. ,?"':;]/g, "");
      return `id${value}`;
    } catch (err) {
      console.log("Exception occurred while generating Modal ID");
      return "";
    }
  };

  return (
    <>
      <div className="app-main">
        <Box className="main-section m-0 p-0" id="main-section-dashboard">
          <RasaModelsPageTitle />
          <div className="row row-cols-1 row-cols-lg-1 mt-3">
            <AppTile
              bgcolor=""
              align="justify-content-start"
              margin="me-0 me-lg-0"
              icon="view_in_ar"
              iconColor="material-pink-f"
              count=""
              title="Trained Models"
              content="View all your trained models here!"
              button={{
                button: false,
              }}
              customButton=""
            />
          </div>
        </Box>

        <div>
          <div>
            <div className="row align-items-md-stretch p-0 container-middle container-bg overflow-hidden mt-4">
              <div className="shadow-sm p-0">
                <List
                  sx={{ width: "100%" }}
                  className="app-model-list"
                  component="nav"
                >
                  <Divider component="li" variant="fullWidth" />
                  {count === 0 && loadingModels === true && (
                    <div
                      className="p-3"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <div style={{ marginRight: "10px" }}>Loading Models</div>
                      <CircularProgress
                        color="inherit"
                        size="12px"
                        style={{ float: "right" }}
                      />
                    </div>
                  )}
                  {count === 0 && loadingModels === false && (
                    <div className="p-3">
                      Currently there are no Models Available
                    </div>
                  )}
                  {count !== 0 && loadingModels === false && (
                    <>
                      {_DATA
                        .currentData()
                        .filter((val) => {
                          if (searchTerm === "") {
                            return val;
                          } else if (
                            val
                              .toLowerCase()
                              .includes(searchTerm.toLocaleLowerCase())
                          ) {
                            // count = Math.ceil(val.length / PER_PAGE)
                            return val;
                          }
                        })
                        .map((val) => (
                          <Box key={val.model_id}>
                            <Box>
                              <ListItem className="w-100 app-model-list-item">
                                <ListItemIcon>
                                  <Psychology />
                                </ListItemIcon>
                                <ListItemText
                                  id="switch-list-label-wifi"
                                  primary={val.model_id}
                                  secondary={`Train Accuracy: ${
                                    val.train_acc !== ""
                                      ? Math.floor(100 * val.train_acc) + "%"
                                      : "N/A"
                                  } Test Accuracy: ${
                                    val.test_acc !== ""
                                      ? Math.floor(100 * val.test_acc) + "%"
                                      : "N/A"
                                  }`}
                                />
                                <Box className="d-none d-md-block">
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    className={"float-end"}
                                    alignItems="center"
                                  >
                                    {latestModel === val.model_id && (
                                      <Chip
                                        label="Latest"
                                        color="success"
                                        className="material-green"
                                      />
                                    )}
                                    {curveLoading &&
                                    activeModel === val.model_id ? (
                                      <LoadingButton
                                        loading
                                        loadingPosition="start"
                                        startIcon={<StackedLineChart />}
                                        variant="outlined"
                                        className="float-end explanation-loading-button"
                                        size="1.5rem"
                                        sx={{ height: "2.4rem" }}
                                        disabled
                                      >
                                        Curve
                                      </LoadingButton>
                                    ) : (
                                      <Button
                                        variant="outlined"
                                        className="float-end app-button app-button-steel explanation-list-button"
                                        sx={{
                                          border: "none",
                                          "&:hover": { border: "none" },
                                        }}
                                        startIcon={<StackedLineChart />}
                                        onClick={() =>
                                          getCurveDataPoints(val.model_id)
                                        }
                                      >
                                        Curve
                                      </Button>
                                    )}
                                    {downloadLoading &&
                                    activeDownloadModel === val.model_id ? (
                                      <LoadingButton
                                        loading
                                        loadingPosition="start"
                                        startIcon={<DownloadForOffline />}
                                        variant="outlined"
                                        className="float-end explanation-loading-button"
                                        size="1.5rem"
                                        sx={{ height: "2.4rem" }}
                                        disabled
                                      >
                                        Download
                                      </LoadingButton>
                                    ) : (
                                      <Button
                                        variant="outlined"
                                        className="float-end app-button app-button-blue explanation-list-button"
                                        sx={{
                                          border: "none",
                                          "&:hover": { border: "none" },
                                        }}
                                        startIcon={<DownloadForOffline />}
                                        onClick={(e) => {
                                          downloadModel(e, val.model_id);
                                        }}
                                      >
                                        Download
                                      </Button>
                                    )}

                                    {deleteLoading &&
                                    activeDeleteModel === val.model_id ? (
                                      <LoadingButton
                                        loading
                                        loadingPosition="start"
                                        startIcon={<Cancel />}
                                        variant="outlined"
                                        className="float-end explanation-loading-button"
                                        size="1.5rem"
                                        sx={{ height: "2.4rem" }}
                                        disabled
                                      >
                                        Delete
                                      </LoadingButton>
                                    ) : (
                                      <Button
                                        variant="outlined"
                                        className="float-end app-button app-button-red explanation-list-button"
                                        sx={{
                                          border: "none",
                                          "&:hover": { border: "none" },
                                        }}
                                        startIcon={<Cancel />}
                                        data-bs-toggle="modal"
                                        data-bs-target={`#${generateModelId(
                                          val.model_id
                                        )}`}
                                      >
                                        Delete
                                      </Button>
                                    )}
                                    {/* <Button
                                  variant="outlined"
                                  className="float-end app-button app-button-red explanation-list-button"
                                  sx={{
                                    border: "none",
                                    "&:hover": { border: "none" },
                                  }}
                                  startIcon={<Cancel />}
                                  data-bs-toggle="modal"
                                  data-bs-target={`#${generateModelId(
                                    val[0].model_id
                                  )}`}
                                >
                                  Delete
                                </Button> */}
                                  </Stack>
                                </Box>
                              </ListItem>
                              <Divider component="li" variant="fullWidth" />
                              <DeleteModal
                                id={`${generateModelId(val.model_id)}`}
                                title={`Delete Model`}
                                body={`Do you want to permenently delete the Model ${val.model_id}?`}
                                item={`${val.model_id}`}
                                deleteHandler={deleteModel}
                                buttonPrimary={{
                                  button: true,
                                  buttonClass:
                                    "app-button-red model-delete-modal-button model-delete-modal-button-primary",
                                  buttonType: "error",
                                  buttonVarient: "contained",
                                  buttonText: "Confirm",
                                }}
                                buttonSecondary={{
                                  button: true,
                                  buttonClass:
                                    "app-button-steel model-delete-modal-button model-delete-modal-button-secondary",
                                  buttonType: "secondary",
                                  buttonVarient: "contained",
                                  buttonText: "Deny",
                                }}
                              />
                            </Box>

                            {curveDataPoints !== null ? (
                              <Curve 
                                curveDataPoints={curveDataPoints}
                                openModal={openModal}
                                handleCloseModal={handleCloseModal}
                              />
                            ) : (
                              <></>
                            )}
                          </Box>
                        ))}
                      <Box
                        style={{ display: "flex", justifyContent: "center" }}
                        sx={{ marginY: "20px" }}
                      >
                        <Pagination
                          className="app-paginator"
                          count={count}
                          page={page}
                          onChange={handleChange}
                        />
                      </Box>
                    </>
                  )}
                </List>
              </div>
            </div>
          </div>

          <Snackbar
            open={openDeleteModelSuccessAlert}
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
              Model deleted
            </Alert>
          </Snackbar>
          <Snackbar
            open={openDeleteModelFailAlert}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{
              vertical: `${configs.snackbarVerticalPosition}`,
              horizontal: `${configs.snackbarHorizontalPostion}`,
            }}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              Model deleting failed
            </Alert>
          </Snackbar>
          <Dialog
            open={openDeleteModel}
            onClose={handleCloseDeleteModel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Delete Model {selectedModelDelete}?
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Do you really want to delete model {selectedModelDelete}? This
                action cannot be reversed.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteModel}>Cancel</Button>
              <Button
                onClick={(e) => {
                  deleteModel(e, selectedModelDelete);
                }}
                autoFocus
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={openDeleteModelFailAlert}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{
              vertical: `${configs.snackbarVerticalPosition}`,
              horizontal: `${configs.snackbarHorizontalPostion}`,
            }}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              Model deleting failed
            </Alert>
          </Snackbar>
          <Snackbar
            open={openModelCurveFailAlert}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{
              vertical: `${configs.snackbarVerticalPosition}`,
              horizontal: `${configs.snackbarHorizontalPostion}`,
            }}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              There are no data points for this model
            </Alert>
          </Snackbar>
          <Snackbar
            open={openGetModelFailAlert}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{
              vertical: `${configs.snackbarVerticalPosition}`,
              horizontal: `${configs.snackbarHorizontalPostion}`,
            }}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              Model retrieving failed
            </Alert>
          </Snackbar>
          {/* </Page> */}
        </div>
      </div>
    </>
  );
}
