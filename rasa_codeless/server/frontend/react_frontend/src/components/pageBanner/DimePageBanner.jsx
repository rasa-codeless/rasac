import { Box } from '@mui/material';
import React, { Component } from 'react';
import AppTile from './AppTile';

export default class DimePageBanner extends Component {
  render() {
    return (
      <>
        <Box className="row row-cols-1 row-cols-lg-1" justifyContent='space-between' sx={{ marginY: 2 }}>
          <AppTile
            bgcolor=""
            spacing="px-0 px-lg-0 py-0 py-lg-0"
            icon="psychology_alt"
            iconColor="material-steel-f"
            count={this.props.stats === undefined ? "" : this.props.stats.explanations}
            title={this.props.stats === undefined ? " Explanations" : (this.props.stats.explanations === 1 ? " Explanation" : " Explanations")}
            content="All previously generated explanations can be easily
            managed, quickly visualized, exported, or imported here."
            button={{
              button: true,
              buttonText: "Manage Explanations",
              buttonType: "app-button-steel",
              externalLink: false,
              link: "/explanations"
            }}
            customButton="" />
        </Box>
      </>
    );
  }
}


