export interface BoardKey {
  id: string;
}

export interface Board extends BoardKey {
  name: string;
  backgroundImage: string;
  createdBy: string;
  dateCreated?: string;
  users?: string[];
}
