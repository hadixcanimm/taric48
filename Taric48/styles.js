/**
 * Styles for Taric48 - 2048 Plugin
 */

export const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .p2p-nav-item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            margin: 0 4px;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.2s;
            pointer-events: auto !important;
        }
        .p2p-nav-item:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        .p2p-nav-item svg {
            width: 20px;
            height: 20px;
            fill: #cdbe91;
        }
        .p2p-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 9999;
            pointer-events: none; /* Allow interaction with background */
        }
        .p2p-modal {
            background: #010a13;
            border: 2px solid #463714;
            border-top: 2px solid #6b5826;
            width: 260px;
            height: 325px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 20px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(0,0,0,0.5);
            color: #f0e6d2;
            font-family: var(--font-body, "Inter", "Helvetica Neue", Arial, sans-serif);
            position: fixed;
            top: 100px;
            left: 280px;
            pointer-events: auto;
            user-select: none;
            transition: width 0.3s ease, height 0.3s ease;
            container-type: inline-size;
            z-index: 10000;
            opacity: 1;
            animation: p2p-modal-enter 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }

        @keyframes p2p-modal-enter {
            0% {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .p2p-modal-closing {
            animation: p2p-modal-exit 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards !important;
        }

        @keyframes p2p-modal-exit {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(10px) scale(0.95);
            }
        }

        .p2p-modal.shake {
            animation: p2p-shake 0.1s infinite;
            opacity: 1 !important;
            transform-origin: center;
        }

        .p2p-modal.shake .p2p-main-content {
            animation: p2p-shake-inverse 0.1s infinite;
        }

        @keyframes p2p-shake {
            0% { transform: translate(0, 0); }
            25% { transform: translate(2px, -2px); }
            50% { transform: translate(-2px, 2px); }
            75% { transform: translate(2px, 2px); }
            100% { transform: translate(-2px, -2px); }
        }

        @keyframes p2p-shake-inverse {
            0% { transform: translate(0, 0); }
            25% { transform: translate(-2px, 2px); }
            50% { transform: translate(2px, -2px); }
            75% { transform: translate(-2px, -2px); }
            100% { transform: translate(2px, 2px); }
        }

        .p2p-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3cqw 4cqw;
            background: linear-gradient(90deg, #1e2328 0%, #0a0c10 100%);
            border-bottom: 1px solid #463714;
            cursor: move;
            flex-shrink: 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .p2p-modal-title {
            font-size: 4cqw;
            font-weight: 700;
            color: #f0e6d2;
            letter-spacing: 0.5px;
            text-shadow: 0 0 10px rgba(200, 170, 110, 0.4);
        }
        
        .p2p-header-actions {
            display: flex;
            align-items: center;
            gap: 2cqw;
            flex-shrink: 0;
        }

        .p2p-scale-controls {
            display: flex;
            align-items: center;
            gap: 1cqw;
            background: rgba(0, 0, 0, 0.3);
            padding: 0.5cqw 1.5cqw;
            border-radius: 2px;
            border: 1px solid #463714;
        }

        .p2p-scale-btn {
            background: none;
            border: none;
            color: #a09b8c;
            font-size: 4.5cqw;
            font-weight: bold;
            cursor: pointer;
            padding: 0 1cqw;
            transition: all 0.2s;
            line-height: 1;
        }
        .p2p-scale-btn:hover {
            color: #c8aa6e;
            text-shadow: 0 0 5px #c8aa6e;
        }
        .p2p-scale-btn:disabled {
            opacity: 0.3;
            cursor: default;
        }
        .p2p-scale-val {
            font-size: 3.5cqw;
            color: #c8aa6e;
            min-width: 4cqw;
            text-align: center;
            font-family: monospace;
        }

        .p2p-close-btn {
            cursor: pointer;
            color: #a09b8c;
            font-size: 5cqw;
            padding: 0 1cqw;
            transition: all 0.2s;
            line-height: 1;
        }
        .p2p-close-btn:hover {
            color: #f0e6d2;
            text-shadow: 0 0 5px #f0e6d2;
        }

        .p2p-main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: radial-gradient(circle at center, #13171a 0%, #010a13 100%);
        }

        .p2p-btn, #g2048-reset {
            background: linear-gradient(180deg, #1e2328 0%, #13171a 100%);
            border: 1px solid #785a28;
            color: #c8aa6e;
            font-size: 4cqw;
            padding: 2cqw 4cqw;
            cursor: pointer;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.5px;
            transition: all 0.2s;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
        }
        .p2p-btn:hover, #g2048-reset:hover {
            border-color: #c8aa6e;
            color: #f0e6d2;
            text-shadow: 0 0 8px #c8aa6e;
            background: linear-gradient(180deg, #252a30 0%, #1a1e22 100%);
            box-shadow: 0 0 10px rgba(200, 170, 110, 0.2);
        }

        /* 2048 Game Styles */
        .g2048-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 4cqw;
            overflow: hidden;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            container-type: size;
        }

        .g2048-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 2cqh;
            flex-shrink: 0;
            gap: 2cqw;
        }
        .g2048-score-container {
            display: flex;
            gap: 1.5cqw;
            flex: 1; /* Take up all available space */
            min-width: 0;
        }
        .g2048-score-box {
            background: rgba(30, 35, 40, 0.6);
            padding: 0.5cqh 1.5cqw;
            border-radius: 2px;
            text-align: center;
            border: 1px solid #463714;
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
        }
        .g2048-score-box::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 10%;
            width: 80%;
            height: 1px;
            background: linear-gradient(90deg, transparent, #c8aa6e, transparent);
            opacity: 0.5;
        }
        /* Make BEST box slightly wider */
        .g2048-score-box:last-child {
            flex: 1.3;
        }
        .g2048-score-box .label {
            display: block;
            font-size: 2.2cqw;
            color: #a09b8c;
            font-weight: bold;
            margin-bottom: 0px;
            white-space: nowrap;
            text-transform: uppercase;
        }
        .g2048-score-box span:not(.label) {
            font-size: 4cqw;
            font-weight: bold;
            color: #f0e6d2;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        #g2048-reset { /* Covered by .p2p-btn group above, removed explicit block but kept selector for specificity if needed */
            /* Reset specific padding handled above */
        }
        .g2048-board-wrapper {
            position: relative;
            background: #1e2328;
            padding: 2.5%;
            border-radius: 1.5cqw;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            margin-bottom: 4cqh;
            width: 100%;
            aspect-ratio: 1 / 1;
            display: flex;
            box-sizing: border-box;
            flex-shrink: 1;
            min-height: 0;
        }
        .g2048-board {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 2.5%;
            width: 100%;
            height: 100%;
            position: relative;
        }
        .g2048-grid-cell {
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 1cqw;
            width: 100%;
            height: 100%;
        }
        .g2048-tile-layer {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
        }
        .g2048-tile {
            position: absolute;
            width: 23.125%; /* (100% - 3*2.5%) / 4 */
            height: 23.125%;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 1cqw;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 7cqw;
            font-weight: bold;
            color: #f0e6d2;
            transition: left 0.1s ease-in-out, top 0.1s ease-in-out, opacity 0.1s;
            container-type: inline-size;
            box-sizing: border-box;
            text-shadow: 0 0 5px rgba(0,0,0,0.5);
            z-index: 10;
        }

        .g2048-merged {
            animation: p2p-merged-pop 0.2s ease-in-out;
            z-index: 20;
        }

        @keyframes p2p-merged-pop {
            0% { transform: scale(1); }
            50% { 
                transform: scale(1.15); 
                box-shadow: 0 0 25px rgba(240, 230, 210, 0.6);
                filter: brightness(1.2);
            }
            100% { transform: scale(1); }
        }

        .g2048-new {
            animation: p2p-tile-appear 0.2s ease-out;
        }

        @keyframes p2p-tile-appear {
            0% { opacity: 0; transform: scale(0); }
            100% { opacity: 1; transform: scale(1); }
        }

        .g2048-sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #f0e6d2;
            border-radius: 50%;
            pointer-events: none;
            z-index: 100;
            box-shadow: 0 0 8px #f0e6d2, 0 0 12px #c8aa6e;
            animation: sparkle-animation var(--sparkle-duration) ease-out forwards;
        }

        @keyframes sparkle-animation {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(var(--dx), var(--dy)) scale(0);
                opacity: 0;
            }
        }
        .g2048-tile-overlay {
            position: absolute;
            bottom: 2%;
            right: 2%;
            background: rgba(0, 0, 0, 0.6);
            color: #f0e6d2;
            font-size: 3cqw;
            padding: 0.2cqw 1cqw;
            border-radius: 0.5cqw;
            pointer-events: none;
            backdrop-filter: blur(2px);
        }
        .g2048-footer {
            color: #a09b8c;
            font-size: 3cqw;
            text-transform: uppercase;
            letter-spacing: 1px;
            flex-shrink: 0;
            text-align: center;
            margin-top: auto;
            margin-bottom: 2cqh;
        }

        .g2048-overlay {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(1, 10, 19, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 200; /* Ensure it blocks everything */
            border-radius: 6px;
        }
        .g2048-message {
            font-size: 24px;
            font-weight: bold;
            color: #c8aa6e;
            margin-bottom: 15px;
            text-shadow: 0 0 10px rgba(200, 170, 110, 0.5);
        }

        /* Combo UI */
        .g2048-combo-wrapper {
            position: absolute;
            top: -5cqh;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 100;
        }

        .g2048-combo-wrapper.visible {
            opacity: 1;
        }

        .g2048-combo-text {
            font-size: 5cqw;
            font-weight: 900;
            color: #c8aa6e;
            text-shadow: 0 0 10px rgba(200, 170, 110, 0.8), 2px 2px 0px #010a13;
            font-family: 'Beaufort for LOL', serif;
            font-style: italic;
            margin-bottom: 1cqh;
            animation: combo-pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes combo-pop {
            0% { transform: scale(0.5); }
            100% { transform: scale(1); }
        }

        .g2048-combo-timer-bg {
            width: 30cqw;
            height: 4px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(200, 170, 110, 0.3);
            border-radius: 2px;
            overflow: hidden;
        }

        .g2048-combo-timer-bar {
            height: 100%;
            background: linear-gradient(90deg, #c8aa6e, #f0e6d2);
            width: 100%;
            transform-origin: left;
        }

        .g2048-combo-timer-bar.running {
            animation: combo-timer-shrink var(--combo-duration) linear forwards;
        }

        @keyframes combo-timer-shrink {
            0% { transform: scaleX(1); }
            100% { transform: scaleX(0); }
        }

        .g2048-board-wrapper.high-combo {
            box-shadow: 0 0 30px rgba(200, 170, 110, 0.4), inset 0 0 20px rgba(200, 170, 110, 0.2);
            border: 1px solid rgba(200, 170, 110, 0.5);
            transition: all 0.3s;
        }

        /* Tile Colors - Hextech/Dark Theme Match */
        .tile-2 { background: #1e2328; color: #f0e6d2; border: 1px solid #30343a; }
        .tile-4 { background: #2a3038; color: #f0e6d2; border: 1px solid #3c444d; }
        .tile-8 { background: rgba(200, 170, 110, 0.2); color: #c8aa6e; border: 1px solid #c8aa6e; }
        .tile-16 { background: rgba(200, 170, 110, 0.4); color: #f0e6d2; border: 1px solid #c8aa6e; }
        .tile-32 { background: rgba(200, 170, 110, 0.6); color: #f0e6d2; border: 1px solid #c8aa6e; }
        .tile-64 { background: #c8aa6e; color: #010a13; }
        .tile-128 { background: #c89b3c; color: #010a13; font-size: 20px; box-shadow: 0 0 15px rgba(200, 155, 60, 0.5); }
        .tile-256 { background: #a09b5a; color: #010a13; font-size: 20px; box-shadow: 0 0 15px rgba(160, 155, 90, 0.5); }
        .tile-512 { background: #785a28; color: #f0e6d2; font-size: 20px; box-shadow: 0 0 20px rgba(120, 90, 40, 0.5); }
        .tile-1024 { background: #463714; color: #f0e6d2; font-size: 16px; box-shadow: 0 0 25px rgba(70, 55, 20, 0.5); }
        .tile-2048 { background: #c8aa6e; color: #010a13; font-size: 16px; box-shadow: 0 0 35px #c8aa6e; border: 2px solid #f0e6d2; }

        /* Info / Legend Tooltip */
        .p2p-info-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        .p2p-info-btn, .p2p-mute-btn {
            background: none;
            border: 1px solid #463714;
            color: #a09b8c;
            width: 5cqw;
            height: 5cqw;
            border-radius: 50%;
            font-size: 3.5cqw;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            margin-right: 1cqw;
        }
        .p2p-mute-btn {
            cursor: pointer;
        }
        .p2p-info-btn {
            cursor: help;
        }
        .p2p-info-btn:hover, .p2p-mute-btn:hover {
            color: #c8aa6e;
            border-color: #c8aa6e;
            background: rgba(200, 170, 110, 0.1);
            text-shadow: 0 0 5px #c8aa6e;
        }
        .p2p-mute-btn svg {
            width: 5cqw;
            height: 5cqw;
            min-width: 14px;
            min-height: 14px;
            fill: #a09b8c;
            display: block;
            transition: fill 0.2s;
        }
        .p2p-info-btn:hover svg, .p2p-mute-btn:hover svg {
            fill: #f0e6d2;
            filter: drop-shadow(0 0 2px #f0e6d2);
        }
        .p2p-info-tooltip {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            width: 280px;
            background: #010a13;
            border: 2px solid #6b5826;
            padding: 10px;
            z-index: 20000;
            box-shadow: 0 0 20px rgba(0,0,0,0.9);
            border-radius: 4px;
            margin-top: 10px;
        }
        .p2p-info-wrapper:hover .p2p-info-tooltip {
            display: block;
        }
        .p2p-info-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            max-height: 400px;
            overflow-y: auto;
        }
        /* Hextech Scrollbar */
        .p2p-info-list::-webkit-scrollbar {
            width: 4px;
        }
        .p2p-info-list::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.3);
        }
        .p2p-info-list::-webkit-scrollbar-thumb {
            background: #c8aa6e;
            border-radius: 2px;
        }
        .p2p-info-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #f0e6d2;
            font-size: 11px;
            border-bottom: 1px solid rgba(70, 55, 20, 0.5);
            padding-bottom: 4px;
        }
        .p2p-info-item:last-child {
            border-bottom: 1px solid rgba(70, 55, 20, 0.5); /* Keep border for grid look */
        }
        .p2p-info-img {
            width: 25px;
            height: 25px;
            border-radius: 4px;
            background-size: cover;
            background-position: top center;
            border: 1px solid #463714;
            flex-shrink: 0;
        }
        .p2p-info-val {
            color: #c8aa6e;
            font-weight: bold;
            width: 30px;
            text-align: right;
            flex-shrink: 0;
        }

        .p2p-toggle-mode-btn {
            background: none;
            border: 1px solid #463714;
            color: #a09b8c;
            width: 5cqw;
            height: 5cqw;
            border-radius: 50%;
            font-size: 2.2cqw;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            margin-right: 1cqw;
        }
        .p2p-toggle-mode-btn:hover {
            color: #c8aa6e;
            border-color: #c8aa6e;
            background: rgba(200, 170, 110, 0.1);
            text-shadow: 0 0 5px #c8aa6e;
        }

        .p2p-header-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        .p2p-header-btn:hover {
            opacity: 1;
        }
        .p2p-header-icon {
            width: 18px;
            height: 18px;
            fill: #a09b8c;
        }
        .p2p-header-btn:hover .p2p-header-icon {
            fill: #f0e6d2;
            filter: drop-shadow(0 0 2px #f0e6d2);
        }
    `;
    document.head.appendChild(style);
};

export const GAME_ICON = `
<svg viewBox="0 0 24 24">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
</svg>
`;

export const VOLUME_ICON = `
<svg viewBox="0 0 24 24">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
</svg>
`;

export const MUTE_ICON = `
<svg viewBox="0 0 24 24">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
</svg>
`;
