"use client";
import AIIcon from './AIIcon';
import { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export default function AIAgentPopup() {
  const [showAgent, setShowAgent] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<{ role: string; content: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const recognitionRef = useRef<any>(null);
  // Handle sending typed text
  const sendText = async () => {
    if (!inputText.trim()) return;
    setConversation((prev) => [...prev, { role: 'user', content: inputText }]);
    setLoading(true);
    // Add agriculture context to Gemini API request
    const prompt = `You are an agriculture expert AI agent. Answer agriculture-related questions and provide advice.\nUser: ${inputText}`;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      let answer = response.text;
    if (!answer || answer.trim().toLowerCase() === 'no response.') {
      answer = '__NO_RESPONSE__';
    }
    setConversation((prev) => [...prev, { role: 'agent', content: answer }]);
    } catch (error) {
      setConversation((prev) => [...prev, { role: 'agent', content: '__NO_RESPONSE__' }]);
    }
    setLoading(false);
    setInputText("");
    // Speak answer
    const synth = window.speechSynthesis;
    const utter = new window.SpeechSynthesisUtterance('Sorry, I could not find an answer.');
    utter.lang = 'en-US';
    synth.speak(utter);
  };

  // Start speech recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    setListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setConversation((prev) => [...prev, { role: 'user', content: transcript }]);
      setLoading(true);
      // Use Gemini SDK for answer
      const prompt = `
        You are an expert Agriculture AI Advisor.

        Rules:
        - Answer ONLY agriculture-related questions.
        - Provide practical, real-world farming advice.
        - Keep responses short, clear, and to the point.
        - Use simple language understandable by farmers.
        - Give actionable steps when possible.
        - Avoid unnecessary explanation or long paragraphs.
        - If the question is unrelated to agriculture, politely say you can only answer agriculture topics.

        User Question: ${transcript}

        Respond with a concise and helpful answer.
        `;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        let answer = response.text;
        if (!answer || answer.trim().toLowerCase() === 'no response.') {
          answer = '__NO_RESPONSE__';
        }
        setConversation((prev) => [...prev, { role: 'agent', content: answer }]);
      } catch (error) {
        setConversation((prev) => [...prev, { role: 'agent', content: '__NO_RESPONSE__' }]);
      }
      setLoading(false);
      // Speak answer
      const synth = window.speechSynthesis;
      const utter = new window.SpeechSynthesisUtterance('Sorry, I could not find an answer.');
      utter.lang = 'en-US';
      synth.speak(utter);
      // Restart listening after answer
      utter.onend = () => {
        if (listening) recognition.start();
      };
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    setListening(false);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  return (
    <>
      <AIIcon onClick={() => setShowAgent(true)} />
      {showAgent && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          right: 24,
          width: 400,
          minWidth: 280,
          maxWidth: '98vw',
          maxHeight: '78vh',
          background: 'linear-gradient(135deg, #f7fafc 0%, #e3f2fd 100%)',
          borderRadius: 16,
          boxShadow: '0 2px 18px rgba(0,0,0,0.14)',
          padding: 22,
          zIndex: 1001,
          color: '#1a237e',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s',
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: 6, fontWeight: 700, fontSize: 22 }}>AI Agriculture Agent</h3>
          <button onClick={() => { setShowAgent(false); stopListening(); }} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', fontSize: 22, color: '#1976d2', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          <div style={{ marginTop: 2, marginBottom: 8 }}>
            {!listening ? (
              <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 15px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }} onClick={startListening} disabled={loading}>🎤 Start</button>
            ) : (
              <button style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }} onClick={stopListening}>⏹ Stop Voice</button>
            )}
          </div>
          <div style={{ flex: 1, marginBottom: 12, overflowY: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', padding: '12px 8px' }}>
            {conversation.length === 0 && !loading && (
              <div style={{ color: '#90caf9', textAlign: 'center', fontStyle: 'italic', fontSize: 14 }}>Ask your agriculture question...</div>
            )}
            {conversation.map((msg, idx) => (
              <div key={idx} style={{
                marginBottom: 8,
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '7px 10px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? '#e3f2fd' : '#bbdefb',
                  color: msg.role === 'user' ? '#1976d2' : '#388e3c',
                  fontWeight: msg.role === 'user' ? 600 : 500,
                  fontSize: 14,
                  boxShadow: msg.role === 'user' ? '0 1px 3px rgba(25,118,210,0.07)' : '0 1px 3px rgba(56,142,60,0.07)',
                }}>
                  {msg.role === 'user' ? 'You' : 'Agent'}:<br />
                  {msg.content === '__NO_RESPONSE__' ? (
                    <span style={{ color: '#d32f2f', fontStyle: 'italic', fontWeight: 'bold' }}>Sorry, no answer found.</span>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ color: '#1976d2', textAlign: 'center', fontWeight: 600, fontSize: 14 }}>Thinking...</div>}
          </div>
          <form
            onSubmit={e => { e.preventDefault(); sendText(); }}
            style={{ display: 'flex', gap: 6, marginTop: 0 }}
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type your question..."
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #e3f2fd', fontSize: 15, background: '#f7fafc', fontWeight: 500 }}
              disabled={loading}
            />
            <button
              type="submit"
              style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: 15 }}
              disabled={loading || !inputText.trim()}
            >Send</button>
          </form>
        </div>
      )}
    </>
  );
}
