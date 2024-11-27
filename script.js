// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase configuration
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodXB5dHJhY3pqd3lrb3NnZG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MDE2NTUsImV4cCI6MjA0ODI3NzY1NX0.8wz2m-uQThSez7LxS9P9e8HcQyliuLJIjA9yWy6CZnQ'; // Replace with your actual key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const chatSection = document.getElementById('chat-section');
const authSection = document.getElementById('auth-section');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

// Helper: Show or hide sections
function toggleSections(showChat) {
  if (showChat) {
    authSection.style.display = 'none';
    chatSection.style.display = 'block';
  } else {
    authSection.style.display = 'block';
    chatSection.style.display = 'none';
  }
}

// Register User
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(`Registration failed: ${error.message}`);
    } else {
      alert('Registration successful. Please log in.');
    }
  });
}

// Login User
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data: session, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Login failed: ${error.message}`);
    } else {
      toggleSections(true);
      fetchAndDisplayMessages();
      listenForNewMessages();
    }
  });
}

// Send Message
sendButton.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const { user } = supabase.auth;
  const { error } = await supabase.from('messages').insert([{ text }]);

  if (error) {
    alert(`Failed to send message: ${error.message}`);
  } else {
    messageInput.value = '';
  }
});

// Fetch and Display Messages
async function fetchAndDisplayMessages() {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('text, created_at, user_id')
    .order('created_at', { ascending: true });

  if (error) {
    alert(`Failed to load messages: ${error.message}`);
  } else {
    messagesDiv.innerHTML = '';
    messages.forEach((message) => {
      const p = document.createElement('p');
      p.textContent = `${message.user_id}: ${message.text} (${new Date(
        message.created_at
      ).toLocaleTimeString()})`;
      messagesDiv.appendChild(p);
    });
  }
}

// Listen for New Messages in Real-Time
function listenForNewMessages() {
  supabase
    .from('messages')
    .on('INSERT', (payload) => {
      const message = payload.new;
      const p = document.createElement('p');
      p.textContent = `${message.user_id}: ${message.text} (${new Date(
        message.created_at
      ).toLocaleTimeString()})`;
      messagesDiv.appendChild(p);
    })
    .subscribe();
}
