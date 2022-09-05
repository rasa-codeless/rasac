import { Box } from '@mui/material';
import React, { Component } from 'react';
import KolloqeButton from './KolloqeButton';

export default class KolloqeButtons extends Component {
  render() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: "70%",
        }}>
        {this.props.message?.content.map((action, index) => {
          return (
            <KolloqeButton
              key={index}
              disabled={this.props.disabled}
              actionText={action.text}
              actionType={action.type}
              actionPayload={action.payload}
              sendPayload={this.props.sendPayload} />
          );
        })}
      </Box>
    );
  }
}
