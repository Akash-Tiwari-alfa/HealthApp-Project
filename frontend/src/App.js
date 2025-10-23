import React, { useState, useEffect } from 'react';
import { 
  User, 
  Heart, 
  ClipboardList, 
  CalendarDays, 
  MessageSquare, 
  Brain, 
  Save, 
  Send,
  Loader2,
  LogOut,
  Key,
  AtSign,
  Check,
  ChevronRight,
  Sun,
  Moon,
  Wind
} from 'lucide-react';

// Base URL for your backend server (running on port 5000)
const API_URL = 'http://localhost:5001/api';

// --- Main App Component ---
// This component manages if you are logged in or not
export default function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, check if we are already logged in from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('authUserId');
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  // This function is passed to the login page
  const handleLogin = (newToken, newUserId) => {
    setToken(newToken);
    setUserId(newUserId);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUserId', newUserId);
  };

  // This function logs the user out
  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserId');
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  // If we have no token, show Login page.
  // If we have a token, show the Main Application.
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {!token ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <MainApp token={token} userId={userId} onLogout={handleLogout} />
      )}
    </div>
  );
}

// --- Authentication Page (Login/Register) ---
// This is the first page the user sees
const AuthPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const clearMessage = () => setMessage({ type: '', text: '' });

  // This function calls your backend's /register or /login endpoints
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessage();
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'An error occurred.');
      
      if (isRegistering) {
        // If they just registered, show a success message
        setMessage({ type: 'success', text: 'Registration successful! Please log in.' });
        setIsRegistering(false);
      } else {
        // If they just logged in, call handleLogin (from App)
        onLogin(data.token, data.userId);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          {isRegistering ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        {message.text && (
          <div className={`p-3 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>{message.text}</div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); clearMessage(); }} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); clearMessage(); }} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <PrimaryButton type="submit" isLoading={isLoading} fullWidth>
            {isRegistering ? 'Register' : 'Log In'}
          </PrimaryButton>
        </form>
        <p className="text-sm text-center text-gray-600">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => { setIsRegistering(!isRegistering); clearMessage(); }} className="font-medium text-blue-600 hover:text-blue-500 ml-1">
            {isRegistering ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- Main Application (After Login) ---
// This holds the sidebar and main content
const MainApp = ({ token, userId, onLogout }) => {
  const [page, setPage] = useState('profile'); // Current page
  const [userProfile, setUserProfile] = useState(null); // Holds all user data
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // When the app loads, fetch the user's profile from the backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      setIsLoadingProfile(true);
      try {
        const response = await fetch(`${API_URL}/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setUserProfile(data); // Save the whole user object
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.message.includes('401') || error.message.includes('403')) {
          onLogout(); // Log out if token is bad
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchUserProfile();
  }, [token, onLogout]);

  // This function lets child pages update the main profile state
  const handleProfileUpdate = (updatedUser) => {
    setUserProfile(updatedUser);
  };

  // Simple "router" to show the correct page component
  const renderPage = () => {
    if (isLoadingProfile) {
      return <LoadingSpinner text="Loading your profile..." />;
    }

    if (!userProfile) {
      return <div className="text-red-600">Could not load user profile.</div>;
    }

    switch (page) {
      case 'profile':
        return <UserProfile token={token} userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
      case 'analysis':
        return <PrakritiAnalysis token={token} userProfile={userProfile} onAnalysisComplete={handleProfileUpdate} />;
      case 'diet':
        return <DietChart analysisResult={userProfile.analysisResult} />;
      case 'routine':
        return <DailyRoutine analysisResult={userProfile.analysisResult} />;
      case 'followups':
        return <Followups token={token} />;
      default:
        return <UserProfile token={token} userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar setPage={setPage} currentPage={page} userId={userId} onLogout={onLogout} />
      <main className="flex-1 p-6 md:p-10">
        {renderPage()}
      </main>
    </div>
  );
};

// --- Reusable UI Components ---

const LoadingSpinner = ({ fullScreen = false, text = "Loading..." }) => (
  <div className={`flex items-center justify-center w-full ${fullScreen ? 'min-h-screen' : 'h-full'}`}>
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    <p className="ml-4 text-lg text-gray-700">{text}</p>
  </div>
);

const Sidebar = ({ setPage, currentPage, userId, onLogout }) => {
  const navItems = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'analysis', label: 'Prakriti Analysis', icon: Brain },
    { id: 'diet', label: 'Diet Chart', icon: ClipboardList },
    { id: 'routine', label: 'Daily Routine', icon: CalendarDays },
    { id: 'followups', label: 'Follow-ups', icon: MessageSquare },
  ];

  return (
    <nav className="w-full md:w-64 bg-white shadow-md md:min-h-screen p-4 flex flex-col">
      <div>
        <div className="flex items-center mb-6 p-2">
          <Heart className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold ml-2 text-gray-800">Health AI</h1>
        </div>
        {userId && (
          <div className="mb-4 p-2 bg-gray-100 rounded-lg">
            <span className="text-xs font-medium text-gray-500 block">Your User ID:</span>
            <span className="text-xs text-gray-700 break-all">{userId}</span>
          </div>
        )}
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setPage(item.id)}
                className={`flex items-center w-full text-left p-3 my-1 rounded-lg transition-all duration-200 ${currentPage === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center w-full text-left p-3 my-1 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-100 hover:text-red-700"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </nav>
  );
};

const Card = ({ title, icon, children }) => (
  <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
    <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
      {icon}
      <h2 className="text-xl font-semibold text-gray-800 ml-3">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InputField = ({ label, id, type = 'text', value, onChange, placeholder }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} id={id} value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
  </div>
);

const TextAreaField = ({ label, id, value, onChange, placeholder, rows = 4 }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea id={id} value={value || ''} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
  </div>
);

const PrimaryButton = ({ onClick, children, isLoading = false, icon, type = 'button', fullWidth = false, disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={isLoading || disabled}
    className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${isLoading || disabled ? 'opacity-75 cursor-not-allowed' : ''} ${fullWidth ? 'w-full' : ''}`}
  >
    {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (icon && React.cloneElement(icon, { className: "w-5 h-5 mr-2" }))}
    {isLoading ? 'Loading...' : children}
  </button>
);

const Message = ({ type, text }) => {
  if (!text) return null;
  return (
    <div className={`p-3 rounded-md mb-4 text-sm ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>{text}</div>
  );
};

// --- Page Components ---

// --- 1. User Profile Page ---
const UserProfile = ({ token, userProfile, onProfileUpdate }) => {
  const [personal, setPersonal] = useState(userProfile.personal || { name: '', age: '' });
  const [health, setHealth] = useState(userProfile.health || { height: '', weight: '', conditions: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Calls /api/user/profile (POST)
  const handleSave = async () => {
    if (!token) return;
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ personal, health })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save profile.');
      
      onProfileUpdate(data.user); // Update the main app's state
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
      <Message type={message.type} text={message.text} />
      
      <Card title="Personal Details" icon={<User className="w-6 h-6 text-blue-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full Name" id="name" value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} placeholder="e.g., Jane Doe" />
          <InputField label="Age" id="age" type="number" value={personal.age} onChange={(e) => setPersonal({ ...personal, age: e.target.value })} placeholder="e.g., 30" />
        </div>
      </Card>
      
      <Card title="Health Details" icon={<Heart className="w-6 h-6 text-red-500" />}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <InputField label="Height (cm)" id="height" type="number" value={health.height} onChange={(e) => setHealth({ ...health, height: e.target.value })} placeholder="e.g., 165" />
           <InputField label="Weight (kg)" id="weight" type="number" value={health.weight} onChange={(e) => setHealth({ ...health, weight: e.target.value })} placeholder="e.g., 60" />
         </div>
         <div className="mt-4">
           <TextAreaField label="Medical Conditions or Allergies" id="conditions" value={health.conditions} onChange={(e) => setHealth({ ...health, conditions: e.target.value })} placeholder="e.g., Pollen allergy, lactose intolerant" />
         </div>
      </Card>
      
      <div className="flex justify-end">
        <PrimaryButton onClick={handleSave} isLoading={isLoading} icon={<Save />}>Save Profile</PrimaryButton>
      </div>
    </div>
  );
};

// --- 2. Prakriti Analysis Page (THE QUIZ) ---

const quizQuestions = [
  {
    question: "My body frame is typically...",
    options: [
      { text: "Thin, light, and tall or short", value: "vata" },
      { text: "Medium build and muscular", value: "pitta" },
      { text: "Large, heavy, and well-built", value: "kapha" },
    ],
  },
  {
    question: "My skin is generally...",
    options: [
      { text: "Dry, rough, and thin", value: "vata" },
      { text: "Oily, warm, and sensitive (prone to rashes/acne)", value: "pitta" },
      { text: "Thick, oily, cool, and smooth", value: "kapha" },
    ],
  },
  {
    question: "My appetite is...",
    options: [
      { text: "Irregular, I get variable hunger", value: "vata" },
      { text: "Strong, I get irritable if I miss a meal", value: "pitta" },
      { text: "Steady, I can skip meals easily", value: "kapha" },
    ],
  },
  {
    question: "My digestion tends to be...",
    options: [
      { text: "Variable, gassy, and prone to constipation", value: "vata" },
      { text: "Fast, strong, and prone to acidity or loose stools", value: "pitta" },
      { text: "Slow, heavy, and sluggish", value: "kapha" },
    ],
  },
  {
    question: "My temperament is...",
    options: [
      { text: "Enthusiastic, lively, and moody", value: "vata" },
      { text: "Intelligent, focused, and irritable", value: "pitta" },
      { text: "Calm, steady, and sometimes possessive", value: "kapha" },
    ],
  },
];

const PrakritiAnalysis = ({ token, userProfile, onAnalysisComplete }) => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(userProfile.analysisResult);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAnswer = (qIndex, value) => {
    setAnswers({ ...answers, [qIndex]: value });
  };

  // Counts the answers to find the dominant dosha
  const calculateDosha = () => {
    const counts = { vata: 0, pitta: 0, kapha: 0 };
    Object.values(answers).forEach(value => {
      counts[value]++;
    });
    
    let dominantDosha = 'vata';
    if (counts.pitta > counts[dominantDosha]) dominantDosha = 'pitta';
    if (counts.kapha > counts[dominantDosha]) dominantDosha = 'kapha';
    
    return dominantDosha;
  };

  // Calls /api/user/analysis (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const analysisResult = calculateDosha();
    
    try {
      const response = await fetch(`${API_URL}/user/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ analysisResult })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save analysis.');
      
      onAnalysisComplete(data.user); // Update the main app's state
      setResult(analysisResult);
      setMessage({ type: 'success', text: `Analysis complete! Your dominant dosha appears to be ${analysisResult}.` });
    } catch (error) {
      console.error("Error saving analysis:", error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const allQuestionsAnswered = Object.keys(answers).length === quizQuestions.length;

  // If the user already has a result, show it
  if (result) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Prakriti Analysis</h1>
        <Card title="Your Analysis Result" icon={<Check className="w-6 h-6 text-green-600" />}>
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">Your dominant dosha has been identified as:</p>
            <h2 className="text-4xl font-bold capitalize text-blue-600 mb-6">{result}</h2>
            <p className="text-gray-600 mb-4">You can now view your personalized recommendations in the "Diet Chart" and "Daily Routine" sections.</p>
            <p className="text-sm text-gray-500">You can retake the quiz at any time to update your result.</p>
            <PrimaryButton onClick={() => setResult(null)} icon={<Brain />} isLoading={isLoading}>
              Retake Analysis
            </PrimaryButton>
          </div>
        </Card>
      </div>
    );
  }

  // If no result, show the quiz
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Prakriti Analysis</h1>
      <Card title="Dosha Quiz" icon={<Brain className="w-6 h-6 text-purple-600" />}>
        <p className="text-gray-700 mb-6">Answer the following questions to get an idea of your dominant dosha (Prakriti). Choose the option that best describes you most of your life.</p>
        <Message type={message.type} text={message.text} />
        <form onSubmit={handleSubmit}>
          {quizQuestions.map((q, qIndex) => (
            <div key={qIndex} className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">{q.question}</h3>
              <div className="space-y-2">
                {q.options.map((opt, oIndex) => (
                  <label key={oIndex} className={`flex items-center p-3 rounded-md cursor-pointer transition-all ${answers[qIndex] === opt.value ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={opt.value}
                      checked={answers[qIndex] === opt.value}
                      onChange={() => handleAnswer(qIndex, opt.value)}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <PrimaryButton type="submit" isLoading={isLoading} disabled={!allQuestionsAnswered} icon={<Check />}>
              {allQuestionsAnswered ? 'Calculate My Dosha' : 'Answer all questions'}
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- 3. Diet Chart Page (CONDITIONAL) ---
// This page shows different content based on the analysisResult
const DietChart = ({ analysisResult }) => {
  const renderContent = () => {
    // If no result, prompt to take quiz
    if (!analysisResult) {
      return (
        <div className="text-center text-gray-600">
          <p>Please complete the "Prakriti Analysis" quiz first to receive your personalized diet plan.</p>
        </div>
      );
    }
    
    // Show content for VATA
    if (analysisResult === 'vata') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center"><Wind className="w-6 h-6 mr-2 text-blue-500" />Vata Pacifying Diet (Warm & Grounding)</h3>
          <p className="text-gray-700">Focus on warm, cooked, nourishing foods. Eat at regular times.</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Grains:</strong> Rice, cooked oats, quinoa.</li>
            <li><strong>Vegetables:</strong> Cooked root vegetables (carrots, beets), asparagus, sweet potatoes.</li>
            <li><strong>Fruits:</strong> Ripe bananas, avocados, mangoes, cooked apples.</li>
            <li><strong>Proteins:</strong> Mung beans (dal), chicken, fish, tofu.</li>
            <li><strong>Avoid:</strong> Cold/iced drinks, raw salads, dry/light foods (crackers, popcorn), caffeine.</li>
          </ul>
        </div>
      );
    }
    
    // Show content for PITTA
    if (analysisResult === 'pitta') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center"><Sun className="w-6 h-6 mr-2 text-red-500" />Pitta Pacifying Diet (Cool & Soothing)</h3>
          <p className="text-gray-700">Focus on cool, refreshing, and slightly dry foods. Avoid spicy and fermented foods.</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Grains:</strong> Basmati rice, barley, oats.</li>
            <li><strong>Vegetables:</strong> Leafy greens (kale, chard), cucumber, broccoli, zucchini.</li>
            <li><strong>Fruits:</strong> Sweet fruits like grapes, melons, cherries, coconut.</li>
            <li><strong>Proteins:</strong> Chickpeas, black beans, chicken, egg whites.</li>
            <li><strong>Avoid:</strong> Spicy foods (chilies, cayenne), sour foods (vinegar, aged cheese), alcohol, coffee.</li>
          </ul>
        </div>
      );
    }

    // Show content for KAPHA
    if (analysisResult === 'kapha') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center"><Moon className="w-6 h-6 mr-2 text-gray-500" />Kapha Pacifying Diet (Light & Stimulating)</h3>
          <p className="text-gray-700">Focus on light, dry, and warm foods. Emphasize spices and pungent flavors.</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Grains:</strong> Millet, barley, buckwheat, corn.</li>
            <li><strong>Vegetables:</strong> All leafy greens, peppers, onions, broccoli, cabbage.</li>
            <li><strong>Fruits:</strong> Apples, pears, pomegranates, berries.</li>
            <li><strong>Proteins:</strong> Lentils, chickpeas, beans, lean chicken.</li>
            <li><strong>Avoid:</strong> Heavy/oily foods, dairy (cheese, ice cream), sweet foods, processed sugars, deep-fried foods.</li>
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Diet Chart</h1>
      <Card title="AI-Powered Diet Recommendation" icon={<ClipboardList className="w-6 h-6 text-green-600" />}>
        {renderContent()}
      </Card>
    </div>
  );
};

// --- 4. Daily Routine Page (CONDITIONAL) ---
// Also shows different content based on analysisResult
const DailyRoutine = ({ analysisResult }) => {
  const renderContent = () => {
    if (!analysisResult) {
      return (
        <div className="text-center text-gray-600">
          <p>Please complete the "Prakriti Analysis" quiz first to receive your personalized routine.</p>
        </div>
      );
    }
    
    if (analysisResult === 'vata') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center"><Wind className="w-6 h-6 mr-2 text-blue-500" />Vata Balancing Routine (Consistency)</h3>
          <p className="text-gray-700">Your key is regularity. Try to wake, eat, and sleep at the same times each day.</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><span className="font-semibold">6:30 AM:</span> Wake up, oil massage (Abhyanga) with warm sesame oil.</li>
            <li><span className="font-semibold">7:00 AM:</span> Gentle, grounding exercise (Yoga, Tai Chi).</li>
            <li><span className="font-semibold">8:00 AM:</span> Warm, nourishing breakfast.</li>
            <li><span className="font-semibold">10:00 PM:</span> Bedtime. Ensure you get plenty of rest.</li>
          </ul>
        </div>
      );
    }

    if (analysisResult === 'pitta') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center"><Sun className="w-6 h-6 mr-2 text-red-500" />Pitta Balancing Routine (Moderation)</h3>
          <p className="text-gray-700">Your key is to stay cool and avoid intensity. Make time for leisure.</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><span className="font-semibold">6:00 AM:</span> Wake up, rinse face with cool water.</li>
            <li><span className="font-semibold">7:00 AM:</span> Cooling exercise (swimming, light jog in cool air). Avoid peak sun.</li>
            <li><span className="font-semibold">12:00 PM:</span> Eat your main meal at mid-day, when your digestion is strongest.</li>
            <li><span className="font-semibold">10:30 PM:</span> Bedtime. Avoid late-night work.</li>
          </ul>
        </div>
      );
    }
    
    if (analysisResult === 'kapha') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center"><Moon className="w-6 h-6 mr-2 text-gray-500" />Kapha Balancing Routine (Stimulation)</h3>
          <p className="text-gray-700">Your key is activity and variety. Avoid daytime napping and oversleeping.</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><span className="font-semibold">5:30 AM:</span> Wake up *before* sunrise. This is most important!</li>
            <li><span className="font-semibold">6:00 AM:</span> Vigorous, stimulating exercise (running, cycling, cardio).</li>
            <li><span className="font-semibold">8:00 AM:</span> Light breakfast, or skip it if not hungry.</li>
            <li><span className="font-semibold">11:00 PM:</span> Bedtime. Avoid sleeping too late or too long.</li>
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Routine</h1>
      <Card title="Personalized Schedule" icon={<CalendarDays className="w-6 h-6 text-indigo-600" />}>
        {renderContent()}
      </Card>
    </div>
  );
};

// --- 5. Follow-ups Page ---
const Followups = ({ token }) => {
  const [feedback, setFeedback] = useState('');
  const [pastFollowups, setPastFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // Calls /api/user/followups (GET)
  useEffect(() => {
    if (!token) return;
    const fetchFollowups = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(`${API_URL}/user/followups`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch follow-ups');
        const data = await response.json();
        setPastFollowups(data); 
      } catch (error) {
        console.error("Error fetching follow-ups:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchFollowups();
  }, [token]);

  // Calls /api/user/followups (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feedback.trim() === '' || !token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: feedback })
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      const newFollowup = await response.json();
      setPastFollowups([newFollowup, ...pastFollowups]); // Add new one to the top
      setFeedback(''); 
    } catch (error) {
      console.error("Error adding feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Follow-ups</h1>
      <Card title="Feedback Collection" icon={<MessageSquare className="w-6 h-6 text-teal-600" />}>
        <form onSubmit={handleSubmit}>
          <TextAreaField label="How are you feeling today?" id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share any progress, challenges, or questions..." />
          <div className="flex justify-end mt-4">
            <PrimaryButton type="submit" isLoading={isLoading} icon={<Send />}>Submit Feedback</PrimaryButton>
          </div>
        </form>
      </Card>
      <Card title="Your Feedback History" icon={<ClipboardList className="w-6 h-6 text-gray-500" />}>
        {isFetching ? (
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="ml-2 text-gray-600">Loading history...</p>
          </div>
        ) : pastFollowups.length === 0 ? (
          <p className="text-gray-600">You haven't submitted any feedback yet.</p>
        ) : (
          <ul className="space-y-4">
            {pastFollowups.map(item => (
              <li key={item._id || item.timestamp} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">{item.text}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(item.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

