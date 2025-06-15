import { useState } from "react";
import UploadPanel from "./UploadPanel";
import DrawingSettings from "./DrawingSettings";
import DrawingCanvas from "./DrawingCanvas";
import GenerateButton from "./GenerateButton";

export default function DrawingApp() {
    const [mode, setMode] = useState<"image" | "text" | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [text, setText] = useState<string>("");
    const [rows, setRows] = useState(1);
    const [cols, setCols] = useState(1);
    const [fps, setFps] = useState(60);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);

    const [direction, setDirection] = useState<
        "top-bottom" | "bottom-top" | "left-right" | "right-left"
    >("left-right");

    return (
        <div className="drawing-app">
            <header>
                <h1 className="app-logo">MakeItLive</h1>
            </header>

            <main>
                <UploadPanel
                    mode={mode}
                    setMode={setMode}
                    image={image}
                    setImage={setImage}
                    text={text}
                    setText={setText}
                />

                <DrawingSettings
                    fps={fps}
                    setFps={setFps}
                    rows={rows}
                    setRows={setRows}
                    cols={cols}
                    setCols={setCols}
                    direction={direction}
                    setDirection={setDirection}
                />

                <h2 className="preview-title">Попередній перегляд</h2>
                <DrawingCanvas
                    mode={mode}
                    image={image}
                    text={text}
                    rows={rows}
                    cols={cols}
                    fps={fps}
                    onSelectedBlocksChange={setSelectedBlocks}
                />

                <GenerateButton
                    inputType={mode === 'image' ? 'bmp' : mode}
                    image={image}
                    text={text}
                    rows={rows}
                    cols={cols}
                    fps={fps}
                    onGenerated={(url) => setVideoUrl(url)}
                    selectedBlocks={selectedBlocks}
                    direction={direction}
                />

                {videoUrl && (
                    <div style={{ marginTop: '20px' }}>
                        <video src={videoUrl} controls autoPlay />
                    </div>
                )}
            </main>
        </div>
    );
}
