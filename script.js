document.addEventListener('DOMContentLoaded', function() {
  // Аутентифікація та навігація
  const authModal = document.getElementById('auth-modal');
  const mainContent = document.getElementById('main-content');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const tabNavButtons = document.querySelectorAll('.tab-nav-btn');
  const sections = document.querySelectorAll('.section');
  const commentsToggleBtn = document.getElementById('comments-toggle');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  const timelineBtn = document.getElementById('timeline-btn');

  // Ініціалізація користувачів, якщо їх нема в localStorage
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
      { username: 'admin', password: 'admin123', email: 'admin@example.com' }
    ]));
  }

  // Перевірка, чи користувач увійшов
  if (localStorage.getItem('loggedInUser')) {
    authModal.style.display = 'none';
    mainContent.style.display = 'block';
    showTab('home');
    animatePage();
  } else {
    authModal.style.display = 'flex';
    mainContent.style.display = 'none';
  }

  // Перемикання на форму реєстрації
  showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
  });

  // Перемикання на форму входу
  showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
  });

  // Головна навігація (вкладки)
  tabNavButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      showTab(tabName);
    });
  });

  // Перемикання на розділ сервісів (коментарів)
  commentsToggleBtn.addEventListener('click', function() {
    showTab('services');
  });

  // Кнопка "Таймлайн" в розділі "Інформація"
  if (timelineBtn) {
    timelineBtn.addEventListener('click', function() {
      showTab('timeline');
    });
  }

  function showTab(tabName) {
    sections.forEach(section => {
      section.classList.remove('active-tab');
      if (section.id === tabName) {
        section.classList.add('active-tab');
      }
    });
    
    tabNavButtons.forEach(button => {
      button.classList.remove('active');
      if (button.getAttribute('data-tab') === tabName) {
        button.classList.add('active');
      }
    });
  }

  // Функціонал входу
  loginBtn.addEventListener('click', function() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
      showError('Будь ласка, заповніть всі поля!');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      authModal.style.display = 'none';
      mainContent.style.display = 'block';
      showTab('home');
      animatePage();
      showSuccess('Вхід успішний!');
    } else {
      showError('Невірне ім\'я користувача або пароль!');
    }
  });

  // Функціонал реєстрації
  registerBtn.addEventListener('click', function() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value;

    if (!username || !password || !email) {
      showError('Будь ласка, заповніть всі поля!');
      return;
    }
    
    let users = JSON.parse(localStorage.getItem('users'));
    
    // Перевірка, чи існує вже користувач з таким логіном
    if (users.some(u => u.username === username)) {
      showError('Користувач з таким іменем вже існує!');
      return;
    }
    
    // Перевірка валідності email
    if (!validateEmail(email)) {
      showError('Будь ласка, введіть дійсний email!');
      return;
    }
    
    // Додавання нового користувача
    const newUser = { username, password, email };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Автоматичний вхід нового користувача
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    authModal.style.display = 'none';
    mainContent.style.display = 'block';
    showTab('home');
    animatePage();
    showSuccess('Реєстрація успішна!');
  });

  // Функціонал виходу
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('loggedInUser');
    showSuccess('Ви вийшли з системи!');
    setTimeout(() => location.reload(), 1000);
  });

  // Перемикання видимості додаткового тексту у інформаційних блоках
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Якщо це кнопка таймлайну – пропускаємо, оскільки обробка відбувається окремо
      if (this.id === 'timeline-btn') return;
      
      const hiddenText = this.nextElementSibling;
      hiddenText.style.display = hiddenText.style.display === 'block' ? 'none' : 'block';
      this.textContent = hiddenText.style.display === 'block' ? 'Згорнути' : 'Детальніше';
      
      if (hiddenText.style.display === 'block') {
        hiddenText.classList.add('animate__fadeIn');
      }
    });
  });

  // Система коментарів
  const commentInput = document.getElementById('comment-input');
  const commentsDisplay = document.getElementById('comments-display');
  const submitCommentBtn = document.getElementById('submit-comment');

  loadComments();

  submitCommentBtn.addEventListener('click', function() {
    const comment = commentInput.value.trim();
    if (comment) {
      saveComment(comment);
      commentInput.value = '';
      loadComments();
      showSuccess('Коментар додано!');
    } else {
      showError('Будь ласка, напишіть коментар!');
    }
  });

  function saveComment(comment) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({
      id: Date.now(), // унікальний ID
      text: comment,
      author: user.username,
      date: new Date().toLocaleString(),
      email: user.email
    });
    localStorage.setItem('comments', JSON.stringify(comments));
  }

  function loadComments() {
    const user = JSON.parse(localStorage.getItem('loggedInUser')) || {};
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    
    commentsDisplay.innerHTML = comments.map(comment => {
      const isCurrentUser = comment.email === user.email;
      return `
        <div class="comment animate__animated animate__fadeIn">
          <strong>${comment.author}</strong> 
          <small>${comment.date}</small>
          <p>${comment.text}</p>
          ${isCurrentUser ? `<button class="delete-comment-btn" data-id="${comment.id}">Видалити</button>` : ''}
        </div>`;
    }).join('');
    
    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        deleteComment(this.getAttribute('data-id'));
      });
    });
  }

  function deleteComment(commentId) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments = comments.filter(comment => comment.id != commentId);
    localStorage.setItem('comments', JSON.stringify(comments));
    loadComments();
    showSuccess('Коментар видалено!');
  }

  // Ефект при наведенні на image-placeholder
  document.querySelectorAll('.image-placeholder').forEach(placeholder => {
    const imgName = placeholder.getAttribute('data-img');
    placeholder.style.backgroundImage = `url(https://source.unsplash.com/random/300x200/?${imgName})`;
    
    placeholder.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05) rotate(1deg)';
    });
    placeholder.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotate(0)';
    });
  });

  // Функціонал Таймлайну
  const timelineButtons = document.querySelectorAll('.timeline-btn');
  const timelineContent = document.getElementById('timeline-content');

  timelineButtons.forEach(button => {
    button.addEventListener('click', function() {
      const year = this.getAttribute('data-year');
      timelineContent.style.display = 'block';
      timelineContent.innerHTML = `<h2 class="animate__animated animate__zoomIn">${year}</h2><p class="animate__animated animate__fadeIn">Тут буде твій текст з анімацією!</p>`;
    });
  });

  // Додаткові допоміжні функції
  function animatePage() {
    document.querySelectorAll('.section').forEach((section, index) => {
      setTimeout(() => {
        section.style.opacity = '0';
        section.classList.add('animate__fadeIn');
        section.style.opacity = '1';
      }, index * 200);
    });
  }

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message animate__animated animate__shakeX';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
      errorDiv.classList.add('animate__fadeOut');
      setTimeout(() => errorDiv.remove(), 500);
    }, 3000);
  }

  function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message animate__animated animate__bounceIn';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => {
      successDiv.classList.add('animate__fadeOut');
      setTimeout(() => successDiv.remove(), 500);
    }, 3000);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
