// src: https://codepen.io/gaearon/pen/wqvxGa?editors=0010
import React, { Component } from 'react';
import { Alert } from "@mui/material";

export default class BotErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      errorMessage: this.props?.errorMessage || "Something went wrong",
      origin: this.props?.origin || "base",
      width: this.props?.width || "100%",
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        this.state.origin === "base" ?
          <div
            style={{
              width: `${this.props.width}`,
            }}>
            <Alert severity="error">{this.state.errorMessage}</Alert>
          </div>
          :
          (this.state.origin === "widget-bot" &&
            <div
              style={{
                width: `${this.props.width}`,
              }}>
              <Alert severity="error">{this.state.errorMessage}</Alert>
            </div>
          )
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}