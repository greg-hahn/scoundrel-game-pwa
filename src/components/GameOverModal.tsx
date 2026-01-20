import { useEffect, useRef } from 'react';
import './Modal.css';

interface GameOverModalProps {
  won: boolean;
  score: number;
  seed: string | null;
  onPlayAgain: () => void;
  onRestart: () => void;
  onClose: () => void;
}

export function GameOverModal({
  won,
  score,
  seed,
  onPlayAgain,
  onRestart,
}: GameOverModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      document.body.classList.add('dialog-open');
    }
    return () => {
      document.body.classList.remove('dialog-open');
    };
  }, []);

  const handlePlayAgain = () => {
    dialogRef.current?.close();
    document.body.classList.remove('dialog-open');
    onPlayAgain();
  };

  const handleRestart = () => {
    dialogRef.current?.close();
    document.body.classList.remove('dialog-open');
    onRestart();
  };

  return (
    <dialog ref={dialogRef} aria-labelledby="gameOverTitle" className="modal">
      <h2 id="gameOverTitle">Game Over</h2>
      <div className="modal-content">
        <p>
          {won
            ? 'Victory! You cleared the dungeon.'
            : 'Defeat. Health reached 0.'}
        </p>
        <div className="score-line">
          <span className="label">Score</span> <strong>{score}</strong>
        </div>
        {seed && (
          <div className="score-line">
            <span className="label">Seed</span> <span>{seed}</span>
          </div>
        )}
      </div>
      <div className="modal-actions">
        <button className="btn primary" onClick={handlePlayAgain}>
          New Game
        </button>
        <button className="btn" onClick={handleRestart}>
          Restart
        </button>
      </div>
    </dialog>
  );
}
