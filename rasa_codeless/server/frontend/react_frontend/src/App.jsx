import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import './App.css';
import { rasac_ascii } from './configs';
import NotificationPanel from './components/notificationPanel/NotificationPanel';
import Sidebar from './components/sidebar/Sidebar';
import { GlobalDebug } from './configs';
import Error from './pages/error/Error';
import Configurations from './pages/configurations/Configuration';
import RasaModel from './pages/rasa_models/Model';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appTheme: this.props.appTheme,
      appEnv: this.props.appEnv,
      sidebarActiveLink: "configurations",
      notify: this.props.notify,
      notifyTitle: 'Notification',
      notifyBody: 'Hello DIME!',
      appConfigs: undefined,
    };

    this.handleAppTheme = this.handleAppTheme.bind(this);
    this.showAppNotification = this.showAppNotification.bind(this);
    this.hideAppNotification = this.hideAppNotification.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    this.setActiveLink = this.setActiveLink.bind(this);

    console.log(`%c ${rasac_ascii}`, 'background: none; color: #bada55;');
    // env can be dev strict_local (debugging) or prod
    if (this.props.appEnv.toString().toLowerCase() === "prod") {
      GlobalDebug(false, true);
    }
  }

  handleAppTheme(event) {
    this.state.appTheme === 'dark' ? this.setState({ appTheme: 'light' }) : this.setState({ appTheme: 'dark' });
  }

  showAppNotification(notifyTitle, notifyBody) {
    console.log('triggerring notification');
    console.log(notifyTitle, notifyBody);
    this.setState({ notify: true, notifyTitle: notifyTitle, notifyBody: notifyBody });
  }

  hideAppNotification(event) {
    this.setState({ notify: false });
  }

  scrollToTop(event) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  setActiveLink(event, linkName) {
    this.setState({
      sidebarActiveLink: linkName,
    });
  }

  render() {
    return (
      <>
        <Router>
            <input
              type="checkbox"
              id="dark-mode-switch"
              checked={this.state.appTheme === 'dark' ? false : true}
              onChange={e => { }} />
            <input
              style={{ marginLeft: '350px', backgroundColor: '#3dd5f3' }}
              type="checkbox"
              id="dark-mode-switch-base"
              className="dark-mode-checkbox"
              checked={this.state.appTheme === 'dark' ? false : true}
              onChange={e => { }} />
            <Sidebar
              handleAppTheme={this.handleAppTheme}
              currentTheme={this.state.appTheme}
              activeLink={this.state.sidebarActiveLink}
              appVersion={this.props?.appVersion}
              setActiveLink={this.setActiveLink} />
            <input
              style={{ marginLeft: "350px", backgroundColor: "#3dd5f3" }}
              type="checkbox" id="dark-mode-switch-main"
              className="dark-mode-checkbox"
              checked={this.state.appTheme === 'dark' ? false : true}
              onChange={e => { }} />
            <div
              id="main"
              className="bg-main">
              {this.state.notify &&
                <NotificationPanel
                  hideAppNotification={this.hideAppNotification}
                  notifyTitle={this.state.notifyTitle}
                  notifyBody={this.state.notifyBody} />
              }
              <div>
                <Routes>
                  <Route
                    index element={<Configurations
                      appConfigs={this.state.appConfigs}
                      showAppNotification={this.showAppNotification}
                      hideAppNotification={this.hideAppNotification}
                      scrollToTop={this.scrollToTop}
                      setActiveLink={this.setActiveLink} />} />
                  <Route
                  path="models"
                  element={<RasaModel
                    appConfigs={this.state.appConfigs}
                    showAppNotification={this.showAppNotification}
                    hideAppNotification={this.hideAppNotification}
                    scrollToTop={this.scrollToTop}
                    setActiveLink={this.setActiveLink} />} />
                  {/* signout menu */}
                  <Route
                    path="error"
                    element={<Error setActiveLink={this.setActiveLink} />} />
                  <Route
                    path="*"
                    element={<Error setActiveLink={this.setActiveLink} />} />
                </Routes>
              </div>
            </div>
          </Router>
      </>
    );
  }
}
