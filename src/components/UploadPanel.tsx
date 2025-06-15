import React, { useRef } from 'react';
import '../shared/style/UploadPanel.scss';

interface UploadPanelProps {
    mode: "image" | "text" | null;
    setMode: React.Dispatch<React.SetStateAction<"image" | "text" | null>>;
    image: File | null;
    setImage: React.Dispatch<React.SetStateAction<File | null>>;
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
}

const UploadPanel: React.FC<UploadPanelProps> = ({
    setMode,
    image,
    setImage,
    text,
    setText,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setMode('image');
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setMode('text');
    };

    return (
        <div className="upload-panel">
            <div className="upload-section">
                <label className="upload-label">Завантажити BMP файл</label>
                <input ref={fileInputRef} type="file" accept=".bmp" onChange={handleImageChange} />
                {image && <p className="upload-filename">✅ {image.name}</p>}

                <button onClick={() => {
                    setImage(null); setMode(null); if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }}>
                    Видалити
                </button>
            </div>

            <div className="or-label">Або</div>

            <div className="text-section">
                <label className="text-label">Ввести текст</label>
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    rows={4}
                    placeholder="Введіть ваш текст..."
                />

                <button onClick={() => { setText(''); setMode(null); }}>
                    Видалити
                </button>
            </div>
        </div>
    );
};

export default UploadPanel;
