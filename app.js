/* ==========================================================================
   CONFIG — fill these in from your Supabase project
   (Project Settings -> API in the Supabase dashboard)
   ========================================================================== */
const SUPABASE_URL = "https://tgeptljiuzblfiimdcqz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EArJiryLI_hrBBjM0w6xhQ_Z3f9pOuM";
const MESSAGES_TABLE = "messages";       // table: id, created_at, content, image_url
const STORAGE_BUCKET = "reply-photos";   // public storage bucket

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ==========================================================================
   ELEMENT REFERENCES
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

/* ==========================================================================
   THE INTERACTIVE FIELD STATE — ink underline grows on focus
   ========================================================================== */
textInput.addEventListener('focus', () => underlineTrack.classList.add('is-focused'));
textInput.addEventListener('blur', () => underlineTrack.classList.remove('is-focused'));

/* Let the textarea grow with content instead of scrolling immediately */
textInput.addEventListener('input', () => {
  textInput.style.height = 'auto';
  textInput.style.height = `${textInput.scrollHeight}px`;
});

/* ==========================================================================
   PHOTO SELECTION
   ========================================================================== */
photoInput.addEventListener('change', () => {
  const file = photoInput.files && photoInput.files[0];
  photoLabel.textContent = file ? '1 photo ready' : DEFAULT_PHOTO_LABEL;
});

/* ==========================================================================
   TRANSMISSION STATE
   ========================================================================== */
function setTransmitting(active) {
  isSending = active;
  sendingIndicator.classList.toggle('active', active);
  sendButton.disabled = active;
}

/* Gentle wipe: fade the terminal down, clear it, fade back up */
function resetTerminalGently() {
  terminal.classList.add('is-clearing');

  window.setTimeout(() => {
    textInput.value = '';
    textInput.style.height = 'auto';
    photoInput.value = '';
    photoLabel.textContent = DEFAULT_PHOTO_LABEL;
    setTransmitting(false);
    terminal.classList.remove('is-clearing');
  }, 260);
}

/* ==========================================================================
   SEND — upload photo (if any), insert row, wipe gently on confirmed success
   ========================================================================== */
async function sendReply() {
  if (isSending) return;

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

    // Confirmed delivery: wipe, gently.
    resetTerminalGently();
  } catch (err) {
    // Log a flattened, readable form — mobile/webview consoles often just
    // print "[object Object]" for a raw error, hiding the actual reason.
    console.error('Reply did not send:', {
      message: err && err.message,
      details: err && err.details,
      hint: err && err.hint,
      code: err && err.code,
      status: err && err.status,
      raw: JSON.stringify(err),
    });
    // Leave her draft in place on failure so nothing is lost silently.
    setTransmitting(false);
  }
}

sendButton.addEventListener('click', sendReply);

/* ==========================================================================
   TYPEWRITER REVEAL — once a letter card lands, its body text types itself
   out. Words stay intact as text nodes (so wrapping is untouched); only the
   letters inside each word become individually-timed spans. Skipped entirely
   under prefers-reduced-motion, since .letter-entry never fires its drop
   animation in that case (see the reduced-motion block in styles.css).
   ========================================================================== */
   
  
  
   
   
/* function typeInEntryBody(bodyEl) {
  const text = bodyEl.textContent;
  const perCharDelay = 14; // ms between each letter's fade-up starting

  bodyEl.textContent = '';
  let charIndex = 0;

  text.split(/(\s+)/).forEach((token) => {
    if (/^\s+$/.test(token)) {
      bodyEl.appendChild(document.createTextNode(token));
      return;
    }
    for (const ch of token) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.animationDelay = `${charIndex * perCharDelay}ms`;
      bodyEl.appendChild(span);
      charIndex += 1;
    }
  });
}

document.querySelectorAll('.letter-entry').forEach((card) => {
  card.addEventListener('animationend', function onDrop(event) {
    if (event.target !== card || event.animationName !== 'soft-reveal') return;
    card.removeEventListener('animationend', onDrop);
    card.querySelectorAll('.entry-body').forEach(typeInEntryBody);
  });
}); */





    






/* Greetings */

document.addEventListener('DOMContentLoaded', () => {
  const greetingElement = document.getElementById('dynamicGreeting');
  
  if (!greetingElement) return;

  // 1. Get the current hour from the user's local system time
  const currentHour = new Date().getHours();
  let baseGreeting = "";

  // 2. Define time brackets
  if (currentHour >= 5 && currentHour < 12) {
    baseGreeting = "Good morning have a great day";
  } else if (currentHour >= 12 && currentHour < 17) {
    baseGreeting = "Good afternoon";
  } else if (currentHour >= 17 && currentHour < 20) {
    baseGreeting = "Good evening";
  } else {
    baseGreeting = "Good night sweet dreams";
  }

  // 3. Your custom list of random variations
  const suffixes = [
    "madam",
    "madam jii",
    "Nandini",
    "Chamali",
    "Puchki"
  ];

  // 4. Mathematical random index picker
  const randomIndex = Math.floor(Math.random() * suffixes.length);
  const selectedSuffix = suffixes[randomIndex];

  // 5. Build and inject the string
  greetingElement.textContent = `${baseGreeting}, ${selectedSuffix}.`;
});


/*  */
