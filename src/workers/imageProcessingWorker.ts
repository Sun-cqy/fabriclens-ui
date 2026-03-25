// Web Worker 用于图像处理

interface ImageProcessingData {
    imageData: string;  // base64 encoded image
    maxWidth: number;
    maxHeight: number;
}

// 检查OffscreenCanvas是否可用
const isOffscreenCanvasSupported = typeof OffscreenCanvas !== 'undefined';

self.addEventListener('message', (event: MessageEvent<ImageProcessingData>) => {
    const { imageData, maxWidth, maxHeight } = event.data;

    // 创建一个Image对象来加载图像
    // 注意：在Web Worker中，没有window对象，因此我们使用self.Image
    const img = new self.Image();

    img.onload = () => {
        // 计算调整后的尺寸
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        if (isOffscreenCanvasSupported) {
            // 使用OffscreenCanvas处理图像
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                self.postMessage({ error: '无法创建画布上下文' });
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // 转换为Blob
            canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
                .then(blob => {
                    // 创建Blob URL
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        self.postMessage({
                            processedImage: reader.result,
                            width,
                            height
                        });
                    };
                })
                .catch(() => {
                    self.postMessage({ error: '图像处理失败' });
                });
        } else {
            // 通知主线程OffscreenCanvas不可用，需要降级处理
            self.postMessage({
                error: 'OffscreenCanvas不支持',
                fallback: true,
                imageData,
                dimensions: { width, height }
            });
        }
    };

    img.onerror = () => {
        self.postMessage({ error: '图像加载失败' });
    };

    // 设置图像源
    img.src = imageData;
});

export { }; 