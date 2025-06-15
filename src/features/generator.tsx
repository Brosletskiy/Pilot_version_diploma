export type DrawingParams = {
    inputType: 'bmp' | 'text' | null;
    bmpFile?: File | null;
    textInput?: string | null;
    rows: number;
    cols: number;
    selectedBlocks?: string[];
    selectedDirection?: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left';
    fps?: number;
    hieghtVideo?: number;
    weightVideo?: number;
    colorVideoBack?: string;
    onProgress?: (percent: number) => void;
};

export async function generateVideoBMP({
    inputType,
    bmpFile,
    textInput,
    rows = 1,
    cols = 1,
    selectedBlocks = [],
    selectedDirection = 'top-bottom',
    onProgress,
    hieghtVideo = 1280,
    weightVideo = 720,
    colorVideoBack = "#fff",
    fps = 120
}: DrawingParams): Promise<{ videoUrl: string }> {
    if (!inputType) {
        throw new Error("❌ Не вказано тип введення.");
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error("❌ Не вдалося отримати 2D-контекст.");
    }

    //Video speed
    const videoSpeed = 1000 / fps;

    // Розмір канваса
    canvas.width = hieghtVideo;
    canvas.height = weightVideo;

    // Початковий чорний фон
    ctx.fillStyle = colorVideoBack;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Параметри тексту (для випадку text)
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.font = '48px Arial';

    // Підготовка до запису відео
    const stream = canvas.captureStream(30);
    const recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8' });

    mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    const startRecording = () => new Promise<void>((resolve) => {
        mediaRecorder.start();
        resolve();
    });

    const waitForStop = () => new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
            resolve(new Blob(recordedChunks, { type: 'video/webm' }));
        };
    });

    await startRecording();

    if (inputType === 'text') {
        if (!textInput || typeof textInput !== 'string' || textInput.trim() === '') {
            mediaRecorder.stop();
            throw new Error("❌ Не введено текст для генерації.");
        }
        const chars = textInput.split('');
        let x = 50;
        let y = 50;
        const lineHeight = 60;

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            ctx.fillText(char, x, y);
            const charWidth = ctx.measureText(char).width;
            x += charWidth;

            if (x > canvas.width - 100) {
                x = 50;
                y += lineHeight;
            }

            if (onProgress) onProgress(((i + 1) / chars.length) * 100);
            await new Promise(r => setTimeout(r, videoSpeed));
        }
    } else if (inputType === 'bmp') {
        if (!bmpFile) {
            mediaRecorder.stop();
            throw new Error("❌ Не вибрано BMP файл для генерації.");
        }

        // Завантаження зображення з BMP файлу
        const img = new Image();
        const imgLoadPromise = new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("❌ Не вдалося завантажити BMP зображення."));
        });
        img.src = URL.createObjectURL(bmpFile);
        await imgLoadPromise;

        // Підгонка зображення під розміри канвасу
        let drawWidth = canvas.width;
        let drawHeight = (img.height / img.width) * drawWidth;
        if (drawHeight > canvas.height) {
            drawHeight = canvas.height;
            drawWidth = (img.width / img.height) * drawHeight;
        }
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;

        // Допоміжний офскрін канвас для малювання BMP
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) {
            mediaRecorder.stop();
            throw new Error("❌ Не вдалося отримати 2D-контекст для допоміжного канвасу.");
        }
        offCtx.clearRect(0, 0, img.width, img.height);
        offCtx.drawImage(img, 0, 0);

        const blockWidth = img.width / cols;
        const blockHeight = img.height / rows;
        const totalBlocks = rows * cols;

        // Формуємо повний список блоків (идентифікатори рядок-стовпець)
        const allBlocks: string[] = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                allBlocks.push(`${r}-${c}`);
            }
        }

        // Послідовність для малювання: спочатку вибрані блоки (якщо є), потім невибрані
        const chosenBlocksSet = new Set(selectedBlocks);
        const chosenBlocks = (selectedBlocks && selectedBlocks.length > 0) ? selectedBlocks : allBlocks;
        const notChosenBlocks = allBlocks.filter(b => !chosenBlocksSet.has(b));

        // Функція малювання одного блоку поступово по рядках або стовпцях, залежно від напрямку
        async function drawBlock(blockId: string, animate = true) {
            const [blockRow, blockCol] = blockId.split('-').map(Number);
            const srcX = blockCol * blockWidth;
            const srcY = blockRow * blockHeight;

            const destX = offsetX + (drawWidth / cols) * blockCol;
            const destY = offsetY + (drawHeight / rows) * blockRow;
            const destWidth = drawWidth / cols;
            const destHeight = drawHeight / rows;

            if (!ctx) throw new Error("❌ Не вдалося отримати 2D-контекст.");

            if (!animate) {
                ctx.drawImage(
                    offCanvas,
                    srcX,
                    srcY,
                    blockWidth,
                    blockHeight,
                    destX,
                    destY,
                    destWidth,
                    destHeight
                );
                return;
            }

            // Визначаємо лінійне малювання залежно від напрямку
            if (selectedDirection === 'top-bottom') {
                for (let line = 0; line < blockHeight; line++) {
                    if (!ctx) {
                        throw new Error("❌ Не вдалося отримати 2D-контекст.");
                    }
                    ctx.fillStyle = '#000';
                    ctx.fillRect(destX, destY, destWidth, destHeight);

                    // Перемальовуємо вже намальовані блоки
                    for (const b of chosenBlocks) {
                        if (b === blockId) break;
                        const [r, c] = b.split('-').map(Number);
                        ctx.drawImage(
                            offCanvas,
                            c * blockWidth,
                            r * blockHeight,
                            blockWidth,
                            blockHeight,
                            offsetX + (drawWidth / cols) * c,
                            offsetY + (drawHeight / rows) * r,
                            drawWidth / cols,
                            drawHeight / rows
                        );
                    }

                    ctx.drawImage(
                        offCanvas,
                        srcX,
                        srcY,
                        blockWidth,
                        line + 1,
                        destX,
                        destY,
                        destWidth,
                        (destHeight * ((line + 1) / blockHeight))
                    );

                    if (onProgress) {
                        const blockIdx = chosenBlocks.indexOf(blockId);
                        const progress = ((blockIdx + (line + 1) / blockHeight) / totalBlocks) * 100;
                        onProgress(progress);
                    }
                    await new Promise(r => setTimeout(r, videoSpeed));
                }
            }
            else if (selectedDirection === 'bottom-top') {
                for (let line = blockHeight - 1; line >= 0; line--) {
                    if (!ctx) {
                        throw new Error("❌ Не вдалося отримати 2D-контекст.");
                    }
                    ctx.fillStyle = '#000';
                    ctx.fillRect(destX, destY, destWidth, destHeight);

                    for (const b of chosenBlocks) {
                        if (b === blockId) break;
                        const [r, c] = b.split('-').map(Number);
                        ctx.drawImage(
                            offCanvas,
                            c * blockWidth,
                            r * blockHeight,
                            blockWidth,
                            blockHeight,
                            offsetX + (drawWidth / cols) * c,
                            offsetY + (drawHeight / rows) * r,
                            drawWidth / cols,
                            drawHeight / rows
                        );
                    }

                    const linesToDraw = blockHeight - line;
                    ctx.drawImage(
                        offCanvas,
                        srcX,
                        srcY + line,
                        blockWidth,
                        linesToDraw,
                        destX,
                        destY + destHeight * (line / blockHeight),
                        destWidth,
                        destHeight * (linesToDraw / blockHeight)
                    );

                    if (onProgress) {
                        const blockIdx = chosenBlocks.indexOf(blockId);
                        const progress = ((blockIdx + linesToDraw / blockHeight) / totalBlocks) * 100;
                        onProgress(progress);
                    }
                    await new Promise(r => setTimeout(r, videoSpeed));
                }
            }
            else if (selectedDirection === 'left-right') {
                for (let colLine = 0; colLine < blockWidth; colLine++) {
                    if (!ctx) {
                        throw new Error("❌ Не вдалося отримати 2D-контекст.");
                    }
                    ctx.fillStyle = '#000';
                    ctx.fillRect(destX, destY, destWidth, destHeight);

                    for (const b of chosenBlocks) {
                        if (b === blockId) break;
                        const [r, c] = b.split('-').map(Number);
                        ctx.drawImage(
                            offCanvas,
                            c * blockWidth,
                            r * blockHeight,
                            blockWidth,
                            blockHeight,
                            offsetX + (drawWidth / cols) * c,
                            offsetY + (drawHeight / rows) * r,
                            drawWidth / cols,
                            drawHeight / rows
                        );
                    }

                    ctx.drawImage(
                        offCanvas,
                        srcX,
                        srcY,
                        colLine + 1,
                        blockHeight,
                        destX,
                        destY,
                        destWidth * ((colLine + 1) / blockWidth),
                        destHeight
                    );

                    if (onProgress) {
                        const blockIdx = chosenBlocks.indexOf(blockId);
                        const progress = ((blockIdx + (colLine + 1) / blockWidth) / totalBlocks) * 100;
                        onProgress(progress);
                    }
                    await new Promise(r => setTimeout(r, videoSpeed));
                }
            }
            else if (selectedDirection === 'right-left') {
                for (let colLine = blockWidth - 1; colLine >= 0; colLine--) {
                    if (!ctx) {
                        throw new Error("❌ Не вдалося отримати 2D-контекст.");
                    }
                    ctx.fillStyle = '#000';
                    ctx.fillRect(destX, destY, destWidth, destHeight);

                    for (const b of chosenBlocks) {
                        if (b === blockId) break;
                        const [r, c] = b.split('-').map(Number);
                        ctx.drawImage(
                            offCanvas,
                            c * blockWidth,
                            r * blockHeight,
                            blockWidth,
                            blockHeight,
                            offsetX + (drawWidth / cols) * c,
                            offsetY + (drawHeight / rows) * r,
                            drawWidth / cols,
                            drawHeight / rows
                        );
                    }

                    const colsToDraw = blockWidth - colLine;
                    ctx.drawImage(
                        offCanvas,
                        srcX + colLine,
                        srcY,
                        colsToDraw,
                        blockHeight,
                        destX + destWidth * (colLine / blockWidth),
                        destY,
                        destWidth * (colsToDraw / blockWidth),
                        destHeight
                    );

                    if (onProgress) {
                        const blockIdx = chosenBlocks.indexOf(blockId);
                        const progress = ((blockIdx + colsToDraw / blockWidth) / totalBlocks) * 100;
                        onProgress(progress);
                    }
                    await new Promise(r => setTimeout(r, videoSpeed));
                }
            }
        }
        for (const blockId of chosenBlocks) {
            await drawBlock(blockId);
        }

        if (notChosenBlocks.length > 0) {
            for (const blockId of notChosenBlocks) {
                await drawBlock(blockId);
            }
        }
    }

    await new Promise(r => setTimeout(r, 1000));

    mediaRecorder.stop();
    const videoBlob = await waitForStop();

    const videoUrl = URL.createObjectURL(videoBlob);
    return { videoUrl };
}
