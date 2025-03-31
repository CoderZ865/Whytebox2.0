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

  `;

  const [geminiApiKey, setGeminiApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || ''); // Load from .env
  const [pdfTextContent, setPdfTextContent] = useState(initialPdfText); // Initialize with the provided PDF text
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi there! I'm Whyte, You can ask me questions about the Mobilenet V1." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const chatEndRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleUserInput = (event) => setUserInput(event.target.value);

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
      You are an AI assistant named Whyte. Your task is to answer the user's question based solely on the provided text context below.
      Do not use any external knowledge or information outside of this context.
      If the answer cannot be found within the provided context, clearly state that by saying question is out of context.

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
0
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
    <div style={styles.chatbotContainer}>
      <h2 style={styles.chatbotHeader}>Whyte</h2>

      {errorMessage && <div style={styles.errorDisplay}>{errorMessage}</div>}

      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageBubble,
              ...(msg.sender === 'user' ? styles.userMessage : styles.botMessage),
            }}
          >
            <strong style={styles.senderLabel}>{msg.sender === 'user' ? 'You' : 'Whyte'}:</strong>
            <span style={styles.messageText}>{msg.text}</span>
          </div>
        ))}
        {isLoading && <div style={styles.loadingIndicator}>Whyte is thinking...</div>}
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
          style={styles.sendButton}
          disabled={isLoading || !userInput.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

// --- Updated Styles ---
const styles = {
    chatbotContainer: {
      position: 'fixed',
      bottom: '0',
      right: '0',
      width: '33vw',
      height: '33vh',
      zIndex: 1000,
      border: '1px solid #2a2a3a',
      borderRadius: '12px 12px 0 0',
      backgroundColor: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden',
    },
    chatbotHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 15px',
      background: 'linear-gradient(135deg, #8e9aff, #7a84e8)',
      color: '#121212',
      borderBottom: '1px solid #2a2a3a',
    },
    logo: {
      height: '30px',
      marginRight: '10px',
    },
    headerText: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      margin: 0,
    },
    messagesContainer: {
      flexGrow: 1,
      overflowY: 'auto',
      padding: '10px',
      backgroundColor: '#121212',
    },
    messageBubble: {
      padding: '10px',
      borderRadius: '10px',
      maxWidth: '75%',
      wordWrap: 'break-word',
      marginBottom: '10px',
    },
    userMessage: {
      backgroundColor: '#8e9aff',
      color: '#121212',
      alignSelf: 'flex-end',
    },
    botMessage: {
      backgroundColor: '#262631',
      color: '#e0e0e0',
      alignSelf: 'flex-start',
    },
    senderLabel: {
      fontWeight: 'bold',
      marginBottom: '5px',
      fontSize: '0.85em',
    },
    messageText: {
      fontSize: '0.9em',
    },
    loadingIndicator: {
      textAlign: 'center',
      color: '#8e9aff',
      fontStyle: 'italic',
    },
    inputForm: {
      display: 'flex',
      padding: '10px',
      borderTop: '1px solid #2a2a3a',
      backgroundColor: '#1e1e24',
    },
    inputFieldForm: {
      flexGrow: 1,
      padding: '10px',
      border: '1px solid #3a3a4a',
      borderRadius: '20px',
      marginRight: '10px',
      fontSize: '1em',
      backgroundColor: '#262631',
      color: '#e0e0e0',
    },
    sendButton: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #8e9aff, #7a84e8)',
      color: '#121212',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '1em',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
    },
  };

export default WhyteChatbot;