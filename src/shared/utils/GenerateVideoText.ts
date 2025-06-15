import svgToImage from "./SvgToImage";
import hand1 from "../../assets/hand1.svg";

export async function generateVideoText({
  text,
  fps,
  font = '24px Comic Sans MS',
  canvasWidth = 800,
  canvasHeight = 600,
  onProgress
}: {
  text: string;
  fps: number;
  font?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  onProgress?: (frame: number, total: number) => void;
}): Promise<{ videoUrl: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // Стилізація полотна
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.font = font;
  ctx.fillStyle = '#000000';

  const handImage = await svgToImage(hand1); // конвертація SVG у Image

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);

  const lineHeight = 32;
  const margin = 20;
  let x = margin, y = lineHeight;
  let scrollOffset = 0;

  const charPositions: { char: string; x: number; y: number }[] = [];

  // Розрахунок позицій символів
  for (const char of text) {
    const width = ctx.measureText(char).width;
    if (x + width > canvasWidth - margin) {
      x = margin;
      y += lineHeight;
    }
    charPositions.push({ char, x, y });
    x += width;
  }

  recorder.start();

  for (let i = 0; i < charPositions.length; i++) {
    const { char, x, y } = charPositions[i];

    // Очистка фону
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(0, -scrollOffset);

    // Малювання всього попереднього тексту
    ctx.fillStyle = '#000000';
    for (let j = 0; j <= i; j++) {
      const { char, x, y } = charPositions[j];
      ctx.fillText(char, x, y);
    }

    // Додавання зображення руки
    const handX = x;
    const handY = y - 45;
    ctx.drawImage(handImage, handX, handY, 64, 64);

    ctx.restore();

    // Автоскрол вниз
    if (y - scrollOffset > canvasHeight - lineHeight * 2) {
      scrollOffset += lineHeight;
    }

    // Очікування кадру
    await new Promise((res) => setTimeout(res, 1000 / fps));
    onProgress?.(i + 1, charPositions.length);
  }

  // Додатковий кадр — щоб не обрізало останню літеру
  await new Promise((res) => setTimeout(res, 2000 / fps));

  recorder.stop();

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      resolve({ videoUrl });
    };
  });
}
