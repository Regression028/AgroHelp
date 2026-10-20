import React from "react";

export default function AIIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "linear-gradient(135deg, #4F8CFF 0%, #00C6FF 100%)",
        borderRadius: "50%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        width: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        zIndex: 1000,
        transition: "background 0.3s",
      }}
      aria-label="AI Agent"
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="url(#ai-gradient)" />
        <defs>
          <linearGradient id="ai-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F8CFF" />
            <stop offset="1" stopColor="#00C6FF" />
          </linearGradient>
        </defs>
        <text x="16" y="21" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">
          AI
        </text>
      </svg>
    </button>
  );
}
