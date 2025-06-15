import React, { useState } from "react";
import UploadPanel from "./UploadPanel";
import DrawingSettings from "./DrawingSettings";
import DrawingCanvas from "./DrawingCanvas";
import GenerateButton from "./GenerateButton"; // 👈 додай

export default function DrawingApp() {
    const [mode, setMode] = useState<"image" | "text" | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [text, setText] = useState<string>("");
    const [rows, setRows] = useState(1);
    const [cols, setCols] = useState(1);
    const [fps, setFps] = useState(60);
    const [videoUrl, setVideoUrl] = useState<string | null>(null); // 👈

    return (
        <div className="drawing-app">
            <header>
                <h1>Інтелектуальне малювання навчального контенту</h1>
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
                    rows={rows}
                    cols={cols}
                    fps={fps}
                    setRows={setRows}
                    setCols={setCols}
                    setFps={setFps}
                />

                <DrawingCanvas
                    mode={mode}
                    image={image}
                    text={text}
                    rows={rows}
                    cols={cols}
                    fps={fps}
                />

                <GenerateButton
                    inputType={mode === 'image' ? 'bmp' : mode}
                    image={image}
                    text={text}
                    rows={rows}
                    cols={cols}
                    fps={fps}
                    onGenerated={(url) => setVideoUrl(url)}
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
