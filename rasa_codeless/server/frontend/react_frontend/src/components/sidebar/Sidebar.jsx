import React from "react";
import { Link } from "react-router-dom";
import rasac from "./rasac.png";
import VersionModal from "../modal/VersionModal";
import { configs } from "../../configs";

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.handleTheme = this.handleTheme.bind(this);
  }

  handleTheme(event) {
    this.props.handleAppTheme();
  }

  render() {
    return (
      <>
        <div id="mySidebar" className="sidebar sidebar-dark">
          <div className="container sidebar-logo-container">
            <div className="row">
              <div className="span4"></div>
              <div className="span4 text-center">
                <img
                  className="center-block sidebar-logo"
                  src={rasac}
                  alt=""
                  role={"button"}
                  data-bs-toggle="modal"
                  data-bs-target={`#rasac-version-modal`}
                />
              </div>
              <div className="span4"></div>
            </div>
          </div>
          <div
            className={`app-sidebar-link ${
              this.props.activeLink === "configs" && "app-sidebar-link-active"
            }`}
            // onClick={(e) => { this.props.setActiveLink(e, "models") }}
          >
            <Link
              to="/"
              className="sidebar-link ripple-button"
              id="sidebar-configs"
            >
              <span className="material-icons material-sidebar-icon">tune</span>
              <span className="icon-text">Configurations</span>
            </Link>
          </div>
          <br />
          <div
            className={`app-sidebar-link ${
              this.props.activeLink === "models" && "app-sidebar-link-active"
            }`}
            // onClick={(e) => { this.props.setActiveLink(e, "models") }}
          >
            <Link
              to="/models"
              className="sidebar-link ripple-button"
              id="sidebar-models"
            >
              <span className="material-icons material-sidebar-icon">
                view_in_ar
              </span>
              <span className="icon-text">Models</span>
            </Link>
          </div>
          <br />
          <div className="app-sidebar-link">
            <label
              htmlFor="dark-mode-switch"
              className="sidebar-link ripple-button"
              id="sidebar-dark-mode"
              onClick={this.handleTheme}
            >
              <span
                className="material-icons material-sidebar-icon"
                id="sidebar-dark-mode-icon"
              >
                dark_mode
              </span>
              <span className="icon-text">Dark Mode</span>
            </label>
          </div>
        </div>
        <VersionModal
          version={`${configs.rasacVersion}`}
          docs={`${configs.rasacDocsHost}`}
        />
      </>
    );
  }
}

export default Sidebar;
