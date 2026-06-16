// Состояние чат-бота
class ChatBot {
    constructor() {
        this.state = 'idle'; // idle, waiting_name, waiting_numbers, waiting_operation
        this.userName = '';
        this.numbers = [];
        this.operation = '';
        this.isProcessing = false;
        this.messagesContainer = document.getElementById('chatMessages');
        this.inputField = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        
        this.init();
    }

    init() {
        this.inputField.addEventListener('input', () => this.handleInputChange());
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        // Приветственное сообщение
        setTimeout(() => {
            this.addMessage('bot', '👋 Привет! Я Чат-бот калькулятор. Напиши /start для начала общения.');
        }, 500);
    }

    handleInputChange() {
        const text = this.inputField.value.trim();
        if (text.length > 0) {
            this.sendButton.classList.add('active');
            this.sendButton.disabled = false;
        } else {
            this.sendButton.classList.remove('active');
            this.sendButton.disabled = true;
        }

        // Автоматическое изменение высоты текстового поля
        this.inputField.style.height = 'auto';
        this.inputField.style.height = Math.min(this.inputField.scrollHeight, 80) + 'px';
    }

    async handleSend() {
        const text = this.inputField.value.trim();
        if (!text || this.isProcessing) return;

        // Добавляем сообщение пользователя
        this.addMessage('user', text);
        this.inputField.value = '';
        this.inputField.style.height = 'auto';
        this.sendButton.classList.remove('active');
        this.sendButton.disabled = true;

        // Показываем индикатор печати
        this.showTypingIndicator();

        // Обрабатываем команду
        await this.processCommand(text);

        // Убираем индикатор печати
        this.hideTypingIndicator();
    }

    async processCommand(text) {
        this.isProcessing = true;

        // Имитация задержки для реализма
        await this.delay(500 + Math.random() * 500);

        try {
            if (this.state === 'idle') {
                if (text === '/start') {
                    this.state = 'waiting_name';
                    this.addMessage('bot', 'Привет, меня зовут Чат-бот, а как зовут тебя?');
                } else {
                    this.addMessage('bot', 'Введите команду /start, для начала общения');
                }
            } 
            else if (this.state === 'waiting_name') {
                if (text.startsWith('/')) {
                    this.addMessage('bot', 'Пожалуйста, введите ваше имя, а не команду');
                } else {
                    this.userName = text;
                    this.state = 'waiting_numbers';
                    this.addMessage('bot', `Привет ${this.userName}, приятно познакомится. Я умею считать, введи числа которые надо посчитать (через запятую)`);
                }
            }
            else if (this.state === 'waiting_numbers') {
                if (text.startsWith('/')) {
                    this.addMessage('bot', 'Пожалуйста, введите числа, а не команду');
                } else {
                    const numbers = text.split(',').map(n => parseFloat(n.trim()));
                    if (numbers.some(isNaN)) {
                        this.addMessage('bot', 'Пожалуйста, введите корректные числа через запятую');
                    } else {
                        this.numbers = numbers;
                        this.state = 'waiting_operation';
                        this.addMessage('bot', `Отлично! Теперь выберите операцию: +, -, *, /`);
                    }
                }
            }
            else if (this.state === 'waiting_operation') {
                if (text === '/stop') {
                    this.addMessage('bot', 'Всего доброго, если хочешь поговорить пиши /start');
                    this.resetState();
                } else if (['+', '-', '*', '/'].includes(text)) {
                    this.operation = text;
                    const result = this.calculate();
                    this.addMessage('bot', `Результат: ${this.numbers.join(' ' + this.operation + ' ')} = ${result}`);
                    this.resetState();
                    this.addMessage('bot', 'Введите /start для нового вычисления или /stop для завершения');
                } else {
                    this.addMessage('bot', 'Пожалуйста, введите одну из операций: +, -, *, /');
                }
            }
            else {
                if (text === '/start') {
                    this.resetState();
                    this.state = 'waiting_name';
                    this.addMessage('bot', 'Привет, меня зовут Чат-бот, а как зовут тебя?');
                } else if (text === '/stop') {
                    this.addMessage('bot', 'Всего доброго, если хочешь поговорить пиши /start');
                    this.resetState();
                } else {
                    this.addMessage('bot', 'Я не понимаю, введите другую команду!');
                }
            }
        } catch (error) {
            this.addMessage('bot', 'Произошла ошибка. Попробуйте снова.');
            console.error('Error:', error);
        }

        this.isProcessing = false;
        this.scrollToBottom();
    }

    calculate() {
        let result = this.numbers[0];
        for (let i = 1; i < this.numbers.length; i++) {
            switch (this.operation) {
                case '+': result += this.numbers[i]; break;
                case '-': result -= this.numbers[i]; break;
                case '*': result *= this.numbers[i]; break;
                case '/': 
                    if (this.numbers[i] === 0) {
                        throw new Error('Деление на ноль');
                    }
                    result /= this.numbers[i]; 
                    break;
                default: break;
            }
        }
        return Math.round(result * 100) / 100;
    }

    resetState() {
        this.state = 'idle';
        this.userName = '';
        this.numbers = [];
        this.operation = '';
    }

    addMessage(type, content) {
        // Создаем контейнер сообщения
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        // Аватар
        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = type === 'bot' ? 'assets/bot_avatar.png' : 'assets/user_avatar.png';
        avatar.alt = type === 'bot' ? 'Бот' : 'Пользователь';

        // Контент сообщения
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Обработка текста (поддержка переносов строк)
        contentDiv.textContent = content;

        // Собираем сообщение
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.hideTypingIndicator();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = 'assets/bot_avatar.png';
        avatar.alt = 'Бот печатает';
        
        const dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(dots);
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 50);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Инициализация чат-бота при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const bot = new ChatBot();
});