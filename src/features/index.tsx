import { useEffect, useState, useRef } from 'react';
import "../shared/style/home.scss";
import { generateVideoBMP } from "../shared/utils/generateVideoBMP";

export default function Home() {
    const [inputType, setInputType] = useState<'bmp' | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [textInput, setTextInput] = useState('');
    const [rows, setRows] = useState(1);
    const [cols, setCols] = useState(1);
    const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
    const [selectedDirection, setSelectedDirection] = useState<'top-bottom' | 'bottom-top' | 'left-right' | 'right-left' | undefined>("top-bottom");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [drawTime, setDrawTime] = useState<number | null>(null);
    const [deepSettings, setDeepSettings] = useState<boolean>(false);
    const prevDeepSettingsRef = useRef<boolean>(deepSettings);
    const [fps, setFPS] = useState(120);



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.endsWith('.bmp')) {
            setInputType('bmp');
            setFile(file);
        }
    };

    const toggleBlock = (id: string) => {
        setSelectedBlocks(prev => {
            if (prev.includes(id)) {
                return prev.filter(b => b !== id); // Видаляємо
            } else {
                return [...prev, id]; // Додаємо в кінець
            }
        });
    };

    const handleCancel = () => {
        setInputType(null);
        setFile(null);
        setTextInput('');
        setSelectedBlocks([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleStart = async () => {
        if (!inputType) return;

        setIsLoading(true);
        setVideoUrl(null);
        const start = performance.now();

        // Імпортуємо або викликаємо генератор
        const result = await generateVideoBMP({
            inputType,
            bmpFile: file,
            textInput: textInput,
            selectedDirection: selectedDirection,
            selectedBlocks,
            rows: rows ?? 1,
            cols: cols ?? 1,
            fps,
        });

        const end = performance.now();
        setDrawTime((end - start) / 1000);
        setVideoUrl(result.videoUrl);  // це буде Blob URL
        setIsLoading(false);
    };

    useEffect(() => {
        // Скидання виділених блоків після зміни кількості рядків або стовпців
        setSelectedBlocks([]);
    }, [rows, cols]);

    useEffect(() => {
        if (prevDeepSettingsRef.current === true && deepSettings === false) {
            setRows(1);
            setCols(1);
        }
        prevDeepSettingsRef.current = deepSettings;
    }, [deepSettings]);

    return (
        <div className="home-container">
            <header className='header'>
                {isLoading && (
                    <div className="loading-screen">
                        <p>Генерація відео… Будь ласка, зачекайте ⏳</p>
                    </div>
                )}

                {videoUrl && (
                    <div className="video-result">
                        <video src={videoUrl} controls autoPlay />
                        <a href={videoUrl} download="drawing.mp4" className="btn-primary">Завантажити відео</a>
                        {drawTime && <p>Час малювання: {drawTime.toFixed(2)} с</p>}
                    </div>
                )}
            </header>
            <main className="content">
                <div className="content__input-panel">
                    <h2>Завантажте файл</h2>
                    <div className='file-upload'>
                        <label htmlFor="bmp-upload" className="custom-file-upload">
                            Обрати BMP файл
                        </label>
                        <input
                            id="bmp-upload"
                            type="file"
                            accept=".bmp"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />

                        {inputType === 'bmp' && file && (
                            <div className="image-grid-container">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="BMP Preview"
                                    className="image-preview"
                                />
                                {deepSettings && (
                                    <div className="grid-overlay">
                                        {[...Array(rows)].map((_, rowIdx) =>
                                            [...Array(cols)].map((_, colIdx) => {
                                                const id = `${rowIdx}-${colIdx}`;
                                                const isSelected = selectedBlocks.includes(id);
                                                return (
                                                    <div
                                                        key={id}
                                                        className={`grid-block ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => toggleBlock(id)}
                                                        style={{
                                                            width: `${100 / cols}%`,
                                                            height: `${100 / rows}%`,
                                                            top: `${(100 / rows) * rowIdx}%`,
                                                            left: `${(100 / cols) * colIdx}%`,
                                                            zIndex: 1000,
                                                            position: 'absolute'
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <span className="block-number">
                                                                {selectedBlocks.indexOf(id) + 1}
                                                            </span>
                                                        )}
                                                    </div>

                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {inputType === 'bmp' && file && (
                            <p>Завантажено: {file.name}</p>
                        )}
                    </div>
                </div>

                {/* Права частина – сайдбар з налаштуваннями */}
                {(inputType === 'bmp' && file) && (
                    <div className="content__settings-sidebar">
                        <h2>Налаштування</h2>
                        <div className='direction-wrapper'>
                            <span>Виберіть напрямок малювання</span>
                            <div className="direction-selector">
                                <label className="direction-item">
                                    <input
                                        type="radio"
                                        name="drawing-direction"
                                        value="top-bottom"
                                        checked={selectedDirection === "top-bottom"}
                                        onChange={() => setSelectedDirection("top-bottom")}

                                    />
                                    <span className="arrow" data-dir="↓">↓</span>
                                    Зверху вниз
                                </label>
                                <label className="direction-item">
                                    <input
                                        type="radio"
                                        name="drawing-direction"
                                        value="bottom-top"
                                        checked={selectedDirection === "bottom-top"}
                                        onChange={() => setSelectedDirection("bottom-top")}
                                    />
                                    <span className="arrow" data-dir="↑">↑</span>
                                    Знизу вверх
                                </label>
                                <label className="direction-item">
                                    <input
                                        type="radio"
                                        name="drawing-direction"
                                        value="left-right"
                                        checked={selectedDirection === "left-right"}
                                        onChange={() => setSelectedDirection("left-right")}
                                    />
                                    <span className="arrow" data-dir="→">→</span>
                                    Зліва направо
                                </label>
                                <label className="direction-item">
                                    <input
                                        type="radio"
                                        name="drawing-direction"
                                        value="right-left"
                                        checked={selectedDirection === "right-left"}
                                        onChange={() => setSelectedDirection("right-left")}
                                    />
                                    <span className="arrow" data-dir="←">←</span>
                                    Справа наліво
                                </label>
                            </div>
                        </div>

                        <div className='direction-wrapper'>
                            <label>
                                <input
                                    type="checkbox"
                                    id="deep-settings"
                                    name="deep-settings"
                                    onChange={(e) => setDeepSettings(e.target.checked)}
                                />
                                Розширені налаштування
                            </label>
                        </div>


                        {inputType !== null && deepSettings && (
                            <>
                                <p>Сітка</p>
                                <div className='set-grid-wrapper'>
                                    <div className='setter'>
                                        <label>Кількість рядків:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            defaultValue={1}
                                            onChange={(e) => setRows(Number(e.target.value))}
                                        />
                                    </div>

                                    <div className='setter'>
                                        <label>Кількість стовпців:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            defaultValue={1}
                                            onChange={(e) => setCols(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="video-settings">
                                    <p>Швидкість відео</p>
                                    <div className="fps-selector-row">
                                        <span className="fps-label">FPS:</span>
                                        <select
                                            className="custom-select"
                                            onChange={(e) => {
                                                const fps = Number(e.target.value);
                                                setFPS(fps);
                                            }}
                                            defaultValue={30}
                                        >
                                            <option value={30}>30</option>
                                            <option value={60}>60</option>
                                            <option value={120}>120</option>
                                            <option value={1200}>1200</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
            <footer className='footer'>
                <button
                    type='button'
                    className='btn-secondary'
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type='button'
                    className='btn-primary'
                    onClick={handleStart}
                >
                    Start
                </button>
            </footer>
        </div>
    );
}
