import React from 'react';
import { Github, Linkedin, Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <strong>Typr_</strong> · Designed & Engineered for Developers by Bhavishya Agrawal
        </div>
        <div className="footer-links">
          <a
            href="https://github.com/Bhavishya-Agrawal"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Github size={15} /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/bhavishya-agrawal-8530622bb/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Linkedin size={15} /> LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
