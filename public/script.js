const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const messages = document.querySelector("#messages");
const clearButton = document.querySelector("#clear-button");
const serviceStatus = document.querySelector("#service-status");
const statusText = document.querySelector("#status-text");
const suggestionButtons = document.querySelectorAll("[data-prompt]");
const apiBaseUrl = window.location.port === "5000" ? "" : "http://localhost:5000";

const welcomeMessage = {
  role: "assistant",
  text: "Hello! Send me a message to test the complete API flow.",
};

function createMessage({ role, text, error = false }) {
  const article = document.createElement("article");
  const avatar = document.createElement("div");
  const content = document.createElement("div");
  const author = document.createElement("span");
  const messageText = document.createElement("p");

  article.className = `message ${role}-message${error ? " error-message" : ""}`;
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "YOU" : "AI";
  content.className = "message-content";
  author.textContent = role === "user" ? "You" : "Hello Agent";
  messageText.textContent = text;

  content.append(author, messageText);
  article.append(avatar, content);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;

  return article;
}

function createLoadingMessage() {
  const article = document.createElement("article");
  const avatar = document.createElement("div");
  const content = document.createElement("div");
  const author = document.createElement("span");
  const dots = document.createElement("div");

  article.className = "message assistant-message";
  article.dataset.loading = "true";
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = "AI";
  content.className = "message-content";
  author.textContent = "Hello Agent is thinking";
  dots.className = "loading-dots";
  dots.setAttribute("aria-label", "Waiting for a response");
  dots.innerHTML = "<i></i><i></i><i></i>";

  content.append(author, dots);
  article.append(avatar, content);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;

  return article;
}

function setSubmitting(isSubmitting) {
  input.disabled = isSubmitting;
  sendButton.disabled = isSubmitting;
  messages.setAttribute("aria-busy", String(isSubmitting));
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
}

async function checkHealth() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/status`);

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    const data = await response.json();

    if (data.configured) {
      serviceStatus.classList.add("online");
      serviceStatus.classList.remove("offline");
      statusText.textContent = "AI configured";
    } else {
      serviceStatus.classList.add("offline");
      serviceStatus.classList.remove("online");
      statusText.textContent = "Setup required";
    }
  } catch {
    serviceStatus.classList.add("offline");
    serviceStatus.classList.remove("online");
    statusText.textContent = "API offline";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();

  if (!message) {
    input.focus();
    return;
  }

  createMessage({ role: "user", text: message });
  input.value = "";
  resizeInput();
  setSubmitting(true);
  const loadingMessage = createLoadingMessage();

  try {
    const response = await fetch(`${apiBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();

    loadingMessage.remove();

    if (!response.ok || !data.success) {
      const friendlyError =
        response.status === 503 && data.error === "AI service is not configured"
          ? "The API key is not configured yet. Add it to .env, then restart the server."
          : data.error || "The request could not be completed.";

      createMessage({ role: "assistant", text: friendlyError, error: true });
      return;
    }

    createMessage({ role: "assistant", text: data.response });
  } catch {
    loadingMessage.remove();
    createMessage({
      role: "assistant",
      text: "Could not reach the API. Make sure the development server is running.",
      error: true,
    });
  } finally {
    setSubmitting(false);
    input.focus();
  }
});

input.addEventListener("input", resizeInput);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.ctrlKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

clearButton.addEventListener("click", () => {
  messages.replaceChildren();
  createMessage(welcomeMessage);
  input.focus();
});

suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    resizeInput();
    input.focus();
  });
});

checkHealth();
