import { Typography } from '@mui/material';
import React, { Component } from 'react';

export default class ConfigurationsPageTitle extends Component {
  render() {
    return (
      <div className="row mb-1">
        <div className="col w-100 mx-0 px-0 justify-content-between d-inline-block">
          <Typography variant='h6' className="float-start h-100 mt-1 dime-page-title">
            <strong>Configurations</strong>
          </Typography>
        </div>
      </div>
    );
  }
}
