/**
 * Gym OS Embeddable Widget
 * 
 * Add this script to ANY website (.app, .com, .in, .io, whatever):
 * <script src="https://somilsharma2000.github.io/gym-os-frontend/gymos-widget.js" data-gym-id="YOUR_GYM_ID"></script>
 * 
 * The widget creates a floating button that opens a panel with:
 * - Lead capture form (syncs to Gym OS in real-time)
 * - Trial pass signup (48-hour trial)
 * - QR check-in (scan to check in/out)
 * - Class schedule display
 */

(function() {
  'use strict';

  const API_BASE = 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions/publicGymAPI';
  const scriptTag = document.currentScript || document.querySelector('script[data-gym-id]');
  const GYM_ID = scriptTag?.getAttribute('data-gym-id') || '';

  if (!GYM_ID) {
    console.error('[Gym OS] data-gym-id attribute is required');
    return;
  }

  // ─── State ──────────────────────────────────────────
  let gymInfo = null;
  let panelOpen = false;
  let currentTab = 'trial';

  // ─── API Helper ─────────────────────────────────────
  async function apiCall(action, data = {}) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, gym_id: GYM_ID, ...data })
      });
      return await res.json();
    } catch (err) {
      console.error('[Gym OS API]', err);
      return { success: false, error: 'Connection error' };
    }
  }

  // ─── Inject Styles ──────────────────────────────────
  function injectStyles() {
    if (document.getElementById('gymos-styles')) return;
    const style = document.createElement('style');
    style.id = 'gymos-styles';
    style.textContent = `
      #gymos-widget { position: fixed; bottom: 24px; right: 24px; z-index: 99999; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
      #gymos-fab { 
        width: 56px; height: 56px; border-radius: 50%; 
        background: linear-gradient(135deg, #0066FF, #0044CC); 
        box-shadow: 0 4px 20px rgba(0, 102, 255, 0.4); 
        border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s; animation: gymos-pulse 2s infinite;
      }
      #gymos-fab:hover { transform: scale(1.1); }
      @keyframes gymos-pulse { 0%, 100% { box-shadow: 0 4px 20px rgba(0,102,255,0.4); } 50% { box-shadow: 0 4px 30px rgba(0,102,255,0.7); } }
      #gymos-fab svg { width: 26px; height: 26px; fill: white; }
      
      #gymos-panel {
        position: fixed; bottom: 90px; right: 24px; width: 380px; max-height: 560px;
        background: #0A0E27; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.3);
        overflow: hidden; z-index: 99998; transform: translateY(20px); opacity: 0;
        transition: all 0.3s ease; pointer-events: none;
        border: 1px solid rgba(0, 102, 255, 0.2);
      }
      #gymos-panel.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
      
      #gymos-panel-header {
        background: linear-gradient(135deg, #0066FF, #0044CC); padding: 16px 20px; color: white;
      }
      #gymos-panel-header h3 { margin: 0; font-size: 18px; font-weight: 700; }
      #gymos-panel-header p { margin: 2px 0 0; font-size: 12px; opacity: 0.8; }
      
      #gymos-tabs { display: flex; background: #0D1230; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .gymos-tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; color: #8892B0; font-size: 13px; font-weight: 600; transition: all 0.2s; border-bottom: 2px solid transparent; }
      .gymos-tab.active { color: #0066FF; border-bottom-color: #0066FF; }
      
      #gymos-body { padding: 20px; max-height: 400px; overflow-y: auto; color: #E6F0FF; }
      #gymos-body::-webkit-scrollbar { width: 6px; }
      #gymos-body::-webkit-scrollbar-thumb { background: rgba(0,102,255,0.3); border-radius: 3px; }
      
      .gymos-field { margin-bottom: 14px; }
      .gymos-field label { display: block; font-size: 12px; color: #8892B0; margin-bottom: 5px; font-weight: 500; }
      .gymos-field input, .gymos-field select, .gymos-field textarea {
        width: 100%; padding: 10px 12px; background: #11163A; border: 1px solid rgba(0,102,255,0.15);
        border-radius: 8px; color: #E6F0FF; font-size: 14px; font-family: inherit; box-sizing: border-box;
        transition: border-color 0.2s;
      }
      .gymos-field input:focus, .gymos-field textarea:focus { outline: none; border-color: #0066FF; }
      
      .gymos-btn {
        width: 100%; padding: 12px; background: linear-gradient(135deg, #0066FF, #0044CC);
        color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
        cursor: pointer; transition: opacity 0.2s; font-family: inherit;
      }
      .gymos-btn:hover { opacity: 0.9; }
      .gymos-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      
      .gymos-success { text-align: center; padding: 20px; color: #4ADE80; }
      .gymos-success svg { width: 48px; height: 48px; margin: 0 auto 12px; }
      
      .gymos-error { color: #EF4444; font-size: 13px; text-align: center; padding: 8px; }
      
      .gymos-class-item {
        padding: 12px; background: #11163A; border-radius: 8px; margin-bottom: 8px;
        display: flex; justify-content: space-between; align-items: center;
      }
      .gymos-class-name { font-weight: 600; font-size: 14px; }
      .gymos-class-meta { font-size: 12px; color: #8892B0; }
      .gymos-class-badge { background: rgba(0,102,255,0.2); color: #0066FF; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
      
      .gymos-qr-input {
        font-family: monospace; font-size: 13px; text-align: center;
      }
      
      .gymos-consent {
        display: flex; align-items: flex-start; gap: 8px; margin-bottom: 14px; font-size: 11px; color: #8892B0;
      }
      .gymos-consent input { width: auto; margin-top: 2px; }
      
      @media (max-width: 420px) {
        #gymos-panel { width: calc(100vw - 32px); right: 16px; }
        #gymos-widget { right: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Create FAB Button ──────────────────────────────
  function createWidget() {
    injectStyles();

    // FAB
    const fab = document.createElement('div');
    fab.id = 'gymos-widget';
    fab.innerHTML = `
      <button id="gymos-fab" aria-label="Gym OS">
        <svg viewBox="0 0 24 24"><path d="M20.57 14.24L12 4l-8.57 10.24 1.43 1.76L12 7l7.14 8.99 1.43-1.75zM12 14a3 3 0 100 6 3 3 0 000-6z"/></svg>
      </button>
    `;
    document.body.appendChild(fab);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'gymos-panel';
    panel.innerHTML = `
      <div id="gymos-panel-header">
        <h3 id="gymos-gym-name">Gym OS</h3>
        <p>Powered by Beyond Pixels</p>
      </div>
      <div id="gymos-tabs">
        <div class="gymos-tab active" data-tab="trial">Trial Pass</div>
        <div class="gymos-tab" data-tab="lead">Contact</div>
        <div class="gymos-tab" data-tab="checkin">Check-In</div>
        <div class="gymos-tab" data-tab="classes">Classes</div>
      </div>
      <div id="gymos-body"></div>
    `;
    document.body.appendChild(panel);

    // Events
    document.getElementById('gymos-fab').addEventListener('click', togglePanel);
    document.querySelectorAll('.gymos-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Load gym info
    loadGymInfo();
  }

  // ─── Toggle Panel ──────────────────────────────────
  function togglePanel() {
    panelOpen = !panelOpen;
    const panel = document.getElementById('gymos-panel');
    if (panelOpen) {
      panel.classList.add('open');
      renderTab();
    } else {
      panel.classList.remove('open');
    }
  }

  // ─── Switch Tab ─────────────────────────────────────
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.gymos-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    renderTab();
  }

  // ─── Render Tab Content ──────────────────────────────
  function renderTab() {
    const body = document.getElementById('gymos-body');
    
    if (currentTab === 'trial') {
      body.innerHTML = `
        <div class="gymos-field">
          <label>Your Name *</label>
          <input type="text" id="gymos-trial-name" placeholder="Enter your name" />
        </div>
        <div class="gymos-field">
          <label>Phone Number *</label>
          <input type="tel" id="gymos-trial-phone" placeholder="+91 XXXXX XXXXX" />
        </div>
        <div class="gymos-field">
          <label>Email</label>
          <input type="email" id="gymos-trial-email" placeholder="you@email.com" />
        </div>
        <div class="gymos-field">
          <label>Fitness Goal</label>
          <select id="gymos-trial-goal">
            <option value="">Select goal</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="General Fitness">General Fitness</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Cardio">Cardio</option>
          </select>
        </div>
        <div class="gymos-field">
          <label>Preferred Visit Time</label>
          <select id="gymos-trial-period">
            <option value="morning">Morning (6 AM - 10 AM)</option>
            <option value="afternoon">Afternoon (10 AM - 4 PM)</option>
            <option value="evening">Evening (4 PM - 10 PM)</option>
          </select>
        </div>
        <div class="gymos-consent">
          <input type="checkbox" id="gymos-trial-consent" checked />
          <span>I consent to be contacted about my trial pass. Valid for 48 hours.</span>
        </div>
        <button class="gymos-btn" id="gymos-trial-submit">Get Free 48-Hour Trial</button>
        <div id="gymos-trial-result"></div>
      `;
      
      document.getElementById('gymos-trial-submit').addEventListener('click', submitTrial);
    
    } else if (currentTab === 'lead') {
      body.innerHTML = `
        <div class="gymos-field">
          <label>Your Name *</label>
          <input type="text" id="gymos-lead-name" placeholder="Enter your name" />
        </div>
        <div class="gymos-field">
          <label>Phone Number *</label>
          <input type="tel" id="gymos-lead-phone" placeholder="+91 XXXXX XXXXX" />
        </div>
        <div class="gymos-field">
          <label>Email</label>
          <input type="email" id="gymos-lead-email" placeholder="you@email.com" />
        </div>
        <div class="gymos-field">
          <label>Message</label>
          <textarea id="gymos-lead-message" rows="3" placeholder="Tell us what you're looking for..."></textarea>
        </div>
        <div class="gymos-consent">
          <input type="checkbox" id="gymos-lead-consent" checked />
          <span>I agree to be contacted by the gym team.</span>
        </div>
        <button class="gymos-btn" id="gymos-lead-submit">Send Enquiry</button>
        <div id="gymos-lead-result"></div>
      `;
      
      document.getElementById('gymos-lead-submit').addEventListener('click', submitLead);
    
    } else if (currentTab === 'checkin') {
      body.innerHTML = `
        <div style="text-align:center; padding:10px 0 20px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin:0 auto;"><rect x="3" y="3" width="7" height="7" stroke="#0066FF" stroke-width="2" rx="1"/><rect x="14" y="3" width="7" height="7" stroke="#0066FF" stroke-width="2" rx="1"/><rect x="3" y="14" width="7" height="7" stroke="#0066FF" stroke-width="2" rx="1"/><rect x="14" y="14" width="7" height="7" stroke="#0066FF" stroke-width="2" rx="1"/></svg>
          <p style="color:#8892B0; font-size:13px; margin-top:12px;">Enter your QR token or scan at the front desk</p>
        </div>
        <div class="gymos-field">
          <label>QR Token</label>
          <input type="text" class="gymos-qr-input" id="gymos-qr-token" placeholder="QR_xxx_xxx_xxx" />
        </div>
        <button class="gymos-btn" id="gymos-checkin-submit">Check In / Out</button>
        <div id="gymos-checkin-result"></div>
      `;
      
      document.getElementById('gymos-checkin-submit').addEventListener('click', submitCheckIn);
    
    } else if (currentTab === 'classes') {
      body.innerHTML = '<div style="text-align:center; color:#8892B0; padding:20px;">Loading classes...</div>';
      loadClasses();
    }
  }

  // ─── Load Gym Info ──────────────────────────────────
  async function loadGymInfo() {
    const res = await apiCall('getGymInfo');
    if (res.success) {
      gymInfo = res.gym;
      document.getElementById('gymos-gym-name').textContent = gymInfo.gym_name || 'Gym OS';
    }
  }

  // ─── Submit Trial ────────────────────────────────────
  async function submitTrial() {
    const btn = document.getElementById('gymos-trial-submit');
    const result = document.getElementById('gymos-trial-result');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    result.innerHTML = '';

    const data = {
      name: document.getElementById('gymos-trial-name').value.trim(),
      phone: document.getElementById('gymos-trial-phone').value.trim(),
      email: document.getElementById('gymos-trial-email').value.trim(),
      fitness_goal: document.getElementById('gymos-trial-goal').value,
      preferred_visit_period: document.getElementById('gymos-trial-period').value,
      consent: document.getElementById('gymos-trial-consent').checked
    };

    if (!data.name || !data.phone) {
      result.innerHTML = '<div class="gymos-error">Name and phone are required</div>';
      btn.disabled = false;
      btn.textContent = 'Get Free 48-Hour Trial';
      return;
    }

    const res = await apiCall('createTrial', data);
    if (res.success) {
      result.innerHTML = `
        <div class="gymos-success">
          <svg viewBox="0 0 24 24" fill="#4ADE80"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          <p style="font-size:15px; font-weight:600;">Trial Pass Activated!</p>
          <p style="color:#8892B0; font-size:13px; margin-top:8px;">Valid for 48 hours. We'll contact you shortly.</p>
        </div>
      `;
      document.getElementById('gymos-body').querySelectorAll('input, select, textarea, button').forEach(el => el.style.display = 'none');
      result.querySelector('.gymos-success').style.display = 'block';
    } else {
      result.innerHTML = `<div class="gymos-error">${res.error || 'Something went wrong'}</div>`;
      btn.disabled = false;
      btn.textContent = 'Get Free 48-Hour Trial';
    }
  }

  // ─── Submit Lead ────────────────────────────────────
  async function submitLead() {
    const btn = document.getElementById('gymos-lead-submit');
    const result = document.getElementById('gymos-lead-result');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    result.innerHTML = '';

    const data = {
      name: document.getElementById('gymos-lead-name').value.trim(),
      phone: document.getElementById('gymos-lead-phone').value.trim(),
      email: document.getElementById('gymos-lead-email').value.trim(),
      message: document.getElementById('gymos-lead-message').value.trim(),
      consent: document.getElementById('gymos-lead-consent').checked
    };

    if (!data.name || !data.phone) {
      result.innerHTML = '<div class="gymos-error">Name and phone are required</div>';
      btn.disabled = false;
      btn.textContent = 'Send Enquiry';
      return;
    }

    const res = await apiCall('captureLead', data);
    if (res.success) {
      result.innerHTML = `
        <div class="gymos-success">
          <svg viewBox="0 0 24 24" fill="#4ADE80"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          <p style="font-size:15px; font-weight:600;">Enquiry Sent!</p>
          <p style="color:#8892B0; font-size:13px; margin-top:8px;">Our team will contact you within 24 hours.</p>
        </div>
      `;
      document.getElementById('gymos-body').querySelectorAll('input, textarea, button').forEach(el => el.style.display = 'none');
    } else {
      result.innerHTML = `<div class="gymos-error">${res.error || 'Something went wrong'}</div>`;
      btn.disabled = false;
      btn.textContent = 'Send Enquiry';
    }
  }

  // ─── Submit Check-In ────────────────────────────────
  async function submitCheckIn() {
    const btn = document.getElementById('gymos-checkin-submit');
    const result = document.getElementById('gymos-checkin-result');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    result.innerHTML = '';

    const qrToken = document.getElementById('gymos-qr-token').value.trim();
    if (!qrToken) {
      result.innerHTML = '<div class="gymos-error">Please enter your QR token</div>';
      btn.disabled = false;
      btn.textContent = 'Check In / Out';
      return;
    }

    const res = await apiCall('checkIn', { qr_token: qrToken });
    if (res.success) {
      const color = res.action === 'check_in' ? '#4ADE80' : '#0066FF';
      result.innerHTML = `
        <div class="gymos-success">
          <svg viewBox="0 0 24 24" fill="${color}"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          <p style="font-size:15px; font-weight:600; color:${color};">${res.message}</p>
          ${res.duration_minutes ? `<p style="color:#8892B0; font-size:13px;">Duration: ${res.duration_minutes} min</p>` : ''}
        </div>
      `;
    } else {
      result.innerHTML = `<div class="gymos-error">${res.error || 'Invalid QR code'}</div>`;
      btn.disabled = false;
      btn.textContent = 'Check In / Out';
    }
  }

  // ─── Load Classes ────────────────────────────────────
  async function loadClasses() {
    const res = await apiCall('getClasses');
    const body = document.getElementById('gymos-body');
    if (res.success && res.classes && res.classes.length > 0) {
      body.innerHTML = res.classes.map(c => `
        <div class="gymos-class-item">
          <div>
            <div class="gymos-class-name">${c.name}</div>
            <div class="gymos-class-meta">${c.day} at ${c.time} • ${c.trainer_name || 'TBA'}</div>
          </div>
          <div class="gymos-class-badge">${c.spots_left} spots</div>
        </div>
      `).join('');
    } else {
      body.innerHTML = '<div style="text-align:center; color:#8892B0; padding:20px;">No classes scheduled yet.</div>';
    }
  }

  // ─── Init ───────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
