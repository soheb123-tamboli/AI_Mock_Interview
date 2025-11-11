document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dashboardSection = document.getElementById('dashboard');
    const interviewTypeModal = document.getElementById('interviewTypeModal');
    const hrQuestionsSetup = document.getElementById('hrQuestionsSetup');
    const technicalRoleSelection = document.getElementById('technicalRoleSelection');
    const technicalQuestionsSetup = document.getElementById('technicalQuestionsSetup');
    const interviewInterface = document.getElementById('interviewInterface');
    const interviewResults = document.getElementById('interviewResults');
    
    // Buttons
    const startHrInterviewBtn = document.getElementById('startHrInterview');
    const startTechnicalInterviewBtn = document.getElementById('startTechnicalInterview');
    const hrInterviewOption = document.getElementById('hrInterviewOption');
    const technicalInterviewOption = document.getElementById('technicalInterviewOption');
    const closeModal = document.querySelector('.close');
    const addHrQuestionBtn = document.getElementById('addHrQuestion');
    const newHrQuestionInput = document.getElementById('newHrQuestion');
    const startHrInterviewBtnFinal = document.getElementById('startHrInterviewBtn');
    const backToDashboardFromHrSetup = document.getElementById('backToDashboardFromHrSetup');
    const backToDashboardFromTechRole = document.getElementById('backToDashboardFromTechRole');
    const backToTechRoles = document.getElementById('backToTechRoles');
    const roleButtons = document.querySelectorAll('.role-btn');
    const addTechQuestionBtn = document.getElementById('addTechQuestion');
    const newTechQuestionInput = document.getElementById('newTechQuestion');
    const startTechInterviewBtnFinal = document.getElementById('startTechInterviewBtn');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const endInterviewBtn = document.getElementById('endInterviewBtn');
    const backToDashboardFromResults = document.getElementById('backToDashboardFromResults');
    
    // Interview data
    let currentInterviewType = '';
    let currentTechnicalRole = '';
    let selectedQuestions = [];
    let currentQuestionIndex = 0;
    let interviewResultsData = {};
    
    // Default questions
    const defaultHrQuestions = [
        "Tell me about yourself.",
        "What are your strengths and weaknesses?",
        "Why do you want to work for our company?",
        "Where do you see yourself in 5 years?",
        "How do you handle stress and pressure?",
        "Describe a challenging work situation and how you overcame it.",
        "What is your greatest professional achievement?",
        "Why should we hire you?",
        "What are your salary expectations?",
        "Do you have any questions for us?"
    ];
    
    const defaultTechQuestions = {
        java: [
            "Explain the difference between JDK, JRE, and JVM.",
            "What are the main features of Java 8?",
            "Explain the concept of Object-Oriented Programming.",
            "What is the difference between an interface and an abstract class?",
            "How does garbage collection work in Java?"
        ],
        python: [
            "What are Python decorators and how do you use them?",
            "Explain the difference between lists and tuples.",
            "What is PEP 8 and why is it important?",
            "How does Python manage memory?",
            "Explain the Global Interpreter Lock (GIL) in Python."
        ],
        javascript: [
            "Explain the difference between let, const, and var.",
            "What is hoisting in JavaScript?",
            "Explain the event loop in JavaScript.",
            "What are closures and how do you use them?",
            "What is the difference between == and ===?"
        ],
        csharp: [
            "What is the difference between value types and reference types in C#?",
            "Explain the async/await pattern in C#.",
            "What are delegates and how are they used?",
            "Explain the difference between IEnumerable and IQueryable.",
            "What are extension methods in C#?"
        ],
        cpp: [
            "What is the difference between stack and heap memory?",
            "Explain the concept of pointers and references.",
            "What are virtual functions and how do they work?",
            "Explain RAII (Resource Acquisition Is Initialization).",
            "What are smart pointers and why are they useful?"
        ],
        frontend: [
            "Explain the box model in CSS.",
            "What are the differences between display: none and visibility: hidden?",
            "How would you optimize a website's loading performance?",
            "Explain the difference between responsive and adaptive design.",
            "What are CSS preprocessors and why would you use them?"
        ],
        backend: [
            "What is REST and what are its constraints?",
            "Explain the difference between SQL and NoSQL databases.",
            "What is caching and how would you implement it?",
            "Explain the concept of microservices architecture.",
            "What are some common security concerns for web applications?"
        ],
        fullstack: [
            "How would you design a scalable web application?",
            "Explain the difference between authentication and authorization.",
            "What are some strategies for handling state management in a large application?",
            "How would you implement real-time features in a web application?",
            "What are your strategies for testing both frontend and backend code?"
        ]
    };
    
    // Initialize the app
    function initApp() {
        // Show dashboard by default
        showSection(dashboardSection);
        
        // Load default HR questions
        loadDefaultHrQuestions();
    }
    
    // Show a specific section and hide others
    function showSection(section) {
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        section.classList.add('active');
    }
    
    // Load default HR questions
    function loadDefaultHrQuestions() {
        const defaultHrQuestionsList = document.getElementById('defaultHrQuestions');
        defaultHrQuestionsList.innerHTML = '';
        
        defaultHrQuestions.forEach((question, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${question}</span>
                <button class="btn-small add-question-btn" data-question="${question}">Add</button>
            `;
            defaultHrQuestionsList.appendChild(li);
        });
        
        // Add event listeners to add buttons
        document.querySelectorAll('.add-question-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                addQuestionToCustomList(this.getAttribute('data-question'));
            });
        });
    }
    
    // Add question to custom list
    function addQuestionToCustomList(question) {
        const customHrQuestionsList = document.getElementById('customHrQuestions');
        
        // Check if question already exists
        const existingQuestions = Array.from(customHrQuestionsList.children).map(li => {
            return li.querySelector('span').textContent;
        });
        
        if (!existingQuestions.includes(question)) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${question}</span>
                <button class="btn-small remove-question-btn">&times;</button>
            `;
            customHrQuestionsList.appendChild(li);
            
            // Add event listener to remove button
            li.querySelector('.remove-question-btn').addEventListener('click', function() {
                li.remove();
            });
        }
    }
    
    // Load default technical questions for a role
    function loadDefaultTechQuestions(role) {
        const defaultTechQuestionsList = document.getElementById('defaultTechQuestions');
        defaultTechQuestionsList.innerHTML = '';
        
        document.getElementById('techRoleTitle').textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Interview Questions Setup`;
        
        if (defaultTechQuestions[role]) {
            defaultTechQuestions[role].forEach((question, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${question}</span>
                    <button class="btn-small add-question-btn" data-question="${question}">Add</button>
                `;
                defaultTechQuestionsList.appendChild(li);
            });
            
            // Add event listeners to add buttons
            document.querySelectorAll('.add-question-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    addTechQuestionToCustomList(this.getAttribute('data-question'));
                });
            });
        }
    }
    
    // Add technical question to custom list
    function addTechQuestionToCustomList(question) {
        const customTechQuestionsList = document.getElementById('customTechQuestions');
        
        // Check if question already exists
        const existingQuestions = Array.from(customTechQuestionsList.children).map(li => {
            return li.querySelector('span').textContent;
        });
        
        if (!existingQuestions.includes(question)) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${question}</span>
                <button class="btn-small remove-question-btn">&times;</button>
            `;
            customTechQuestionsList.appendChild(li);
            
            // Add event listener to remove button
            li.querySelector('.remove-question-btn').addEventListener('click', function() {
                li.remove();
            });
        }
    }
    
    // Start interview with selected questions
    function startInterview() {
        // Get selected questions
        if (currentInterviewType === 'hr') {
            const customQuestionsList = document.getElementById('customHrQuestions');
            selectedQuestions = Array.from(customQuestionsList.children).map(li => {
                return li.querySelector('span').textContent;
            });
            
            // If no questions selected, use default questions
            if (selectedQuestions.length === 0) {
                selectedQuestions = [...defaultHrQuestions];
            }
        } else {
            const customQuestionsList = document.getElementById('customTechQuestions');
            selectedQuestions = Array.from(customQuestionsList.children).map(li => {
                return li.querySelector('span').textContent;
            });
            
            // If no questions selected, use default questions for the role
            if (selectedQuestions.length === 0 && defaultTechQuestions[currentTechnicalRole]) {
                selectedQuestions = [...defaultTechQuestions[currentTechnicalRole]];
            }
        }

        
        
        // Initialize interview data
        currentQuestionIndex = 0;
        interviewResultsData = {
            type: currentInterviewType,
            role: currentTechnicalRole,
            questions: selectedQuestions.map(q => ({
                question: q,
                feedback: {
                    fillerWords: Math.floor(Math.random() * 5),
                    vocabulary: 4 + Math.floor(Math.random() * 6), // 4-9
                    grammar: 4 + Math.floor(Math.random() * 6), // 4-9
                    posture: 4 + Math.floor(Math.random() * 6), // 4-9
                    notes: getRandomFeedbackNotes()
                }
            })),
            overallScore: 70 + Math.floor(Math.random() * 30) // 70-99
        };
        
        // Start webcam
        startWebcam();
        
        // Show interview interface
        document.getElementById('interviewTypeHeader').textContent = 
            `${currentInterviewType === 'hr' ? 'HR' : currentTechnicalRole.charAt(0).toUpperCase() + currentTechnicalRole.slice(1)} Interview in Progress`;
        
        showSection(interviewInterface);
        
        // Start with first question
        askQuestion(currentQuestionIndex);
        
        // Update progress
        updateProgress();
    }
    
    // Start webcam
    function startWebcam() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(function(stream) {
                    const video = document.getElementById('userVideo');
                    video.srcObject = stream;
                })
                .catch(function(error) {
                    console.error("Error accessing media devices:", error);
                });
        }
    }
    
    // Ask a question
    function askQuestion(index) {
        if (index < selectedQuestions.length) {
            const question = selectedQuestions[index];
            const aiSpeech = document.getElementById('aiSpeech');
            
            // Simulate AI speaking
            aiSpeech.textContent = '';
            const words = question.split(' ');
            let i = 0;
            
            const typeWriter = setInterval(() => {
                if (i < words.length) {
                    aiSpeech.textContent += words[i] + ' ';
                    i++;
                } else {
                    clearInterval(typeWriter);
                }
            }, 200);
            
            // Simulate real-time feedback
            simulateFeedback();
        } else {
            // Interview completed
            endInterview();
        }
    }
    
    // Simulate real-time feedback
    function simulateFeedback() {
        // Random feedback for demo purposes
        const fillerWordsCount = Math.floor(Math.random() * 5);
        const vocabularyScore = 4 + Math.floor(Math.random() * 6); // 4-9
        const grammarScore = 4 + Math.floor(Math.random() * 6); // 4-9
        const postureScore = 4 + Math.floor(Math.random() * 6); // 4-9
        
        // Update UI
        document.getElementById('fillerWordsMeter').style.width = `${fillerWordsCount * 20}%`;
        document.getElementById('vocabularyMeter').style.width = `${vocabularyScore * 10}%`;
        document.getElementById('grammarMeter').style.width = `${grammarScore * 10}%`;
        document.getElementById('postureMeter').style.width = `${postureScore * 10}%`;
        
        // Update text feedback
        document.getElementById('fillerWordsText').textContent = 
            fillerWordsCount === 0 ? 'No filler words detected' : 
            fillerWordsCount < 3 ? 'Few filler words detected' : 'Many filler words detected';
            
        document.getElementById('vocabularyText').textContent = 
            vocabularyScore < 5 ? 'Basic vocabulary usage' : 
            vocabularyScore < 8 ? 'Good vocabulary usage' : 'Excellent vocabulary usage';
            
        document.getElementById('grammarText').textContent = 
            grammarScore < 5 ? 'Some grammatical errors' : 
            grammarScore < 8 ? 'Few grammatical errors' : 'No grammatical errors';
            
        document.getElementById('postureText').textContent = 
            postureScore < 5 ? 'Poor posture detected' : 
            postureScore < 8 ? 'Good posture detected' : 'Excellent posture detected';
    }
    
    // Update progress bar
    function updateProgress() {
        const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;
        document.getElementById('progressBarFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
    }
    
    // End interview and show results
    function endInterview() {
        // Stop webcam
        const video = document.getElementById('userVideo');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // Show results
        showInterviewResults();
        showSection(interviewResults);
    }
    
    // Show interview results
    function showInterviewResults() {
        // Set overall score
        document.getElementById('overallScore').textContent = interviewResultsData.overallScore;
        
        // Create accordion for question feedback
        const accordion = document.getElementById('feedbackAccordion');
        accordion.innerHTML = '';
        
        interviewResultsData.questions.forEach((q, index) => {
            const item = document.createElement('div');
            item.className = 'accordion-item';
            item.innerHTML = `
                <div class="accordion-header">
                    <span>Question ${index + 1}: ${q.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="accordion-content">
                    <div class="feedback-details">
                        <p><strong>Filler Words:</strong> ${q.feedback.fillerWords} detected</p>
                        <p><strong>Vocabulary:</strong> ${getRatingText(q.feedback.vocabulary)}</p>
                        <p><strong>Grammar:</strong> ${getRatingText(q.feedback.grammar)}</p>
                        <p><strong>Posture & Gesture:</strong> ${getRatingText(q.feedback.posture)}</p>
                        <p><strong>Notes:</strong> ${q.feedback.notes}</p>
                    </div>
                </div>
            `;
            accordion.appendChild(item);
            
            // Add click event to accordion header
            item.querySelector('.accordion-header').addEventListener('click', function() {
                item.classList.toggle('active');
                const icon = this.querySelector('i');
                if (item.classList.contains('active')) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });
        });
    }
    
    // Helper function to get rating text
    function getRatingText(score) {
        if (score < 5) return `Needs work (${score}/10)`;
        if (score < 8) return `Good (${score}/10)`;
        return `Excellent (${score}/10)`;
    }
    
    // Helper function to get random feedback notes
    function getRandomFeedbackNotes() {
        const notes = [
            "Good answer, but try to be more concise.",
            "Excellent response with clear examples.",
            "Consider structuring your answer more clearly.",
            "Great use of professional vocabulary.",
            "Try to maintain better eye contact with the camera.",
            "Your answer was a bit too short. Try to elaborate more.",
            "Good technical knowledge demonstrated.",
            "Watch out for saying 'um' and 'ah' too frequently.",
            "Your posture was good throughout the answer.",
            "Consider practicing this question more to improve fluency."
        ];
        return notes[Math.floor(Math.random() * notes.length)];
    }
    
    // Event Listeners
    startHrInterviewBtn.addEventListener('click', function() {
        currentInterviewType = 'hr';
        showSection(hrQuestionsSetup);
    });
    
    startTechnicalInterviewBtn.addEventListener('click', function() {
        currentInterviewType = 'technical';
        showSection(technicalRoleSelection);
    });
    
    hrInterviewOption.addEventListener('click', function() {
        currentInterviewType = 'hr';
        interviewTypeModal.style.display = 'none';
        showSection(hrQuestionsSetup);
    });
    
    technicalInterviewOption.addEventListener('click', function() {
        currentInterviewType = 'technical';
        interviewTypeModal.style.display = 'none';
        showSection(technicalRoleSelection);
    });
    
    closeModal.addEventListener('click', function() {
        interviewTypeModal.style.display = 'none';
    });
    
    addHrQuestionBtn.addEventListener('click', function() {
        const question = newHrQuestionInput.value.trim();
        if (question) {
            addQuestionToCustomList(question);
            newHrQuestionInput.value = '';
        }
    });
    
    startHrInterviewBtnFinal.addEventListener('click', startInterview);
    
    backToDashboardFromHrSetup.addEventListener('click', function() {
        showSection(dashboardSection);
    });
    
    backToDashboardFromTechRole.addEventListener('click', function() {
        showSection(dashboardSection);
    });
    
    backToTechRoles.addEventListener('click', function() {
        showSection(technicalRoleSelection);
    });
    
    roleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentTechnicalRole = this.getAttribute('data-role');
            loadDefaultTechQuestions(currentTechnicalRole);
            showSection(technicalQuestionsSetup);
        });
    });
    
    addTechQuestionBtn.addEventListener('click', function() {
        const question = newTechQuestionInput.value.trim();
        if (question) {
            addTechQuestionToCustomList(question);
            newTechQuestionInput.value = '';
        }
    });
    
    startTechInterviewBtnFinal.addEventListener('click', startInterview);
    
    nextQuestionBtn.addEventListener('click', function() {
        currentQuestionIndex++;
        askQuestion(currentQuestionIndex);
        updateProgress();
        
        // Disable next button if it's the last question
        if (currentQuestionIndex === selectedQuestions.length - 1) {
            this.textContent = 'Finish Interview';
            this.removeEventListener('click', arguments.callee);
            this.addEventListener('click', endInterview);
        }
    });
    
    endInterviewBtn.addEventListener('click', endInterview);
    
    backToDashboardFromResults.addEventListener('click', function() {
        showSection(dashboardSection);
    });
    
    // Toggle video/audio buttons
    document.getElementById('toggleVideo').addEventListener('click', function() {
        const video = document.getElementById('userVideo');
        if (video.srcObject) {
            video.srcObject.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            this.classList.toggle('btn-icon-muted');
        }
    });
    
    document.getElementById('toggleAudio').addEventListener('click', function() {
        const video = document.getElementById('userVideo');
        if (video.srcObject) {
            video.srcObject.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            this.classList.toggle('btn-icon-muted');
        }
    });
    
    // Initialize the app
    initApp();
});



// Add this to the default questions data structure (near the top of the file)
const defaultHrQuestionsWithAnswers = [
    {
        question: "Tell me about yourself.",
        answer: "I'm a recent computer science graduate from XYZ University with a passion for software development. During my studies, I completed several projects including a web-based inventory management system and a mobile app for campus navigation. I also interned at ABC Tech where I worked on optimizing database queries. I'm excited to apply my skills in a professional setting and continue learning."
    },
    {
        question: "What are your strengths and weaknesses?",
        answer: "My greatest strength is my problem-solving ability. I enjoy breaking down complex problems and finding efficient solutions. For example, during my internship, I reduced data processing time by 30% by optimizing our algorithms. As for weaknesses, I sometimes focus too much on details. I'm working on this by setting time limits for each task and prioritizing the big picture."
    },
    // Add answers for other default HR questions...
];

const defaultTechQuestionsWithAnswers = {
    java: [
        {
            question: "Explain the difference between JDK, JRE, and JVM.",
            answer: "The JVM (Java Virtual Machine) is the runtime environment that executes Java bytecode. The JRE (Java Runtime Environment) includes the JVM plus core libraries needed to run Java applications. The JDK (Java Development Kit) contains the JRE plus development tools like compilers and debuggers needed to create Java applications. In short: JDK is for development, JRE is for running Java programs, and JVM is the engine that executes the bytecode."
        },
        {
            question: "What are the main features of Java 8?",
            answer: "Java 8 introduced several important features: 1) Lambda expressions for functional programming, 2) The Stream API for processing collections of data, 3) Default methods in interfaces, 4) The new Date and Time API (java.time package), 5) Optional class to handle null values more elegantly, and 6) Method references as a shorthand for lambdas."
        },
        // Add answers for other Java questions...
    ],
    python: [
        {
            question: "What are Python decorators and how do you use them?",
            answer: "Decorators in Python are functions that modify the behavior of other functions. They allow you to wrap another function to extend its behavior without permanently modifying it. Decorators are represented by the @ symbol followed by the decorator name, placed above the function definition. For example, @staticmethod is a built-in decorator. You can create custom decorators by writing functions that take a function as input and return a modified function."
        },
        // Add answers for other Python questions...
    ],
    // Add answers for other technologies...
};

// Update the loadDefaultHrQuestions function
function loadDefaultHrQuestions() {
    const defaultHrQuestionsList = document.getElementById('defaultHrQuestions');
    defaultHrQuestionsList.innerHTML = '';
    
    defaultHrQuestionsWithAnswers.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="question-container">
                <span>${item.question}</span>
                <button class="btn-small view-answer-btn" data-answer="${item.answer}">View Answer</button>
                <button class="btn-small add-question-btn" data-question="${item.question}">Add</button>
            </div>
        `;
        defaultHrQuestionsList.appendChild(li);
    });
    
    // Add event listeners
    document.querySelectorAll('.add-question-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            addQuestionToCustomList(this.parentElement.querySelector('span').textContent);
        });
    });
    
    document.querySelectorAll('.view-answer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showAnswerModal(this.getAttribute('data-answer'));
        });
    });
}

