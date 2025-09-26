import { AssistantResponse, Message } from "./types";
import { generateId } from "./utils";

// Mock responses for the assistant
const ASSISTANT_RESPONSES = {
  en: [
    "Hello! How can I help you today?",
    "That's an interesting question. Let me think about that.",
    "I understand what you're asking. Here's what I think...",
    "Thanks for sharing that with me. I appreciate your perspective.",
    "That's a great point. I'd like to add that...",
    "I see what you mean. Let me provide some insights on this topic.",
    "That's an excellent question! Here's my take on it...",
    "I appreciate you bringing this up. Let me help clarify that for you.",
    "Interesting! I've learned something new from your message.",
    "Thank you for the detailed explanation. I find this topic fascinating.",
  ],
  ar: [
    "مرحباً! كيف يمكنني مساعدتك اليوم؟",
    "هذا سؤال مثير للاهتمام. دعني أفكر في ذلك.",
    "أفهم ما تسأل عنه. إليك ما أعتقده...",
    "شكراً لك على مشاركة ذلك معي. أقدر وجهة نظرك.",
    "هذه نقطة رائعة. أود أن أضيف أن...",
    "أرى ما تعنيه. دعني أقدم بعض الرؤى حول هذا الموضوع.",
    "هذا سؤال ممتاز! إليك رأيي في الأمر...",
    "أقدر طرحك لهذا الموضوع. دعني أساعد في توضيح ذلك لك.",
    "مثير للاهتمام! لقد تعلمت شيئاً جديداً من رسالتك.",
    "شكراً لك على الشرح المفصل. أجد هذا الموضوع رائعاً.",
  ],
};

// File-specific responses
const FILE_RESPONSES = {
  en: {
    image:
      "I can see the image you've shared! It looks interesting. What would you like to know about it?",
    audio:
      "I received your audio message. Unfortunately, I can't process audio files yet, but I appreciate you sharing it with me!",
    document:
      "Thanks for sharing this document. I can see the file, though I can't read its contents directly. What would you like to discuss about it?",
  },
  ar: {
    image:
      "أستطيع رؤية الصورة التي شاركتها! تبدو مثيرة للاهتمام. ماذا تريد أن تعرف عنها؟",
    audio:
      "استلمت رسالتك الصوتية. للأسف، لا يمكنني معالجة الملفات الصوتية حتى الآن، لكنني أقدر مشاركتها معي!",
    document:
      "شكراً لك على مشاركة هذا المستند. أستطيع رؤية الملف، رغم أنني لا أستطيع قراءة محتواه مباشرة. ماذا تريد أن نناقش حوله؟",
  },
};

// Greeting responses
const GREETING_RESPONSES = {
  en: [
    "Hello! Welcome to our chat assistant. How may I help you today?",
    "Hi there! I'm your AI assistant. What can I do for you?",
    "Greetings! I'm here to help. What would you like to discuss?",
    "Welcome! I'm ready to assist you. How can I be of service?",
  ],
  ar: [
    "مرحباً! أهلاً بك في مساعد الدردشة. كيف يمكنني مساعدتك اليوم؟",
    "أهلاً! أنا مساعدك الذكي. ماذا يمكنني أن أفعل من أجلك؟",
    "مرحباً بك! أنا هنا للمساعدة. ماذا تريد أن نناقش؟",
    "أهلاً وسهلاً! أنا مستعد لمساعدتك. كيف يمكنني خدمتك؟",
  ],
};

// Simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate assistant response based on user message
export async function generateAssistantResponse(
  userMessage: Message,
  language: "en" | "ar" = "en",
  isFirstMessage: boolean = false
): Promise<AssistantResponse> {
  // Simulate thinking time (1.5-3 seconds)
  const thinkingTime = Math.random() * 1500 + 1500;
  await delay(thinkingTime);

  // Safely read user text from either .text or .content (for backward compatibility)
  const userText: string =
    (userMessage as any)?.text ?? (userMessage as any)?.content ?? "";

  let content: string;

  // First message gets a greeting
  if (isFirstMessage) {
    const greetings = GREETING_RESPONSES[language];
    content = greetings[Math.floor(Math.random() * greetings.length)];
  }
  // Handle messages with attachments
  else if (userMessage.attachments && userMessage.attachments.length > 0) {
    const attachmentType = userMessage.attachments[0]
      .type as keyof (typeof FILE_RESPONSES)["en"];
    content = FILE_RESPONSES[language][attachmentType];

    // Add comment about the text if there's also text content
    if (typeof userText === "string" && userText.trim()) {
      const textComment =
        language === "en"
          ? ` Also, regarding your message: "${userText}" - I find that quite interesting!`
          : ` أيضاً، بخصوص رسالتك: "${userText}" - أجد ذلك مثيراً للاهتمام!`;
      content += textComment;
    }
  }
  // Handle text-only messages
  else {
    const responses = ASSISTANT_RESPONSES[language];
    content = responses[Math.floor(Math.random() * responses.length)];

    // Add echo of user message occasionally
    if (
      Math.random() > 0.7 &&
      typeof userText === "string" &&
      userText.length > 10
    ) {
      const echoPrefix =
        language === "en" ? ' You mentioned: "' : ' لقد ذكرت: "';
      const echoSuffix =
        language === "en"
          ? "\". That's worth considering."
          : '". هذا يستحق التفكير.';
      content += echoPrefix + userText + echoSuffix;
    }
  }

  return {
    content,
    delay: thinkingTime,
  };
}

// Generate conversation title based on first user message
export function generateConversationTitle(
  firstMessage: string,
  language: "en" | "ar" = "en"
): string {
  const maxLength = 30;
  let title = firstMessage.trim();

  // Remove common starting words
  const commonStarts =
    language === "en"
      ? [
          "hello",
          "hi",
          "hey",
          "can you",
          "could you",
          "please",
          "i want",
          "i need",
        ]
      : [
          "مرحبا",
          "أهلا",
          "مرحباً",
          "أهلاً",
          "هل يمكنك",
          "هل يمكن",
          "من فضلك",
          "أريد",
          "أحتاج",
        ];

  commonStarts.forEach((start) => {
    const regex = new RegExp(`^${start}\\s+`, "i");
    title = title.replace(regex, "");
  });

  // Truncate if too long
  if (title.length > maxLength) {
    title = title.substring(0, maxLength).trim() + "...";
  }

  // Fallback titles
  if (title.length < 3) {
    title = language === "en" ? "New conversation" : "محادثة جديدة";
  }

  return title;
}

// Simulate error scenarios for testing
export async function simulateError(
  errorType: "network" | "timeout" | "server"
): Promise<never> {
  const errorMessages = {
    network: {
      en: "Network connection failed. Please check your internet connection.",
      ar: "فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.",
    },
    timeout: {
      en: "Request timed out. The assistant is taking longer than expected to respond.",
      ar: "انتهت مهلة الطلب. يستغرق المساعد وقتاً أطول من المتوقع للرد.",
    },
    server: {
      en: "Server error occurred. Please try again later.",
      ar: "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.",
    },
  };

  // Simulate network delay before error
  await delay(Math.random() * 2000 + 1000);

  throw new Error(errorMessages[errorType].en);
}

// Get random motivational message for empty state
export function getEmptyStateMessage(language: "en" | "ar" = "en"): string {
  const messages = {
    en: [
      "Start a conversation by typing a message below!",
      "I'm here to help. What's on your mind?",
      "Feel free to ask me anything or share your thoughts.",
      "Ready to chat! Send me a message to get started.",
    ],
    ar: [
      "ابدأ محادثة عن طريق كتابة رسالة أدناه!",
      "أنا هنا للمساعدة. بماذا تفكر؟",
      "لا تتردد في سؤالي عن أي شيء أو مشاركة أفكارك.",
      "مستعد للدردشة! أرسل لي رسالة لنبدأ.",
    ],
  };

  const messageList = messages[language];
  return messageList[Math.floor(Math.random() * messageList.length)];
}
