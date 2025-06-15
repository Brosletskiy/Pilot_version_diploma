import React from 'react';
import styles from '../shared/style/DrawingSettings.module.scss';

interface DrawingSettingsProps {
    fps: number;
    setFps: (fps: number) => void;
    rows: number;
    setRows: (rows: number) => void;
    cols: number;
    setCols: (cols: number) => void;
    onGridChangeEffect?: (rows: number, cols: number) => void;
}

const DrawingSettings: React.FC<DrawingSettingsProps> = ({
    fps,
    setFps,
    rows,
    setRows,
    cols,
    setCols,
    onGridChangeEffect
}) => {
    const handleGridChange = (type: 'rows' | 'cols', value: number) => {
        const newValue = Math.max(1, Math.min(50, value));
        if (type === 'rows') {
            setRows(newValue);
        } else {
            setCols(newValue);
        }
        if (onGridChangeEffect) {
            onGridChangeEffect(type === 'rows' ? newValue : rows, type === 'cols' ? newValue : cols);
        }
    };

    return (
        <div className={styles.settingsContainer}>
            <h2 className={styles.title}>Налаштування малювання</h2>

            <div className={styles.settingBlock}>
                <label htmlFor="fps">FPS (швидкість відео):</label>
                <select
                    id="fps"
                    className={styles.select}
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value))}
                >
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={120}>120</option>
                    <option value={240}>240</option>
                </select>
            </div>

            <div className={styles.settingBlock}>
                <label>Кількість рядків:</label>
                <input
                    type="number"
                    className={styles.input}
                    value={rows}
                    onChange={(e) => handleGridChange('rows', parseInt(e.target.value))}
                    min={1}
                    max={50}
                />
            </div>

            <div className={styles.settingBlock}>
                <label>Кількість стовпців:</label>
                <input
                    type="number"
                    className={styles.input}
                    value={cols}
                    onChange={(e) => handleGridChange('cols', parseInt(e.target.value))}
                    min={1}
                    max={50}
                />
            </div>
        </div>
    );
};

export default DrawingSettings;
