'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { ToDo } from '@/lib/types';
import { BellRing } from 'lucide-react';

interface AlarmProps {
  todo: ToDo;
  onDismiss: () => void;
}

export function Alarm({ todo, onDismiss }: AlarmProps) {
  return (
    <AlertDialog open={!!todo}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <BellRing className="h-8 w-8 text-primary animate-bounce" />
            Alarm!
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-lg">
            Time for: <strong className="text-foreground">{todo.title}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={onDismiss}>Mark as Complete & Dismiss</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
