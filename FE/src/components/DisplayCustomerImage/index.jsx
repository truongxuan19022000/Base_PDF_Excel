import React from 'react';

const DisplayCustomerImage = ({
  width = 32,
  height = 32,
  username = '',
  fontSize = '14px',
}) => {
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const intToColor = (i) => {
    const baseColors = ['#487eb0', '#e15f41', '#eb4d4b', '#63cdda', '#e77f67', '#786fa6', '#f7d794', '#cf6a87', '#574b90', '#fbc531', '#c23616', '#00b894', '#00cec9', '#0984e3', '#fdcb6e', '#e17055', '#636e72', '#1e3799', '#6ab04c', '#130f40', '#535c68'];
    const colorIndex = (i % baseColors.length + baseColors.length) % baseColors.length;
    return baseColors[colorIndex];
  };

  const darkenColor = (color, factor) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const newR = Math.max(0, r - factor);
    const newG = Math.max(0, g - factor);
    const newB = Math.max(0, b - factor);

    const padZero = (value) => (value < 16 ? '0' : '') + value.toString(16);

    const newColor = `#${padZero(newR)}${padZero(newG)}${padZero(newB)}`;
    return newColor;
  };

  const hash = hashCode(username);
  const colorCode = intToColor(hash);
  const firstTwoLetter = username.slice(0, 2) ? username.slice(0, 2).toUpperCase() : '';

  const darkenedColor = darkenColor(colorCode, 5);

  const style = {
    width: `${width}px`,
    height: `${height}px`,
    color: 'white',
    background: darkenedColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: fontSize,
    fontWeight: 300,
    borderRadius: '100%',
    transition: '0.3s',
    textShadow: '2px 2px 2px #0000009c',
    filter: ' grayscale(0.6)',
  };

  return (
    <div className="user-image" style={style}>
      {firstTwoLetter}
    </div>
  );
};

export default DisplayCustomerImage;
