import React, { Component } from 'react';

export default class WebChat extends Component {
    constructor(props) {
        super(props);
        this.attachWebChatComponent = this.attachWebChatComponent.bind(this);
    }

    componentDidMount() {
        this.attachWebChatComponent();
    }

    attachWebChatComponent() {
        const e = document.createElement("script");
        const t = document.head || document.getElementsByTagName("head")[0];
        e.src = "https://cdn.jsdelivr.net/npm/rasa-webchat@1.0.1/lib/index.js";
        // Replace 1.x.x with the version that is required
        e.async = !0;
        e.onload = () => {
            window.WebChat.default(
                {
                    customData: { language: "en" },
                    socketUrl: "http://localhost:5005",
                    // add other props here
                },
                null
            );
        };
        t.insertBefore(e, t.firstChild);
    }

    render() {
        return (
            <></>
        );
    }
}
