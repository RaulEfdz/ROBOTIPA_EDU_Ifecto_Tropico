"use client";

import { useEffect, useState } from "react";
import { useQuizContext } from "../context/QuizContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Save, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { Question, Quiz } from "../types";
import { addQuestions } from "../handler/addQuestions";

export function AddQuestionsModal() {
  const { isModalOpen, closeModal, quiz, setQuiz, refreshQuizzes } = useQuizContext();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [newCorrectAnswer, setNewCorrectAnswer] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Obtener el usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserFromDB();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Si se edita o actualiza el quiz, actualizamos los campos correspondientes
  useEffect(() => {
    if (quiz) {
      setQuestions(quiz.questions || []);
      setTitle(quiz.title || "");
      setDescription(quiz.description || "");
    }
  }, [quiz]);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error("La pregunta no puede estar vacía");
      return;
    }

    const newQuestionObj: Question = {
      id: uuidv4(),
      question: newQuestion.trim(),
      correctAnswers: newCorrectAnswer,
    };

    setQuestions((prev) => [...prev, newQuestionObj]);
    setNewQuestion("");
    setNewCorrectAnswer(false);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setNewQuestion(question.question);
    setNewCorrectAnswer(question.correctAnswers);
  };

  const handleSaveEditedQuestion = () => {
    if (!editingQuestionId || !newQuestion.trim()) {
      toast.error("No se puede guardar una pregunta vacía");
      return;
    }

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === editingQuestionId
          ? { ...q, question: newQuestion.trim(), correctAnswers: newCorrectAnswer }
          : q
      )
    );

    setEditingQuestionId(null);
    setNewQuestion("");
    setNewCorrectAnswer(false);
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleSaveQuiz = async () => {
    if (!userId) {
      toast.error("Error: Usuario no autenticado");
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error("El título y la descripción son obligatorios");
      return;
    }

    if (questions.length === 0) {
      toast.error("Agrega al menos una pregunta al quiz");
      return;
    }

    const updatedQuiz: Quiz = quiz
      ? {
          ...quiz,
          title: title.trim(),
          description: description.trim(),
          questions,
        }
      : {
          id: uuidv4(),
          title: title.trim(),
          description: description.trim(),
          questions,
          idCreator: userId,
        };

    try {
      // Llamada al handler que se comunica con el endpoint para guardar las preguntas/quiz
      await addQuestions(updatedQuiz);
      setQuiz(updatedQuiz);
      await refreshQuizzes();
      closeModal();
      toast.success("Quiz guardado correctamente");
    } catch (error) {
      toast.error("Error al guardar el quiz. Inténtalo de nuevo");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh] w-full pt-10">
          <div className="p-6 space-y-6">
            <DialogHeader className="bg-gradient-to-r from-emerald-400 to-teal-500 text-TextCustom rounded-t-lg p-4 shadow-lg">
              <DialogTitle className="text-2xl font-bold">
                {quiz ? "Editar Quiz" : "Crear Quiz"}
              </DialogTitle>
            </DialogHeader>

            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-lg font-semibold">
                      Título del Quiz
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Quiz de Historia Mundial"
                      className="mt-2 border-teal-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-lg font-semibold">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe brevemente el contenido del quiz"
                      className="mt-2 border-teal-400 h-[150px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Preguntas ({questions.length})
                </h3>
                <ScrollArea className="h-auto min-h-[30vh] pr-4">
                  {questions.length > 0 ? (
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <Card key={q.id} className="border border-teal-300 shadow-sm hover:shadow-md transition-all duration-300">
                          <CardContent className="pt-4">
                            {editingQuestionId === q.id ? (
                              <div className="space-y-4">
                                <Input
                                  value={newQuestion}
                                  onChange={(e) => setNewQuestion(e.target.value)}
                                  placeholder="Edita la pregunta"
                                />
                                <div className="flex items-center justify-between">
                                  <Label className="font-medium">
                                    Respuesta Correcta:
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <span>Falso</span>
                                    <Switch
                                      checked={newCorrectAnswer}
                                      onCheckedChange={(checked) => setNewCorrectAnswer(checked)}
                                    />
                                    <span>Verdadero</span>
                                  </div>
                                </div>
                                <Button
                                  onClick={handleSaveEditedQuestion}
                                  className="w-full bg-teal-500 hover:bg-teal-600 text-TextCustom"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Guardar cambios
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <p className="font-medium text-gray-700">
                                    {index + 1}. {q.question}
                                  </p>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-teal-300 hover:bg-teal-50"
                                      onClick={() => handleEditQuestion(q)}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="hover:bg-red-50"
                                      onClick={() => handleRemoveQuestion(q.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Respuesta: {q.correctAnswers ? "Verdadero" : "Falso"}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">
                      No hay preguntas aún. ¡Agrega una nueva pregunta!
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Agregar Nueva Pregunta
                </h3>
                <div className="space-y-4">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Escribe tu pregunta aquí"
                    className="border-teal-400"
                  />
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Respuesta Correcta:</Label>
                    <div className="flex items-center gap-2">
                      <span>Falso</span>
                      <Switch
                        checked={newCorrectAnswer}
                        onCheckedChange={(checked) => setNewCorrectAnswer(checked)}
                      />
                      <span>Verdadero</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddQuestion}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-TextCustom"
                    disabled={!newQuestion.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Pregunta
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSaveQuiz}
              className="w-full bg-teal-600 hover:bg-teal-700 text-TextCustom"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {quiz ? "Actualizar Quiz" : "Guardar Quiz"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
