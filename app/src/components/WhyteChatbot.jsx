import React, { useState, useRef, useEffect } from 'react';

// --- Component: Whyte (Using Google Gemini API) ---
const WhyteChatbot = () => {
  const initialPdfText = `

### *1. Introduction to MobileNet V1*  
MobileNet V1 is a lightweight convolutional neural network (CNN) architecture designed for *resource-constrained environments, such as mobile and embedded vision applications. Introduced by Howard et al. in 2017, it prioritizes computational efficiency while maintaining competitive accuracy. Unlike traditional CNNs, MobileNet V1 employs **depthwise separable convolutions*, a novel approach that drastically reduces model complexity and inference time[^8].  

---

### *2. Core Architectural Components*  

#### *2.1 Depthwise Separable Convolution*  
The defining feature of MobileNet V1 is its replacement of standard convolutional layers with *depthwise separable convolutions*. This operation decouples spatial filtering (depthwise convolution) from channel-wise feature combination (pointwise convolution):  

$$  
\text{Depthwise Conv: } \mathbf{Y}{k,i,j} = \sum{m,n} \mathbf{K}{k,m,n} \cdot \mathbf{X}{k, i+m, j+n}  
$$  
$$  
\text{Pointwise Conv: } \mathbf{Z}{l,i,j} = \sum{k} \mathbf{W}{l,k} \cdot \mathbf{Y}{k,i,j}  
$$  

- *Depthwise Convolution*: Applies a single filter per input channel.  
- *Pointwise Convolution*: Combines outputs across channels using 1×1 convolutions.  

This separation reduces computational cost by a factor of $$ \frac{1}{N} + \frac{1}{D_k^2} $$, where $$ N $$ is the number of output channels and $$ D_k $$ is the kernel size[^8].  

#### *2.2 Layer Structure*  
MobileNet V1 consists of *28 layers*, including:  
- *Initial Full Convolution*: A 3×3 standard convolution for preliminary feature extraction.  
- *13 Depthwise Separable Blocks*: Each block contains a depthwise convolution, batch normalization, ReLU6 activation, and pointwise convolution.  
- *Global Average Pooling*: Reduces spatial dimensions before the final fully connected layer.  

#### *2.3 Hyperparameters*  
- *Width Multiplier ($$ \alpha $$)*: Scales the number of channels in each layer (default: 1.0).  
- *Resolution Multiplier ($$ \rho $$)*: Adjusts input image resolution (default: 224×224).  

---

### *3. Efficiency vs. Traditional CNNs*  

| *Metric*               | *MobileNet V1* | *Standard CNN* |  
|--------------------------|-------------------|-------------------|  
| Parameters               | 4.2 million       | 25–50 million     |  
| Multiply-Adds (FLOPS)    | 569 million       | 3,500 million     |  
| Top-1 Accuracy (ImageNet)| 70.6%             | 75–80%            |  

*Trade-offs*:  
- *Speed: MobileNet V1 achieves **8–9× faster inference* than VGG-16[^8].  
- *Accuracy*: Sacrifices ~5% accuracy for efficiency, suitable for real-time applications.  

---

### *4. Applications in Practice*  
MobileNet V1’s efficiency enables deployment in:  
1. *Medical Imaging*: Real-time analysis of X-rays and MRIs on edge devices[^8].  
2. *Autonomous Systems*: Object detection in drones with limited compute power.  
3. *Facial Recognition*: Low-latency authentication on smartphones.  

---

### *5. Limitations and Mitigations*  
| *Limitation*               | *Mitigation*                     |  
|-------------------------------|-------------------------------------|  
| Reduced accuracy on fine-grained tasks | Use transfer learning with domain-specific datasets. |  
| Limited capacity for large-scale data | Integrate width/resolution multipliers ($$ \alpha = 1.4, \rho = 0.75 $$). |  

---

### *6. Code Implementation*  
python  
from tensorflow.keras.applications import MobileNet  

model = MobileNet(  
    input_shape=(224, 224, 3),  
    alpha=1.0,  # Width multiplier  
    depth_multiplier=1,  
    dropout=0.001,  
    include_top=True,  
    weights='imagenet'  
)  


MobileNet V1 revolutionized mobile vision tasks by balancing accuracy and efficiency through *depthwise separable convolutions*. Its architectural simplicity and scalability make it a cornerstone for edge AI applications.  

### *7. WhyteBox Visualization Features*

#### *Layer Visualizer Page*
The Layer Visualizer Page provides an interactive 3D visualization of the MobileNet V1 neural network architecture. Key features include:

- *Interactive 3D Model*: Users can rotate, zoom, and explore the full network structure in three dimensions.
- *Layer Inspection*: Clicking on any layer displays detailed information about its parameters, dimensions, and function.
- *Activation Visualization*: Shows how neurons activate in response to different input images.
- *Layer-by-layer Exploration*: Users can see the transformation of data as it flows through the network.

#### *Explainable AI Page*
The Explainable AI Page helps users understand how and why the model makes specific predictions through various visualization techniques:

- *Grad-CAM*: Highlights regions of an image that strongly influence the model's prediction using gradients flowing into the final convolutional layer.
- *Saliency Maps*: Shows which pixels most affect the prediction by computing gradients of the output with respect to the input.
- *Integrated Gradients*: Attributes predictions to input features by accumulating gradients along a path from a baseline to the input.
- *LIME*: Creates an interpretable model locally around the prediction to show which features contribute most.
- *SHAP*: Uses a game theoretic approach to fairly distribute feature importance values.

These visualization tools help users understand the internal working of neural networks, making AI more transparent and interpretable.

  `;

  const [geminiApiKey, setGeminiApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || ''); // Load from .env
  const [pdfTextContent, setPdfTextContent] = useState(initialPdfText); // Initialize with the provided PDF text
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi there! I'm Whyte, You can ask me questions about the Mobilenet V1." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [minimized, setMinimized] = useState(false);
  const chatEndRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserInput = (event) => setUserInput(event.target.value);

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmedInput = userInput.trim();

    if (!trimmedInput) return;

    if (!geminiApiKey) {
      setErrorMessage('Error: Google AI API Key is missing. Please provide a valid API key.');
      return;
    }
    if (!pdfTextContent) {
      setErrorMessage('Error: PDF text content is missing.');
      return;
    }
    setErrorMessage('');

    setMessages(prev => [...prev, { sender: 'user', text: trimmedInput }]);
    setUserInput('');
    setIsLoading(true);

    const prompt = `
      You are an AI assistant named Whyte for the WhyteBox application. Your task is to answer the user's question based solely on the provided text context below.
      Do not use any external knowledge or information outside of this context.
      If the answer cannot be found within the provided context, clearly state that the information is not available in your knowledge base.
      
      When users ask about visualization pages, neural network visualization, or anything related to the visualization features,
      provide detailed explanations from section 7 of your knowledge base about the Layer Visualizer Page and Explainable AI Page.
      
      Make your answers conversational, helpful, and concise.

      --- Context Start ---
      ${pdfTextContent}
      --- Context End ---

      User Question: ${trimmedInput}

      Answer:
    `;

    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }, // User's question
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google API Error (${response.status}): ${errorData.error?.message || 'Unknown API error'}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (botReply) {
        setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I could not generate a response. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chatbot Error:', error);
      setErrorMessage(`Error: ${error.message}`);
      setMessages(prev => [...prev, { sender: 'bot', text: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={minimized ? {...styles.chatbotContainer, ...styles.minimized} : styles.chatbotContainer}>
      <div style={styles.chatbotHeader} onClick={toggleMinimize}>
        <div style={styles.headerContent}>
          <div style={styles.avatarContainer}>
            <span style={styles.avatarText}>W</span>
          </div>
          <h2 style={styles.headerText}>Whyte</h2>
        </div>
        <button style={styles.minimizeButton}>
          {minimized ? '↑' : '↓'}
        </button>
      </div>

      {!minimized && (
        <>
          {errorMessage && <div style={styles.errorDisplay}>{errorMessage}</div>}

          <div style={styles.messagesContainer}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '12px',
                  width: '100%',
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={styles.botAvatar}>
                    <span style={styles.botAvatarText}>W</span>
                  </div>
                )}
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(msg.sender === 'user' ? styles.userMessage : styles.botMessage),
                  }}
                >
                  <span style={styles.messageText}>{msg.text}</span>
                </div>
                {msg.sender === 'user' && (
                  <div style={styles.userAvatar}>
                    <span style={styles.userAvatarText}>U</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={styles.loadingContainer}>
                <div style={styles.typingIndicator}>
                  <span style={styles.typingDot}></span>
                  <span style={styles.typingDot}></span>
                  <span style={styles.typingDot}></span>
                </div>
                <div style={styles.loadingText}>Whyte is thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={sendMessage} style={styles.inputForm}>
            <input
              type="text"
              value={userInput}
              onChange={handleUserInput}
              placeholder="Ask about the Mobilenet V1..."
              style={styles.inputFieldForm}
              disabled={isLoading}
            />
            <button
              type="submit"
              style={{
                ...styles.sendButton,
                ...(isLoading || !userInput.trim() ? styles.sendButtonDisabled : {})
              }}
              disabled={isLoading || !userInput.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
};

// --- Enhanced Styles ---
const styles = {
  chatbotContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '360px',
    height: '500px',
    zIndex: 1000,
    border: '1px solid rgba(142, 154, 255, 0.2)',
    borderRadius: '16px',
    backgroundColor: '#121218',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(142, 154, 255, 0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  minimized: {
    height: '60px',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(142, 154, 255, 0.1)',
  },
  chatbotHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #1e1e28, #262631)',
    borderBottom: '1px solid rgba(142, 154, 255, 0.1)',
    cursor: 'pointer',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
  },
  avatarContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8e9aff, #7a84e8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    boxShadow: '0 2px 10px rgba(142, 154, 255, 0.3)',
  },
  avatarText: {
    color: '#121218',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  headerText: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    color: '#ffffff',
  },
  minimizeButton: {
    background: 'none',
    border: 'none',
    color: '#8e9aff',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#121218',
    display: 'flex',
    flexDirection: 'column',
    scrollbarWidth: 'thin',
    scrollbarColor: '#2a2a3a #121218',
  },
  botAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#8e9aff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    flexShrink: 0,
  },
  botAvatarText: {
    color: '#121218',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#2a2a3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '8px',
    flexShrink: 0,
  },
  userAvatarText: {
    color: '#e0e0e0',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  messageBubble: {
    padding: '12px 16px',
    borderRadius: '18px',
    maxWidth: '70%',
    wordWrap: 'break-word',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  userMessage: {
    backgroundColor: '#8e9aff',
    color: '#121218',
    borderBottomRightRadius: '4px',
  },
  botMessage: {
    backgroundColor: '#1e1e28',
    color: '#e0e0e0',
    borderBottomLeftRadius: '4px',
  },
  messageText: {
    whiteSpace: 'pre-wrap',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  typingIndicator: {
    display: 'flex',
    backgroundColor: '#1e1e28',
    padding: '12px 16px',
    borderRadius: '18px',
    borderBottomLeftRadius: '4px',
  },
  typingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#8e9aff',
    margin: '0 2px',
    display: 'inline-block',
    animation: '1.4s typingAnimation ease-in-out infinite',
    animationDelay: 'calc(var(--index) * 0.2s)',
  },
  loadingText: {
    color: '#8e9aff',
    fontSize: '12px',
    marginTop: '4px',
    marginLeft: '12px',
  },
  errorDisplay: {
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    borderRadius: '4px',
    color: '#ff5555',
    margin: '8px 16px',
    fontSize: '13px',
  },
  inputForm: {
    display: 'flex',
    padding: '12px 16px',
    borderTop: '1px solid rgba(142, 154, 255, 0.1)',
    backgroundColor: '#1a1a24',
  },
  inputFieldForm: {
    flexGrow: 1,
    padding: '12px 16px',
    border: '1px solid rgba(142, 154, 255, 0.2)',
    borderRadius: '24px',
    marginRight: '10px',
    fontSize: '14px',
    backgroundColor: '#262631',
    color: '#e0e0e0',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  sendButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #8e9aff, #7a84e8)',
    color: '#121218',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(142, 154, 255, 0.3)',
  },
  sendButtonDisabled: {
    background: '#3c3c48',
    boxShadow: 'none',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
};

// Add CSS animation for typing dots
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes typingAnimation {
    0%, 100% { transform: translateY(0px); opacity: 0.5; }
    50% { transform: translateY(-4px); opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

// Apply animation delay to each dot
document.querySelectorAll('.typingDot').forEach((dot, index) => {
  dot.style.setProperty('--index', index);
});

export default WhyteChatbot;