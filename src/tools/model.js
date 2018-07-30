import React, { Component } from 'react';
// import * as dl from 'deeplearn';
import * as dl from '@tensorflow/tfjs';
// import {MobileNet} from '../models/mobilenet/mobilenet.js';
import {MobileNet} from '../models/mobilenet/dist/mobilenet.js';
import * as mobilenet from '../models/mobilenet';


export var modelEnum = { 
  SQUEEZE: 1,
  MOBILE: 2,
  VGG: 3
};
Object.freeze(modelEnum);

export async function getModel (modelName){
	switch (modelName) {
		case modelEnum.MOBILE:
      const model = await mobilenet.load();
      console.log('model loaded in getModel()', model);
      return model;

      // const net = new MobileNet(dl.ENV.math);
      // console.log("net in getModel(), ", net);
      // return net;

      // let model = await net.load();
      // console.log("model in getModel(), ", model);
      // return model;
			// return new MobileNet(dl.ENV.math);  // Deeplearn.js imports
	}

}

export function generateAdversarialImage (model, imageArr, eps) {
	// TODO: return PERTURBED IMAGE
  console.log('generateAdversarialImage: ImageArr');
  console.log(imageArr);

  let buff = new Uint8ClampedArray(227 * 227 *4);
  let randArr = [-1, 0, 1];
  for (let y = 0; y < 227; y++) {
      for (let x = 0; x < 227; x++) {
          let pos = (y * 227 + x) * 4;
          let rand0 = randArr[Math.floor(Math.random() * randArr.length)];
          let rand1 = randArr[Math.floor(Math.random() * randArr.length)];
          let rand2 = randArr[Math.floor(Math.random() * randArr.length)];

          buff[pos] = imageArr[pos] + eps * rand0;
          buff[pos + 1] = imageArr[pos + 1] + eps * rand1;
          buff[pos + 2] = imageArr[pos + 2] + eps * rand2;
          buff[pos + 3] = imageArr[pos + 3];
          // imageArr[pos + 3] = .6 * 255;
      }
  }

	return buff;
}

/* 
  Final layers of MobileNet:
  https://github.com/deepinsight/insightface/issues/40

  73: "conv_pw_12"
  74: "conv_pw_12_bn"
  75: "conv_pw_12_relu"
  76: "conv_dw_13"
  77: "conv_dw_13_bn"
  78: "conv_dw_13_relu"
  79: "conv_pw_13"
  80: "conv_pw_13_bn"
  81: "conv_pw_13_relu"
  82: "global_average_pooling2d_1"
  83: "reshape_1"
  84: "dropout"
  85: "conv_preds"
  86: "act_softmax"
  87: "reshape_2"
*/

export function predict(img, net, classes, callback) {
    const pixels = dl.fromPixels(img);
    const resized = dl.image.resizeBilinear(pixels, [227, 227]);

    const t0 = performance.now();
    console.log("in model.js predict(), net? ", net);
    const res = net.infer(resized, 'conv_preds').flatten(); // 1000
    const activations = net.infer(resized, 'conv_pw_13_relu').squeeze(); // 7 7 1024
    // const gavgpool = net.infer(resized, 'reshape_1'); // 1 1 1 1024
    // const act_sft = net.infer(resized, 'act_softmax');  // 1 1 1 1000
    console.log("model.js - net.infer() res.data ", res, activations);
    // res.print();
    // acts.print();
    console.log('predict: Classification took ' + parseFloat(Math.round(performance.now() - t0)) + ' milliseconds');

    // const res = resAll.logits;
    // TODO: fix BUG below
    // let adv = get_adv_xs(net, ['placeholder'], resAll, resized, 0.5);
    // console.log("in predict, adv ", adv);

    console.log("in predict, classes = ", classes);
    // mobilenet.layers.map(l => l.name);
    // layers = mobilenet.layers.filter((l) => l.name.startsWith('conv') && !l.name.endsWith('preds'))
    
    const map = new Map();
    let mNet = new MobileNet(dl.ENV.math);
    if (classes == null) {
        // console.log("predict: classes == null");
        mNet.getTopKClasses(res, 1000).then((topK) => {
            // console.log("what is topk? ", topK);
            for (let key in topK) {
                map.set(key, (topK[key]*100.0).toFixed(2));
            }
            callback(map, activations);
        });
    } else {
        // console.log("predict: classes != null");
        mNet.getTopKClasses(res, 1000).then((topK) => {
            for (let i = 0; i < 5; i++) {
                map.set(classes[i], (topK[classes[i]]*100.0).toFixed(2));
            }
            callback(map, activations);
        });
    }
}

