import React from 'react';

const Avatar = ({ name, size = 40 }) => {
  const initial = name && name.length > 0 ? name.charAt(0) : '?';
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#FF5722'];
  const colorIndex = (name?.charCodeAt(0) || 0) % colors.length;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: colors[colorIndex],
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: size * 0.4,
      flexShrink: 0
    }}>
      {initial}
    </div>
  );
};

export default Avatar;
