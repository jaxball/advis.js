import React, { Component } from 'react';
import {createCompRows, drawImage, drawCAM} from './ui.js';
import * as model from './model.js';
import {Table, TableHeader, TableHeaderColumn, TableBody, TableRow, Paper, Slider} from 'material-ui';
import {IMAGENET_CLASSES} from '../models/mobilenet/imagenet_classes';
import '../App.css';
import * as dl from '@tensorflow/tfjs';


import {scaleSequential} from 'd3-scale';
import {rgb} from 'd3-color';
import {interpolateInferno} from 'd3-scale-chromatic'


const SCALE = scaleSequential(interpolateInferno).domain([0,1]);


const imgStyle = {
  height: 224,
  width: 224,
  margin: 10,
  textAlign: 'center',
  display: 'inline-block',
};

const CANVAS_WIDTHpx = '227px';
const CANVAS_HEIGHTpx = '227px';
const CANVAS_WIDTH = 227;
const CANVAS_HEIGHT = 227;
class Display extends Component {
  constructor(props) {
    super(props);
    console.log("props", props);
    this.state = {
      srcImageArr: '',
      srcImage: this.props.srcImage,
      cImg: '',
      cCam: '',
      results: [],
      order: 0,
      disableSlider: this.props.disableSlider,
      sliderValue: 0,
      lastSelectedRow: [],
      newUpload: false,
      origCAM: [],
      dCam: ''
    };
  }

  updateImage = e => {
    console.log("entering updateImage");
    this.setState({srcImage: e});
    // var disp = this.state.attackDisplays[0];
  }

  drawCAM = (e) => {
    this.state.lastSelectedRow = e;
    if (e.length !== 0) {
        let ar = Object.assign([], IMAGENET_CLASSES);
        let row = this.state.results[e[0]];
        let index = ar.indexOf(row.key);
        let newCAM = drawCAM(this.state.cImg,
                this.props.net,
                this.state.activation,
                this.state.cCam,
                index, true);

        // DiffMap computation: 
        // take CAM.dataSync() and diff between original and new 
        if (!this.state.disableSlider) {
          this.drawDiffmap(newCAM);
        }

    } else {
        const ctx = this.state.cCam.getContext('2d');
        ctx.clearRect(0, 0, 227, 227);
    }
  };

  drawDiffmap = (newCAM) => {
    var i, length = newCAM.length;
    for(i = 0; i < length; i++) {
      newCAM[i] = Math.max(0, (newCAM[i]-this.state.origCAM[i]));
      // newCAM[i] = Math.abs(newCAM[i]-this.state.origCAM[i]);
    }

    let diff = new Uint8ClampedArray(227*227*4);
    for (let y = 0; y < 227; y++) {
        for (let x = 0; x < 227; x++) {
            let pos = (y * 227 + x) * 4;
            let col = rgb(SCALE(newCAM[pos/4]));
            diff[pos] = col.r;
            diff[pos + 1] = col.g;
            diff[pos + 2] = col.b;
            diff[pos + 3] = .6 * 255;
        }
    }

    // visualize diff map
    // console.log('dCAM', newCAM);
    const ctx = this.state.dCam.getContext('2d');
    let iData = ctx.createImageData(227, 227);
    iData.data.set(diff);
    ctx.putImageData(iData, 0, 0);

  }

  orderChanged = (e, row, column) => {
    if (column === 2) {
      if (this.state.order) {
        e.target.innerHTML = 'Confidence %';
      } else {
        e.target.innerHTML = '↓ Confidence %';
      }
      this.changeOrder(!this.state.order);
      this.setState({
        order: !this.state.order
      });
    }
  };

  changeOrder = (val) => {
    let classes = null;
    if (!val) {
      classes = Array.from(this.props.topK.keys());
    }
    const ctx = this.state.cImg.getContext('2d');
    let imgData = ctx.getImageData(0,0,this.state.cImg.width,this.state.cImg.height);
    model.predict(this.state.cImg, this.props.net, classes, function(top, activation) {
      let rows = createCompRows(top, this.props.topK);
      this.setState({
          results: rows,
          activation: activation
      });
    }.bind(this));
  };

