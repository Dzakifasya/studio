'use client';

import type { ToDo } from '@/lib/types';
import { TodoCard } from './todo-card';

interface TodoListProps {
  todos: ToDo[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (todo: ToDo) => void;
}

export function TodoList({ todos, onToggleComplete, onDelete, onUpdate }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
        <p>No to-dos here. Enjoy your day!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
