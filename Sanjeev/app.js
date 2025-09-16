// AMHP - Accessible Mental Health Platform JavaScript

class AMHP {
    constructor() {
        this.currentScreen = 'welcome-screen';
        this.currentUser = null;
        this.moodData = this.loadMoodData();
        this.chatHistory = this.loadChatHistory();
        this.settings = this.loadSettings();
        this.moodChart = null;
        
        this.mentalHealthData = {
            "cbtExercises": [
                {
                    "title": "Thought Record",
                    "description": "Identify and challenge negative thoughts",
                    "category": "CBT",
                    "duration": "10-15 minutes"
                },
                {
                    "title": "Behavioral Activation",
                    "description": "Plan enjoyable activities to improve mood",
                    "category": "CBT",
                    "duration": "20-30 minutes"
                },
                {
                    "title": "Problem Solving",
                    "description": "Break down problems into manageable steps",
                    "category": "CBT",
                    "duration": "15-20 minutes"
                }
            ],
            "meditations": [
                {
                    "title": "Body Scan Meditation",
                    "duration": "10 minutes",
                    "type": "Mindfulness",
                    "difficulty": "Beginner"
                },
                {
                    "title": "Breathing Exercise",
                    "duration": "5 minutes",
                    "type": "Anxiety Relief",
                    "difficulty": "Beginner"
                },
                {
                    "title": "Progressive Muscle Relaxation",
                    "duration": "15 minutes",
                    "type": "Stress Relief",
                    "difficulty": "Intermediate"
                }
            ],
            "journalPrompts": [
                "What am I grateful for today?",
                "What emotions am I experiencing right now?",
                "What would I tell a friend in my situation?",
                "What small step can I take today to feel better?",
                "What positive thing happened to me today?"
            ]
        };

        this.aiResponses = {
            "greeting": [
                "Hello! I'm here to listen and support you. How are you feeling today?",
                "Hi there! I'm glad you're here. What's on your mind right now?",
                "Welcome! I'm here whenever you need to talk. How can I help you today?"
            ],
            "anxiety": [
                "I understand anxiety can feel overwhelming. Let's try a breathing exercise together - breathe in for 4 counts, hold for 4, then breathe out for 4.",
                "Anxiety is a valid feeling, and you're not alone. What specific situation is making you feel anxious right now?",
                "I hear that you're feeling anxious. Would it help to talk about what's triggering these feelings?"
            ],
            "depression": [
                "I'm here with you. Depression can make everything feel harder, but you've taken a brave step by reaching out.",
                "Your feelings are valid, and it's okay to not be okay. What has been the most difficult part of your day?",
                "I want you to know that you matter, and there are people who want to help. What small thing might bring you a moment of comfort today?"
            ],
            "crisis": [
                "I'm concerned about your safety. Please know that there are people who want to help. Would you like me to connect you with a crisis counselor right now?",
                "Your life has value, and there are resources available to support you through this difficult time. Can I help you find immediate professional support?"
            ],
            "support": [
                "Thank you for sharing that with me. It takes courage to open up about difficult feelings.",
                "I'm here to listen without judgment. Your experiences and feelings are important.",
                "You're being really brave by talking about this. How else can I support you right now?"
            ]
        };

        this.crisisResources = {
            "hotlines": [
                {
                    "name": "National Suicide Prevention Lifeline",
                    "phone": "988",
                    "available": "24/7",
                    "description": "Free, confidential crisis support"
                },
                {
                    "name": "Crisis Text Line",
                    "contact": "Text HOME to 741741",
                    "available": "24/7",
                    "description": "Free crisis counseling via text"
                },
                {
                    "name": "SAMHSA National Helpline",
                    "phone": "1-800-662-4357",
                    "available": "24/7",
                    "description": "Treatment referral and information"
                }
            ]
        };

        this.moodScale = {
            "1": "Extremely Low",
            "2": "Very Low", 
            "3": "Low",
            "4": "Somewhat Low",
            "5": "Neutral",
            "6": "Somewhat Good",
            "7": "Good",
            "8": "Very Good",
            "9": "Great",
            "10": "Excellent"
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.showScreen('welcome-screen');
        this.initializeChatMessages();
        this.loadResources();
        this.loadCrisisResources();
        this.updateDailyRecommendation();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.dataset.screen) {
                e.preventDefault();
                this.showScreen(e.target.dataset.screen + '-screen');
                return;
            }
            
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const screen = e.target.dataset.screen;
                if (screen) {
                    this.showScreen(screen + '-screen');
                    this.updateActiveNavLink(e.target);
                }
                return;
            }
            if (e.target.classList.contains('back-btn')) {
                e.preventDefault();
                const screen = e.target.dataset.screen;
                if (screen) {
                    this.showScreen(screen + '-screen');
                }
                return;
            }
        });

        document.getElementById('start-anonymous').addEventListener('click', () => {
            this.startAnonymousSession();
        });

        document.getElementById('continue-guest').addEventListener('click', () => {
            this.continueAsGuest();
        });
        document.getElementById('crisis-btn').addEventListener('click', () => {
            this.showCrisisScreen();
        });
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.updateSetting('theme', e.target.value);
        });

        document.getElementById('text-size-select').addEventListener('change', (e) => {
            this.updateSetting('textSize', e.target.value);
        });

        document.getElementById('language-select').addEventListener('change', (e) => {
            this.updateSetting('language', e.target.value);
        });

        document.getElementById('voice-enabled').addEventListener('change', (e) => {
            this.updateSetting('voiceEnabled', e.target.checked);
        });
        document.querySelectorAll('.mood-face').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.quickMoodEntry(e.target.dataset.mood);
            });
        });

        const moodSlider = document.getElementById('mood-slider');
        if (moodSlider) {
            moodSlider.addEventListener('input', (e) => {
                this.updateMoodDescription(e.target.value);
            });
        }

        document.getElementById('save-mood')?.addEventListener('click', () => {
            this.saveMoodEntry();
        });
        document.getElementById('send-btn')?.addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        document.getElementById('voice-btn')?.addEventListener('click', () => {
            this.startVoiceInput();
        });

        // Chat suggestions
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('chat-input').value = e.target.textContent;
                this.sendChatMessage();
            });
        });

        // Resources tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showTab(e.target.dataset.tab);
            });
        });

        // Journal functionality
        document.getElementById('new-prompt')?.addEventListener('click', () => {
            this.showNewJournalPrompt();
        });

        document.getElementById('save-journal')?.addEventListener('click', () => {
            this.saveJournalEntry();
        });

        // Settings screen
        document.getElementById('settings-theme')?.addEventListener('change', (e) => {
            this.updateSetting('theme', e.target.value);
        });

        document.getElementById('settings-text-size')?.addEventListener('change', (e) => {
            this.updateSetting('textSize', e.target.value);
        });

        document.getElementById('settings-language')?.addEventListener('change', (e) => {
            this.updateSetting('language', e.target.value);
        });
    }

    // Screen Management - Fixed to properly handle navigation
    showScreen(screenId) {
        // Remove active class from all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Add active class to target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // Initialize screen-specific functionality
            if (screenId === 'mood-screen') {
                setTimeout(() => this.initializeMoodChart(), 100);
            } else if (screenId === 'chat-screen') {
                setTimeout(() => {
                    const chatInput = document.getElementById('chat-input');
                    if (chatInput) chatInput.focus();
                }, 100);
            }
        }
    }

    updateActiveNavLink(clickedLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        if (clickedLink) {
            clickedLink.classList.add('active');
        }
    }

    showCrisisScreen() {
        this.showScreen('crisis-screen');
        this.announceToScreenReader('Crisis support resources are now displayed. Emergency help is available.');
    }

    // User Session Management
    startAnonymousSession() {
        this.currentUser = {
            id: 'user_' + Date.now(),
            anonymous: true,
            created: new Date().toISOString()
        };
        this.saveUserData();
        this.showScreen('dashboard-screen');
        this.announceToScreenReader('Anonymous session started. Welcome to your mental health dashboard.');
    }

    continueAsGuest() {
        this.showScreen('dashboard-screen');
        this.announceToScreenReader('Continuing as guest. Welcome to your mental health dashboard.');
    }

    // Settings Management
    loadSettings() {
        const defaultSettings = {
            theme: 'light',
            textSize: 'medium',
            language: 'en',
            voiceEnabled: false
        };
        
        try {
            const saved = localStorage.getItem('amhp_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch {
            return defaultSettings;
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('amhp_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        const { theme, textSize, language, voiceEnabled } = this.settings;
        
        // Apply theme
        document.documentElement.setAttribute('data-color-scheme', theme);
        document.documentElement.setAttribute('data-text-size', textSize);
        
        // Update form values
        const themeSelect = document.getElementById('theme-select');
        const settingsTheme = document.getElementById('settings-theme');
        if (themeSelect) themeSelect.value = theme;
        if (settingsTheme) settingsTheme.value = theme;
        
        const textSizeSelect = document.getElementById('text-size-select');
        const settingsTextSize = document.getElementById('settings-text-size');
        if (textSizeSelect) textSizeSelect.value = textSize;
        if (settingsTextSize) settingsTextSize.value = textSize;
        
        const languageSelect = document.getElementById('language-select');
        const settingsLanguage = document.getElementById('settings-language');
        if (languageSelect) languageSelect.value = language;
        if (settingsLanguage) settingsLanguage.value = language;
        
        const voiceCheckbox = document.getElementById('voice-enabled');
        if (voiceCheckbox) voiceCheckbox.checked = voiceEnabled;
    }

    // Mood Tracking
    loadMoodData() {
        try {
            const saved = localStorage.getItem('amhp_mood_data');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveMoodData() {
        localStorage.setItem('amhp_mood_data', JSON.stringify(this.moodData));
    }

    quickMoodEntry(moodValue) {
        document.querySelectorAll('.mood-face').forEach(face => face.classList.remove('selected'));
        event.target.classList.add('selected');
        
        const entry = {
            date: new Date().toISOString().split('T')[0],
            mood: parseInt(moodValue),
            note: 'Quick entry from dashboard',
            timestamp: new Date().toISOString()
        };
        
        this.moodData.push(entry);
        this.saveMoodData();
        this.announceToScreenReader(`Mood recorded as ${this.moodScale[moodValue]}`);
        this.showStatusMessage('Mood entry saved successfully!', 'success');
    }

    updateMoodDescription(value) {
        const description = this.moodScale[value] || 'Neutral';
        const descElement = document.getElementById('mood-description');
        if (descElement) {
            descElement.textContent = description;
        }
    }

    saveMoodEntry() {
        const slider = document.getElementById('mood-slider');
        const note = document.getElementById('mood-note');
        
        if (slider) {
            const entry = {
                date: new Date().toISOString().split('T')[0],
                mood: parseInt(slider.value),
                note: note?.value || '',
                timestamp: new Date().toISOString()
            };
            
            this.moodData.push(entry);
            this.saveMoodData();
            this.announceToScreenReader(`Mood entry saved: ${this.moodScale[slider.value]}`);
            this.showStatusMessage('Mood entry saved successfully!', 'success');
            
            // Clear form
            if (note) note.value = '';
            slider.value = 5;
            this.updateMoodDescription(5);
            
            // Update chart
            this.initializeMoodChart();
        }
    }

    initializeMoodChart() {
        const canvas = document.getElementById('mood-chart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.moodChart) {
            this.moodChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const last7Days = this.getLast7DaysMoodData();

        this.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(entry => new Date(entry.date).toLocaleDateString()),
                datasets: [{
                    label: 'Daily Mood',
                    data: last7Days.map(entry => entry.mood),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 1,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Mood Level'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const moodText = app.moodScale[context.parsed.y];
                                return `Mood: ${context.parsed.y} (${moodText})`;
                            }
                        }
                    }
                }
            }
        });
    }

    getLast7DaysMoodData() {
        const today = new Date();
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayData = this.moodData.find(entry => entry.date === dateStr);
            last7Days.push({
                date: dateStr,
                mood: dayData ? dayData.mood : 5 // Default to neutral if no data
            });
        }
        
        return last7Days;
    }

    // Chat Functionality
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('amhp_chat_history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveChatHistory() {
        localStorage.setItem('amhp_chat_history', JSON.stringify(this.chatHistory));
    }

    initializeChatMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        if (this.chatHistory.length === 0) {
            this.addAIMessage(this.getRandomResponse('greeting'));
        } else {
            this.renderChatHistory();
        }
    }

    renderChatHistory() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';
        this.chatHistory.forEach(message => {
            this.displayMessage(message.text, message.type === 'ai' ? 'ai' : 'user', false);
        });
    }

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';

        this.displayMessage(message, 'user');
        this.chatHistory.push({
            text: message,
            type: 'user',
            timestamp: new Date().toISOString()
        });

        // Simulate AI response delay
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addAIMessage(response);
        }, 1000);

        this.saveChatHistory();
    }

    displayMessage(text, sender, save = true) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'ai' ? 'AI' : 'U';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (sender === 'ai' && this.settings.voiceEnabled) {
            this.speak(text);
        }
    }

    addAIMessage(text) {
        this.displayMessage(text, 'ai');
        this.chatHistory.push({
            text: text,
            type: 'ai',
            timestamp: new Date().toISOString()
        });
        this.saveChatHistory();
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Crisis detection
        const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'hurt myself'];
        if (crisisKeywords.some(keyword => message.includes(keyword))) {
            setTimeout(() => this.showCrisisScreen(), 2000);
            return this.getRandomResponse('crisis');
        }

        // Emotion detection
        if (message.includes('anxious') || message.includes('anxiety') || message.includes('worried')) {
            return this.getRandomResponse('anxiety');
        }

        if (message.includes('sad') || message.includes('depressed') || message.includes('down') || 
            message.includes('bad day')) {
            return this.getRandomResponse('depression');
        }

        // Default supportive response
        return this.getRandomResponse('support');
    }

    getRandomResponse(category) {
        const responses = this.aiResponses[category] || this.aiResponses.support;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showStatusMessage('Voice input not supported in this browser', 'error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = this.settings.language === 'en' ? 'en-US' : this.settings.language;

        recognition.onstart = () => {
            document.getElementById('voice-btn').classList.add('loading');
            this.announceToScreenReader('Listening...');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
            this.announceToScreenReader(`Voice input received: ${transcript}`);
        };

        recognition.onerror = () => {
            this.showStatusMessage('Voice input error. Please try again.', 'error');
        };

        recognition.onend = () => {
            document.getElementById('voice-btn').classList.remove('loading');
        };

        recognition.start();
    }

    speak(text) {
        if (!this.settings.voiceEnabled || !('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    }

    // Resources Management
    loadResources() {
        this.loadCBTResources();
        this.loadMeditationResources();
        this.showNewJournalPrompt();
    }

    loadCBTResources() {
        const container = document.getElementById('cbt-resources');
        if (!container) return;

        container.innerHTML = '';
        this.mentalHealthData.cbtExercises.forEach(exercise => {
            const card = this.createResourceCard(exercise);
            container.appendChild(card);
        });
    }

    loadMeditationResources() {
        const container = document.getElementById('meditation-resources');
        if (!container) return;

        container.innerHTML = '';
        this.mentalHealthData.meditations.forEach(meditation => {
            const card = this.createResourceCard(meditation);
            container.appendChild(card);
        });
    }

    createResourceCard(resource) {
        const card = document.createElement('div');
        card.className = 'resource-card card';

        const header = document.createElement('div');
        header.className = 'card__header';

        const title = document.createElement('h3');
        title.textContent = resource.title;

        const meta = document.createElement('div');
        meta.className = 'resource-meta';

        if (resource.category) {
            const category = document.createElement('span');
            category.className = 'resource-category';
            category.textContent = resource.category;
            meta.appendChild(category);
        }

        if (resource.duration) {
            const duration = document.createElement('span');
            duration.textContent = resource.duration;
            meta.appendChild(duration);
        }

        if (resource.difficulty) {
            const difficulty = document.createElement('span');
            difficulty.textContent = resource.difficulty;
            meta.appendChild(difficulty);
        }

        const body = document.createElement('div');
        body.className = 'card__body';

        const description = document.createElement('p');
        description.textContent = resource.description || `${resource.type} meditation to help with relaxation`;

        const button = document.createElement('button');
        button.className = 'btn btn--primary';
        button.textContent = 'Start Exercise';
        button.addEventListener('click', () => {
            this.startResource(resource);
        });

        header.appendChild(title);
        header.appendChild(meta);
        body.appendChild(description);
        body.appendChild(button);
        card.appendChild(header);
        card.appendChild(body);

        return card;
    }

    startResource(resource) {
        // Provide feedback when starting an exercise
        this.showStatusMessage(`Starting ${resource.title}. This ${resource.duration || '5-10 minute'} exercise will help you ${resource.description.toLowerCase()}.`, 'success');
        this.announceToScreenReader(`Starting ${resource.title}. ${resource.description}. Duration: ${resource.duration || '5-10 minutes'}.`);
        
        // Simulate exercise start with guided instructions
        setTimeout(() => {
            let exerciseInstructions = '';
            
            if (resource.title.includes('Thought Record')) {
                exerciseInstructions = 'Step 1: Identify the situation that triggered negative thoughts. Step 2: Write down the negative thought. Step 3: Rate your belief in this thought (1-10). Step 4: Look for evidence for and against this thought. Step 5: Create a more balanced thought.';
            } else if (resource.title.includes('Breathing')) {
                exerciseInstructions = 'Find a comfortable position. Breathe in slowly for 4 counts... Hold for 4 counts... Breathe out slowly for 6 counts... Repeat this cycle 5 more times.';
            } else if (resource.title.includes('Body Scan')) {
                exerciseInstructions = 'Close your eyes and start by focusing on your toes. Notice any sensations. Slowly move your attention up through your legs, torso, arms, and head. Spend 30 seconds on each body part.';
            } else {
                exerciseInstructions = `Begin your ${resource.title.toLowerCase()} practice. Focus on the present moment and follow the guided instructions.`;
            }
            
            this.showStatusMessage(exerciseInstructions, 'success');
        }, 2000);
    }

    showTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(`${tabId}-tab`);

        if (activeBtn) activeBtn.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }

    // Journal Functionality
    showNewJournalPrompt() {
        const promptContainer = document.getElementById('journal-prompt');
        if (!promptContainer) return;

        const randomPrompt = this.mentalHealthData.journalPrompts[
            Math.floor(Math.random() * this.mentalHealthData.journalPrompts.length)
        ];
        promptContainer.textContent = randomPrompt;
    }

    saveJournalEntry() {
        const textarea = document.getElementById('journal-text');
        if (!textarea || !textarea.value.trim()) {
            this.showStatusMessage('Please write something in your journal before saving.', 'error');
            return;
        }

        const entry = {
            date: new Date().toISOString().split('T')[0],
            text: textarea.value.trim(),
            timestamp: new Date().toISOString()
        };

        let journalEntries = [];
        try {
            const saved = localStorage.getItem('amhp_journal_entries');
            journalEntries = saved ? JSON.parse(saved) : [];
        } catch {}

        journalEntries.push(entry);
        localStorage.setItem('amhp_journal_entries', JSON.stringify(journalEntries));
        
        this.showStatusMessage('Journal entry saved successfully!', 'success');
        this.announceToScreenReader('Journal entry saved');
        textarea.value = '';
    }

    // Crisis Resources
    loadCrisisResources() {
        const container = document.getElementById('crisis-resources-list');
        if (!container) return;

        container.innerHTML = '';
        this.crisisResources.hotlines.forEach(resource => {
            const resourceDiv = document.createElement('div');
            resourceDiv.className = 'crisis-resource';
            resourceDiv.style.marginBottom = '16px';
            
            const title = document.createElement('h3');
            title.textContent = resource.name;
            title.style.marginBottom = '8px';
            
            const contact = document.createElement('p');
            contact.innerHTML = `<strong>${resource.phone || resource.contact}</strong> - ${resource.available}`;
            contact.style.marginBottom = '4px';
            
            const description = document.createElement('p');
            description.textContent = resource.description;
            description.style.color = 'var(--color-text-secondary)';
            
            resourceDiv.appendChild(title);
            resourceDiv.appendChild(contact);
            resourceDiv.appendChild(description);
            container.appendChild(resourceDiv);
        });
    }

    // Daily Recommendation
    updateDailyRecommendation() {
        const container = document.getElementById('daily-recommendation');
        if (!container) return;

        const recommendations = [
            'Try the 5-minute breathing exercise to start your day mindfully.',
            'Practice gratitude by writing down three things you\'re thankful for.',
            'Take a short walk outside to connect with nature.',
            'Use the thought record exercise to examine any negative thoughts.',
            'Schedule one enjoyable activity for today.'
        ];

        const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)];
        container.innerHTML = `<p>${randomRec}</p><button class="btn btn--outline mt-8" data-screen="resources">Explore Resources</button>`;
    }

    // Utility Functions
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('amhp_current_user', JSON.stringify(this.currentUser));
        }
    }

    showStatusMessage(message, type = 'success') {
        // Create or update status message
        let statusDiv = document.querySelector('.status-message');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.className = `status-message status-message--${type}`;
            const mainContainer = document.querySelector('.main-content .container') || document.querySelector('.container');
            if (mainContainer) {
                mainContainer.prepend(statusDiv);
            }
        } else {
            statusDiv.className = `status-message status-message--${type}`;
        }
        
        statusDiv.textContent = message;
        statusDiv.style.display = 'flex';
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.style.display = 'none';
            }
        }, 4000);
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
}

// Initialize the application
const app = new AMHP();

// Additional accessibility enhancements
document.addEventListener('keydown', (e) => {
    // Escape key to close modals or return to dashboard
    if (e.key === 'Escape') {
        if (app.currentScreen !== 'dashboard-screen') {
            app.showScreen('dashboard-screen');
        }
    }
    
    // Alt + C for crisis help
    if (e.altKey && e.key === 'c') {
        app.showCrisisScreen();
    }
});

// Handle offline/online status
window.addEventListener('online', () => {
    app.announceToScreenReader('Connection restored');
});

window.addEventListener('offline', () => {
    app.announceToScreenReader('You are now offline. Basic features remain available.');
});

// Prevent accidental page refresh
window.addEventListener('beforeunload', (e) => {
    if (app.chatHistory.length > 0 || app.moodData.length > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});