  componentDidMount() {
    console.log("componentDidMount");
    const ctx = this.state.cImg.getContext('2d');
    drawImage(ctx, this.state.srcImage, function() {
      let curImgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      model.predict(curImgData, this.props.net, null, function(top, activation) {
        let rows = createCompRows(top, null);
        this.setState({
          results: rows, 
          activation: activation, 
        });

        const canvas = this.state.cImg.getContext('2d');
        this.state.srcImageArr = canvas.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        this.state.srcImageData = canvas.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.state.srcCanvas = canvas;
        // console.log('cached srcImageData', this.state.srcImageData);

        if (this.state.origCAM === undefined || this.state.origCAM.length == 0) {
          let ar = Object.assign([], IMAGENET_CLASSES);
          let index = ar.indexOf(rows[0].key);
          this.state.origCAM = drawCAM(this.state.cImg,
                                       this.props.net,
                                       this.state.activation,
                                       this.state.cCam,
                                       index, false);
          console.log("caching original image CAM");
        }
        // below is unncessary since we added toggleOverlay boolean to drawCAM
        // const ctxCAM = this.state.cCam.getContext('2d');
        // ctxCAM.clearRect(0, 0, 227, 227);
      }.bind(this));
    }.bind(this));

      // this.state.origCAM = this.computeCAM();


    // console.log('First eps change. Saving the original image.');
    // ctx = this.state.cImg.getContext('2d');
    // this.state.srcImageArr = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
    // this.state.srcImageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // this.state.srcCanvas = ctx;
    // console.log('cached srcImageData', this.state.srcImageData);

    // if (this.props.onRef != undefined) {
    //   this.props.onRef(this);
    // }
  }

  componentWillReceiveProps(nProps) {
    console.log("componentWillReceiveProps");
    this.setState({srcImage: nProps.srcImage, newUpload: nProps.newUpload});
    this.state.newUpload = nProps.newUpload; 
    if (this.state.newUpload == true) {
      this.setState({sliderValue: 0});
      this.state.slideValue = 0;
      console.log(this.state.newUpload, this.state.sliderValue);
    }
    // console.log(this.state.newUpload);

    let classes = null;
    if (!this.state.order) {
      classes = Array.from(this.props.topK.keys());
    }
    if (nProps.reset || nProps.srcImage !== this.state.srcImage) {
      // console.log("enter here");
      let ctx = this.state.cCam.getContext('2d');
      ctx.clearRect(0, 0, 227, 227);
      ctx = this.state.cImg.getContext('2d');
      drawImage(ctx, nProps.srcImage, function() {
        let curImgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        model.predict(curImgData, nProps.net, null, function(top, activation) {
          let rows = createCompRows(top, null);
          this.setState({
            results: rows,
            activation: activation,
            cam: [-1]
          });

          // reset cached CAM
          if (this.state.dCam) {
            let ar = Object.assign([], IMAGENET_CLASSES);
            let index = ar.indexOf(rows[0].key);
            this.state.origCAM = drawCAM(this.state.cImg,
                                         this.props.net,
                                         this.state.activation,
                                         this.state.cCam,
                                         index, false);
            
            const ctx = this.state.dCam.getContext('2d');
            ctx.clearRect(0, 0, 227, 227);
            console.log("caching original image CAM");
          }
        }.bind(this));
      }.bind(this));
    }
    this.props = nProps;
  }

