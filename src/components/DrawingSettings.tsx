import React from 'react';
import styles from '../shared/style/DrawingSettings.module.scss';

interface DrawingSettingsProps {
    fps: number;
    setFps: (fps: number) => void;
    rows: number;
    setRows: (rows: number) => void;
    cols: number;
    setCols: (cols: number) => void;
    direction?: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left';
    setDirection: (dir: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left') => void;
    onGridChangeEffect?: (rows: number, cols: number) => void;
}

const DrawingSettings: React.FC<DrawingSettingsProps> = ({
    fps,
    setFps,
    rows,
    setRows,
    cols,
    setCols,
    direction,
    setDirection,
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
            <h2 className={styles.title}>Налаштування</h2>

            <div className={styles.settingsLayout}>
                <div className={styles.directionBlock}>
                    <label>
                        <input
                            type="radio"
                            name="direction"
                            checked={direction === 'left-right'}
                            onChange={() => setDirection('left-right')}
                        />
                        → Зліва направо
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="direction"
                            checked={direction === 'right-left'}
                            onChange={() => setDirection('right-left')}
                        />
                        ← Справа наліво
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="direction"
                            checked={direction === 'top-bottom'}
                            onChange={() => setDirection('top-bottom')}
                        />
                        ↓ Зверху вниз
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="direction"
                            checked={direction === 'bottom-top'}
                            onChange={() => setDirection('bottom-top')}
                        />
                        ↑ Знизу вверх
                    </label>
                </div>

                <div className={styles.centerBlock}>
                    <label htmlFor="fps">FPS:</label>
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

                <div className={styles.gridBlock}>
                    <label>Колонки:</label>
                    <input
                        type="number"
                        value={cols}
                        onChange={(e) => handleGridChange('cols', parseInt(e.target.value))}
                        min={1}
                        max={50}
                    />
                    <label>Рядки:</label>
                    <input
                        type="number"
                        value={rows}
                        onChange={(e) => handleGridChange('rows', parseInt(e.target.value))}
                        min={1}
                        max={50}
                    />
                </div>
            </div>
        </div>
    );
};

export default DrawingSettings;
