/**
 * 图像处理工具类
 * 用于处理上传图像的预处理、转换等操作
 */

/**
 * 预处理图像 - 将文件转换为数据URL，并可能进行调整大小等操作
 * @param file 需要处理的图像文件
 * @returns 处理后的图像URL (base64)
 */
export const preprocessImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            if (!e.target?.result) {
                return reject(new Error('Failed to read file'));
            }

            const img = document.createElement('img');
            img.onload = () => {
                // 创建canvas元素进行图像处理
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject(new Error('Failed to get canvas context'));
                }

                // 设置最大宽度和高度（保持原始比例）
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;

                let width = img.width;
                let height = img.height;

                // 如果图像大于最大尺寸，按比例缩小
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    if (width > height) {
                        height = height * (MAX_WIDTH / width);
                        width = MAX_WIDTH;
                    } else {
                        width = width * (MAX_HEIGHT / height);
                        height = MAX_HEIGHT;
                    }
                }

                // 设置canvas尺寸
                canvas.width = width;
                canvas.height = height;

                // 在canvas上绘制调整大小后的图像
                ctx.drawImage(img, 0, 0, width, height);

                // 将canvas转换为数据URL
                const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.9);
                resolve(dataUrl);
            };

            img.onerror = () => {
                reject(new Error('图像加载失败'));
            };

            // 设置图像源
            img.src = e.target.result as string;
        };

        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };

        // 读取文件为DataURL
        reader.readAsDataURL(file);
    });
};

/**
 * 从数据URL中提取图像数据
 * @param dataUrl 图像的数据URL
 * @returns 提取的图像数据
 */
export const extractImageData = (dataUrl: string): string => {
    return dataUrl.split(',')[1];
};

/**
 * 将图像转换为指定格式
 * @param dataUrl 原始图像数据URL
 * @param format 目标格式 (例如 'image/jpeg', 'image/png')
 * @param quality 图像质量 (0-1)
 * @returns 转换后的数据URL
 */
export const convertImageFormat = (
    dataUrl: string,
    format = 'image/jpeg',
    quality = 0.9
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Failed to get canvas context'));
            }

            // 绘制图像
            ctx.drawImage(img, 0, 0);

            // 转换格式
            const convertedDataUrl = canvas.toDataURL(format, quality);
            resolve(convertedDataUrl);
        };

        img.onerror = () => {
            reject(new Error('图像加载失败'));
        };

        img.src = dataUrl;
    });
};

/**
 * 压缩图像，降低文件大小
 * @param file 原始图像文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 图像质量 (0-1)
 * @param maxSize 最大文件大小(KB)
 * @returns 压缩后的文件对象
 */
