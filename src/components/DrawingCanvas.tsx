import React, { useRef, useEffect, useState, JSX } from 'react';
import styles from '../shared/style/DrawingCanvas.module.scss';

interface DrawingCanvasProps {
    mode: 'image' | 'text' | null;
    image: File | null;
    text: string;
    rows: number;
    cols: number;
    fps: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    mode,
    image,
    text,
    rows,
    cols,
    fps,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !mode) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (mode === 'text' && text) {
            ctx.fillStyle = '#000';
            ctx.font = '24px Arial';
            const lineHeight = 32;
            const margin = 20;
            const maxWidth = canvas.width - margin * 2;

            let x = margin;
            let y = margin + lineHeight;

            for (const char of text) {
                const charWidth = ctx.measureText(char).width;

                if (x + charWidth > canvas.width - margin) {
                    x = margin;
                    y += lineHeight;
                }

                // Стоп, якщо виходить за межі
                if (y > canvas.height - margin) break;

                ctx.fillText(char, x, y);
                x += charWidth;
            }
        }

        if (mode === 'image' && image) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = URL.createObjectURL(image);
        }
    }, [mode, image, text, rows, cols, fps]);

    const handleBlockClick = (id: string) => {
        setSelectedBlocks(prev =>
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        );
    };

    const renderGrid = () => {
        const grid: JSX.Element[] = [];
        const blockWidth = 800 / cols;
        const blockHeight = 600 / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const id = `${r}-${c}`;
                const isSelected = selectedBlocks.includes(id);
                grid.push(
                    <div
                        key={id}
                        className={`${styles.gridBlock} ${isSelected ? styles.selected : ''}`}
                        style={{
                            width: `${blockWidth}px`,
                            height: `${blockHeight}px`,
                            top: `${r * blockHeight}px`,
                            left: `${c * blockWidth}px`
                        }}
                        onClick={() => handleBlockClick(id)}
                    >
                        {isSelected && (
                            <span className={styles.blockNumber}>{selectedBlocks.indexOf(id) + 1}</span>
                        )}
                    </div>
                );
            }
        }
        return grid;
    };

    return (
        <div className={styles.canvasWrapper} style={{ position: 'relative', overflowY: 'auto', maxHeight: 600 }}>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className={styles.canvas}
            />
            <div className={styles.gridOverlay}>
                {renderGrid()}
            </div>
        </div>
    );
};

export default DrawingCanvas;