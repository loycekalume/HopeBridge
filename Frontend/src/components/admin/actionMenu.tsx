// ActionMenu.tsx
import React, { useRef, useEffect } from 'react';
import '../../styles/admin.css'

interface ActionMenuProps {
  userId: number;
  onClose: () => void;
  onViewProfile: (id: number) => void;
  onSuspendUser: (id: number) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ userId, onClose, onViewProfile, onSuspendUser }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="action-menu-popup" ref={menuRef}>
      <button onClick={() => { onViewProfile(userId); onClose(); }}>View Profile</button>
      <button onClick={() => { onSuspendUser(userId); onClose(); }} className="suspend-btn">
        Suspend User
      </button>
    </div>
  );
};

export default ActionMenu;