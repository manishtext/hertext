/* ==========================================================================
   1. GREETINGS SYSTEM (State & DOM Verified)
   ========================================================================== */
function initializeGreeting() {
  const greetingElement = document.getElementById('dynamic-greeting');
  if (!greetingElement) return;

  const currentHour = new Date().getHours();
  let baseGreeting = "";

  if (currentHour >= 5 && currentHour < 12) {
    baseGreeting = "Good morning have a great day";
  } else if (currentHour >= 12 && currentHour < 17) {
    baseGreeting = "Good afternoon";
  } else if (currentHour >= 17 && currentHour < 20) {
    baseGreeting = "Good evening";
  } else {
    baseGreeting = "Good night sweet dreams";
  }

  const suffixes = [
    "madam",
    "madam jii",
    "Nandini",
    "Chamali",
    "Puchki"
  ];

  const randomIndex = Math.floor(Math.random() * suffixes.length);
  const selectedSuffix = suffixes[randomIndex];
  const fullGreeting = `${baseGreeting}, ${selectedSuffix}.`;

  // Wipe structural layout safely
  greetingElement.innerHTML = ''; 
  
  // Build safe sequential text spans
  fullGreeting.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.innerHTML = char === ' ' ? '&nbsp;' : char; 
    span.style.setProperty('--char-index', index);
    greetingElement.appendChild(span);
  });
}

// Android Webview Lifecycle Check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGreeting);
} else {
  initializeGreeting();
}

/* ==========================================================================
   2. CONFIG — Supabase Infrastructure
   ========================================================================== */
const SUPABASE_URL = "https://tgeptljiuzblfiimdcqz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EArJiryLI_hrBBjM0w6xhQ_Z3f9pOuM";
const MESSAGES_TABLE = "messages";       
const STORAGE_BUCKET = "reply-photos";   

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ==========================================================================
   3. ELEMENT REFERENCES & LOCAL STORAGE
   ========================================================================== */
const terminal = document.getElementById('feedback-terminal');
const underlineTrack = document.getElementById('underline-track');
const textInput = document.getElementById('reply-text');
const photoInput = document.getElementById('reply-photo');
const photoLabel = document.getElementById('photo-label');
const sendButton = document.getElementById('send-button');
const sendingIndicator = document.getElementById('sending-indicator');

const DEFAULT_PHOTO_LABEL = '+ Add photo';
let isSending = false;

// Safe retrieval of local drafts
const savedDraft = localStorage.getItem('manish_draft');
if (savedDraft && textInput) {
  textInput.value = savedDraft;
  textInput.style.height = 'auto';
  textInput.style.height = `${textInput.scrollHeight}px`;
}

/* ==========================================================================
   4. INTERACTIVE ACTIONS & STATE HANDLING
   ========================================================================== */
if (textInput && underlineTrack) {
  textInput.addEventListener('focus', () => underlineTrack.classList.add('is-focused'));
  textInput.addEventListener('blur', () => underlineTrack.classList.remove('is-focused'));

  // Create a timer variable outside the event listener
  let typingTimer; 

  textInput.addEventListener('input', () => {
    // 1. Offload the heavy height recalculation to the browser's next animation frame
    window.requestAnimationFrame(() => {
      textInput.style.height = 'auto';
      textInput.style.height = `${textInput.scrollHeight}px`;
    });
    
    // 2. Debounce localStorage: wait until the user pauses typing for 300ms before saving
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      localStorage.setItem('manish_draft', textInput.value);
    }, 300);
  });
}


if (photoInput && photoLabel) {
  photoInput.addEventListener('change', () => {
    const file = photoInput.files && photoInput.files[0];
    photoLabel.textContent = file ? '1 photo ready' : DEFAULT_PHOTO_LABEL;
  });
}

/* ==========================================================================
   5. DATA TRANSMISSION PIPELINE
   ========================================================================== */
function setTransmitting(active) {
  isSending = active;
  if (sendButton) sendButton.disabled = active;
  
  if (active && sendingIndicator) {
    sendingIndicator.textContent = 'Sending\u2026';
    sendingIndicator.classList.remove('success');
    sendingIndicator.classList.add('active');
  } else if (sendingIndicator) {
    sendingIndicator.classList.remove('active');
  }
}

function showSuccessAndReset() {
  if (!sendingIndicator || !terminal || !textInput || !photoInput || !photoLabel) return;

  sendingIndicator.textContent = 'Sent.';
  sendingIndicator.classList.remove('active'); 
  sendingIndicator.classList.add('success');   

  window.setTimeout(() => {
    // 1. Trigger the smooth text vanish animation
    textInput.classList.add('vanish');
    
    // 2. Trigger the terminal's overall fade out
    terminal.classList.add('is-clearing');

    // 3. Wait 300ms for both CSS animations to finish
    window.setTimeout(() => {
      textInput.value = '';
      textInput.style.height = 'auto';
      
      // 4. Remove the vanish class so it's ready for the next time
      textInput.classList.remove('vanish'); 
      
      localStorage.removeItem('manish_draft'); 
      photoInput.value = '';
      photoLabel.textContent = DEFAULT_PHOTO_LABEL;
      setTransmitting(false);
      sendingIndicator.classList.remove('success'); 
      terminal.classList.remove('is-clearing');
    }, 300); // Matches the 300ms CSS transition
  }, 1500); 
}


async function sendReply() {
  if (isSending || !textInput || !photoInput) return;

  const text = textInput.value.trim();
  const file = photoInput.files && photoInput.files[0];

  if (!text && !file) return;

  setTransmitting(true);

  try {
    let imageUrl = null;

    if (file) {
      const path = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabaseClient
      .from(MESSAGES_TABLE)
      .insert([{ content: text || null, image_url: imageUrl }]);

    if (insertError) throw insertError;

    showSuccessAndReset();
  } catch (err) {
    console.error('Transmission fault encountered:', err);
    setTransmitting(false);
  }
}

if (sendButton) {
  // 1. Intercept mouse clicks (Desktop/Android fallback) to keep focus on the input
  sendButton.addEventListener('mousedown', function(event) {
    event.preventDefault();
  });

  // 2. Intercept screen taps (iOS/Mobile) to stop the keyboard from hiding
  sendButton.addEventListener('touchstart', function(event) {
    event.preventDefault(); // This specifically stops the focus shift
    sendReply(); // Manually trigger the send function
  });

  // 3. Keep the normal click listener active for desktop users
  sendButton.addEventListener('click', sendReply);
}


/* ==========================================================================
   6. APP VISIBILITY MONITOR
   ========================================================================== */
let lastLeaveTime = Date.now();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    lastLeaveTime = Date.now();
  } else if (document.visibilityState === 'visible') {
    const timeAway = Date.now() - lastLeaveTime;
    if (timeAway > 600000) { 
      window.location.reload(true);
    }
  }
});
