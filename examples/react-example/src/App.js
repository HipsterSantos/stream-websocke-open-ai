import './App.css';
import React from 'react'
import {SocketStatus, StreamingClient} from "@project-sunbird/open-speech-streaming-client";

class App extends React.Component {

    streamingURL = 'ec2-18-222-202-247.us-east-2.compute.amazonaws.com:9009';
    punctuateURL = ''; //<Add Punctuate URL HERE>
    language = 'en';

    constructor(props) {
        super(props);
        this.state = {
            text: 'Click Start to start speaking..',
            streaming: new StreamingClient()
        }
        // If you want to bind it with the object then add following lines
        this.handleStart = this.handleStart.bind(this);
        this.handleStop = this.handleStop.bind(this);
    }

    setText(text) {
        this.setState({text: text});
    }

    handleStart() {
        {
            const streaming = this.state.streaming;
            this.setText('Connecting to server..');
            const _this = this;
            streaming.connect(this.streamingURL, _this.language, function (action, id) {
                console.log("Connected", id, 'action:', action);
                if (action === SocketStatus.CONNECTED) {
                    console.log('Starting.....');
                    _this.setText('Connected, Start Speaking..');
                    streaming.startStreaming(function (transcript) {
                        console.log("Data", transcript);
                        _this.setText(transcript);
                    }, (e) => {
                        console.log("I got error", e);
                    })
                } else if (_this.punctuateURL && action === SocketStatus.TERMINATED) {
                    // Socket is closed and punctuation can be done here.
                    console.log("Punctuating: ", _this.state.text);
                    _this.handlePunctuation(_this.state.text);
                } else {
                    console.log("Un expected action", action, id)
                }
            })
        }

    }

    handleStop() {
        console.log('Stopping: ' + this.state.text);
        this.state.streaming.stopStreaming();
    }

    handlePunctuation(text) {
        console.log('Punctuating: ' + text);
        const _this = this;
        if (text) {
            this.state.streaming.punctuateText(text, _this.punctuateURL, (status, text) => {
                _this.setText(text);
            }, (status, error) => {
                console.log("Failed to punctuate", status, error);
            })
        } else {
            return;
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <div>
                        <button onClick={this.handleStart}>Start</button>
                        <button onClick={this.handleStop}>Stop</button>
                    </div>
                    <p>{this.state.text}</p>
                </header>
            </div>
        )
    };
}

export default App;
