import { useEffect, useRef } from 'react';
import './Modal.css';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
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

  const handleClose = () => {
    dialogRef.current?.close();
    document.body.classList.remove('dialog-open');
    onClose();
  };

  return (
    <dialog ref={dialogRef} aria-labelledby="helpTitle" className="modal">
      <h2 id="helpTitle">Scoundrel — Rules</h2>
      <div className="modal-content">
        <p>Scoundrel is a solo dungeon-crawl played with a modified deck of cards.</p>
        
        <h3>Deck Setup</h3>
        <ul>
          <li>Start with 52-card deck. Remove Jokers, red face cards (J/Q/K ♥♦), and red Aces (A♥, A♦).</li>
          <li>Remaining 44 cards: 26 Monsters (♣/♠ 2–10, J=11, Q=12, K=13, A=14), 9 Weapons (♦ 2–10), 9 Potions (♥ 2–10).</li>
        </ul>
        
        <h3>Room & Loop</h3>
        <ul>
          <li>Reveal cards until 4 are visible — this is the Room.</li>
          <li>Choose to <strong>Avoid</strong> (place all 4 on the bottom, cannot avoid twice) or <strong>Face</strong>.</li>
          <li>Facing the Room: resolve any 3 of the 4 cards. The 4th carries forward to the next Room.</li>
        </ul>
        
        <h3>Resolving Cards</h3>
        <ul>
          <li><strong>Weapon (♦):</strong> Equip and discard your old weapon and its stack. Reset last defeated limit.</li>
          <li><strong>Potion (♥):</strong> Heal by its value (max health 20). Only one potion per Room; extras are discarded.</li>
          <li><strong>Monster (♣/♠):</strong> Bare-handed takes full damage. With weapon: damage = monster − weapon (min 0). If damage ≤ 0, the monster is defeated and stacked on the weapon. A weapon can only be used on monsters with value ≤ the last defeated monster's value (non‑increasing sequence).</li>
        </ul>
        
        <h3>Ending & Scoring</h3>
        <ul>
          <li>Win: clear the dungeon deck. Score = remaining health.</li>
          <li>Lose: health ≤ 0. Score = negative sum of remaining monster values in the deck.</li>
        </ul>
      </div>
      <div className="modal-actions">
        <button className="btn" onClick={handleClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}
