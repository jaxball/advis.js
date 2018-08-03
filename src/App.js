import React, { Component } from 'react';

// UI imports
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {AppBar} from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {blueGrey700, teal600, tealA700, red800} from 'material-ui/styles/colors';

// Tools
import CAMTool from './tools/CAMTool.js';

// Explanations
import {IntroExplanation,
        CAMExplanation,
        DeepDreamExplanation} from './explanations/Explanations.js'


class App extends Component {
  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme({
      palette: {
        primary1Color: teal600,
        accent1Color: red800,
        image: 'panda.jpg'
      },
    });

    this.state = {
      image: null,
    };
  }

  setCroppedImage = e => {
    this.child.uploadCroppedImage(e);
  }


  render() {
    return (
      <MuiThemeProvider muiTheme={this.muiTheme}>
        <AppBar title="AdVis.js | &nbsp; Visualizing Adversarial Attacks"></AppBar>

        <div className="banner-cover" id="banner">
          <div className="Page-intro-title">
            <span class="advis-shine">AdVis.js</span><br />
            Exploring Fast Gradient Sign Method
          </div>
          <div className="Page-intro-description">
            Explore Adversarial Attacks with visual interactive tools. <br />
          </div>
          <div className="Page-intro-footer">
            Advanced Computer Vision @ Georgia Tech 
          </div>
        </div>

        <div className="Explanation-intro">
          <IntroExplanation setCroppedImage={this.setCroppedImage}/>
        </div>

        <div className="toolBox">
          <CAMTool onRef={ref => (this.child = ref)} srcImage={this.state.image} attackDisplays={this.state.attackDisplays}/>
        </div>

        <div className="Explanation-center">
          <DeepDreamExplanation/>
        </div>

      </MuiThemeProvider>
    );
  }
}
export default App;
