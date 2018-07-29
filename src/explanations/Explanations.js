import React, { Component } from 'react';

export class IntroExplanation extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>

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
      <div>
        <h3 style={{fontFamily: "Roboto"}}> Class Activation Maximization</h3>
        <p style={{fontFamily: "Roboto"}}>
          AdVis lets users explore adversarial attacks by displaying the updates in the classification  scores as the user changes the epsilon value used to generate the attack. Users can also visualize the CAM overlay for a specific class by clicking on one of the rows, as they change the epsilon values. AdVis currently supports Fast Gradient Sign Method attacks.
        </p>

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
      <div>
        <h3> 1. How can we efficiently perform adversarial training on a classifier?</h3>
        <p>
          That would solve [almost] all the problems. If we train a network not only to predict the labels but also to be able to tell whether you try to fool it -- great. 
        </p>

        <h3> 2. What does the decision boundary for most classes look like?</h3>
        <p>
          We know that it's almost linear. But to what extent? The exact form (or, using a correct fancy term, "topology") of the class boundary would give us insights about the most efficient attack/defense. 
        </p>

        <h3> 3. How can we detect the presence of an adversarial example?</h3>
        <p>
          When you see a corrupted image of, let's say, an elephant - you recognize it. Probably by the colorful noise. But for the machine it's not a noisy photo of an elephant, it's an airplane. And it's so sure about it, that it doesn't make sense to question its own decisions and report this incident to a machine shrink. 
        </p>
        
        <h3> DeepDream </h3>
        <p>
          In next steps we plan to implement DeepDream feature visualization in the browser as well as javascript implementations of saliency detection &amp; overlay. Stay tuned for final release in Q3.
        </p>
      </div>
    );
  }
}
