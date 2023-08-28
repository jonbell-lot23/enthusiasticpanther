import React from "react";
import cardStyles from "./ShowCard.module.css";

function GapCard() {
  return (
    <div className="{cardStyles.cardContainer}">
      <div className={cardStyles.linkContainerGap}>
        <div className={cardStyles.gapContainer}></div>

        <div className={cardStyles.infoContainer}>
          <div className={cardStyles.locationText}>Gap</div>
          <div className={`${cardStyles.scoreText}`}>!</div>
        </div>
      </div>
    </div>
  );
}

export default GapCard;
