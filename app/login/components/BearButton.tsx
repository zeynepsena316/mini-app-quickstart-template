"use client";

import React from "react";
import styles from "../page.module.css";

type SpritePos = { x: number; y: number };

type Props = {
  imgSrc?: string; // fallback image path
  label: string;
  onClick?: () => void;
  sprite?: {
    // top-left pixel of the sprite cell inside the full sprite image
    pos: SpritePos;
    // full sprite image size in pixels
    fullWidth: number;
    fullHeight: number;
    // cell size in sprite in pixels
    cellWidth: number;
    cellHeight: number;
    // path to sprite image
    spritePath: string;
  };
};

export default function BearButton({ imgSrc, label, onClick, sprite }: Props) {
  return (
    <button className={styles.bearButton} onClick={onClick}>
      <div className={styles.bearImageWrap}>
        {sprite ? (
          <div
            className={styles.bearSprite}
            style={{
              width: `${sprite.cellWidth}px`,
              height: `${sprite.cellHeight}px`,
              backgroundImage: `url('${sprite.spritePath}')`,
              backgroundPosition: `-${sprite.pos.x}px -${sprite.pos.y}px`,
              backgroundSize: `${sprite.fullWidth}px ${sprite.fullHeight}px`,
            }}
            aria-hidden
          />
        ) : (
          <img src={imgSrc} alt={label} className={styles.bearImage} />
        )}
      </div>
      <div className={styles.bearLabel}>{label}</div>
    </button>
  );
}
