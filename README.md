# AdVis.js

AdVis.js is an interactive webtool that lets anyone to explore adversarial attacks by dynamically displaying the classification scores and CAM heatmap visualization of the input image as one tunes the strength of perturbation applied to generate the adversarial example, all in real-time. Demo is now live at [http://www.jlin.xyz/advis](http://www.jlin.xyz/advis).

- **Principal Developer**: Jason Lin
- **Collaborator(s)**: Dilara Soylu
- **Research Poster**: [here](http://www.jlin.xyz/papers/advis_poster_v2.pdf)

![Screenshot](public/thumbnail_scale.png)
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