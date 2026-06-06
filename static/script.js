let questions = [];
let currentIndex = 0;
let userAnswers = [];
let answered = false;

function setTopic(topic) {
  document.getElementById("topicInput").value = topic;
}

async function generateQuiz() {
  const topic = document.getElementById("topicInput").value.trim();
  const numQuestions = document.getElementById("numQuestions").value;
  const startBtn = document.getElementById("startBtn");

  if (!topic) {
    alert("Please enter a topic first!");
    return;
  }

  startBtn.disabled = true;
  startBtn.textContent = "Generating quiz...";

  try {
    const response = await fetch("/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, num_questions: parseInt(numQuestions) })
    });

    const data = await response.json();

    if (data.error) {
      alert("Error: " + data.error);
      startBtn.disabled = false;
      startBtn.textContent = "🚀 Generate Quiz";
      return;
    }

    questions = data.questions;
    userAnswers = new Array(questions.length).fill(null);
    currentIndex = 0;

    document.getElementById("homeScreen").style.display = "none";
    document.getElementById("quizScreen").style.display = "flex";

    showQuestion();

  } catch (err) {
    alert("Something went wrong. Please try again.");
    startBtn.disabled = false;
    startBtn.textContent = "🚀 Generate Quiz";
  }
}

function showQuestion() {
  const q = questions[currentIndex];
  answered = userAnswers[currentIndex] !== null;

  document.getElementById("progressText").textContent =
    `Question ${currentIndex + 1} of ${questions.length}`;

  document.getElementById("prevBtn").style.display =
    currentIndex > 0 ? "block" : "none";

  document.getElementById("nextBtn").textContent =
    currentIndex === questions.length - 1 ? "See Results" : "Next →";

  const container = document.getElementById("quizContainer");
  container.innerHTML = `
    <div class="question-card">
      <div class="question-number">Question ${currentIndex + 1}</div>
      <div class="question-text">${q.question}</div>
      <div class="options-list">
        ${q.options.map(opt => `
          <button class="option-btn ${getOptionClass(opt)}"
            onclick="selectAnswer('${opt.replace(/'/g, "\\'")}')"
            ${answered ? "disabled" : ""}>
            ${opt}
          </button>
        `).join("")}
      </div>
      ${answered ? `<div class="explanation-box">💡 ${q.explanation}</div>` : ""}
    </div>
  `;
}

function getOptionClass(opt) {
  if (userAnswers[currentIndex] === null) return "";
  const q = questions[currentIndex];
  if (opt === q.correct) return "correct";
  if (opt === userAnswers[currentIndex] && opt !== q.correct) return "wrong";
  return "";
}

function selectAnswer(opt) {
  if (answered) return;
  userAnswers[currentIndex] = opt;
  answered = true;
  showQuestion();
}

function nextQuestion() {
  if (currentIndex === questions.length - 1) {
    showResults();
  } else {
    currentIndex++;
    showQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
}

function showResults() {
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultsScreen").style.display = "flex";

  const correct = userAnswers.filter((ans, i) => ans === questions[i].correct).length;
  const total = questions.length;
  const percentage = Math.round((correct / total) * 100);

  document.getElementById("scoreCircle").textContent = `${percentage}%`;

  let message = "";
  let subtext = "";

  if (percentage >= 80) {
    message = "Excellent Work! 🎉";
    subtext = "You really know this topic well!";
  } else if (percentage >= 60) {
    message = "Good Job! 👍";
    subtext = "Keep studying to improve further.";
  } else if (percentage >= 40) {
    message = "Keep Practicing! 📚";
    subtext = "Review the topic and try again.";
  } else {
    message = "Need More Study! 💪";
    subtext = "Don't give up, keep learning!";
  }

  document.getElementById("scoreMessage").textContent = message;
  document.getElementById("scoreSubtext").textContent =
    `You got ${correct} out of ${total} correct. ${subtext}`;

  const breakdown = document.getElementById("resultsBreakdown");
  breakdown.innerHTML = questions.map((q, i) => {
    const isCorrect = userAnswers[i] === q.correct;
    return `
      <div class="result-item ${isCorrect ? "correct-result" : "wrong-result"}">
        ${isCorrect ? "✅" : "❌"} ${q.question}<br>
        <strong>Correct: ${q.correct}</strong>
        ${!isCorrect && userAnswers[i] ? `<br>Your answer: ${userAnswers[i]}` : ""}
      </div>
    `;
  }).join("");
}

function resetAll() {
  questions = [];
  currentIndex = 0;
  userAnswers = [];
  answered = false;

  document.getElementById("topicInput").value = "";
  document.getElementById("startBtn").disabled = false;
  document.getElementById("startBtn").textContent = "🚀 Generate Quiz";

  document.getElementById("homeScreen").style.display = "flex";
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultsScreen").style.display = "none";
}