import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { StudyPlan, StudyDay, StudyTask } from '../types';
import { ChevronDownIcon, PlusIcon, SearchIcon, BrainIcon, BellIcon, CheckIcon } from './icons';

interface DayAccordionProps {
    day: StudyDay;
    dayIndex: number;
    onTaskToggle: (dayIndex: number, taskId: string) => void;
    onSetReminder: (dayIndex: number, taskId: string, reminder: string | null) => void;
}


const DayAccordion: React.FC<DayAccordionProps> = ({ day, dayIndex, onTaskToggle, onSetReminder }) => {
    const [isOpen, setIsOpen] = useState(day.day === 1);
    const [openReminderMenu, setOpenReminderMenu] = useState<string | null>(null);
    const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openReminderMenu && menuRefs.current[openReminderMenu] && !menuRefs.current[openReminderMenu]?.contains(event.target as Node)) {
                setOpenReminderMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openReminderMenu]);
    
    const completedTasks = day.tasks.filter(t => t.completed).length;
    const totalTasks = day.tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const reminderOptions = [
        { id: 'on-day', label: 'On the day' },
        { id: '1-hour-before', label: '1 hour before' },
        { id: '1-day-before', label: '1 day before' },
    ];

    const handleSetReminder = (taskId: string, reminder: string | null) => {
        onSetReminder(dayIndex, taskId, reminder);
        setOpenReminderMenu(null);
    };

    return (
        <div className="bg-base-200 rounded-lg shadow-md overflow-hidden mb-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left hover:bg-base-300 transition-colors">
                <div>
                    <h4 className="font-bold text-lg">Day {day.day}: {day.title}</h4>
                    <p className="text-sm text-base-content/70">{completedTasks} / {totalTasks} tasks completed</p>
                </div>
                <div className="flex items-center">
                     <div className="w-24 bg-base-300 rounded-full h-2.5 mr-4">
                        <div className="bg-success h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <ChevronDownIcon className={`w-6 h-6 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-base-300">
                    <ul className="space-y-2">
                        {day.tasks.map(task => (
                            <li key={task.id} className="flex items-center justify-between p-2 -m-2 rounded-lg group hover:bg-base-300/50">
                                <label className="flex items-center cursor-pointer flex-grow min-w-0 mr-2">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => onTaskToggle(dayIndex, task.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                                    />
                                    <span className={`ml-3 transition-all duration-300 ease-in-out truncate ${task.completed ? 'line-through text-base-content/50' : 'text-base-content'}`}>
                                        {task.task}
                                    </span>
                                </label>
                                {/* Fix: Changed ref callback to have a block body, ensuring it returns void. */}
                                <div className="relative shrink-0" ref={(el) => { menuRefs.current[task.id] = el; }}>
                                     <button
                                        onClick={() => setOpenReminderMenu(openReminderMenu === task.id ? null : task.id)}
                                        className={`p-1 rounded-full ${task.reminder ? 'text-primary' : 'text-base-content/50'} hover:bg-base-100 ${task.reminder ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} focus:opacity-100 transition-opacity`}
                                        aria-label="Set reminder"
                                    >
                                        <BellIcon className="w-5 h-5" />
                                    </button>
                                    {openReminderMenu === task.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                                            {reminderOptions.map(option => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleSetReminder(task.id, option.id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 flex justify-between items-center"
                                                >
                                                    <span>{option.label}</span>
                                                    {task.reminder === option.id && <CheckIcon className="w-4 h-4 text-primary" />}
                                                </button>
                                            ))}
                                            <div className="border-t border-base-300 my-1"></div>
                                            <button
                                                onClick={() => handleSetReminder(task.id, null)}
                                                className="w-full text-left px-4 py-2 text-sm text-error/80 hover:bg-base-200"
                                            >
                                                Clear reminder
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


interface StudyPlanViewProps {
  plans: StudyPlan[];
  updatePlan: (plan: StudyPlan) => void;
  onNavigate: () => void;
  onStartQuiz: (topic: string) => void;
}

const StudyPlanView: React.FC<StudyPlanViewProps> = ({ plans, updatePlan, onNavigate, onStartQuiz }) => {
  const [activePlanId, setActivePlanId] = useState<string | null>(plans.length > 0 ? plans[0].id : null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = useMemo(() => {
      return plans.filter(plan => 
          plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          plan.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [plans, searchQuery]);

  useEffect(() => {
    if (plans.length > 0 && !activePlanId) {
        setActivePlanId(plans[0].id);
    }
    // If active plan is filtered out, set a new active plan
    if (activePlanId && !filteredPlans.some(p => p.id === activePlanId)) {
        setActivePlanId(filteredPlans.length > 0 ? filteredPlans[0].id : null);
    }
  }, [plans, activePlanId, filteredPlans]);

  const activePlan = useMemo(() => filteredPlans.find(p => p.id === activePlanId), [filteredPlans, activePlanId]);

  const handleTaskToggle = (dayIndex: number, taskId: string) => {
    if (!activePlan) return;
    
    const updatedDays = activePlan.days.map((day, index) => {
        if (index === dayIndex) {
            return {
                ...day,
                tasks: day.tasks.map(task => 
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                ),
            };
        }
        return day;
    });

    const updatedPlan = { ...activePlan, days: updatedDays };
    updatePlan(updatedPlan);
  };
  
  const handleSetTaskReminder = (dayIndex: number, taskId: string, reminder: string | null) => {
    if (!activePlan) return;

    const updatedDays = activePlan.days.map((day, index) => {
        if (index === dayIndex) {
            return {
                ...day,
                tasks: day.tasks.map(task =>
                    task.id === taskId ? { ...task, reminder } : task
                ),
            };
        }
        return day;
    });

    const updatedPlan = { ...activePlan, days: updatedDays };
    updatePlan(updatedPlan);
};

  if (plans.length === 0) {
      return (
          <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-2xl font-bold mb-2">No Study Plans Yet</h1>
              <p className="text-base-content/70 mb-4">It looks like you haven't created any study plans.</p>
              <button onClick={onNavigate} className="btn btn-primary bg-primary hover:bg-primary-focus text-primary-content">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Your First Plan
              </button>
          </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold">Your Study Plans</h1>
                <p className="text-base-content/70">Review and manage your study schedules.</p>
            </div>
            <button onClick={onNavigate} className="btn btn-primary bg-primary hover:bg-primary-focus text-primary-content self-start md:self-center">
                <PlusIcon className="w-5 h-5 mr-2"/>
                New Plan
            </button>
        </div>

        <div className="mb-6">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="w-5 h-5 text-base-content/50" />
                </span>
                <input 
                    type="text"
                    placeholder="Search by name or subject..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-base-200 border-transparent focus:ring-primary focus:border-primary"
                />
            </div>
        </div>

        {filteredPlans.length === 0 ? (
            <div className="text-center py-10 bg-base-200 rounded-lg">
                <p>No plans match your search.</p>
            </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <aside className="md:col-span-1">
                    <h2 className="text-lg font-bold mb-3">Select Plan</h2>
                    <ul className="space-y-2">
                        {filteredPlans.map(plan => (
                            <li key={plan.id}>
                                <button 
                                    onClick={() => setActivePlanId(plan.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${activePlanId === plan.id ? 'bg-primary text-primary-content' : 'bg-base-200 hover:bg-base-300'}`}
                                >
                                    <p className="font-semibold">{plan.planName}</p>
                                    <p className={`text-sm ${activePlanId === plan.id ? 'text-primary-content/80' : 'text-base-content/70'}`}>{plan.subject}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>
                <div className="md:col-span-3">
                    {activePlan ? (
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{activePlan.planName}</h2>
                            <p className="text-base-content/70 mb-4">{activePlan.subject} - {activePlan.duration} days</p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                <button onClick={onNavigate} className="btn btn-sm bg-secondary hover:bg-secondary-focus text-secondary-content">
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    New Plan
                                </button>
                                <button onClick={() => onStartQuiz(activePlan.subject)} className="btn btn-sm bg-accent hover:bg-accent-focus text-accent-content">
                                    <BrainIcon className="w-4 h-4 mr-1" />
                                    Quiz Me
                                </button>
                            </div>

                            {activePlan.days.map((day, index) => (
                                <DayAccordion key={day.day} day={day} dayIndex={index} onTaskToggle={handleTaskToggle} onSetReminder={handleSetTaskReminder} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-base-200 rounded-lg">
                            <p>Select a plan to view its details.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default StudyPlanView;