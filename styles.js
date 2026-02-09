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
        }

        .p2p-animate-enter {
             animation: p2p-modal-enter 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }

        .p2p-modal.flappy {
            width: 480px;
            height: 320px;
        }

        .p2p-modal.tetris {
            width: 350px;
            height: 400px;
        }

        .tetris-canvas {
            width: 100%;
            height: 100%;
            display: block;
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

        .p2p-tetris-restart-btn {
            position: absolute;
            width: 140px;
            height: 40px;
            background: linear-gradient(to bottom, #1e2328 0%, #111518 100%);
            border: 1px solid #c8aa6e;
            color: #c8aa6e;
            font-family: "Beaufort for LOL", Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: inset 0 0 0 1px rgba(200, 170, 110, 0.2), 0 0 15px rgba(0, 0, 0, 0.8);
            outline: none;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .p2p-tetris-restart-btn::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(45deg, transparent 0%, rgba(200, 170, 110, 0.1) 50%, transparent 100%);
            transform: translateX(-100%);
            transition: transform 0.6s;
        }

        .p2p-tetris-restart-btn:hover {
            color: #f0e6d2;
            border-color: #f0e6d2;
            box-shadow: inset 0 0 10px rgba(200, 170, 110, 0.3), 0 0 25px rgba(200, 170, 110, 0.2);
            filter: brightness(1.1);
        }

        .p2p-tetris-restart-btn:hover::before {
            transform: translateX(100%);
        }

        .p2p-tetris-restart-btn:active {
            transform: scale(0.96);
            filter: brightness(0.8);
        }

        .p2p-modal.shake-anim {
            animation: p2p-single-shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }

        /* Keep content steady while window shakes */
        .p2p-modal.shake-anim .p2p-main-content {
            animation: p2p-single-shake-inverse 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes p2p-single-shake {
            10%, 90% { transform: translate3d(-1px, 1px, 0); }
            20%, 80% { transform: translate3d(2px, -2px, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 4px, 0); }
            40%, 60% { transform: translate3d(4px, -4px, 0); }
        }

        @keyframes p2p-single-shake-inverse {
            10%, 90% { transform: translate3d(1px, -1px, 0); }
            20%, 80% { transform: translate3d(-2px, 2px, 0); }
            30%, 50%, 70% { transform: translate3d(4px, -4px, 0); }
            40%, 60% { transform: translate3d(-4px, 4px, 0); }
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

        /* Launcher Modal Specifics */
        .p2p-launcher-modal {
            width: 450px !important;
            height: auto !important;
            min-height: 250px;
            background: radial-gradient(circle at center, #010a13 0%, #05101a 100%) !important;
            border: 1px solid #785a28 !important;
            box-shadow: 0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(120, 90, 40, 0.2) !important;
            padding-bottom: 20px;
        }

        .p2p-launcher-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 15px;
            padding: 20px;
        }

        .p2p-launcher-item {
            position: relative;
            background: linear-gradient(135deg, rgba(30, 35, 40, 0.9) 0%, rgba(10, 15, 20, 0.9) 100%);
            border: 1px solid #463714;
            border-radius: 2px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 20px 10px;
            text-align: center;
            overflow: hidden;
        }

        .p2p-launcher-item::after {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(45deg, transparent, rgba(200, 170, 110, 0.05), transparent);
            transform: translateX(-100%);
            transition: transform 0.5s;
        }

        .p2p-launcher-item:hover {
            border-color: #c8aa6e;
            background: linear-gradient(135deg, rgba(40, 45, 50, 0.9) 0%, rgba(20, 25, 30, 0.9) 100%);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.6), 0 0 10px rgba(200, 170, 110, 0.1);
        }

        .p2p-launcher-item:hover::after {
            transform: translateX(100%);
        }

        .p2p-launcher-icon {
            font-size: 32px;
            margin-bottom: 10px;
            filter: drop-shadow(0 0 5px rgba(200, 170, 110, 0.3));
        }

        .p2p-launcher-name {
            font-family: "Beaufort for LOL", Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            color: #c8aa6e;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .p2p-launcher-desc {
            font-size: 11px;
            color: #a09b8c;
            line-height: 1.3;
        }
            font-weight: bold;
            color: #f0e6d2;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .p2p-launcher-desc {
            font-size: 11px;
            color: #a09b8c;
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
            gap: 8px;
            flex-shrink: 0;
        }
        .p2p-pause-btn {
            margin-right: 4px;
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
            font-size: max(16px, 4.5cqw);
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

        .p2p-close-btn, .p2p-minimize-btn {
            cursor: pointer;
            color: #a09b8c;
            padding: 0 1cqw;
            transition: all 0.2s;
            line-height: 1;
        }
        .p2p-close-btn { font-size: max(20px, 5cqw); }
        .p2p-minimize-btn { font-size: max(18px, 4.5cqw); }
        
        .p2p-close-btn:hover, .p2p-minimize-btn:hover {
            color: #f0e6d2;
            text-shadow: 0 0 5px #f0e6d2;
        }

        /* Taskbar Styles */
        .p2p-taskbar {
            position: fixed;
            bottom: 30px;
            left: 280px;
            display: flex;
            gap: 12px;
            pointer-events: none; /* Container itself shouldn't block, items will enable auto */
            z-index: 10001;
        }
        .p2p-taskbar-item {
            background: #010a13;
            border: 2px solid #785a28;
            color: #c8aa6e;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
            transition: transform 0.2s, border-color 0.2s, background 0.2s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.6);
            pointer-events: auto;
            user-select: none;
            position: relative; /* For dragging */
        }
        .p2p-taskbar-item:hover {
            border-color: #c8aa6e;
            background: rgba(200, 170, 110, 0.1);
            transform: scale(1.1);
        }
        .p2p-taskbar-item:active {
            cursor: grabbing;
        }
        @keyframes p2p-taskbar-enter {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
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
            font-size: 13px;
            padding: 0 15px;
            cursor: pointer;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
            transition: all 0.2s;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
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
            align-items: stretch;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 2.5cqh;
            flex-shrink: 0;
            gap: 10px;
        }
        .g2048-score-container {
            display: flex;
            gap: 8px;
            flex: 1;
            min-width: 0;
        }
        .g2048-score-box {
            background: rgba(30, 35, 40, 0.6);
            padding: 8px 10px;
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
            width: max(24px, 5cqw);
            height: max(24px, 5cqw);
            border-radius: 50%;
            font-size: max(14px, 3.5cqw);
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
            width: 340px;
            background: #010a13;
            border: 2px solid #6b5826;
            padding: 10px;
            z-index: 20000;
            box-shadow: 0 0 20px rgba(0,0,0,0.9);
            border-radius: 4px;
            margin-top: 10px;
            pointer-events: none;
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
            gap: 10px;
            color: #f0e6d2;
            font-size: 11px;
            border-bottom: 1px solid rgba(70, 55, 20, 0.3);
            padding: 4px 0;
            transition: background 0.2s;
        }
        .p2p-info-item:hover {
            background: rgba(200, 170, 110, 0.05);
        }
        .p2p-info-img {
            width: 32px;
            height: 32px;
            border-radius: 2px;
            background-repeat: no-repeat;
            border: 1px solid #785a28;
            flex-shrink: 0;
            box-sizing: border-box;
            background-color: #010a13;
        }
        .p2p-info-val {
            color: #c8aa6e;
            font-weight: bold;
            min-width: 35px;
            text-align: left;
            flex-shrink: 0;
        }

        .p2p-toggle-mode-btn {
            background: none;
            border: 1px solid #463714;
            color: #a09b8c;
            width: max(24px, 5cqw);
            height: max(24px, 5cqw);
            border-radius: 50%;
            font-size: max(12px, 2.2cqw);
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
        .p2p-toggle-mode-btn svg {
            width: max(14px, 3cqw);
            height: max(14px, 3cqw);
            fill: currentColor;
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

        /* Settings Menu */
        .p2p-settings-container {
            position: relative;
            display: flex;
            align-items: center;
        }
        .p2p-settings-btn {
            background: none;
            border: 1px solid #463714;
            color: #a09b8c;
            width: max(24px, 5cqw);
            height: max(24px, 5cqw);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            margin-right: 1cqw;
        }
        .p2p-settings-btn:hover, .p2p-settings-btn.active {
            color: #c8aa6e;
            border-color: #c8aa6e;
            background: rgba(200, 170, 110, 0.1);
        }
        .p2p-settings-btn svg {
            width: max(16px, 3.5cqw);
            height: max(16px, 3.5cqw);
            fill: currentColor;
            transition: transform 0.3s ease;
        }
        .p2p-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .p2p-header-action-btn {
            background: none;
            border: none;
            color: #a09b8c;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
        }

        .p2p-header-action-btn:hover {
            color: #f0e6d2;
        }

        .p2p-settings-container {
            position: relative;
            z-index: 2000;
        }
        .p2p-settings-btn.active svg {
            transform: rotate(45deg);
        }
        .p2p-settings-menu {
            position: absolute;
            top: 100%;
            right: 0;
            width: 220px;
            background: #010a13;
            border: 2px solid #6b5826;
            padding: 12px 15px;
            z-index: 3000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.8);
            border-radius: 4px;
            margin-top: 12px;
            display: none;
            flex-direction: column;
            gap: 15px;
        }
        .p2p-settings-menu.visible {
            display: flex;
            animation: p2p-menu-enter 0.2s ease-out;
        }
        @keyframes p2p-menu-enter {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .p2p-setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #f0e6d2;
            font-size: 13px;
            min-height: 24px;
        }
        .p2p-settings-extra {
            display: flex;
            flex-direction: column;
            gap: 15px;
            border-top: 1px solid rgba(107, 88, 38, 0.3);
            margin-top: 5px;
            padding-top: 15px;
        }
        .p2p-settings-extra:empty {
            display: none;
        }
        .p2p-toggle-switch {
            position: relative;
            display: inline-block;
            width: 34px;
            height: 18px;
        }
        .p2p-toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .p2p-toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #1e2328;
            border: 1px solid #463714;
            transition: .3s;
            border-radius: 18px;
        }
        .p2p-toggle-slider:before {
            position: absolute;
            content: "";
            height: 12px;
            width: 12px;
            left: 2px;
            bottom: 2px;
            background-color: #a09b8c;
            transition: .3s;
            border-radius: 50%;
        }
        input:checked + .p2p-toggle-slider {
            background-color: rgba(200, 170, 110, 0.2);
            border-color: #c8aa6e;
        }
        input:checked + .p2p-toggle-slider:before {
            transform: translateX(16px);
            background-color: #c8aa6e;
            box-shadow: 0 0 5px #c8aa6e;
        }

        /* Game Selector Menu */
        .p2p-game-selector {
            position: absolute;
            top: 100%;
            left: 0;
            width: 150px;
            background: #010a13;
            border: 2px solid #6b5826;
            padding: 5px 0;
            z-index: 30000;
            box-shadow: 0 0 20px rgba(0,0,0,0.9);
            border-radius: 4px;
            margin-top: 10px;
            display: none;
            flex-direction: column;
        }
        .p2p-game-selector.visible {
            display: flex;
            animation: p2p-menu-enter 0.2s ease-out;
        }
        .p2p-game-option {
            padding: 10px 15px;
            color: #a09b8c;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .p2p-game-option:hover {
            background: rgba(200, 170, 110, 0.1);
            color: #f0e6d2;
        }
        .p2p-game-option.active {
            color: #c8aa6e;
            background: rgba(200, 170, 110, 0.05);
            font-weight: bold;
        }

        /* Flappy Taric Styles */
        .flappy-container {
            width: 100%;
            height: 100%;
            position: relative;
            background: #010a13;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .flappy-canvas {
            width: 100%;
            height: 100%;
            cursor: pointer;
        }
        .flappy-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
            color: #f0e6d2;
            text-align: center;
        }
        .flappy-title {
            font-size: 24px;
            color: #c8aa6e;
            margin-bottom: 20px;
            font-family: 'Beaufort for LOL', serif;
            text-transform: uppercase;
        }
        .flappy-score-large {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        /* Tetris Overlay Styles */
        .tetris-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(1, 10, 19, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        .tetris-game-over-panel {
            background: #010a13;
            border: 2px solid #c8aa6e;
            padding: 40px 50px;
            border-radius: 4px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            position: relative;
        }
        .tetris-game-over-panel::before,
        .tetris-game-over-panel::after {
            content: '';
            position: absolute;
            width: 15px;
            height: 15px;
            border: 2px solid #c8aa6e;
        }
        .tetris-game-over-panel::before {
            top: -2px;
            left: -2px;
            border-right: none;
            border-bottom: none;
        }
        .tetris-game-over-panel::after {
            bottom: -2px;
            right: -2px;
            border-left: none;
            border-top: none;
        }
        .tetris-title {
            font-size: 32px;
            color: #c8aa6e;
            margin-bottom: 20px;
            font-family: 'Beaufort for LOL', serif;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .tetris-score-display {
            font-size: 20px;
            color: #f0e6d2;
            margin-bottom: 30px;
            font-family: 'Beaufort for LOL', serif;
        }
        .tetris-game-over-panel .p2p-btn {
            margin: 0 auto;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
};

export const GAME_ICON = `
<svg viewBox="0 0 24 24">
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
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

export const SETTINGS_ICON = `
<svg viewBox="0 0 24 24">
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
</svg>
`;

export const USER_ICON = `
<svg viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
</svg>
`;

export const NUM_ICON = `
<svg viewBox="0 0 24 24">
    <path d="M7 2h10c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm0 2v16h10V4H7zm2 2h6v2H9V6zm0 4h6v2H9v-2zm0 4h3v2H9v-2z"/>
</svg>
`;
