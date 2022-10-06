import React, { Component } from "react";
import { motion } from "framer-motion";
import { Box } from "@mui/system";
import { Chip, Stack, Typography } from "@mui/material";
import rasac from "./rasac.png";
import "./VersionModal.css";
import { configs } from "../../configs";

export default class VersionModal extends Component {
  render() {
    return (
      <div
        className="modal fade"
        id="rasac-version-modal"
        tabIndex="-1"
        aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered overflow-hidden">
          <div className="modal-content app-modal app-modal-version">
            <div className="modal-body" style={{ border: "none" }}>
              <Box sx={{ width: 1 }}>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(12, 1fr)"
                  gap={3}
                  className="mx-2"
                >
                  <Box
                    gridColumn="span 4"
                    alignItems={"center"}
                    justifyContent={"center"}
                    className="h-100"
                  >
                    <div className="my-4 h-100 w-100">
                      <img
                        src={rasac}
                        className="app-error-page-logo"
                        alt="logo"
                      />
                    </div>
                  </Box>
                  <Box gridColumn="span 7">
                    <Stack
                      direction="column"
                      spacing={1}
                      justifyContent="center"
                      className="h-100 w-100"
                    >
                      <Box gridColumn={"span 12"}>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="space-between"
                        >
                          <h5
                            className="modal-title"
                            style={{ fontWeight: "bolder" }}
                          >{`RASA CODELESS`}</h5>
                          <Chip
                            label={
                              <Typography
                                className={""}
                              >{`version ${this.props.version}`}</Typography>
                            }
                            className="material-blue material-white-f"
                          />
                        </Stack>
                      </Box>
                      <Box gridColumn={"span 12"} className={`mt-1`}>
                        <p />
                        <motion.h6
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                        >
                          {`Codeless RASA Developer Console`}
                          <p />
                          <p>{`RASA 2.8.x Compatible`}</p>
                          <Stack direction="row" spacing={2}>
                            <a
                              href={configs.rasacDocsHost}
                              target="_blank"
                              rel="noreferrer"
                              className={"material-blue-f"}
                              role={"button"}
                              style={{ textDecoration: "none" }}
                            >
                              Docs
                            </a>
                            <a
                              href={configs.rasacGitHub}
                              target="_blank"
                              rel="noreferrer"
                              className={"material-blue-f"}
                              role={"button"}
                              style={{ textDecoration: "none" }}
                            >
                              GitHub
                            </a>
                          </Stack>
                        </motion.h6>
                      </Box>
                    </Stack>
                  </Box>
                  <Box gridColumn="span 1">
                    <Stack direction="row" spacing={1} justifyContent="end">
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
