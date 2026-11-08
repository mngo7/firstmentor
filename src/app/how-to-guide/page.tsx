'use client';

import { useState } from 'react';

interface Question {
  id: string;
  question: string;
  answer: string | string[];
}

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export default function HowToGuide() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: '1. Getting Started with Mentoring',
      questions: [
        {
          id: 'q1',
          question: 'Q1. How do I choose the right mentoring format for my team?',
          answer: [
            'Choose based on your needs:',
            '• Seasonal Mentors for full-season support',
            '• On-Demand Mentors for quick help',
            '• Custom/Topic Specialists for focused skills'
          ]
        },
        {
          id: 'q2',
          question: 'Q2. How do I know whether my team needs a seasonal mentor or on-demand help?',
          answer: [
            'If you want weekly support, choose a seasonal mentor.',
            'If you only need help with specific problems, choose on-demand.'
          ]
        },
        {
          id: 'q3',
          question: 'Q3. How do I find mentors familiar with FIRST rules and expectations?',
          answer: [
            'Use our mentor directory and filter by program (FLL/FTC/FRC) and expertise.',
            'Look for mentors with previous FIRST experience or team coaching history.'
          ]
        }
      ]
    },
    {
      id: 'choosing-format',
      title: '2. Choosing a Mentoring Format',
      questions: [
        {
          id: 'q4',
          question: 'Q4. What are the common mentoring formats?',
          answer: [
            '• In-Person Seasonal – weekly, hands-on',
            '• Online Seasonal – weekly, remote',
            '• On-Demand – help with specific questions, as needed',
            '• Custom Program – structured curriculum',
            '• Topic Specialists – advanced, narrow topics'
          ]
        },
        {
          id: 'q5',
          question: 'Q5. How do I match my team\'s goals with the right mentor type?',
          answer: [
            'Beginner teams → seasonal support',
            'Intermediate teams → custom program / topic specialists',
            'Advanced teams → on-demand or expert-level mentoring'
          ]
        }
      ]
    },
    {
      id: 'becoming-mentor',
      title: '3. Becoming a Mentor',
      questions: [
        {
          id: 'q9',
          question: 'Q6. How do I become a volunteer mentor?',
          answer: [
            'Sign up on our platform, select your areas of expertise, and complete the mentor profile.',
            'We welcome volunteers from high school, college, and industry.'
          ]
        },
        {
          id: 'q10',
          question: 'Q7. How can student mentors (e.g., FTC helping FLL) contribute effectively?',
          answer: [
            'Provide guidance, share experience, and support—not replace—team members.',
            'Focus on teaching skills, not doing the work.'
          ]
        }
      ]
    },
    {
      id: 'working-with-mentors',
      title: '4. Working With Mentors',
      questions: [
        {
          id: 'q11',
          question: 'Q8. How do I prepare for the first mentoring session?',
          answer: [
            'Bring your robot, code, notebook, and a list of questions.',
            'Know your goals for the session.'
          ]
        },
        {
          id: 'q12',
          question: 'Q9. How should teams communicate expectations with mentors?',
          answer: [
            'Agree on meeting frequency, communication method, roles, and boundaries.',
            'Keep expectations clear and documented.'
          ]
        },
        {
          id: 'q13',
          question: 'Q10. How do I keep mentoring sessions productive?',
          answer: 'Set goals, assign roles, and review progress at the end of each session.'
        }
      ]
    },
    {
      id: 'challenges',
      title: '5. If Challenges Come Up',
      questions: [
        {
          id: 'q14',
          question: 'Q11. What should I do if the mentoring relationship isn\'t working?',
          answer: [
            'Communicate openly first.',
            'If needed, request a mentor change through our platform.'
          ]
        },
        {
          id: 'q15',
          question: 'Q12. What if the mentor\'s expertise doesn\'t fully match our needs?',
          answer: 'You can add a second mentor or reach out to a topic specialist for specific areas.'
        }
      ]
    },
    {
      id: 'technical',
      title: '6. Technical How-Tos',
      questions: [
        {
          id: 'q16',
          question: 'Q13. How do we prepare for judging?',
          answer: 'Practice your presentation, organize your portfolio/notebook, and prepare a clear story about your season.'
        },
        {
          id: 'q17',
          question: 'Q14. How do we structure an engineering portfolio or notebook?',
          answer: [
            'Include goals, design iterations, testing results, and reflections.',
            'Keep entries clear and student-written.'
          ]
        },
        {
          id: 'q18',
          question: 'Q15. How do we plan the season timeline?',
          answer: 'Break the season into phases: brainstorming → prototyping → building → testing → judging prep → scrimmages.'
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
        // Also collapse all questions in this section
        sections.find(s => s.id === sectionId)?.questions.forEach(q => {
          setExpandedQuestions(prevQ => {
            const newQSet = new Set(prevQ);
            newQSet.delete(q.id);
            return newQSet;
          });
        });
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            How-To Guide for FIRST Teams & Mentors
          </h1>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-xl mx-auto">
            A quick, question-based guide to help teams and mentors navigate mentoring within the FIRST community.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-16">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900 text-left">
                  {section.title}
                </h2>
                <svg
                  className={`w-6 h-6 text-blue-600 transition-transform ${
                    expandedSections.has(section.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Questions */}
              {expandedSections.has(section.id) && (
                <div className="border-t border-gray-200">
                  {section.questions.map((question, index) => (
                    <div key={question.id} className={index > 0 ? 'border-t border-gray-100' : ''}>
                      {/* Question Header */}
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="w-full px-8 py-5 flex items-center justify-between hover:bg-blue-50 transition-colors text-left"
                      >
                        <h3 className="text-sm font-semibold text-gray-800 pr-4">
                          {question.question}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform ${
                            expandedQuestions.has(question.id) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Answer */}
                      {expandedQuestions.has(question.id) && (
                        <div className="px-8 py-5 bg-blue-50/50">
                          {Array.isArray(question.answer) ? (
                            <div className="space-y-2">
                              {question.answer.map((line, i) => (
                                <p key={i} className="text-xs text-gray-700 leading-relaxed">
                                  {line}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {question.answer}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs md:text-sm leading-relaxed">
              This How-To Guide is designed to support teams, mentors, and volunteers across the <strong>FIRST LEGO League</strong>, <strong>FIRST Tech Challenge</strong>, and <strong>FIRST Robotics Competition</strong> communities. We promote safe, student-led learning and transparent mentoring practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
