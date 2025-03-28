import { QuizProvider } from './context/QuizContext';
import { QuizList } from './components/QuizList';
import NavbarQuiz from './components/navbarQuiz';;
import { AddQuestionsModal } from './addQuestions/addQuestionsModal';
import QuizResponses from './responses/QuizResponses';

 
export default function AdminQuizzesPage() {
  return (
    <QuizProvider>
      <div className="container mx-auto p-4">
        <NavbarQuiz />
        <QuizList />
        <QuizResponses/>
        <AddQuestionsModal />
      </div>
    </QuizProvider>
  );
}