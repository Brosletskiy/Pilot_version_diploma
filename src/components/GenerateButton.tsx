import React, { useState } from 'react';
import { generateVideoBMP } from '../shared/utils/generateVideoBMP';
import { generateVideoText } from '../shared/utils/GenerateVideoText';

interface GenerateButtonProps {
    inputType: 'bmp' | 'text' | null;
    image: File | null;
    text: string;
    rows: number;
    cols: number;
    fps: number;
    onGenerated: (videoUrl: string) => void;
    direction?: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left';
    selectedBlocks: string[];
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
    inputType,
    image,
    text,
    rows,
    cols,
    fps,
    onGenerated,
    direction,
    selectedBlocks,
}) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (!inputType) {
            alert('Будь ласка, оберіть тип вводу: текст або зображення.');
            return;
        }

        if (image && text.trim()) {
            alert('Ви ввели і текст, і зображення. Будь ласка, залиште лише один варіант.');
            return;
        }

        setLoading(true);

        try {
            if (inputType === 'text') {
                const result = await generateVideoText({
                    text,
                    fps,
                    canvasWidth: 800,
                    canvasHeight: 600,
                });
                onGenerated(result.videoUrl);
            } else if (inputType === 'bmp') {
                const result = await generateVideoBMP({
                    inputType,
                    bmpFile: image,
                    rows,
                    cols,
                    fps,
                    selectedBlocks,
                    selectedDirection: direction,
                });
                onGenerated(result.videoUrl);
            }
        } catch (error) {
            alert('Помилка генерації відео');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <button onClick={handleClick} disabled={loading || !inputType}>
                {loading ? 'Генерація...' : 'Старт'}
            </button>
        </div>
    );
};

export default GenerateButton;