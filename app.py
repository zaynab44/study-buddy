from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

app = Flask(__name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json()
    topic = data.get("topic", "")
    num_questions = data.get("num_questions", 5)

    if not topic:
        return jsonify({"error": "No topic provided"}), 400

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """You are a quiz generator. Generate multiple choice questions.
Return ONLY a JSON array with no extra text, no markdown, no backticks.
Format exactly like this:
[
  {
    "question": "question text here",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct": "A) option1",
    "explanation": "brief explanation here"
  }
]"""
                },
                {
                    "role": "user",
                    "content": f"Generate {num_questions} multiple choice questions about: {topic}"
                }
            ]
        )

        response_text = completion.choices[0].message.content.strip()
        questions = json.loads(response_text)
        return jsonify({"questions": questions})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)