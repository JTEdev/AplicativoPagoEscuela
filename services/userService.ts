import { User } from '../types';

const API_URL = 'http://localhost:8080/api/users';

export async function getAllUsers(): Promise<User[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}
