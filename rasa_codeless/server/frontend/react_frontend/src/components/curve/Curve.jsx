import {
  Box,
  Chip,
  DialogTitle,
  Drawer,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import boll from "bollinger-bands";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const options = {
  scales: {
    y: {
      min: 0,
      max: 1.1,
      ticks: {
        color: "white",
      },
      grid: {
        color: "grey",
      },
    },
    x: {
      ticks: {
        color: "white",
      },
      grid: {
        color: "grey",
      },
    },
  },
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: "white",
      },
      position: "top",
    },
    title: {
      display: true,
      color: "white",
      text: "Train and Test Curves",
    },
  },
};

const options_loss = {
  scales: {
    y: {
      min: 0,
      ticks: {
        color: "white",
      },
      grid: {
        color: "grey",
      },
    },
    x: {
      ticks: {
        color: "white",
      },
      grid: {
        color: "grey",
      },
    },
  },
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: "white",
      },
      position: "top",
    },
    title: {
      display: true,
      color: "white",
      text: "Train and Test Curves",
    },
  },
};

const option_bollinger = {
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      ticks: {
        color: "white",
      },
      grid: {
        color: "grey",
      },
    },
    x: {
      ticks: {
        color: "white",
      },
      grid: {
        color: "grey",
      },
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "white",
        filter: (label, data) => !label.text.includes("boll"),
      },
    },
    title: {
      display: true,
      color: "white",
      text: "Chart with Bollinger Bands",
    },
  },
};

