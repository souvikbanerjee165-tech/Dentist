(function () {
  // Prevent duplicate injection
  if (window.__DENTAL_DESK_WIDGET_INITIALIZED__) return;
  window.__DENTAL_DESK_WIDGET_INITIALIZED__ = true;

  // 1. Parse configuration from script tag
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var config = {
    clinicName: currentScript?.getAttribute('data-clinic') || 'St. James Dental Practice',
    apiUrl: currentScript?.getAttribute('data-api') || window.location.origin,
    primaryColor: currentScript?.getAttribute('data-color') || '#0284c7', // Sky-600
    doctorName: currentScript?.getAttribute('data-doctor') || 'Dr. Sarah Jensen',
    avatarUrl: currentScript?.getAttribute('data-avatar') || '/images/dentist_doctor.jpg',
  };

  // 2. Inject Widget Styles
  var style = document.createElement('style');
  style.id = 'dental-desk-widget-styles';
  style.innerHTML = `
    #dd-widget-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999990;
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, ${config.primaryColor}, #0369a1);
      color: #ffffff;
      padding: 10px 18px 10px 12px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.4), 0 8px 10px -6px rgba(2, 132, 199, 0.2);
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    #dd-widget-launcher:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 16px 30px -5px rgba(2, 132, 199, 0.5);
    }
    #dd-widget-launcher img {
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      object-fit: cover;
      border: 2px solid #ffffff;
    }
    #dd-widget-launcher .dd-pulse-dot {
      position: absolute;
      top: 8px;
      left: 36px;
      width: 10px;
      height: 10px;
      background-color: #10b981;
      border: 2px solid #ffffff;
      border-radius: 9999px;
    }
    #dd-widget-window {
      position: fixed;
      bottom: 84px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 110px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      z-index: 999991;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      animation: ddSlideIn 0.3s ease-out forwards;
    }
    @keyframes ddSlideIn {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .dd-header {
      background: linear-gradient(135deg, ${config.primaryColor}, #075985);
      color: #ffffff;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .dd-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .dd-header img {
      width: 42px;
      height: 42px;
      border-radius: 9999px;
      object-fit: cover;
      border: 2px solid #ffffff;
    }
    .dd-header-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.2;
    }
    .dd-header-status {
      font-size: 11px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .dd-status-green {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 9999px;
    }
    .dd-close-btn {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: #ffffff;
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .dd-close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .dd-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .dd-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.45;
      word-break: break-word;
    }
    .dd-msg-ai {
      background: #ffffff;
      color: #1e293b;
      align-self: flex-start;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
    }
    .dd-msg-user {
      background: ${config.primaryColor};
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .dd-chips {
      padding: 8px 12px;
      background: #ffffff;
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .dd-chips::-webkit-scrollbar { display: none; }
    .dd-chip {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #334155;
      padding: 6px 10px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s;
    }
    .dd-chip:hover {
      background: #e0f2fe;
      color: #0369a1;
      border-color: #bae6fd;
    }
    .dd-input-bar {
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    }
    .dd-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 9999px;
      padding: 9px 16px;
      font-size: 13.5px;
      outline: none;
    }
    .dd-input:focus {
      border-color: ${config.primaryColor};
      box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
    }
    .dd-send-btn {
      background: ${config.primaryColor};
      border: none;
      color: #ffffff;
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .dd-send-btn:hover {
      opacity: 0.9;
    }
    .dd-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      align-self: flex-start;
      width: fit-content;
    }
    .dd-dot {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: ddBounce 1.2s infinite ease-in-out;
    }
    .dd-dot:nth-child(2) { animation-delay: 0.2s; }
    .dd-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ddBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(style);

  // 3. Inject HTML Structure
  var widgetContainer = document.createElement('div');
  widgetContainer.id = 'dental-desk-widget-root';
  widgetContainer.innerHTML = `
    <!-- Launcher Pill -->
    <div id="dd-widget-launcher">
      <img src="${config.avatarUrl}" alt="${config.doctorName}" onerror="this.src='https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80'" />
      <span class="dd-pulse-dot"></span>
      <div>
        <div>Chat with Reception</div>
        <div style="font-size: 10.5px; opacity: 0.9; font-weight: normal;">Online 24/7 • Instant Booking</div>
      </div>
    </div>

    <!-- Chat Window -->
    <div id="dd-widget-window">
      <!-- Header -->
      <div class="dd-header">
        <div class="dd-header-left">
          <img src="${config.avatarUrl}" alt="${config.doctorName}" onerror="this.src='https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80'" />
          <div>
            <div class="dd-header-title">${config.clinicName}</div>
            <div class="dd-header-status">
              <span class="dd-status-green"></span>
              <span>${config.doctorName} (AI Front Desk)</span>
            </div>
          </div>
        </div>
        <button class="dd-close-btn" id="dd-widget-close">&times;</button>
      </div>

      <!-- Messages Area -->
      <div class="dd-messages" id="dd-widget-messages">
        <div class="dd-msg dd-msg-ai">
          Hello! Welcome to <strong>${config.clinicName}</strong>. I'm ${config.doctorName}'s AI Front Desk assistant.
          <br/><br/>
          Are you experiencing any dental pain, or would you like to inquire about teeth whitening, veneers, or booking an appointment?
        </div>
      </div>

      <!-- Quick Triage Chips -->
      <div class="dd-chips" id="dd-widget-chips">
        <button class="dd-chip" data-text="🚨 I have severe tooth pain and need an urgent emergency slot">🚨 Urgent Tooth Pain</button>
        <button class="dd-chip" data-text="💎 How much is Laser Teeth Whitening?">💎 Whitening (£395)</button>
        <button class="dd-chip" data-text="🦷 Tell me about Dental Implants and finance options">🦷 Implants (£2,800)</button>
        <button class="dd-chip" data-text="📅 I'd like to book a routine examination and 3D scan">📅 Book Exam (£95)</button>
      </div>

      <!-- Input Bar -->
      <div class="dd-input-bar">
        <input type="text" class="dd-input" id="dd-widget-input" placeholder="Type your message or symptom..." />
        <button class="dd-send-btn" id="dd-widget-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 4. Widget Logic & Event Handlers
  var launcher = document.getElementById('dd-widget-launcher');
  var chatWindow = document.getElementById('dd-widget-window');
  var closeBtn = document.getElementById('dd-widget-close');
  var messagesBox = document.getElementById('dd-widget-messages');
  var inputField = document.getElementById('dd-widget-input');
  var sendBtn = document.getElementById('dd-widget-send');
  var chipsContainer = document.getElementById('dd-widget-chips');

  var isOpen = false;
  var sessionId = 'web_' + Math.random().toString(36).substring(2, 10);
  var history = [];

  function toggleWidget() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    launcher.style.display = isOpen ? 'none' : 'flex';
    if (isOpen) {
      inputField.focus();
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  launcher.addEventListener('click', toggleWidget);
  closeBtn.addEventListener('click', toggleWidget);

  function appendMessage(text, sender) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'dd-msg dd-msg-' + sender;
    msgDiv.innerHTML = text.replace(/\n/g, '<br/>');
    messagesBox.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    var typingDiv = document.createElement('div');
    typingDiv.id = 'dd-typing-indicator';
    typingDiv.className = 'dd-typing';
    typingDiv.innerHTML = '<span class="dd-dot"></span><span class="dd-dot"></span><span class="dd-dot"></span>';
    messagesBox.appendChild(typingDiv);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    var indicator = document.getElementById('dd-typing-indicator');
    if (indicator) indicator.remove();
  }

  async function handleSendMessage(customText) {
    var text = (customText || inputField.value || '').trim();
    if (!text) return;

    appendMessage(text, 'user');
    if (!customText) inputField.value = '';
    showTypingIndicator();

    try {
      var res = await fetch(config.apiUrl + '/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          businessName: config.clinicName,
          businessIndustry: 'Dental Clinic',
        }),
      });

      var data = await res.json();
      removeTypingIndicator();

      if (data && data.reply) {
        appendMessage(data.reply, 'ai');
      } else if (data && data.message) {
        appendMessage(data.message, 'ai');
      } else {
        appendMessage("Thank you for your message. Dr. Jensen's desk is reviewing your inquiry. Please feel free to provide your phone number so we can confirm your slot!", 'ai');
      }
    } catch (err) {
      removeTypingIndicator();
      appendMessage("Thank you for reaching out! We have priority slots open with Dr. Jensen. Please call us directly or leave your number here.", 'ai');
    }
  }

  sendBtn.addEventListener('click', function() { handleSendMessage(); });
  inputField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleSendMessage();
  });

  chipsContainer.addEventListener('click', function (e) {
    var btn = e.target.closest('.dd-chip');
    if (btn) {
      var promptText = btn.getAttribute('data-text');
      handleSendMessage(promptText);
    }
  });
})();
