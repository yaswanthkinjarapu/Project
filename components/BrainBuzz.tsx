import React, { useState, useCallback, useEffect } from 'react';
import type { StudyPlan, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { BrainIcon } from './icons';

interface BrainBuzzProps {
  plans: StudyPlan[];
  initialTopic: string | null;
  onQuizFinished: () => void;
}

const BrainBuzz: React.FC<BrainBuzzProps> = ({ plans, initialTopic, onQuizFinished }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || '');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTopics = Array.from(new Set(plans.map(p => p.subject)));

  const startQuiz = useCallback(async (topicToQuiz: string) => {
    if (!topicToQuiz) {
      setError("Please select a topic first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    try {
      const questions = await generateQuiz(topicToQuiz);
      setQuiz(questions);
      setSelectedTopic(topicToQuiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setShowResult(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Automatically start quiz if an initial topic is provided and a quiz isn't already running.
    if (initialTopic && !quiz && !isLoading) {
      startQuiz(initialTopic);
    }
  }, [initialTopic, quiz, isLoading, startQuiz]);
  
  useEffect(() => {
    // This effect runs once on mount and returns a cleanup function that runs on unmount.
    // It ensures that if the user navigates away from a quiz that was started
    // via an initialTopic, that topic is cleared in the parent component.
    // This prevents the quiz from auto-starting again if they navigate back.
    return () => {
      onQuizFinished();
    };
  }, []); // Empty dependency array ensures this is only for mount/unmount.

  const handleAnswer = (answer: string) => {
    if (!quiz) return;
    setSelectedAnswer(answer);
    if (answer === quiz[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    setTimeout(() => {
      if (currentQuestionIndex < quiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
      setQuiz(null);
      setSelectedTopic('');
      setShowResult(false);
      onQuizFinished();
  }

  if (!quiz) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex justify-center items-center h-full">
        <div className="max-w-md w-full text-center">
            <BrainIcon className="w-16 h-16 mx-auto text-accent mb-4"/>
            <h1 className="text-3xl font-bold">Brain Buzz Quiz</h1>
            <p className="text-base-content/70 mt-2 mb-6">Test your knowledge with a quick, AI-generated quiz.</p>
            <div className="space-y-4">
                <select 
                    value={selectedTopic} 
                    onChange={e => setSelectedTopic(e.target.value)}
                    className="w-full bg-base-200 border-base-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                    disabled={allTopics.length === 0 || isLoading}
                >
                    <option value="">{allTopics.length > 0 ? 'Select a topic' : 'Create a study plan first'}</option>
                    {allTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                </select>
                <button 
                    onClick={() => startQuiz(selectedTopic)} 
                    disabled={!selectedTopic || isLoading}
                    className="w-full btn bg-accent hover:bg-accent-focus text-accent-content font-bold py-3"
                >
                    {isLoading ? 'Generating Quiz...' : 'Start Quiz'}
                </button>
                {error && <p className="text-error text-sm mt-2">{error}</p>}
            </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
        <div className="p-4 sm:p-6 md:p-8 flex justify-center items-center h-full">
            <div className="max-w-md w-full text-center bg-base-200 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold">Quiz Complete!</h2>
                <p className="text-4xl font-bold my-4 text-accent">{Math.round((score / quiz.length) * 100)}%</p>
                <p className="text-base-content/70 mb-6">You answered {score} out of {quiz.length} questions correctly.</p>
                <button onClick={resetQuiz} className="btn bg-primary hover:bg-primary-focus text-primary-content">
                    Take Another Quiz
                </button>
            </div>
        </div>
    )
  }

  const currentQuestion = quiz[currentQuestionIndex];
  return (
    <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto bg-base-200 p-8 rounded-xl shadow-lg">
            <p className="text-sm text-base-content/70 mb-2">Question {currentQuestionIndex + 1} of {quiz.length}</p>
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>
            <div className="space-y-4">
                {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    let buttonClass = "btn w-full justify-start text-left h-auto py-3";
                    if(isSelected) {
                        buttonClass += option === currentQuestion.correctAnswer ? " bg-success text-success-content" : " bg-error text-error-content";
                    } else {
                        buttonClass += " bg-base-300 hover:bg-primary hover:text-primary-content";
                    }

                    return (
                        <button 
                            key={index} 
                            onClick={() => handleAnswer(option)}
                            disabled={!!selectedAnswer}
                            className={buttonClass}
                        >
                            {option}
                        </button>
                    )
                })}
            </div>
        </div>
    </div>
  );
};

export default BrainBuzz;
