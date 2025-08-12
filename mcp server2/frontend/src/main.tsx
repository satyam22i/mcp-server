import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import './ui/styles.css';

const container = document.getElementById('root')!;
createRoot(container).render(<App />);


