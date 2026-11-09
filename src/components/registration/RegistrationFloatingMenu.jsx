import React from 'react';
import { Laptop, FolderOpen, MapPin, GraduationCap } from 'lucide-react';

const FLOATING_MENU_ITEMS = [
  { id: 'sistemas', label: 'Sistemas Académicos', href: 'https://upel.edu.ve/SISTEMAS/', icon: <Laptop size={19} /> },
  { id: 'repositorio', label: 'Repositorio', href: 'https://espacio.digital.upel.edu.ve/', icon: <FolderOpen size={19} /> },
  { id: 'ubicanos', label: 'Ubícanos', href: 'https://upel.edu.ve/catastro/', icon: <MapPin size={19} /> },
  { id: 'aulavirtual', label: 'Aula Virtual', href: 'https://aulavirtual.upel.edu.ve/', icon: <GraduationCap size={19} /> }
];

export const RegistrationFloatingMenu = () => {
  return (
    <>
      <style>{`
        .upel-float-menu {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .upel-float-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #009a44;
          color: #ffffff;
          padding: 10px 16px 10px 12px;
          border-radius: 0 8px 8px 0;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 2px 4px 14px rgba(0, 0, 0, 0.22);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 3px solid #007a36;
        }
        .upel-float-item:hover {
          background: #007a36;
          color: #ffffff;
          transform: translateX(4px);
          box-shadow: 4px 6px 18px rgba(0, 0, 0, 0.32);
        }
        .upel-float-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .upel-float-text {
          white-space: nowrap;
          letter-spacing: 0.2px;
        }
        @media (max-width: 1280px) {
          .upel-float-text {
            display: none;
          }
          .upel-float-item {
            padding: 10px 10px;
            border-radius: 0 6px 6px 0;
          }
        }
        @media (max-width: 768px) {
          .upel-float-menu {
            display: none;
          }
        }
        @media (max-height: 750px) {
          .upel-float-menu {
            top: 45%;
            gap: 4px;
          }
        }
      `}</style>
      <aside className="upel-float-menu" aria-label="Enlaces Oficiales UPEL">
        {FLOATING_MENU_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="upel-float-item"
            title={item.label}
          >
            <span className="upel-float-icon">{item.icon}</span>
            <span className="upel-float-text">{item.label}</span>
          </a>
        ))}
      </aside>
    </>
  );
};

export default RegistrationFloatingMenu;
