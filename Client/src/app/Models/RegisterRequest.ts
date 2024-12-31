export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword?: string; // Campo opcional para validación en el frontend
}