export default function Curve(props) {
  const [state, setState] = React.useState({});

  const [curveTypeValue, setCurveTypeValue] = useState("Accuracy");
  const [patienceInterval, setPatienceInterval] = useState(10);
  const [bestEpoch, setBestEpoch] = useState("N/A");

  const [trainUpper, setTrainUpper] = useState([]);
  const [trainLower, setTrainLower] = useState([]);

  const [testUpper, setTestUpper] = useState([]);
  const [testLower, setTestLower] = useState([]);

  const handleCurveTypeChange = (event) => {
    setCurveTypeValue(event.target.value);
  };

  const handlePatienceInterval = (event) => {
    const patienceInter = Math.floor(Number(event.target.value));
    setPatienceInterval(patienceInter);
    curveExplainer(patienceInter);
  };

  const bollingerBand = (curveDataPoints, patienceInter) => {};

  const curveExplainer = (patienceInter) => {
    const trainBollinger = boll(
      props.curveDataPoints?.train_loss,
      patienceInter,
      2
    );
    setTrainUpper(trainBollinger.upper);
    setTrainLower(trainBollinger.lower);

    const testBollinger = boll(
      props.curveDataPoints?.test_loss,
      patienceInter,
      2
    );
    setTestUpper(testBollinger.upper);
    setTestLower(testBollinger.lower);

    let tempArray = [];
    let minLoss = props.curveDataPoints["test_loss"][0];
    let bestEpoch = 1;

    for (let i = 0; i < props.curveDataPoints["epochs"].length; i++) {
      if (i < patienceInter - 1) {
        if (props.curveDataPoints["test_loss"][i] < minLoss) {
          minLoss = props.curveDataPoints["test_loss"][i];
          bestEpoch = i + 1;
        }
      } else {
        console.log("ELSE");
        if (props.curveDataPoints["test_loss"][i] < trainBollinger.upper[i]) {
          if (props.curveDataPoints["test_loss"][i] < minLoss) {
            minLoss = props.curveDataPoints["test_loss"][i];
            bestEpoch = i + 1;
          }
        } else {
          console.log("INNER ELSE");
          console.log(i);
          let toBreak = true;
          for (let j = i + 1; j < i + 1 + patienceInter; j++) {
            if (
              props.curveDataPoints["test_loss"][j] < minLoss &&
              props.curveDataPoints["test_loss"][j] < trainBollinger.upper[j]
            ) {
              minLoss = props.curveDataPoints["test_loss"][j];
              bestEpoch = j + 1;
              toBreak = false;
              i = j;
            } else {
              toBreak = true;
            }
          }
          if (toBreak === true) {
            break;
          }
        }
      }

      if (props.curveDataPoints["test_loss"][i] < minLoss) {
        minLoss = props.curveDataPoints["test_loss"][i];
        bestEpoch = i + 1;
      }
    }

    setBestEpoch(bestEpoch);
  };

  useEffect(() => {
    if (
      props.curveDataPoints.length !== 0 &&
      props?.curveDataPoints?.epochs.length >= 50
    ) {
      setPatienceInterval(patienceInterval);
      curveExplainer(patienceInterval);
    }
    return () => {
      setState({});
    };
  }, [props?.curveDataPoints]);

  return (
    <Drawer
      anchor="right"
      open={props.openModal}
      onClose={props.handleCloseModal}
      PaperProps={{ style: { width: "80%" } }}
      className={`app-explanation-drawer`}
    >
      <DialogTitle>
        <Box className="modal-header" style={{ border: "none" }}>
          <h5 className="modal-title">Learning Curves</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={props.handleCloseModal}
          />
        </Box>
      </DialogTitle>
      <Stack
        direction={"column"}
        className={"model-common m-5 p-0 mt-0"}
        alignItems={"center"}
      >
        {props?.curveDataPoints.length !== 0 ? (
          <>
            <Box className="col-12 col-lg-12">
              <Typography variant="h6" className={"mb-2"}>
                Choose Curve Type
              </Typography>
            </Box>

            <Box className="col-11 col-lg-11">
              <hr />
              <div>
                <RadioGroup
                  row
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={curveTypeValue}
                  onChange={handleCurveTypeChange}
                >
                  <FormControlLabel
                    value="Accuracy"
                    className="material-white-f"
                    control={<Radio />}
                    label="📈 Accuracy Curve"
                  />
                  <FormControlLabel
                    value="Loss"
                    className="material-white-f"
                    control={<Radio />}
                    label="📉 Loss Curve"
                  />
                </RadioGroup>
              </div>
              <hr />
            </Box>

            <Box className="col-12 col-lg-12 container-bg material-matt-black mt-3 p-2">
              {curveTypeValue === "Accuracy" ? (
                <Line
                  options={options}
                  data={{
                    labels: props.curveDataPoints["epochs"],
                    datasets: [
                      {
                        label: "Train",
                        data: props.curveDataPoints["train_acc"],
                        borderColor: "rgb(76, 175, 80)",
                        backgroundColor: "rgba(76, 175, 80, 0.5)",
                      },
                      {
                        label: "Test",
                        data: props.curveDataPoints["test_acc"],
                        borderColor: "rgb(53, 162, 235)",
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                      },
                    ],
                  }}
                />
              ) : (
                <Line
                  options={options_loss}
                  data={{
                    labels: props.curveDataPoints["epochs"],
                    datasets: [
                      {
                        label: "Train",
                        data: props.curveDataPoints["train_loss"],
                        borderWidth: 2,
                        pointRadius: 1,
                        borderColor: "rgb(244, 67, 54)",
                        backgroundColor: "rgba(244, 67, 54, 0.5)",
                      },
                      {
                        label: "Test",
                        data: props.curveDataPoints["test_loss"],
                        borderWidth: 2,
                        pointRadius: 1,
                        borderColor: "rgb(53, 162, 235)",
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                      },
                    ],
                  }}
                />
              )}
            </Box>
            <Box className="col-12 col-lg-12 mt-5">
              <Typography variant="h6" className="mb-2">
                Curve Insights
              </Typography>
            </Box>

            {props?.curveDataPoints?.epochs.length < 50 ? (
              <Box className="col-11 col-lg-11 mt-0">
                Insights cannot be displayed for less than 50 epochs
              </Box>
            ) : (
              <>
                <Box className="col-11 col-lg-11 mt-0">
                  <hr />
                  <Stack direction="row" alignItems={"center"} className={""}>
                    <Box className="col-md-7 col-lg-7">
                      <label
                        htmlFor="basic-url"
                        className="form-label white-to-black-ease"
                      >
                        🏆 Best Epoch: <br />
                        <span className="text-muted">
                          (Epoch just before model overfits)
                        </span>
                      </label>
                    </Box>
                    <Box className="col-md-5 col-lg-5">
                      <Box className="input-group input-group-dark">
                        <Stack
                          direction="row-reverse"
                          spacing={1}
                          className={"w-100"}
                        >
                          <Chip
                            label={bestEpoch}
                            color="success"
                            variant="filled"
                            fullWidth={false}
                            className={"material-green"}
                          />
                        </Stack>
                      </Box>
                    </Box>
                  </Stack>
                  <hr />

                  <Stack direction="row" alignItems={"center"} className={""}>
                    <Box className="col-md-7 col-lg-7">
                      <label
                        htmlFor="basic-url"
                        className="form-label white-to-black-ease"
                      >
                        ⌚ Patience Interval: <br />
                        <span className="text-muted">
                          (Epochs to inspect after best epoch candidates)
                        </span>
                      </label>
                    </Box>
                    <Box className="col-md-5 col-lg-5">
                      <Box className="input-group input-group-dark">
                        <Box className="p-0 w-100 row justify-content-end">
                          <Slider
                            aria-label="Patience Interval"
                            color="info"
                            value={patienceInterval}
                            step={1}
                            marks
                            min={5}
                            max={25}
                            valueLabelDisplay="on"
                            sx={{ height: 6 }}
                            onChange={(e) => {
                              handlePatienceInterval(e);
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                  <hr />
                </Box>

                <Box
                  className="col-12 col-lg-12 mt-2 container-bg material-matt-black p-2"
                  sx={{ height: "32rem" }}
                >
                  <Line
                    options={option_bollinger}
                    data={{
                      labels: props.curveDataPoints["epochs"],
                      datasets: [
                        {
                          label: "Train",
                          data: props.curveDataPoints["train_loss"],
                          borderWidth: 1,
                          pointRadius: 1,
                          borderColor: "rgb(244, 67, 54)",
                          backgroundColor: "rgba(244, 67, 54, 0.5)",
                        },
                        {
                          label: "Test",
                          data: props.curveDataPoints["test_loss"],
                          borderWidth: 1,
                          pointRadius: 1,
                          borderColor: "rgb(33, 150, 243)",
                          backgroundColor: "rgba(33, 150, 243, 0.5)",
                        },
                        {
                          fill: false,
                          label: "boll 1",
                          data: trainLower,
                          borderWidth: 1,
                          pointRadius: 0,
                          borderColor: "rgb(122, 51, 75)",
                          backgroundColor: "rgba(122, 51, 75, 0.5)",
                        },
                        {
                          fill: "-1",
                          label: "boll 2",
                          data: trainUpper,
                          borderWidth: 1,
                          pointRadius: 0,
                          borderColor: "rgb(122, 51, 75)",
                          backgroundColor: "rgba(122, 51, 75, 0.5)",
                        },
                        {
                          fill: false,
                          label: "boll 3",
                          data: testLower,
                          borderWidth: 1,
                          pointRadius: 0,
                          borderColor: "rgb(77, 83, 111)",
                          backgroundColor: "rgba(77, 83, 111, 0.5)",
                        },
                        {
                          fill: "-1",
                          label: "boll 4",
                          data: testUpper,
                          borderWidth: 1,
                          pointRadius: 0,
                          borderColor: "rgb(77, 83, 111)",
                          backgroundColor: "rgba(77, 83, 111, 0.5)",
                        },
                      ],
                    }}
                  />
                </Box>
              </>
            )}
          </>
        ) : (
          <Box className="col-10 col-lg-10 mt-5">curve cannot be displayed</Box>
        )}
      </Stack>
    </Drawer>
  );
}
