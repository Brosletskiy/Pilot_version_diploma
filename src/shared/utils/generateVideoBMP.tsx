export type DrawingParams = {
    inputType: 'bmp' | null;
    bmpFile?: File | null;
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
    if (!inputType) throw new Error("❌ Не вказано тип введення.");

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("❌ Не вдалося отримати 2D-контекст.");

    const videoSpeed = 1000 / fps;
    canvas.width = hieghtVideo;
    canvas.height = weightVideo;

    ctx.fillStyle = colorVideoBack;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream(30);
    const recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8' });

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };

    const startRecording = () => new Promise<void>((res) => { mediaRecorder.start(); res(); });
    const waitForStop = () => new Promise<Blob>((res) => { mediaRecorder.onstop = () => res(new Blob(recordedChunks, { type: 'video/webm' })); });

    await startRecording();

    if (inputType === 'bmp') {
        if (!bmpFile) {
            mediaRecorder.stop();
            throw new Error("❌ Не вибрано BMP файл для генерації.");
        }

        const img = new Image();
        const imgLoadPromise = new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej(new Error("❌ Не вдалося завантажити BMP зображення."));
        });
        img.src = URL.createObjectURL(bmpFile);
        await imgLoadPromise;

        let drawWidth = canvas.width;
        let drawHeight = (img.height / img.width) * drawWidth;
        if (drawHeight > canvas.height) {
            drawHeight = canvas.height;
            drawWidth = (img.width / img.height) * drawHeight;
        }

        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;

        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) throw new Error("❌ Не вдалося отримати 2D-контекст для допоміжного канвасу.");
        offCtx.drawImage(img, 0, 0);

        const blockWidth = img.width / cols;
        const blockHeight = img.height / rows + 1;
        const totalBlocks = rows * cols;

        const allBlocks = Array.from({ length: rows * cols }, (_, i) => `${Math.floor(i / cols)}-${i % cols}`);
        const chosenBlocks = (selectedBlocks?.length ? selectedBlocks : allBlocks).filter(b => allBlocks.includes(b));
        const chosenSet = new Set(chosenBlocks);
        const notChosenBlocks = allBlocks.filter(b => !chosenSet.has(b));

        async function drawBlock(blockId: string, animate = true) {
            if (!ctx) {
                throw new Error("❌ Не вдалося отримати 2D-контекст.");
            }
            const [blockRow, blockCol] = blockId.split('-').map(Number);
            const srcX = blockCol * blockWidth;
            const srcY = blockRow * blockHeight;
            const destX = offsetX + (drawWidth / cols) * blockCol;
            const destY = offsetY + (drawHeight / rows) * blockRow;
            const destW = drawWidth / cols;
            const destH = drawHeight / rows;

            if (!animate) {
                ctx.drawImage(offCanvas, srcX, srcY, blockWidth, blockHeight, destX, destY, destW, destH);
                return;
            }

            const maxLine = Math.ceil(
                selectedDirection?.includes('top') || selectedDirection?.includes('bottom')
                    ? blockHeight
                    : blockWidth
            );

            for (let i = 0; i <= maxLine; i++) {
                const progressRatio = (i + 1) / maxLine;

                if (selectedDirection === 'top-bottom') {
                    ctx.drawImage(offCanvas, srcX, srcY, blockWidth, i + 1, destX, destY, destW, destH * progressRatio);
                } else if (selectedDirection === 'bottom-top') {
                    ctx.drawImage(offCanvas, srcX, srcY + (blockHeight - i), blockWidth, i + 1, destX, destY + destH * ((blockHeight - i) / blockHeight), destW, destH * progressRatio);
                } else if (selectedDirection === 'left-right') {
                    ctx.drawImage(offCanvas, srcX, srcY, i + 1, blockHeight, destX, destY, destW * progressRatio, destH);
                } else if (selectedDirection === 'right-left') {
                    ctx.drawImage(offCanvas, srcX + (blockWidth - i - 1), srcY, i + 1, blockHeight, destX + destW * ((blockWidth - i) / blockWidth), destY, destW * progressRatio, destH);
                }

                onProgress?.(((chosenBlocks.indexOf(blockId) + progressRatio) / totalBlocks) * 100);
                await new Promise(r => setTimeout(r, videoSpeed));
            }
            ctx.drawImage(offCanvas, srcX, srcY, blockWidth, blockHeight, destX, destY, destW, destH);
        }

        for (const blockId of chosenBlocks) await drawBlock(blockId);
        for (const blockId of notChosenBlocks) await drawBlock(blockId);
    }

    await new Promise(r => setTimeout(r, 1000));
    mediaRecorder.stop();
    const videoBlob = await waitForStop();
    return { videoUrl: URL.createObjectURL(videoBlob) };
}
