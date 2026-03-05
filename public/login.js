// Translation dictionary
const i18n = {
  pt: {
    title: 'VoIP Monitoring Platform - Login',
    loginTitle: 'VoIP Monitoring Platform',
    loginSubtitle: 'Acesso ao sistema de monitoramento',
    usernameLabel: 'Usuário',
    usernamePlaceholder: 'Digite seu usuário',
    passwordLabel: 'Senha',
    passwordPlaceholder: 'Digite sua senha',
    rememberMe: 'Lembrar-me',
    loginButton: 'Entrar',
    demoTitle: 'Credenciais de Demonstração',
    demoUser: 'Usuário:',
    demoPassword: 'Senha:',
    demoNote: 'Use as credenciais acima para acessar o sistema',
    loginSuccess: 'Login realizado com sucesso!',
    loginError: 'Usuário ou senha incorretos',
    loggingIn: 'Autenticando...'
  },
  en: {
    title: 'VoIP Monitoring Platform - Login',
    loginTitle: 'VoIP Monitoring Platform',
    loginSubtitle: 'Access monitoring system',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your username',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    loginButton: 'Sign In',
    demoTitle: 'Demo Credentials',
    demoUser: 'Username:',
    demoPassword: 'Password:',
    demoNote: 'Use the credentials above to access the system',
    loginSuccess: 'Login successful!',
    loginError: 'Incorrect username or password',
    loggingIn: 'Authenticating...'
  }
};

// Get current language from localStorage or default to PT
let currentLang = localStorage.getItem('lang') || 'pt';

// Apply language to page
function applyLanguage(lang) {
  const dict = i18n[lang];
  
  // Update page title
  document.title = dict.title;
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' && el.type === 'text' || el.type === 'password') {
        el.placeholder = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });
  
  // Update current language display
  document.getElementById('currentLang').textContent = lang.toUpperCase();
  
  // Update HTML lang attribute
  document.documentElement.setAttribute('data-i18n-lang', lang);
}

// Language switcher
document.querySelectorAll('[data-lang]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = e.target.getAttribute('data-lang');
    currentLang = lang;
    localStorage.setItem('lang', lang);
    applyLanguage(lang);
  });
});

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
  notification.style.zIndex = '9999';
  notification.style.minWidth = '300px';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>' + 
                       i18n[currentLang].loggingIn;
  
  try {
    // Call authentication API
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification(i18n[currentLang].loginSuccess, 'success');
      
      // Redirect to dashboard after delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      showNotification(data.error || i18n[currentLang].loginError, 'danger');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification(i18n[currentLang].loginError, 'danger');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Check if user is already logged in
async function checkExistingSession() {
  try {
    const response = await fetch('/auth/verify');
    const data = await response.json();
    
    if (data.valid) {
      // User is already logged in, redirect to dashboard
      window.location.href = '/';
      return;
    }
  } catch (error) {
    // Not logged in or API error, continue to login page
    console.log('Not authenticated');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check existing session
  checkExistingSession();
  
  // Apply current language
  applyLanguage(currentLang);
  
  // Focus on username field
  document.getElementById('username').focus();
});
