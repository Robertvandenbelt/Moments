import React from 'react';
import { useParams } from 'react-router-dom';

const JoinMomentBoard: React.FC = () => {
  const { momentBoardId } = useParams<{ momentBoardId: string }>();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#222',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Join Moment Board</h1>
        <p>momentBoardId: <b>{momentBoardId}</b></p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>
          If you see this, the component and routing are working!
        </p>
      </div>
    </div>
  );
};

export default JoinMomentBoard;