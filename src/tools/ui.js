import React from 'react';
import {TableRow, TableRowColumn} from 'material-ui';
import {scaleSequential} from 'd3-scale';
import {rgb} from 'd3-color';
import {interpolateInferno} from 'd3-scale-chromatic'
// import {MobileNet} from '../models/mobilenet/dist/mobilenet.js';
import * as tf from '@tensorflow/tfjs';


// import * as mobilenet from '../models/mobilenet';

// creds: open source code from PoloClub @ Georgia Institute of Technology

const SCALE = scaleSequential(interpolateInferno).domain([0,1]);

export function drawImage(ctx, src, callback) {
    const img = new Image(227, 227);
    img.onload = function () {
        ctx.clearRect(0, 0, 227, 227);
        ctx.drawImage(img, 0, 0);
        callback();
    };
    img.src = src;
}

export function CAM(softmaxWeights, lastActivation, classX) {
    console.log("in ui.js CAM(), classX ", classX, tf.tensor1d([classX]), softmaxWeights);
    var softMaxW = tf.transpose(softmaxWeights).gather(tf.cast(tf.tensor1d([classX]), 'int32'));
    var lastAct = tf.transpose(lastActivation.reshape([49, 1024]));
    var cam = tf.matMul(softMaxW, lastAct);
    cam = cam.reshape([7, 7]);
    cam = cam.sub(tf.min(cam));
    cam = cam.div(tf.max(cam));
    cam = tf.squeeze(tf.image.resizeBilinear(cam.expandDims(2), [227, 227]));
    return cam;
};

export function drawCAM(img, net, activation, canvas, id) {

    let weights = net.model.trainableWeights[81];
    weights = weights.val.squeeze().squeeze();
    // const weights = net.getLastWeights();
    let cam = CAM(weights, activation, id);


    cam = cam.dataSync();
    let buff = new Uint8ClampedArray(227*227*4);
    for (let y = 0; y < 227; y++) {
        for (let x = 0; x < 227; x++) {
            let pos = (y * 227 + x) * 4;
            let col = rgb(SCALE(cam[pos/4]));
            buff[pos] = col.r;
            buff[pos + 1] = col.g;
            buff[pos + 2] = col.b;
            buff[pos + 3] = .6 * 255;
        }
    }

    const ctx = canvas.getContext('2d');
    let iData = ctx.createImageData(227, 227);
    iData.data.set(buff);
    ctx.putImageData(iData, 0, 0);
}

export function createRows(top, callback) {
    let rows = []
    let entries = top.entries();
    for (let i = 0; i < 5; i++) {
        let pair = entries.next().value;
        rows.push(<TableRow key={pair[0]}>
                        <TableRowColumn style={{wordWrap: 'break-word', whiteSpace: 'normal'}}>{pair[0]}</TableRowColumn>
                        <TableRowColumn style={{textAlign: 'right'}} className='right'> {pair[1]}</TableRowColumn>
                    </TableRow>);

    }
    return rows;
}

export function createCompRows(top, originalTop) {
    let rows = []
    let entries = top.entries();

    for (let i = 0; i < 5; i++) {
        let pair = entries.next().value;

        let change = 0
        if(originalTop != null) {
            change = parseFloat(pair[1]) - parseFloat(originalTop.get(pair[0]));
        } 

        let color = 'black';
        let plus = '';
        if (change < 0) {
            color = 'red'; 
        } else if (change > 0) {
            color = 'green';
            plus = '+';
        }

        rows.push(<TableRow key={pair[0]}>
            <TableRowColumn style={{wordWrap: 'break-word', whiteSpace: 'normal'}}>{pair[0]}</TableRowColumn>
            <TableRowColumn style={{textAlign: 'right'}}>{pair[1]}</TableRowColumn>
            <TableRowColumn style={{textAlign: 'right', color: color}}>{plus}{change.toFixed(2)}</TableRowColumn>
        </TableRow>);
    }
    return rows;
}

export default drawImage;