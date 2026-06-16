// Единственный экземпляр чат-бота
class ChatBot {
    constructor() {
        this.state = 'idle';
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
        }, 300);
    }

    handleInputChange() {
        const text = this.inputField.value;
        if (text.trim().length > 0) {
            this.sendButton.classList.add('active');
            this.sendButton.disabled = false;
        } else {
            this.sendButton.classList.remove('active');
            this.sendButton.disabled = true;
        }

        this.inputField.style.height = 'auto';
        this.inputField.style.height = Math.min(this.inputField.scrollHeight, 80) + 'px';
    }

    async handleSend() {
        const text = this.inputField.value.trim();
        if (!text || this.isProcessing) return;

        this.addMessage('user', text);
        this.inputField.value = '';
        this.inputField.style.height = 'auto';
        this.sendButton.classList.remove('active');
        this.sendButton.disabled = true;

        this.showTypingIndicator();
        await this.processCommand(text);
        this.hideTypingIndicator();
    }

    async processCommand(text) {
        this.isProcessing = true;
        await this.delay(500 + Math.random() * 500);

        try {
            // Обработка команд /start и /stop в первую очередь
            if (text === '/start') {
                this.resetState();
                this.state = 'waiting_name';
                this.addMessage('bot', 'Привет, меня зовут Чат-бот, а как зовут тебя?');
                this.isProcessing = false;
                this.scrollToBottom();
                return;
            }

            if (text === '/stop') {
                this.addMessage('bot', 'Всего доброго, если хочешь поговорить пиши /start');
                this.resetState();
                this.isProcessing = false;
                this.scrollToBottom();
                return;
            }

            // Основная логика по состояниям
            if (this.state === 'idle') {
                this.addMessage('bot', 'Введите команду /start, для начала общения');
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
                    } else if (numbers.length < 2) {
                        this.addMessage('bot', 'Пожалуйста, введите хотя бы два числа через запятую');
                    } else {
                        this.numbers = numbers;
                        this.state = 'waiting_operation';
                        this.addMessage('bot', `Отлично! Теперь выберите операцию: +, -, *, /`);
                    }
                }
            }
            else if (this.state === 'waiting_operation') {
                if (['+', '-', '*', '/'].includes(text)) {
                    this.operation = text;
                    try {
                        const result = this.calculate();
                        const expression = this.numbers.join(` ${this.operation} `);
                        this.addMessage('bot', `Результат: ${expression} = ${result}`);
                        this.addMessage('bot', `Могу еще что-то посчитать. Введи /start для нового вычисления или /stop для завершения`);
                        this.resetState();
                    } catch (error) {
                        this.addMessage('bot', `Ошибка: ${error.message}`);
                        this.state = 'waiting_numbers';
                        this.addMessage('bot', 'Введи новые числа через запятую');
                    }
                } else {
                    this.addMessage('bot', 'Пожалуйста, введите одну из операций: +, -, *, /');
                }
            }
            else {
                this.addMessage('bot', 'Я не понимаю, введите другую команду!');
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
                        throw new Error('Деление на ноль невозможно');
                    }
                    result /= this.numbers[i]; 
                    break;
                default: 
                    throw new Error('Неизвестная операция');
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
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = type === 'bot' ? 'assets/bot_avatar.png' : 'assets/user_avatar.png';
        avatar.alt = type === 'bot' ? 'Бот' : 'Пользователь';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

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

// ГАРАНТИРОВАННО ОДИН ЭКЗЕМПЛЯР
(function() {
    // Проверяем, создан ли уже экземпляр
    if (window.chatBotInstance) {
        console.warn('Чат-бот уже запущен!');
        return;
    }
    
    // Ждем полной загрузки DOM
    const initBot = () => {
        if (document.getElementById('chatMessages')) {
            window.chatBotInstance = new ChatBot();
        } else {
            setTimeout(initBot, 100);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBot);
    } else {
        initBot();
    }
})();
