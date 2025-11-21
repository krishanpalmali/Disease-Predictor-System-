// Revised, working JS with proper initialization and DOM safety

let step = 0;
const userInfo = {};

// Ensure JS runs after DOM loads
window.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById("chat-box");
    const sendBtn = document.getElementById("send-btn");
    const input = document.getElementById("user-input");
    const clearBtn = document.getElementById("clear-btn");

    if (!chatBox || !sendBtn || !input || !clearBtn) {
        console.error("❌ Required HTML elements missing.");
        return;
    }

    addMessage("bot", "Namaste! Main aapka Diabetes Assistant hoon. Aapka naam kya hai?");

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    clearBtn.addEventListener('click', () => {
        chatBox.innerHTML = "";
        step = 0;
        addMessage("bot", "Namaste! Aapka naam kya hai?");
    });
});

function addMessage(type, text) {
    const box = document.getElementById("chat-box");
    const div = document.createElement('div');
    div.className = type;
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function sendMessage() {
    const inp = document.getElementById("user-input");
    const txt = inp.value.trim();
    if (!txt) return;

    addMessage("user", txt);
    inp.value = "";
    handleUserInput(txt);
}

function handleUserInput(msg) {
    switch (step) {
        case 0:
            userInfo.name = msg;
            addMessage("bot", `Hello ${msg}! 👋`);
            addMessage("bot", "Aapki age kya hai? (years)");
            step = 1;
            break;

        case 1:
            userInfo.age = parseInt(msg, 10);
            if (isNaN(userInfo.age)) {
                addMessage("bot", "Age number me bataye.");
                return;
            }
            addMessage("bot", "Aapka glucose level kya hai? (mg/dL)");
            step = 2;
            break;

        case 2:
            userInfo.glucose = parseFloat(msg);
            if (isNaN(userInfo.glucose)) {
                addMessage("bot", "Glucose numeric value ho.");
                return;
            }
            addMessage("bot", "BMI bataye (e.g., 23.5)");
            step = 3;
            break;

        case 3:
            userInfo.bmi = parseFloat(msg);
            if (isNaN(userInfo.bmi)) {
                addMessage("bot", "BMI sahi number me bataye.");
                return;
            }
            addMessage("bot", "Data analyze ho raha hai... 🔍");
            runPrediction();
            step = 4;
            break;

        default:
            addMessage("bot", "Aapka data record ho chuka hai. 😊");
    }
}

function runPrediction() {
    const payload = {
        Glucose: userInfo.glucose,
        BloodPressure: 70,
        BMI: userInfo.bmi,
        DiabetesPedigreeFunction: 0.5,
        Age: userInfo.age,
    };

    fetch("http://localhost:8000/predict-diabetes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (!data || data.risk === undefined) {
                addMessage("bot", "❌ Backend ne valid response nahi diya.");
                return;
            }
            addMessage("bot", `📊 Diabetes Risk: ${data.risk}%`);
        })
        .catch(err => {
            addMessage("bot", "❌ Backend connection issue: " + err);
        });
}
