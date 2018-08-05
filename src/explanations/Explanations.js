import React, { Component } from 'react';
import 'typeface-roboto';
import {RaisedButton, Divider} from 'material-ui';
import ReactCrop, {makeAspectCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export class IntroExplanation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      src: null,
      crop: null
    };
  }

  onImageLoaded = image => {
    this.setState({
      crop: makeAspectCrop({
        x: 25,
        y: 25,
        aspect: 1 / 1,
        width: 227,
      }, 
      image.width / image.height), 
      image: image,
    });
  }

  onSelectFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener(
        'load',
        () => {
          this.setState({
            src: reader.result,
          });

          let parent = this;          
          let image = new Image();
          image.src = reader.result;
          image.onload = function() {
            // cache raw image size here 
            parent.setState({
              origWidth: image.width,
              origHeight: image.height
            });
          };
        },
        false
      )
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  onCropChange = crop => {
    this.setState({ crop });
  }

  onCropClicked = () => {
    this.getCroppedImg(this.state.image, this.state.crop);
  }

  getCroppedImg(image, pixelCrop) {
    // Print crops to canvas
    const canvas = document.createElement('canvas');
    canvas.width = this.state.origWidth;
    canvas.height = this.state.origHeight;
    const ctx = canvas.getContext('2d');

    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) API: 
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(
      image,
      (pixelCrop.x/100)*this.state.origWidth,
      (pixelCrop.y/100)*this.state.origHeight,
      (pixelCrop.width/100)*this.state.origWidth,
      (pixelCrop.height/100)*this.state.origHeight,
      0,
      0,
      227,
      227
    );

    // As Base64 string
    const base64Image = canvas.toDataURL('image/jpeg');
    this.props.setCroppedImage(base64Image);
  }

  render() {
    return (
      <div>
      <div className="Explanation-center">
        <h3>How can we detect an adversarial example?</h3>
        <p>
          When you see a corrupted image of, let's say, a panda - you recognize it. Probably by the colorful noise. But for the machine it's not a noisy photo of a panda, it's a chihuahua. And it's so sure about it, that it doesn't make sense to question its own decisions. <br /><br /><strong>AdVis.js</strong> lets you explore <em>adversarial attacks</em> by dynamically presenting the classification scores and CAM heatmap visualization as you tune the strength of perturbation applied in real-time. Try changing the epsilon value via the slider below and see for yourself! 
        </p>
      </div>

      <Divider />
      <div style={{backgroundColor: 'hsl(0, 0%, 99%)'}}>
        <br />
        <div id="StickyPicker" style={{gridColumn: 'screen', margin:'auto'}}>
          <div svelte-1277576141 class="root">
            <div class="sticky base-grid" style={{margin: 'auto', maxWidth: '640px'}}>
              <div class="container" style={{margin: 'auto'}}>


                  <h4 style={{display: "inline"}}>Upload your input image </h4>
                  <input style={{marginTop: "0px", marginBottom: "0px", display: "inline"}} onChange={this.onSelectFile} type="file" id="files" name="files[]" multiple/>

                  {this.state.src && (
                  <div> 
                    <ReactCrop
                      src={this.state.src}
                      crop={this.state.crop}
                      onImageLoaded={this.onImageLoaded}
                      onChange={this.onCropChange}
                      style={{marginTop: "6px", marginBottom: "4px", maxHeight: "150px"}}
                    />
                    <br />
                    <RaisedButton 
                      label="Crop" 
                      secondary={true} 
                      onClick={this.onCropClicked}
                    /> 
                    <br />
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
        <br />
        </div>

      <Divider />
      <div className="Explanation-center">
        <p> <strong>Advis.js</strong> is the first to bring visual adversarial example generation and dynamic visualization to the browser for real-time exploration, and we invite developers and researchers to contribute to our growing library of attack vectors. </p>
      </div>
      </div>
    );
  }
}

export class CAMExplanation extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{fontFamily: "Roboto"}}>
        
      </div>
    );
  }
}

export class DeepDreamExplanation extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{fontFamily: "Roboto"}}>
        <h3> Class Activation Maximization</h3>
        <p>
          AdVis.js lets users explore adversarial attacks by displaying the updates in the classification  scores as the user changes the epsilon value used to generate the attack. Users can also visualize the CAM overlay for a specific class by clicking on one of the rows, as they change the epsilon values. AdVis currently supports Fast Gradient Sign Method attacks.
        </p>
        
        <h3>How can we efficiently perform adversarial training on a classifier?</h3>
        <p>
          That would solve [almost] all the problems. If we train a network not only to predict the labels but also to be able to tell whether you try to fool it -- great. 
        </p>

        <h3>What does the decision boundary for most classes look like?</h3>
        <p>
          We know that it's almost linear. But to what extent? The exact form (or, using a correct fancy term, "topology") of the class boundary would give us insights about the most efficient attack/defense. 
        </p>
        <br />
        <h3> Next Steps </h3>
        <p>
          In next steps we plan to implement DeepDream feature visualization in the browser as well as Javascript implementations of saliency detection &amp; heatmap overlay. We also plan to introduce more methods of targeted adversarial attacks and under the hood explanations of gradient-based attacks. Stay tuned. Code is public at <a href="https://github.com/jaxball/advis.js">GitHub page</a>.
        </p>
        <p style={{color:'gray', textAlign:'right'}}><em>Jason Lin</em></p>
        <br /><br /><br />
      </div>
    );
  }
}
