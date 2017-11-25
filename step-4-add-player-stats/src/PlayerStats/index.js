import React from "react";
import PropTypes from "prop-types";
import "./index.css";

const PlayerStats = ({ life, experience, level }) => {
  return (
    <div className="player-stats">
      <div className="player-stats-bar player-stats-life">
        <div className="player-stats-bar-inner" style={{ width: `${life}%` }} />
      </div>
      <div className="player-stats-bar player-stats-experience">
        <div
          className="player-stats-bar-inner"
          style={{ width: `${experience}%` }}
        />
      </div>
    </div>
  );
};

PlayerStats.propTypes = {
  life: PropTypes.number.isRequired,
  experience: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired
};

export default PlayerStats;
