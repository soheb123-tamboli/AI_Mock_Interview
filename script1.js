document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        startInterviewBtn: document.getElementById('start-interview'),
        jobRoleInput: document.getElementById('job-role'),
        experienceLevelSelect: document.getElementById('experience-level'),
        interviewPanel: document.querySelector('.interview-panel'),
        setupPanel: document.querySelector('.setup-panel'),
        resultsPanel: document.querySelector('.results-panel'),
        questionText: document.getElementById('question-text'),
        questionNumber: document.getElementById('question-number'),
        totalQuestions: document.getElementById('total-questions'),
        timeDisplay: document.getElementById('time'),
        videoPreview: document.getElementById('video-preview'),
        startRecordingBtn: document.getElementById('start-recording'),
        stopRecordingBtn: document.getElementById('stop-recording'),
        nextQuestionBtn: document.getElementById('next-question'),
        recordingIndicator: document.getElementById('recording-indicator'),
        restartInterviewBtn: document.getElementById('restart-interview'),
        contentFeedback: document.getElementById('content-feedback'),
        deliveryFeedback: document.getElementById('delivery-feedback'),
        confidenceScore: document.getElementById('confidence-score'),
        clarityScore: document.getElementById('clarity-score'),
        postureScore: document.getElementById('posture-score'),
        engagementScore: document.getElementById('engagement-score'),
        poseCanvas: document.getElementById('pose-canvas'),
        realTimeFeedback: document.getElementById('real-time-feedback'),
        aiAnswerPanel: document.getElementById('ai-answer'),
        toggleAnswerBtn: document.getElementById('toggle-answer'),
        customQuestionsList: document.getElementById('custom-questions-list'),
        newQuestionInput: document.getElementById('new-question'),
        addQuestionBtn: document.getElementById('add-question'),
        questionFeedbackPanel: document.getElementById('question-feedback'),
        perQuestionFeedback: document.getElementById('per-question-feedback'),
        speakQuestionBtn: document.getElementById('speak-question'),
    repeatQuestionBtn: document.getElementById('repeat-question'),
    questionAudio: document.getElementById('question-audio')
    };

    // Interview state
    const interviewState = {
        
        currentQuestion: 0,
        questions: [],
        customQuestions: JSON.parse(localStorage.getItem('customQuestions')) || [],
        mediaRecorder: null,
        recordedChunks: [],
        timerInterval: null,
        feedbackInterval: null,
        timeLeft: 90,
        stream: null,
        
        feedbackMetrics: {
            posture: 'good',
            eyeContact: 'moderate',
            fillerWords: 0,
            volume: 'good',
            pace: 'moderate'
            
        },
        questionFeedback: []
    };

    // Initialize the app
    function init() {
        elements.poseCanvas.width = 640;
        elements.poseCanvas.height = 480;
        renderCustomQuestions();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        elements.startInterviewBtn.addEventListener('click', startInterview);
        elements.startRecordingBtn.addEventListener('click', startRecording);
        elements.stopRecordingBtn.addEventListener('click', stopRecording);
        elements.nextQuestionBtn.addEventListener('click', nextQuestion);
        elements.restartInterviewBtn.addEventListener('click', restartInterview);
        elements.toggleAnswerBtn.addEventListener('click', toggleAnswer);
        elements.addQuestionBtn.addEventListener('click', addCustomQuestion);
        elements.newQuestionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addCustomQuestion();
        });
    }

    // Start interview
    async function startInterview() {
        const jobRole = elements.jobRoleInput.value.trim();
        const experienceLevel = elements.experienceLevelSelect.value;
        
        if (!jobRole) {
            alert('Please enter a job role');
            return;
        }
        
        interviewState.questions = generateQuestions(jobRole, experienceLevel);
        elements.totalQuestions.textContent = interviewState.questions.length;
        
        elements.setupPanel.classList.add('hidden');
        elements.interviewPanel.classList.remove('hidden');
        
        await startCamera();
        showQuestion(0);
    }

    // Start camera
    async function startCamera() {
        try {
            interviewState.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                },
                audio: true
            });
            elements.videoPreview.srcObject = interviewState.stream;
            detectPose();
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please ensure permissions are granted.');
        }
    }

    // Simplified pose detection
    function detectPose() {
        const poseCtx = elements.poseCanvas.getContext('2d');
        elements.poseCanvas.width = elements.videoPreview.videoWidth;
        elements.poseCanvas.height = elements.videoPreview.videoHeight;
        
        function processFrame() {
            if (elements.videoPreview.paused || elements.videoPreview.ended) return;
            
            poseCtx.clearRect(0, 0, elements.poseCanvas.width, elements.poseCanvas.height);
            
            // Draw simple pose indicators
            poseCtx.strokeStyle = '#00FF00';
            poseCtx.lineWidth = 2;
            
            // Face outline
            poseCtx.beginPath();
            poseCtx.arc(elements.poseCanvas.width / 2, elements.poseCanvas.height / 3, 50, 0, 2 * Math.PI);
            poseCtx.stroke();
            
            // Shoulder line
            poseCtx.beginPath();
            poseCtx.moveTo(elements.poseCanvas.width / 3, elements.poseCanvas.height / 2);
            poseCtx.lineTo(elements.poseCanvas.width * 2 / 3, elements.poseCanvas.height / 2);
            poseCtx.stroke();
            
            requestAnimationFrame(processFrame);
        }
        
        elements.videoPreview.addEventListener('play', processFrame);
    }

    // Show question
    function showQuestion(index) {
        if (index >= interviewState.questions.length) {
            endInterview();
            return;
        }
        
        interviewState.currentQuestion = index;
        elements.questionNumber.textContent = index + 1;
        elements.questionText.textContent = interviewState.questions[index];
        
        resetTimer();
        hideAIAnswer();
        elements.questionFeedbackPanel.classList.add('hidden');
    }

    // Timer functions
    function resetTimer() {
        clearInterval(interviewState.timerInterval);
        interviewState.timeLeft = 90;
        updateTimerDisplay();
    }

    function startTimer() {
        interviewState.timerInterval = setInterval(function() {
            interviewState.timeLeft--;
            updateTimerDisplay();
            
            if (interviewState.timeLeft <= 0) {
                stopRecording();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(interviewState.timeLeft / 60);
        const seconds = interviewState.timeLeft % 60;
        elements.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Recording functions
    function startRecording() {
        interviewState.recordedChunks = [];
        interviewState.mediaRecorder = new MediaRecorder(interviewState.stream, {
            mimeType: 'video/webm;codecs=vp9'
        });
        
        interviewState.mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                interviewState.recordedChunks.push(event.data);
            }
        };
        
        interviewState.mediaRecorder.start(100);
        
        elements.startRecordingBtn.classList.add('hidden');
        elements.stopRecordingBtn.classList.remove('hidden');
        elements.recordingIndicator.classList.remove('hidden');
        
        startTimer();
        startRealTimeFeedback();
    }

    function stopRecording() {
        if (interviewState.mediaRecorder && interviewState.mediaRecorder.state !== 'inactive') {
            interviewState.mediaRecorder.stop();
        }
        
        clearInterval(interviewState.timerInterval);
        stopRealTimeFeedback();
        
        elements.stopRecordingBtn.classList.add('hidden');
        elements.nextQuestionBtn.classList.remove('hidden');
        elements.recordingIndicator.classList.add('hidden');
        
        processRecording();
    }

    function processRecording() {
        // In a real app, send to backend for analysis
        // For demo, generate mock feedback
        const feedback = generateQuestionFeedback(
            interviewState.questions[interviewState.currentQuestion],
            interviewState.feedbackMetrics
        );
        
        interviewState.questionFeedback.push(feedback);
        displayQuestionFeedback(feedback);
    }

    function nextQuestion() {
        showQuestion(interviewState.currentQuestion + 1);
        elements.nextQuestionBtn.classList.add('hidden');
        elements.startRecordingBtn.classList.remove('hidden');
    }

    function endInterview() {
        if (interviewState.stream) {
            interviewState.stream.getTracks().forEach(track => track.stop());
        }
        
        displayFinalFeedback();
        elements.interviewPanel.classList.add('hidden');
        elements.resultsPanel.classList.remove('hidden');
    }

    // Real-time feedback functions
    function startRealTimeFeedback() {
        if (interviewState.feedbackInterval) {
            clearInterval(interviewState.feedbackInterval);
        }
        
        interviewState.feedbackMetrics.fillerWords = 0;
        updateRealTimeFeedback();
        
        interviewState.feedbackInterval = setInterval(() => {
            // Simulate changing metrics
            simulateFeedbackChanges();
            updateRealTimeFeedback();
        }, 3000);
    }

    function stopRealTimeFeedback() {
        if (interviewState.feedbackInterval) {
            clearInterval(interviewState.feedbackInterval);
        }
    }

    function simulateFeedbackChanges() {
        const metrics = interviewState.feedbackMetrics;
        
        // Randomly adjust metrics
        metrics.posture = randomAdjust(metrics.posture, ['excellent', 'good', 'fair', 'poor']);
        metrics.eyeContact = randomAdjust(metrics.eyeContact, ['excellent', 'good', 'moderate', 'poor']);
        metrics.volume = randomAdjust(metrics.volume, ['too loud', 'good', 'too quiet']);
        metrics.pace = randomAdjust(metrics.pace, ['too fast', 'good', 'too slow']);
        
        // Increment filler words (0-2 per interval)
        metrics.fillerWords += Math.floor(Math.random() * 3);
    }

    function randomAdjust(current, options) {
        const currentIndex = options.indexOf(current);
        let newIndex = currentIndex;
        
        // 70% chance to stay the same, 30% to change
        if (Math.random() < 0.3) {
            // Move up or down 1 position
            newIndex += Math.random() < 0.5 ? 1 : -1;
            newIndex = Math.max(0, Math.min(options.length - 1, newIndex));
        }
        
        return options[newIndex];
    }

    function updateRealTimeFeedback() {
        const metrics = interviewState.feedbackMetrics;
        
        elements.realTimeFeedback.innerHTML = `
            <div class="feedback-bubble posture-feedback">
                <i class="fas fa-user"></i>
                <span>Posture: ${capitalize(metrics.posture)}</span>
            </div>
            <div class="feedback-bubble eye-contact-feedback">
                <i class="fas fa-eye"></i>
                <span>Eye Contact: ${capitalize(metrics.eyeContact)}</span>
            </div>
            <div class="feedback-bubble filler-words-feedback">
                <i class="fas fa-comment-slash"></i>
                <span>Filler Words: ${metrics.fillerWords}</span>
            </div>
            <div class="feedback-bubble volume-feedback">
                <i class="fas fa-volume-up"></i>
                <span>Volume: ${capitalize(metrics.volume)}</span>
            </div>
            <div class="feedback-bubble pace-feedback">
                <i class="fas fa-tachometer-alt"></i>
                <span>Pace: ${capitalize(metrics.pace)}</span>
            </div>
        `;
    }

    // AI Answer functions
    function toggleAnswer() {
        if (elements.aiAnswerPanel.classList.contains('hidden')) {
            showAIAnswer();
        } else {
            hideAIAnswer();
        }
    }

    function showAIAnswer() {
        const question = interviewState.questions[interviewState.currentQuestion];
        elements.aiAnswerPanel.textContent = generateAIAnswer(question);
        elements.aiAnswerPanel.classList.remove('hidden');
        elements.toggleAnswerBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Answer';
    }

    function hideAIAnswer() {
        elements.aiAnswerPanel.classList.add('hidden');
        elements.toggleAnswerBtn.innerHTML = '<i class="fas fa-eye"></i> Show Answer';
    }

    // Custom questions functions
    function renderCustomQuestions() {
        elements.customQuestionsList.innerHTML = '';
        interviewState.customQuestions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'custom-question-item';
            questionItem.innerHTML = `
                <span>${question}</span>
                <button class="remove-question" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            elements.customQuestionsList.appendChild(questionItem);
        });
        
        document.querySelectorAll('.remove-question').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                interviewState.customQuestions.splice(index, 1);
                saveCustomQuestions();
                renderCustomQuestions();
            });
        });
    }

    function addCustomQuestion() {
        const question = elements.newQuestionInput.value.trim();
        if (question) {
            interviewState.customQuestions.push(question);
            elements.newQuestionInput.value = '';
            saveCustomQuestions();
            renderCustomQuestions();
        }
    }

    function saveCustomQuestions() {
        localStorage.setItem('customQuestions', JSON.stringify(interviewState.customQuestions));
    }

    // Feedback functions
    function generateQuestionFeedback(question, metrics) {
        // This would come from backend analysis in a real app
        const feedbackTemplates = {
            technical: {
                strengths: [
                    "You demonstrated good technical knowledge",
                    "Your explanation was clear and structured",
                    "You provided relevant examples"
                ],
                improvements: [
                    "Try to be more concise with your explanations",
                    "Include more specific technical details",
                    "Consider using diagrams or analogies for complex concepts"
                ]
            },
            behavioral: {
                strengths: [
                    "You used the STAR method effectively",
                    "Your example was relevant to the question",
                    "You showed good self-awareness"
                ],
                improvements: [
                    "Try to keep your answers more focused",
                    "Include more measurable results in your examples",
                    "Show more enthusiasm when discussing achievements"
                ]
            },
            general: {
                strengths: [
                    "You maintained good eye contact",
                    "Your tone was confident and professional",
                    "You answered the question directly"
                ],
                improvements: [
                    "Try to reduce filler words",
                    "Work on maintaining consistent posture",
                    "Practice varying your vocal tone"
                ]
            }
        };
        
        const isTechnical = question.toLowerCase().includes('explain') || 
                          question.toLowerCase().includes('how would') || 
                          question.toLowerCase().includes('describe');
        
        const isBehavioral = question.toLowerCase().includes('experience') || 
                           question.toLowerCase().includes('situation') || 
                           question.toLowerCase().includes('handle');
        
        const type = isTechnical ? 'technical' : isBehavioral ? 'behavioral' : 'general';
        
        return {
            question,
            type,
            metrics: {...metrics},
            strengths: feedbackTemplates[type].strengths,
            improvements: feedbackTemplates[type].improvements,
            deliveryFeedback: [
                `Posture: ${capitalize(metrics.posture)}`,
                `Eye Contact: ${capitalize(metrics.eyeContact)}`,
                `Filler Words: ${metrics.fillerWords}`,
                `Volume: ${capitalize(metrics.volume)}`,
                `Pace: ${capitalize(metrics.pace)}`
            ]
        };
    }

    function displayQuestionFeedback(feedback) {
        elements.questionFeedbackPanel.classList.remove('hidden');
        
        let html = `
            <div class="feedback-item">
                <h4>Question: ${feedback.question}</h4>
            </div>
            
            <div class="feedback-item">
                <div class="feedback-category">Content Strengths:</div>
                <ul>${feedback.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            
            <div class="feedback-item">
                <div class="feedback-category">Content Improvements:</div>
                <ul>${feedback.improvements.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
            
            <div class="feedback-item">
                <div class="feedback-category">Delivery Analysis:</div>
                <ul>${feedback.deliveryFeedback.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>
            
            <div class="feedback-item">
                <div class="feedback-category">Practice Suggestion:</div>
                <div class="feedback-suggestion">Try answering this question again, focusing on ${feedback.improvements[0].toLowerCase()}</div>
            </div>
        `;
        
        elements.perQuestionFeedback.innerHTML = html;
    }

    function displayFinalFeedback() {
        // Calculate average scores
        const totalQuestions = interviewState.questionFeedback.length;
        const avgScores = {
            confidence: Math.min(100, 70 + Math.floor(Math.random() * 30)),
            clarity: Math.min(100, 65 + Math.floor(Math.random() * 35)),
            posture: calculatePostureScore(),
            engagement: Math.min(100, 75 + Math.floor(Math.random() * 25))
        };
        
        // Content feedback
        let contentStrengths = new Set();
        let contentImprovements = new Set();
        
        interviewState.questionFeedback.forEach(feedback => {
            feedback.strengths.forEach(s => contentStrengths.add(s));
            feedback.improvements.forEach(i => contentImprovements.add(i));
        });
        
        elements.contentFeedback.innerHTML = `
            <h4>Overall Content Analysis</h4>
            <p><strong>Strengths:</strong></p>
            <ul>${Array.from(contentStrengths).map(s => `<li>${s}</li>`).join('')}</ul>
            <p><strong>Areas for Improvement:</strong></p>
            <ul>${Array.from(contentImprovements).map(i => `<li>${i}</li>`).join('')}</ul>
        `;
        
        // Delivery feedback
        let deliveryStats = {
            posture: {},
            eyeContact: {},
            fillerWords: 0
        };
        
        interviewState.questionFeedback.forEach(feedback => {
            deliveryStats.fillerWords += feedback.metrics.fillerWords;
            
            ['posture', 'eyeContact'].forEach(metric => {
                deliveryStats[metric][feedback.metrics[metric]] = 
                    (deliveryStats[metric][feedback.metrics[metric]] || 0) + 1;
            });
        });
        
        elements.deliveryFeedback.innerHTML = `
            <h4>Overall Delivery Analysis</h4>
            <p><strong>Posture:</strong> ${getMostCommon(deliveryStats.posture)}</p>
            <p><strong>Eye Contact:</strong> ${getMostCommon(deliveryStats.eyeContact)}</p>
            <p><strong>Average Filler Words per Question:</strong> ${Math.round(deliveryStats.fillerWords / totalQuestions)}</p>
            <p><strong>Recommendations:</strong></p>
            <ul>
                <li>Practice maintaining consistent eye contact</li>
                <li>Be mindful of your posture during longer answers</li>
                <li>Work on reducing filler words</li>
            </ul>
        `;
        
        // Scores
        elements.confidenceScore.textContent = `${avgScores.confidence}%`;
        elements.clarityScore.textContent = `${avgScores.clarity}%`;
        elements.postureScore.textContent = `${avgScores.posture}%`;
        elements.engagementScore.textContent = `${avgScores.engagement}%`;
    }

    function calculatePostureScore() {
        const postureCounts = {};
        interviewState.questionFeedback.forEach(feedback => {
            const posture = feedback.metrics.posture;
            postureCounts[posture] = (postureCounts[posture] || 0) + 1;
        });
        
        const postureValues = {
            'excellent': 100,
            'good': 80,
            'fair': 60,
            'poor': 40
        };
        
        let total = 0;
        let count = 0;
        
        for (const [posture, freq] of Object.entries(postureCounts)) {
            total += postureValues[posture] * freq;
            count += freq;
        }
        
        return Math.round(total / count);
    }

    function getMostCommon(metric) {
        let maxCount = 0;
        let mostCommon = '';
        
        for (const [value, count] of Object.entries(metric)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = value;
            }
        }
        
        return capitalize(mostCommon);
    }

    // Helper functions
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function restartInterview() {
        elements.resultsPanel.classList.add('hidden');
        elements.setupPanel.classList.remove('hidden');
        interviewState.currentQuestion = 0;
        interviewState.questionFeedback = [];
    }

    function generateQuestions(jobRole, experienceLevel) {
        const questions = {
            "Software Engineer": [
                "Explain the concept of object-oriented programming and its main principles.",
                "How would you optimize a slow-performing database query?",
                "Describe your experience with version control systems like Git.",
                "How do you handle conflicts when working in a team environment?",
                "What coding best practices do you follow to ensure maintainable code?"
            ],
            "Marketing Manager": [
                "How would you develop a marketing strategy for a new product launch?",
                "Describe a successful campaign you've managed and what made it successful.",
                "How do you measure the ROI of marketing activities?",
                "What digital marketing channels do you find most effective and why?",
                "How would you handle a situation where a campaign is underperforming?"
            ],
            "default": [
                "Tell me about yourself and your background.",
                "What are your greatest strengths and weaknesses?",
                "Why do you want to work for our company?",
                "Describe a challenging situation you faced at work and how you handled it.",
                "Where do you see yourself in five years?"
            ]
        };
        
        const roleQuestions = questions[jobRole] || questions.default;
        return [...roleQuestions, ...interviewState.customQuestions];
    }

    function generateAIAnswer(question) {
        const answerTemplates = {
            technical: `A strong technical answer to "${question}" would:
1. Define any key terms or concepts
2. Explain the underlying principles
3. Provide a concrete example from your experience
4. Relate it to the position you're applying for

For example, if explaining a technical concept, you might say: "In my previous role at [Company], I implemented this by..."`,
            behavioral: `For behavioral questions like "${question}", use the STAR method:
1. Situation: Describe the context
2. Task: Explain what needed to be done
3. Action: Detail what you specifically did
4. Result: Share the positive outcome

Example: "In my last position, we faced [situation]. My responsibility was to [task]. I [actions taken], which resulted in [quantifiable results]."`,
            general: `When answering "${question}", consider:
1. Being concise (1-2 minutes max)
2. Highlighting relevant skills/experience
3. Connecting to the job requirements
4. Showing enthusiasm for the role

Sample structure: "I believe my experience in [relevant area] makes me a strong fit because [specific reason]. For example, when I was at [Company], I [achievement]."`
        };
        
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes('explain') || lowerQuestion.includes('how would') || lowerQuestion.includes('describe')) {
            return answerTemplates.technical;
        } else if (lowerQuestion.includes('experience') || lowerQuestion.includes('situation') || lowerQuestion.includes('handle')) {
            return answerTemplates.behavioral;
        } else {
            return answerTemplates.general;
        }
    }

    // Initialize the app
    init();
});