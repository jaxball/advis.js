import React, { Component } from 'react';

export class IntroExplanation extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h3>How can we detect an adversarial example?</h3>
        <p>
          When you see a corrupted image of, let's say, a panda - you recognize it. Probably by the colorful noise. But for the machine it's not a noisy photo of a panda, it's a chihuahua. And it's so sure about it, that it doesn't make sense to question its own decisions. <br /><br /><strong>AdVis.js</strong> lets you explore <em>adversarial attacks</em> by dynamically presenting the classification scores and CAM heatmap visualization as you tune the strength of perturbation applied in real-time. Try changing the epsilon value via the slider below and see for yourself! 
        </p>
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
        <h3> DeepDream </h3>
        <p>
          In next steps we plan to implement DeepDream feature visualization in the browser as well as Javascript implementations of saliency detection &amp; heatmap overlay. Stay tuned. Code is public at <a href="https://github.com/jaxball/advis.js">GitHub page</a>.
        </p>
        <br /><br /><br />
      </div>
    );
  }
}
