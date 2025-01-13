import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Importación de ToastrService
import { LoginRequest } from '../../Models/LoginRequest';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent {
  loginData: LoginRequest = { username: '', password: '' };
  isLoading = false;
  showPassword = false;
  errorMessage: string = ''; // <-- Agrega esta propiedad

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = ''; // Reiniciar mensaje de error antes de intentar login

    try {
      const response = await this.authService.login(this.loginData).toPromise();
      if (response && response.token) {
        this.authService.saveToken(response.token);
        this.toastr.success('Inicio de sesión exitoso.', 'Éxito');
        this.router.navigate(['/home']); // Redirige al usuario
      } else {
        throw new Error('Token no recibido');
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.errorMessage = 'Usuario o contraseña inválidos. Inténtalo de nuevo.'; // <-- Establece el mensaje de error
      this.toastr.error(this.errorMessage, 'Error de inicio de sesión');
    } finally {
      this.isLoading = false; // Finaliza el indicador de carga
    }
  }
}

