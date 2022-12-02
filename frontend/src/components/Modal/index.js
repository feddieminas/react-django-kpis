import React from 'react';
import { createRoot } from 'react-dom/client';
import ModalBS from "./Modal";

//https://github.com/BHVampire/modal/blob/main/src/App.jsx

const container = document.getElementById('modal-container');
const root = createRoot(container);
const createModal = (content) => root.render(
    <React.StrictMode>
        <ModalBS key={Math.random()} content={content} />
    </React.StrictMode>
)

export default createModal