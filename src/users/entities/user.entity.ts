export class User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
