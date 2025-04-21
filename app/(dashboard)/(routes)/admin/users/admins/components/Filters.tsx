import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  onFilterChange: (filters: {searchTerm: string, status?: string}) => void;
}

export default function TeacherFilters({ onFilterChange }: Props) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchTerm = formData.get('searchTerm') as string;
    const status = formData.get('status') as string;
    
    onFilterChange({
      searchTerm,
      status: status !== 'all' ? status : undefined
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-4 mb-6">
      <Input
        name="searchTerm"
        placeholder="Buscar por nombre o email..."
        className="max-w-sm"
      />
      <Select name="status" defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activos</SelectItem>
          <SelectItem value="inactive">Inactivos</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Buscar</Button>
    </form>
  );
}