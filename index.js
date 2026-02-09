/**
 * Taric48 - 2048 Plugin Entry Point
 */
import { injectStyles } from './styles.js';
import { createHeaderButton, showGameModal, showLauncherModal } from './ui.js';

async function handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    showLauncherModal((gameType) => {
        showGameModal(gameType);
    });
}

function handleContextClick(event) {
    event.preventDefault();
    event.stopPropagation();
    showLauncherModal((gameType) => {
        showGameModal(gameType);
    });
}

function tryInjectButton() {
    if (document.querySelector('.taric48-launcher')) return;

    const supportBtn = document.querySelector('.app-controls-support');
    if (supportBtn) {
        const newBtn = supportBtn.cloneNode(true);
        newBtn.classList.add('taric48-launcher');
        newBtn.removeAttribute('action'); // Prevent default client behavior

        newBtn.addEventListener('click', handleButtonClick);
        newBtn.addEventListener('contextmenu', handleContextClick);

        supportBtn.replaceWith(newBtn);
        console.log('[Taric48] Support button function updated');
    }
}

function init() {
    injectStyles();

    const observer = new MutationObserver(() => {
        tryInjectButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    tryInjectButton();
}

window.addEventListener('load', init);
