import { PokeSkip } from '../core/state.js';
import { PokeStorage } from '../core/storage.js';
import { UI } from './index.js';

export const Hud = {
    getPokeballSvg(size = 20, enabled = true) {
      const isEnabled = enabled !== false;
      const centerFill = isEnabled ? '#34d399' : '#475569';
      return `
        <svg class="pokeskip-hud-ball ${isEnabled ? 'on' : 'off'}" viewBox="0 0 100 100" width="${size}" height="${size}" style="display:block; flex-shrink:0;">
          <defs>
            <linearGradient id="pksBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <linearGradient id="pksWhite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#e2e8f0"/>
            </linearGradient>
          </defs>
          <path d="M 5 50 A 45 45 0 0 1 95 50 Z" fill="url(#pksBlue)"/>
          <path d="M 5 50 A 45 45 0 0 0 95 50 Z" fill="url(#pksWhite)"/>
          <line x1="5" y1="50" x2="95" y2="50" stroke="#0f172a" stroke-width="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#0f172a" stroke-width="8"/>
          <circle cx="50" cy="50" r="14" fill="#0f172a"/>
          <circle cx="50" cy="50" r="8" fill="#ffffff"/>
          <circle class="pks-ball-center-dot" cx="50" cy="50" r="4" fill="${centerFill}"/>
        </svg>
      `;
    },

    createHudButton() {
      if (document.getElementById('pokeskip-hud')) return;
      const hud = document.createElement('div');
      hud.id = 'pokeskip-hud';
      const enabled = PokeSkip.settings.enabled;
      hud.className = enabled ? 'on' : 'off';
      hud.title = `PokéSkip (${enabled ? 'Actif - ON' : 'En pause - OFF'}) • Raccourci P • Glisser pour déplacer`;
      const runCount = PokeSkip.getRunSkippedCount();
      const showCount = PokeSkip.settings.showHudCount !== false;
      hud.innerHTML = `
        <div class="pokeskip-hud-pill" title="PokéSkip (${enabled ? 'Actif - ON' : 'En pause - OFF'}) • Clic pour gérer les capacités • Raccourci P">
          <div class="pokeskip-hud-ball-wrap" title="${enabled ? 'PokéSkip : ACTIF (ON)' : 'PokéSkip : EN PAUSE (OFF)'}">
            ${this.getPokeballSvg(20, enabled)}
          </div>
          <span class="pokeskip-hud-badge" id="pokeskip-hud-count" style="display: ${showCount ? 'inline-block' : 'none'};">${runCount} passée${runCount > 1 ? 's' : ''}</span>
        </div>
        <button id="pokeskip-hud-type-btn" title="Tableau des Types (Touche T)">⚔️</button>
      `;
      this.makeHudDraggable(hud);

      const typeBtn = hud.querySelector('#pokeskip-hud-type-btn');
      if (typeBtn) {
        typeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleTypeChart(false);
        });
      }

      document.body.appendChild(hud);
      this.hudContainer = hud;
    },

    applyHudPosition(hud) {
      if (!hud) return;
      const savedPos = PokeStorage.get('pokeskip_hud_pos', null);
      if (!savedPos) return;

      const hudW = hud.offsetWidth || 120;
      const hudH = hud.offsetHeight || 40;
      const maxLeft = Math.max(10, window.innerWidth - hudW - 10);
      const maxTop = Math.max(10, window.innerHeight - hudH - 10);

      let targetLeft, targetTop;

      if (typeof savedPos.ratioX === 'number' && typeof savedPos.ratioY === 'number') {
        const rX = Math.max(0, Math.min(1, savedPos.ratioX));
        const rY = Math.max(0, Math.min(1, savedPos.ratioY));
        targetLeft = 10 + rX * (maxLeft - 10);
        targetTop = 10 + rY * (maxTop - 10);
      } else if (typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
        targetLeft = Math.max(10, Math.min(maxLeft, savedPos.x));
        targetTop = Math.max(10, Math.min(maxTop, savedPos.y));
        const rX = maxLeft > 10 ? (targetLeft - 10) / (maxLeft - 10) : 1;
        const rY = maxTop > 10 ? (targetTop - 10) / (maxTop - 10) : 0.5;
        PokeStorage.set('pokeskip_hud_pos', {
          ratioX: Math.max(0, Math.min(1, rX)),
          ratioY: Math.max(0, Math.min(1, rY)),
          x: targetLeft,
          y: targetTop
        });
      } else {
        return;
      }

      hud.style.left = `${Math.round(targetLeft)}px`;
      hud.style.top = `${Math.round(targetTop)}px`;
      hud.style.right = 'auto';
      hud.style.transform = 'none';
    },

    makeHudDraggable(hud) {
      this.applyHudPosition(hud);

      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;
      let hasMoved = false;

      hud.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target && e.target.closest('#pokeskip-hud-type-btn')) return;
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;

        const rect = hud.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        hud.classList.add('dragging');
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasMoved = true;
        }

        const hudW = hud.offsetWidth || 120;
        const hudH = hud.offsetHeight || 40;
        const maxLeft = Math.max(10, window.innerWidth - hudW - 10);
        const maxTop = Math.max(10, window.innerHeight - hudH - 10);

        const newX = Math.max(10, Math.min(maxLeft, initialLeft + dx));
        const newY = Math.max(10, Math.min(maxTop, initialTop + dy));

        hud.style.left = `${newX}px`;
        hud.style.top = `${newY}px`;
        hud.style.right = 'auto';
        hud.style.transform = 'none';
      });

      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        hud.classList.remove('dragging');

        if (hasMoved) {
          const rect = hud.getBoundingClientRect();
          const hudW = hud.offsetWidth || rect.width || 120;
          const hudH = hud.offsetHeight || rect.height || 40;
          const maxLeft = Math.max(10, window.innerWidth - hudW - 10);
          const maxTop = Math.max(10, window.innerHeight - hudH - 10);

          const clampedLeft = Math.max(10, Math.min(maxLeft, rect.left));
          const clampedTop = Math.max(10, Math.min(maxTop, rect.top));

          const ratioX = maxLeft > 10 ? (clampedLeft - 10) / (maxLeft - 10) : 1;
          const ratioY = maxTop > 10 ? (clampedTop - 10) / (maxTop - 10) : 0.5;

          PokeStorage.set('pokeskip_hud_pos', {
            ratioX: Math.max(0, Math.min(1, ratioX)),
            ratioY: Math.max(0, Math.min(1, ratioY)),
            x: clampedLeft,
            y: clampedTop
          });

          hud.style.left = `${Math.round(clampedLeft)}px`;
          hud.style.top = `${Math.round(clampedTop)}px`;
          hud.style.right = 'auto';
          hud.style.transform = 'none';
        }
      });

      hud.addEventListener('click', (e) => {
        if (hasMoved) {
          e.stopPropagation();
          hasMoved = false;
          return;
        }
        if (e.target && e.target.closest('#pokeskip-hud-type-btn')) {
          return;
        }
        if (e.target && e.target.closest('.pokeskip-hud-pill')) {
          this.toggleModal();
        }
      });
    },

    updateHudBadge() {
      const hud = document.getElementById('pokeskip-hud');
      const pill = hud?.querySelector('.pokeskip-hud-pill');
      const ball = hud?.querySelector('.pokeskip-hud-ball');
      const ballWrap = hud?.querySelector('.pokeskip-hud-ball-wrap');
      const countEl = document.getElementById('pokeskip-hud-count');
      const dividerEl = document.getElementById('pokeskip-hud-divider');
      const statusEl = document.querySelector('.pokeskip-hud-status');
      const enabled = PokeSkip.settings.enabled;
      const showCount = PokeSkip.settings.showHudCount !== false;
      const runCount = PokeSkip.getRunSkippedCount();

      if (hud) {
        hud.classList.toggle('on', !!enabled);
        hud.classList.toggle('off', !enabled);
        hud.title = `PokéSkip (${enabled ? 'Actif - ON' : 'En pause - OFF'}) • Raccourci P • Glisser pour déplacer`;
      }
      if (pill) {
        pill.title = `PokéSkip (${enabled ? 'Actif - ON' : 'En pause - OFF'}) • Clic pour gérer les capacités • Raccourci P`;
      }
      if (ballWrap) {
        ballWrap.title = enabled ? 'PokéSkip : ACTIF (ON)' : 'PokéSkip : EN PAUSE (OFF)';
      }
      if (ball) {
        ball.classList.toggle('on', !!enabled);
        ball.classList.toggle('off', !enabled);
        const centerDot = ball.querySelector('.pks-ball-center-dot');
        if (centerDot) {
          centerDot.setAttribute('fill', enabled ? '#34d399' : '#475569');
        }
      }
      if (countEl) {
        countEl.textContent = `${runCount} passée${runCount > 1 ? 's' : ''}`;
        countEl.style.display = showCount ? 'inline-block' : 'none';
      }
      if (dividerEl) {
        dividerEl.style.display = 'none';
      }
      if (statusEl) {
        statusEl.className = `pokeskip-hud-status ${enabled ? 'on' : 'off'}`;
        statusEl.textContent = enabled ? '● ON' : '○ OFF';
      }
    },
};
