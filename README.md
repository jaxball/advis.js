# AdVis.js

AdVis.js is an interactive webtool that lets anyone to explore adversarial attacks by dynamically displaying the classification scores and CAM heatmap visualization of the input image as one tunes the strength of perturbation applied to generate the adversarial example, all in real-time. Demo is now live at [http://www.jlin.xyz/advis](http://www.jlin.xyz/advis).

- **Developers**: Jason Lin, Dilara Soylu
- **Research Poster**: [here](http://www.jlin.xyz/papers/advis_poster_v2.pdf)

![Screenshot](public/thumbnail.png)
System developed with Tensorflow.js and React, referencing open source components from [PoloClub](https://github.com/poloclub)@Georgia Tech.
 
## Usage

Download or clone this repository:


```bash
git clone https://github.com/jaxball/advisjs.git
```

`cd` into the cloned repo and install the required depedencies:

```bash
yarn

```

To run, type:

```bash
yarn start

```

## To Do

- [ ] Input slider to choose from 1000 classes for targeted adversarial attack 
- [ ] Port Robust Adversrial Example from IPython notebook
- [ ] Adversarial Training with FGSM
- [ ] Visualize perturbations in real time? i.e. scale the negative values so we have 0 in the middle of the RGB values
- [ ] Explore Saliency Detection implementation (JS) methods

## License

MIT License. See [`LICENSE.md`](LICENSE.md).

## Contact

For questions or support [open an issue][issues].
