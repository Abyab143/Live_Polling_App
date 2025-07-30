import { useState } from "react";

const useChatOverlay = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return {
    isChatOpen,
    openChat,
    closeChat,
    toggleChat,
  };
};

export default useChatOverlay;
