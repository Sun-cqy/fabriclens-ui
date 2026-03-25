/* eslint-disable */
// fabric.js类型声明
declare module 'fabric' {
    export interface Canvas {
        add: (object: any) => Canvas;
        remove: (object: any) => Canvas;
        clear: () => Canvas;
        renderAll: () => Canvas;
        dispose: () => void;
        getObjects: () => any[];
        getWidth: () => number;
        getHeight: () => number;
    }

    export interface Image {
        // 支持两种set的用法：set(options对象) 或 set(key, value)
        set: {
            (options: Record<string, any>): Image;
            (key: string, value: any): Image;
        };
        scale: (value: number) => Image;
        width?: number;
        height?: number;
        left?: number;
        top?: number;
        clipPath?: any;
    }

    export interface Rect {
        new(options: any): any;
    }

    export interface ImageStatic {
        fromURL: (url: string, callback: (img: Image) => void, options?: any) => void;
        fromURL: (url: string, callback: (img: Image) => void, onError: (error: Error) => void) => void;
    }

    export const Canvas: {
        new(element: string | HTMLCanvasElement, options?: any): Canvas;
    };

    export const Image: ImageStatic;
    export const Rect: Rect;

    // 全局命名空间声明
    const fabric: {
        Canvas: typeof Canvas;
        Image: typeof Image;
        Rect: typeof Rect;
    };

    export default fabric;
} 