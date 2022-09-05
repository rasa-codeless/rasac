import React, { Component } from 'react';
import DeleteModal from '../modal/DeleteModal';
import {
  Box,
  Button,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Stack,
  ListItem,
} from '@mui/material';
import { 
  Cancel, 
  ChangeCircle, 
  DownloadForOffline,  
  Psychology, 
} from '@mui/icons-material';

export default class ExplanationListItem extends Component {
  render() {
    return (
      <Box
        key={this.props.explanationName}>
        <ListItem
          className="w-100 app-model-list-item"
        >
          <ListItemIcon>
            <Psychology />
          </ListItemIcon>
          <ListItemText
            id="switch-list-label-wifi"
            primary={this.props.explanationName}
            secondary={this.props.explanationDate} />
          {this.props.originChip &&
            <Chip
              label="Uploaded"
              color="success"
              className="material-green" />
          }
          <Box className='d-none d-md-block'>
            <Stack direction="row" spacing={1} className={"float-end"}>
              <Button 
                variant='outlined' 
                className="float-end app-button app-button-steel explanation-list-button"
                sx={{ border: "none", '&:hover': { border: "none" } }} 
                startIcon={<ChangeCircle />}
                onClick={(e) => {this.props.handleVisualize(e, this.props.explanationName)}}>
                Visualize
              </Button>
              <Button 
                variant='outlined' 
                className="float-end app-button app-button-steel explanation-list-button"
                sx={{ border: "none", '&:hover': { border: "none" } }} 
                startIcon={<DownloadForOffline />}
                onClick={(e) => {this.props.handleDownload(e, this.props.explanationName)}}>
                Download
              </Button>
              <Button 
                variant='outlined' 
                className="float-end app-button app-button-red explanation-list-button"
                sx={{ border: "none", '&:hover': { border: "none" } }} 
                startIcon={<Cancel />}
                data-bs-toggle="modal"
                data-bs-target={`#${this.props.explanationId}`}>
                Delete
              </Button>
            </Stack>
            {/* <ListItemSecondaryAction>
              <IconButton
                className="explanations-delete-icon"
                edge="end"
                color='error'
                aria-label="delete"
                data-bs-toggle="modal"
                size="small"
                data-bs-target={`#${this.props.explanationId}`}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
            <ListItemSecondaryAction
              sx={{ marginRight: "50px" }}>
              <IconButton
                className="explanations-download-icon"
                edge="end"
                color='error'
                aria-label="download"
                data-bs-toggle="modal"
                data-bs-target={`#${this.props.modelId}`}>
                <Download />
              </IconButton>
            </ListItemSecondaryAction>
            <ListItemSecondaryAction
              sx={{ marginRight: "100px" }}>
              <IconButton
                className="explanations-visualize-icon"
                edge="end"
                color='error'
                aria-label="visualize"
                data-bs-toggle="modal"
                data-bs-target={`#${this.props.modelId}`}>
                <Terrain />
              </IconButton>
            </ListItemSecondaryAction> */}
          </Box>
        </ListItem>
        <Divider component="li" variant='fullWidth' />
        <DeleteModal
          id={`${this.props.explanationId}`}
          title={`Delete Model`}
          body={`Do you want to permenently delete the Model ${this.props.explanationName}?`}
          item={`${this.props.explanationName}`}
          deleteHandler={this.props.handleDelete}
          buttonPrimary={{
            button: true,
            buttonClass: 'app-button-red model-delete-modal-button model-delete-modal-button-primary',
            buttonType: 'error',
            buttonVarient: 'contained',
            buttonText: 'Confirm',
          }}
          buttonSecondary={{
            button: true,
            buttonClass: 'app-button-steel model-delete-modal-button model-delete-modal-button-secondary',
            buttonType: 'secondary',
            buttonVarient: 'contained',
            buttonText: 'Deny',
          }} />
      </Box>
    );
  }
}