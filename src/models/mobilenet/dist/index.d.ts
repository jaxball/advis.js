import * as tf from '@tensorflow/tfjs';
export declare type MobileNetVersion = 1;
export declare type MobileNetAlpha = 0.25 | 0.50 | 0.75 | 1.0;
export declare function load(version?: MobileNetVersion, alpha?: MobileNetAlpha): Promise<MobileNet>;
export declare class MobileNet {
    endpoints: string[];
    private path;
    private model;
    private intermediateModels;
    private normalizationOffset;
    constructor(version: MobileNetVersion, alpha: MobileNetAlpha);
    load(): Promise<void>;
    infer(img: tf.Tensor3D | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, endpoint?: string): tf.Tensor;
    classify(img: tf.Tensor3D | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, topk?: number): Promise<Array<{
        className: string;
        probability: number;
    }>>;
}