// Update the loadDefaultTechQuestions function similarly
function loadDefaultTechQuestions(role) {
    const defaultTechQuestionsList = document.getElementById('defaultTechQuestions');
    defaultTechQuestionsList.innerHTML = '';
    
    document.getElementById('techRoleTitle').textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Interview Questions Setup`;
    
    if (defaultTechQuestionsWithAnswers[role]) {
        defaultTechQuestionsWithAnswers[role].forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="question-container">
                    <span>${item.question}</span>
                    <button class="btn-small view-answer-btn" data-answer="${item.answer}">View Answer</button>
                    <button class="btn-small add-question-btn" data-question="${item.question}">Add</button>
                </div>
            `;
            defaultTechQuestionsList.appendChild(li);
        });
        
        // Add event listeners
        document.querySelectorAll('.add-question-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                addTechQuestionToCustomList(this.parentElement.querySelector('span').textContent);
            });
        });
        
        document.querySelectorAll('.view-answer-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                showAnswerModal(this.getAttribute('data-answer'));
            });
        });
    }
}

// Add this new function to show answer modal
function showAnswerModal(answer) {
    const modal = document.createElement('div');
    modal.className = 'answer-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Sample Answer</h3>
            <div class="answer-content">${answer}</div>
            <button class="btn close-answer-btn">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.close-answer-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

