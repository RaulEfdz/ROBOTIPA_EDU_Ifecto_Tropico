import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import { Question } from '../../types';


// Definición de tipos para las preguntas

type TrueFalseQuestionProps = {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
};

// Componente principal para preguntas de verdadero o falso
// Función utilitaria para actualizar preguntas
const updateQuestion = (question: Question, answer: boolean): Question => ({
  ...question,
  correctAnswers: answer,
});


// Creador de preguntas de verdadero o falso
export const TrueFalseQuestionCreator: React.FC<TrueFalseQuestionProps> = ({ question, onUpdate }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(question.correctAnswers);

  const handleUpdate = (newAnswer: boolean) => {
    setSelectedAnswer(newAnswer);
    onUpdate(updateQuestion(question, newAnswer));
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-[#FFFCF8] w-full">
      <p className="text-lg font-medium mb-4">{question.question || 'Escribe la pregunta arriba'}</p>
      <div className="flex space-x-4">
        <Label>Respuesta correcta:</Label>
        {['True', 'False'].map((option, index) => {
          const isAnswerTrue = index === 0;
          return (
            <button
              key={option}
              className={`px-4 py-2 rounded-md text-TextCustom ${
                selectedAnswer === isAnswerTrue ? 'bg-[#386329] hover:bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => handleUpdate(isAnswerTrue)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};


