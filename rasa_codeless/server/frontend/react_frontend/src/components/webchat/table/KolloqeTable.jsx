import { Alert, Box } from '@mui/material';
import React, { Component } from 'react';
import './KolloqeTable.css';

export default class KolloqeTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableHeaders: props.message?.content[0]?.headers || false,
      tableContent: props.message?.content[0]?.rows || undefined,
      tableCaption: props.message?.content[0]?.caption || undefined,
    }
  }

  render() {
    return (
      this.state.tableContent !== undefined || this.state.tableContent !== null ?
        <Box
          sx={{
            width: "80%",
          }}>
          <table
            className="table table-sm table-hover widget-table material-widget-table">
            {this.state.tableHeaders === true ?
              <>
                <thead>
                  <tr>
                    {this.state.tableContent[0].map((header, header_idx) => {
                      return (
                        <td key={header_idx}>{header}</td>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {this.state.tableContent.slice(1).map((row, row_idx) => {
                    return (
                      <tr key={row_idx}>
                        {row.map((data, data_idx) => {
                          return (
                            <td key={data_idx}>{JSON.parse(data)}</td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </>
              :
              <tbody>
                  {this.state.tableContent.map((row, row_idx) => {
                    return (
                      <tr key={row_idx}>
                        {row.map((data, data_idx) => {
                          return (
                            <td key={data_idx}>{data}</td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
            }
          </table>
        </Box>
        :
        <div
          style={{
            width: "70%",
          }}>
          <Alert severity="error">Table unavailable</Alert>
        </div>
    );
  }
}
