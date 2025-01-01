import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LoginRequest } from '../Models/LoginRequest';
import { LoginResponse } from '../Models/LoginResponse';
import { RegisterRequest } from '../Models/RegisterRequest';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  isLoggedIn = signal(false);

  constructor(private http: HttpClient, private router: Router, public toastr: ToastrService) {}

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.saveToken(response.token);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        if (error.status === 0) {
          this.showError('Unable to connect to the server. Please check if the backend is running.', 'Connection Error');
        } else {
          this.showError('Usuario no Existe.', 'Error');
        }
        return throwError(() => new Error('Error del login'));
      })
    );
  }

  register(data: RegisterRequest) {
    return this.http.post(`${this.apiUrl}/users`, data).pipe(
      tap(() => this.toastr.success('Usuario registrado exitosamente.', 'Success')),
      catchError((error) => {
        console.error('Error during registration:', error);
        this.toastr.error('Usuario ya Existe.', 'Error');
        return throwError(() => new Error('Fallo el registro'));
      })
    );
  }

  logout() {
    this.isLoggedIn.set(false);
    localStorage.removeItem('token');
    this.showInfo('You have been logged out successfully.', 'Logout');
    this.router.navigate(['/login']);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.isLoggedIn.set(true);
    this.showSuccess('Login Exitoso!', 'Success');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private showSuccess(message: string, title: string) {
    this.toastr.success(message, title);
  }

  private showError(message: string, title: string) {
    this.toastr.error(message, title);
  }

  private showInfo(message: string, title: string) {
    this.toastr.info(message, title);
  }
}