export const compressImage = async (
    file: File,
    maxWidth = 800,  // 降低最大宽度
    maxHeight = 800, // 降低最大高度
    quality = 0.7,   // 降低质量
    maxSize = 800    // 800KB最大大小
): Promise<File> => {
    return new Promise((resolve, reject) => {
        // 如果文件不是图片，直接返回原文件
        if (!file.type.startsWith('image/')) {
            console.warn('无法压缩非图像文件', file.type);
            return resolve(file);
        }

        // 如果文件已经很小，直接返回原文件
        const MAX_SIZE_BYTES = maxSize * 1024;
        if (file.size < MAX_SIZE_BYTES) {
            console.log(`图像已经足够小(${Math.round(file.size / 1024)}KB < ${maxSize}KB)，跳过压缩`);
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            try {
                const img = new Image();
                img.src = event.target?.result as string;

                img.onload = () => {
                    try {
                        let width = img.width;
                        let height = img.height;
                        let currentQuality = quality;

                        console.log(`原始图像尺寸: ${width}x${height}, 大小: ${Math.round(file.size / 1024)}KB`);

                        // 按比例缩小尺寸
                        if (width > maxWidth || height > maxHeight) {
                            const ratio = Math.min(maxWidth / width, maxHeight / height);
                            width = Math.floor(width * ratio);
                            height = Math.floor(height * ratio);
                            console.log(`调整图像尺寸至: ${width}x${height}`);
                        }

                        // 创建canvas进行压缩
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');

                        if (!ctx) {
                            console.error('无法获取canvas上下文');
                            return resolve(file);
                        }

                        // 绘制图像到canvas
                        ctx.drawImage(img, 0, 0, width, height);

                        // 递归压缩函数，逐步降低质量和尺寸直到满足大小要求
                        const compressWithQuality = (currentQuality: number, attempt: number = 1) => {
                            // 如果质量已经很低或尝试次数过多，返回原始文件
                            if (currentQuality < 0.2 || attempt > 5) {
                                console.warn(`无法将图像压缩到目标大小(${maxSize}KB)，返回最终压缩结果`);
                                canvas.toBlob(
                                    (finalBlob) => {
                                        if (!finalBlob) {
                                            console.error('无法创建最终Blob');
                                            return resolve(file);
                                        }
                                        // 返回最终结果
                                        const finalFile = new File(
                                            [finalBlob],
                                            file.name,
                                            { type: 'image/jpeg', lastModified: Date.now() }
                                        );
                                        console.log(`最终压缩结果: ${Math.round(finalFile.size / 1024)}KB (${Math.round(finalFile.size / file.size * 100)}%)`);
                                        return resolve(finalFile);
                                    },
                                    'image/jpeg',
                                    currentQuality
                                );
                                return;
                            }

                            // 用当前质量压缩
                            canvas.toBlob(
                                (blob) => {
                                    if (!blob) {
                                        console.error(`第${attempt}次压缩失败，无法创建Blob`);
                                        return resolve(file);
                                    }

                                    // 检查压缩后的大小
                                    if (blob.size <= MAX_SIZE_BYTES) {
                                        // 大小符合要求，创建文件
                                        const compressedFile = new File(
                                            [blob],
                                            file.name,
                                            { type: 'image/jpeg', lastModified: Date.now() }
                                        );

                                        console.log(`压缩成功(第${attempt}次): ${Math.round(compressedFile.size / 1024)}KB (${Math.round(compressedFile.size / file.size * 100)}%)`);
                                        resolve(compressedFile);
                                    } else {
                                        // 大小仍然超过要求，继续降低质量
                                        console.log(`第${attempt}次压缩后大小: ${Math.round(blob.size / 1024)}KB > ${maxSize}KB，继续降低质量`);

                                        // 降低质量，再次尝试
                                        const nextQuality = currentQuality * 0.7;
                                        console.log(`降低质量: ${currentQuality.toFixed(2)} -> ${nextQuality.toFixed(2)}`);

                                        // 如果文件很大，考虑进一步降低分辨率
                                        if (blob.size > MAX_SIZE_BYTES * 2 && attempt > 1) {
                                            // 创建新的更小的Canvas
                                            const scaleFactor = 0.7;
                                            const newWidth = Math.floor(canvas.width * scaleFactor);
                                            const newHeight = Math.floor(canvas.height * scaleFactor);

                                            console.log(`同时降低分辨率: ${canvas.width}x${canvas.height} -> ${newWidth}x${newHeight}`);

                                            const smallerCanvas = document.createElement('canvas');
                                            smallerCanvas.width = newWidth;
                                            smallerCanvas.height = newHeight;
                                            const smallerCtx = smallerCanvas.getContext('2d');

                                            if (smallerCtx) {
                                                // 绘制到更小的canvas
                                                smallerCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

                                                // 替换原始canvas
                                                canvas.width = newWidth;
                                                canvas.height = newHeight;
                                                ctx.drawImage(smallerCanvas, 0, 0);
                                            }
                                        }

                                        // 递归尝试下一级压缩
                                        compressWithQuality(nextQuality, attempt + 1);
                                    }
                                },
                                'image/jpeg',
                                currentQuality
                            );
                        };

                        // 开始压缩过程
                        compressWithQuality(currentQuality);
                    } catch (canvasError) {
                        console.error('Canvas操作出错:', canvasError);
                        resolve(file); // 出错时返回原始文件
                    }
                };

                img.onerror = (imgError) => {
                    console.error('图像加载失败:', imgError);
                    reject(new Error('图像加载失败'));
                };
            } catch (loadError) {
                console.error('图像处理初始化失败:', loadError);
                resolve(file); // 出错时返回原始文件
            }
        };

        reader.onerror = (readerError) => {
            console.error('文件读取失败:', readerError);
            reject(new Error('文件读取失败'));
        };
    });
};