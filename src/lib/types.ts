export interface ToDo {
  id: string;
  title: string;
  description: string;
  alarm: Date | null;
  tags: string[];
  completed: boolean;
}
