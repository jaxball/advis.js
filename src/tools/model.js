import React, { Component } from 'react';
// import * as dl from 'deeplearn';
import * as dl from '@tensorflow/tfjs';
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
      return model;
	}

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
    let res = net.infer(resized, 'conv_preds').flatten();
    let activations = net.infer(resized, 'conv_pw_13_relu').squeeze();
    console.log('predict: Classification took ' + parseFloat(Math.round(performance.now() - t0)) + ' milliseconds');

    const map = new Map();
    let mNet = new MobileNet(dl.ENV.math);
    if (classes == null) {
        mNet.getTopKClasses(res, 1000).then((topK) => {
            // console.log("what is topk? ", topK);
            for (let key in topK) {
                map.set(key, (topK[key]*100.0).toFixed(2));
            }
            callback(map, activations);
        });
    } else {
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

// export var oglabel = '';
// end model details

export function get_adv_xs(net, img, img3, eps) {
  // label: topK,
  // img: pixels

  let tbuffer = dl.buffer([1000]);
  // if (oglabel === '') {
  return net.classify(img3).then(predictions => {
    var pred = predictions[0].className;  // giant panda, etc.

    var imagenet = mobilenet.IMAGENET_CLASSES;
    Object.keys(imagenet).forEach(function(key) {
        if (imagenet[key].valueOf() == pred.valueOf()) {
          tbuffer.set(1, key);
        }
    });
    const oglabel = tbuffer.toTensor();

    const xtoy = x => { return net.infer(x.toFloat(), 'conv_preds').flatten(); };
    const yloss = (gt, x) => dl.losses.softmaxCrossEntropy(gt, xtoy(x));
    var loss_func = function(x) { return yloss(oglabel, x); };
    let _grad_func = function () { return loss_func(img3); }

    var _im = dl.environment.ENV.engine.gradients(_grad_func, [img3]);
    let im_gradients = _im.grads[0];

    return generate_adv_xs(img, im_gradients, eps);
  });
  // } else {
  //     console.log("oglabel is cached!");
  //     const xtoy = x => { return net.infer(x.toFloat(), 'conv_preds').flatten(); };
  //     const yloss = (gt, x) => dl.losses.softmaxCrossEntropy(gt, xtoy(x));
  //     var loss_func = function(x) { return yloss(oglabel, x); };
  //     let _grad_func = function () { return loss_func(img3); }

  //     var _im = dl.environment.ENV.engine.gradients(_grad_func, [img3]);
  //     let im_gradients = _im.grads[0];

  //     return generate_adv_xs(img, im_gradients, eps);
  // }
}

function generate_adv_xs(img4channel, grads, eps) {
    let scaled_grad = scale_grad(grads, eps);
    const zeroes = new Uint8Array(51529);
    let alpha_channel = dl.tensor3d(zeroes, [227, 227, 1]);  // [0, 0,... 0, 0] (227)

    // concat the all-zeros alpha channel with 3-channel gradients from tf.gradients()
    let expanded_grad = dl.concat([scaled_grad, alpha_channel], 2); // 227,227,4
    // Add perturbation as in FGSM
    let perturbed_img = dl.add(dl.cast(img4channel,'float32'), expanded_grad);
    // perturbed_img.print();
    return perturbed_img;
}

function scale_grad(grad, eps) {
  const grad_data = grad.dataSync();
  const normalized_grad = grad_data.map(item => {
      return eps * Math.sign(item);
    });
  return dl.tensor(normalized_grad).reshapeAs(grad);
}