  handleSlider = (event, eps) => {
    console.log("handleSlider");
    if (eps == this.state.sliderValue) {
      return;
    }
    this.setState({sliderValue: eps});
    console.log(this.state.newUpload);

    const ctx = this.state.cImg.getContext('2d');
    if (this.state.srcImageArr !== this.props.srcImage && this.state.newUpload) {
      console.log('New image uploaded. Recache original source data.');
      this.state.srcImageArr = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
      this.state.srcImageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.state.srcCanvas = ctx;
      this.state.newUpload = false;
    }

    // 4-channel img with alpha
    const _img = dl.fromPixels(this.state.srcImageData,4);  
    const pixels3 = dl.fromPixels(this.state.srcImageData,3);
    // 3-channel img for concat
    const _img3 = dl.image.resizeBilinear(pixels3, [227, 227]);

    // if (model.oglabel === '') {
      model.get_adv_xs(this.props.net, _img, _img3, eps).then(perturbedImg => {
          let perturbedImgArr = Uint8ClampedArray.from(perturbedImg.dataSync());
          let perturbedImgData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
          perturbedImgData.data.set(perturbedImgArr);
          ctx.putImageData(perturbedImgData, 0, 0);

          model.predict(perturbedImgData, this.props.net, null, function(top, activation) {
            let rows = createCompRows(top, null);
            this.setState({
              results: rows,
              activation: activation
            });

            // this.state.lastSelectedRow = rows[0];// initialize CAM map to top class 
            let ar = Object.assign([], IMAGENET_CLASSES);
            let index = ar.indexOf(rows[0].key);

            // this should be in a function for generating CAM map and drawing diff
            let newCAM = drawCAM(this.state.cImg,
                this.props.net,
                this.state.activation,
                this.state.cCam,
                index, false);
            this.drawDiffmap(newCAM);
            // end of function 
            const ctxCAM = this.state.cCam.getContext('2d');
            ctxCAM.clearRect(0, 0, 227, 227);

          }.bind(this));
      });

    // } else {
    //   console.log("display.js oglabel cached! ");
    //   const perturbedImg = model.get_adv_xs(this.props.net, _img, _img3, eps);
    //   let perturbedImgArr = Uint8ClampedArray.from(perturbedImg.dataSync());
    //   console.log("entering get_adv_xs - perturbedImgArr", perturbedImgArr, perturbedImg);
    //   let perturbedImgData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    //   perturbedImgData.data.set(perturbedImgArr);
    //   ctx.putImageData(perturbedImgData, 0, 0);

    //   model.predict(perturbedImgData, this.props.net, null, function(top, activation) {
    //     let rows = createCompRows(top, null);
    //     this.setState({
    //       results: rows,
    //       activation: activation
    //     });
    //   }.bind(this));

    //   const ctxCAM = this.state.cCam.getContext('2d');
    //   ctxCAM.clearRect(0, 0, 227, 227);
    //   console.log("update context");
    //   this.drawCAM(this.state.lastSelectedRow);
    // }

   };

  render() {

    const epsMax = 100;
    const epsMin = 0;
    const sliderOn = this.state.disableSlider ? (
      <div>
        <span className="toggleHint">click on row to toggle heatmap →</span> 
      </div>
    ) : (
      <div>
        <Slider min={epsMin}
                max={epsMax}
                onChange={this.handleSlider}
                defaultValue={this.state.sliderValue}
                className="sliderStyle" />
        <div className="epsLabel">
          Epsilon: {this.state.sliderValue}
        </div>
      </div>
    );
    const diffMapOn = this.state.disableSlider ? <div></div> : (
      <div>
          <div style={{display:"inline"}}>
            <span className="diffmapLabel">CAM Difference vs. Original</span>
            <Paper style={imgStyle} zDepth={3}>
             <canvas id="diffmap"
                      height="227px"
                      width="227px"
                      ref={dCam => this.state.dCam = dCam}>
              </canvas>
            </Paper>
          </div>
          <br /><br />
      </div>
    );

    return (
      <div id="halfColumn">
        <div className="overlay">
          <Paper style={imgStyle} zDepth={3}>
            <canvas height="227px"
                    width="227px"
                    ref={cImg => this.state.cImg = cImg}>
            </canvas>
            <canvas id="heatmap"
                    height="227px"
                    width="227px"
                    ref={cCam => this.state.cCam = cCam}>
            </canvas>
          </Paper>
          {sliderOn}
          {diffMapOn}
        </div>
        <Table className="table"
               onRowSelection={this.drawCAM}>
          <TableHeader adjustForCheckbox={false}
                       displaySelectAll={false}>
            <TableRow className="header-row"
                      onCellClick={(e, f, g) => this.orderChanged(e, f, g)}>
              <TableHeaderColumn>Class</TableHeaderColumn>
              <TableHeaderColumn style={{textAlign: 'right',
                                         cursor: 'pointer'}}>
                Confidence %
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}
                     showRowHover={true}
                     deselectOnClickaway={false}>
            {this.state.results}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default Display;