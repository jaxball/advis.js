import React, { Component } from 'react';
import * as model from './model.js';

//UI imports
import Display from './Display.js';
import {Card, FloatingActionButton, RaisedButton} from 'material-ui';
import ContentAdd from 'material-ui/svg-icons/content/add';


class CAMTool extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      net: '',
      netStatus: 'Loading model...',
      srcImage: props.srcImage,
      topkPred: 10,
      topK: new Map(),
      reset: 0,
      brushSize: 15,
      blurSize: 2,
      attackDisplays: [],
    };
    // this.net = model.getModel(props.modelName);

    model.getModel(props.modelName).then(x => {
      this.net = x;
      let disp = (
        <Display srcImage={this.state.srcImage}
         net={this.net}
         ref={(c) => this.mod = c}
         topK={this.state.topK}
         disableSlider={false}/>
      );
      this.state.attackDisplays.push(disp);
      this.setState({
        netStatus: 'Loaded'
      });
    });
  }


  uploadCroppedImage = e => {
    this.setState({srcImage: e});
  }

  newAttack = (event) => {
    console.log("newAttack: button clicked");
    let disp = (
      <Display srcImage={this.state.srcImage}
       net={this.net}
       ref={(c) => this.mod = c}
       topK={this.state.topK}
       disableSlider={false}/>
    );
    this.state.attackDisplays.push(disp);
    this.setState({
      attackDisplays: this.state.attackDisplays
    });
  };

  render() { 
    
    var temp = (<Display 
         srcImage={this.state.srcImage}
         net={this.net}
         ref={(c) => this.mod = c}
         topK={this.state.topK}
         disableSlider={false} />);

    var attackDisp = this.state.attackDisplays.map(function(disp){ 
      return (<div>{temp}</div>); 
    });

    if (this.state.netStatus === "Loaded") {
      return (
        <Card initiallyExpanded={true} className="cardSingle">
          <div id="halfColumn">
            <div className="leftCol">
              <Display srcImage={this.state.srcImage}
                       net={this.net}
                       ref={(c) => this.mod = c}
                       topK={this.state.topK}
                       disableSlider={true}/>
            </div>
            <div className="rightCol" id="rightStack">
              
              {attackDisp}
              <RaisedButton className="addButton"
                            label="New Attack!"
                            onClick={this.newAttack}
                            secondary={true}/>
            </div>
          </div>
        </Card>
      )
    } else {
      return (
        <h3 style={{marginLeft: "20px"}}>Loading model...</h3>
      )
    }
  }
}

class CAM extends Component {
  constructor(props) {
    super(props);
    this.state={
      CAMBlocks: [],
    };
  }

  render() {
    return (
      <div className="cardBox">

        <CAMTool onRef={this.props.onRef} srcImage={'img/panda.png'}
                  modelName={model.modelEnum.MOBILE}/>

        <FloatingActionButton className="newModelButton" secondary={true}>
          <ContentAdd/>
        </FloatingActionButton>

      </div>
    );
  }
}
export default CAM;
