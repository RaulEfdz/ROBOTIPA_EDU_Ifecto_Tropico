"use client";
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Quiz } from "../types";
import { useQuizContext } from "../context/QuizContext";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { v4 as uuidv4 } from "uuid";


export default function QuizForm() {
  const { createNewQuiz } = useQuizContext();
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const { userId } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if(!userId){
      toast.error("Error con User ID")
      return
    }
    const newQuiz: Quiz = {
      id: uuidv4(), // Generar ID único
      title,
      description,
      questions: [],
      idCreator: userId
    };

    try {
      await createNewQuiz(newQuiz); // Llamada asíncrona para guardar el quiz
    } catch (error) {
      console.error("Error al enviar el quiz:", error);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
  };

  return (
    <Card ref={cardContainerRef} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
      <div>
        <Label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
          Título
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Ej: Introducción a JavaScript"
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
          Descripción
        </Label>
        <Input
          id="description"
          name="description"
          placeholder="Breve descripción del quiz..."
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="ghost" onClick={handleCancel} className="text-gray-500">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
          Guardar
        </Button>
      </div>
    </Card>
  );
}