// Adversarial Stuff
const MAX_PIXEL_VALUE = 1.0;
const MIN_PIXEL_VALUE = 0.0;
const LEARNING_RATE = 0.1;
const TRAIN_STEPS = 100;
const IMAGE_SIZE = 227;
const optimizer = dl.train.sgd(LEARNING_RATE);
// end model details

export function get_adv_xs(net, label, resAll, img, eps) {
  // label: topK,
  // img: pixels

  // hardcode a label for panda: logits: 1x1000 , labels: 1x1001
  let tbuffer = dl.buffer([1001]);
  tbuffer.set(1, 389);
  const hclabel = tbuffer.toTensor();

  let x2d = img.flatten().toFloat();
 
  let adv_img = ''; // empty initialization to be filled in later

  // console.log("logits(shortform):", xtoy(img));
  // let a = xtoy(img);
  // a.softmax().print();
  // console.log("xtoy()", x); // Tensor {isDisposed: false, size: 154587, shape: Array(3), dtype: "int32", strides: Array(2), …

  // Following: given x and corresponding groundtruth, derives y with model and computes softmax cross entropy between logits and labels.
  // Right now, groundtruth is hardcoded-in for testing. 
  const xtoy = x => { return net.predict(x.toFloat()); };
  const yloss = (gt, x) => dl.losses.softmaxCrossEntropy(gt, xtoy(x));
  var loss_func = function(x) { return yloss(hclabel, x); };

  console.log("loss_func!", loss_func);
  console.log("loss_func(img)", loss_func(img));

  /* // locate dy!?
  Gradients.grad = function (f) {
    util.assert(util.isFunction(f), 'The f passed in grad(f) must be a function');
    return function (x, dy) {
        util.assert(x instanceof tensor_1.Tensor, 'The x passed in grad(f)(x) must be a tensor');
        util.assert(dy == null || dy instanceof tensor_1.Tensor, 'The dy passed in grad(f)(x, dy) must be a tensor');
        var _a = environment_1.ENV.engine.gradients(function () { return f(x); }, [x], dy), value = _a.value, grads = _a.grads;
*/
  // var _im = dl.environment.ENV.engine.gradients(function() { return dl.losses.softmaxCrossEntropy(hclabel, xtoy(img)); }, [img]);

  let _grad_func = function () { return loss_func(img); }
  console.log("what is _grad_func?", typeof _grad_func);
  var _im = dl.environment.ENV.engine.gradients(_grad_func, [img]);
  // console.log("right before printing gradients of img");
  // _im.print();

  // let b = loss_func(img);
  // b.print(); 
  // console.log("b loss ", b);
  // let f_loss = x => dl.losses.softmaxCrossEntropy(hclabel, resAll.logits);

/*
  const g_func = dl.grad(loss_func);
  console.log("gfunc", g_func);
  g_func(img).print();
*/


  // const cost = optimizer.computeGradients(() => {
  //     adv_img = generate_adv_xs(hclabel, img, resAll.logits, 0.2);
  //     return dl.losses.softmaxCrossEntropy(hclabel, resAll.logits).mean();
  // });
  // return adv_img;
}


function generate_adv_xs(label, x2d, logits, eps) {
    let _loss = dl.losses.softmaxCrossEntropy(label, logits);
    let loss_grad_func = dl.grad( () => { return _loss });
    let grad = loss_grad_func(x2d);
    let scaled_grad = scale_grad(grad, eps);
    let perturbed_img = dl.add(x2d, scaled_grad)
      .clipByValue(MIN_PIXEL_VALUE, MAX_PIXEL_VALUE);
    return perturbed_img;
}

function scale_grad(grad, eps) {
  const grad_data = grad.dataSync();
  const normalized_grad = grad_data.map(item => {
      return eps * Math.sign(item);
    });
  return dl.tensor(normalized_grad).reshapeAs(grad);
}